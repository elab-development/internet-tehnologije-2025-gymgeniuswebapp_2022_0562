'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import WeightProgressChart from '@/components/charts/WeightProgressChart';
import WorkoutVolumeChart from '@/components/charts/WorkoutVolumeChart';
import CalorieIntakeChart from '@/components/charts/CalorieIntakeChart';
import MuscleGroupPieChart from '@/components/charts/MuscleGroupPieChart';

export default function ProgressPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/stats/progress?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated, period]);

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

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-primary-600" size={32} />
              <h1 className="text-3xl font-bold text-gray-900">Progress & Statistics</h1>
            </div>
            <p className="text-gray-600">Track your fitness journey with detailed analytics</p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2">
            <Button
              variant={period === 'week' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPeriod('week')}
            >
              Week
            </Button>
            <Button
              variant={period === 'month' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPeriod('month')}
            >
              Month
            </Button>
            <Button
              variant={period === 'year' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPeriod('year')}
            >
              Year
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-blue-500">
                <p className="text-sm text-gray-600">Total Workouts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.summary.totalWorkouts}</p>
              </Card>
              <Card className="border-l-4 border-green-500">
                <p className="text-sm text-gray-600">Total Volume</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(stats.summary.totalVolume)} kg
                </p>
              </Card>
              <Card className="border-l-4 border-orange-500">
                <p className="text-sm text-gray-600">Avg Calories</p>
                <p className="text-3xl font-bold text-gray-900">{stats.summary.averageCalories}</p>
              </Card>
              <Card className="border-l-4 border-purple-500">
                <p className="text-sm text-gray-600">Meals Logged</p>
                <p className="text-3xl font-bold text-gray-900">{stats.summary.totalMeals}</p>
              </Card>
            </div>

            {/* Weight Progress Chart */}
            {stats.weightProgress && stats.weightProgress.length > 0 && (
              <Card>
                <WeightProgressChart data={stats.weightProgress} />
              </Card>
            )}

            {/* Workout Volume Chart */}
            {stats.workoutVolume && stats.workoutVolume.length > 0 && (
              <Card>
                <WorkoutVolumeChart data={stats.workoutVolume} />
              </Card>
            )}

            {/* Calorie Intake Chart */}
            {stats.calorieIntake && stats.calorieIntake.length > 0 && (
              <Card>
                <CalorieIntakeChart data={stats.calorieIntake} />
              </Card>
            )}

            {/* Muscle Group Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.muscleGroupDistribution && stats.muscleGroupDistribution.length > 0 && (
                <Card>
                  <MuscleGroupPieChart data={stats.muscleGroupDistribution} />
                </Card>
              )}

              {/* Workout Frequency */}
              {stats.workoutFrequency && stats.workoutFrequency.length > 0 && (
                <Card>
                  <h3 className="text-lg font-semibold mb-4">Workout Frequency</h3>
                  <div className="space-y-2">
                    {stats.workoutFrequency.map((week: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{week.week}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${(week.count / 7) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{week.count} workouts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-600">No data available for this period</p>
              <p className="text-sm text-gray-500 mt-2">
                Start logging workouts and meals to see your progress!
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
