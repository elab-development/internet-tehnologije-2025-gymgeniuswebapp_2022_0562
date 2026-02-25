import { adminDb } from './firebase-admin';
import { NotificationType } from '@/types/models';

/**
 * Helper function to send notification to user
 */
export async function sendNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    relatedId?: string;
    relatedType?: 'workout' | 'challenge' | 'meal' | 'achievement';
    actionUrl?: string;
  }
) {
  try {
    // Check user preferences
    const preferencesDoc = await adminDb
      .collection('userPreferences')
      .doc(userId)
      .get();

    const preferences = preferencesDoc.data();

    // Check if user has this type of notification enabled
    const notificationEnabled = checkNotificationEnabled(type, preferences);

    if (!notificationEnabled) {
      console.log(`Notification disabled for user ${userId}, type: ${type}`);
      return { success: false, reason: 'disabled' };
    }

    // Create notification
    const notification = {
      userId,
      type,
      title,
      message,
      isRead: false,
      relatedId: options?.relatedId,
      relatedType: options?.relatedType,
      actionUrl: options?.actionUrl,
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection('notifications').add(notification);

    console.log(`✅ Notification sent to user ${userId}:`, title);

    return {
      success: true,
      notificationId: docRef.id,
    };
  } catch (error) {
    console.error('Send notification error:', error);
    return { success: false, error };
  }
}

/**
 * Check if notification type is enabled for user
 */
function checkNotificationEnabled(
  type: NotificationType,
  preferences: any
): boolean {
  if (!preferences?.notifications) {
    return true; // Default: all enabled
  }

  switch (type) {
    case NotificationType.WORKOUT_REMINDER:
      return preferences.notifications.workoutReminders !== false;
    case NotificationType.MEAL_REMINDER:
      return preferences.notifications.mealReminders !== false;
    case NotificationType.CHALLENGE_UPDATE:
      return preferences.notifications.challengeUpdates !== false;
    case NotificationType.ACHIEVEMENT:
      return preferences.notifications.achievements !== false;
    default:
      return true;
  }
}

/**
 * Send workout reminder
 */
export async function sendWorkoutReminder(userId: string, workoutName: string) {
  return sendNotification(
    userId,
    NotificationType.WORKOUT_REMINDER,
    '💪 Time to Workout!',
    `Don't forget your ${workoutName} session today!`,
    {
      actionUrl: '/dashboard',
    }
  );
}

/**
 * Send meal reminder
 */
export async function sendMealReminder(userId: string, mealType: string) {
  return sendNotification(
    userId,
    NotificationType.MEAL_REMINDER,
    '🍎 Meal Reminder',
    `Time to log your ${mealType}!`,
    {
      actionUrl: '/nutrition',
    }
  );
}

/**
 * Send challenge update
 */
export async function sendChallengeUpdate(
  userId: string,
  challengeName: string,
  message: string,
  challengeId: string
) {
  return sendNotification(
    userId,
    NotificationType.CHALLENGE_UPDATE,
    `🏆 ${challengeName}`,
    message,
    {
      relatedId: challengeId,
      relatedType: 'challenge',
      actionUrl: `/challenges/${challengeId}`,
    }
  );
}

/**
 * Send achievement notification
 */
export async function sendAchievement(
  userId: string,
  achievementTitle: string,
  achievementMessage: string
) {
  return sendNotification(
    userId,
    NotificationType.ACHIEVEMENT,
    `🎉 ${achievementTitle}`,
    achievementMessage,
    {
      relatedType: 'achievement',
    }
  );
}
