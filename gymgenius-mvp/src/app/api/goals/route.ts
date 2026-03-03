import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse } from '@/utils/api-response';
import { Goal, GoalType, GoalStatus } from '@/types/models';

/**
 * @swagger
 * /api/goals:
 *   get:
 *     summary: Get user's fitness goals
 *     tags: [Goals]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, expired]
 *         description: Filter goals by status (defaults to active)
 *     responses:
 *       200:
 *         description: List of goals
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
 *                     goals:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Goal'
 *   post:
 *     summary: Create a new fitness goal
 *     tags: [Goals]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - targetValue
 *               - currentValue
 *               - unit
 *               - deadline
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [weight, strength, consistency, nutrition]
 *               title:
 *                 type: string
 *                 example: "Izgubiti 5kg"
 *               description:
 *                 type: string
 *               targetValue:
 *                 type: number
 *                 example: 80
 *               currentValue:
 *                 type: number
 *                 example: 85
 *               unit:
 *                 type: string
 *                 example: "kg"
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-01"
 *     responses:
 *       201:
 *         description: Goal created successfully
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || GoalStatus.ACTIVE;

    // Sinhronizuj istekle ciljeve pre dohvatanja
    await expireOverdueGoals(userId);

    const snapshot = await adminDb
      .collection('goals')
      .where('userId', '==', userId)
      .where('status', '==', statusFilter)
      .orderBy('deadline', 'asc')
      .get();

    const goals: Goal[] = snapshot.docs.map((doc) => ({
      goalId: doc.id,
      ...doc.data(),
    } as Goal));

    return successResponse({ goals, total: goals.length });
  } catch (error) {
    console.error('Get goals error:', error);
    return errorResponse('Failed to fetch goals', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { type, title, description, targetValue, currentValue, unit, deadline } = body;

    if (!type || !title || targetValue === undefined || currentValue === undefined || !unit || !deadline) {
      return errorResponse('Missing required fields: type, title, targetValue, currentValue, unit, deadline', 400);
    }

    if (!Object.values(GoalType).includes(type)) {
      return errorResponse(`Invalid goal type. Must be one of: ${Object.values(GoalType).join(', ')}`, 400);
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return errorResponse('Invalid deadline date format', 400);
    }

    if (deadlineDate <= new Date()) {
      return errorResponse('Deadline must be in the future', 400);
    }

    const newGoal: Omit<Goal, 'goalId'> = {
      userId,
      type,
      title,
      description: description || undefined,
      targetValue: Number(targetValue),
      currentValue: Number(currentValue),
      unit,
      deadline: deadlineDate,
      status: GoalStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection('goals').add(newGoal);

    return successResponse({ goalId: docRef.id, ...newGoal }, 'Goal created successfully', 201);
  } catch (error) {
    console.error('Create goal error:', error);
    return errorResponse('Failed to create goal', 500);
  }
}

async function expireOverdueGoals(userId: string) {
  const now = new Date();
  const snapshot = await adminDb
    .collection('goals')
    .where('userId', '==', userId)
    .where('status', '==', GoalStatus.ACTIVE)
    .get();

  const batch = adminDb.batch();
  snapshot.docs.forEach((doc) => {
    const deadline = doc.data().deadline?.toDate?.() || new Date(doc.data().deadline);
    if (deadline < now) {
      batch.update(doc.ref, { status: GoalStatus.EXPIRED, updatedAt: new Date() });
    }
  });
  await batch.commit();
}
