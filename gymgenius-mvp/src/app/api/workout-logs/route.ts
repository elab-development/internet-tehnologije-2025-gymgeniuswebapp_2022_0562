import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse } from '@/utils/api-response';
import { WorkoutLog, LogStatus } from '@/types/models';

/**
 * @swagger
 * /api/workout-logs:
 *   get:
 *     summary: Get user's workout logs (history)
 *     tags: [WorkoutLogs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Max number of logs to return (default 20)
 *     responses:
 *       200:
 *         description: List of workout logs
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
 *                     logs:
 *                       type: array
 *                     total:
 *                       type: number
 *   post:
 *     summary: Create a new workout log entry
 *     tags: [WorkoutLogs]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exercises
 *               - duration
 *             properties:
 *               exercises:
 *                 type: array
 *                 description: List of exercises performed
 *               duration:
 *                 type: number
 *                 description: Duration in minutes
 *               notes:
 *                 type: string
 *               planId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Workout log created
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const snapshot = await adminDb
      .collection('workoutLogs')
      .where('userId', '==', userId)
      .get();

    const allLogs: WorkoutLog[] = snapshot.docs
      .map((doc) => ({ logId: doc.id, ...doc.data() } as WorkoutLog))
      .sort((a: any, b: any) => {
        const dateA = a.date?.toDate ? a.date.toDate().getTime() : new Date(a.date ?? a.createdAt).getTime();
        const dateB = b.date?.toDate ? b.date.toDate().getTime() : new Date(b.date ?? b.createdAt).getTime();
        return dateB - dateA;
      });

    const totalCount = allLogs.length;
    const logs = allLogs.slice(0, limit);

    return successResponse({ logs, total: totalCount });
  } catch (error) {
    console.error('Get workout logs error:', error);
    return errorResponse('Failed to fetch workout logs', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    if (!body.exercises || !Array.isArray(body.exercises)) {
      return errorResponse('Missing required field: exercises', 400);
    }

    // Calculate total volume: sum(sets * reps * weight) across all exercises
    const totalVolume = (body.exercises as any[]).reduce((total: number, ex: any) => {
      const exVolume = (ex.sets || []).reduce((s: number, set: any) => {
        return s + (set.reps || 0) * (set.weight || 0);
      }, 0);
      return total + exVolume;
    }, 0);

    const newLog: Omit<WorkoutLog, 'logId'> = {
      userId,
      ...(body.planId ? { planId: body.planId } : {}),
      date: new Date(),
      exercises: body.exercises,
      duration: body.duration || 0,
      totalVolume,
      status: LogStatus.COMPLETED,
      ...(body.notes ? { notes: body.notes } : {}),
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection('workoutLogs').add(newLog);

    return successResponse(
      { logId: docRef.id, ...newLog },
      'Trening uspešno sačuvan!',
      201
    );
  } catch (error) {
    console.error('Create workout log error:', error);
    return errorResponse('Failed to save workout log', 500);
  }
}
