import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/utils/jwt'; // <-- samo iz jwt.ts
import { UserRole } from '@/types/models';

const protectedRoutes = ['/dashboard', '/api/workouts', '/api/challenges'];
const adminRoutes = ['/api/exercises', '/api/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (!isProtected && !isAdminRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    console.log('⚠ Middleware: No token provided for', pathname);
    return NextResponse.json(
      { success: false, error: 'Unauthorized - No token provided' },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);

  if (!payload) {
    console.log('⚠ Middleware: Invalid or expired token for', pathname);
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Invalid or expired token' },
      { status: 401 }
    );
  }

  console.log('✅ Middleware: Token valid for user:', payload.email);

  if (isAdminRoute && payload.role !== UserRole.ADMIN) {
    return NextResponse.json(
      { success: false, error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};