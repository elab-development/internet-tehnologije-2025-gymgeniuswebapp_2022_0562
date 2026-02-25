import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from '@/utils/api-response';

/**
 * @swagger
 * /api/challenges/{id}/leave:
 *   post:
 *     summary: Leave a challenge
 *     tags: [Challenges]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully left challenge
 *       404:
 *         description: Challenge not found or not participating
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const challengeDoc = await adminDb.collection('challenges').doc(id).get();

    if (!challengeDoc.exists) {
      return notFoundResponse('Challenge not found');
    }

    const participantDoc = await challengeDoc.ref
      .collection('participants')
      .doc(userId)
      .get();

    if (!participantDoc.exists) {
      return errorResponse('You are not participating in this challenge', 400);
    }

    // Remove participant
    await participantDoc.ref.delete();

    // Update participant count
    const challengeData = challengeDoc.data();
    await challengeDoc.ref.update({
      participantCount: Math.max((challengeData?.participantCount || 1) - 1, 0),
    });

    return successResponse(
      { message: 'Successfully left challenge' },
      'Successfully left challenge'
    );
  } catch (error) {
    console.error('Leave challenge error:', error);
    return errorResponse('Failed to leave challenge', 500);
  }
}
