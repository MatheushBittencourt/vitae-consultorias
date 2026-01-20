/**
 * Biblioteca de Alimentos
 * 
 * Exibe e gerencia alimentos da tabela TACO e personalizados
 */

import { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, Apple, Beef, Wheat, Milk, Leaf, 
  ChevronDown, Edit, Trash2, X, Loader2, Download, Upload,
  Info, Check
} from 'lucide-react';
import { Card, StatCard } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import api from '../../services/api';

interface FoodLibraryProps {
  consultancyId: number;
}

interface Food {
  id: number;
  name: string;
  category: string;
  serving_size: string;
  portion_description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  glycemic_index?: number;
  has_gluten?: boolean;
  has_lactose?: boolean;
  is_vegan?: boolean;
  is_vegetarian?: boolean;
  food_group?: string;
  is_global?: boolean;
  taco_id?: number;
}

// Categorias do ENUM do banco: proteina, carboidrato, gordura, vegetal, fruta, lacteo, bebida, suplemento, outros
const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: Apple },
  { id: 'proteina', label: 'Proteínas', icon: Beef },
  { id: 'carboidrato', label: 'Carboidratos', icon: Wheat },
  { id: 'gordura', label: 'Gorduras', icon: Apple },
  { id: 'vegetal', label: 'Vegetais', icon: Leaf },
  { id: 'fruta', label: 'Frutas', icon: Apple },
  { id: 'lacteo', label: 'Laticínios', icon: Milk },
  { id: 'bebida', label: 'Bebidas', icon: Apple },
  { id: 'suplemento', label: 'Suplementos', icon: Apple },
  { id: 'outros', label: 'Outros', icon: Apple },
];

const CATEGORY_COLORS: Record<string, string> = {
  proteina: 'bg-red-100 text-red-700',
  carboidrato: 'bg-amber-100 text-amber-700',
  gordura: 'bg-yellow-100 text-yellow-700',
  vegetal: 'bg-emerald-100 text-emerald-700',
  fruta: 'bg-orange-100 text-orange-700',
  lacteo: 'bg-blue-100 text-blue-700',
  bebida: 'bg-cyan-100 text-cyan-700',
  suplemento: 'bg-purple-100 text-purple-700',
  outros: 'bg-zinc-100 text-zinc-700',
};

