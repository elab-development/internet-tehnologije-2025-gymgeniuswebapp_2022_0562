import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { generateWorkoutPlan } from '@/lib/ollama';
import { successResponse, errorResponse } from '@/utils/api-response';
import { FitnessGoal, Difficulty } from '@/types/models';

/**
 * @swagger
 * /api/premium/ai-weekly-plan:
 *   post:
 *     summary: Generate a full 7-day AI workout plan (Premium only)
 *     tags: [Premium]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               durationWeeks:
 *                 type: number
 *                 default: 4
 *                 description: Plan duration in weeks (1-12)
 *               includeNutrition:
 *                 type: boolean
 *                 default: true
 *                 description: Include nutrition advice in the plan
 *     responses:
 *       200:
 *         description: Generated 7-day workout plan with daily schedules
 *       403:
 *         description: Premium subscription required
 *       400:
 *         description: Incomplete profile data
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return errorResponse('Unauthorized', 401);

    const body = await request.json().catch(() => ({}));
    const durationWeeks = Math.min(Math.max(Number(body.durationWeeks) || 4, 1), 12);
    const includeNutrition = body.includeNutrition !== false;

    // Fetch user profile for personalization
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) return errorResponse('User not found', 404);

    const profile = userDoc.data()!;
    const { age, gender, weight, height, goal, activityLevel, availableEquipment, displayName } = profile;

    if (!goal) {
      return errorResponse('Please set a fitness goal in your profile first', 400);
    }

    const experience = (activityLevel === 'sedentary' || activityLevel === 'lightly_active')
      ? 'beginner'
      : activityLevel === 'moderately_active'
      ? 'intermediate'
      : 'advanced';

    // Generate workout using Ollama - premium gets 7-day plan
    const result = await generateWorkoutPlan({
      goal: goal as FitnessGoal,
      experience,
      daysPerWeek: 7,
      durationWeeks,
      equipment: availableEquipment || [],
      age: age || undefined,
      gender: gender || undefined,
    });

    const planData = result.data || {};

    // Save the premium plan to Firestore
    const planRef = adminDb.collection('workoutPlans').doc();
    const premiumPlan = {
      planId: planRef.id,
      userId,
      name: `${displayName || 'Korisnik'} - Premium 7-Day Plan`,
      goal: goal as FitnessGoal,
      difficulty: Difficulty.INTERMEDIATE,
      durationWeeks,
      generatedBy: 'ai' as const,
      isPremium: true,
      isActive: true,
      weeklySchedule: planData.weeklySchedule || [],
      progressionNotes: planData.progressionNotes || '',
      ...(includeNutrition ? { nutritionTips: planData.nutritionTips || '' } : {}),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await planRef.set(premiumPlan);

    return successResponse({
      ...premiumPlan,
      metadata: result.metadata || {},
    }, 'Premium 7-day workout plan generated successfully');
  } catch (error) {
    console.error('Premium AI weekly plan error:', error);
    return errorResponse('Failed to generate premium workout plan', 500);
  }
}
