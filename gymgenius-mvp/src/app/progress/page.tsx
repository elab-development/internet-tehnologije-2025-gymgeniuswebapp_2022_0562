'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { TrendingUp, Calendar, Target, Plus, Trash2, Clock, Camera, Upload, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/utils/api-client';
import dynamic from 'next/dynamic';

const WeightProgressChart = dynamic(() => import('@/components/charts/WeightProgressChart'), { ssr: false });
const WorkoutVolumeChart = dynamic(() => import('@/components/charts/WorkoutVolumeChart'), { ssr: false });
const CalorieIntakeChart = dynamic(() => import('@/components/charts/CalorieIntakeChart'), { ssr: false });
const MuscleGroupPieChart = dynamic(() => import('@/components/charts/MuscleGroupPieChart'), { ssr: false });
import { GoalType, GoalStatus, PhotoCategory } from '@/types/models';
import toast from 'react-hot-toast';

interface Goal {
  goalId: string;
  type: GoalType;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  status: GoalStatus;
}

const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  [GoalType.WEIGHT]: 'Telesna težina',
  [GoalType.STRENGTH]: 'Snaga (PR)',
  [GoalType.CONSISTENCY]: 'Konzistentnost',
  [GoalType.NUTRITION]: 'Ishrana',
};

export default function ProgressPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Goals state
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({
    type: GoalType.WEIGHT,
    title: '',
    description: '',
    targetValue: '',
    currentValue: '',
    unit: 'kg',
    deadline: '',
  });
  const [submittingGoal, setSubmittingGoal] = useState(false);

  // Photo state
  interface ProgressPhoto { photoId: string; url: string; category: PhotoCategory; notes?: string; date: string; }
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoNotes, setPhotoNotes] = useState('');
  const [photoCategory, setPhotoCategory] = useState<PhotoCategory>(PhotoCategory.FRONT);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PHOTO_CATEGORY_LABELS: Record<PhotoCategory, string> = {
    [PhotoCategory.FRONT]: 'Prednja strana',
    [PhotoCategory.BACK]: 'Zadnja strana',
    [PhotoCategory.SIDE]: 'Bočna strana',
    [PhotoCategory.OTHER]: 'Ostalo',
  };

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stats/progress?period=${period}`, {
              });
      const data = await response.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  const fetchGoals = useCallback(async () => {
    setGoalsLoading(true);
    try {
      const response = await fetch('/api/goals?status=active', {
              });
      const data = await response.json();
      if (data.success) setGoals(data.data.goals);
    } catch (error) {
      console.error('Fetch goals error:', error);
    } finally {
      setGoalsLoading(false);
    }
  }, []);

  const fetchPhotos = useCallback(async () => {
    setPhotosLoading(true);
    try {
      const response = await fetch('/api/progress/photos', {
              });
      const data = await response.json();
      if (data.success) setPhotos(data.data.photos);
    } catch (error) {
      console.error('Fetch photos error:', error);
    } finally {
      setPhotosLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchGoals();
      fetchPhotos();
    }
  }, [isAuthenticated, fetchStats, fetchGoals, fetchPhotos]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.title || !goalForm.targetValue || !goalForm.deadline) {
      toast.error('Popunite sva obavezna polja');
      return;
    }
    setSubmittingGoal(true);
    try {
      const response = await apiFetch('/api/goals', {
        method: 'POST',
        body: JSON.stringify({
          type: goalForm.type,
          title: goalForm.title,
          description: goalForm.description || undefined,
          targetValue: Number(goalForm.targetValue),
          currentValue: Number(goalForm.currentValue) || 0,
          unit: goalForm.unit,
          deadline: goalForm.deadline,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Cilj je kreiran!');
        setShowGoalForm(false);
        setGoalForm({ type: GoalType.WEIGHT, title: '', description: '', targetValue: '', currentValue: '', unit: 'kg', deadline: '' });
        await fetchGoals();
      } else {
        toast.error(data.error || 'Greška pri kreiranju cilja');
      }
    } catch {
      toast.error('Greška pri kreiranju cilja');
    } finally {
      setSubmittingGoal(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj cilj?')) return;
    try {
      const response = await apiFetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
              });
      const data = await response.json();
      if (data.success) {
        toast.success('Cilj obrisan');
        await fetchGoals();
      }
    } catch {
      toast.error('Greška pri brisanju');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('category', photoCategory);
      if (photoNotes.trim()) formData.append('notes', photoNotes.trim());
      formData.append('date', new Date().toISOString().split('T')[0]);

      const response = await apiFetch('/api/progress/photos', {
        method: 'POST',
                body: formData,
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Fotografija uploadovana!');
        setPhotoNotes('');
        await fetchPhotos();
      } else {
        toast.error(data.error || 'Greška pri uploadu');
      }
    } catch {
      toast.error('Greška pri uploadu fotografije');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu fotografiju?')) return;
    try {
      const response = await apiFetch(`/api/progress/photos/${photoId}`, {
        method: 'DELETE',
              });
      const data = await response.json();
      if (data.success) {
        toast.success('Fotografija obrisana');
        await fetchPhotos();
      }
    } catch {
      toast.error('Greška pri brisanju');
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-primary-600" size={32} />
              <h1 className="text-3xl font-bold text-gray-900">Progres i statistika</h1>
            </div>
            <p className="text-gray-600">Prati svoj fitnes napredak sa detaljnom analitikom!</p>
          </div>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((p) => (
              <Button key={p} variant={period === p ? 'primary' : 'outline'} size="sm" onClick={() => setPeriod(p)}>
                {p === 'week' ? 'Week' : p === 'month' ? 'Month' : 'Year'}
              </Button>
            ))}
          </div>
        </div>

        {/* ========== GOALS SECTION ========== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="text-primary-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Moji ciljevi</h2>
            </div>
            <Button size="sm" onClick={() => setShowGoalForm(!showGoalForm)}>
              <Plus size={16} className="mr-1" /> Novi cilj
            </Button>
          </div>

          {/* Goal creation form */}
          {showGoalForm && (
            <Card className="mb-4">
              <h3 className="font-semibold mb-4">Postavi novi cilj</h3>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tip cilja *</label>
                    <select
                      value={goalForm.type}
                      onChange={(e) => setGoalForm((p) => ({ ...p, type: e.target.value as GoalType }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {Object.values(GoalType).map((t) => (
                        <option key={t} value={t}>{GOAL_TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Naziv cilja *</label>
                    <Input
                      required
                      placeholder="Npr. Izgubiti 5kg do leta"
                      value={goalForm.title}
                      onChange={(e) => setGoalForm((p) => ({ ...p, title: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trenutna vrednost *</label>
                    <Input
                      type="number"
                      required
                      placeholder="Npr. 85"
                      value={goalForm.currentValue}
                      onChange={(e) => setGoalForm((p) => ({ ...p, currentValue: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciljna vrednost *</label>
                    <Input
                      type="number"
                      required
                      placeholder="Npr. 80"
                      value={goalForm.targetValue}
                      onChange={(e) => setGoalForm((p) => ({ ...p, targetValue: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jedinica *</label>
                    <Input
                      required
                      placeholder="kg, reps, kcal..."
                      value={goalForm.unit}
                      onChange={(e) => setGoalForm((p) => ({ ...p, unit: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rok (datum) *</label>
                    <Input
                      type="date"
                      required
                      min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                      value={goalForm.deadline}
                      onChange={(e) => setGoalForm((p) => ({ ...p, deadline: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Opis (opciono)</label>
                    <Input
                      placeholder="Kratki opis ili motivacija..."
                      value={goalForm.description}
                      onChange={(e) => setGoalForm((p) => ({ ...p, description: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" type="button" onClick={() => setShowGoalForm(false)}>Otkaži</Button>
                  <Button type="submit" disabled={submittingGoal}>
                    {submittingGoal ? 'Čuvanje...' : 'Sačuvaj cilj'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Goals list */}
          {goalsLoading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
            </div>
          ) : goals.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <Target className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-600">Nemate aktivnih ciljeva</p>
                <p className="text-sm text-gray-400 mt-1">Kliknite "Novi cilj" da postavite merljive ciljeve</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => {
                const range = Math.abs(goal.targetValue - goal.currentValue) + Math.abs(goal.targetValue - goal.currentValue);
                const totalRange = Math.abs(goal.targetValue - (goal.currentValue > goal.targetValue ? goal.targetValue - (goal.currentValue - goal.targetValue) : goal.currentValue));
                const progressValue =
                  totalRange === 0
                    ? 100
                    : Math.min(
                        100,
                        Math.round(
                          (Math.abs(goal.currentValue - (goal.currentValue > goal.targetValue
                            ? goal.currentValue + (goal.currentValue - goal.targetValue)
                            : goal.currentValue - (goal.targetValue - goal.currentValue))) / (range || 1)) * 100
                        )
                      );

                // Simpler progress calculation
                const start = goal.currentValue;
                const target = goal.targetValue;
                const diff = Math.abs(target - start);
                const currentDiff = Math.abs(target - goal.currentValue);
                const pct = diff === 0 ? 100 : Math.min(100, Math.round(((diff - currentDiff) / diff) * 100));

                const deadline = new Date(goal.deadline);
                const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / 86400000);

                return (
                  <Card key={goal.goalId}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                          {GOAL_TYPE_LABELS[goal.type]}
                        </span>
                        <h4 className="font-semibold text-gray-900 mt-1">{goal.title}</h4>
                        {goal.description && <p className="text-sm text-gray-500">{goal.description}</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal.goalId)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          {goal.currentValue} → {goal.targetValue} {goal.unit}
                        </span>
                        <span className="font-medium text-primary-600">{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>
                        {daysLeft > 0
                          ? `${daysLeft} dana do roka (${deadline.toLocaleDateString('sr-RS')})`
                          : 'Rok je prošao'}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ========== PHOTO GALLERY SECTION ========== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="text-primary-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Fotografije napretka</h2>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={photoCategory}
                onChange={(e) => setPhotoCategory(e.target.value as PhotoCategory)}
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {Object.values(PhotoCategory).map((c) => (
                  <option key={c} value={c}>{PHOTO_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
              >
                <Upload size={16} className="mr-1" />
                {uploadingPhoto ? 'Otpremanje...' : 'Dodaj foto'}
              </Button>
            </div>
          </div>

          {photosLoading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
            </div>
          ) : photos.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <Camera className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-600">Nema fotografija napretka</p>
                <p className="text-sm text-gray-400 mt-1">
                  Dodajte fotografije da pratite vizuelni napredak
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.photoId} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-white">
                  <img
                    src={photo.url}
                    alt={`Progress ${photo.category}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-2">
                    <span className="text-xs font-medium text-primary-600">
                      {PHOTO_CATEGORY_LABELS[photo.category]}
                    </span>
                    <p className="text-xs text-gray-500">{photo.date}</p>
                    {photo.notes && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{photo.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeletePhoto(photo.photoId)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Obriši fotografiju"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========== STATS SECTION ========== */}
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
                <p className="text-3xl font-bold text-gray-900">{Math.round(stats.summary.totalVolume)} kg</p>
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

            {stats.weightProgress?.length > 0 && (
              <Card><WeightProgressChart data={stats.weightProgress} /></Card>
            )}
            {stats.workoutVolume?.length > 0 && (
              <Card><WorkoutVolumeChart data={stats.workoutVolume} /></Card>
            )}
            {stats.calorieIntake?.length > 0 && (
              <Card><CalorieIntakeChart data={stats.calorieIntake} /></Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.muscleGroupDistribution?.length > 0 && (
                <Card><MuscleGroupPieChart data={stats.muscleGroupDistribution} /></Card>
              )}
              {stats.workoutFrequency?.length > 0 && (
                <Card>
                  <h3 className="text-lg font-semibold mb-4">Frekvencija treninga</h3>
                  <div className="space-y-2">
                    {stats.workoutFrequency.map((week: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{week.week}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${(week.count / 7) * 100}%` }} />
                          </div>
                          <span className="text-sm font-medium">{week.count} treninga</span>
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
              <p className="text-gray-600">Nema podataka za ovaj period</p>
              <p className="text-sm text-gray-500 mt-2">Počnite da beležite treninge i obroke da vidite vaš napredak!</p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
