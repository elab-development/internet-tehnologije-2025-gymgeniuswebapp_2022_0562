import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';

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
