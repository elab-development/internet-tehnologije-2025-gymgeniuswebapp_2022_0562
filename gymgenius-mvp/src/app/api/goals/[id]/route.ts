import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '@/utils/api-response';
import { GoalStatus } from '@/types/models';

/**
 * @swagger
 * /api/goals/{id}:
 *   put:
 *     summary: Update a fitness goal (progress or details)
 *     tags: [Goals]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentValue:
 *                 type: number
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Goal updated successfully
 *   delete:
 *     summary: Delete a fitness goal
 *     tags: [Goals]
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
 *         description: Goal deleted successfully
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const goalDoc = await adminDb.collection('goals').doc(id).get();

    if (!goalDoc.exists) return notFoundResponse('Goal not found');
    if (goalDoc.data()?.userId !== userId) return forbiddenResponse('Access denied');

    const body = await request.json();
    const { currentValue, title, description, deadline } = body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (currentValue !== undefined) {
      updates.currentValue = Number(currentValue);
      // Proveri da li je cilj postignut
      const target = goalDoc.data()?.targetValue;
      if (Number(currentValue) >= target) {
        updates.status = GoalStatus.COMPLETED;
      }
    }
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) return errorResponse('Invalid deadline date', 400);
      if (deadlineDate <= new Date()) return errorResponse('Deadline must be in the future', 400);
      updates.deadline = deadlineDate;
    }

    await goalDoc.ref.update(updates);

    const updatedDoc = await goalDoc.ref.get();
    const updatedData = updatedDoc.data() ?? {};
    return successResponse({
      goalId: id,
      ...updatedData,
      deadline: updatedData.deadline?.toDate?.()?.toISOString() ?? updatedData.deadline,
      createdAt: updatedData.createdAt?.toDate?.()?.toISOString() ?? updatedData.createdAt,
      updatedAt: updatedData.updatedAt?.toDate?.()?.toISOString() ?? updatedData.updatedAt,
    }, 'Goal updated successfully');
  } catch (error) {
    console.error('Update goal error:', error);
    return errorResponse('Failed to update goal', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const goalDoc = await adminDb.collection('goals').doc(id).get();

    if (!goalDoc.exists) return notFoundResponse('Goal not found');
    if (goalDoc.data()?.userId !== userId) return forbiddenResponse('Access denied');

    await goalDoc.ref.delete();

    return successResponse({ goalId: id }, 'Goal deleted successfully');
  } catch (error) {
    console.error('Delete goal error:', error);
    return errorResponse('Failed to delete goal', 500);
  }
}
