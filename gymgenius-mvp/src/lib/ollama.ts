/**
 * Ollama API Client (Llama 3.2)
 * Lokalno AI rešenje za generisanje workout planova
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
  };
}

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
  eval_duration?: number;
}

/**
 * Generiše workout plan korišćenjem Ollama (Llama 3.2)
 */
export async function generateWorkoutPlan(params: {
  goal: string;
  experience: string;
  equipment: string[];
  daysPerWeek: number;
  durationWeeks: number;
  age?: number;
  gender?: string;
  fitnessLevel?: string;
}) {
  const {
    goal,
    experience,
    equipment,
    daysPerWeek,
    durationWeeks,
    age,
    gender,
    fitnessLevel,
  } = params;

  // Kreiraj strukturiran prompt za Llama 3.2
  const prompt = `You are a professional fitness coach. Generate a detailed ${durationWeeks}-week workout plan in JSON format.

USER PROFILE:
- Fitness Goal: ${goal}
- Experience Level: ${experience}
- Available Equipment: ${equipment.join(', ')}
- Training Frequency: ${daysPerWeek} days per week
${age ? `- Age: ${age}` : ''}
${gender ? `- Gender: ${gender}` : ''}
${fitnessLevel ? `- Current Fitness Level: ${fitnessLevel}` : ''}

REQUIREMENTS:
1. Create a structured weekly schedule for ${daysPerWeek} training days
2. Include specific exercises with sets, reps, and rest periods
3. Ensure progressive overload throughout the weeks
4. Balance muscle groups appropriately
5. Include warm-up and cool-down recommendations

OUTPUT FORMAT (respond with ONLY valid JSON, no additional text):
{
  "planName": "Descriptive plan name",
  "description": "Brief overview of the plan (2-3 sentences)",
  "weeklySchedule": [
    {
      "day": 1,
      "dayName": "Monday - Push Day",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": 4,
          "reps": "8-10",
          "restSeconds": 120,
          "notes": "Focus on controlled movement"
        },
        {
          "name": "Dumbbell Shoulder Press",
          "sets": 3,
          "reps": "10-12",
          "restSeconds": 90,
          "notes": "Keep core tight"
        }
      ]
    }
  ],
  "progressionNotes": "How to progress week by week",
  "nutritionTips": "Brief nutrition recommendations"
}

Generate the workout plan now:`;

  try {
    console.log('🤖 Calling Ollama API with Llama 3.2...');

    const requestBody: OllamaGenerateRequest = {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 2000, // Max tokens
      },
    };

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data: OllamaGenerateResponse = await response.json();

    if (!data.response) {
      throw new Error('Empty response from Ollama');
    }

    console.log('✅ Ollama response received');
    console.log('📝 Raw response length:', data.response.length);

    // Parse JSON iz response-a
    let workoutPlan;
    try {
      // Pokušaj da ekstraktuješ JSON iz response-a
      const jsonMatch = data.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        workoutPlan = JSON.parse(jsonMatch[0]);
      } else {
        // Ako nema JSON-a, kreiraj fallback strukturu
        workoutPlan = createFallbackPlan(params);
        console.warn('⚠ No JSON found in response, using fallback plan');
      }
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.log('Raw response:', data.response.substring(0, 500));
      workoutPlan = createFallbackPlan(params);
    }

    return {
      success: true,
      data: workoutPlan,
      metadata: {
        model: data.model,
        totalDuration: data.total_duration,
        evalCount: data.eval_count,
      },
    };
  } catch (error: any) {
    console.error('❌ Ollama API Error:', error);

    // Fallback na mock plan ako Ollama nije dostupan
    if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
      console.warn('⚠ Ollama not available, using fallback plan');
      return {
        success: true,
        data: createFallbackPlan(params),
        metadata: {
          model: 'fallback',
          note: 'Ollama service not available, using pre-generated plan',
        },
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to generate workout plan',
    };
  }
}

/**
 * Kreira fallback workout plan ako AI nije dostupan
 */
