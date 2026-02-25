import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from '@/utils/api-response';
import { ChallengeParticipant } from '@/types/models';

/**
 * @swagger
 * /api/challenges/{id}/join:
 *   post:
 *     summary: Join a challenge
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
 *         description: Successfully joined challenge
 *       400:
 *         description: Already participating or challenge ended
 *       404:
 *         description: Challenge not found
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

    const challengeData = challengeDoc.data();

    // Check if challenge is active
    if (challengeData?.status === 'completed') {
      return errorResponse('Challenge has already ended', 400);
    }

    // Check if user is already participating
    const existingParticipation = await challengeDoc.ref
      .collection('participants')
      .doc(userId)
      .get();

    if (existingParticipation.exists) {
      return errorResponse('You are already participating in this challenge', 400);
    }

    // Create participant record
    const participant: Omit<ChallengeParticipant, 'rank'> = {
      userId,
      challengeId: id,
      currentProgress: 0,
      currentStreak: 0,
      joinedAt: new Date(),
      lastUpdated: new Date(),
    };

    await challengeDoc.ref.collection('participants').doc(userId).set(participant);

    // Update participant count
    await challengeDoc.ref.update({
      participantCount: (challengeData?.participantCount || 0) + 1,
    });

    return successResponse(
      {
        message: 'Successfully joined challenge',
        participant,
      },
      'Successfully joined challenge'
    );
  } catch (error) {
    console.error('Join challenge error:', error);
    return errorResponse('Failed to join challenge', 500);
  }
}
