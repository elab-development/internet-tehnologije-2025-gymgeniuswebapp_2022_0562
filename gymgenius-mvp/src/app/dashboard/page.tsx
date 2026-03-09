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
  weeklyWorkouts: number;
}

interface RecentActivity {
  id: string;
  label: string;
  sub: string;
  color: string;
  icon: 'dumbbell' | 'target' | 'trending';
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkouts: 0,
    currentStreak: 0,
    activeGoals: 0,
    weeklyProgress: 0,
    weeklyWorkouts: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchDashboardData() {
      setStatsLoading(true);
      try {
        const [logsRes, goalsRes] = await Promise.all([
          fetch('/api/workout-logs?limit=50'),
          fetch('/api/goals?status=active'),
        ]);

        const logsData = logsRes.ok ? await logsRes.json() : null;
        const goalsData = goalsRes.ok ? await goalsRes.json() : null;

        const logs: any[] = logsData?.data?.logs ?? [];
        const activeGoals: number = goalsData?.data?.total ?? 0;

        // Ukupno treninga - koristimo pravi total iz API-ja (nije ograničen limitom)
        const totalWorkouts: number = logsData?.data?.total ?? logs.length;

        // Streak: broj uzastopnih dana sa treningom (od danas unazad)
        const streak = calculateStreak(logs);

        // Nedeljni napredak: koliko treninga u poslednjih 7 dana (target: 5)
        // Koristimo lokalni datum da izbegnemo UTC timezone problem
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const thisWeekCount = logs.filter((log) => {
          const d = log.date?.toDate ? log.date.toDate() : new Date(log.date ?? log.createdAt);
          return d.getTime() >= weekAgo;
        }).length;
        const weeklyProgress = Math.min(Math.round((thisWeekCount / 5) * 100), 100);

        setStats({ totalWorkouts, currentStreak: streak, activeGoals, weeklyProgress, weeklyWorkouts: thisWeekCount });

        // Nedavna aktivnost - poslednjih 3 treninga
        const recent: RecentActivity[] = logs.slice(0, 3).map((log) => {
          const d = log.date?.toDate ? log.date.toDate() : new Date(log.date ?? log.createdAt);
          const daysAgo = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
          const timeLabel = daysAgo === 0 ? 'danas' : daysAgo === 1 ? 'juče' : `pre ${daysAgo} dana`;
          return {
            id: log.logId ?? log.id,
            label: log.notes ? log.notes : `Trening - ${log.duration ?? 0} min`,
            sub: timeLabel,
            color: 'green',
            icon: 'dumbbell',
          };
        });

        setRecentActivity(recent);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setStatsLoading(false);
      }
    }

    fetchDashboardData();
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
            Dobrodošli nazad, {user?.displayName || 'Sportista'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Evo vašeg fitness pregleda za danas
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ukupno treninga</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statsLoading ? '—' : stats.totalWorkouts}
                </p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full">
                <Dumbbell className="text-primary-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Trenutni niz</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statsLoading ? '—' : `${stats.currentStreak} dana`}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Aktivni ciljevi</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statsLoading ? '—' : stats.activeGoals}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Target className="text-orange-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nedeljni napredak</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statsLoading ? '—' : `${stats.weeklyProgress}%`}
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
          {/* Start Workout */}
          <Card
            title="Spremi se za trening"
            subtitle="Pretraži vežbe ili generiši AI plan"
            hoverable
          >
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Treninga ove nedelje:</span>
                <span className="font-medium">
                  {statsLoading ? '—' : stats.weeklyWorkouts}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Aktivnih ciljeva:</span>
                <span className="font-medium">{statsLoading ? '—' : stats.activeGoals}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Nedeljni target:</span>
                <span className="font-medium text-orange-600">5 treninga</span>
              </div>
            </div>

            <Button variant="primary" fullWidth onClick={() => router.push('/exercises')}>
              Pregledaj vežbe
            </Button>
          </Card>

          {/* Recent Activity */}
          <Card title="Nedavna aktivnost">
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">Još nema zabeleženih treninga.</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => router.push('/exercises')}
                >
                  Počni prvi trening
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 pb-3 ${idx < recentActivity.length - 1 ? 'border-b' : ''}`}
                  >
                    <div className="bg-green-100 p-2 rounded-full">
                      <Dumbbell className="text-green-600" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* AI Recommendation */}
        <Card className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">AI Preporuka</h3>
              <p className="text-primary-50 mb-4">
                Na osnovu vašeg napretka, preporučujemo da se fokusirate na progresivno
                opterećenje za složena vežbe ove nedelje.
              </p>
              <Button variant="outline" className="bg-white text-primary-700 border-white hover:bg-primary-50" onClick={() => router.push('/ai-workout')}>
                Generiši novi plan
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

/**
 * Računa streak: broj uzastopnih dana sa bar jednim treningom, unazad od danas
 */
/** Vraća datum u lokalnom formatu YYYY-MM-DD (bez UTC konverzije) */
function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Računa streak: broj uzastopnih dana sa bar jednim treningom, unazad od danas
 */
function calculateStreak(logs: any[]): number {
  if (logs.length === 0) return 0;

  const trainingDays = new Set(
    logs.map((log) => {
      const d = log.date?.toDate ? log.date.toDate() : new Date(log.date ?? log.createdAt);
      return toLocalDateKey(d);
    })
  );

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = toLocalDateKey(day);

    if (trainingDays.has(key)) {
      streak++;
    } else if (i > 0) {
      // Prekid niza (i === 0 preskačemo - možda danas još nije trenirao)
      break;
    }
  }

  return streak;
}
