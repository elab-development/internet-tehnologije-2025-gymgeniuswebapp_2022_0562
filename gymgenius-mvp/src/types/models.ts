// ==========================================
// ENUMS - Definišu dozvoljene vrednosti
// ==========================================

export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  PREMIUM = 'premium',
  ADMIN = 'admin'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export enum FitnessGoal {
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  STRENGTH = 'strength',
  ENDURANCE = 'endurance',
  GENERAL_FITNESS = 'general_fitness'
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',       // Malo ili nimalo vežbanja
  LIGHTLY_ACTIVE = 'lightly_active', // 1-3 dana nedeljno
  MODERATELY_ACTIVE = 'moderately_active', // 3-5 dana
  VERY_ACTIVE = 'very_active',   // 6-7 dana
  EXTRA_ACTIVE = 'extra_active'  // Fizički posao + trening
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  LEGS = 'legs',
  CORE = 'core',
  CARDIO = 'cardio'
}

export enum Equipment {
  BARBELL = 'barbell',
  DUMBBELL = 'dumbbell',
  MACHINE = 'machine',
  BODYWEIGHT = 'bodyweight',
  RESISTANCE_BAND = 'resistance_band',
  KETTLEBELL = 'kettlebell',
  CABLE = 'cable'
}

export enum ChallengeType {
  WEIGHT_LOSS = 'weight_loss',
  STRENGTH = 'strength',
  CONSISTENCY = 'consistency', // Broj treninga
  VOLUME = 'volume'            // Ukupna težina podignuta
}

export enum ChallengeStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}

export enum LogStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped'
}

export enum NotificationType {
  WORKOUT_REMINDER = 'workout_reminder',
  MEAL_REMINDER = 'meal_reminder',
  CHALLENGE_UPDATE = 'challenge_update',
  ACHIEVEMENT = 'achievement',
  SYSTEM = 'system'
}

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack'
}

export enum GoalType {
  WEIGHT = 'weight',
  STRENGTH = 'strength',
  CONSISTENCY = 'consistency',
  NUTRITION = 'nutrition'
}

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired'
}

export enum PhotoCategory {
  FRONT = 'front',
  BACK = 'back',
  SIDE = 'side',
  OTHER = 'other'
}

// ==========================================
// MODEL 1: USER
// ==========================================

export interface User {
  userId: string;              // Firebase Auth UID
  email: string;
  role: UserRole;
  emailVerified: boolean;
  
