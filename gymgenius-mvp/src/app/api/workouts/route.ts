import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse } from '@/utils/api-response';
import { WorkoutPlan } from '@/types/models';

/**
 * GET /api/workouts
 * Vraća workout planove korisnika
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const snapshot = await adminDb
      .collection('workoutPlans')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const plans: WorkoutPlan[] = snapshot.docs.map((doc) => ({
      planId: doc.id,
      ...doc.data(),
    } as WorkoutPlan));

    return successResponse({ plans, total: plans.length });
  } catch (error) {
    console.error('Get workout plans error:', error);
    return errorResponse('Failed to fetch workout plans', 500);
  }
}

/**
 * POST /api/workouts
 * Kreira novi workout plan
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    // Validacija
    if (!body.name || !body.goal) {
      return errorResponse('Missing required fields: name, goal', 400);
    }

    const newPlan: Omit<WorkoutPlan, 'planId'> = {
      userId,
      name: body.name,
      goal: body.goal,
      difficulty: body.difficulty || 'beginner',
      durationWeeks: body.durationWeeks || 4,
      generatedBy: body.generatedBy || 'manual',
      isActive: body.isActive !== undefined ? body.isActive : true,
      schedule: body.schedule || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection('workoutPlans').add(newPlan);

    return successResponse(
      {
        planId: docRef.id,
        ...newPlan,
      },
      'Workout plan created successfully',
      201
    );
  } catch (error) {
    console.error('Create workout plan error:', error);
    return errorResponse('Failed to create workout plan', 500);
  }
}