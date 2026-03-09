import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/utils/jwt';
import { UserRole } from '@/types/models';
import { generateCsrfToken, validateCsrfToken, isStateChangingMethod } from '@/lib/csrf';

// Routes that require authenticated user
const protectedRoutes = [
  '/dashboard', '/profile', '/premium', '/nutrition', '/progress',
  '/challenges', '/ai-workout', '/exercises', '/workouts',
  '/api/workouts', '/api/workout-logs', '/api/challenges', '/api/meals', '/api/stats',
  '/api/goals', '/api/nutrition', '/api/users', '/api/progress',
  '/api/premium', '/api/notifications', '/api/ai',
  '/api/exercises', '/api/wger', '/api/preferences',
];

// Routes that require ADMIN role
const adminRoutes = ['/api/admin'];

// Routes that require PREMIUM role
const premiumRoutes = ['/api/premium'];

// CORS whitelist
const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'https://gymgenius.vercel.app',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  // 1. CORS PROTECTION
  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json({ success: false, error: 'CORS: Unauthorized origin' }, { status: 403 });
  }

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isPremiumRoute = premiumRoutes.some((route) => pathname.startsWith(route));

  if (!isProtected && !isAdminRoute) {
    // Public route - security headers + CSRF cookie
    const response = NextResponse.next();
    addSecurityHeaders(response);
    if (!request.cookies.get('csrf-token')) {
      response.cookies.set('csrf-token', generateCsrfToken(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    return response;
  }

  // 2. AUTHENTICATION
  const token = request.cookies.get('token')?.value;

  if (!token) {
    if (!pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.json({ success: false, error: 'Unauthorized - No token provided' }, { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload) {
    if (!pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.json({ success: false, error: 'Unauthorized - Invalid or expired token' }, { status: 401 });
  }

  console.log('Middleware: Token valid for user:', payload.email);

  // 3. AUTHORIZATION (Admin routes)
  if (isAdminRoute && payload.role !== UserRole.ADMIN) {
    return NextResponse.json({ success: false, error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  // 3b. AUTHORIZATION (Premium routes)
  if (isPremiumRoute && payload.role !== UserRole.PREMIUM && payload.role !== UserRole.ADMIN) {
    return NextResponse.json({ success: false, error: 'Premium subscription required', code: 'PREMIUM_REQUIRED' }, { status: 403 });
  }

  // 4. CSRF PROTECTION (state-changing methods on API routes only)
  if (pathname.startsWith('/api/') && isStateChangingMethod(request.method)) {
    const csrfTokenFromHeader = request.headers.get('x-csrf-token');
    const csrfTokenFromCookie = request.cookies.get('csrf-token')?.value;

    if (!csrfTokenFromHeader || !csrfTokenFromCookie) {
      console.log('CSRF: Missing token for', request.method, pathname);
      return NextResponse.json({ success: false, error: 'CSRF token missing' }, { status: 403 });
    }

    const isValidCsrf = await validateCsrfToken(csrfTokenFromHeader, csrfTokenFromCookie);
    if (!isValidCsrf) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 });
    }
  }

  // 5. ADD USER INFO TO REQUEST HEADERS
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-user-email', payload.email);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // 6. SECURITY HEADERS + CSRF COOKIE
  addSecurityHeaders(response);
  if (!request.cookies.get('csrf-token')) {
    response.cookies.set('csrf-token', generateCsrfToken(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return response;
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://api.openai.com https://trackapi.nutritionix.com http://localhost:11434",
    "frame-ancestors 'none'",
  ].join('; '));
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
}

export const config = {
  // Run on all routes except Next.js internals and static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
