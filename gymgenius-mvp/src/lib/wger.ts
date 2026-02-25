/**
 * Wger API Client
 * https://wger.de/en/software/api
 *
 * Wger je open-source fitnes aplikacija sa obimnom bazom vežbi.
 * API je potpuno besplatan i ne zahteva autentifikaciju.
 */

const WGER_BASE_URL = process.env.WGER_API_BASE_URL || 'https://wger.de/api/v2';
const WGER_LANGUAGE = process.env.WGER_API_LANGUAGE || '2'; // 2 = English

// ==========================================
// TypeScript Interfaces
// ==========================================

export interface WgerExercise {
  id: number;
  uuid: string;
  name: string;
  description: string; // HTML format
  creation_date: string;
  category: number;
  muscles: number[];
  muscles_secondary: number[];
  equipment: number[];
  language: number;
  license: number;
  license_author: string;
  variations?: number[];
}

export interface WgerExerciseCategory {
  id: number;
  name: string;
}

export interface WgerMuscle {
  id: number;
  name: string;
  name_en: string;
  is_front: boolean;
}

export interface WgerEquipment {
  id: number;
  name: string;
}

export interface WgerExerciseImage {
  id: number;
  uuid: string;
  exercise_base: number;
  image: string;
  is_main: boolean;
  license: number;
  license_author: string;
}

// ==========================================
// API Functions
// ==========================================

/**
 * Fetch vežbi sa paginacijom i filterima
 */
export async function fetchExercises(params?: {
  language?: string;
  category?: number;
  muscles?: number;
  equipment?: number;
  limit?: number;
  offset?: number;
}): Promise<{
  count: number;
  next: string | null;
  previous: string | null;
  results: WgerExercise[];
}> {
  try {
    const queryParams = new URLSearchParams({
      language: params?.language || WGER_LANGUAGE,
      limit: (params?.limit || 50).toString(),
      offset: (params?.offset || 0).toString(),
    });

    if (params?.category) queryParams.append('category', params.category.toString());
    if (params?.muscles) queryParams.append('muscles', params.muscles.toString());
    if (params?.equipment) queryParams.append('equipment', params.equipment.toString());

    const response = await fetch(`${WGER_BASE_URL}/exercise/?${queryParams.toString()}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Wger API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Wger fetchExercises error:', error);
    throw error;
  }
}

/**
 * Fetch detalja jedne vežbe
 */
export async function fetchExerciseById(id: number): Promise<WgerExercise> {
  try {
    const response = await fetch(`${WGER_BASE_URL}/exercise/${id}/`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Wger API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Wger fetchExerciseById error:', error);
    throw error;
  }
}

/**
 * Fetch kategorija (mišićne grupe)
 */
export async function fetchCategories(): Promise<WgerExerciseCategory[]> {
  try {
    const response = await fetch(`${WGER_BASE_URL}/exercisecategory/`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Wger API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Wger fetchCategories error:', error);
    return [];
  }
}

/**
 * Fetch mišića
 */
export async function fetchMuscles(): Promise<WgerMuscle[]> {
  try {
    const response = await fetch(`${WGER_BASE_URL}/muscle/`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Wger API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Wger fetchMuscles error:', error);
    return [];
  }
}

/**
 * Fetch opreme
 */
export async function fetchEquipment(): Promise<WgerEquipment[]> {
  try {
    const response = await fetch(`${WGER_BASE_URL}/equipment/`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Wger API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Wger fetchEquipment error:', error);
    return [];
  }
}

/**
 * Fetch slika za vežbu
 */
export async function fetchExerciseImages(exerciseBaseId: number): Promise<WgerExerciseImage[]> {
  try {
    const response = await fetch(
      `${WGER_BASE_URL}/exerciseimage/?exercise_base=${exerciseBaseId}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Wger API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Wger fetchExerciseImages error:', error);
    return [];
  }
}

/**
 * Search vežbi po nazivu
 */
export async function searchExercises(query: string, limit = 20): Promise<WgerExercise[]> {
  try {
    const response = await fetch(
      `${WGER_BASE_URL}/exercise/?language=${WGER_LANGUAGE}&limit=${limit}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Wger API error: ${response.status}`);
    }

    const data = await response.json();
    const exercises: WgerExercise[] = data.results || [];

    // Client-side filtering (Wger API ne podržava search parametar)
    const searchLower = query.toLowerCase();
    return exercises.filter(
      (ex) =>
        ex.name.toLowerCase().includes(searchLower) ||
        ex.description.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Wger searchExercises error:', error);
    return [];
  }
}

/**
 * Konvertuj Wger vežbu u GymGenius Exercise format
 */
export function convertWgerToGymGeniusExercise(
  wgerExercise: WgerExercise,
  categoryName?: string,
  muscleNames?: string[],
  equipmentNames?: string[]
): any {
  // Strip HTML tags iz description-a
  const description = wgerExercise.description.replace(/<[^>]*>/g, '');

  // Mapiranje kategorija na GymGenius muscle groups
  const categoryMapping: Record<string, string> = {
    Arms: 'biceps',
    Legs: 'legs',
    Abs: 'core',
    Chest: 'chest',
    Back: 'back',
    Shoulders: 'shoulders',
    Calves: 'legs',
  };

  const primaryMuscleGroup = categoryMapping[categoryName || ''] || 'chest';

  return {
    name: wgerExercise.name,
    description: description.substring(0, 500), // Limit length
    primaryMuscleGroup,
    secondaryMuscleGroups: muscleNames?.slice(0, 2) || [],
    equipment: equipmentNames?.[0]?.toLowerCase() || 'bodyweight',
    difficulty: 'intermediate', // Default
    instructions: description
      .split('.')
      .filter((s) => s.trim().length > 0)
      .slice(0, 5),
    videoUrl: undefined,
    thumbnailUrl: undefined,
    createdBy: 'wger-api',
    createdAt: new Date(wgerExercise.creation_date),
    isActive: true,
    wgerId: wgerExercise.id, // Store original Wger ID
  };
}

/**
 * Sync Wger vežbi u Firestore (admin funkcija)
 */
export async function syncWgerExercisesToFirestore(limit = 100) {
  try {
    console.log('🔄 Starting Wger exercises sync...');

    // Fetch categories, muscles, equipment
    const [categories, muscles, equipment] = await Promise.all([
      fetchCategories(),
      fetchMuscles(),
      fetchEquipment(),
    ]);

    // Fetch exercises
    const exercisesData = await fetchExercises({ limit });
    const exercises = exercisesData.results;

    console.log(`📥 Fetched ${exercises.length} exercises from Wger`);

    const convertedExercises = exercises.map((ex) => {
      const category = categories.find((c) => c.id === ex.category);
      const primaryMuscles = ex.muscles.map((m) =>
        muscles.find((mu) => mu.id === m)?.name_en
      );
      const equipmentList = ex.equipment.map((e) => equipment.find((eq) => eq.id === e)?.name);

      return convertWgerToGymGeniusExercise(
        ex,
        category?.name,
        primaryMuscles.filter(Boolean) as string[],
        equipmentList.filter(Boolean) as string[]
      );
    });

    console.log(`✅ Converted ${convertedExercises.length} exercises`);

    return {
      success: true,
      exercises: convertedExercises,
      count: convertedExercises.length,
    };
  } catch (error) {
    console.error('❌ Wger sync error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
