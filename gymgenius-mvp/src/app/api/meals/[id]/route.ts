import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '@/utils/api-response';

/**
 * @swagger
 * /api/meals/{id}:
 *   delete:
 *     summary: Delete a meal log entry
 *     tags: [Meals]
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
 *         description: Meal deleted successfully
 *       403:
 *         description: Not authorized to delete this meal
 *       404:
 *         description: Meal not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const mealDoc = await adminDb.collection('meals').doc(id).get();

    if (!mealDoc.exists) return notFoundResponse('Meal not found');

    // IDOR protection: proveri vlasnika
    if (mealDoc.data()?.userId !== userId) return forbiddenResponse('Access denied');

    await mealDoc.ref.delete();

    return successResponse({ mealId: id }, 'Meal deleted successfully');
  } catch (error) {
    console.error('Delete meal error:', error);
    return errorResponse('Failed to delete meal', 500);
  }
}
