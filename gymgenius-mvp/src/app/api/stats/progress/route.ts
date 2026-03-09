import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse, unauthorizedResponse } from '@/utils/api-response';

/**
 * @swagger
 * /api/stats/progress:
 *   get:
 *     summary: Get user progress statistics
 *     tags: [Statistics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *         description: Time period for statistics
 *         example: month
 *     responses:
 *       200:
 *         description: Progress statistics
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
 *                     weightProgress:
 *                       type: array
 *                       items:
 *                         type: object
 *                     workoutVolume:
 *                       type: array
 *                       items:
 *                         type: object
 *                     calorieIntake:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    // Fetch workout logs
    const workoutLogsSnapshot = await adminDb
      .collection('workoutLogs')
      .where('userId', '==', userId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .get();

    const workoutLogs = workoutLogsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch meals (date is stored as ISO string "YYYY-MM-DD" in meals collection)
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    const mealsSnapshot = await adminDb
      .collection('meals')
      .where('userId', '==', userId)
      .where('date', '>=', startDateStr)
      .where('date', '<=', endDateStr)
      .orderBy('date', 'asc')
      .get();

    const meals = mealsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Process data for charts

    // 1. Weight Progress (mock data - u realnoj app bi bilo iz user profile updates)
    const weightProgress = generateWeightProgressData(startDate, endDate);

    // 2. Workout Volume
    const workoutVolume = workoutLogs.map((log: any) => ({
      date: (log.date?.toDate ? log.date.toDate() : new Date(log.date)).toISOString().split('T')[0],
      volume: log.totalVolume || 0,
      duration: log.duration || 0,
    }));

    // 3. Calorie Intake
    const caloriesByDate = meals.reduce((acc: any, meal: any) => {
      const dateKey = new Date(meal.date.toDate ? meal.date.toDate() : meal.date)
        .toISOString()
        .split('T')[0];

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        };
      }

      acc[dateKey].calories += meal.calories || 0;
      acc[dateKey].protein += meal.protein || 0;
      acc[dateKey].carbs += meal.carbs || 0;
      acc[dateKey].fat += meal.fat || 0;

      return acc;
    }, {});

    const calorieIntake = Object.values(caloriesByDate);

    // 4. Workout Frequency
    const workoutFrequency = calculateWorkoutFrequency(workoutLogs, startDate, endDate);

    // 5. Muscle Group Distribution
    const muscleGroupDistribution = calculateMuscleGroupDistribution(workoutLogs);

    return successResponse({
      weightProgress,
      workoutVolume,
      calorieIntake,
      workoutFrequency,
      muscleGroupDistribution,
      summary: {
        totalWorkouts: workoutLogs.length,
        totalMeals: meals.length,
        averageCalories:
          calorieIntake.length > 0
            ? Math.round(
                calorieIntake.reduce((sum: number, day: any) => sum + day.calories, 0) /
                  calorieIntake.length
              )
            : 0,
        totalVolume: workoutLogs.reduce((sum: number, log: any) => sum + (log.totalVolume || 0), 0),
      },
    });
  } catch (error) {
    console.error('Get progress stats error:', error);
    return errorResponse('Failed to fetch progress statistics', 500);
  }
}

// Helper functions

function generateWeightProgressData(startDate: Date, endDate: Date) {
  // Mock data - u realnoj app bi se čuvalo u user profile ili posebnoj kolekciji
  const data = [];
  const daysDiff = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const baseWeight = 75;

  for (let i = 0; i <= daysDiff; i += Math.ceil(daysDiff / 10)) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    data.push({
      date: date.toISOString().split('T')[0],
      weight: baseWeight - (i / daysDiff) * 2 + Math.random() * 0.5, // Simulirani pad težine
    });
  }

  return data;
}

function calculateWorkoutFrequency(workoutLogs: any[], startDate: Date, endDate: Date) {
  const weeklyData: any = {};

  workoutLogs.forEach((log: any) => {
    const logDate = log.date.toDate ? log.date.toDate() : new Date(log.date);
    const weekNumber = getWeekNumber(logDate);

    if (!weeklyData[weekNumber]) {
      weeklyData[weekNumber] = {
        week: weekNumber,
        count: 0,
      };
    }

    weeklyData[weekNumber].count++;
  });

  return Object.values(weeklyData);
}

function calculateMuscleGroupDistribution(workoutLogs: any[]) {
  const distribution: any = {};

  workoutLogs.forEach((log: any) => {
    log.exercises?.forEach((exercise: any) => {
      // Simulirano - u realnoj app bi se čitalo iz exercise modela
      const muscleGroup = 'chest'; // Placeholder

      if (!distribution[muscleGroup]) {
        distribution[muscleGroup] = 0;
      }

      distribution[muscleGroup] += exercise.sets?.length || 0;
    });
  });

  return Object.entries(distribution).map(([muscle, sets]) => ({
    muscle,
    sets,
  }));
}

function getWeekNumber(date: Date): string {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return `Week ${Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)}`;
}
