'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/utils/api-client';
import { Dumbbell, Plus, Trash2, CheckCircle, Clock, TrendingUp, X, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface SetLog {
  setNumber: number;
  reps: number;
  weight: number;
}

interface ExerciseEntry {
  exerciseName: string;
  sets: SetLog[];
}

interface WorkoutLog {
  logId: string;
  date: any;
  duration: number;
  totalVolume: number;
  exercises: { exerciseName: string; sets: SetLog[] }[];
  notes?: string;
  status: string;
}

export default function WorkoutsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // History state
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // New workout session state
  const [showNewWorkout, setShowNewWorkout] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<ExerciseEntry[]>([
    { exerciseName: '', sets: [{ setNumber: 1, reps: 0, weight: 0 }] },
  ]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const response = await fetch('/api/workout-logs');
      const data = await response.json();
      if (data.success) {
        setLogs(data.data.logs);
      }
    } catch {
      // silent fail
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchLogs();
  }, [isAuthenticated, fetchLogs]);

  // ─── Exercise management ───────────────────────────────
  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      { exerciseName: '', sets: [{ setNumber: 1, reps: 0, weight: 0 }] },
    ]);
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExerciseName = (index: number, name: string) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, exerciseName: name } : ex))
    );
  };

  const addSet = (exIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIndex) return ex;
        const nextNum = ex.sets.length + 1;
        return { ...ex, sets: [...ex.sets, { setNumber: nextNum, reps: 0, weight: 0 }] };
      })
    );
  };

  const removeSet = (exIndex: number, setIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIndex) return ex;
        return {
          ...ex,
          sets: ex.sets
            .filter((_, si) => si !== setIndex)
            .map((s, si) => ({ ...s, setNumber: si + 1 })),
        };
      })
    );
  };

  const updateSet = (exIndex: number, setIndex: number, field: 'reps' | 'weight', value: string) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, si) =>
            si === setIndex ? { ...s, [field]: Number(value) || 0 } : s
          ),
        };
      })
    );
  };

  // ─── Save workout ──────────────────────────────────────
  const handleSaveWorkout = async () => {
    const validExercises = exercises.filter((ex) => ex.exerciseName.trim() !== '');
    if (validExercises.length === 0) {
      toast.error('Dodajte bar jednu vežbu pre čuvanja');
      return;
    }
    setIsSaving(true);
    try {
      const response = await apiFetch('/api/workout-logs', {
        method: 'POST',
        body: JSON.stringify({
          exercises: validExercises,
          duration: Number(duration) || 0,
          notes: notes || undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Trening sačuvan!');
        setShowNewWorkout(false);
        setExercises([{ exerciseName: '', sets: [{ setNumber: 1, reps: 0, weight: 0 }] }]);
        setDuration('');
        setNotes('');
        await fetchLogs();
      } else {
        toast.error(data.error || 'Greška pri čuvanju');
      }
    } catch {
      toast.error('Greška pri čuvanju treninga');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date._seconds ? new Date(date._seconds * 1000) : new Date(date);
    return d.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Dumbbell className="text-primary-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Treninzi</h1>
              <p className="text-gray-600">Logujte i pratite istoriju svojih treninga</p>
            </div>
          </div>
          <Button onClick={() => setShowNewWorkout(!showNewWorkout)}>
            <Plus size={16} className="mr-2" />
            Novi trening
          </Button>
        </div>

        {/* ── New Workout Form ── */}
        {showNewWorkout && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Logiraj trening</h2>
              <button onClick={() => setShowNewWorkout(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Duration & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trajanje (minuti)</label>
                <Input
                  type="number"
                  min="1"
                  placeholder="npr. 45"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Napomena (opciono)</label>
                <Input
                  placeholder="Kako je prošao trening?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Exercises */}
            <div className="space-y-4 mb-6">
              {exercises.map((ex, exIndex) => (
                <div key={exIndex} className="border border-gray-200 rounded-lg p-4">
                  {/* Exercise name row */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1">
                      <Input
                        placeholder={`Vežba ${exIndex + 1} (npr. Bench Press)`}
                        value={ex.exerciseName}
                        onChange={(e) => updateExerciseName(exIndex, e.target.value)}
                      />
                    </div>
                    {exercises.length > 1 && (
                      <button
                        onClick={() => removeExercise(exIndex)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Ukloni vežbu"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  {/* Sets header */}
                  <div className="grid grid-cols-4 gap-2 mb-2 text-xs font-medium text-gray-500 px-1">
                    <span>Serija</span>
                    <span>Reps</span>
                    <span>Težina (kg)</span>
                    <span></span>
                  </div>

                  {/* Sets */}
                  {ex.sets.map((set, setIndex) => (
                    <div key={setIndex} className="grid grid-cols-4 gap-2 mb-2 items-center">
                      <span className="text-sm font-medium text-gray-600 pl-1">{set.setNumber}</span>
                      <input
                        type="number"
                        min="0"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)}
                        placeholder="0"
                        className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)}
                        placeholder="0"
                        className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        onClick={() => removeSet(exIndex, setIndex)}
                        disabled={ex.sets.length === 1}
                        className="text-gray-300 hover:text-red-400 transition-colors disabled:cursor-not-allowed"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  <Button variant="ghost" size="sm" onClick={() => addSet(exIndex)}>
                    <Plus size={14} className="mr-1" /> Dodaj seriju
                  </Button>
                </div>
              ))}
            </div>

            {/* Add exercise button */}
            <Button variant="outline" onClick={addExercise} className="mb-6 w-full">
              <Plus size={16} className="mr-2" /> Dodaj vežbu
            </Button>

            {/* Save */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowNewWorkout(false)}>Otkaži</Button>
              <Button onClick={handleSaveWorkout} disabled={isSaving}>
                <CheckCircle size={16} className="mr-2" />
                {isSaving ? 'Čuvanje...' : 'Završi i sačuvaj trening'}
              </Button>
            </div>
          </Card>
        )}

        {/* ── Workout History ── */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Istorija treninga</h2>

        {isLoadingLogs ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          </div>
        ) : logs.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Dumbbell className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">Nema evidentiranih treninga</p>
              <p className="text-sm text-gray-400 mt-1">Kliknite "Novi trening" da logirate prvi trening</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const isExpanded = expandedLog === log.logId;
              return (
                <Card key={log.logId}>
                  {/* Log summary row */}
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedLog(isExpanded ? null : log.logId)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary-100 p-2 rounded-full">
                        <Dumbbell className="text-primary-600" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{formatDate(log.date)}</p>
                        <p className="text-sm text-gray-500">
                          {log.exercises.length} vežb{log.exercises.length === 1 ? 'a' : 'i'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {log.duration > 0 && (
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} /> Trajanje
                          </p>
                          <p className="font-semibold text-gray-900">{log.duration} min</p>
                        </div>
                      )}
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <TrendingUp size={12} /> Volumen
                        </p>
                        <p className="font-semibold text-gray-900">{log.totalVolume.toFixed(0)} kg</p>
                      </div>
                      {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {log.notes && (
                        <p className="text-sm text-gray-600 italic mb-3">"{log.notes}"</p>
                      )}
                      <div className="space-y-3">
                        {log.exercises.map((ex, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3">
                            <p className="font-medium text-gray-800 mb-2">{ex.exerciseName}</p>
                            <div className="grid grid-cols-3 gap-1 text-xs text-gray-500 mb-1 px-1">
                              <span>Serija</span><span>Reps</span><span>Težina</span>
                            </div>
                            {(ex.sets || []).map((set, si) => (
                              <div key={si} className="grid grid-cols-3 gap-1 text-sm px-1 py-0.5">
                                <span className="text-gray-500">{set.setNumber}</span>
                                <span className="font-medium">{set.reps}</span>
                                <span className="font-medium">{set.weight} kg</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
