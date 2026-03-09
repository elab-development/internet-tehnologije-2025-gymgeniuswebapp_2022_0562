'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { Exercise, Difficulty } from '@/types/models';
import { Dumbbell, ChevronLeft, Target, Layers, Activity, CheckCircle, Video } from 'lucide-react';

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: 'Grudi', back: 'Leđa', shoulders: 'Ramena',
  biceps: 'Biceps', triceps: 'Triceps', legs: 'Noge',
  core: 'Jezgro', cardio: 'Cardio',
};

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: 'Šipka', dumbbell: 'Bučice', machine: 'Sprava',
  bodyweight: 'Bez opreme', resistance_band: 'Elastična traka',
  kettlebell: 'Kettlebell', cable: 'Kablovi',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  [Difficulty.BEGINNER]: 'bg-green-100 text-green-700',
  [Difficulty.INTERMEDIATE]: 'bg-yellow-100 text-yellow-700',
  [Difficulty.ADVANCED]: 'bg-red-100 text-red-700',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  [Difficulty.BEGINNER]: 'Početni', [Difficulty.INTERMEDIATE]: 'Srednji', [Difficulty.ADVANCED]: 'Napredni',
};

export default function ExerciseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const exerciseId = params?.id as string;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated || !exerciseId) return;

    const fetchExercise = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/exercises/${exerciseId}`);
        const data = await response.json();
        if (data.success) {
          setExercise(data.data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [isAuthenticated, exerciseId]);

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <button
          onClick={() => router.push('/exercises')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          Nazad na listu vežbi
        </button>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-lg shadow-md animate-pulse" />
            ))}
          </div>
        ) : notFound || !exercise ? (
          <Card>
            <div className="text-center py-12">
              <Dumbbell className="mx-auto text-gray-400 mb-4" size={48} />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Vežba nije pronađena</h2>
              <p className="text-gray-500 mb-6">Ova vežba ne postoji ili je uklonjena iz baze.</p>
              <Button onClick={() => router.push('/exercises')}>
                Povratak na listu vežbi
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Header */}
            <Card className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {exercise.thumbnailUrl ? (
                    <img
                      src={exercise.thumbnailUrl}
                      alt={exercise.name}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="text-primary-600" size={36} />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{exercise.name}</h1>
                    <p className="text-gray-600 text-sm mb-3">{exercise.description}</p>
                    <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${DIFFICULTY_COLORS[exercise.difficulty] || 'bg-gray-100 text-gray-700'}`}>
                      {DIFFICULTY_LABELS[exercise.difficulty] || exercise.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Info cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Target className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Primarna mišićna grupa</p>
                    <p className="font-semibold text-gray-900">
                      {MUSCLE_GROUP_LABELS[exercise.primaryMuscleGroup] || exercise.primaryMuscleGroup}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Layers className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Oprema</p>
                    <p className="font-semibold text-gray-900">
                      {EQUIPMENT_LABELS[exercise.equipment] || exercise.equipment}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Activity className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sekundarne mišićne grupe</p>
                    <p className="font-semibold text-gray-900">
                      {exercise.secondaryMuscleGroups && exercise.secondaryMuscleGroups.length > 0
                        ? exercise.secondaryMuscleGroups
                            .map((m) => MUSCLE_GROUP_LABELS[m] || m)
                            .join(', ')
                        : 'Nema'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Instructions */}
            {exercise.instructions && exercise.instructions.length > 0 && (
              <Card className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="text-primary-600" size={20} />
                  Uputstvo za izvođenje
                </h2>
                <ol className="space-y-3">
                  {exercise.instructions.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <p className="text-gray-700 pt-0.5">{step}</p>
                    </li>
                  ))}
                </ol>
              </Card>
            )}

            {/* Video */}
            {exercise.videoUrl && (
              <Card className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Video className="text-primary-600" size={20} />
                  Video tutorial
                </h2>
                <a
                  href={exercise.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Video size={16} />
                  Pogledajte video na YouTube-u
                </a>
              </Card>
            )}

            {/* Log workout CTA */}
            <Card className="bg-primary-50 border border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary-900">Spremi se za trening?</h3>
                  <p className="text-sm text-primary-700 mt-1">Logirajte {exercise.name} u svom sledećem treningu</p>
                </div>
                <Button onClick={() => router.push('/workouts')}>
                  <Dumbbell size={16} className="mr-2" />
                  Logiraj trening
                </Button>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
