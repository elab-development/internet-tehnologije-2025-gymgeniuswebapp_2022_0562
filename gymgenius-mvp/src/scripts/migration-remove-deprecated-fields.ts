import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Migracija: Uklanjanje zastarelih polja iz kolekcija
 *
 * Tip migracije: BRISANJE KOLONE (polja)
 *
 * Uklanja:
 *   - 'wgerCacheTimestamp' iz exercises (zaostalo od starijeg Wger sync mehanizma)
 *   - 'legacyGoal' iz users (staro polje zamenjeno sa FitnessGoal enumom)
 */
async function removeDeprecatedFields() {
  console.log('🔄 Starting migration: Remove deprecated fields...');

  // 1. Ukloni 'wgerCacheTimestamp' iz exercises
  try {
    const exercisesRef = adminDb.collection('exercises');
    const exerciseSnapshot = await exercisesRef.get();

    if (!exerciseSnapshot.empty) {
      const batch = adminDb.batch();
      let count = 0;

      exerciseSnapshot.forEach((doc) => {
        if (doc.data().wgerCacheTimestamp !== undefined) {
          batch.update(doc.ref, { wgerCacheTimestamp: FieldValue.delete() });
          count++;
        }
      });

      if (count > 0) {
        await batch.commit();
        console.log(`✅ Exercises: Removed 'wgerCacheTimestamp' from ${count} documents`);
      } else {
        console.log('ℹ  Exercises: No documents with wgerCacheTimestamp found (already clean)');
      }
    }
  } catch (error) {
    console.error('❌ Failed to migrate exercises:', error);
  }

  // 2. Ukloni 'legacyGoal' iz users
  try {
    const usersRef = adminDb.collection('users');
    const userSnapshot = await usersRef.get();

    if (!userSnapshot.empty) {
      const batch = adminDb.batch();
      let count = 0;

      userSnapshot.forEach((doc) => {
        if (doc.data().legacyGoal !== undefined) {
          batch.update(doc.ref, { legacyGoal: FieldValue.delete() });
          count++;
        }
      });

      if (count > 0) {
        await batch.commit();
        console.log(`✅ Users: Removed 'legacyGoal' from ${count} documents`);
      } else {
        console.log('ℹ  Users: No documents with legacyGoal found (already clean)');
      }
    }
  } catch (error) {
    console.error('❌ Failed to migrate users:', error);
  }

  console.log('✅ Migration completed: Remove deprecated fields');
}

removeDeprecatedFields();
