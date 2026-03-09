import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs';

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
