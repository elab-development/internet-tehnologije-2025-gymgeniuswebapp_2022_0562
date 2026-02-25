import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse, forbiddenResponse } from '@/utils/api-response';

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 *       403:
 *         description: Forbidden
 */
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    // Get counts from all collections
    const [
      usersSnapshot,
      exercisesSnapshot,
      workoutPlansSnapshot,
      workoutLogsSnapshot,
      challengesSnapshot,
      mealsSnapshot,
    ] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('exercises').where('isActive', '==', true).get(),
      adminDb.collection('workoutPlans').get(),
      adminDb.collection('workoutLogs').get(),
      adminDb.collection('challenges').get(),
      adminDb.collection('meals').get(),
    ]);

    // User statistics by role
    const usersByRole: any = {};
    usersSnapshot.docs.forEach((doc) => {
      const role = doc.data().role || 'user';
      usersByRole[role] = (usersByRole[role] || 0) + 1;
    });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentWorkoutsSnapshot = await adminDb
      .collection('workoutLogs')
      .where('date', '>=', sevenDaysAgo)
      .get();

    const recentMealsSnapshot = await adminDb
      .collection('meals')
      .where('date', '>=', sevenDaysAgo)
      .get();

    // Active challenges
    const activeChallengesSnapshot = await adminDb
      .collection('challenges')
      .where('status', '==', 'active')
      .get();

    return successResponse({
      overview: {
        totalUsers: usersSnapshot.size,
        totalExercises: exercisesSnapshot.size,
        totalWorkoutPlans: workoutPlansSnapshot.size,
        totalWorkoutLogs: workoutLogsSnapshot.size,
        totalChallenges: challengesSnapshot.size,
        totalMeals: mealsSnapshot.size,
      },
      usersByRole,
      recentActivity: {
        workoutsLast7Days: recentWorkoutsSnapshot.size,
        mealsLast7Days: recentMealsSnapshot.size,
      },
      activeChallenges: activeChallengesSnapshot.size,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return errorResponse('Failed to fetch statistics', 500);
  }
}
