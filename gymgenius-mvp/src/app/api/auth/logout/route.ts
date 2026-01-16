import { NextRequest } from 'next/server';
import { successResponse, unauthorizedResponse } from '@/utils/api-response';
import { extractTokenFromHeader, verifyToken } from '@/utils/jwt';

export async function POST(request: NextRequest) {
  try {
    // 1. Izvuci token iz header-a
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return unauthorizedResponse('No token provided');
    }

    // 2. Verifikuj token
    const payload = verifyToken(token);

    if (!payload) {
      return unauthorizedResponse('Invalid token');
    }

    // 3. U realnoj aplikaciji bi ovde:
    // - Dodali token u blacklist (Redis/Firestore)
    // - Ili revoke-ovali Firebase refresh token
    // Za MVP, jednostavno vraćamo success

    return successResponse(
      { message: 'Logged out successfully' },
      'Logout successful'
    );
  } catch (error) {
    console.error('Logout error:', error);
    return unauthorizedResponse('Logout failed');
  }
}