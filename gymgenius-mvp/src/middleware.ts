import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';
import { UserRole } from '@/types/models';

// Rute koje zahtevaju autentifikaciju
const protectedRoutes = ['/dashboard', '/api/workouts', '/api/challenges'];

// Rute koje zahtevaju admin pristup
const adminRoutes = ['/api/exercises', '/api/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proveri da li je ruta zaštićena
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (!isProtected && !isAdminRoute) {
    return NextResponse.next();
  }

  // Izvuci token
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - No token provided' },
      { status: 401 }
    );
  }

  // Verifikuj token
  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Invalid token' },
      { status: 401 }
    );
  }

  // Proveri admin pristup
  if (isAdminRoute && payload.role !== UserRole.ADMIN) {
    return NextResponse.json(
      { success: false, error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  // Dodaj user info u request headers (za korišćenje u API rutama)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Konfiguracija - koje rute middleware prati
export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};