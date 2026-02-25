import { NextRequest } from 'next/server';
import { syncWgerExercisesToFirestore } from '@/lib/wger';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse, forbiddenResponse } from '@/utils/api-response';

/**
 * @swagger
 * /api/wger/sync:
 *   post:
 *     summary: Sync Wger exercises to Firestore (Admin only)
 *     tags: [Wger]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit:
 *                 type: number
 *                 example: 100
 *     responses:
 *       200:
 *         description: Sync completed
 *       403:
 *         description: Forbidden - Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');

    if (userRole !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    const body = await request.json();
    const limit = body?.limit || 100;

    console.log(`🔄 Admin ${userId} initiated Wger sync (limit: ${limit})`);

    // Sync from Wger
    const syncResult = await syncWgerExercisesToFirestore(limit);

    if (!syncResult.success) {
      return errorResponse(syncResult.error || 'Sync failed', 500);
    }

    // Save to Firestore
    const batch = adminDb.batch();
    let savedCount = 0;

    for (const exercise of syncResult.exercises || []) {
      // Check if exercise already exists (by wgerId)
      const existingSnapshot = await adminDb
        .collection('exercises')
        .where('wgerId', '==', exercise.wgerId)
        .limit(1)
        .get();

      if (existingSnapshot.empty) {
        const docRef = adminDb.collection('exercises').doc();
        batch.set(docRef, exercise);
        savedCount++;
      }
    }

    await batch.commit();

    console.log(`✅ Synced ${savedCount} new exercises from Wger`);

    return successResponse(
      {
        synced: savedCount,
        total: syncResult.count,
        message: `Successfully synced ${savedCount} new exercises from Wger`,
      },
      'Wger sync completed'
    );
  } catch (error) {
    console.error('Wger sync error:', error);
    return errorResponse('Failed to sync Wger exercises', 500);
  }
}
