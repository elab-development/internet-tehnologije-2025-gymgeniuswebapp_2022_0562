import { generateWorkoutPlan, checkOllamaHealth } from '../ollama';

describe('Ollama Integration Tests', () => {
  it('should generate workout plan (or fallback)', async () => {
    const result = await generateWorkoutPlan({
      goal: 'muscle_gain',
      experience: 'intermediate',
      equipment: ['barbell', 'dumbbell'],
      daysPerWeek: 4,
      durationWeeks: 8,
    });

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('planName');
    expect(result.data).toHaveProperty('weeklySchedule');
    expect(Array.isArray(result.data.weeklySchedule)).toBe(true);
  });

  it('should check Ollama health', async () => {
    const isHealthy = await checkOllamaHealth();
    expect(typeof isHealthy).toBe('boolean');
  });

  it('should handle fallback when Ollama unavailable', async () => {
    // Mock fetch to simulate Ollama being down
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('ECONNREFUSED'))
    ) as jest.Mock;

    const result = await generateWorkoutPlan({
      goal: 'weight_loss',
      experience: 'beginner',
      equipment: ['bodyweight'],
      daysPerWeek: 3,
      durationWeeks: 4,
    });

    expect(result.success).toBe(true);
    expect(result.data.planName).toBeDefined();
    expect(result.metadata?.model).toBe('fallback');
  });
});
