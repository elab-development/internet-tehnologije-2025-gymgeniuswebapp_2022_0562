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
 * /api/challenges/{id}:
 *   get:
 *     summary: Get challenge details with leaderboard
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
 *         description: Challenge details with leaderboard
 *       404:
 *         description: Challenge not found
 */
export async function GET(
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

    // Get leaderboard (top participants)
    const participantsSnapshot = await challengeDoc.ref
      .collection('participants')
      .orderBy('currentProgress', 'desc')
      .limit(50)
      .get();

    const leaderboard = await Promise.all(
      participantsSnapshot.docs.map(async (doc, index) => {
        const participantData = doc.data();

        // Get user info
        const userDoc = await adminDb.collection('users').doc(doc.id).get();
        const userData = userDoc.data();

        return {
          rank: index + 1,
          userId: doc.id,
          displayName: userData?.displayName || 'Anonymous',
          currentProgress: participantData.currentProgress,
          currentStreak: participantData.currentStreak,
          joinedAt: participantData.joinedAt,
        };
      })
    );

    // Get current user's participation
    const userParticipation = await challengeDoc.ref
      .collection('participants')
      .doc(userId)
      .get();

    return successResponse({
      challenge: {
        challengeId: challengeDoc.id,
        ...challengeData,
      },
      leaderboard,
      userParticipation: userParticipation.exists ? userParticipation.data() : null,
    });
  } catch (error) {
    console.error('Get challenge details error:', error);
    return errorResponse('Failed to fetch challenge details', 500);
  }
}
