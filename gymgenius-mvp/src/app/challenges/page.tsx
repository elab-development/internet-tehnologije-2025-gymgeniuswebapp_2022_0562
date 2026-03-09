'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Trophy, Users, Calendar, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/utils/api-client';

export default function ChallengesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [challenges, setChallenges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming'>('active');

  const fetchChallenges = async () => {
    setIsLoading(true);
    try {
      const statusParam = filter === 'all' ? '' : `?status=${filter}`;

      const response = await apiFetch(`/api/challenges${statusParam}`, {
              });

      const data = await response.json();
      if (data.success) {
        setChallenges(data.data.challenges);
      }
    } catch (error) {
      console.error('Fetch challenges error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const response = await apiFetch(`/api/challenges/${challengeId}/join`, {
        method: 'POST',
              });

      const data = await response.json();
      if (data.success) {
        fetchChallenges(); // Refresh
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Join challenge error:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchChallenges();
    }
  }, [isAuthenticated, filter]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Učitavanje...</div>;
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
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="text-yellow-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Izazovi</h1>
          </div>
          <p className="text-gray-600">
            Pridružite se izazovima, takmičite se sa drugima i postignite vaše fitness ciljeve
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Svi
          </Button>
          <Button
            variant={filter === 'active' ? 'primary' : 'outline'}
            onClick={() => setFilter('active')}
          >
            Aktivni
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'primary' : 'outline'}
            onClick={() => setFilter('upcoming')}
          >
            Nadolazeći
          </Button>
        </div>

        {/* Challenges Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md h-64 animate-pulse" />
            ))}
          </div>
        ) : challenges.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Trophy className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-600">Nema pronađenih izazova</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <Card
                key={challenge.challengeId}
                hoverable
                onClick={() => router.push(`/challenges/${challenge.challengeId}`)}
                className={`${
                  challenge.isParticipating ? 'border-2 border-primary-500' : ''
                }`}
              >
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{challenge.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users size={16} />
                      <span>{challenge.participantCount} učesnika</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Target size={16} />
                      <span>
                        Cilj: {challenge.targetValue} {challenge.targetUnit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar size={16} />
                      <span>
                        {new Date(challenge.startDate.seconds * 1000).toLocaleDateString()} -{' '}
                        {new Date(challenge.endDate.seconds * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        challenge.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : challenge.status === 'upcoming'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {challenge.status.toUpperCase()}
                    </span>
                  </div>

                  {/* User Progress (if participating) */}
                  {challenge.isParticipating && challenge.userProgress && (
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-primary-900">
                          Vaš napredak
                        </span>
                        <span className="text-sm font-bold text-primary-700">
                          {challenge.userProgress.currentProgress} /{' '}
                          {challenge.targetValue}
                        </span>
                      </div>
                      <div className="w-full bg-primary-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (challenge.userProgress.currentProgress /
                                challenge.targetValue) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {!challenge.isParticipating && challenge.status !== 'completed' && (
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinChallenge(challenge.challengeId);
                      }}
                    >
                      Pridruži se izazovu
                    </Button>
                  )}

                  {challenge.isParticipating && (
                    <Button variant="outline" fullWidth leftIcon={<TrendingUp size={16} />}>
                      Rang lista
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
