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
 * /api/challenges/{id}/progress:
 *   post:
 *     summary: Update challenge progress
 *     tags: [Challenges]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               progressIncrement:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: Progress updated
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

    const body = await request.json();
    const { progressIncrement = 1 } = body;

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

    const participantData = participantDoc.data();
    const newProgress = (participantData?.currentProgress || 0) + progressIncrement;

    // Update progress
    await participantDoc.ref.update({
      currentProgress: newProgress,
      lastUpdated: new Date(),
    });

    // Recalculate rank
    await updateLeaderboardRanks(id);

    return successResponse(
      {
        currentProgress: newProgress,
        message: 'Progress updated successfully',
      },
      'Progress updated successfully'
    );
  } catch (error) {
    console.error('Update progress error:', error);
    return errorResponse('Failed to update progress', 500);
  }
}

/**
 * Helper function to update leaderboard ranks
 */
async function updateLeaderboardRanks(challengeId: string) {
  const participantsSnapshot = await adminDb
    .collection('challenges')
    .doc(challengeId)
    .collection('participants')
    .orderBy('currentProgress', 'desc')
    .get();

  const batch = adminDb.batch();

  participantsSnapshot.docs.forEach((doc, index) => {
    batch.update(doc.ref, { rank: index + 1 });
  });

  await batch.commit();
}
