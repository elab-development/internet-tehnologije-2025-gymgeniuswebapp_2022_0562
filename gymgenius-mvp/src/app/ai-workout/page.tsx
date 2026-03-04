'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Sparkles, Dumbbell, Cpu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/utils/api-client';

export default function AIWorkoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    goal: 'muscle_gain',
    experience: 'intermediate',
    equipment: ['barbell', 'dumbbell', 'bodyweight'],
    daysPerWeek: 4,
    durationWeeks: 8,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [error, setError] = useState('');
  const [ollamaStatus, setOllamaStatus] = useState<string>('checking');

  // Check Ollama health on mount
  useEffect(() => {
    checkOllamaHealth();
  }, []);

  const checkOllamaHealth = async () => {
    try {
      const response = await fetch('/api/ai/generate-workout');
      const data = await response.json();

      if (data.success) {
        setOllamaStatus(data.data.status);
      }
    } catch (err) {
      setOllamaStatus('unavailable');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const response = await apiFetch('/api/ai/generate-workout', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          saveToProfile: true,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate plan');
      }

      setGeneratedPlan(data.data.plan);
      console.log('✅ Generated plan:', data.data.plan);
      console.log('🤖 AI Model:', data.data.aiModel);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Cpu className="text-primary-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">AI Workout Generator</h1>
          </div>
          <p className="text-gray-600 mb-2">
            Powered by <strong>Ollama (Llama 3.2)</strong> - Local AI
          </p>

          {/* Ollama Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                ollamaStatus === 'healthy'
                  ? 'bg-green-500'
                  : ollamaStatus === 'unavailable'
                  ? 'bg-red-500'
                  : 'bg-yellow-500'
              }`}
            ></div>
            <span className="text-gray-600">
              Ollama:{' '}
              {ollamaStatus === 'healthy'
                ? '✅ Online'
                : ollamaStatus === 'unavailable'
                ? '❌ Offline (using fallback)'
                : '⏳ Checking...'}
            </span>
          </div>
        </div>

        {/* Form */}
        {!generatedPlan && (
          <Card className="mb-8">
            <div className="space-y-6">
              {/* Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fitness Goal
                </label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="strength">Strength</option>
                  <option value="endurance">Endurance</option>
                  <option value="general_fitness">General Fitness</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Days per week */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Days per Week: {formData.daysPerWeek}
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={formData.daysPerWeek}
                  onChange={(e) =>
                    setFormData({ ...formData, daysPerWeek: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Duration (weeks)
                </label>
                <input
                  type="number"
                  min="4"
                  max="16"
                  value={formData.durationWeeks}
                  onChange={(e) =>
                    setFormData({ ...formData, durationWeeks: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleGenerate}
                isLoading={isGenerating}
              >
                {isGenerating ? 'Generating with Llama 3.2...' : 'Generate AI Workout Plan'}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                💡 Using local Ollama (Llama 3.2) - Free and private!
              </p>
            </div>
          </Card>
        )}

        {/* Generated Plan */}
        {generatedPlan && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {generatedPlan.planName}
              </h2>
              <p className="text-gray-600 mb-4">{generatedPlan.description}</p>

              {/* Weekly Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Weekly Schedule</h3>
                {generatedPlan.weeklySchedule?.map((day: any, index: number) => (
                  <div key={index} className="border-l-4 border-primary-500 pl-4">
                    <h4 className="font-medium text-gray-900">{day.dayName}</h4>
                    <ul className="mt-2 space-y-2">
                      {day.exercises?.map((ex: any, exIndex: number) => (
                        <li key={exIndex} className="text-sm text-gray-700">
                          <strong>{ex.name}</strong> - {ex.sets} sets × {ex.reps} reps
                          {ex.notes && <span className="text-gray-500"> ({ex.notes})</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Progression Notes */}
              {generatedPlan.progressionNotes && (
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">📈 Progression</h4>
                  <p className="text-sm text-blue-800">{generatedPlan.progressionNotes}</p>
                </div>
              )}

              {/* Nutrition Tips */}
              {generatedPlan.nutritionTips && (
                <div className="mt-4 bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">🍎 Nutrition</h4>
                  <p className="text-sm text-green-800">{generatedPlan.nutritionTips}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 mt-6">
                <Button variant="primary" onClick={() => router.push('/dashboard')}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={() => setGeneratedPlan(null)}>
                  Generate New Plan
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
