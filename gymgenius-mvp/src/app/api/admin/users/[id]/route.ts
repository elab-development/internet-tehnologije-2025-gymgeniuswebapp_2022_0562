import { NextRequest } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
  unauthorizedResponse,
} from '@/utils/api-response';

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [guest, user, premium, admin]
 *               displayName:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       403:
 *         description: Forbidden
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Admin]
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
 *         description: User deleted
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    const body = await request.json();
    const { role, displayName, isBlocked } = body;

    const { id } = await params;
    const userDoc = await adminDb.collection('users').doc(id).get();

    if (!userDoc.exists) {
      return notFoundResponse('User not found');
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (role) updateData.role = role;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (isBlocked !== undefined) updateData.isBlocked = isBlocked;

    await userDoc.ref.update(updateData);

    // Update Firebase Auth if needed
    if (displayName !== undefined) {
      await adminAuth.updateUser(id, { displayName });
    }

    const updatedDoc = await userDoc.ref.get();

    return successResponse(
      {
        userId: updatedDoc.id,
        ...updatedDoc.data(),
      },
      'User updated successfully'
    );
  } catch (error) {
    console.error('Admin update user error:', error);
    return errorResponse('Failed to update user', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    const requestUserId = request.headers.get('x-user-id');

    if (userRole !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    const { id } = await params;

    // Prevent self-deletion
    if (id === requestUserId) {
      return errorResponse('Cannot delete your own account', 400);
    }

    const userDoc = await adminDb.collection('users').doc(id).get();

    if (!userDoc.exists) {
      return notFoundResponse('User not found');
    }

    // Delete from Firebase Auth
    await adminAuth.deleteUser(id);

    // Delete from Firestore
    await userDoc.ref.delete();

    // Optionally: delete user's data (workouts, meals, etc.)
    // This could be done in a background job

    return successResponse(
      { message: 'User deleted successfully' },
      'User deleted successfully'
    );
  } catch (error) {
    console.error('Admin delete user error:', error);
    return errorResponse('Failed to delete user', 500);
  }
}
