import { MuscleGroup } from '@/types/models';

/**
 * Curated Unsplash fitness photos per muscle group.
 * Used as fallback when an exercise doesn't have a thumbnailUrl.
 */
export const MUSCLE_GROUP_IMAGES: Record<MuscleGroup, string> = {
  [MuscleGroup.CHEST]:
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80&fit=crop',
  [MuscleGroup.BACK]:
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80&fit=crop',
  [MuscleGroup.SHOULDERS]:
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80&fit=crop',
  [MuscleGroup.BICEPS]:
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80&fit=crop',
  [MuscleGroup.TRICEPS]:
    'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=80&fit=crop',
  [MuscleGroup.LEGS]:
    'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400&q=80&fit=crop',
  [MuscleGroup.CORE]:
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80&fit=crop',
  [MuscleGroup.CARDIO]:
    'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80&fit=crop',
};

/**
 * Tailwind gradient classes used when an image fails to load.
 * Provides a colourful, muscle-group-themed fallback.
 */
export const MUSCLE_GROUP_GRADIENTS: Record<MuscleGroup, string> = {
  [MuscleGroup.CHEST]: 'from-red-500 to-orange-600',
  [MuscleGroup.BACK]: 'from-blue-600 to-indigo-700',
  [MuscleGroup.SHOULDERS]: 'from-purple-500 to-violet-700',
  [MuscleGroup.BICEPS]: 'from-green-500 to-teal-600',
  [MuscleGroup.TRICEPS]: 'from-amber-500 to-orange-600',
  [MuscleGroup.LEGS]: 'from-sky-500 to-blue-700',
  [MuscleGroup.CORE]: 'from-orange-500 to-red-600',
  [MuscleGroup.CARDIO]: 'from-cyan-500 to-blue-600',
};

/** Returns the image URL to use for an exercise card. */
export function getExerciseImageUrl(
  muscleGroup: MuscleGroup,
  thumbnailUrl?: string
): string {
  return thumbnailUrl || MUSCLE_GROUP_IMAGES[muscleGroup] || MUSCLE_GROUP_IMAGES[MuscleGroup.CHEST];
}

/** Returns the Tailwind gradient string for a muscle group. */
export function getMuscleGroupGradient(muscleGroup: MuscleGroup): string {
  return MUSCLE_GROUP_GRADIENTS[muscleGroup] ?? 'from-gray-500 to-gray-700';
}

/** Generic gym image for exercises where muscle group is unknown (e.g. Wger results). */
export const GENERIC_GYM_IMAGE =
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80&fit=crop';