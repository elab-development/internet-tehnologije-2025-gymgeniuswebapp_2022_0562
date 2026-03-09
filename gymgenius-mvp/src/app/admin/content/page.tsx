'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { ShieldCheck, FileText, Image, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';

interface ContentStats {
  totalWorkoutLogs: number;
  totalMeals: number;
  totalPhotos: number;
  totalGoals: number;
}

export default function AdminContentPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchContentStats();
    }
  }, [isAuthenticated, authLoading, user]);

  const fetchContentStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats({
          totalWorkoutLogs: data.data.recentActivity?.workoutsLast7Days ?? 0,
          totalMeals: data.data.overview?.totalMeals ?? 0,
          totalPhotos: data.data.overview?.totalPhotos ?? 0,
          totalGoals: data.data.overview?.totalGoals ?? 0,
        });
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const contentAreas = [
    {
      icon: <FileText className="text-blue-600" size={28} />,
      bg: 'bg-blue-100',
      label: 'Workout logovi',
      desc: 'Pregled i moderacija logovanih treninga korisnika',
      stat: stats?.totalWorkoutLogs ?? 0,
      statLabel: 'logova (7 dana)',
      status: 'ok',
    },
    {
      icon: <MessageSquare className="text-green-600" size={28} />,
      bg: 'bg-green-100',
      label: 'Unosi ishrane',
      desc: 'Pregled logiranih obroka i nutritivnih podataka',
      stat: stats?.totalMeals ?? 0,
      statLabel: 'ukupno obroka',
      status: 'ok',
    },
    {
      icon: <Image className="text-purple-600" size={28} />,
      bg: 'bg-purple-100',
      label: 'Progress fotografije',
      desc: 'Moderacija upload-ovanih progress fotografija korisnika',
      stat: stats?.totalPhotos ?? 0,
      statLabel: 'fotografija',
      status: 'ok',
    },
    {
      icon: <CheckCircle className="text-orange-600" size={28} />,
      bg: 'bg-orange-100',
      label: 'Fitness ciljevi',
      desc: 'Pregled postavljenih ciljeva korisnika',
      stat: stats?.totalGoals ?? 0,
      statLabel: 'aktivnih ciljeva',
      status: 'ok',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-sm text-gray-500 hover:text-primary-600 mb-4 flex items-center gap-1"
          >
            ← Nazad na Admin Dashboard
          </button>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-purple-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Moderacija sadržaja</h1>
          </div>
          <p className="text-gray-600">Pregled i upravljanje korisničkim sadržajem platforme</p>
        </div>

        {/* Policy notice */}
        <Card className="mb-8 bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-amber-900">Smernice za moderaciju</h3>
              <p className="text-sm text-amber-800 mt-1">
                Sadržaj koji krše uslove korišćenja (neprimeren sadržaj u fotografijama, lažni podaci o vežbama)
                treba biti uklonjen. Koristite admin korisničku tablu za upravljanje korisničkim nalozima.
              </p>
            </div>
          </div>
        </Card>

        {/* Content stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {contentAreas.map((area, i) => (
            <Card key={i}>
              <div className="flex items-start gap-4">
                <div className={`${area.bg} p-3 rounded-full flex-shrink-0`}>
                  {area.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{area.label}</h3>
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle size={12} /> Aktivno
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{area.desc}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{area.stat}</span>
                    <span className="text-sm text-gray-500">{area.statLabel}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Brze akcije moderatora</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => router.push('/admin/users')}>
              <FileText size={16} className="mr-2" />
              Upravljanje korisnicima
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/exercises')}>
              <CheckCircle size={16} className="mr-2" />
              Upravljanje bazom vežbi
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
