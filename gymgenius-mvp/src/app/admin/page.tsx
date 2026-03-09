'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Users, Dumbbell, Trophy, TrendingUp, Activity, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/utils/api-client';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/stats', {
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
      // Check if user is admin
      if (user?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchStats();
    }
  }, [isAuthenticated, user]);

  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Učitavanje...</div>;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-red-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Admin kontrolna tabla</h1>
          </div>
          <p className="text-gray-600">Upravljajte korisnicima, sadržajem i sistemskim postavkama</p>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ukupno korisnika</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.overview.totalUsers}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ukupno vežbi</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.overview.totalExercises}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Dumbbell className="text-green-600" size={24} />
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Aktivni izazovi</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.activeChallenges}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Trophy className="text-yellow-600" size={24} />
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Treninzi (7d)</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.recentActivity.workoutsLast7Days}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Activity className="text-purple-600" size={24} />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Users by Role */}
        {stats && (
          <Card className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Korisnici po ulozi</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.usersByRole).map(([role, count]: any) => (
                <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{role}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverable onClick={() => router.push('/admin/users')}>
            <div className="text-center py-6">
              <Users className="mx-auto mb-4 text-blue-600" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upravljanje korisnicima
              </h3>
              <p className="text-sm text-gray-600">
                Pregledajte, uređujte i upravljajte nalozima korisnika
              </p>
            </div>
          </Card>

          <Card hoverable onClick={() => router.push('/admin/exercises')}>
            <div className="text-center py-6">
              <Dumbbell className="mx-auto mb-4 text-green-600" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upravljanje vežbama
              </h3>
              <p className="text-sm text-gray-600">
                Dodajte, uređujte i brišite vežbe
              </p>
            </div>
          </Card>

          <Card hoverable onClick={() => router.push('/admin/content')}>
            <div className="text-center py-6">
              <TrendingUp className="mx-auto mb-4 text-purple-600" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Moderacija sadržaja
              </h3>
              <p className="text-sm text-gray-600">
                Pregledajte i moderujte korisnički sadržaj
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
