import { adminDb } from '@/lib/firebase-admin';

/**
 * Migracija: Dodavanje 'lastLogin' polja u sve User dokumente
 * 
 * Tip migracije: DODAVANJE KOLONE
 */
async function addLastLoginField() {
  try {
    console.log('🔄 Starting migration: Add lastLogin field to users...');

    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.get();

    if (snapshot.empty) {
      console.log('⚠  No users found');
      return;
    }

    const batch = adminDb.batch();
    let count = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Dodaj lastLogin samo ako ne postoji
      if (!data.lastLogin) {
        batch.update(doc.ref, {
          lastLogin: null,
          updatedAt: new Date(),
        });
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
      console.log(`✅ Migration completed: Updated ${count} users`);
    } else {
      console.log('ℹ  All users already have lastLogin field');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

addLastLoginField();