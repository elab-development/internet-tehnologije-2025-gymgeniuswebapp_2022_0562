import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse } from '@/utils/api-response';
import { Exercise, MuscleGroup, Equipment, Difficulty } from '@/types/models';

/**
 * @swagger
 * /api/exercises:
 *   get:
 *     summary: Get all exercises
 *     tags: [Exercises]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: muscleGroup
 *         schema:
 *           type: string
 *           enum: [chest, back, shoulders, biceps, triceps, legs, core, cardio]
 *         description: Filter by muscle group
 *       - in: query
 *         name: equipment
 *         schema:
 *           type: string
 *           enum: [barbell, dumbbell, machine, bodyweight, resistance_band, kettlebell, cable]
 *         description: Filter by equipment
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *     responses:
 *       200:
 *         description: List of exercises
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     exercises:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Exercise'
 *                     total:
 *                       type: number
 *                       example: 10
 *   post:
 *     summary: Create new exercise (Admin only)
 *     tags: [Exercises]
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
 *               - primaryMuscleGroup
 *               - equipment
 *             properties:
 *               name:
 *                 type: string
 *                 example: Bench Press
 *               description:
 *                 type: string
 *                 example: Compound chest exercise
 *               primaryMuscleGroup:
 *                 type: string
 *                 example: chest
 *               secondaryMuscleGroups:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [triceps, shoulders]
 *               equipment:
 *                 type: string
 *                 example: barbell
 *               difficulty:
 *                 type: string
 *                 example: intermediate
 *               instructions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Step 1", "Step 2"]
 *     responses:
 *       201:
 *         description: Exercise created
 *       403:
 *         description: Forbidden - Admin access required
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parametri za filtriranje
    const muscleGroup = searchParams.get('muscleGroup') as MuscleGroup | null;
    const equipment = searchParams.get('equipment') as Equipment | null;
    const difficulty = searchParams.get('difficulty') as Difficulty | null;
    const search = searchParams.get('search');

    // Kreiraj query
    let query = adminDb.collection('exercises').where('isActive', '==', true);

    // Primeni filtere
    if (muscleGroup) {
      query = query.where('primaryMuscleGroup', '==', muscleGroup);
    }

    if (equipment) {
      query = query.where('equipment', '==', equipment);
    }

    if (difficulty) {
      query = query.where('difficulty', '==', difficulty);
    }

    // Izvršavanje query-ja
    const snapshot = await query.get();

    let exercises: Exercise[] = snapshot.docs.map((doc) => ({
      exerciseId: doc.id,
      ...doc.data(),
    } as Exercise));

    // Client-side search (Firestore ne podržava full-text search)
    if (search) {
      const searchLower = search.toLowerCase();
      exercises = exercises.filter((ex) =>
        ex.name.toLowerCase().includes(searchLower) ||
        ex.description.toLowerCase().includes(searchLower)
      );
    }

    return successResponse({
      exercises,
      total: exercises.length,
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    return errorResponse('Failed to fetch exercises', 500);
  }
}

/**
 * POST /api/exercises
 * Kreira novu vežbu (samo admin)
 */
export async function POST(request: NextRequest) {
  try {
    // Proveri admin pristup (middleware je već verifikovao)
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'admin') {
      return errorResponse('Forbidden - Admin access required', 403);
    }

    const body = await request.json();
    const userId = request.headers.get('x-user-id');

    // Validacija
    if (!body.name || !body.primaryMuscleGroup || !body.equipment) {
      return errorResponse('Missing required fields', 400);
    }

    // Kreiraj vežbu
    const newExercise: Omit<Exercise, 'exerciseId'> = {
      name: body.name,
      description: body.description || '',
      primaryMuscleGroup: body.primaryMuscleGroup,
      secondaryMuscleGroups: body.secondaryMuscleGroups || [],
      equipment: body.equipment,
      difficulty: body.difficulty || Difficulty.BEGINNER,
      videoUrl: body.videoUrl,
      thumbnailUrl: body.thumbnailUrl,
      instructions: body.instructions || [],
      createdBy: userId!,
      createdAt: new Date(),
      isActive: true,
    };

    const docRef = await adminDb.collection('exercises').add(newExercise);

    return successResponse(
      {
        exerciseId: docRef.id,
        ...newExercise,
      },
      'Exercise created successfully',
      201
    );
  } catch (error) {
    console.error('Create exercise error:', error);
    return errorResponse('Failed to create exercise', 500);
  }
}