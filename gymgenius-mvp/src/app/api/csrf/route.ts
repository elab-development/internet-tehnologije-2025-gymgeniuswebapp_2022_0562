import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';

/**
 * @swagger
 * /api/csrf:
 *   get:
 *     summary: Get CSRF token for form submissions
 *     tags: [Security]
 *     description: Returns a CSRF token that should be included in state-changing requests (POST, PUT, DELETE). The token is also set in an HttpOnly cookie.
 *     responses:
 *       200:
 *         description: CSRF token successfully generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     csrfToken:
 *                       type: string
 *                       description: CSRF token for use in forms
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
export async function GET(request: NextRequest) {
  const existing = request.cookies.get('csrf-token')?.value;
  const token = existing || generateCsrfToken();

  const response = NextResponse.json({ success: true, data: { csrfToken: token } });
  response.cookies.set('csrf-token', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
