import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse, unauthorizedResponse } from '@/utils/api-response';
import { UserPreferences } from '@/types/models';

/**
 * @swagger
 * /api/preferences:
 *   get:
 *     summary: Get user notification preferences
 *     tags: [Preferences]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User preferences
 *   put:
 *     summary: Update user notification preferences
 *     tags: [Preferences]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 type: object
 *               reminderTimes:
 *                 type: object
 *     responses:
 *       200:
 *         description: Preferences updated
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return unauthorizedResponse();
    }

    const preferencesDoc = await adminDb
      .collection('userPreferences')
      .doc(userId)
      .get();

    if (!preferencesDoc.exists) {
      // Return default preferences
      const defaultPreferences: UserPreferences = {
        userId,
        notifications: {
          workoutReminders: true,
          mealReminders: true,
          challengeUpdates: true,
          achievements: true,
          email: false,
          push: true,
        },
        reminderTimes: {
          morning: '08:00',
          afternoon: '12:00',
          evening: '18:00',
        },
        updatedAt: new Date(),
      };

      return successResponse(defaultPreferences);
    }

    return successResponse(preferencesDoc.data());
  } catch (error) {
    console.error('Get preferences error:', error);
    return errorResponse('Failed to fetch preferences', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { notifications, reminderTimes } = body;

    const updatedPreferences: UserPreferences = {
      userId,
      notifications: notifications || {},
      reminderTimes: reminderTimes || {},
      updatedAt: new Date(),
    };

    await adminDb
      .collection('userPreferences')
      .doc(userId)
      .set(updatedPreferences, { merge: true });

    return successResponse(updatedPreferences, 'Preferences updated successfully');
  } catch (error) {
    console.error('Update preferences error:', error);
    return errorResponse('Failed to update preferences', 500);
  }
}
