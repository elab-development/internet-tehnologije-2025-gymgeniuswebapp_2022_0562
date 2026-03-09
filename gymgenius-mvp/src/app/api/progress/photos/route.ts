import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse } from '@/utils/api-response';
import { PhotoCategory } from '@/types/models';
import path from 'path';
import fs from 'fs';

/**
 * @swagger
 * /api/progress/photos:
 *   get:
 *     summary: Get user's progress photos
 *     tags: [Progress]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of progress photos
 *   post:
 *     summary: Upload a progress photo
 *     tags: [Progress]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *               category:
 *                 type: string
 *                 enum: [front, back, side, other]
 *               notes:
 *                 type: string
 *               date:
 *                 type: string
 *     responses:
 *       201:
 *         description: Photo uploaded successfully
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return errorResponse('Unauthorized', 401);

    const snapshot = await adminDb
      .collection('progressPhotos')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(50)
      .get();

    const photos = snapshot.docs.map((doc) => ({ photoId: doc.id, ...doc.data() }));

    return successResponse({ photos });
  } catch (error) {
    console.error('Get progress photos error:', error);
    return errorResponse('Failed to fetch progress photos', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return errorResponse('Unauthorized', 401);

    const formData = await request.formData();
    const file = formData.get('photo') as File | null;
    const category = (formData.get('category') as string) || PhotoCategory.OTHER;
    const notes = (formData.get('notes') as string) || '';
    const date = (formData.get('date') as string) || new Date().toISOString().split('T')[0];

    if (!file) return errorResponse('Photo file is required', 400);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return errorResponse('Only image files are allowed', 400);
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse('File size must be less than 5MB', 400);
    }

    // Validate category
    if (!Object.values(PhotoCategory).includes(category as PhotoCategory)) {
      return errorResponse(`Invalid category. Must be one of: ${Object.values(PhotoCategory).join(', ')}`, 400);
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to local filesystem (uploads/ - served via /api/uploads/)
    const photoId = crypto.randomUUID();
    const ext = (file.type.split('/')[1] || 'jpg').replace(/\+.*$/, '');
    const storagePath = `progress-photos/${userId}/${photoId}.${ext}`;
    const absoluteDir = path.join(process.cwd(), 'uploads', 'progress-photos', userId);
    const absolutePath = path.join(absoluteDir, `${photoId}.${ext}`);
    const url = `/api/uploads/${storagePath}`;

    fs.mkdirSync(absoluteDir, { recursive: true });
    fs.writeFileSync(absolutePath, buffer);

    // Save metadata to Firestore
    const photoData = {
      userId,
      url,
      storagePath,
      category,
      notes: notes.trim() || null,
      date,
      createdAt: new Date(),
    };

    await adminDb.collection('progressPhotos').doc(photoId).set(photoData);

    return successResponse({ photoId, ...photoData }, 'Photo uploaded successfully');
  } catch (error) {
    console.error('Upload progress photo error:', error);
    return errorResponse('Failed to upload photo', 500);
  }
}
