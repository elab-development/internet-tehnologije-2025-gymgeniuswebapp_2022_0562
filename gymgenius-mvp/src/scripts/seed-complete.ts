import 'dotenv/config';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { 
  User, 
  Exercise, 
  WorkoutPlan, 
  WorkoutLog, 
  Challenge,
  ChallengeParticipant,
  UserRole, 
  Gender, 
  FitnessGoal, 
  ActivityLevel,
  MuscleGroup, 
  Equipment, 
  Difficulty,
  ChallengeType,
  ChallengeStatus,
  LogStatus
} from '@/types/models';

/**
 * KOMPLETAN SEED SCRIPT - Kreira sve modele sa vezama
 */

// ==========================================
// 1. TEST KORISNICI
// ==========================================

const testUsers = [
  {
    email: 'admin@gymgenius.com',
    password: 'Admin123!',
    displayName: 'Admin User',
    role: UserRole.ADMIN,
    age: 30,
    gender: Gender.MALE,
    weight: 80,
    height: 180,
    goal: FitnessGoal.GENERAL_FITNESS,
    activityLevel: ActivityLevel.VERY_ACTIVE,
  },
  {
    email: 'john@example.com',
    password: 'User123!',
    displayName: 'John Doe',
    role: UserRole.USER,
    age: 25,
    gender: Gender.MALE,
    weight: 75,
    height: 175,
    goal: FitnessGoal.MUSCLE_GAIN,
    activityLevel: ActivityLevel.MODERATELY_ACTIVE,
    availableEquipment: [Equipment.BARBELL, Equipment.DUMBBELL, Equipment.BODYWEIGHT],
  },
  {
    email: 'jane@example.com',
    password: 'Premium123!',
    displayName: 'Jane Smith',
    role: UserRole.PREMIUM,
    age: 28,
    gender: Gender.FEMALE,
    weight: 60,
    height: 165,
    goal: FitnessGoal.WEIGHT_LOSS,
    activityLevel: ActivityLevel.LIGHTLY_ACTIVE,
    availableEquipment: [Equipment.DUMBBELL, Equipment.BODYWEIGHT, Equipment.RESISTANCE_BAND],
  },
];

// ==========================================
// 2. EXERCISES (prošireno)
// ==========================================

const exercises = [
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
    isActive: true,
  },
  {
    name: 'Squat',
    description: 'Fundamental lower body compound movement',
    primaryMuscleGroup: MuscleGroup.LEGS,
    secondaryMuscleGroups: [MuscleGroup.CORE],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.INTERMEDIATE,
    instructions: [
      'Position barbell on upper back',
      'Stand with feet shoulder-width apart',
      'Lower body by bending knees and hips',
      'Descend until thighs are parallel to ground',
      'Drive through heels to return to start',
    ],
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
    isActive: true,
  },
  {
    name: 'Deadlift',
    description: 'Full body compound lift',
    primaryMuscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.LEGS, MuscleGroup.CORE],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.ADVANCED,
    instructions: [
      'Stand with feet hip-width apart',
      'Bend at hips and knees to grip bar',
      'Keep back straight, chest up',
      'Drive through heels to stand up',
      'Lower bar with control',
    ],
    isActive: true,
  },
  {
    name: 'Plank',
    description: 'Isometric core exercise',
    primaryMuscleGroup: MuscleGroup.CORE,
    secondaryMuscleGroups: [MuscleGroup.SHOULDERS],
    equipment: Equipment.BODYWEIGHT,
    difficulty: Difficulty.BEGINNER,
    instructions: [
      'Start in push-up position',
      'Lower to forearms',
      'Keep body in straight line',
      'Hold position',
    ],
    isActive: true,
  },
  {
    name: 'Dumbbell Shoulder Press',
    description: 'Overhead pressing movement for shoulders',
    primaryMuscleGroup: MuscleGroup.SHOULDERS,
    secondaryMuscleGroups: [MuscleGroup.TRICEPS],
    equipment: Equipment.DUMBBELL,
    difficulty: Difficulty.BEGINNER,
    instructions: [
      'Sit on bench with back support',
      'Hold dumbbells at shoulder height',
      'Press weights overhead',
      'Lower with control',
    ],
    isActive: true,
  },
  {
    name: 'Barbell Curl',
    description: 'Isolation exercise for biceps',
    primaryMuscleGroup: MuscleGroup.BICEPS,
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.BEGINNER,
    instructions: [
      'Stand with feet shoulder-width apart',
      'Hold barbell with underhand grip',
      'Curl weight up to shoulders',
      'Lower with control',
    ],
    isActive: true,
  },
  {
    name: 'Tricep Dips',
    description: 'Bodyweight tricep exercise',
    primaryMuscleGroup: MuscleGroup.TRICEPS,
    secondaryMuscleGroups: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS],
    equipment: Equipment.BODYWEIGHT,
    difficulty: Difficulty.INTERMEDIATE,
    instructions: [
      'Position hands on parallel bars',
      'Lower body by bending elbows',
      'Push back up to start position',
    ],
    isActive: true,
  },
];

