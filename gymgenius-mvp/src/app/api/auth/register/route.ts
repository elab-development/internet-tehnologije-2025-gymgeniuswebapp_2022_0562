import { NextRequest } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { successResponse, errorResponse } from '@/utils/api-response';
import { isValidEmail, isStrongPassword, sanitizeString } from '@/utils/validation';
import { generateToken } from '@/utils/jwt';
import { User, UserRole } from '@/types/models';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();
    const { email, password, displayName } = body;

    // 2. Validacija inputa
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    if (!isValidEmail(email)) {
      return errorResponse('Invalid email format', 400);
    }

    if (!isStrongPassword(password)) {
      return errorResponse(
        'Password must be at least 8 characters with uppercase, lowercase, number and special character',
        400
      );
    }

    // 3. Proveri da li korisnik već postoji
    const existingUser = await adminDb
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return errorResponse('User with this email already exists', 409);
    }

    // 4. Kreiraj korisnika u Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: displayName ? sanitizeString(displayName) : undefined,
      emailVerified: false, // U produkciji bi slali verification email
    });

    // 5. Kreiraj User dokument u Firestore
    const newUser: User = {
      userId: userRecord.uid,
      email: userRecord.email!,
      role: UserRole.USER, // Default role
      emailVerified: false,
      displayName: displayName ? sanitizeString(displayName) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await adminDb.collection('users').doc(userRecord.uid).set(newUser);

    // 6. Generiši JWT token
    const token = generateToken({
      userId: userRecord.uid,
      email: newUser.email,
      role: newUser.role,
    });

    // 7. Vrati odgovor sa tokenom i user podacima
    return successResponse(
      {
        token,
        user: {
          userId: newUser.userId,
          email: newUser.email,
          role: newUser.role,
          displayName: newUser.displayName,
        },
      },
      'User registered successfully',
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Firebase specifične greške
    if (error.code === 'auth/email-already-exists') {
      return errorResponse('Email already in use', 409);
    }
    
    return errorResponse('Registration failed', 500);
  }
}