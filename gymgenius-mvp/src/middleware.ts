import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/utils/jwt';
import { UserRole } from '@/types/models';
import { generateCsrfToken, validateCsrfToken, isStateChangingMethod } from '@/lib/csrf';

const protectedRoutes = ['/dashboard', '/api/workouts', '/api/challenges', '/api/meals', '/api/stats', '/api/goals', '/api/nutrition', '/api/users', '/api/progress', '/api/premium', '/profile', '/premium'];
const adminRoutes = ['/api/exercises', '/api/admin'];
const premiumRoutes = ['/api/premium'];

// CORS: Whitelist dozvoljenih origin-a
const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'https://gymgenius.vercel.app',
  // Dodaj production domain kada deploy-uješ
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  // ==========================================
  // 1. CORS PROTECTION
  // ==========================================
  if (origin && !allowedOrigins.includes(origin)) {
    console.log('⚠ CORS: Blocked request from unauthorized origin:', origin);
    return NextResponse.json(
      { success: false, error: 'CORS: Unauthorized origin' },
      { status: 403 }
    );
  }

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isPremiumRoute = premiumRoutes.some((route) => pathname.startsWith(route));

  if (!isProtected && !isAdminRoute) {
    // Public route - dodaj security headers
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  // ==========================================
  // 2. AUTHENTICATION
  // ==========================================
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

  // ==========================================
  // 3. AUTHORIZATION (Admin routes)
  // ==========================================
  if (isAdminRoute && payload.role !== UserRole.ADMIN) {
    console.log('⚠ Middleware: Non-admin tried to access:', pathname);
    return NextResponse.json(
      { success: false, error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  // ==========================================
  // 3b. AUTHORIZATION (Premium routes)
  // ==========================================
  if (isPremiumRoute && payload.role !== UserRole.PREMIUM && payload.role !== UserRole.ADMIN) {
    console.log('⚠ Middleware: Non-premium tried to access:', pathname);
    return NextResponse.json(
      { success: false, error: 'Premium subscription required', code: 'PREMIUM_REQUIRED' },
      { status: 403 }
    );
  }

  // ==========================================
  // 4. CSRF PROTECTION (state-changing methods)
  // ==========================================
  if (isStateChangingMethod(request.method)) {
    const csrfTokenFromHeader = request.headers.get('x-csrf-token');
    const csrfTokenFromCookie = request.cookies.get('csrf-token')?.value;

    if (!csrfTokenFromHeader || !csrfTokenFromCookie) {
      console.log('⚠ CSRF: Missing CSRF token for', request.method, pathname);
      return NextResponse.json(
        { success: false, error: 'CSRF token missing' },
        { status: 403 }
      );
    }

    const isValidCsrf = await validateCsrfToken(csrfTokenFromHeader, csrfTokenFromCookie);

    if (!isValidCsrf) {
      console.log('⚠ CSRF: Invalid CSRF token for', request.method, pathname);
      return NextResponse.json(
        { success: false, error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    console.log('✅ CSRF: Valid token for', request.method, pathname);
  }

  // ==========================================
  // 5. ADD USER INFO TO REQUEST HEADERS
  // ==========================================
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-user-email', payload.email);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // ==========================================
  // 6. SECURITY HEADERS
  // ==========================================
  addSecurityHeaders(response);

  // Generate new CSRF token for next request (if needed)
  if (!request.cookies.get('csrf-token')) {
    const newCsrfToken = generateCsrfToken();
    response.cookies.set('csrf-token', newCsrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }

  return response;
}

/**
 * Dodaje security headers na response
 */
function addSecurityHeaders(response: NextResponse) {
  // Content Security Policy (XSS protection)
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://api.openai.com https://trackapi.nutritionix.com http://localhost:11434",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // XSS Protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};