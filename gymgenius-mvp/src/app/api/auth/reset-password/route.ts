import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { successResponse, errorResponse } from '@/utils/api-response';
import { isValidEmail } from '@/utils/validation';

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: Invalid email format
 *       404:
 *         description: User not found
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    if (!isValidEmail(email)) {
      return errorResponse('Invalid email format', 400);
    }

    // Verify user exists in Firebase Auth
    try {
      await adminAuth.getUserByEmail(email);
    } catch {
      // Return generic message for security (don't reveal if email exists)
      return successResponse(null, 'If an account exists with this email, a password reset link has been sent.');
    }

    // Generate password reset link via Firebase Admin
    const resetLink = await adminAuth.generatePasswordResetLink(email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,
    });

    // In production: send resetLink via email (SendGrid, Nodemailer, etc.)
    // For demo: log the link and return success
    console.log(`🔑 Password reset link for ${email}: ${resetLink}`);

    return successResponse(
      null,
      'If an account exists with this email, a password reset link has been sent.'
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse('Failed to process password reset request', 500);
  }
}
