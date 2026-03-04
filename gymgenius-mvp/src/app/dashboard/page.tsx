'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Dumbbell, Target, Calendar } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalWorkouts: number;
  currentStreak: number;
  activeGoals: number;
  weeklyProgress: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkouts: 0,
    currentStreak: 0,
    activeGoals: 0,
    weeklyProgress: 0,
  });

  // Redirect ako nije autentifikovan
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Simulirani podaci (u realnoj app bi fetch-ovali iz API-ja)
  useEffect(() => {
    if (isAuthenticated) {
      // Simulacija API poziva
      setTimeout(() => {
        setStats({
          totalWorkouts: 24,
          currentStreak: 5,
          activeGoals: 3,
          weeklyProgress: 75,
        });
      }, 500);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.displayName || 'Athlete'}! 💪
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your fitness overview for today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stat Card 1 */}
          <Card className="border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Workouts</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalWorkouts}
                </p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full">
                <Dumbbell className="text-primary-600" size={24} />
              </div>
            </div>
          </Card>

          {/* Stat Card 2 */}
          <Card className="border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.currentStreak} days
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          {/* Stat Card 3 */}
          <Card className="border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Goals</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.activeGoals}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Target className="text-orange-600" size={24} />
              </div>
            </div>
          </Card>

          {/* Stat Card 4 */}
          <Card className="border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Weekly Progress</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.weeklyProgress}%
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Calendar className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Today's Workout */}
          <Card
            title="Today's Workout"
            subtitle="Push Day - Upper Body"
            hoverable
          >
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">60 minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Exercises:</span>
                <span className="font-medium">6 exercises</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Difficulty:</span>
                <span className="font-medium text-orange-600">Intermediate</span>
              </div>
            </div>

            <Button variant="primary" fullWidth onClick={() => router.push('/exercises')}>
              Start Workout
            </Button>
          </Card>

          {/* Recent Activity */}
          <Card title="Recent Activity">
            <div className="space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="bg-green-100 p-2 rounded-full">
                  <Dumbbell className="text-green-600" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Completed Leg Day</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Target className="text-blue-600" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New goal set: Bench 100kg</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <TrendingUp className="text-purple-600" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">5-day streak achieved!</p>
                  <p className="text-xs text-gray-500">5 days ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Recommendation */}
        <Card className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">🤖 AI Recommendation</h3>
              <p className="text-primary-50 mb-4">
                Based on your progress, we recommend focusing on progressive overload
                for compound movements this week.
              </p>
              <Button variant="outline" className="bg-white text-primary-700 border-white hover:bg-primary-50" onClick={() => router.push('/ai-workout')}>
                Generate New Plan
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}