function createFallbackPlan(params: {
  goal: string;
  experience: string;
  equipment: string[];
  daysPerWeek: number;
  durationWeeks: number;
}) {
  const { goal, experience, equipment, daysPerWeek, durationWeeks } = params;

  // Osnovni plan baziran na parametrima
  const planName = `${experience.charAt(0).toUpperCase() + experience.slice(1)} ${
    goal.replace('_', ' ').charAt(0).toUpperCase() + goal.replace('_', ' ').slice(1)
  } Plan`;

  const exercises = getExercisesForEquipment(equipment);

  return {
    planName,
    description: `A ${durationWeeks}-week ${experience} level program designed for ${goal.replace(
      '_',
      ' '
    )}. Train ${daysPerWeek} days per week with progressive overload.`,
    weeklySchedule: generateWeeklySchedule(daysPerWeek, exercises, experience),
    progressionNotes:
      'Increase weight by 2.5-5% each week when you can complete all sets with good form. Deload every 4th week.',
    nutritionTips:
      goal === 'muscle_gain'
        ? 'Maintain a caloric surplus of 300-500 calories. Aim for 1.6-2.2g protein per kg bodyweight.'
        : goal === 'weight_loss'
        ? 'Maintain a caloric deficit of 300-500 calories. Keep protein high (1.8-2.4g per kg) to preserve muscle.'
        : 'Eat at maintenance calories with balanced macros. Focus on whole foods and adequate protein.',
  };
}

/**
 * Generiše nedeljni raspored vežbi
 */
function generateWeeklySchedule(
  daysPerWeek: number,
  availableExercises: any[],
  experience: string
) {
  const schedule = [];

  const splits = [
    { day: 1, dayName: 'Monday - Upper Body', focus: 'upper' },
    { day: 2, dayName: 'Tuesday - Lower Body', focus: 'lower' },
    { day: 3, dayName: 'Wednesday - Rest', focus: 'rest' },
    { day: 4, dayName: 'Thursday - Push', focus: 'push' },
    { day: 5, dayName: 'Friday - Pull', focus: 'pull' },
    { day: 6, dayName: 'Saturday - Legs', focus: 'legs' },
    { day: 7, dayName: 'Sunday - Rest', focus: 'rest' },
  ];

  for (let i = 0; i < Math.min(daysPerWeek, 6); i++) {
    const split = splits[i];
    if (split.focus === 'rest') continue;

    const exercises = availableExercises
      .filter((ex) => ex.category === split.focus || ex.category === 'compound')
      .slice(0, experience === 'beginner' ? 4 : experience === 'intermediate' ? 5 : 6)
      .map((ex, index) => ({
        name: ex.name,
        sets: experience === 'beginner' ? 3 : 4,
        reps: ex.reps,
        restSeconds: ex.restSeconds,
        notes: ex.notes,
      }));

    schedule.push({
      day: i + 1,
      dayName: split.dayName,
      exercises,
    });
  }

  return schedule;
}

/**
 * Vraća vežbe na osnovu dostupne opreme
 */
function getExercisesForEquipment(equipment: string[]) {
  const allExercises = [
    // Compound movements
    {
      name: 'Barbell Squat',
      category: 'compound',
      equipment: 'barbell',
      reps: '8-10',
      restSeconds: 120,
      notes: 'Focus on depth and form',
    },
    {
      name: 'Deadlift',
      category: 'compound',
      equipment: 'barbell',
      reps: '6-8',
      restSeconds: 180,
      notes: 'Keep back straight',
    },
    {
      name: 'Bench Press',
      category: 'push',
      equipment: 'barbell',
      reps: '8-10',
      restSeconds: 120,
      notes: 'Control the descent',
    },
    {
      name: 'Pull-ups',
      category: 'pull',
      equipment: 'bodyweight',
      reps: 'AMRAP',
      restSeconds: 120,
      notes: 'Full range of motion',
    },
    {
      name: 'Dumbbell Press',
      category: 'push',
      equipment: 'dumbbell',
      reps: '10-12',
      restSeconds: 90,
      notes: 'Squeeze at the top',
    },
    {
      name: 'Dumbbell Rows',
      category: 'pull',
      equipment: 'dumbbell',
      reps: '10-12',
      restSeconds: 90,
      notes: 'Pull to hip',
    },
    {
      name: 'Lunges',
      category: 'legs',
      equipment: 'bodyweight',
      reps: '12-15',
      restSeconds: 60,
      notes: 'Keep torso upright',
    },
    {
      name: 'Push-ups',
      category: 'push',
      equipment: 'bodyweight',
      reps: '15-20',
      restSeconds: 60,
      notes: 'Full range of motion',
    },
    {
      name: 'Plank',
      category: 'compound',
      equipment: 'bodyweight',
      reps: '30-60s',
      restSeconds: 60,
      notes: 'Keep body straight',
    },
  ];

  // Filtriraj vežbe na osnovu dostupne opreme
  return allExercises.filter(
    (ex) => equipment.includes(ex.equipment) || ex.equipment === 'bodyweight'
  );
}

/**
 * Proveri da li je Ollama servis dostupan
 */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('Ollama health check failed:', error);
    return false;
  }
}

/**
 * Lista dostupnih modela u Ollama
 */
export async function listOllamaModels() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Failed to list Ollama models:', error);
    return [];
  }
}
