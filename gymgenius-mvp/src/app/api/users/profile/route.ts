import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse, notFoundResponse } from '@/utils/api-response';
import { Gender, FitnessGoal, ActivityLevel, Equipment } from '@/types/models';

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               age:
 *                 type: number
 *                 example: 25
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               weight:
 *                 type: number
 *                 example: 80
 *               height:
 *                 type: number
 *                 example: 180
 *               goal:
 *                 type: string
 *                 enum: [weight_loss, muscle_gain, strength, endurance, general_fitness]
 *               activityLevel:
 *                 type: string
 *                 enum: [sedentary, lightly_active, moderately_active, very_active, extra_active]
 *               availableEquipment:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return errorResponse('Unauthorized', 401);

    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) return notFoundResponse('User not found');

    const userData = userDoc.data();
    // Ne vraćamo osetljiva polja
    const { passwordHash, ...safeData } = userData as any;

    return successResponse({ userId, ...safeData });
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse('Failed to fetch profile', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { displayName, age, gender, weight, height, goal, activityLevel, availableEquipment } = body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (displayName !== undefined) {
      if (typeof displayName !== 'string' || displayName.trim().length < 2) {
        return errorResponse('Display name must be at least 2 characters', 400);
      }
      updates.displayName = displayName.trim();
    }

    if (age !== undefined) {
      const ageNum = Number(age);
      if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
        return errorResponse('Age must be between 13 and 120', 400);
      }
      updates.age = ageNum;
    }

    if (gender !== undefined) {
      if (!Object.values(Gender).includes(gender)) {
        return errorResponse(`Invalid gender. Must be one of: ${Object.values(Gender).join(', ')}`, 400);
      }
      updates.gender = gender;
    }

    if (weight !== undefined) {
      const w = Number(weight);
      if (isNaN(w) || w < 20 || w > 500) return errorResponse('Weight must be between 20 and 500 kg', 400);
      updates.weight = w;
    }

    if (height !== undefined) {
      const h = Number(height);
      if (isNaN(h) || h < 100 || h > 250) return errorResponse('Height must be between 100 and 250 cm', 400);
      updates.height = h;
    }

    if (goal !== undefined) {
      if (!Object.values(FitnessGoal).includes(goal)) {
        return errorResponse(`Invalid goal. Must be one of: ${Object.values(FitnessGoal).join(', ')}`, 400);
      }
      updates.goal = goal;
    }

    if (activityLevel !== undefined) {
      if (!Object.values(ActivityLevel).includes(activityLevel)) {
        return errorResponse(`Invalid activity level`, 400);
      }
      updates.activityLevel = activityLevel;
    }

    if (availableEquipment !== undefined) {
      if (!Array.isArray(availableEquipment)) {
        return errorResponse('availableEquipment must be an array', 400);
      }
      const validEquipment = availableEquipment.filter((e: string) => Object.values(Equipment).includes(e as Equipment));
      updates.availableEquipment = validEquipment;
    }

    if (Object.keys(updates).length === 1) {
      return errorResponse('No valid fields to update', 400);
    }

    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return notFoundResponse('User not found');

    await userRef.update(updates);

    const updatedDoc = await userRef.get();
    const { passwordHash, ...safeData } = updatedDoc.data() as any;

    return successResponse({ userId, ...safeData }, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse('Failed to update profile', 500);
  }
}
