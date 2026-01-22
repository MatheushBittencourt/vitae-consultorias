import { getAuthHeaders } from '../../services/api';
import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, Loader2, Apple, Trash2, X, ChevronDown, ChevronRight, ArrowLeftRight, Utensils, Book, ArrowLeft, Users, Target, Library, FileText, Ruler, Calculator, ClipboardList } from 'lucide-react';
import { Patient } from './AdminDashboard';
import { Card, StatCard } from '../ui/Card';
import { Badge, StatusBadge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { useToast } from '../ui/Toast';
import { NutritionAnamnesis, AnthropometricAssessment, EnergyCalculator, NutritionEvolutionDashboard, RecipeManager } from '../nutrition';

const API_URL = '/api';

interface AdminNutritionSectionProps {
  onSelectPatient: (patient: Patient) => void;
  consultancyId?: number;
  adminUserId?: number;
}

interface NutritionPlan {
  id: number;
  athlete_id: number;
  nutritionist_id: number;
  name: string;
  description: string;
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  start_date: string;
  end_date: string;
  status: string;
  nutritionist_name: string;
}

interface Meal {
  id: number;
  plan_id: number;
  name: string;
  time: string;
  description: string;
  order_index: number;
  foods?: MealFood[];
  options?: MealOption[];
}

interface MealFood {
  id: number;
  meal_id: number;
  food_id: number | null;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes: string;
  order_index: number;
  option_group: number;
}

interface MealOption {
  optionNumber: number;
  label: string;
  foods: MealFood[];
}

interface FoodLibraryItem {
  id: number;
  name: string;
  category: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface AthleteData {
  id: number;
  user_id: number;
  name: string;
  email: string;
}

type ViewMode = 'list' | 'plan' | 'library' | 'anamnesis' | 'anthropometric' | 'energy' | 'evolution' | 'recipes';

export function AdminNutritionSection({ onSelectPatient, consultancyId, adminUserId }: AdminNutritionSectionProps) {
  const toast = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [foodLibrary, setFoodLibrary] = useState<FoodLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [showNewMeal, setShowNewMeal] = useState(false);
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [showNewFood, setShowNewFood] = useState(false);
  const [showEditFood, setShowEditFood] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodLibraryItem | null>(null);
  
  // Selected items
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);
  const [selectedMealId, setSelectedMealId] = useState<number | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [expandedMeals, setExpandedMeals] = useState<Set<number>>(new Set());
  const [selectedAthleteForAssessment, setSelectedAthleteForAssessment] = useState<AthleteData | null>(null);
  
  // Form states
  const [planForm, setPlanForm] = useState({
    athlete_id: 0,
    name: '',
    description: '',
    daily_calories: 2000,
    protein_grams: 150,
    carbs_grams: 250,
    fat_grams: 70,
  });
  
  const [mealForm, setMealForm] = useState({
    name: '',
    time: '07:00',
    description: '',
  });

  const [foodForm, setFoodForm] = useState({
    name: '',
    quantity: 1,
    unit: 'porção',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    option_group: 0,
  });
  
  const [selectedOptionGroup, setSelectedOptionGroup] = useState(0);

  const [libraryFoodForm, setLibraryFoodForm] = useState({
    name: '',
    category: 'outros',
    serving_size: '100g',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  });

  useEffect(() => {
    loadData();
  }, [consultancyId]);

  useEffect(() => {
    if (selectedPlan) {
      loadMeals(selectedPlan.id);
    }
  }, [selectedPlan]);

  const loadData = async () => {
    if (!consultancyId) {
      setLoading(false);
      return;
    }
    try {
      const [plansRes, athletesRes, foodRes] = await Promise.all([
        fetch(`${API_URL}/nutrition-plans?consultancy_id=${consultancyId}`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/athletes?consultancy_id=${consultancyId}`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/food-library?consultancy_id=${consultancyId}`, { headers: getAuthHeaders() })
      ]);
      const plansData = await plansRes.json();
      const athletesData = await athletesRes.json();
      const foodData = await foodRes.json();
      setPlans(plansData);
      setAthletes(athletesData);
      setFoodLibrary(foodData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMeals = async (planId: number) => {
    try {
      const response = await fetch(`${API_URL}/nutrition-plans/${planId}/complete`, { headers: getAuthHeaders() });
      const data = await response.json();
      setMeals(data.meals || []);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  const getAthleteName = (athleteId: number) => {
    const athlete = athletes.find(a => a.id === athleteId);
    return athlete?.name || 'Desconhecido';
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.athlete_id || !planForm.name) return;

    try {
      await fetch(`${API_URL}/nutrition-plans`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...planForm,
          nutritionist_id: adminUserId || 1,
          status: 'active',
        }),
      });
      setShowNewPlan(false);
      setPlanForm({ athlete_id: 0, name: '', description: '', daily_calories: 2000, protein_grams: 150, carbs_grams: 250, fat_grams: 70 });
      loadData();
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  const handleCreateMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !mealForm.name) return;

    try {
      await fetch(`${API_URL}/meals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          ...mealForm,
          order_index: meals.length,
        }),
      });
      setShowNewMeal(false);
      setMealForm({ name: '', time: '07:00', description: '' });
      loadMeals(selectedPlan.id);
    } catch (error) {
      console.error('Error creating meal:', error);
    }
  };

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMealId || !foodForm.name) return;

    try {
      await fetch(`${API_URL}/meal-foods`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          meal_id: selectedMealId,
          ...foodForm,
          option_group: selectedOptionGroup,
          order_index: 0,
        }),
      });
      setShowFoodPicker(false);
      setFoodForm({ name: '', quantity: 1, unit: 'porção', calories: 0, protein: 0, carbs: 0, fat: 0, option_group: 0 });
      if (selectedPlan) loadMeals(selectedPlan.id);
    } catch (error) {
      console.error('Error adding food:', error);
    }
  };

  const handleAddFromLibrary = async (food: FoodLibraryItem) => {
    if (!selectedMealId) return;

    try {
      await fetch(`${API_URL}/meal-foods`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          meal_id: selectedMealId,
          food_id: food.id,
          name: food.name,
          quantity: 1,
          unit: food.serving_size,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          option_group: selectedOptionGroup,
          order_index: 0,
        }),
      });
      setShowFoodPicker(false);
      if (selectedPlan) loadMeals(selectedPlan.id);
    } catch (error) {
      console.error('Error adding food from library:', error);
    }
  };


  const handleDeleteMeal = async (mealId: number) => {
    if (!confirm('Excluir esta refeição?')) return;
    try {
      await fetch(`${API_URL}/meals/${mealId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (selectedPlan) loadMeals(selectedPlan.id);
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const handleDeleteFood = async (foodId: number) => {
    try {
      await fetch(`${API_URL}/meal-foods/${foodId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (selectedPlan) loadMeals(selectedPlan.id);
    } catch (error) {
      console.error('Error deleting food:', error);
    }
  };

  const handleCreateLibraryFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!libraryFoodForm.name) return;

    try {
      await fetch(`${API_URL}/food-library`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          consultancy_id: consultancyId,
          ...libraryFoodForm,
        }),
      });
      setShowNewFood(false);
      setLibraryFoodForm({ name: '', category: 'outros', serving_size: '100g', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
      loadData();
    } catch (error) {
      console.error('Error creating food:', error);
    }
  };

  const handleDeleteLibraryFood = async (foodId: number) => {
    if (!confirm('Excluir este alimento da biblioteca?')) return;
    try {
      await fetch(`${API_URL}/food-library/${foodId}?consultancy_id=${consultancyId}`, { method: 'DELETE', headers: getAuthHeaders() });
      loadData();
    } catch (error) {
      console.error('Error deleting food:', error);
    }
  };

  const openEditFood = (food: FoodLibraryItem) => {
    setEditingFood(food);
    setLibraryFoodForm({
      name: food.name,
      category: food.category,
      serving_size: food.serving_size,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber || 0,
    });
    setShowEditFood(true);
  };

  const handleUpdateLibraryFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFood || !libraryFoodForm.name) return;

    try {
      await fetch(`${API_URL}/food-library/${editingFood.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          consultancy_id: consultancyId,
          ...libraryFoodForm,
        }),
      });
      setShowEditFood(false);
      setEditingFood(null);
      setLibraryFoodForm({ name: '', category: 'outros', serving_size: '100g', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
      loadData();
    } catch (error) {
      console.error('Error updating food:', error);
    }
  };

  const toggleMealExpand = (mealId: number) => {
    const newExpanded = new Set(expandedMeals);
    if (newExpanded.has(mealId)) {
      newExpanded.delete(mealId);
    } else {
      newExpanded.add(mealId);
    }
    setExpandedMeals(newExpanded);
  };

  const filteredPlans = plans.filter(plan => 
    getAthleteName(plan.athlete_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLibrary = foodLibrary.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryLabels: Record<string, string> = {
    proteina: 'Proteínas',
    carboidrato: 'Carboidratos',
    gordura: 'Gorduras',
    vegetal: 'Vegetais',
    fruta: 'Frutas',
    lacteo: 'Laticínios',
    suplemento: 'Suplementos',
    bebida: 'Bebidas',
    outros: 'Outros',
  };

  const avgCalories = plans.length > 0 
    ? Math.round(plans.reduce((sum, p) => sum + (p.daily_calories || 0), 0) / plans.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
      </div>
    );
  }

  // VIEW: Anamnese Nutricional
  if (viewMode === 'anamnesis' && selectedAthleteForAssessment) {
    return (
      <div className="space-y-4">
        <button 
          onClick={() => { setViewMode('list'); setSelectedAthleteForAssessment(null); }} 
          className="text-sm text-zinc-500 hover:text-black flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à lista
        </button>
        <NutritionAnamnesis
          athleteId={selectedAthleteForAssessment.id}
          nutritionistId={adminUserId || 0}
          athleteName={selectedAthleteForAssessment.name}
          onSave={() => {
            toast.success('Anamnese salva com sucesso!');
          }}
        />
      </div>
    );
  }

  // VIEW: Avaliação Antropométrica
  if (viewMode === 'anthropometric' && selectedAthleteForAssessment) {
    return (
      <div className="space-y-4">
        <button 
          onClick={() => { setViewMode('list'); setSelectedAthleteForAssessment(null); }} 
          className="text-sm text-zinc-500 hover:text-black flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à lista
        </button>
        <AnthropometricAssessment
          athleteId={selectedAthleteForAssessment.id}
          nutritionistId={adminUserId || 0}
          athleteName={selectedAthleteForAssessment.name}
          onSave={() => {
            toast.success('Avaliação salva com sucesso!');
          }}
        />
      </div>
    );
  }

  // VIEW: Calculadora de Energia
  if (viewMode === 'energy' && selectedAthleteForAssessment) {
    return (
      <div className="space-y-4">
        <button 
          onClick={() => { setViewMode('list'); setSelectedAthleteForAssessment(null); }} 
          className="text-sm text-zinc-500 hover:text-black flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à lista
        </button>
        <EnergyCalculator
          athleteId={selectedAthleteForAssessment.id}
          nutritionistId={adminUserId || 0}
          athleteName={selectedAthleteForAssessment.name}
          onSave={() => {
            toast.success('Cálculo salvo com sucesso!');
          }}
        />
      </div>
    );
  }

  // VIEW: Dashboard de Evolução
  if (viewMode === 'evolution' && selectedAthleteForAssessment) {
    return (
      <div className="space-y-4">
        <button 
          onClick={() => { setViewMode('list'); setSelectedAthleteForAssessment(null); }} 
          className="text-sm text-zinc-500 hover:text-black flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à lista
        </button>
        <NutritionEvolutionDashboard
          athleteId={selectedAthleteForAssessment.id}
          athleteName={selectedAthleteForAssessment.name}
        />
      </div>
    );
  }

  // VIEW: Gerenciador de Receitas
  if (viewMode === 'recipes') {
    return (
      <div className="space-y-4">
        <button 
          onClick={() => setViewMode('list')} 
          className="text-sm text-zinc-500 hover:text-black flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à lista
        </button>
        <RecipeManager
          consultancyId={consultancyId || 0}
          userId={adminUserId || 0}
        />
      </div>
    );
  }

  // VIEW: Plano detalhado
  if (viewMode === 'plan' && selectedPlan) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button onClick={() => { setViewMode('list'); setSelectedPlan(null); }} className="text-sm text-zinc-500 hover:text-black mb-2 flex items-center gap-1">
              ← Voltar aos planos
            </button>
            <h1 className="text-4xl font-bold tracking-tighter mb-1">{selectedPlan.name}</h1>
            <p className="text-lg text-zinc-600">Paciente: {getAthleteName(selectedPlan.athlete_id)}</p>
          </div>
          <button onClick={() => setShowNewMeal(true)} className="flex items-center gap-2 bg-lime-500 text-black px-6 py-3 font-bold hover:bg-lime-400 transition-colors">
            <Plus className="w-5 h-5" />
            NOVA REFEIÇÃO
          </button>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 border-l-4 border-lime-500">
            <div className="text-2xl font-bold">{selectedPlan.daily_calories}</div>
            <div className="text-sm text-zinc-600">Kcal/dia</div>
          </div>
          <div className="bg-white p-4 border-l-4 border-red-500">
            <div className="text-2xl font-bold">{selectedPlan.protein_grams}g</div>
            <div className="text-sm text-zinc-600">Proteína</div>
          </div>
          <div className="bg-white p-4 border-l-4 border-yellow-500">
            <div className="text-2xl font-bold">{selectedPlan.carbs_grams}g</div>
            <div className="text-sm text-zinc-600">Carboidratos</div>
          </div>
          <div className="bg-white p-4 border-l-4 border-blue-500">
            <div className="text-2xl font-bold">{selectedPlan.fat_grams}g</div>
            <div className="text-sm text-zinc-600">Gorduras</div>
          </div>
        </div>

        {/* Meals */}
        <div className="space-y-4">
          {meals.length === 0 ? (
            <div className="bg-white p-12 text-center">
              <Utensils className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
              <p className="text-zinc-500 mb-4">Nenhuma refeição cadastrada</p>
              <button onClick={() => setShowNewMeal(true)} className="px-6 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400">
                Adicionar Refeição
              </button>
            </div>
          ) : (
            meals.map((meal) => (
              <div key={meal.id} className="bg-white">
                {/* Meal Header */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50"
                  onClick={() => toggleMealExpand(meal.id)}
                >
                  <div className="flex items-center gap-3">
                    {expandedMeals.has(meal.id) ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    <div className="w-10 h-10 bg-lime-500 rounded-lg flex items-center justify-center">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold">{meal.name}</div>
                      <div className="text-sm text-zinc-500">{meal.time?.substring(0, 5) || '--:--'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500">{meal.foods?.length || 0} alimentos</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteMeal(meal.id); }} className="p-2 hover:bg-red-50 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Meal Options */}
                {expandedMeals.has(meal.id) && (
                  <div className="border-t border-zinc-100 p-4">
                    {/* Opções (Principal + Substituições) */}
                    {(() => {
                      // Agrupar foods por option_group
                      const optionGroups: Record<number, MealFood[]> = {};
                      (meal.foods || []).forEach(food => {
                        const group = food.option_group || 0;
                        if (!optionGroups[group]) optionGroups[group] = [];
                        optionGroups[group].push(food);
                      });
                      
                      // Descobrir quantas opções existem
                      const maxOption = Math.max(0, ...Object.keys(optionGroups).map(Number));
                      const allOptions = Array.from({ length: maxOption + 1 }, (_, i) => i);
                      
                      return (
                        <div className="space-y-4">
                          {allOptions.map(optNum => {
                            const foods = optionGroups[optNum] || [];
                            const isMain = optNum === 0;
                            
                            return (
                              <div key={optNum} className={`border-l-4 ${isMain ? 'border-lime-500' : 'border-orange-400'} pl-4`}>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className={`font-bold text-sm ${isMain ? 'text-lime-700' : 'text-orange-600'}`}>
                                    {isMain ? '🍽️ OPÇÃO PRINCIPAL' : `🔄 SUBSTITUIÇÃO ${optNum}`}
                                  </h4>
                                  <button 
                                    onClick={() => { setSelectedMealId(meal.id); setSelectedOptionGroup(optNum); setShowFoodPicker(true); }}
                                    className="text-xs px-2 py-1 bg-zinc-100 hover:bg-zinc-200 rounded flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Alimento
                                  </button>
                                </div>
                                
                                {foods.length === 0 ? (
                                  <p className="text-sm text-zinc-400 italic">Nenhum alimento adicionado</p>
                                ) : (
                                  <div className="space-y-2">
                                    {foods.map(food => (
                                      <div key={food.id} className="flex items-center justify-between bg-zinc-50 p-2 rounded">
                                        <div>
                                          <span className="font-medium">{food.name}</span>
                                          <span className="text-sm text-zinc-500 ml-2">({food.quantity} {food.unit})</span>
                                          <div className="text-xs text-zinc-500">
                                            {Math.round(Number(food.calories))} kcal • {Math.round(Number(food.protein))}g P • {Math.round(Number(food.carbs))}g C • {Math.round(Number(food.fat))}g G
                                          </div>
                                        </div>
                                        <button onClick={() => handleDeleteFood(food.id)} className="p-1 hover:bg-red-100 text-red-500 rounded">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          
                          {/* Botão para adicionar nova substituição */}
                          <button 
                            onClick={() => { setSelectedMealId(meal.id); setSelectedOptionGroup(maxOption + 1); setShowFoodPicker(true); }}
                            className="w-full py-2 border-2 border-dashed border-orange-300 text-orange-500 hover:border-orange-500 hover:text-orange-600 flex items-center justify-center gap-2 text-sm"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                            Adicionar Nova Substituição (Opção {maxOption + 2})
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* New Meal Modal */}
        {showNewMeal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Nova Refeição</h3>
                <button onClick={() => setShowNewMeal(false)}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateMeal} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">NOME</label>
                  <input type="text" value={mealForm.name} onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" placeholder="Ex: Café da Manhã" required />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">HORÁRIO</label>
                  <input type="time" value={mealForm.time} onChange={(e) => setMealForm({ ...mealForm, time: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowNewMeal(false)} className="flex-1 py-3 border-2 border-black font-bold">CANCELAR</button>
                  <button type="submit" className="flex-1 py-3 bg-lime-500 text-black font-bold">CRIAR</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Food Picker Modal */}
        {showFoodPicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Adicionar Alimento</h3>
                  <button onClick={() => setShowFoodPicker(false)}><X className="w-5 h-5" /></button>
                </div>
                <input type="text" placeholder="Buscar alimento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <h4 className="text-sm font-bold text-zinc-500 mb-3">BIBLIOTECA DE ALIMENTOS</h4>
                <div className="space-y-2 mb-6">
                  {filteredLibrary.slice(0, 15).map((food) => (
                    <button key={food.id} onClick={() => handleAddFromLibrary(food)}
                      className="w-full flex items-center justify-between p-3 hover:bg-zinc-50 border border-zinc-200 text-left">
                      <div>
                        <div className="font-medium">{food.name}</div>
                        <div className="text-sm text-zinc-500">{food.serving_size}</div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-bold">{Math.round(Number(food.calories))} kcal</div>
                        <div className="text-zinc-500">{Math.round(Number(food.protein))}g P</div>
                      </div>
                    </button>
                  ))}
                </div>

                <h4 className="text-sm font-bold text-zinc-500 mb-3">OU ADICIONAR MANUALMENTE</h4>
                <form onSubmit={handleAddFood} className="space-y-4">
                  <input type="text" placeholder="Nome do alimento" value={foodForm.name} onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" required />
                  <div className="grid grid-cols-4 gap-2">
                    <input type="number" placeholder="Qtd" value={foodForm.quantity} onChange={(e) => setFoodForm({ ...foodForm, quantity: Number(e.target.value) })}
                      className="px-3 py-2 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                    <input type="text" placeholder="Unidade" value={foodForm.unit} onChange={(e) => setFoodForm({ ...foodForm, unit: e.target.value })}
                      className="px-3 py-2 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                    <input type="number" placeholder="Kcal" value={foodForm.calories} onChange={(e) => setFoodForm({ ...foodForm, calories: Number(e.target.value) })}
                      className="px-3 py-2 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                    <input type="number" placeholder="Prot (g)" value={foodForm.protein} onChange={(e) => setFoodForm({ ...foodForm, protein: Number(e.target.value) })}
                      className="px-3 py-2 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-lime-500 text-black font-bold">ADICIONAR</button>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // VIEW: Biblioteca de Alimentos
  if (viewMode === 'library') {
    const groupedFoods = filteredLibrary.reduce((acc, food) => {
      const cat = food.category || 'outros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(food);
      return acc;
    }, {} as Record<string, FoodLibraryItem[]>);

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter mb-2">
              <span className="text-lime-500">BIBLIOTECA</span>
            </h1>
            <p className="text-xl text-zinc-600">
              Alimentos disponíveis para os planos nutricionais
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewFood(true)}
              className="flex items-center gap-2 px-6 py-3 bg-lime-500 text-black font-bold tracking-wider hover:bg-lime-400 transition-colors"
            >
              <Plus className="w-5 h-5" />
              NOVO ALIMENTO
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2 px-6 py-3 border-2 border-zinc-200 font-bold tracking-wider hover:border-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              VOLTAR
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar alimento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-zinc-200 focus:border-lime-500 outline-none transition-colors"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total de Alimentos"
            value={foodLibrary.length}
            icon={<Apple className="w-5 h-5" />}
            color="lime"
          />
          <StatCard
            label="Categorias"
            value={Object.keys(groupedFoods).length}
            icon={<Library className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            label="Proteínas"
            value={foodLibrary.filter(f => f.category === 'proteina').length}
            icon={<Target className="w-5 h-5" />}
            color="red"
          />
          <StatCard
            label="Carboidratos"
            value={foodLibrary.filter(f => f.category === 'carboidrato').length}
            icon={<Utensils className="w-5 h-5" />}
            color="orange"
          />
        </div>

        {/* Food List by Category */}
        <div className="space-y-6">
          {Object.entries(groupedFoods).map(([category, foods]) => (
            <div key={category}>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-lime-500 rounded-full"></span>
                {categoryLabels[category] || category}
                <span className="text-sm font-normal text-zinc-500">({foods.length})</span>
              </h3>
              <div className="bg-white">
                {foods.map((food, idx) => (
                  <div key={food.id} className={`flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-colors ${idx > 0 ? 'border-t border-zinc-100' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-lime-100 rounded-lg flex items-center justify-center">
                        <Apple className="w-5 h-5 text-lime-600" />
                      </div>
                      <div>
                        <div className="font-bold">{food.name}</div>
                        <div className="text-sm text-zinc-500">{food.serving_size}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-bold">{Math.round(Number(food.calories))} kcal</div>
                        <div className="text-sm text-zinc-500">
                          <span className="text-red-500">{Math.round(Number(food.protein))}g P</span>
                          <span className="mx-1">•</span>
                          <span className="text-yellow-600">{Math.round(Number(food.carbs))}g C</span>
                          <span className="mx-1">•</span>
                          <span className="text-blue-500">{Math.round(Number(food.fat))}g G</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openEditFood(food)} 
                          className="p-2 hover:bg-zinc-100 rounded transition-colors"
                          title="Editar alimento"
                        >
                          <Edit className="w-4 h-4 text-zinc-600" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLibraryFood(food.id)} 
                          className="p-2 hover:bg-red-50 rounded text-red-500 transition-colors"
                          title="Excluir alimento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {Object.keys(groupedFoods).length === 0 && (
            <EmptyState
              icon="nutrition"
              title="Nenhum alimento encontrado"
              description="Adicione alimentos à sua biblioteca para usar nos planos nutricionais."
              action={{
                label: "Adicionar Alimento",
                onClick: () => setShowNewFood(true)
              }}
            />
          )}
        </div>

        {/* New Food Modal */}
        {showNewFood && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Novo Alimento</h3>
                <button onClick={() => setShowNewFood(false)}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateLibraryFood} className="space-y-4">
                <input type="text" placeholder="Nome do alimento" value={libraryFoodForm.name} onChange={(e) => setLibraryFoodForm({ ...libraryFoodForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" required />
                <div className="grid grid-cols-2 gap-4">
                  <select value={libraryFoodForm.category} onChange={(e) => setLibraryFoodForm({ ...libraryFoodForm, category: e.target.value })}
                    className="px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none">
                    {Object.entries(categoryLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                  <input type="text" placeholder="Porção (ex: 100g)" value={libraryFoodForm.serving_size} onChange={(e) => setLibraryFoodForm({ ...libraryFoodForm, serving_size: e.target.value })}
                    className="px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-xs text-zinc-500">Kcal</label>
                    <input type="number" value={libraryFoodForm.calories} onChange={(e) => setLibraryFoodForm({ ...libraryFoodForm, calories: Number(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Proteína</label>
                    <input type="number" value={libraryFoodForm.protein} onChange={(e) => setLibraryFoodForm({ ...libraryFoodForm, protein: Number(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Carbs</label>
                    <input type="number" value={libraryFoodForm.carbs} onChange={(e) => setLibraryFoodForm({ ...libraryFoodForm, carbs: Number(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Gordura</label>
                    <input type="number" value={libraryFoodForm.fat} onChange={(e) => setLibraryFoodForm({ ...libraryFoodForm, fat: Number(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowNewFood(false)} className="flex-1 py-3 border-2 border-black font-bold">CANCELAR</button>
                  <button type="submit" className="flex-1 py-3 bg-lime-500 text-black font-bold">CRIAR</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Food Modal */}
        {showEditFood && editingFood && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Editar Alimento</h3>
                <button onClick={() => { setShowEditFood(false); setEditingFood(null); }}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleUpdateLibraryFood} className="space-y-4">
                <input type="text" placeholder="Nome do alimento" value={libraryFoodForm.name} onChange={(e) => setLibraryFoodForm({ ...libraryFoodForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" required />
                <div className="grid grid-cols-2 gap-4">
                  <select value={libraryFoodForm.category} onChange={(e) => setLibraryFoodForm({ ...libraryFoodForm, category: e.target.value })}
                    className="px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none">
                    {Object.entries(categoryLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                  <input type="text" placeholder="Porção (ex: 100g)" value={libraryFoodForm.serving_size} onChange={(e) => setLibraryFoodForm({ ...libraryFoodForm, serving_size: e.target.value })}
                    className="px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-xs text-zinc-500">Kcal</label>
                    <input type="number" value={libraryFoodForm.calories} onChange={(e) => setLibraryFoodForm({ ...libraryFoodForm, calories: Number(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Proteína</label>
                    <input type="number" value={libraryFoodForm.protein} onChange={(e) => setLibraryFoodForm({ ...libraryFoodForm, protein: Number(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Carbs</label>
                    <input type="number" value={libraryFoodForm.carbs} onChange={(e) => setLibraryFoodForm({ ...libraryFoodForm, carbs: Number(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Gordura</label>
                    <input type="number" value={libraryFoodForm.fat} onChange={(e) => setLibraryFoodForm({ ...libraryFoodForm, fat: Number(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => { setShowEditFood(false); setEditingFood(null); }} className="flex-1 py-3 border-2 border-black font-bold">CANCELAR</button>
                  <button type="submit" className="flex-1 py-3 bg-lime-500 text-black font-bold">SALVAR</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // VIEW: Lista de Planos
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">NUTRIÇÃO</span>
          </h1>
          <p className="text-xl text-zinc-600">Gerencie os planos nutricionais dos pacientes</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setViewMode('recipes')} className="flex items-center gap-2 border-2 border-black px-6 py-3 font-bold hover:bg-black hover:text-white transition-colors">
            <Utensils className="w-5 h-5" />
            RECEITAS
          </button>
          <button onClick={() => setViewMode('library')} className="flex items-center gap-2 border-2 border-black px-6 py-3 font-bold hover:bg-black hover:text-white transition-colors">
            <Book className="w-5 h-5" />
            BIBLIOTECA
          </button>
          <button onClick={() => setShowNewPlan(true)} className="flex items-center gap-2 bg-lime-500 text-black px-6 py-3 font-bold hover:bg-lime-400 transition-colors">
            <Plus className="w-5 h-5" />
            NOVO PLANO
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input type="text" placeholder="Buscar por paciente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-zinc-200 focus:border-lime-500 outline-none transition-colors" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Planos Ativos"
          value={plans.filter(p => p.status === 'active').length}
          icon={<Target className="w-5 h-5" />}
          color="lime"
        />
        <StatCard
          label="Kcal Média"
          value={avgCalories}
          icon={<Apple className="w-5 h-5" />}
          color="orange"
        />
        <StatCard
          label="Alimentos"
          value={foodLibrary.length}
          icon={<Library className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="Total Planos"
          value={plans.length}
          icon={<Utensils className="w-5 h-5" />}
          color="zinc"
        />
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="grid grid-cols-7 gap-4 px-6 py-4 bg-zinc-900 text-white font-bold text-sm tracking-wider rounded-t-2xl">
          <div className="col-span-2">PACIENTE / PLANO</div>
          <div>CALORIAS</div>
          <div>PROTEÍNA</div>
          <div>CARBS</div>
          <div>STATUS</div>
          <div className="text-right">AÇÕES</div>
        </div>
        <div className="divide-y divide-zinc-200">
          {filteredPlans.length === 0 ? (
            <EmptyState
              icon="nutrition"
              title="Nenhum plano nutricional encontrado"
              description="Crie o primeiro plano nutricional para seus pacientes."
              action={{
                label: "Criar Plano",
                onClick: () => setShowNewPlan(true)
              }}
            />
          ) : (
            filteredPlans.map((plan) => (
              <div key={plan.id} className="grid grid-cols-7 gap-4 px-6 py-4 items-center hover:bg-zinc-50 transition-colors">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">{getAthleteName(plan.athlete_id)}</div>
                    <div className="text-sm text-zinc-500">{plan.name}</div>
                  </div>
                </div>
                <div className="font-bold">{plan.daily_calories} kcal</div>
                <div>{plan.protein_grams}g</div>
                <div>{plan.carbs_grams}g</div>
                <div>
                  <StatusBadge status={plan.status === 'active' ? 'active' : 'inactive'} />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setSelectedPlan(plan); setViewMode('plan'); }} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors" title="Editar plano">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => {
                    const athlete = athletes.find(a => a.id === plan.athlete_id);
                    if (athlete) {
                      onSelectPatient({
                        id: athlete.user_id, name: athlete.name, email: athlete.email, phone: '', sport: '', position: '', club: '', birthDate: '', height: 0, weight: 0, goals: '', status: 'active', daysInProgram: 0, adherence: 0
                      });
                    }
                  }} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors" title="Ver paciente">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Seção de Avaliações Nutricionais */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tighter">Avaliações Nutricionais</h2>
              <p className="text-zinc-500 mt-1">Anamnese, Antropometria e Cálculo de Necessidades Energéticas</p>
            </div>
          </div>

          {athletes.length === 0 ? (
            <EmptyState
              icon="users"
              title="Nenhum paciente cadastrado"
              description="Cadastre pacientes para realizar avaliações nutricionais."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {athletes.map(athlete => (
                <div key={athlete.id} className="border border-zinc-200 rounded-xl p-4 hover:border-lime-500 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-lime-100 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-lime-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900">{athlete.name}</h4>
                      <p className="text-sm text-zinc-500">{athlete.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedAthleteForAssessment(athlete);
                        setViewMode('anamnesis');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Anamnese Nutricional
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAthleteForAssessment(athlete);
                        setViewMode('anthropometric');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                    >
                      <Ruler className="w-4 h-4" />
                      Avaliação Antropométrica
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAthleteForAssessment(athlete);
                        setViewMode('energy');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                    >
                      <Calculator className="w-4 h-4" />
                      Cálculo Energético
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAthleteForAssessment(athlete);
                        setViewMode('evolution');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm bg-lime-100 hover:bg-lime-200 rounded-lg transition-colors text-lime-700"
                    >
                      <Target className="w-4 h-4" />
                      Dashboard de Evolução
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* New Plan Modal */}
      {showNewPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Novo Plano Nutricional</h3>
              <button onClick={() => setShowNewPlan(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">PACIENTE</label>
                <select value={planForm.athlete_id} onChange={(e) => setPlanForm({ ...planForm, athlete_id: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" required>
                  <option value="">Selecione um paciente</option>
                  {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">NOME DO PLANO</label>
                <input type="text" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" placeholder="Ex: Dieta Hipertrofia" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">CALORIAS/DIA</label>
                  <input type="number" value={planForm.daily_calories} onChange={(e) => setPlanForm({ ...planForm, daily_calories: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">PROTEÍNAS (g)</label>
                  <input type="number" value={planForm.protein_grams} onChange={(e) => setPlanForm({ ...planForm, protein_grams: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">CARBOIDRATOS (g)</label>
                  <input type="number" value={planForm.carbs_grams} onChange={(e) => setPlanForm({ ...planForm, carbs_grams: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">GORDURAS (g)</label>
                  <input type="number" value={planForm.fat_grams} onChange={(e) => setPlanForm({ ...planForm, fat_grams: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowNewPlan(false)} className="flex-1 py-3 border-2 border-black font-bold hover:bg-black hover:text-white transition-colors">CANCELAR</button>
                <button type="submit" className="flex-1 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors">CRIAR PLANO</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
