import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse, unauthorizedResponse } from '@/utils/api-response';
import { Notification } from '@/types/models';

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Filter unread notifications only
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Limit number of results
 *     responses:
 *       200:
 *         description: List of notifications
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
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                     unreadCount:
 *                       type: number
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = adminDb
      .collection('notifications')
      .where('userId', '==', userId);

    if (unreadOnly) {
      query = query.where('isRead', '==', false) as any;
    }

    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const notifications: Notification[] = snapshot.docs.map((doc) => ({
      notificationId: doc.id,
      ...doc.data(),
    } as Notification));

    // Get unread count
    const unreadSnapshot = await adminDb
      .collection('notifications')
      .where('userId', '==', userId)
      .where('isRead', '==', false)
      .get();

    return successResponse({
      notifications,
      total: notifications.length,
      unreadCount: unreadSnapshot.size,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse('Failed to fetch notifications', 500);
  }
}

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create notification (internal/admin)
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [workout_reminder, meal_reminder, challenge_update, achievement, system]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               relatedId:
 *                 type: string
 *               relatedType:
 *                 type: string
 *               actionUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created
 */
export async function POST(request: NextRequest) {
  try {
    const requestUserId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!requestUserId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { userId, type, title, message, relatedId, relatedType, actionUrl } = body;

    // Validation
    if (!userId || !type || !title || !message) {
      return errorResponse('Missing required fields', 400);
    }

    // Only admin or system can create notifications for other users
    if (userId !== requestUserId && userRole !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const newNotification: Omit<Notification, 'notificationId'> = {
      userId,
      type,
      title,
      message,
      isRead: false,
      relatedId,
      relatedType,
      actionUrl,
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection('notifications').add(newNotification);

    return successResponse(
      {
        notificationId: docRef.id,
        ...newNotification,
      },
      'Notification created successfully',
      201
    );
  } catch (error) {
    console.error('Create notification error:', error);
    return errorResponse('Failed to create notification', 500);
  }
}
