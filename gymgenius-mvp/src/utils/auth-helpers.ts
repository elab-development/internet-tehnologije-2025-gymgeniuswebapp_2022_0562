import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * Verifikuje korisničke kredencijale koristeći Firebase Client SDK
 * NAPOMENA: Ova funkcija se izvršava na serveru, ali koristi client SDK
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; uid?: string; error?: string }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      uid: userCredential.user.uid,
    };
  } catch (error: any) {
    console.error('Credential verification failed:', error.code);
    
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      return { success: false, error: 'Invalid credentials' };
    }
    
    return { success: false, error: 'Authentication failed' };
  }
}