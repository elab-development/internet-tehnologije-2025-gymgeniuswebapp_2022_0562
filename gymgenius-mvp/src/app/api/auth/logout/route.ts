import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
    const res = NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
        data: { message: 'Logged out successfully' },
      },
      { status: 200 }
    );

    res.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return res;
  } catch (error) {
    console.error('❌ Logout error:', error);

    const res = NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );

    res.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return res;
  }
}