import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse, unauthorizedResponse } from '@/utils/api-response';

/**
 * @swagger
 * /api/notifications/read-all:
 *   post:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return unauthorizedResponse();
    }

    const unreadSnapshot = await adminDb
      .collection('notifications')
      .where('userId', '==', userId)
      .where('isRead', '==', false)
      .get();

    const batch = adminDb.batch();

    unreadSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();

    return successResponse(
      {
        message: `Marked ${unreadSnapshot.size} notifications as read`,
        count: unreadSnapshot.size,
      },
      'All notifications marked as read'
    );
  } catch (error) {
    console.error('Mark all as read error:', error);
    return errorResponse('Failed to mark all as read', 500);
  }
}
