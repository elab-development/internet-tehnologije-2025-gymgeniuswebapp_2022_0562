import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse } from '@/utils/api-response';
import { isValidEmail } from '@/utils/validation';
import { generateToken } from '@/utils/jwt';
import { verifyCredentials } from '@/utils/auth-helpers';


export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();
    const { email, password } = body;

    // 2. Validacija
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    if (!isValidEmail(email)) {
      return errorResponse('Invalid email format', 400);
    }

    // 3. Firebase nema built-in password verification na server-side
    // Moramo koristiti Firebase Client SDK ili custom implementaciju
    // Za MVP, koristimo workaround sa Firebase Admin
    
    // Prvo pronađi korisnika po email-u
    const userSnapshot = await adminDb
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return errorResponse('Invalid credentials', 401);
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // 4. Verifikuj da korisnik postoji u Firebase Auth
    const verification = await verifyCredentials(email, password);

    if (!verification.success) {
        return errorResponse(verification.error || 'Invalid credentials', 401);
    }

    // NAPOMENA: U produkciji bi koristili Firebase Client SDK
    // za verifikaciju lozinke ili implementirali bcrypt hash
    // Za MVP, pretpostavljamo da je lozinka validna ako korisnik postoji

    // 5. Generiši JWT token
    const token = generateToken({
      userId: userData.userId,
      email: userData.email,
      role: userData.role,
    });

    // 6. Ažuriraj lastLogin timestamp
    await adminDb.collection('users').doc(userData.userId).update({
      lastLogin: new Date(),
    });

    // 7. Vrati odgovor
    return successResponse({
      token,
      user: {
        userId: userData.userId,
        email: userData.email,
        role: userData.role,
        displayName: userData.displayName,
      },
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Login failed', 500);
  }
}