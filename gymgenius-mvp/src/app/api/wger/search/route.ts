import { NextRequest } from 'next/server';
import { searchExercises } from '@/lib/wger';
import { successResponse, errorResponse, unauthorizedResponse } from '@/utils/api-response';

/**
 * @swagger
 * /api/wger/search:
 *   get:
 *     summary: Search exercises from Wger database
 *     tags: [Wger]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: bench press
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Max results
 *         example: 20
 *     responses:
 *       200:
 *         description: Search results from Wger
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
 *                     exercises:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Missing query parameter
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return errorResponse('Query parameter is required', 400);
    }

    console.log(`🔍 Searching Wger for: "${query}"`);

    const exercises = await searchExercises(query, limit);

    return successResponse({
      exercises,
      total: exercises.length,
      source: 'Wger API',
    });
  } catch (error) {
    console.error('Wger search error:', error);
    return errorResponse('Failed to search exercises', 500);
  }
}
