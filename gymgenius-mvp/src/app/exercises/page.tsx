'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Dumbbell, Database } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/utils/api-client';
import { Exercise, MuscleGroup, Equipment, Difficulty } from '@/types/models';

export default function ExercisesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [wgerExercises, setWgerExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'local' | 'wger'>('local');
  const [filters, setFilters] = useState({
    muscleGroup: '',
    equipment: '',
    difficulty: '',
  });

  // Redirect ako nije autentifikovan
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch exercises
  useEffect(() => {
    if (isAuthenticated) {
      fetchExercises();
    }
  }, [isAuthenticated, filters]);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      
      // Build query params
      const params = new URLSearchParams();
      if (filters.muscleGroup) params.append('muscleGroup', filters.muscleGroup);
      if (filters.equipment) params.append('equipment', filters.equipment);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/exercises?${params.toString()}`);

      const data = await response.json();

      if (data.success) {
        setExercises(data.data.exercises);
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchWgerExercises = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/wger/search?query=${encodeURIComponent(searchTerm)}`,
        {
                  }
      );

      const data = await response.json();
      if (data.success) {
        setWgerExercises(data.data.exercises);
      }
    } catch (error) {
      console.error('Failed to search Wger:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'local') {
      fetchExercises();
    } else {
      searchWgerExercises();
    }
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Exercise Library 💪
          </h1>
          <p className="text-gray-600">
            Browse local exercises or search Wger's 1000+ exercise database
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'local' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('local')}
            leftIcon={<Dumbbell size={20} />}
          >
            Local ({exercises.length})
          </Button>
          <Button
            variant={activeTab === 'wger' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('wger')}
            leftIcon={<Database size={20} />}
          >
            Wger Database (1000+)
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-4">
            <Input
              type="text"
              placeholder={activeTab === 'local' ? 'Search local exercises...' : 'Search Wger database...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={20} />}
              fullWidth
            />
          </form>

          {/* Filters (Only for Local Tab) */}
          {activeTab === 'local' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Muscle Group Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Muscle Group
              </label>
              <select
                value={filters.muscleGroup}
                onChange={(e) => handleFilterChange('muscleGroup', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All</option>
                {Object.values(MuscleGroup).map((group) => (
                  <option key={group} value={group}>
                    {group.charAt(0).toUpperCase() + group.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Equipment Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment
              </label>
              <select
                value={filters.equipment}
                onChange={(e) => handleFilterChange('equipment', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All</option>
                {Object.values(Equipment).map((eq) => (
                  <option key={eq} value={eq}>
                    {eq.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All</option>
                {Object.values(Difficulty).map((diff) => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : activeTab === 'local' ? `${exercises.length} exercises found` : `${wgerExercises.length} exercises found`}
          </p>
        </div>

        {/* Exercises Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md h-64 animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'local' ? (
          // Local Tab
          exercises.length === 0 ? (
            <div className="text-center py-12">
              <Dumbbell className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-600">No exercises found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exercises.map((exercise) => (
                <Card
                  key={exercise.exerciseId}
                  title={exercise.name}
                  subtitle={`${exercise.primaryMuscleGroup} • ${exercise.equipment}`}
                  image={exercise.thumbnailUrl || '/placeholder-exercise.jpg'}
                  imageAlt={exercise.name}
                  hoverable
                  onClick={() => router.push(`/exercises/${exercise.exerciseId}`)}
                  footer={
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        exercise.difficulty === Difficulty.BEGINNER
                          ? 'bg-green-100 text-green-700'
                          : exercise.difficulty === Difficulty.INTERMEDIATE
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {exercise.difficulty}
                      </span>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  }
                >
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {exercise.description}
                  </p>
                </Card>
              ))}
            </div>
          )
        ) : (
          // Wger Tab
          wgerExercises.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Database className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-gray-600">Search for exercises in Wger database</p>
                <p className="text-sm text-gray-500 mt-2">
                  Try: "bench press", "squat", "deadlift"
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wgerExercises.map((exercise) => (
                <Card
                  key={exercise.id}
                  title={exercise.name}
                  subtitle={`Wger ID: ${exercise.id}`}
                  hoverable
                >
                  <div
                    className="text-sm text-gray-600 line-clamp-3"
                    dangerouslySetInnerHTML={{
                      __html: exercise.description.substring(0, 200) + '...',
                    }}
                  />
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`https://wger.de/en/exercise/${exercise.id}/view`, '_blank')}
                    >
                      View on Wger
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}

        {/* Admin Sync Button */}
        {user?.role === 'admin' && activeTab === 'wger' && (
          <Card className="mt-8 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Admin: Sync Wger Exercises</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Import exercises from Wger database to local Firestore
                </p>
              </div>
              <Button
                variant="primary"
                onClick={async () => {
                  if (!confirm('Sync 100 exercises from Wger?')) return;

                  const response = await apiFetch('/api/wger/sync', {
                    method: 'POST',
                    
                    body: JSON.stringify({ limit: 100 }),
                  });

                  const data = await response.json();
                  if (data.success) {
                    alert(`Synced ${data.data.synced} exercises!`);
                    fetchExercises();
                  } else {
                    alert('Sync failed: ' + data.error);
                  }
                }}
              >
                Sync from Wger
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}