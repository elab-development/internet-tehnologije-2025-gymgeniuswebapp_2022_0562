import { searchExercises, fetchCategories, fetchMuscles, fetchEquipment } from '../wger';

describe('Wger API Integration Tests', () => {
  it('should search for exercises', async () => {
    const results = await searchExercises('bench', 10);

    expect(Array.isArray(results)).toBe(true);
    if (results.length > 0) {
      expect(results[0]).toHaveProperty('name');
      expect(results[0]).toHaveProperty('description');
    }
  });

  it('should fetch categories', async () => {
    const categories = await fetchCategories();

    expect(Array.isArray(categories)).toBe(true);
    if (categories.length > 0) {
      expect(categories[0]).toHaveProperty('id');
      expect(categories[0]).toHaveProperty('name');
    }
  });

  it('should fetch muscles', async () => {
    const muscles = await fetchMuscles();

    expect(Array.isArray(muscles)).toBe(true);
    if (muscles.length > 0) {
      expect(muscles[0]).toHaveProperty('name_en');
    }
  });

  it('should fetch equipment', async () => {
    const equipment = await fetchEquipment();

    expect(Array.isArray(equipment)).toBe(true);
    if (equipment.length > 0) {
      expect(equipment[0]).toHaveProperty('name');
    }
  });

  it('should handle API errors gracefully', async () => {
    // Mock fetch to simulate error
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    ) as jest.Mock;

    const results = await searchExercises('test');
    expect(results).toEqual([]);
  });
});
