import { NextRequest } from 'next/server';
import { generateWorkoutPlan, checkOllamaHealth } from '@/lib/ollama';
import { successResponse, errorResponse, unauthorizedResponse } from '@/utils/api-response';
import { adminDb } from '@/lib/firebase-admin';
import { WorkoutPlan, FitnessGoal, Difficulty } from '@/types/models';

/**
 * @swagger
 * /api/ai/generate-workout:
 *   post:
 *     summary: Generate AI-powered workout plan using Ollama (Llama 3.2)
 *     tags: [AI]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - goal
 *               - experience
 *               - daysPerWeek
 *             properties:
 *               goal:
 *                 type: string
 *                 enum: [weight_loss, muscle_gain, strength, endurance, general_fitness]
 *                 example: muscle_gain
 *               experience:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 example: intermediate
 *               equipment:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [barbell, dumbbell, bodyweight]
 *               daysPerWeek:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 7
 *                 example: 4
 *               durationWeeks:
 *                 type: number
 *                 minimum: 4
 *                 maximum: 16
 *                 example: 8
 *               saveToProfile:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Workout plan generated successfully
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
 *                     plan:
 *                       type: object
 *                     planId:
 *                       type: string
 *                     aiModel:
 *                       type: string
 *                       example: llama3.2
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: AI generation failed
 */
export async function POST(request: NextRequest) {
  try {
    // Proveri autentifikaciju
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return unauthorizedResponse();
    }

    // Parse request body
    const body = await request.json();
    const {
      goal,
      experience,
      equipment = [],
      daysPerWeek = 3,
      durationWeeks = 8,
      saveToProfile = true,
    } = body;

    // Validacija
    if (!goal || !experience) {
      return errorResponse('Missing required fields: goal, experience', 400);
    }

    if (daysPerWeek < 1 || daysPerWeek > 7) {
      return errorResponse('daysPerWeek must be between 1 and 7', 400);
    }

    if (durationWeeks < 4 || durationWeeks > 16) {
      return errorResponse('durationWeeks must be between 4 and 16', 400);
    }

    // Proveri da li je Ollama dostupan
    const isOllamaHealthy = await checkOllamaHealth();
    if (!isOllamaHealthy) {
      console.warn('⚠ Ollama service not available, will use fallback plan');
    }

    // Učitaj korisničke podatke za personalizaciju
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();

    // Pozovi Ollama API (Llama 3.2)
    console.log('🤖 Generating AI workout plan with Ollama (Llama 3.2) for user:', userId);

    const aiResponse = await generateWorkoutPlan({
      goal,
      experience,
      equipment,
      daysPerWeek,
      durationWeeks,
      age: userData?.age,
      gender: userData?.gender,
      fitnessLevel: experience,
    });

    if (!aiResponse.success) {
      return errorResponse(aiResponse.error || 'Failed to generate workout plan', 500);
    }

    const generatedPlan = aiResponse.data;

    // Ako korisnik želi da sačuva plan
    let savedPlanId = null;

    if (saveToProfile) {
      // Konvertuj AI response u WorkoutPlan format
      const workoutPlan: Omit<WorkoutPlan, 'planId'> = {
        userId,
        name: generatedPlan.planName || `${goal} - ${experience} Plan`,
        goal: goal as FitnessGoal,
        difficulty: experience as Difficulty,
        durationWeeks,
        generatedBy: 'ai',
        isActive: true,
        schedule: generatedPlan.weeklySchedule?.map((day: any) => ({
          dayNumber: day.day,
          exercises: day.exercises?.map((ex: any, index: number) => ({
            exerciseId: 'ai-generated', // Placeholder
            orderIndex: index + 1,
            recommendedSets: ex.sets || 3,
            recommendedReps: ex.reps || '8-12',
            restSeconds: ex.restSeconds || 90,
            notes: ex.notes,
          })) || [],
        })) || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Sačuvaj u Firestore
      const planRef = await adminDb.collection('workoutPlans').add(workoutPlan);
      savedPlanId = planRef.id;

      console.log('✅ AI workout plan saved:', savedPlanId);
    }

    return successResponse(
      {
        plan: generatedPlan,
        planId: savedPlanId,
        aiModel: aiResponse.metadata?.model || 'llama3.2',
        metadata: aiResponse.metadata,
      },
      'Workout plan generated successfully'
    );
  } catch (error: any) {
    console.error('❌ AI workout generation error:', error);
    return errorResponse('Failed to generate workout plan', 500);
  }
}

/**
 * @swagger
 * /api/ai/generate-workout:
 *   get:
 *     summary: Check Ollama service health
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Ollama service status
 */
export async function GET() {
  try {
    const isHealthy = await checkOllamaHealth();

    return successResponse({
      status: isHealthy ? 'healthy' : 'unavailable',
      service: 'Ollama',
      model: process.env.OLLAMA_MODEL || 'llama3.2',
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    });
  } catch (error) {
    return errorResponse('Failed to check Ollama health', 500);
  }
}
