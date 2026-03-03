import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse } from '@/utils/api-response';
import { Meal, MealType } from '@/types/models';

/**
 * @swagger
 * /api/meals:
 *   get:
 *     summary: Get user's meals for a specific date
 *     tags: [Meals]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           example: "2026-03-04"
 *         description: Date in YYYY-MM-DD format (defaults to today)
 *     responses:
 *       200:
 *         description: List of meals and daily totals
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
 *                     meals:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Meal'
 *                     totals:
 *                       type: object
 *                       properties:
 *                         calories:
 *                           type: number
 *                         protein:
 *                           type: number
 *                         carbs:
 *                           type: number
 *                         fat:
 *                           type: number
 *   post:
 *     summary: Log a new meal
 *     tags: [Meals]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - calories
 *               - protein
 *               - carbs
 *               - fat
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Oatmeal with banana"
 *               type:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner, snack]
 *               calories:
 *                 type: number
 *                 example: 350
 *               protein:
 *                 type: number
 *                 example: 12
 *               carbs:
 *                 type: number
 *                 example: 60
 *               fat:
 *                 type: number
 *                 example: 6
 *               quantity:
 *                 type: number
 *                 example: 300
 *               notes:
 *                 type: string
 *               date:
 *                 type: string
 *                 example: "2026-03-04"
 *     responses:
 *       201:
 *         description: Meal logged successfully
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const snapshot = await adminDb
      .collection('meals')
      .where('userId', '==', userId)
      .where('date', '==', date)
      .orderBy('createdAt', 'asc')
      .get();

    const meals: Meal[] = snapshot.docs.map((doc) => ({
      mealId: doc.id,
      ...doc.data(),
    } as Meal));

    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return successResponse({ meals, totals, date });
  } catch (error) {
    console.error('Get meals error:', error);
    return errorResponse('Failed to fetch meals', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { name, type, calories, protein, carbs, fat, quantity, notes, date } = body;

    if (!name || !type || calories === undefined || protein === undefined || carbs === undefined || fat === undefined) {
      return errorResponse('Missing required fields: name, type, calories, protein, carbs, fat', 400);
    }

    if (!Object.values(MealType).includes(type)) {
      return errorResponse(`Invalid meal type. Must be one of: ${Object.values(MealType).join(', ')}`, 400);
    }

    if (calories < 0 || protein < 0 || carbs < 0 || fat < 0) {
      return errorResponse('Nutritional values must be positive numbers', 400);
    }

    const mealDate = date || new Date().toISOString().split('T')[0];

    const newMeal: Omit<Meal, 'mealId'> = {
      userId,
      name,
      type,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
      quantity: quantity ? Number(quantity) : undefined,
      notes: notes || undefined,
      date: mealDate,
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection('meals').add(newMeal);

    return successResponse({ mealId: docRef.id, ...newMeal }, 'Meal logged successfully', 201);
  } catch (error) {
    console.error('Create meal error:', error);
    return errorResponse('Failed to log meal', 500);
  }
}
