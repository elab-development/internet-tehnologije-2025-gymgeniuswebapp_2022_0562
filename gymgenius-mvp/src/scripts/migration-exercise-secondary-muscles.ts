import { adminDb } from '@/lib/firebase-admin';

/**
 * Migracija: Dodavanje 'secondaryMuscleGroups' array polja u Exercise
 * 
 * Tip migracije: IZMENA POSTOJEĆE KOLONE / DODAVANJE POLJA
 */
async function addSecondaryMuscleGroups() {
  try {
    console.log('🔄 Starting migration: Add secondaryMuscleGroups to exercises...');

    const exercisesRef = adminDb.collection('exercises');
    const snapshot = await exercisesRef.get();

    if (snapshot.empty) {
      console.log('⚠  No exercises found');
      return;
    }

    const batch = adminDb.batch();
    let count = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Dodaj secondaryMuscleGroups ako ne postoji
      if (!data.secondaryMuscleGroups) {
        batch.update(doc.ref, {
          secondaryMuscleGroups: [], // Prazan array kao default
        });
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
      console.log(`✅ Migration completed: Updated ${count} exercises`);
    } else {
      console.log('ℹ  All exercises already have secondaryMuscleGroups field');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

addSecondaryMuscleGroups();