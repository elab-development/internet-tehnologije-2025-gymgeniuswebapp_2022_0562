// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  console.log('ADMIN PROJECT ID:', process.env.FIREBASE_ADMIN_PROJECT_ID);
  console.log('ADMIN CLIENT EMAIL:', process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  console.log('ADMIN PRIVATE KEY DEFINED:', !!process.env.FIREBASE_ADMIN_PRIVATE_KEY);

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export default admin;