export function FoodLibrary({ consultancyId }: FoodLibraryProps) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    loadFoods();
  }, [consultancyId]);

  const loadFoods = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/food-library?consultancy_id=${consultancyId}`);
      setFoods((response.data as Food[]) || []);
    } catch (error) {
      console.error('Erro ao carregar alimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportTACO = async () => {
    try {
      setImporting(true);
      setImportStatus('Importando alimentos da tabela TACO...');
      
      const response = await api.post(`/food-library/import-taco`, {
        consultancy_id: consultancyId
      });
      
      const data = response.data as { imported?: number; message?: string };
      setImportStatus(`✓ ${data.imported || 0} alimentos importados!`);
      await loadFoods();
      
      setTimeout(() => setImportStatus(null), 3000);
    } catch (error) {
      console.error('Erro ao importar TACO:', error);
      setImportStatus('Erro ao importar. Tente novamente.');
      setTimeout(() => setImportStatus(null), 3000);
    } finally {
      setImporting(false);
    }
  };

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Estatísticas
  const stats = {
    total: foods.length,
    taco: foods.filter(f => f.taco_id || f.is_global).length,
    custom: foods.filter(f => !f.taco_id && !f.is_global).length,
    categories: [...new Set(foods.map(f => f.category))].length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Biblioteca de Alimentos</h2>
          <p className="text-zinc-600">Tabela TACO e alimentos personalizados</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {stats.taco === 0 && (
            <button
              onClick={handleImportTACO}
              disabled={importing}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors rounded-lg disabled:opacity-50"
            >
              {importing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Importar Tabela TACO
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Adicionar Alimento
          </button>
        </div>
      </div>

      {/* Import Status */}
      {importStatus && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          importStatus.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-lime-50 text-lime-700'
        }`}>
          {importing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Check className="w-5 h-5" />
          )}
          <span className="font-medium">{importStatus}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total de Alimentos"
          value={stats.total.toString()}
          icon={<Apple className="w-5 h-5" />}
          color="lime"
        />
        <StatCard
          label="Tabela TACO"
          value={stats.taco.toString()}
          icon={<Download className="w-5 h-5" />}
          color="orange"
        />
        <StatCard
          label="Personalizados"
          value={stats.custom.toString()}
          icon={<Plus className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="Categorias"
          value={stats.categories.toString()}
          icon={<Filter className="w-5 h-5" />}
          color="zinc"
        />
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar alimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {CATEGORIES.slice(0, 7).map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-lime-500 text-black'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Foods List */}
      {filteredFoods.length === 0 ? (
        <EmptyState
          icon="nutrition"
          title={searchTerm ? 'Nenhum alimento encontrado' : 'Biblioteca vazia'}
          description={
            searchTerm 
              ? 'Tente buscar por outro termo ou remova os filtros.'
              : stats.taco === 0
                ? 'Importe a tabela TACO para começar com +100 alimentos brasileiros.'
                : 'Adicione alimentos personalizados à sua biblioteca.'
          }
          action={stats.taco === 0 ? {
            label: 'Importar Tabela TACO',
            onClick: handleImportTACO
          } : undefined}
        />
      ) : (
        <div className="grid gap-3">
          {filteredFoods.map(food => (
            <FoodCard 
              key={food.id} 
              food={food} 
              onEdit={() => setEditingFood(food)}
              onDelete={() => handleDeleteFood(food.id)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingFood) && (
        <FoodModal
          food={editingFood}
          consultancyId={consultancyId}
          onClose={() => {
            setShowAddModal(false);
            setEditingFood(null);
          }}
          onSave={() => {
            loadFoods();
            setShowAddModal(false);
            setEditingFood(null);
          }}
        />
      )}
    </div>
  );

  async function handleDeleteFood(id: number) {
    if (!confirm('Tem certeza que deseja excluir este alimento?')) return;
    
    try {
      await api.delete(`/food-library/${id}?consultancy_id=${consultancyId}`);
      loadFoods();
    } catch (error) {
      console.error('Erro ao excluir alimento:', error);
      alert('Erro ao excluir alimento');
    }
  }
}

// Sub-component: Food Card
function FoodCard({ food, onEdit, onDelete }: { food: Food; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={`p-4 hover:border-lime-500 transition-colors ${food.is_global ? 'bg-orange-50/30' : ''}`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          CATEGORY_COLORS[food.category] || 'bg-zinc-100 text-zinc-600'
        }`}>
          <Apple className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-zinc-900">{food.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  CATEGORY_COLORS[food.category] || 'bg-zinc-100 text-zinc-600'
                }`}>
                  {food.category}
                </span>
                <span className="text-sm text-zinc-500">{food.serving_size}</span>
                {food.portion_description && (
                  <span className="text-sm text-zinc-400">({food.portion_description})</span>
                )}
                {food.is_global && (
                  <Badge variant="warning" className="text-xs">TACO</Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
              {!food.is_global && (
                <>
                  <button
                    onClick={onEdit}
                    className="p-1.5 text-zinc-400 hover:text-lime-600 hover:bg-lime-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Macros principais - sempre visíveis */}
          <div className="flex items-center gap-4 mt-3">
            <div className="text-center">
              <div className="text-lg font-bold text-lime-600">{food.calories}</div>
              <div className="text-xs text-zinc-500">kcal</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-500">{food.protein}g</div>
              <div className="text-xs text-zinc-500">Prot</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-500">{food.carbs}g</div>
              <div className="text-xs text-zinc-500">Carb</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-500">{food.fat}g</div>
              <div className="text-xs text-zinc-500">Gord</div>
            </div>
            {food.fiber !== undefined && food.fiber > 0 && (
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{food.fiber}g</div>
                <div className="text-xs text-zinc-500">Fibra</div>
              </div>
            )}
          </div>

          {/* Detalhes expandidos */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-zinc-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {food.sugar !== undefined && (
                <div>
                  <span className="text-zinc-500">Açúcar:</span>
                  <span className="ml-1 font-medium">{food.sugar}g</span>
                </div>
              )}
              {food.sodium !== undefined && (
                <div>
                  <span className="text-zinc-500">Sódio:</span>
                  <span className="ml-1 font-medium">{food.sodium}mg</span>
                </div>
              )}
              {food.glycemic_index !== undefined && food.glycemic_index > 0 && (
                <div>
                  <span className="text-zinc-500">IG:</span>
                  <span className="ml-1 font-medium">{food.glycemic_index}</span>
                </div>
              )}
              <div className="col-span-2 md:col-span-4 flex flex-wrap gap-2 mt-2">
                {food.has_gluten && <Badge variant="warning">Contém Glúten</Badge>}
                {food.has_lactose && <Badge variant="info">Contém Lactose</Badge>}
                {food.is_vegan && <Badge variant="success">Vegano</Badge>}
                {food.is_vegetarian && !food.is_vegan && <Badge variant="success">Vegetariano</Badge>}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Sub-component: Food Modal
function FoodModal({ 
  food, 
  consultancyId, 
  onClose, 
  onSave 
}: { 
  food: Food | null; 
  consultancyId: number;
  onClose: () => void; 
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: food?.name || '',
    category: food?.category || 'outros',
    serving_size: food?.serving_size || '100g',
    portion_description: food?.portion_description || '',
    calories: food?.calories || 0,
    protein: food?.protein || 0,
    carbs: food?.carbs || 0,
    fat: food?.fat || 0,
    fiber: food?.fiber || 0,
    sugar: food?.sugar || 0,
    sodium: food?.sodium || 0,
    glycemic_index: food?.glycemic_index || 0,
    has_gluten: food?.has_gluten || false,
    has_lactose: food?.has_lactose || false,
    is_vegan: food?.is_vegan || false,
    is_vegetarian: food?.is_vegetarian || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (food) {
        await api.put(`/food-library/${food.id}`, {
          ...formData,
          consultancy_id: consultancyId
        });
      } else {
        await api.post('/food-library', {
          ...formData,
          consultancy_id: consultancyId
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Erro ao salvar alimento:', error);
      alert('Erro ao salvar alimento');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {food ? 'Editar Alimento' : 'Novo Alimento'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Nome do Alimento</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                placeholder="Ex: Frango grelhado"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
              >
                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Porção</label>
              <input
                type="text"
                value={formData.serving_size}
                onChange={(e) => setFormData({ ...formData, serving_size: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                placeholder="Ex: 100g"
              />
            </div>
          </div>

          {/* Macros */}
          <div>
            <h4 className="text-sm font-bold text-zinc-700 mb-3">Valores Nutricionais (por porção)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500">CALORIAS (kcal)</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500">PROTEÍNA (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500">CARBOIDRATO (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500">GORDURA (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500">FIBRA (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fiber}
                  onChange={(e) => setFormData({ ...formData, fiber: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500">AÇÚCAR (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.sugar}
                  onChange={(e) => setFormData({ ...formData, sugar: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500">SÓDIO (mg)</label>
                <input
                  type="number"
                  value={formData.sodium}
                  onChange={(e) => setFormData({ ...formData, sodium: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500">ÍNDICE GLICÊMICO</label>
                <input
                  type="number"
                  value={formData.glycemic_index}
                  onChange={(e) => setFormData({ ...formData, glycemic_index: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Classificações */}
          <div>
            <h4 className="text-sm font-bold text-zinc-700 mb-3">Classificações</h4>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'has_gluten', label: 'Contém Glúten' },
                { key: 'has_lactose', label: 'Contém Lactose' },
                { key: 'is_vegan', label: 'Vegano' },
                { key: 'is_vegetarian', label: 'Vegetariano' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[item.key as keyof typeof formData] as boolean}
                    onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-300 text-lime-500 focus:ring-lime-500"
                  />
                  <span className="text-sm text-zinc-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-black font-bold hover:bg-black hover:text-white transition-colors rounded-lg"
          >
            CANCELAR
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.name}
            className="flex-1 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors rounded-lg disabled:opacity-50"
          >
            {saving ? 'SALVANDO...' : 'SALVAR'}
          </button>
        </div>
      </Card>
    </div>
  );
}
