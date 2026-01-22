/**
 * Biblioteca de Exercícios
 * 
 * Exibe e gerencia exercícios personalizados por consultoria
 */

import { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, Dumbbell, Play, 
  ChevronDown, Edit, Trash2, X, Loader2,
  Target, Zap, Video
} from 'lucide-react';
import { Card, StatCard } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

interface ExerciseLibraryProps {
  consultancyId: number;
}

interface Exercise {
  id: number;
  consultancy_id: number;
  name: string;
  description: string | null;
  muscle_group: string;
  secondary_muscle: string | null;
  equipment: string;
  difficulty: string;
  video_url: string | null;
  image_url: string | null;
  instructions: string | null;
  tips: string | null;
  is_global: boolean;
}

const API_URL = '/api';

// Grupos musculares
const MUSCLE_GROUPS = [
  { id: 'all', label: 'Todos' },
  { id: 'peito', label: 'Peito' },
  { id: 'costas', label: 'Costas' },
  { id: 'ombros', label: 'Ombros' },
  { id: 'biceps', label: 'Bíceps' },
  { id: 'triceps', label: 'Tríceps' },
  { id: 'antebraco', label: 'Antebraço' },
  { id: 'abdomen', label: 'Abdômen' },
  { id: 'quadriceps', label: 'Quadríceps' },
  { id: 'posterior', label: 'Posterior' },
  { id: 'gluteos', label: 'Glúteos' },
  { id: 'panturrilha', label: 'Panturrilha' },
  { id: 'corpo_todo', label: 'Corpo Todo' },
  { id: 'cardio', label: 'Cardio' },
];

const EQUIPMENT_OPTIONS = [
  { id: 'barra', label: 'Barra' },
  { id: 'halteres', label: 'Halteres' },
  { id: 'maquina', label: 'Máquina' },
  { id: 'cabo', label: 'Cabo' },
  { id: 'peso_corporal', label: 'Peso Corporal' },
  { id: 'kettlebell', label: 'Kettlebell' },
  { id: 'elastico', label: 'Elástico' },
  { id: 'bola', label: 'Bola' },
  { id: 'outros', label: 'Outros' },
];

const DIFFICULTY_OPTIONS = [
  { id: 'iniciante', label: 'Iniciante', color: 'bg-green-100 text-green-700' },
  { id: 'intermediario', label: 'Intermediário', color: 'bg-amber-100 text-amber-700' },
  { id: 'avancado', label: 'Avançado', color: 'bg-red-100 text-red-700' },
];

const MUSCLE_GROUP_COLORS: Record<string, string> = {
  peito: 'bg-red-100 text-red-700',
  costas: 'bg-blue-100 text-blue-700',
  ombros: 'bg-orange-100 text-orange-700',
  biceps: 'bg-purple-100 text-purple-700',
  triceps: 'bg-pink-100 text-pink-700',
  antebraco: 'bg-indigo-100 text-indigo-700',
  abdomen: 'bg-yellow-100 text-yellow-700',
  quadriceps: 'bg-emerald-100 text-emerald-700',
  posterior: 'bg-teal-100 text-teal-700',
  gluteos: 'bg-rose-100 text-rose-700',
  panturrilha: 'bg-cyan-100 text-cyan-700',
  corpo_todo: 'bg-lime-100 text-lime-700',
  cardio: 'bg-sky-100 text-sky-700',
};

