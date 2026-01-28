// src/utils/auth-helpers.ts

import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import app from '@/lib/firebase';

const auth = getAuth(app);

/**
 * Verifikuje email i password preko Firebase Auth (client SDK)
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error: any) {
    console.error('verifyCredentials error:', error);
    
    // Firebase auth error codes
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      return { success: false, error: 'Invalid email or password' };
    }
    
    return { success: false, error: 'Authentication failed' };
  }
}