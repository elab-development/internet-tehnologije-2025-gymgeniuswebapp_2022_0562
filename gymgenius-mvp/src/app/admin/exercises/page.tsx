'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { Dumbbell, Plus, Pencil, Trash2, X, ChevronLeft } from 'lucide-react';
import { MuscleGroup, Equipment, Difficulty } from '@/types/models';
import toast from 'react-hot-toast';

interface Exercise {
  exerciseId: string;
  name: string;
  description: string;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroups: MuscleGroup[];
  equipment: Equipment;
  difficulty: Difficulty;
  instructions: string[];
  isActive: boolean;
}

const EMPTY_FORM = {
  name: '',
  description: '',
  primaryMuscleGroup: MuscleGroup.CHEST,
  secondaryMuscleGroups: [] as MuscleGroup[],
  equipment: Equipment.BARBELL,
  difficulty: Difficulty.BEGINNER,
  instructions: [''],
};

export default function AdminExercisesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = search ? `/api/exercises?search=${encodeURIComponent(search)}` : '/api/exercises';
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setExercises(data.data.exercises);
    } catch (error) {
      console.error('Fetch exercises error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') fetchExercises();
  }, [isAuthenticated, user, fetchExercises]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const handleOpenEdit = (exercise: Exercise) => {
    setEditingId(exercise.exerciseId);
    setForm({
      name: exercise.name,
      description: exercise.description,
      primaryMuscleGroup: exercise.primaryMuscleGroup,
      secondaryMuscleGroups: exercise.secondaryMuscleGroups || [],
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      instructions: exercise.instructions.length > 0 ? exercise.instructions : [''],
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.primaryMuscleGroup || !form.equipment) {
      toast.error('Naziv, primarna mišićna grupa i oprema su obavezni');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const instructions = form.instructions.filter((i) => i.trim() !== '');
      const payload = { ...form, instructions };

      const url = editingId ? `/api/exercises/${editingId}` : '/api/exercises';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(editingId ? 'Vežba ažurirana!' : 'Vežba kreirana!');
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        await fetchExercises();
      } else {
        toast.error(data.error || 'Greška');
      }
    } catch {
      toast.error('Greška pri čuvanju');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (exerciseId: string, name: string) => {
    if (!confirm(`Da li ste sigurni da želite da obrišete vežbu "${name}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Vežba obrisana');
        await fetchExercises();
      } else {
        toast.error(data.error || 'Greška pri brisanju');
      }
    } catch {
      toast.error('Greška pri brisanju');
    }
  };

  const addInstruction = () => setForm((p) => ({ ...p, instructions: [...p.instructions, ''] }));
  const updateInstruction = (i: number, val: string) =>
    setForm((p) => ({ ...p, instructions: p.instructions.map((x, idx) => (idx === i ? val : x)) }));
  const removeInstruction = (i: number) =>
    setForm((p) => ({ ...p, instructions: p.instructions.filter((_, idx) => idx !== i) }));

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated || user?.role !== 'admin') {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.push('/admin')} className="text-gray-500 hover:text-gray-700">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <Dumbbell className="text-green-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-900">Upravljanje vežbama</h1>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus size={16} className="mr-2" /> Dodaj vežbu
          </Button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? 'Izmeni vežbu' : 'Dodaj novu vežbu'}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Naziv vežbe *</label>
                  <Input required placeholder="Npr. Bench Press" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nivo težine</label>
                  <select value={form.difficulty} onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value as Difficulty }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    {Object.values(Difficulty).map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opis vežbe</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3} placeholder="Kratki opis vežbe..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primarna mišićna grupa *</label>
                  <select value={form.primaryMuscleGroup} onChange={(e) => setForm((p) => ({ ...p, primaryMuscleGroup: e.target.value as MuscleGroup }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    {Object.values(MuscleGroup).map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Oprema *</label>
                  <select value={form.equipment} onChange={(e) => setForm((p) => ({ ...p, equipment: e.target.value as Equipment }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    {Object.values(Equipment).map((eq) => <option key={eq} value={eq}>{eq}</option>)}
                  </select>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Uputstvo za izvođenje</label>
                  <button type="button" onClick={addInstruction} className="text-sm text-primary-600 hover:text-primary-700">
                    + Dodaj korak
                  </button>
                </div>
                <div className="space-y-2">
                  {form.instructions.map((instr, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-sm text-gray-400 w-6">{i + 1}.</span>
                      <Input
                        placeholder={`Korak ${i + 1}`}
                        value={instr}
                        onChange={(e) => updateInstruction(i, e.target.value)}
                      />
                      {form.instructions.length > 1 && (
                        <button type="button" onClick={() => removeInstruction(i)} className="text-gray-400 hover:text-red-500">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditingId(null); }}>Otkaži</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Čuvanje...' : editingId ? 'Sačuvaj izmene' : 'Kreiraj vežbu'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Search */}
        <div className="flex gap-3 mb-4">
          <Input
            placeholder="Pretraži vežbe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Exercise list */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          </div>
        ) : exercises.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Dumbbell className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">Nema vežbi u bazi</p>
              <p className="text-sm text-gray-400 mt-1">Kliknite "Dodaj vežbu" da biste dodali prvu vežbu</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 mb-3">{exercises.length} vežbi pronađeno</p>
            {exercises.map((exercise) => (
              <Card key={exercise.exerciseId}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{exercise.primaryMuscleGroup}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{exercise.equipment}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{exercise.difficulty}</span>
                    </div>
                    {exercise.description && (
                      <p className="text-sm text-gray-500 mt-1 truncate">{exercise.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button onClick={() => handleOpenEdit(exercise)} className="text-gray-400 hover:text-blue-500 transition-colors" title="Izmeni">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(exercise.exerciseId, exercise.name)} className="text-gray-400 hover:text-red-500 transition-colors" title="Obriši">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