export function ExerciseLibrary({ consultancyId }: ExerciseLibraryProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Exercise | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadExercises();
  }, [consultancyId]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/exercise-library?consultancy_id=${consultancyId}`);
      const data = await response.json();
      setExercises(data || []);
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exercise.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === 'all' || exercise.muscle_group === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  // Estatísticas
  const stats = {
    total: exercises.length,
    muscleGroups: [...new Set(exercises.map(e => e.muscle_group))].length,
    withVideo: exercises.filter(e => e.video_url).length,
    byDifficulty: {
      iniciante: exercises.filter(e => e.difficulty === 'iniciante').length,
      intermediario: exercises.filter(e => e.difficulty === 'intermediario').length,
      avancado: exercises.filter(e => e.difficulty === 'avancado').length,
    }
  };

  const handleDeleteExercise = async () => {
    if (!showDeleteModal) return;
    
    setDeleting(true);
    try {
      await fetch(`${API_URL}/exercise-library/${showDeleteModal.id}?consultancy_id=${consultancyId}`, {
        method: 'DELETE'
      });
      setShowDeleteModal(null);
      loadExercises();
    } catch (error) {
      console.error('Erro ao excluir exercício:', error);
      alert('Erro ao excluir exercício');
    } finally {
      setDeleting(false);
    }
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
          <h2 className="text-2xl font-bold">Biblioteca de Exercícios</h2>
          <p className="text-zinc-600">Gerencie exercícios com vídeos e instruções</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Adicionar Exercício
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total de Exercícios"
          value={stats.total.toString()}
          icon={<Dumbbell className="w-5 h-5" />}
          color="lime"
        />
        <StatCard
          label="Grupos Musculares"
          value={stats.muscleGroups.toString()}
          icon={<Target className="w-5 h-5" />}
          color="orange"
        />
        <StatCard
          label="Com Vídeo"
          value={stats.withVideo.toString()}
          icon={<Video className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="Avançados"
          value={stats.byDifficulty.avancado.toString()}
          icon={<Zap className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar exercício..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {MUSCLE_GROUPS.slice(0, 8).map(muscle => (
              <button
                key={muscle.id}
                onClick={() => setSelectedMuscle(muscle.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedMuscle === muscle.id
                    ? 'bg-lime-500 text-black'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {muscle.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Exercise List */}
      {filteredExercises.length === 0 ? (
        <EmptyState
          icon="training"
          title={searchTerm ? 'Nenhum exercício encontrado' : 'Biblioteca vazia'}
          description={
            searchTerm 
              ? 'Tente buscar por outro termo ou remova os filtros.'
              : 'Comece adicionando exercícios à sua biblioteca.'
          }
          action={{
            label: 'Adicionar Exercício',
            onClick: () => setShowAddModal(true)
          }}
        />
      ) : (
        <div className="grid gap-3">
          {filteredExercises.map(exercise => (
            <ExerciseCard 
              key={exercise.id} 
              exercise={exercise} 
              onEdit={() => setEditingExercise(exercise)}
              onDelete={() => setShowDeleteModal(exercise)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingExercise) && (
        <ExerciseModal
          exercise={editingExercise}
          consultancyId={consultancyId}
          onClose={() => {
            setShowAddModal(false);
            setEditingExercise(null);
          }}
          onSave={() => {
            loadExercises();
            setShowAddModal(false);
            setEditingExercise(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-red-600 mb-4">Confirmar Exclusão</h3>
            <p className="text-zinc-600 mb-2">
              Tem certeza que deseja excluir o exercício:
            </p>
            <p className="font-bold text-zinc-900 mb-4">{showDeleteModal.name}</p>
            <p className="text-sm text-zinc-500 mb-6">
              Esta ação não pode ser desfeita. O exercício será removido permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                disabled={deleting}
                className="flex-1 py-2.5 border border-zinc-300 font-bold hover:bg-zinc-50 transition-colors rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteExercise}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors rounded-lg flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  'Excluir'
                )}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Sub-component: Exercise Card
function ExerciseCard({ exercise, onEdit, onDelete }: { 
  exercise: Exercise; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const difficultyConfig = DIFFICULTY_OPTIONS.find(d => d.id === exercise.difficulty);
  const muscleLabel = MUSCLE_GROUPS.find(m => m.id === exercise.muscle_group)?.label || exercise.muscle_group;
  const equipmentLabel = EQUIPMENT_OPTIONS.find(e => e.id === exercise.equipment)?.label || exercise.equipment;

  return (
    <Card className="p-4 hover:border-lime-500 transition-colors">
      <div className="flex items-start gap-4">
        {/* Ícone */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          MUSCLE_GROUP_COLORS[exercise.muscle_group] || 'bg-zinc-100 text-zinc-600'
        }`}>
          <Dumbbell className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-zinc-900">{exercise.name}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  MUSCLE_GROUP_COLORS[exercise.muscle_group] || 'bg-zinc-100 text-zinc-600'
                }`}>
                  {muscleLabel}
                </span>
                {exercise.secondary_muscle && (
                  <span className="text-xs text-zinc-500">+ {exercise.secondary_muscle}</span>
                )}
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${difficultyConfig?.color || 'bg-zinc-100 text-zinc-600'}`}>
                  {difficultyConfig?.label || exercise.difficulty}
                </span>
                {exercise.video_url && (
                  <Badge variant="info" className="text-xs">
                    <Play className="w-3 h-3 mr-1" /> Vídeo
                  </Badge>
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
            </div>
          </div>

          {/* Info básica */}
          <div className="flex items-center gap-4 mt-3 text-sm text-zinc-600">
            <span className="flex items-center gap-1">
              <Dumbbell className="w-4 h-4" />
              {equipmentLabel}
            </span>
          </div>

          {/* Detalhes expandidos */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-zinc-100 space-y-3">
              {exercise.description && (
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase mb-1">Descrição</h4>
                  <p className="text-sm text-zinc-600">{exercise.description}</p>
                </div>
              )}
              {exercise.instructions && (
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase mb-1">Instruções</h4>
                  <p className="text-sm text-zinc-600 whitespace-pre-line">{exercise.instructions}</p>
                </div>
              )}
              {exercise.tips && (
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase mb-1">Dicas</h4>
                  <p className="text-sm text-zinc-600">{exercise.tips}</p>
                </div>
              )}
              {exercise.video_url && (
                <div>
                  <a
                    href={exercise.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-lime-600 hover:text-lime-700 font-medium"
                  >
                    <Play className="w-4 h-4" />
                    Assistir Vídeo Demonstrativo
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Sub-component: Exercise Modal
function ExerciseModal({ 
  exercise, 
  consultancyId, 
  onClose, 
  onSave 
}: { 
  exercise: Exercise | null; 
  consultancyId: number;
  onClose: () => void; 
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: exercise?.name || '',
    description: exercise?.description || '',
    muscle_group: exercise?.muscle_group || 'peito',
    secondary_muscle: exercise?.secondary_muscle || '',
    equipment: exercise?.equipment || 'peso_corporal',
    difficulty: exercise?.difficulty || 'intermediario',
    video_url: exercise?.video_url || '',
    image_url: exercise?.image_url || '',
    instructions: exercise?.instructions || '',
    tips: exercise?.tips || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Nome do exercício é obrigatório');
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        ...formData,
        consultancy_id: consultancyId
      };

      if (exercise) {
        await fetch(`/api/exercise-library/${exercise.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/exercise-library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Erro ao salvar exercício:', error);
      alert('Erro ao salvar exercício');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="text-xl font-bold">
            {exercise ? 'Editar Exercício' : 'Novo Exercício'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Nome do Exercício *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                placeholder="Ex: Supino Reto com Barra"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Grupo Muscular Principal *</label>
              <select
                value={formData.muscle_group}
                onChange={(e) => setFormData({ ...formData, muscle_group: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
              >
                {MUSCLE_GROUPS.filter(m => m.id !== 'all').map(muscle => (
                  <option key={muscle.id} value={muscle.id}>{muscle.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Músculo Secundário</label>
              <input
                type="text"
                value={formData.secondary_muscle}
                onChange={(e) => setFormData({ ...formData, secondary_muscle: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                placeholder="Ex: Tríceps"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Equipamento</label>
              <select
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
              >
                {EQUIPMENT_OPTIONS.map(equip => (
                  <option key={equip.id} value={equip.id}>{equip.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Dificuldade</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
              >
                {DIFFICULTY_OPTIONS.map(diff => (
                  <option key={diff.id} value={diff.id}>{diff.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none resize-none h-20"
              placeholder="Breve descrição do exercício..."
            />
          </div>

          {/* Instruções */}
          <div>
            <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Instruções de Execução</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none resize-none h-32"
              placeholder="Passo a passo de como executar o exercício..."
            />
          </div>

          {/* Dicas */}
          <div>
            <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Dicas</label>
            <textarea
              value={formData.tips}
              onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
              className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none resize-none h-20"
              placeholder="Dicas importantes para execução correta..."
            />
          </div>

          {/* Mídia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">URL do Vídeo</label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">URL da Imagem</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-200 flex gap-3 sticky bottom-0 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-black font-bold hover:bg-black hover:text-white transition-colors rounded-lg"
          >
            CANCELAR
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.name}
            className="flex-1 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                SALVANDO...
              </>
            ) : (
              'SALVAR'
            )}
          </button>
        </div>
      </Card>
    </div>
  );
}
