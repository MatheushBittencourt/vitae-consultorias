/**
 * Gerenciador de Receitas
 * 
 * Permite criar, editar e visualizar receitas com:
 * - Cálculo automático de valores nutricionais
 * - Busca na biblioteca de alimentos
 * - Classificações (vegano, sem glúten, etc)
 * - Modo de preparo passo a passo
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, StatCard } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { 
  ChefHat, Plus, Search, Edit, Trash2, X, Clock, Users,
  Flame, Beef, Wheat, Droplet, Leaf, Filter, Eye, Copy,
  ChevronDown, ChevronUp, GripVertical, BookOpen
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../ui/Toast';

interface RecipeManagerProps {
  consultancyId: number;
  userId: number;
}

interface Recipe {
  id: number;
  name: string;
  description?: string;
  category?: string;
  preparation_time?: number;
  cooking_time?: number;
  difficulty?: string;
  servings: number;
  serving_size?: string;
  instructions?: string[];
  tips?: string;
  calories_per_serving?: number;
  protein_per_serving?: number;
  carbs_per_serving?: number;
  fat_per_serving?: number;
  fiber_per_serving?: number;
  is_gluten_free?: boolean;
  is_lactose_free?: boolean;
  is_vegan?: boolean;
  is_vegetarian?: boolean;
  is_low_carb?: boolean;
  is_high_protein?: boolean;
  image_url?: string;
  created_by_name?: string;
  ingredient_count?: number;
  ingredients?: RecipeIngredient[];
}

interface RecipeIngredient {
  id?: number;
  food_id?: number;
  name: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  preparation_notes?: string;
  is_optional?: boolean;
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

export function RecipeManager({ consultancyId, userId }: RecipeManagerProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [foodLibrary, setFoodLibrary] = useState<FoodLibraryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'edit'>('list');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showNewRecipe, setShowNewRecipe] = useState(false);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [foodSearchTerm, setFoodSearchTerm] = useState('');

  // Form state
  const [recipeForm, setRecipeForm] = useState<Partial<Recipe>>({
    name: '',
    description: '',
    category: 'almoço',
    preparation_time: 15,
    cooking_time: 30,
    difficulty: 'medium',
    servings: 4,
    serving_size: '1 porção',
    instructions: [],
    tips: '',
    is_gluten_free: false,
    is_lactose_free: false,
    is_vegan: false,
    is_vegetarian: false,
    is_low_carb: false,
    is_high_protein: false,
  });
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [newInstruction, setNewInstruction] = useState('');

  const categories = [
    { value: 'café da manhã', label: 'Café da Manhã' },
    { value: 'lanche', label: 'Lanche' },
    { value: 'almoço', label: 'Almoço' },
    { value: 'jantar', label: 'Jantar' },
    { value: 'sobremesa', label: 'Sobremesa' },
    { value: 'bebida', label: 'Bebida' },
  ];

  const difficulties = [
    { value: 'easy', label: 'Fácil' },
    { value: 'medium', label: 'Médio' },
    { value: 'hard', label: 'Difícil' },
  ];

  useEffect(() => {
    loadData();
  }, [consultancyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recipesResponse, foodsResponse] = await Promise.all([
        api.get<Recipe[]>(`/recipes?consultancy_id=${consultancyId}&include_global=true`),
        api.get<FoodLibraryItem[]>(`/food-library?consultancy_id=${consultancyId}`),
      ]);
      
      setRecipes((recipesResponse.data as Recipe[]) || []);
      setFoodLibrary((foodsResponse.data as FoodLibraryItem[]) || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipeDetail = async (recipeId: number) => {
    try {
      const response = await api.get<Recipe>(`/recipes/${recipeId}`);
      setSelectedRecipe(response.data as Recipe);
      setViewMode('detail');
    } catch (error) {
      console.error('Erro ao carregar receita:', error);
    }
  };

  const handleSaveRecipe = async () => {
    try {
      const data = {
        ...recipeForm,
        consultancy_id: consultancyId,
        created_by: userId,
        ingredients,
      };

      if (selectedRecipe?.id) {
        await api.put(`/recipes/${selectedRecipe.id}`, data);
      } else {
        await api.post('/recipes', data);
      }

      await loadData();
      resetForm();
      setShowNewRecipe(false);
      setViewMode('list');
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      toast.error('Erro ao salvar receita');
    }
  };

  const handleDeleteRecipe = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return;
    
    try {
      await api.delete(`/recipes/${id}`);
      await loadData();
      if (selectedRecipe?.id === id) {
        setSelectedRecipe(null);
        setViewMode('list');
      }
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
    }
  };

  const handleDuplicateRecipe = async (id: number) => {
    try {
      await api.post(`/recipes/${id}/duplicate`, {
        consultancy_id: consultancyId,
        created_by: userId,
      });
      await loadData();
    } catch (error) {
      console.error('Erro ao duplicar receita:', error);
    }
  };

  const resetForm = () => {
    setRecipeForm({
      name: '',
      description: '',
      category: 'almoço',
      preparation_time: 15,
      cooking_time: 30,
      difficulty: 'medium',
      servings: 4,
      serving_size: '1 porção',
      instructions: [],
      tips: '',
      is_gluten_free: false,
      is_lactose_free: false,
      is_vegan: false,
      is_vegetarian: false,
      is_low_carb: false,
      is_high_protein: false,
    });
    setIngredients([]);
    setSelectedRecipe(null);
  };

  const editRecipe = (recipe: Recipe) => {
    setRecipeForm({
      name: recipe.name,
      description: recipe.description,
      category: recipe.category,
      preparation_time: recipe.preparation_time,
      cooking_time: recipe.cooking_time,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      serving_size: recipe.serving_size,
      instructions: recipe.instructions || [],
      tips: recipe.tips,
      is_gluten_free: recipe.is_gluten_free,
      is_lactose_free: recipe.is_lactose_free,
      is_vegan: recipe.is_vegan,
      is_vegetarian: recipe.is_vegetarian,
      is_low_carb: recipe.is_low_carb,
      is_high_protein: recipe.is_high_protein,
    });
    setIngredients(recipe.ingredients || []);
    setSelectedRecipe(recipe);
    setShowNewRecipe(true);
  };

  // Adicionar ingrediente da biblioteca
  const addIngredientFromLibrary = (food: FoodLibraryItem) => {
    const newIngredient: RecipeIngredient = {
      food_id: food.id,
      name: food.name,
      quantity: 100,
      unit: 'g',
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      is_optional: false,
    };
    setIngredients([...ingredients, newIngredient]);
    setShowFoodSearch(false);
    setFoodSearchTerm('');
  };

  // Adicionar ingrediente manual
  const addManualIngredient = () => {
    setIngredients([...ingredients, {
      name: '',
      quantity: 100,
      unit: 'g',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      is_optional: false,
    }]);
  };

  // Atualizar ingrediente
  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...ingredients];
    (updated[index] as any)[field] = value;

    // Se mudar quantidade, recalcular macros proporcionalmente
    if (field === 'quantity' && updated[index].food_id) {
      const food = foodLibrary.find(f => f.id === updated[index].food_id);
      if (food) {
        const ratio = value / 100;
        updated[index].calories = Math.round(food.calories * ratio);
        updated[index].protein = Math.round(food.protein * ratio * 10) / 10;
        updated[index].carbs = Math.round(food.carbs * ratio * 10) / 10;
        updated[index].fat = Math.round(food.fat * ratio * 10) / 10;
      }
    }

    setIngredients(updated);
  };

  // Remover ingrediente
  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Adicionar instrução
  const addInstruction = () => {
    if (!newInstruction.trim()) return;
    setRecipeForm({
      ...recipeForm,
      instructions: [...(recipeForm.instructions || []), newInstruction.trim()],
    });
    setNewInstruction('');
  };

  // Remover instrução
  const removeInstruction = (index: number) => {
    setRecipeForm({
      ...recipeForm,
      instructions: recipeForm.instructions?.filter((_, i) => i !== index),
    });
  };

  // Calcular totais
  const totals = ingredients.reduce((acc, ing) => ({
    calories: acc.calories + (ing.calories || 0),
    protein: acc.protein + (ing.protein || 0),
    carbs: acc.carbs + (ing.carbs || 0),
    fat: acc.fat + (ing.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const perServing = {
    calories: Math.round(totals.calories / (recipeForm.servings || 1)),
    protein: Math.round((totals.protein / (recipeForm.servings || 1)) * 10) / 10,
    carbs: Math.round((totals.carbs / (recipeForm.servings || 1)) * 10) / 10,
    fat: Math.round((totals.fat / (recipeForm.servings || 1)) * 10) / 10,
  };

  // Filtrar receitas
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || recipe.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtrar alimentos para busca
  const filteredFoods = foodLibrary.filter(food =>
    food.name.toLowerCase().includes(foodSearchTerm.toLowerCase())
  ).slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  // View: Detalhes da Receita
  if (viewMode === 'detail' && selectedRecipe) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => { setViewMode('list'); setSelectedRecipe(null); }}
          className="text-sm text-zinc-500 hover:text-black flex items-center gap-1"
        >
          ← Voltar às receitas
        </button>

        <Card className="overflow-hidden">
          {/* Header da receita */}
          <div className="p-6 bg-gradient-to-r from-lime-50 to-green-50">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default">{selectedRecipe.category}</Badge>
                  {selectedRecipe.is_vegan && <Badge variant="success">Vegano</Badge>}
                  {selectedRecipe.is_vegetarian && <Badge variant="lime">Vegetariano</Badge>}
                  {selectedRecipe.is_gluten_free && <Badge variant="info">Sem Glúten</Badge>}
                </div>
                <h2 className="text-3xl font-bold text-zinc-900">{selectedRecipe.name}</h2>
                {selectedRecipe.description && (
                  <p className="text-zinc-600 mt-2">{selectedRecipe.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => editRecipe(selectedRecipe)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteRecipe(selectedRecipe.id)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/60 rounded-xl p-3 text-center">
                <Clock className="w-5 h-5 text-zinc-500 mx-auto mb-1" />
                <p className="text-sm text-zinc-500">Preparo</p>
                <p className="font-bold">{selectedRecipe.preparation_time} min</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 text-center">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-sm text-zinc-500">Cozimento</p>
                <p className="font-bold">{selectedRecipe.cooking_time} min</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 text-center">
                <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-sm text-zinc-500">Porções</p>
                <p className="font-bold">{selectedRecipe.servings}</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 text-center">
                <ChefHat className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <p className="text-sm text-zinc-500">Dificuldade</p>
                <p className="font-bold capitalize">{selectedRecipe.difficulty}</p>
              </div>
            </div>
          </div>

          {/* Nutrição por porção */}
          <div className="p-6 border-b border-zinc-100">
            <h3 className="font-bold text-zinc-900 mb-4">Valores por Porção ({selectedRecipe.serving_size})</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-orange-600">{selectedRecipe.calories_per_serving}</p>
                <p className="text-sm text-orange-600">kcal</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <Beef className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-red-600">{selectedRecipe.protein_per_serving}g</p>
                <p className="text-sm text-red-600">proteína</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-xl">
                <Wheat className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-amber-600">{selectedRecipe.carbs_per_serving}g</p>
                <p className="text-sm text-amber-600">carbos</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <Droplet className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-600">{selectedRecipe.fat_per_serving}g</p>
                <p className="text-sm text-blue-600">gordura</p>
              </div>
            </div>
          </div>

          {/* Ingredientes */}
          <div className="p-6 border-b border-zinc-100">
            <h3 className="font-bold text-zinc-900 mb-4">Ingredientes</h3>
            <ul className="space-y-2">
              {selectedRecipe.ingredients?.map((ing, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-lime-500 rounded-full"></span>
                  <span>
                    <strong>{ing.quantity} {ing.unit}</strong> {ing.name}
                    {ing.preparation_notes && (
                      <span className="text-zinc-500 ml-1">({ing.preparation_notes})</span>
                    )}
                    {ing.is_optional && (
                      <Badge variant="default" size="sm" className="ml-2">opcional</Badge>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Modo de preparo */}
          {selectedRecipe.instructions && selectedRecipe.instructions.length > 0 && (
            <div className="p-6 border-b border-zinc-100">
              <h3 className="font-bold text-zinc-900 mb-4">Modo de Preparo</h3>
              <ol className="space-y-4">
                {selectedRecipe.instructions.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="w-8 h-8 bg-lime-100 text-lime-700 rounded-full flex items-center justify-center font-bold shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-zinc-700 pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Dicas */}
          {selectedRecipe.tips && (
            <div className="p-6">
              <h3 className="font-bold text-zinc-900 mb-2">💡 Dicas</h3>
              <p className="text-zinc-600">{selectedRecipe.tips}</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Receitas</h2>
          <p className="text-zinc-500 mt-1">Crie e gerencie receitas com cálculo automático de nutrição</p>
        </div>
        
        <button
          onClick={() => { resetForm(); setShowNewRecipe(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-lime-500 text-black font-semibold rounded-xl hover:bg-lime-400 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Receita
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar receitas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500"
        >
          <option value="">Todas as categorias</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total de Receitas"
          value={recipes.length}
          icon={<ChefHat className="w-5 h-5" />}
          color="lime"
        />
        <StatCard
          label="Low Carb"
          value={recipes.filter(r => r.is_low_carb).length}
          icon={<Leaf className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="High Protein"
          value={recipes.filter(r => r.is_high_protein).length}
          icon={<Beef className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          label="Veganas"
          value={recipes.filter(r => r.is_vegan).length}
          icon={<Leaf className="w-5 h-5" />}
          color="lime"
        />
      </div>

      {/* Lista de Receitas */}
      {filteredRecipes.length === 0 ? (
        <EmptyState
          icon="nutrition"
          title="Nenhuma receita encontrada"
          description="Crie sua primeira receita para começar"
          action={{
            label: "Criar Receita",
            onClick: () => setShowNewRecipe(true)
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <Card key={recipe.id} hover className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge variant="default" size="sm">{recipe.category}</Badge>
                    <h3 className="font-bold text-zinc-900 mt-2">{recipe.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    {recipe.is_vegan && <Leaf className="w-4 h-4 text-green-500" />}
                    {recipe.is_high_protein && <Beef className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                
                {recipe.description && (
                  <p className="text-sm text-zinc-500 line-clamp-2 mb-3">{recipe.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {(recipe.preparation_time || 0) + (recipe.cooking_time || 0)} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {recipe.servings} porções
                  </span>
                </div>
                
                {/* Macros */}
                <div className="flex items-center justify-between text-xs border-t border-zinc-100 pt-3">
                  <span className="text-orange-600">{recipe.calories_per_serving} kcal</span>
                  <span className="text-red-600">P: {recipe.protein_per_serving}g</span>
                  <span className="text-amber-600">C: {recipe.carbs_per_serving}g</span>
                  <span className="text-blue-600">G: {recipe.fat_per_serving}g</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex border-t border-zinc-100">
                <button
                  onClick={() => loadRecipeDetail(recipe.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Ver
                </button>
                <button
                  onClick={() => editRecipe(recipe)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors border-l border-zinc-100"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDuplicateRecipe(recipe.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors border-l border-zinc-100"
                >
                  <Copy className="w-4 h-4" />
                  Duplicar
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Nova/Editar Receita */}
      {showNewRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl my-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <h3 className="text-xl font-bold">
                {selectedRecipe ? 'Editar Receita' : 'Nova Receita'}
              </h3>
              <button onClick={() => { setShowNewRecipe(false); resetForm(); }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Info básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Nome da Receita</label>
                  <input
                    type="text"
                    value={recipeForm.name}
                    onChange={(e) => setRecipeForm({ ...recipeForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500"
                    placeholder="Ex: Frango Grelhado com Legumes"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Categoria</label>
                  <select
                    value={recipeForm.category}
                    onChange={(e) => setRecipeForm({ ...recipeForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Dificuldade</label>
                  <select
                    value={recipeForm.difficulty}
                    onChange={(e) => setRecipeForm({ ...recipeForm, difficulty: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500"
                  >
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Tempo de Preparo (min)</label>
                  <input
                    type="number"
                    value={recipeForm.preparation_time}
                    onChange={(e) => setRecipeForm({ ...recipeForm, preparation_time: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Tempo de Cozimento (min)</label>
                  <input
                    type="number"
                    value={recipeForm.cooking_time}
                    onChange={(e) => setRecipeForm({ ...recipeForm, cooking_time: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Porções</label>
                  <input
                    type="number"
                    value={recipeForm.servings}
                    onChange={(e) => setRecipeForm({ ...recipeForm, servings: Number(e.target.value) })}
                    min={1}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Descrição da Porção</label>
                  <input
                    type="text"
                    value={recipeForm.serving_size}
                    onChange={(e) => setRecipeForm({ ...recipeForm, serving_size: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500"
                    placeholder="Ex: 1 fatia de 150g"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Descrição</label>
                  <textarea
                    value={recipeForm.description}
                    onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 resize-none"
                    placeholder="Breve descrição da receita..."
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Classificações</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'is_gluten_free', label: 'Sem Glúten' },
                    { key: 'is_lactose_free', label: 'Sem Lactose' },
                    { key: 'is_vegan', label: 'Vegano' },
                    { key: 'is_vegetarian', label: 'Vegetariano' },
                    { key: 'is_low_carb', label: 'Low Carb' },
                    { key: 'is_high_protein', label: 'High Protein' },
                  ].map(tag => (
                    <button
                      key={tag.key}
                      type="button"
                      onClick={() => setRecipeForm({ ...recipeForm, [tag.key]: !recipeForm[tag.key as keyof typeof recipeForm] })}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        recipeForm[tag.key as keyof typeof recipeForm]
                          ? 'bg-lime-500 text-black'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredientes */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-zinc-700">Ingredientes</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFoodSearch(true)}
                      className="text-sm text-lime-600 hover:text-lime-700 font-medium"
                    >
                      + Da Biblioteca
                    </button>
                    <button
                      type="button"
                      onClick={addManualIngredient}
                      className="text-sm text-zinc-600 hover:text-zinc-700 font-medium"
                    >
                      + Manual
                    </button>
                  </div>
                </div>

                {ingredients.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-zinc-200 rounded-xl">
                    <p className="text-zinc-400">Adicione ingredientes da biblioteca ou manualmente</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ingredients.map((ing, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-zinc-50 rounded-xl">
                        <GripVertical className="w-4 h-4 text-zinc-300 cursor-grab" />
                        <input
                          type="number"
                          value={ing.quantity}
                          onChange={(e) => updateIngredient(index, 'quantity', Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-zinc-200 rounded-lg text-sm"
                        />
                        <select
                          value={ing.unit}
                          onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                          className="w-20 px-2 py-1 border border-zinc-200 rounded-lg text-sm"
                        >
                          <option value="g">g</option>
                          <option value="ml">ml</option>
                          <option value="un">un</option>
                          <option value="xíc">xíc</option>
                          <option value="cs">cs</option>
                          <option value="cc">cc</option>
                        </select>
                        <input
                          type="text"
                          value={ing.name}
                          onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                          className="flex-1 px-2 py-1 border border-zinc-200 rounded-lg text-sm"
                          placeholder="Nome do ingrediente"
                        />
                        <span className="text-xs text-zinc-400 w-16 text-right">{ing.calories} kcal</span>
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="p-1 hover:bg-zinc-200 rounded"
                        >
                          <X className="w-4 h-4 text-zinc-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Totais */}
                {ingredients.length > 0 && (
                  <div className="mt-4 p-4 bg-lime-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-zinc-700">Valores por Porção ({recipeForm.servings} porções)</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-orange-600">{perServing.calories}</p>
                        <p className="text-xs text-orange-600">kcal</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{perServing.protein}g</p>
                        <p className="text-xs text-red-600">proteína</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-amber-600">{perServing.carbs}g</p>
                        <p className="text-xs text-amber-600">carbos</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{perServing.fat}g</p>
                        <p className="text-xs text-blue-600">gordura</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modo de Preparo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Modo de Preparo</label>
                <div className="space-y-2 mb-3">
                  {recipeForm.instructions?.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-lime-100 text-lime-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-sm">{step}</span>
                      <button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        className="p-1 hover:bg-zinc-100 rounded"
                      >
                        <X className="w-4 h-4 text-zinc-400" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInstruction}
                    onChange={(e) => setNewInstruction(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInstruction())}
                    className="flex-1 px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500"
                    placeholder="Adicionar passo..."
                  />
                  <button
                    type="button"
                    onClick={addInstruction}
                    className="px-4 py-2 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Dicas */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Dicas (opcional)</label>
                <textarea
                  value={recipeForm.tips}
                  onChange={(e) => setRecipeForm({ ...recipeForm, tips: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 resize-none"
                  placeholder="Dicas extras para o preparo..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-4 p-6 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => { setShowNewRecipe(false); resetForm(); }}
                className="flex-1 py-3 border border-zinc-200 font-semibold rounded-xl hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveRecipe}
                className="flex-1 py-3 bg-lime-500 text-black font-semibold rounded-xl hover:bg-lime-400 transition-colors"
              >
                {selectedRecipe ? 'Salvar Alterações' : 'Criar Receita'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Busca de Alimentos */}
      {showFoodSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100">
              <h4 className="font-bold">Buscar Alimento</h4>
              <button onClick={() => { setShowFoodSearch(false); setFoodSearchTerm(''); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={foodSearchTerm}
                  onChange={(e) => setFoodSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500"
                  placeholder="Digite o nome do alimento..."
                  autoFocus
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredFoods.map(food => (
                  <button
                    key={food.id}
                    onClick={() => addIngredientFromLibrary(food)}
                    className="w-full flex items-center justify-between p-3 hover:bg-zinc-50 rounded-xl transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-zinc-900">{food.name}</p>
                      <p className="text-xs text-zinc-500">{food.serving_size} • {food.calories} kcal</p>
                    </div>
                    <Plus className="w-4 h-4 text-lime-500" />
                  </button>
                ))}
                {foodSearchTerm && filteredFoods.length === 0 && (
                  <p className="text-center text-zinc-400 py-4">Nenhum alimento encontrado</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
