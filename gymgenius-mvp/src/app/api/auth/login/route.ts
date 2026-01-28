import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { isValidEmail } from '@/utils/validation';
import { generateToken } from '@/utils/jwt'; // <-- samo iz jwt.ts
import { verifyCredentials } from '@/utils/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

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

    const userSnapshot = await adminDb
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    const verification = await verifyCredentials(email, password);

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = await generateToken({
      userId: userData.userId,
      email: userData.email,
      role: userData.role,
    });

    await adminDb.collection('users').doc(userData.userId).update({
      lastLogin: new Date(),
    });

    const userPayload = {
      userId: userData.userId,
      email: userData.email,
      role: userData.role,
      displayName: userData.displayName,
    };

    console.log('✅ Login generated token for user:', userPayload);

    const res = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: userPayload,
        },
      },
      { status: 200 }
    );

    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}