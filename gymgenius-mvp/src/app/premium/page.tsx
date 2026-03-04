'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/utils/api-client';
import { Crown, Zap, Camera, Brain, Lock, CheckCircle } from 'lucide-react';
import { UserRole } from '@/types/models';
import toast from 'react-hot-toast';

const PREMIUM_FEATURES = [
  {
    icon: Brain,
    title: '7-Day AI Workout Plan',
    description: 'Generišite potpuni sedmodnevni plan treninga personalizovan za vaš profil',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Camera,
    title: 'Neograničene fotografije napretka',
    description: 'Pratite vizuelni napredak bez ograničenja broja fotografija',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Zap,
    title: 'Napredna analitika',
    description: 'Detaljni izveštaji o napretku, trends analiza i personalizovane preporuke',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
  },
];

const FREE_FEATURES = [
  'Osnovno AI generisanje treninga',
  'Praćenje obroka i ishrane',
  'Kalkulator makronutrijenata',
  'Fitness izazovi i leaderboard',
  'Osnovna statistika napretka',
  'Upravljanje vežbama',
];

const PREMIUM_PERKS = [
  'Sve Free funkcionalnosti',
  '7-Day personalizovani AI plan',
  'Napredna AI sa profilom optimizacija',
  'Prioritetna podrška',
  'Rani pristup novim funkcijama',
];

export default function PremiumPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const isPremium = user?.role === UserRole.PREMIUM || user?.role === UserRole.ADMIN;

  const handleGenerateWeeklyPlan = async () => {
    if (!isPremium) {
      toast.error('Ova funkcija zahteva Premium nalog');
      return;
    }
    setIsGenerating(true);
    try {
      const response = await apiFetch('/api/premium/ai-weekly-plan', {
        method: 'POST',
        
        body: JSON.stringify({ durationWeeks: 4, includeNutrition: true }),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedPlan(data.data);
        toast.success('Premium 7-Day plan generisan!');
      } else {
        toast.error(data.error || 'Greška pri generisanju plana');
      }
    } catch {
      toast.error('Greška pri generisanju plana');
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
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Crown className="text-yellow-500" size={40} />
            <h1 className="text-4xl font-bold text-gray-900">GymGenius Premium</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Otključajte napredne AI funkcije i personalizovane planove treninga
          </p>
          {isPremium && (
            <div className="mt-3 inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-medium">
              <Crown size={16} />
              Vaš nalog je Premium aktivan
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Free */}
          <Card>
            <div className="p-2">
              <p className="text-sm font-medium text-gray-500 mb-1">Free</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">$0<span className="text-sm font-normal text-gray-500">/mesec</span></p>
              <p className="text-sm text-gray-500 mb-4">Osnovna funkcionalnost</p>
              <div className="space-y-2 mb-6">
                {FREE_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <Button variant="outline" fullWidth disabled={!isPremium}>
                {isPremium ? 'Vaš trenutni plan' : 'Aktivan plan'}
              </Button>
            </div>
          </Card>

          {/* Premium */}
          <Card className="border-2 border-yellow-400 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full">
              PREPORUČENO
            </div>
            <div className="p-2">
              <p className="text-sm font-medium text-yellow-600 mb-1">Premium</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">$9.99<span className="text-sm font-normal text-gray-500">/mesec</span></p>
              <p className="text-sm text-gray-500 mb-4">Sve što vam treba</p>
              <div className="space-y-2 mb-6">
                {PREMIUM_PERKS.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-yellow-500 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              {isPremium ? (
                <Button fullWidth disabled>Premium aktivan</Button>
              ) : (
                <Button fullWidth onClick={() => toast('Kontaktirajte administratora za Premium nalog')}>
                  <Crown size={16} className="mr-2" />
                  Nadogradite na Premium
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Premium Features */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Premium Funkcionalnosti</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {PREMIUM_FEATURES.map((feature) => (
            <Card key={feature.title} className="relative overflow-hidden">
              {!isPremium && (
                <div className="absolute inset-0 bg-gray-50/80 backdrop-blur-[1px] flex items-center justify-center rounded-lg z-10">
                  <div className="text-center">
                    <Lock className="mx-auto text-gray-400 mb-1" size={20} />
                    <p className="text-xs text-gray-500">Zahteva Premium</p>
                  </div>
                </div>
              )}
              <div className={`w-10 h-10 ${feature.bg} rounded-lg flex items-center justify-center mb-3`}>
                <feature.icon className={feature.color} size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Premium Action - 7-Day AI Plan */}
        {isPremium && (
          <Card className="border-2 border-purple-200 bg-purple-50">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="text-purple-600" size={24} />
                  <h3 className="text-lg font-bold text-gray-900">Generiši Premium AI Plan</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Kreirajte potpuni 7-dnevni plan treninga sa preporukama za ishranu,
                  personalizovan na osnovu vašeg profila i ciljeva.
                </p>
                <Button
                  onClick={handleGenerateWeeklyPlan}
                  disabled={isGenerating}
                >
                  <Zap size={16} className="mr-2" />
                  {isGenerating ? 'Generišem plan...' : 'Generiši 7-Day Plan'}
                </Button>
              </div>
            </div>

            {generatedPlan && (
              <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
                <h4 className="font-bold text-gray-900 mb-1">{generatedPlan.name}</h4>
                {generatedPlan.weeklySchedule?.length > 0 && (
                  <p className="text-sm text-gray-600 mb-2">
                    {generatedPlan.weeklySchedule.length} dana · {generatedPlan.durationWeeks} nedelja
                  </p>
                )}
                {generatedPlan.nutritionTips && (
                  <div className="mt-3 p-3 bg-green-50 rounded text-sm text-green-800">
                    <strong>Ishrana:</strong> {generatedPlan.nutritionTips}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => router.push('/ai-workout')}
                >
                  Pogledaj u AI Workout →
                </Button>
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
