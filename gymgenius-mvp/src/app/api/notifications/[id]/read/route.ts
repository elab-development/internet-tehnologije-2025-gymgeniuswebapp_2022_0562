import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/utils/api-response';

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   post:
 *     summary: Mark notification as read
 *     tags: [Notifications]
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
 *         description: Notification marked as read
 *       403:
 *         description: Not your notification
 *       404:
 *         description: Notification not found
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const notificationDoc = await adminDb
      .collection('notifications')
      .doc(id)
      .get();

    if (!notificationDoc.exists) {
      return notFoundResponse('Notification not found');
    }

    const notificationData = notificationDoc.data();

    // Verify ownership
    if (notificationData?.userId !== userId) {
      return forbiddenResponse('Not your notification');
    }

    // Mark as read
    await notificationDoc.ref.update({
      isRead: true,
    });

    return successResponse(
      { message: 'Notification marked as read' },
      'Notification marked as read'
    );
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return errorResponse('Failed to mark notification as read', 500);
  }
}
