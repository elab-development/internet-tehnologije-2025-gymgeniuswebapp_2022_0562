import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, unauthorizedResponse } from '@/utils/api-response';

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    // Middleware je već verifikovao token i dodao user info u headers
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return unauthorizedResponse();
    }

    // Učitaj korisnika iz Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return unauthorizedResponse('User not found');
    }

    const userData = userDoc.data();

    // Ne vraćaj osetljive podatke
    const { passwordHash, ...safeUserData } = userData as any;

    return successResponse(safeUserData);
  } catch (error) {
    console.error('Get current user error:', error);
    return unauthorizedResponse('Failed to fetch user data');
  }
}