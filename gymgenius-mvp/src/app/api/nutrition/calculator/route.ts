import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse } from '@/utils/api-response';
import { Gender, ActivityLevel, FitnessGoal } from '@/types/models';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  [ActivityLevel.SEDENTARY]: 1.2,
  [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
  [ActivityLevel.MODERATELY_ACTIVE]: 1.55,
  [ActivityLevel.VERY_ACTIVE]: 1.725,
  [ActivityLevel.EXTRA_ACTIVE]: 1.9,
};

// Macro ratios: [protein%, carbs%, fat%]
const MACRO_SPLITS: Record<FitnessGoal, [number, number, number]> = {
  [FitnessGoal.WEIGHT_LOSS]: [0.30, 0.40, 0.30],
  [FitnessGoal.MUSCLE_GAIN]: [0.30, 0.45, 0.25],
  [FitnessGoal.STRENGTH]: [0.30, 0.40, 0.30],
  [FitnessGoal.ENDURANCE]: [0.20, 0.55, 0.25],
  [FitnessGoal.GENERAL_FITNESS]: [0.25, 0.45, 0.30],
};

// Calorie adjustment by goal (multiplier on TDEE)
const CALORIE_ADJUSTMENTS: Record<FitnessGoal, number> = {
  [FitnessGoal.WEIGHT_LOSS]: 0.80,     // 20% deficit
  [FitnessGoal.MUSCLE_GAIN]: 1.10,    // 10% surplus
  [FitnessGoal.STRENGTH]: 1.05,       // slight surplus
  [FitnessGoal.ENDURANCE]: 1.00,      // maintenance
  [FitnessGoal.GENERAL_FITNESS]: 1.00, // maintenance
};

/**
 * @swagger
 * /api/nutrition/calculator:
 *   get:
 *     summary: Calculate TDEE and macros based on user profile (Mifflin-St Jeor)
 *     tags: [Nutrition]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Calculated nutrition targets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bmr:
 *                   type: number
 *                   description: Basal Metabolic Rate (kcal)
 *                 tdee:
 *                   type: number
 *                   description: Total Daily Energy Expenditure (kcal)
 *                 targetCalories:
 *                   type: number
 *                   description: Adjusted daily calorie target based on goal
 *                 protein:
 *                   type: number
 *                   description: Daily protein target (g)
 *                 carbs:
 *                   type: number
 *                   description: Daily carbs target (g)
 *                 fat:
 *                   type: number
 *                   description: Daily fat target (g)
 *       400:
 *         description: Incomplete profile data
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return errorResponse('Unauthorized', 401);

    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) return errorResponse('User not found', 404);

    const profile = userDoc.data()!;

    const { age, gender, weight, height, activityLevel, goal } = profile;

    if (!age || !gender || !weight || !height) {
      return errorResponse(
        'Incomplete profile. Please fill in age, gender, weight, and height in your profile.',
        400
      );
    }

    // Mifflin-St Jeor BMR formula
    let bmr: number;
    if (gender === Gender.MALE) {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === Gender.FEMALE) {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      // OTHER: average of male and female
      bmr = 10 * weight + 6.25 * height - 5 * age - 78;
    }

    const activityMultiplier = activityLevel
      ? ACTIVITY_MULTIPLIERS[activityLevel as ActivityLevel] ?? 1.2
      : 1.2;

    const tdee = Math.round(bmr * activityMultiplier);

    const fitnessGoal = (goal as FitnessGoal) || FitnessGoal.GENERAL_FITNESS;
    const calorieAdj = CALORIE_ADJUSTMENTS[fitnessGoal] ?? 1.0;
    const targetCalories = Math.round(tdee * calorieAdj);

    const [proteinRatio, carbsRatio, fatRatio] = MACRO_SPLITS[fitnessGoal] ?? [0.25, 0.45, 0.30];

    const protein = Math.round((targetCalories * proteinRatio) / 4);  // 4 kcal/g
    const carbs = Math.round((targetCalories * carbsRatio) / 4);      // 4 kcal/g
    const fat = Math.round((targetCalories * fatRatio) / 9);          // 9 kcal/g

    return successResponse({
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      protein,
      carbs,
      fat,
      goal: fitnessGoal,
      activityLevel: activityLevel || ActivityLevel.SEDENTARY,
    });
  } catch (error) {
    console.error('Nutrition calculator error:', error);
    return errorResponse('Failed to calculate nutrition targets', 500);
  }
}
