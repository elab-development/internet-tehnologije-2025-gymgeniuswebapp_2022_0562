import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse, unauthorizedResponse } from '@/utils/api-response';
import { Challenge, ChallengeType, ChallengeStatus } from '@/types/models';

/**
 * @swagger
 * /api/challenges:
 *   get:
 *     summary: Get all active challenges
 *     tags: [Challenges]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, active, completed]
 *         description: Filter by challenge status
 *     responses:
 *       200:
 *         description: List of challenges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     challenges:
 *                       type: array
 *                       items:
 *                         type: object
 *   post:
 *     summary: Create new challenge (Admin only)
 *     tags: [Challenges]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - startDate
 *               - endDate
 *               - targetValue
 *             properties:
 *               name:
 *                 type: string
 *                 example: 30-Day Consistency Challenge
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [weight_loss, strength, consistency, volume]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               targetValue:
 *                 type: number
 *                 example: 20
 *               targetUnit:
 *                 type: string
 *                 example: workouts
 *     responses:
 *       201:
 *         description: Challenge created
 *       403:
 *         description: Forbidden - Admin only
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') as ChallengeStatus | null;

    let query = adminDb.collection('challenges');

    // Filter by status
    if (statusFilter) {
      query = query.where('status', '==', statusFilter) as any;
    }

    const snapshot = await query.orderBy('startDate', 'desc').get();

    const challenges: any[] = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const challengeData = doc.data();

        // Get participant count
        const participantsSnapshot = await doc.ref.collection('participants').get();

        // Check if current user is participating
        const userParticipation = await doc.ref
          .collection('participants')
          .doc(userId)
          .get();

        return {
          challengeId: doc.id,
          ...challengeData,
          participantCount: participantsSnapshot.size,
          isParticipating: userParticipation.exists,
          userProgress: userParticipation.exists ? userParticipation.data() : null,
        };
      })
    );

    return successResponse({ challenges, total: challenges.length });
  } catch (error) {
    console.error('Get challenges error:', error);
    return errorResponse('Failed to fetch challenges', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return unauthorizedResponse();
    }

    // Only admins can create challenges
    if (userRole !== 'admin') {
      return errorResponse('Forbidden - Admin access required', 403);
    }

    const body = await request.json();
    const { name, description, type, startDate, endDate, targetValue, targetUnit } = body;

    // Validation
    if (!name || !type || !startDate || !endDate || !targetValue) {
      return errorResponse('Missing required fields', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return errorResponse('End date must be after start date', 400);
    }

    // Determine status based on dates
    const now = new Date();
    let status: ChallengeStatus;

    if (now < start) {
      status = ChallengeStatus.UPCOMING;
    } else if (now >= start && now <= end) {
      status = ChallengeStatus.ACTIVE;
    } else {
      status = ChallengeStatus.COMPLETED;
    }

    const newChallenge: Omit<Challenge, 'challengeId'> = {
      name,
      description: description || '',
      type: type as ChallengeType,
      startDate: start,
      endDate: end,
      targetValue,
      targetUnit: targetUnit || 'points',
      status,
      participantCount: 0,
      createdBy: userId,
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection('challenges').add(newChallenge);

    return successResponse(
      {
        challengeId: docRef.id,
        ...newChallenge,
      },
      'Challenge created successfully',
      201
    );
  } catch (error) {
    console.error('Create challenge error:', error);
    return errorResponse('Failed to create challenge', 500);
  }
}
