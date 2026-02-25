import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse, notFoundResponse } from '@/utils/api-response';

/**
 * @swagger
 * /api/exercises/{id}:
 *   get:
 *     summary: Get exercise by ID
 *     tags: [Exercises]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exercise ID
 *     responses:
 *       200:
 *         description: Exercise details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Exercise'
 *       404:
 *         description: Exercise not found
 *   put:
 *     summary: Update exercise (Admin only)
 *     tags: [Exercises]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               difficulty:
 *                 type: string
 *     responses:
 *       200:
 *         description: Exercise updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exercise not found
 *   delete:
 *     summary: Delete exercise (Admin only)
 *     tags: [Exercises]
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
 *         description: Exercise deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exercise not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exerciseDoc = await adminDb.collection('exercises').doc(id).get();

    if (!exerciseDoc.exists) {
      return notFoundResponse('Exercise not found');
    }

    return successResponse({
      exerciseId: exerciseDoc.id,
      ...exerciseDoc.data(),
    });
  } catch (error) {
    console.error('Get exercise error:', error);
    return errorResponse('Failed to fetch exercise', 500);
  }
}

/**
 * PUT /api/exercises/[id]
 * Ažurira postojeću vežbu (samo admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Proveri admin pristup
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'admin') {
      return errorResponse('Forbidden - Admin access required', 403);
    }

    const body = await request.json();

    // Proveri da li vežba postoji
    const exerciseRef = adminDb.collection('exercises').doc(id);
    const exerciseDoc = await exerciseRef.get();

    if (!exerciseDoc.exists) {
      return notFoundResponse('Exercise not found');
    }

    // Ažuriraj samo prosleđena polja
    const updateData: any = {};

    if (body.name) updateData.name = body.name;
    if (body.description) updateData.description = body.description;
    if (body.primaryMuscleGroup) updateData.primaryMuscleGroup = body.primaryMuscleGroup;
    if (body.secondaryMuscleGroups) updateData.secondaryMuscleGroups = body.secondaryMuscleGroups;
    if (body.equipment) updateData.equipment = body.equipment;
    if (body.difficulty) updateData.difficulty = body.difficulty;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;
    if (body.thumbnailUrl !== undefined) updateData.thumbnailUrl = body.thumbnailUrl;
    if (body.instructions) updateData.instructions = body.instructions;

    await exerciseRef.update(updateData);

    // Vrati ažurirani dokument
    const updatedDoc = await exerciseRef.get();

    return successResponse({
      exerciseId: updatedDoc.id,
      ...updatedDoc.data(),
    }, 'Exercise updated successfully');
  } catch (error) {
    console.error('Update exercise error:', error);
    return errorResponse('Failed to update exercise', 500);
  }
}

/**
 * DELETE /api/exercises/[id]
 * Briše vežbu (soft delete - postavlja isActive na false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Proveri admin pristup
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'admin') {
      return errorResponse('Forbidden - Admin access required', 403);
    }

    const exerciseRef = adminDb.collection('exercises').doc(id);
    const exerciseDoc = await exerciseRef.get();

    if (!exerciseDoc.exists) {
      return notFoundResponse('Exercise not found');
    }

    // Soft delete - ne brišemo fizički, već postavljamo isActive na false
    await exerciseRef.update({
      isActive: false,
      deletedAt: new Date(),
    });

    return successResponse(
      { message: 'Exercise deleted successfully' },
      'Exercise deleted successfully'
    );
  } catch (error) {
    console.error('Delete exercise error:', error);
    return errorResponse('Failed to delete exercise', 500);
  }
}