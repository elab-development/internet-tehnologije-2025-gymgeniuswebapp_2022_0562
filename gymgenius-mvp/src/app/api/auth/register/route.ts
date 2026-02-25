import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { isValidEmail, isStrongPassword, sanitizeString } from '@/utils/validation';
import { generateToken } from '@/utils/jwt'; // <-- samo iz jwt.ts
import { User, UserRole } from '@/types/models';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123!
 *               displayName:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, displayName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Password must be at least 8 characters with uppercase, lowercase, number and special character',
        },
        { status: 400 }
      );
    }

    const existingUser = await adminDb
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: displayName ? sanitizeString(displayName) : undefined,
      emailVerified: false,
    });

    const newUser: User = {
      userId: userRecord.uid,
      email: userRecord.email!,
      role: UserRole.USER,
      emailVerified: false,
      displayName: displayName ? sanitizeString(displayName) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await adminDb.collection('users').doc(userRecord.uid).set(newUser);

    const token = await generateToken({
      userId: newUser.userId,
      email: newUser.email,
      role: newUser.role,
    });

    const userPayload = {
      userId: newUser.userId,
      email: newUser.email,
      role: newUser.role,
      displayName: newUser.displayName,
    };

    console.log('✅ Register generated token for user:', userPayload);

    const res = NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: userPayload,
        },
      },
      { status: 201 }
    );

    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    console.error('❌ Registration error:', error);

    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { success: false, error: 'Email already in use' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}