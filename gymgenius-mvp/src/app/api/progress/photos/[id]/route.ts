import { NextRequest } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { successResponse, errorResponse, notFoundResponse } from '@/utils/api-response';

/**
 * @swagger
 * /api/progress/photos/{id}:
 *   delete:
 *     summary: Delete a progress photo
 *     tags: [Progress]
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
 *         description: Photo deleted
 *       403:
 *         description: Forbidden - not the owner
 *       404:
 *         description: Photo not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return errorResponse('Unauthorized', 401);

    const { id: photoId } = params;
    const photoRef = adminDb.collection('progressPhotos').doc(photoId);
    const photoDoc = await photoRef.get();

    if (!photoDoc.exists) return notFoundResponse('Photo not found');

    const photoData = photoDoc.data()!;

    // IDOR protection
    if (photoData.userId !== userId) {
      return errorResponse('Forbidden', 403);
    }

    // Delete from Firebase Storage
    try {
      const bucket = adminStorage.bucket();
      const fileRef = bucket.file(photoData.storagePath);
      await fileRef.delete();
    } catch (storageError) {
      console.error('Storage delete error (non-fatal):', storageError);
    }

    // Delete from Firestore
    await photoRef.delete();

    return successResponse(null, 'Photo deleted successfully');
  } catch (error) {
    console.error('Delete progress photo error:', error);
    return errorResponse('Failed to delete photo', 500);
  }
}
