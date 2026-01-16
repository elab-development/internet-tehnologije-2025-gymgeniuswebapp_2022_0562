import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, unauthorizedResponse } from '@/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    // Middleware je već verifikovao token i dodao user info u headers
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return unauthorizedResponse();
    }

    // Učitaj korisnika iz Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return unauthorizedResponse('User not found');
    }

    const userData = userDoc.data();

    // Ne vraćaj osetljive podatke
    const { passwordHash, ...safeUserData } = userData as any;

    return successResponse(safeUserData);
  } catch (error) {
    console.error('Get current user error:', error);
    return unauthorizedResponse('Failed to fetch user data');
  }
}