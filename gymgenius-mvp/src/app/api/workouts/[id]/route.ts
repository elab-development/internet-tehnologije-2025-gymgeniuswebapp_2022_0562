import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '@/utils/api-response';

/**
 * @swagger
 * /api/workouts/{id}:
 *   get:
 *     summary: Get workout plan by ID
 *     tags: [Workouts]
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
 *         description: Workout plan details
 *       403:
 *         description: Forbidden - Not your workout
 *       404:
 *         description: Workout not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const workoutDoc = await adminDb.collection('workoutPlans').doc(id).get();

    if (!workoutDoc.exists) {
      return notFoundResponse('Workout plan not found');
    }

    const workoutData = workoutDoc.data();

    // ✅ IDOR PROTECTION: Verify ownership
    if (workoutData?.userId !== userId) {
      console.log(`⚠ IDOR attempt: User ${userId} tried to access workout ${id} owned by ${workoutData?.userId}`);
      return forbiddenResponse('You do not have permission to access this workout');
    }

    return successResponse({
      planId: workoutDoc.id,
      ...workoutData,
    });
  } catch (error) {
    console.error('Get workout error:', error);
    return errorResponse('Failed to fetch workout', 500);
  }
}

/**
 * DELETE - samo vlasnik može obrisati
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const workoutDoc = await adminDb.collection('workoutPlans').doc(id).get();

    if (!workoutDoc.exists) {
      return notFoundResponse('Workout plan not found');
    }

    const workoutData = workoutDoc.data();

    // ✅ IDOR PROTECTION
    if (workoutData?.userId !== userId) {
      return forbiddenResponse('You do not have permission to delete this workout');
    }

    await workoutDoc.ref.delete();

    return successResponse({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    return errorResponse('Failed to delete workout', 500);
  }
}