  // Profile Data
  displayName?: string;
  age?: number;
  gender?: Gender;
  weight?: number;             // kg
  height?: number;             // cm
  goal?: FitnessGoal;
  activityLevel?: ActivityLevel;
  availableEquipment?: Equipment[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// MODEL 2: EXERCISE
// ==========================================

export interface Exercise {
  exerciseId: string;
  name: string;
  description: string;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroups?: MuscleGroup[];
  equipment: Equipment;
  difficulty: Difficulty;
  
  // Media
  videoUrl?: string;
  thumbnailUrl?: string;
  instructions: string[];      // Korak-po-korak uputstvo
  
  // Metadata
  createdBy: string;           // userId admina
  createdAt: Date;
  isActive: boolean;           // Za soft delete
}

// ==========================================
// MODEL 3: WORKOUT PLAN
// ==========================================

export interface WorkoutPlan {
  planId: string;
  userId: string;              // Vlasnik plana
  name: string;
  goal: FitnessGoal;
  difficulty: Difficulty;
  durationWeeks: number;
  
  // AI generisanje
  generatedBy: 'ai' | 'manual';
  isActive: boolean;           // Da li korisnik trenutno prati ovaj plan
  
  // Plan struktura (simplified za MVP)
  schedule: WorkoutDay[];      // Array dana u nedelji
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutDay {
  dayNumber: number;           // 1-7 (ponedeljak-nedelja)
  exercises: PlannedExercise[];
}

export interface PlannedExercise {
  exerciseId: string;
  orderIndex: number;          // Redosled u treningu
  recommendedSets: number;
  recommendedReps: string;     // "8-12" ili "AMRAP" (As Many Reps As Possible)
  restSeconds?: number;
}

// ==========================================
// MODEL 4: WORKOUT LOG
// ==========================================

export interface WorkoutLog {
  logId: string;
  userId: string;
  planId?: string;             // Opciono - ako prati plan
  date: Date;
  
  // Performance data
  exercises: ExerciseLog[];
  duration: number;            // minuti
  totalVolume: number;         // kg (sets × reps × weight)
  status: LogStatus;
  notes?: string;
  
  // Metadata
  createdAt: Date;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;        // Denormalizovano za brži prikaz
  sets: SetLog[];
  personalRecord?: boolean;    // Da li je novi PR
}

export interface SetLog {
  setNumber: number;
  reps: number;
  weight: number;              // kg
  rpe?: number;                // Rate of Perceived Exertion (1-10)
}

// ==========================================
// MODEL 5: CHALLENGE
// ==========================================

export interface Challenge {
  challengeId: string;
  name: string;
  description: string;
  type: ChallengeType;
  
  // Trajanje
  startDate: Date;
  endDate: Date;
  
  // Cilj
  targetValue: number;         // Zavisno od tipa (kg, broj treninga...)
  targetUnit: string;          // "kg", "workouts", "minutes"
  
  status: ChallengeStatus;
  
  // Učesnici (stored separately u subcollection)
  participantCount: number;
  
  // Metadata
  createdBy: string;           // userId admina
  createdAt: Date;
}

export interface ChallengeParticipant {
  userId: string;
  challengeId: string;
  
  // Progress
  currentProgress: number;
  currentStreak: number;       // Uzastopni dani
  rank?: number;               // Pozicija na leaderboard-u
  
  // Metadata
  joinedAt: Date;
  lastUpdated: Date;
}

// ==========================================
// HELPER TYPES
// ==========================================

// Za kreiranje novog korisnika (bez ID-a)
export type CreateUserInput = Omit<User, 'userId' | 'createdAt' | 'updatedAt'>;

// Za ažuriranje profila
export type UpdateUserInput = Partial<Omit<User, 'userId' | 'email' | 'createdAt'>>;

// Za API odgovore
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==========================================
// MODEL 6: MEAL
// ==========================================

export interface Meal {
  mealId: string;
  userId: string;
  name: string;
  type: MealType;
  calories: number;
  protein: number;       // g
  carbs: number;         // g
  fat: number;           // g
  quantity?: number;     // grams ili porcije
  notes?: string;
  date: string;          // ISO date string (YYYY-MM-DD) - koji dan je obrok logovan
  createdAt: Date;
}

// ==========================================
// MODEL 9: GOAL
// ==========================================

export interface Goal {
  goalId: string;
  userId: string;
  type: GoalType;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;          // 'kg', 'workouts', 'kcal', 'reps'
  deadline: Date;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// MODEL 10: PROGRESS PHOTO
// ==========================================

export interface ProgressPhoto {
  photoId: string;
  userId: string;
  url: string;            // Firebase Storage public URL
  storagePath: string;    // Firebase Storage path (for deletion)
  category: PhotoCategory;
  notes?: string;
  date: string;           // YYYY-MM-DD
  createdAt: Date;
}

// ==========================================
// MODEL 7: NOTIFICATION
// ==========================================

export interface Notification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;

  // Optional metadata
  relatedId?: string; // ID of related entity (workout, challenge, etc.)
  relatedType?: 'workout' | 'challenge' | 'meal' | 'achievement';
  actionUrl?: string;

  createdAt: Date;
}

// ==========================================
// MODEL 8: USER PREFERENCES
// ==========================================

export interface UserPreferences {
  userId: string;

  // Notification settings
  notifications: {
    workoutReminders: boolean;
    mealReminders: boolean;
    challengeUpdates: boolean;
    achievements: boolean;
    email: boolean;
    push: boolean;
  };

  // Reminder times
  reminderTimes: {
    morning: string; // HH:MM format
    afternoon: string;
    evening: string;
  };

  updatedAt: Date;
}