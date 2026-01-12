import 'dotenv/config'; // this will load .env automatically
import { adminDb } from '@/lib/firebase-admin';
import { Exercise, MuscleGroup, Equipment, Difficulty } from '@/types/models';

const seedExercises: Omit<Exercise, 'exerciseId'>[] = [
  {
    name: 'Bench Press',
    description: 'Compound chest exercise using barbell',
    primaryMuscleGroup: MuscleGroup.CHEST,
    secondaryMuscleGroups: [MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.INTERMEDIATE,
    instructions: [
      'Lie flat on bench with feet on floor',
      'Grip barbell slightly wider than shoulder width',
      'Lower bar to mid-chest',
      'Press bar up until arms are extended',
    ],
    createdBy: 'system',
    createdAt: new Date(),
    isActive: true,
  },
  {
    name: 'Squat',
    description: 'Fundamental lower body compound movement',
    primaryMuscleGroup: MuscleGroup.LEGS,
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.INTERMEDIATE,
    instructions: [
      'Position barbell on upper back',
      'Stand with feet shoulder-width apart',
      'Lower body by bending knees and hips',
      'Descend until thighs are parallel to ground',
      'Drive through heels to return to start',
    ],
    createdBy: 'system',
    createdAt: new Date(),
    isActive: true,
  },
  {
    name: 'Pull-ups',
    description: 'Bodyweight back exercise',
    primaryMuscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.BICEPS],
    equipment: Equipment.BODYWEIGHT,
    difficulty: Difficulty.INTERMEDIATE,
    instructions: [
      'Hang from bar with overhand grip',
      'Pull body up until chin is above bar',
      'Lower with control to full extension',
    ],
    createdBy: 'system',
    createdAt: new Date(),
    isActive: true,
  },
  {
    name: 'Deadlift',
    description: 'Full body compound lift',
    primaryMuscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.LEGS],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.ADVANCED,
    instructions: [
      'Stand with feet hip-width apart',
      'Bend at hips and knees to grip bar',
      'Keep back straight, chest up',
      'Drive through heels to stand up',
      'Lower bar with control',
    ],
    createdBy: 'system',
    createdAt: new Date(),
    isActive: true,
  },
  {
    name: 'Plank',
    description: 'Isometric core exercise',
    primaryMuscleGroup: MuscleGroup.CORE,
    equipment: Equipment.BODYWEIGHT,
    difficulty: Difficulty.BEGINNER,
    instructions: [
      'Start in push-up position',
      'Lower to forearms',
      'Keep body in straight line',
      'Hold position',
    ],
    createdBy: 'system',
    createdAt: new Date(),
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Seed exercises
    const exercisesRef = adminDb.collection('exercises');
    
    for (const exercise of seedExercises) {
      const docRef = await exercisesRef.add(exercise);
      console.log(`✅ Added exercise: ${exercise.name} (${docRef.id})`);
    }

    console.log('🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  }
}

seedDatabase();