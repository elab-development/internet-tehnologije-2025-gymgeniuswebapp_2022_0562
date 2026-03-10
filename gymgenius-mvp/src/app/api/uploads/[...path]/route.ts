import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs';

/**
 * @swagger
 * /api/uploads/{path}:
 *   get:
 *     summary: Serve uploaded files
 *     tags: [Files]
 *     description: Retrieves uploaded files (images) from the uploads directory. Supports path traversal protection.
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: File path relative to uploads directory (e.g., "photos/user123/image.jpg")
 *         example: "photos/user123/progress-photo.jpg"
 *     responses:
 *       200:
 *         description: File successfully retrieved
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           image/gif:
 *             schema:
 *               type: string
 *               format: binary
 *           image/webp:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Forbidden - Path traversal attempt detected or invalid path
 *       404:
 *         description: File not found
 */

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // Security: prevent path traversal
  const joined = segments.join('/');
  const normalized = path.normalize(joined);
  if (normalized.includes('..') || path.isAbsolute(normalized)) {
    return new Response('Forbidden', { status: 403 });
  }

  const absolutePath = path.join(process.cwd(), 'uploads', normalized);

  if (!fs.existsSync(absolutePath)) {
    return new Response('Not Found', { status: 404 });
  }

  const ext = path.extname(absolutePath).toLowerCase().slice(1);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const fileBuffer = fs.readFileSync(absolutePath);

  return new Response(fileBuffer, {
    headers: { 'Content-Type': contentType },
  });
}
