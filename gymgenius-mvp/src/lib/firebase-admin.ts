import admin from "firebase-admin";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (projectId && clientEmail && privateKey) {
  privateKey = privateKey.replace(/\\n/g, "\n");
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
} else if (process.env.NEXT_PHASE !== "phase-production-build") {
  // Bacamo grešku samo u runtime, ne tokom `next build`
  throw new Error(
    "Missing Firebase Admin environment variables. " +
      "Check FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY."
  );
}

export const adminDb = admin.apps.length ? admin.firestore() : null!;
export const adminAuth = admin.apps.length ? admin.auth() : null!;
export const adminStorage = admin.apps.length ? admin.storage() : null!;
