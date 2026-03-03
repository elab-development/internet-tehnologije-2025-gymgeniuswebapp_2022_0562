'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { Utensils, Plus, Search, Trash2, X, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { MealType } from '@/types/models';
import toast from 'react-hot-toast';

interface Meal {
  mealId: string;
  name: string;
  type: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity?: number;
  notes?: string;
  date: string;
}

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodResult {
  name: string;
  brand: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  [MealType.BREAKFAST]: 'Doručak',
  [MealType.LUNCH]: 'Ručak',
  [MealType.DINNER]: 'Večera',
  [MealType.SNACK]: 'Užina',
};

const MEAL_TYPE_ICONS: Record<MealType, string> = {
  [MealType.BREAKFAST]: '🌅',
  [MealType.LUNCH]: '☀️',
  [MealType.DINNER]: '🌙',
  [MealType.SNACK]: '🍎',
};

const DAILY_TARGETS = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

export default function NutritionPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [totals, setTotals] = useState<DailyTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Add meal form state
  const [form, setForm] = useState({
    name: '',
    type: MealType.BREAKFAST,
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    quantity: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculator state
  interface CalcResult { bmr: number; tdee: number; targetCalories: number; protein: number; carbs: number; fat: number; }
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [dailyTargets, setDailyTargets] = useState(DAILY_TARGETS);

  const fetchMeals = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/meals?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setMeals(data.data.meals);
        setTotals(data.data.totals);
      }
    } catch (error) {
      console.error('Fetch meals error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (isAuthenticated) fetchMeals();
  }, [isAuthenticated, fetchMeals]);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    setIsSearching(true);
    setSearchResults([]);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/nutrition/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data.foods);
      } else {
        toast.error('Pretraga nije uspela');
      }
    } catch {
      toast.error('Greška pri pretrazi');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFood = (food: FoodResult) => {
    setForm((prev) => ({
      ...prev,
      name: food.name,
      calories: String(food.calories),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fat: String(food.fat),
    }));
    setSearchResults([]);
    setSearchQuery('');
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.calories) {
      toast.error('Naziv i kalorije su obavezni');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          calories: Number(form.calories),
          protein: Number(form.protein) || 0,
          carbs: Number(form.carbs) || 0,
          fat: Number(form.fat) || 0,
          quantity: form.quantity ? Number(form.quantity) : undefined,
          notes: form.notes || undefined,
          date: selectedDate,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Obrok je sačuvan!');
        setForm({ name: '', type: MealType.BREAKFAST, calories: '', protein: '', carbs: '', fat: '', quantity: '', notes: '' });
        setShowAddForm(false);
        await fetchMeals();
      } else {
        toast.error(data.error || 'Greška pri čuvanju obroka');
      }
    } catch {
      toast.error('Greška pri čuvanju obroka');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (mealId: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj obrok?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/meals/${mealId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Obrok obrisan');
        await fetchMeals();
      } else {
        toast.error('Greška pri brisanju');
      }
    } catch {
      toast.error('Greška pri brisanju');
    }
  };

  const handleCalculate = async () => {
    setCalcLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/nutrition/calculator', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCalcResult(data.data);
        setShowCalculator(true);
      } else {
        toast.error(data.error || 'Greška pri izračunavanju. Popunite profil.');
      }
    } catch {
      toast.error('Greška pri izračunavanju');
    } finally {
      setCalcLoading(false);
    }
  };

  const handleApplyTargets = () => {
    if (!calcResult) return;
    setDailyTargets({
      calories: calcResult.targetCalories,
      protein: calcResult.protein,
      carbs: calcResult.carbs,
      fat: calcResult.fat,
    });
    toast.success('Ciljevi primenjeni!');
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const caloriePercent = Math.min((totals.calories / dailyTargets.calories) * 100, 100);
  const proteinPercent = Math.min((totals.protein / dailyTargets.protein) * 100, 100);
  const carbsPercent = Math.min((totals.carbs / dailyTargets.carbs) * 100, 100);
  const fatPercent = Math.min((totals.fat / dailyTargets.fat) * 100, 100);

  const mealsByType = Object.values(MealType).reduce((acc, type) => {
    acc[type] = meals.filter((m) => m.type === type);
    return acc;
  }, {} as Record<MealType, Meal[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Utensils className="text-primary-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ishrana</h1>
              <p className="text-gray-600">Pratite dnevni unos kalorija i makronutrijenata</p>
            </div>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Macronutrient Calculator */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="text-primary-600" size={20} />
              <h2 className="text-lg font-semibold">Kalkulator makronutrijenata</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCalculator(!showCalculator)}
            >
              {showCalculator ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>

          {showCalculator && (
            <div className="mt-4">
              {!calcResult ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Izračunajte personalizovane dnevne ciljeve na osnovu vašeg profila
                    koristeći <strong>Mifflin-St Jeor</strong> formulu.
                  </p>
                  <Button onClick={handleCalculate} disabled={calcLoading}>
                    <Calculator size={16} className="mr-2" />
                    {calcLoading ? 'Izračunavam...' : 'Izračunaj preporučen unos'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">BMR</p>
                      <p className="text-xl font-bold text-blue-700">{calcResult.bmr}</p>
                      <p className="text-xs text-gray-400">kcal/dan</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">TDEE</p>
                      <p className="text-xl font-bold text-green-700">{calcResult.tdee}</p>
                      <p className="text-xs text-gray-400">kcal/dan</p>
                    </div>
                    <div className="text-center p-3 bg-primary-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Cilj kalorija</p>
                      <p className="text-xl font-bold text-primary-700">{calcResult.targetCalories}</p>
                      <p className="text-xs text-gray-400">kcal/dan</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Makroi</p>
                      <p className="text-sm font-semibold text-orange-700">
                        P:{calcResult.protein}g C:{calcResult.carbs}g M:{calcResult.fat}g
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" size="sm" onClick={handleCalculate} disabled={calcLoading}>
                      Ponovi
                    </Button>
                    <Button size="sm" onClick={handleApplyTargets}>
                      Primeni kao moje ciljeve
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!showCalculator && (
            <p className="text-sm text-gray-500 mt-2">
              Kliknite da izračunate personalizovane makronutrijente (Mifflin-St Jeor)
            </p>
          )}
        </Card>

        {/* Daily Summary */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Dnevni pregled</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Kalorije</p>
              <p className="text-2xl font-bold text-gray-900">{totals.calories}</p>
              <p className="text-xs text-gray-400">/ {dailyTargets.calories} kcal</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all ${caloriePercent >= 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${caloriePercent}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Proteini</p>
              <p className="text-2xl font-bold text-gray-900">{totals.protein}g</p>
              <p className="text-xs text-gray-400">/ {dailyTargets.protein}g</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${proteinPercent}%` }} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Ugljeni hidrati</p>
              <p className="text-2xl font-bold text-gray-900">{totals.carbs}g</p>
              <p className="text-xs text-gray-400">/ {dailyTargets.carbs}g</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-yellow-500 h-2 rounded-full transition-all" style={{ width: `${carbsPercent}%` }} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Masti</p>
              <p className="text-2xl font-bold text-gray-900">{totals.fat}g</p>
              <p className="text-xs text-gray-400">/ {dailyTargets.fat}g</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${fatPercent}%` }} />
              </div>
            </div>
          </div>
          {totals.calories >= dailyTargets.calories && (
            <p className="text-sm text-red-600 font-medium">⚠ Dostigli ste dnevni limit kalorija</p>
          )}
        </Card>

        {/* Food Search */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Pretraga namirnica (Open Food Facts)</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Npr. banana, jogurt, piletina..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching || searchQuery.length < 2}>
              <Search size={16} className="mr-1" />
              {isSearching ? 'Traži...' : 'Traži'}
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-3 border rounded-lg divide-y max-h-64 overflow-y-auto">
              {searchResults.map((food, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">{food.name}</p>
                    {food.brand && <p className="text-xs text-gray-500">{food.brand}</p>}
                    <p className="text-xs text-gray-400">
                      {food.calories} kcal · P: {food.protein}g · UH: {food.carbs}g · M: {food.fat}g
                      {food.serving ? ` · (na 100g)` : ''}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleSelectFood(food)}>
                    <Plus size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Add Meal Form */}
        {showAddForm ? (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Dodaj obrok</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Naziv *</label>
                  <Input
                    required
                    placeholder="Npr. Oatmeal sa bananom"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tip obroka *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as MealType }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {Object.values(MealType).map((t) => (
                      <option key={t} value={t}>{MEAL_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kalorije (kcal) *</label>
                  <Input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={form.calories}
                    onChange={(e) => setForm((p) => ({ ...p, calories: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proteini (g)</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.protein}
                    onChange={(e) => setForm((p) => ({ ...p, protein: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ugljeni hidrati (g)</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.carbs}
                    onChange={(e) => setForm((p) => ({ ...p, carbs: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Masti (g)</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.fat}
                    onChange={(e) => setForm((p) => ({ ...p, fat: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Količina (g/ml, opciono)</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="npr. 200"
                    value={form.quantity}
                    onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Napomena (opciono)</label>
                  <Input
                    placeholder="Npr. domaći jogurt"
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" type="button" onClick={() => setShowAddForm(false)}>
                  Otkaži
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Čuvanje...' : 'Sačuvaj obrok'}
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <div className="mb-6">
            <Button onClick={() => setShowAddForm(true)}>
              <Plus size={16} className="mr-2" /> Dodaj obrok
            </Button>
          </div>
        )}

        {/* Meals by type */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          </div>
        ) : meals.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Utensils className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">Nema logiranih obroka za ovaj dan</p>
              <p className="text-sm text-gray-400 mt-1">Kliknite "Dodaj obrok" da biste počeli da pratite ishranu</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.values(MealType).map((type) => {
              const typeMeals = mealsByType[type];
              if (typeMeals.length === 0) return null;
              const typeCalories = typeMeals.reduce((s, m) => s + m.calories, 0);
              return (
                <Card key={type}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">
                      {MEAL_TYPE_ICONS[type]} {MEAL_TYPE_LABELS[type]}
                    </h3>
                    <span className="text-sm text-gray-500">{typeCalories} kcal</span>
                  </div>
                  <div className="space-y-2">
                    {typeMeals.map((meal) => (
                      <div key={meal.mealId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{meal.name}</p>
                          <p className="text-xs text-gray-500">
                            {meal.calories} kcal · P: {meal.protein}g · UH: {meal.carbs}g · M: {meal.fat}g
                            {meal.quantity ? ` · ${meal.quantity}g` : ''}
                          </p>
                          {meal.notes && <p className="text-xs text-gray-400 italic">{meal.notes}</p>}
                        </div>
                        <button
                          onClick={() => handleDelete(meal.mealId)}
                          className="text-gray-400 hover:text-red-500 transition-colors ml-3"
                          title="Obriši obrok"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
