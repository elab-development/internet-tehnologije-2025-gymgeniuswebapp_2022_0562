'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Trophy, Medal, ArrowLeft, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/utils/api-client';

export default function ChallengeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [challenge, setChallenge] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChallengeDetails = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch(`/api/challenges/${params.id}`, {
              });

      const data = await response.json();
      if (data.success) {
        setChallenge(data.data.challenge);
        setLeaderboard(data.data.leaderboard);
      }
    } catch (error) {
      console.error('Fetch challenge details error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    try {
      const response = await apiFetch(`/api/challenges/${params.id}/progress`, {
        method: 'POST',
        
        body: JSON.stringify({ progressIncrement: 1 }),
      });

      const data = await response.json();
      if (data.success) {
        fetchChallengeDetails(); // Refresh
      }
    } catch (error) {
      console.error('Update progress error:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchChallengeDetails();
    }
  }, [isAuthenticated, params.id]);

  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Učitavanje...</div>;
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (!challenge) {
    return <div>Izazov nije pronađen</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/challenges')}
          leftIcon={<ArrowLeft size={20} />}
          className="mb-6"
        >
          Nazad na izazove
        </Button>

        {/* Challenge Header */}
        <Card className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{challenge.name}</h1>
              <p className="text-gray-600 mb-4">{challenge.description}</p>
              <div className="flex gap-4 text-sm text-gray-700">
                <span>
                  <strong>Cilj:</strong> {challenge.targetValue} {challenge.targetUnit}
                </span>
                <span>
                  <strong>Učesnici:</strong> {challenge.participantCount}
                </span>
                <span>
                  <strong>Status:</strong>{' '}
                  <span className="capitalize font-medium text-green-600">
                    {challenge.status}
                  </span>
                </span>
              </div>
            </div>
            <Trophy className="text-yellow-500" size={64} />
          </div>

          {/* Update Progress Button */}
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={handleUpdateProgress}
              leftIcon={<TrendingUp size={20} />}
            >
              Zabilježi napredak (+1)
            </Button>
          </div>
        </Card>

        {/* Leaderboard */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🏆 Rang lista</h2>

          {leaderboard.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nema učesnika</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((participant, index) => (
                <div
                  key={participant.userId}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0
                      ? 'bg-yellow-50 border-2 border-yellow-400'
                      : index === 1
                      ? 'bg-gray-100 border-2 border-gray-400'
                      : index === 2
                      ? 'bg-orange-50 border-2 border-orange-400'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12 h-12">
                      {index === 0 ? (
                        <Medal className="text-yellow-500" size={32} />
                      ) : index === 1 ? (
                        <Medal className="text-gray-500" size={32} />
                      ) : index === 2 ? (
                        <Medal className="text-orange-500" size={32} />
                      ) : (
                        <span className="text-2xl font-bold text-gray-600">
                          {participant.rank}
                        </span>
                      )}
                    </div>

                    {/* User Info */}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {participant.displayName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Serija: {participant.currentStreak} dana
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">
                      {participant.currentProgress}
                    </p>
                    <p className="text-sm text-gray-500">
                      {Math.round(
                        (participant.currentProgress / challenge.targetValue) * 100
                      )}
                      % završeno
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