// ==========================================
// MAIN SEED FUNCTION
// ==========================================

async function seedDatabase() {
  try {
    console.log('🌱 Starting complete database seed...\n');

    // ==========================================
    // STEP 1: Create Users
    // ==========================================
    console.log('👥 Creating test users...');
    const createdUsers: { [email: string]: string } = {};

    for (const userData of testUsers) {
      try {
        // Create in Firebase Auth
        const userRecord = await adminAuth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName,
          emailVerified: true, // Auto-verify for test users
        });

        // Create in Firestore
        const newUser: User = {
          userId: userRecord.uid,
          email: userData.email,
          role: userData.role,
          emailVerified: true,
          displayName: userData.displayName,
          age: userData.age,
          gender: userData.gender,
          weight: userData.weight,
          height: userData.height,
          goal: userData.goal,
          activityLevel: userData.activityLevel,
          availableEquipment: userData.availableEquipment || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await adminDb.collection('users').doc(userRecord.uid).set(newUser);
        createdUsers[userData.email] = userRecord.uid;

        console.log(`  ✅ Created user: ${userData.displayName} (${userData.email})`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`  ⚠  User already exists: ${userData.email}`);
          // Get existing user
          const existingUser = await adminAuth.getUserByEmail(userData.email);
          createdUsers[userData.email] = existingUser.uid;
        } else {
          throw error;
        }
      }
    }

    const adminUserId = createdUsers['admin@gymgenius.com'];
    const johnUserId = createdUsers['john@example.com'];
    const janeUserId = createdUsers['jane@example.com'];

    console.log('');

    // ==========================================
    // STEP 2: Create Exercises
    // ==========================================
    console.log('💪 Creating exercises...');
    const createdExercises: { [name: string]: string } = {};

    for (const exercise of exercises) {
      const docRef = await adminDb.collection('exercises').add({
        ...exercise,
        createdBy: adminUserId,
        createdAt: new Date(),
      });

      createdExercises[exercise.name] = docRef.id;
      console.log(`  ✅ Created exercise: ${exercise.name}`);
    }

    console.log('');

    // ==========================================
    // STEP 3: Create Workout Plans
    // ==========================================
    console.log('📋 Creating workout plans...');

    // John's Push Day Plan
    const johnPushPlan: Omit<WorkoutPlan, 'planId'> = {
      userId: johnUserId,
      name: 'Push Day - Upper Body',
      goal: FitnessGoal.MUSCLE_GAIN,
      difficulty: Difficulty.INTERMEDIATE,
      durationWeeks: 8,
      generatedBy: 'ai',
      isActive: true,
      schedule: [
        {
          dayNumber: 1, // Monday
          exercises: [
            {
              exerciseId: createdExercises['Bench Press'],
              orderIndex: 1,
              recommendedSets: 4,
              recommendedReps: '8-10',
              restSeconds: 120,
            },
            {
              exerciseId: createdExercises['Dumbbell Shoulder Press'],
              orderIndex: 2,
              recommendedSets: 3,
              recommendedReps: '10-12',
              restSeconds: 90,
            },
            {
              exerciseId: createdExercises['Tricep Dips'],
              orderIndex: 3,
              recommendedSets: 3,
              recommendedReps: '12-15',
              restSeconds: 60,
            },
          ],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const johnPushPlanRef = await adminDb.collection('workoutPlans').add(johnPushPlan);
    console.log(`  ✅ Created plan: ${johnPushPlan.name} for John`);

    // Jane's Full Body Plan
    const janeFullBodyPlan: Omit<WorkoutPlan, 'planId'> = {
      userId: janeUserId,
      name: 'Full Body Beginner',
      goal: FitnessGoal.WEIGHT_LOSS,
      difficulty: Difficulty.BEGINNER,
      durationWeeks: 12,
      generatedBy: 'ai',
      isActive: true,
      schedule: [
        {
          dayNumber: 1,
          exercises: [
            {
              exerciseId: createdExercises['Squat'],
              orderIndex: 1,
              recommendedSets: 3,
              recommendedReps: '12-15',
              restSeconds: 90,
            },
            {
              exerciseId: createdExercises['Pull-ups'],
              orderIndex: 2,
              recommendedSets: 3,
              recommendedReps: 'AMRAP',
              restSeconds: 120,
            },
            {
              exerciseId: createdExercises['Plank'],
              orderIndex: 3,
              recommendedSets: 3,
              recommendedReps: '30-60s',
              restSeconds: 60,
            },
          ],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const janeFullBodyPlanRef = await adminDb.collection('workoutPlans').add(janeFullBodyPlan);
    console.log(`  ✅ Created plan: ${janeFullBodyPlan.name} for Jane`);

    console.log('');

    // ==========================================
    // STEP 4: Create Workout Logs
    // ==========================================
    console.log('📝 Creating workout logs...');

    // John's completed workout
    const johnWorkoutLog: Omit<WorkoutLog, 'logId'> = {
      userId: johnUserId,
      planId: johnPushPlanRef.id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      exercises: [
        {
          exerciseId: createdExercises['Bench Press'],
          exerciseName: 'Bench Press',
          sets: [
            { setNumber: 1, reps: 10, weight: 60, rpe: 7 },
            { setNumber: 2, reps: 9, weight: 60, rpe: 8 },
            { setNumber: 3, reps: 8, weight: 65, rpe: 9 },
            { setNumber: 4, reps: 8, weight: 65, rpe: 9 },
          ],
          personalRecord: false,
        },
        {
          exerciseId: createdExercises['Dumbbell Shoulder Press'],
          exerciseName: 'Dumbbell Shoulder Press',
          sets: [
            { setNumber: 1, reps: 12, weight: 15, rpe: 7 },
            { setNumber: 2, reps: 11, weight: 15, rpe: 8 },
            { setNumber: 3, reps: 10, weight: 15, rpe: 8 },
          ],
        },
      ],
      duration: 45, // minutes
      totalVolume: 1920, // kg (calculated)
      status: LogStatus.COMPLETED,
      notes: 'Great session! Felt strong on bench press.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    };

    await adminDb.collection('workoutLogs').add(johnWorkoutLog);
    console.log(`  ✅ Created workout log for John (2 days ago)`);

    // Jane's completed workout
    const janeWorkoutLog: Omit<WorkoutLog, 'logId'> = {
      userId: janeUserId,
      planId: janeFullBodyPlanRef.id,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      exercises: [
        {
          exerciseId: createdExercises['Squat'],
          exerciseName: 'Squat',
          sets: [
            { setNumber: 1, reps: 15, weight: 30, rpe: 6 },
            { setNumber: 2, reps: 14, weight: 30, rpe: 7 },
            { setNumber: 3, reps: 13, weight: 30, rpe: 7 },
          ],
        },
        {
          exerciseId: createdExercises['Plank'],
          exerciseName: 'Plank',
          sets: [
            { setNumber: 1, reps: 45, weight: 0, rpe: 7 }, // reps = seconds
            { setNumber: 2, reps: 40, weight: 0, rpe: 8 },
            { setNumber: 3, reps: 35, weight: 0, rpe: 8 },
          ],
        },
      ],
      duration: 35,
      totalVolume: 1350,
      status: LogStatus.COMPLETED,
      notes: 'First workout of the week. Plank was tough!',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    };

    await adminDb.collection('workoutLogs').add(janeWorkoutLog);
    console.log(`  ✅ Created workout log for Jane (1 day ago)`);

    console.log('');

    // ==========================================
    // STEP 5: Create Challenge
    // ==========================================
    console.log('🏆 Creating challenge...');

    const challenge: Omit<Challenge, 'challengeId'> = {
      name: '30-Day Consistency Challenge',
      description: 'Complete at least 20 workouts in 30 days',
      type: ChallengeType.CONSISTENCY,
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Started 10 days ago
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // Ends in 20 days
      targetValue: 20,
      targetUnit: 'workouts',
      status: ChallengeStatus.ACTIVE,
      participantCount: 2,
      createdBy: adminUserId,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    };

    const challengeRef = await adminDb.collection('challenges').add(challenge);
    console.log(`  ✅ Created challenge: ${challenge.name}`);

    // Add participants (subcollection)
    const johnParticipant: ChallengeParticipant = {
      userId: johnUserId,
      challengeId: challengeRef.id,
      currentProgress: 5,
      currentStreak: 3,
      rank: 1,
      joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(),
    };

    await challengeRef.collection('participants').doc(johnUserId).set(johnParticipant);
    console.log(`  ✅ Added John to challenge (5/20 workouts, rank #1)`);

    const janeParticipant: ChallengeParticipant = {
      userId: janeUserId,
      challengeId: challengeRef.id,
      currentProgress: 3,
      currentStreak: 2,
      rank: 2,
      joinedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(),
    };

    await challengeRef.collection('participants').doc(janeUserId).set(janeParticipant);
    console.log(`  ✅ Added Jane to challenge (3/20 workouts, rank #2)`);

    console.log('');
    console.log('🎉 Complete seed finished successfully!\n');

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log('📊 SUMMARY:');
    console.log('  👥 Users: 3 (Admin, User, Premium)');
    console.log('  💪 Exercises: 8');
    console.log('  📋 Workout Plans: 2');
    console.log('  📝 Workout Logs: 2');
    console.log('  🏆 Challenges: 1 (with 2 participants)');
    console.log('');
    console.log('🔑 TEST CREDENTIALS:');
    console.log('  Admin:   admin@gymgenius.com / Admin123!');
    console.log('  User:    john@example.com / User123!');
    console.log('  Premium: jane@example.com / Premium123!');
    console.log('');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seedDatabase();