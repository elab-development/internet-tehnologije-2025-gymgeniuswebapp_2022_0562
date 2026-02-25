import { NextRequest } from 'next/server';
import { fetchExerciseById, fetchExerciseImages } from '@/lib/wger';
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse } from '@/utils/api-response';

/**
 * @swagger
 * /api/wger/exercises/{id}:
 *   get:
 *     summary: Get exercise details from Wger
 *     tags: [Wger]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Wger exercise ID
 *     responses:
 *       200:
 *         description: Exercise details
 *       404:
 *         description: Exercise not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return unauthorizedResponse();
    }

    const exerciseId = parseInt(params.id);

    if (isNaN(exerciseId)) {
      return errorResponse('Invalid exercise ID', 400);
    }

    console.log(`📥 Fetching Wger exercise: ${exerciseId}`);

    const exercise = await fetchExerciseById(exerciseId);

    // Fetch images
    const images = await fetchExerciseImages(exerciseId);

    return successResponse({
      exercise,
      images,
      source: 'Wger API',
    });
  } catch (error) {
    console.error('Wger exercise details error:', error);
    return notFoundResponse('Exercise not found in Wger database');
  }
}
