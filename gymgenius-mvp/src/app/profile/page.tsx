'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { User, Save } from 'lucide-react';
import { Gender, FitnessGoal, ActivityLevel, Equipment } from '@/types/models';
import toast from 'react-hot-toast';

const GOAL_LABELS: Record<FitnessGoal, string> = {
  [FitnessGoal.WEIGHT_LOSS]: 'Mršavljenje',
  [FitnessGoal.MUSCLE_GAIN]: 'Hipertrofija (povećanje mišića)',
  [FitnessGoal.STRENGTH]: 'Snaga',
  [FitnessGoal.ENDURANCE]: 'Izdržljivost',
  [FitnessGoal.GENERAL_FITNESS]: 'Opšta kondicija',
};

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  [ActivityLevel.SEDENTARY]: 'Sedentar (bez vežbanja)',
  [ActivityLevel.LIGHTLY_ACTIVE]: 'Malo aktivan (1-3 dana/ned.)',
  [ActivityLevel.MODERATELY_ACTIVE]: 'Umereno aktivan (3-5 dana/ned.)',
  [ActivityLevel.VERY_ACTIVE]: 'Veoma aktivan (6-7 dana/ned.)',
  [ActivityLevel.EXTRA_ACTIVE]: 'Ekstra aktivan (fizički posao + trening)',
};

const EQUIPMENT_LABELS: Record<Equipment, string> = {
  [Equipment.BARBELL]: 'Bučice sa šipkom (Barbell)',
  [Equipment.DUMBBELL]: 'Bučice (Dumbbell)',
  [Equipment.MACHINE]: 'Sprave',
  [Equipment.BODYWEIGHT]: 'Bez opreme (Bodyweight)',
  [Equipment.RESISTANCE_BAND]: 'Elastične gume',
  [Equipment.KETTLEBELL]: 'Kettlebell',
  [Equipment.CABLE]: 'Kablovi (Cable)',
};

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    displayName: '',
    age: '',
    gender: '' as Gender | '',
    weight: '',
    height: '',
    goal: '' as FitnessGoal | '',
    activityLevel: '' as ActivityLevel | '',
    availableEquipment: [] as Equipment[],
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          const p = data.data;
          setForm({
            displayName: p.displayName || '',
            age: p.age ? String(p.age) : '',
            gender: p.gender || '',
            weight: p.weight ? String(p.weight) : '',
            height: p.height ? String(p.height) : '',
            goal: p.goal || '',
            activityLevel: p.activityLevel || '',
            availableEquipment: p.availableEquipment || [],
          });
        }
      } catch (error) {
        console.error('Fetch profile error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [isAuthenticated]);

  const toggleEquipment = (eq: Equipment) => {
    setForm((prev) => ({
      ...prev,
      availableEquipment: prev.availableEquipment.includes(eq)
        ? prev.availableEquipment.filter((e) => e !== eq)
        : [...prev.availableEquipment, eq],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload: Record<string, unknown> = {};

      if (form.displayName) payload.displayName = form.displayName;
      if (form.age) payload.age = Number(form.age);
      if (form.gender) payload.gender = form.gender;
      if (form.weight) payload.weight = Number(form.weight);
      if (form.height) payload.height = Number(form.height);
      if (form.goal) payload.goal = form.goal;
      if (form.activityLevel) payload.activityLevel = form.activityLevel;
      payload.availableEquipment = form.availableEquipment;

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Profil sačuvan!');
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Greška pri čuvanju');
      }
    } catch {
      toast.error('Greška pri čuvanju profila');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <User className="text-primary-600" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Moj profil</h1>
            <p className="text-gray-600 text-sm">Popunite podatke za personalizovani AI workout plan</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Osnovni podaci */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Osnovni podaci</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ime i prezime</label>
                <Input placeholder="Vaše ime" value={form.displayName} onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Godine</label>
                <Input type="number" min="13" max="120" placeholder="Npr. 25" value={form.age} onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pol</label>
                <select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as Gender }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Odaberite pol</option>
                  <option value={Gender.MALE}>Muški</option>
                  <option value={Gender.FEMALE}>Ženski</option>
                  <option value={Gender.OTHER}>Ostalo</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Fizički podaci */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Fizički podaci</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telesna težina (kg)</label>
                <Input type="number" min="20" max="500" step="0.1" placeholder="Npr. 80" value={form.weight} onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visina (cm)</label>
                <Input type="number" min="100" max="250" placeholder="Npr. 180" value={form.height} onChange={(e) => setForm((p) => ({ ...p, height: e.target.value }))} />
              </div>
            </div>
          </Card>

          {/* Fitness cilj */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Fitness cilj</h2>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(FitnessGoal).map((goal) => (
                <label key={goal} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  form.goal === goal ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" name="goal" value={goal} checked={form.goal === goal} onChange={() => setForm((p) => ({ ...p, goal }))} className="accent-primary-600" />
                  <span className="text-sm font-medium">{GOAL_LABELS[goal]}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Nivo aktivnosti */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Nivo aktivnosti</h2>
            <div className="space-y-2">
              {Object.values(ActivityLevel).map((level) => (
                <label key={level} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  form.activityLevel === level ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" name="activityLevel" value={level} checked={form.activityLevel === level} onChange={() => setForm((p) => ({ ...p, activityLevel: level }))} className="accent-primary-600" />
                  <span className="text-sm">{ACTIVITY_LABELS[level]}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Dostupna oprema */}
          <Card>
            <h2 className="text-lg font-semibold mb-1">Dostupna oprema</h2>
            <p className="text-sm text-gray-500 mb-4">Označite opremu kojoj imate pristup za AI generisanje plana</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.values(Equipment).map((eq) => (
                <label key={eq} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  form.availableEquipment.includes(eq) ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="checkbox" checked={form.availableEquipment.includes(eq)} onChange={() => toggleEquipment(eq)} className="accent-primary-600" />
                  <span className="text-sm">{EQUIPMENT_LABELS[eq]}</span>
                </label>
              ))}
            </div>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button" onClick={() => router.push('/dashboard')}>Otkaži</Button>
            <Button type="submit" disabled={isSaving}>
              <Save size={16} className="mr-2" />
              {isSaving ? 'Čuvanje...' : 'Sačuvaj profil'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
