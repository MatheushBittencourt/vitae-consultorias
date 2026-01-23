import { getAuthHeaders } from '../../services/api';
import { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Dumbbell, Trash2, X, 
  ChevronRight, BookOpen, ChevronDown, ChevronUp, 
  User, Target, Clock, TrendingUp, ArrowLeft, Calendar,
  Users, Library
} from 'lucide-react';
import { Card, StatCard } from '../ui/Card';
import { Badge, StatusBadge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { useToast } from '../ui/Toast';

const API_URL = '/api';

// ================== INTERFACES ==================

interface Athlete {
  id: number;
  user_id: number;
  name: string;
  email: string;
  sport: string;
}

interface TrainingPlan {
  id: number;
  athlete_id: number;
  coach_id: number;
  name: string;
  description: string;
  objective: string;
  duration_weeks: number;
  frequency_per_week: number;
  level: string;
  split_type: string;
  start_date: string;
  end_date: string;
  status: string;
  coach_name: string;
  athlete_name?: string;
}

interface TrainingDay {
  id: number;
  plan_id: number;
  day_letter: string;
  day_name: string;
  day_of_week: number | null;
  focus_muscles: string;
  estimated_duration: number;
  order_index: number;
}

interface TrainingExercise {
  id: number;
  plan_id: number;
  training_day_id: number | null;
  exercise_library_id: number | null;
  name: string;
  muscle_group: string;
  equipment: string;
  sets: number;
  reps: string;
  weight: string;
  rest_seconds: number;
  tempo: string;
  technique: string;
  rpe: string;
  video_url: string;
  order_index: number;
  notes: string;
}

interface ExerciseLibrary {
  id: number;
  name: string;
  description: string;
  muscle_group: string;
  equipment: string;
  video_url: string;
}

// ================== CONSTANTS ==================

const MUSCLE_GROUPS: Record<string, { name: string; color: string }> = {
  peito: { name: 'Peito', color: 'bg-red-100 text-red-700' },
  costas: { name: 'Costas', color: 'bg-blue-100 text-blue-700' },
  ombros: { name: 'Ombros', color: 'bg-orange-100 text-orange-700' },
  biceps: { name: 'Bíceps', color: 'bg-purple-100 text-purple-700' },
  triceps: { name: 'Tríceps', color: 'bg-pink-100 text-pink-700' },
  quadriceps: { name: 'Quadríceps', color: 'bg-green-100 text-green-700' },
  posterior: { name: 'Posterior', color: 'bg-teal-100 text-teal-700' },
  gluteos: { name: 'Glúteos', color: 'bg-rose-100 text-rose-700' },
  panturrilha: { name: 'Panturrilha', color: 'bg-amber-100 text-amber-700' },
  abdomen: { name: 'Abdomen', color: 'bg-cyan-100 text-cyan-700' },
  corpo_todo: { name: 'Corpo Todo', color: 'bg-lime-100 text-lime-700' },
  cardio: { name: 'Cardio', color: 'bg-red-100 text-red-700' },
};

const EQUIPMENT: Record<string, string> = {
  barra: 'Barra',
  halteres: 'Halteres',
  maquina: 'Máquina',
  cabo: 'Cabo',
  peso_corporal: 'Peso Corporal',
  kettlebell: 'Kettlebell',
  elastico: 'Elástico',
  outros: 'Outros',
};

const TECHNIQUES: Record<string, string> = {
  normal: 'Normal',
  drop_set: 'Drop Set',
  rest_pause: 'Rest-Pause',
  super_serie: 'Super Série',
  bi_set: 'Bi-Set',
  piramide: 'Pirâmide',
};

const OBJECTIVES: Record<string, string> = {
  hipertrofia: 'Hipertrofia',
  forca: 'Força',
  resistencia: 'Resistência',
  emagrecimento: 'Emagrecimento',
  condicionamento: 'Condicionamento',
  reabilitacao: 'Reabilitação',
  manutencao: 'Manutenção',
};

const LEVELS: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

const DAY_OF_WEEK_NAMES: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
};

// ================== INTERFACES ==================

import { AdminUser } from './AdminLoginPage';

interface AdminTrainingSectionProps {
  consultancyId?: number;
  adminUser?: AdminUser;
}

// ================== MAIN COMPONENT ==================

type ViewMode = 'list' | 'plan-detail' | 'library';

export function AdminTrainingSection({ consultancyId, adminUser }: AdminTrainingSectionProps) {
  const toast = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [exercisesByDay, setExercisesByDay] = useState<Record<number, TrainingExercise[]>>({});
  const [library, setLibrary] = useState<ExerciseLibrary[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<TrainingDay | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  
  // Modals
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'plan' | 'day' | 'exercise' | 'library'; id: number } | null>(null);
  const [showLibraryEditModal, setShowLibraryEditModal] = useState(false);
  const [editingLibraryExercise, setEditingLibraryExercise] = useState<ExerciseLibrary | null>(null);
  const [libraryForm, setLibraryForm] = useState({
    name: '',
    description: '',
    muscle_group: 'peito',
    equipment: 'barra',
    video_url: '',
  });
  
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);
  const [editingDay, setEditingDay] = useState<TrainingDay | null>(null);
  const [editingExercise, setEditingExercise] = useState<TrainingExercise | null>(null);
  
  // Forms
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    objective: 'hipertrofia',
    duration_weeks: 4,
    frequency_per_week: 4,
    level: 'intermediario',
    split_type: 'ABCD',
    athlete_id: 0,
    coach_id: 3,
    status: 'active',
  });

  const [dayForm, setDayForm] = useState({
    day_letter: 'A',
    day_name: '',
    day_of_week: 1,
    focus_muscles: '',
    estimated_duration: 60,
  });

  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    muscle_group: 'peito',
    equipment: 'barra',
    sets: 3,
    reps: '10-12',
    weight: '',
    rest_seconds: 60,
    tempo: '',
    technique: 'normal',
    rpe: '',
    video_url: '',
    notes: '',
    exercise_library_id: null as number | null,
  });

  const [searchLibrary, setSearchLibrary] = useState('');

  // ================== DATA LOADING ==================

  useEffect(() => {
    loadInitialData();
  }, [consultancyId]);

  const loadInitialData = async () => {
    if (!consultancyId) {
      setLoading(false);
      return;
    }
    try {
      const [plansRes, libraryRes, athletesRes] = await Promise.all([
        fetch(`${API_URL}/training-plans?consultancy_id=${consultancyId}`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/exercise-library?consultancy_id=${consultancyId}`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/athletes?consultancy_id=${consultancyId}`, { headers: getAuthHeaders() })
      ]);
      
      // Verificar se as respostas foram bem-sucedidas
      if (!plansRes.ok || !libraryRes.ok || !athletesRes.ok) {
        console.error('API error:', plansRes.status, libraryRes.status, athletesRes.status);
        setPlans([]);
        setLibrary([]);
        setAthletes([]);
        return;
      }
      
      const plansData = await plansRes.json();
      const libraryData = await libraryRes.json();
      const athletesData = await athletesRes.json();
      
      // Garantir que são arrays
      const safePlans = Array.isArray(plansData) ? plansData : [];
      const safeLibrary = Array.isArray(libraryData) ? libraryData : [];
      const safeAthletes = Array.isArray(athletesData) ? athletesData : [];
      
      // Adicionar nome do atleta aos planos
      const plansWithAthletes = safePlans.map((p: TrainingPlan) => ({
        ...p,
        athlete_name: safeAthletes.find((a: Athlete) => a.id === p.athlete_id)?.name || 'Atleta não encontrado'
      }));
      
      setPlans(plansWithAthletes);
      setLibrary(safeLibrary);
      setAthletes(safeAthletes);
    } catch (error) {
      console.error('Error loading data:', error);
      setPlans([]);
      setLibrary([]);
      setAthletes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPlanDetails = async (plan: TrainingPlan) => {
    try {
      // Carregar dias do plano
      const daysRes = await fetch(`${API_URL}/training-days?plan_id=${plan.id}`, { headers: getAuthHeaders() });
      const daysData: TrainingDay[] = await daysRes.json();
      setTrainingDays(daysData);
      
      // Carregar exercícios de cada dia
      const exercisesMap: Record<number, TrainingExercise[]> = {};
      for (const day of daysData) {
        const exRes = await fetch(`${API_URL}/training-exercises?day_id=${day.id}`, { headers: getAuthHeaders() });
        exercisesMap[day.id] = await exRes.json();
      }
      setExercisesByDay(exercisesMap);
      
      // Expandir todos os dias por padrão
      setExpandedDays(new Set(daysData.map(d => d.id)));
    } catch (error) {
      console.error('Error loading plan details:', error);
    }
  };

  const refreshExercises = async (dayId: number) => {
    const exRes = await fetch(`${API_URL}/training-exercises?day_id=${dayId}`, { headers: getAuthHeaders() });
    const exercises = await exRes.json();
    setExercisesByDay(prev => ({ ...prev, [dayId]: exercises }));
  };

  // ================== PLAN CRUD ==================

  const openAddPlan = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      description: '',
      objective: 'hipertrofia',
      duration_weeks: 4,
      frequency_per_week: 4,
      level: 'intermediario',
      split_type: 'ABCD',
      athlete_id: 0,
      coach_id: 3,
      status: 'active',
    });
    setShowPlanModal(true);
  };

  const openEditPlan = (plan: TrainingPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description || '',
      objective: plan.objective || 'hipertrofia',
      duration_weeks: plan.duration_weeks || 4,
      frequency_per_week: plan.frequency_per_week || 4,
      level: plan.level || 'intermediario',
      split_type: plan.split_type || 'ABCD',
      athlete_id: plan.athlete_id,
      coach_id: plan.coach_id,
      status: plan.status || 'active',
    });
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.athlete_id) {
      toast.warning('Selecione um atleta');
      return;
    }

    try {
      const url = editingPlan 
        ? `${API_URL}/training-plans/${editingPlan.id}`
        : `${API_URL}/training-plans`;
      
      const response = await fetch(url, {
        method: editingPlan ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(planForm)
      });

      if (!response.ok) throw new Error('Erro ao salvar');
      
      setShowPlanModal(false);
      await loadInitialData();
      
      // Se estava editando o plano selecionado, atualizar
      if (selectedPlan && editingPlan?.id === selectedPlan.id) {
        const updatedPlan = { ...selectedPlan, ...planForm };
        setSelectedPlan(updatedPlan as TrainingPlan);
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Erro ao salvar plano');
    }
  };

  const handleDeletePlan = async () => {
    if (!showDeleteConfirm || showDeleteConfirm.type !== 'plan') return;
    
    try {
      await fetch(`${API_URL}/training-plans/${showDeleteConfirm.id}`, { method: 'DELETE', headers: getAuthHeaders() });
      setShowDeleteConfirm(null);
      await loadInitialData();
      if (selectedPlan?.id === showDeleteConfirm.id) {
        setSelectedPlan(null);
        setViewMode('list');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  // ================== DAY CRUD ==================

  const openAddDay = () => {
    setEditingDay(null);
    const nextLetter = String.fromCharCode(65 + trainingDays.length);
    setDayForm({
      day_letter: nextLetter,
      day_name: '',
      day_of_week: 1,
      focus_muscles: '',
      estimated_duration: 60,
    });
    setShowDayModal(true);
  };

  const openEditDay = (day: TrainingDay) => {
    setEditingDay(day);
    setDayForm({
      day_letter: day.day_letter,
      day_name: day.day_name,
      day_of_week: day.day_of_week || 1,
      focus_muscles: day.focus_muscles || '',
      estimated_duration: day.estimated_duration,
    });
    setShowDayModal(true);
  };

  const handleSaveDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    try {
      const url = editingDay 
        ? `${API_URL}/training-days/${editingDay.id}`
        : `${API_URL}/training-days`;
      
      await fetch(url, {
        method: editingDay ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...dayForm,
          plan_id: selectedPlan.id,
          order_index: editingDay ? editingDay.order_index : trainingDays.length,
        })
      });
      
      setShowDayModal(false);
      await loadPlanDetails(selectedPlan);
    } catch (error) {
      console.error('Error saving day:', error);
    }
  };

  const handleDeleteDay = async () => {
    if (!showDeleteConfirm || showDeleteConfirm.type !== 'day' || !selectedPlan) return;
    
    try {
      await fetch(`${API_URL}/training-days/${showDeleteConfirm.id}`, { method: 'DELETE', headers: getAuthHeaders() });
      setShowDeleteConfirm(null);
      await loadPlanDetails(selectedPlan);
    } catch (error) {
      console.error('Error deleting day:', error);
    }
  };

  // ================== EXERCISE CRUD ==================

  const openAddExercise = (day: TrainingDay) => {
    setSelectedDay(day);
    setEditingExercise(null);
    setExerciseForm({
      name: '',
      muscle_group: 'peito',
      equipment: 'barra',
      sets: 3,
      reps: '10-12',
      weight: '',
      rest_seconds: 60,
      tempo: '',
      technique: 'normal',
      rpe: '',
      video_url: '',
      notes: '',
      exercise_library_id: null,
    });
    setShowExerciseModal(true);
  };

  const openEditExercise = (exercise: TrainingExercise, day: TrainingDay) => {
    setSelectedDay(day);
    setEditingExercise(exercise);
    setExerciseForm({
      name: exercise.name,
      muscle_group: exercise.muscle_group,
      equipment: exercise.equipment,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight || '',
      rest_seconds: exercise.rest_seconds,
      tempo: exercise.tempo || '',
      technique: exercise.technique,
      rpe: exercise.rpe || '',
      video_url: exercise.video_url || '',
      notes: exercise.notes || '',
      exercise_library_id: exercise.exercise_library_id,
    });
    setShowExerciseModal(true);
  };

  const handleSaveExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !selectedDay) return;

    try {
      const url = editingExercise 
        ? `${API_URL}/training-exercises/${editingExercise.id}`
        : `${API_URL}/training-exercises`;
      
      await fetch(url, {
        method: editingExercise ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...exerciseForm,
          plan_id: selectedPlan.id,
          training_day_id: selectedDay.id,
        })
      });
      
      setShowExerciseModal(false);
      await refreshExercises(selectedDay.id);
    } catch (error) {
      console.error('Error saving exercise:', error);
    }
  };

  const handleDeleteExercise = async () => {
    if (!showDeleteConfirm || showDeleteConfirm.type !== 'exercise') return;
    
    try {
      await fetch(`${API_URL}/training-exercises/${showDeleteConfirm.id}`, { method: 'DELETE', headers: getAuthHeaders() });
      setShowDeleteConfirm(null);
      if (selectedDay) await refreshExercises(selectedDay.id);
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const selectFromLibrary = (ex: ExerciseLibrary) => {
    setExerciseForm({
      ...exerciseForm,
      name: ex.name,
      muscle_group: ex.muscle_group,
      equipment: ex.equipment,
      video_url: ex.video_url || '',
      exercise_library_id: ex.id,
    });
    setShowLibraryPicker(false);
  };

  // ================== HELPERS ==================

  const toggleDayExpanded = (dayId: number) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  };

  const openPlanDetail = (plan: TrainingPlan) => {
    setSelectedPlan(plan);
    setViewMode('plan-detail');
    loadPlanDetails(plan);
  };

  const filteredPlans = plans.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.athlete_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLibrary = library.filter(ex => 
    ex.name.toLowerCase().includes(searchLibrary.toLowerCase())
  );

  // ================== LIBRARY CRUD ==================

  const openAddLibraryExercise = () => {
    setEditingLibraryExercise(null);
    setLibraryForm({
      name: '',
      description: '',
      muscle_group: 'peito',
      equipment: 'barra',
      video_url: '',
    });
    setShowLibraryEditModal(true);
  };

  const openEditLibraryExercise = (ex: ExerciseLibrary) => {
    setEditingLibraryExercise(ex);
    setLibraryForm({
      name: ex.name,
      description: ex.description || '',
      muscle_group: ex.muscle_group,
      equipment: ex.equipment,
      video_url: ex.video_url || '',
    });
    setShowLibraryEditModal(true);
  };

  const handleSaveLibraryExercise = async () => {
    if (!consultancyId) return;
    
    try {
      if (editingLibraryExercise) {
        // Atualizar
        await fetch(`${API_URL}/exercise-library/${editingLibraryExercise.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ ...libraryForm, consultancy_id: consultancyId })
        });
      } else {
        // Criar
        await fetch(`${API_URL}/exercise-library`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ ...libraryForm, consultancy_id: consultancyId })
        });
      }
      setShowLibraryEditModal(false);
      await loadInitialData();
    } catch (error) {
      console.error('Error saving library exercise:', error);
      toast.error('Erro ao salvar exercício');
    }
  };

  const handleDeleteLibraryExercise = async () => {
    if (!showDeleteConfirm || showDeleteConfirm.type !== 'library' || !consultancyId) return;
    
    try {
      await fetch(`${API_URL}/exercise-library/${showDeleteConfirm.id}?consultancy_id=${consultancyId}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      setShowDeleteConfirm(null);
      await loadInitialData();
    } catch (error) {
      console.error('Error deleting library exercise:', error);
    }
  };

  // ================== RENDER ==================

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-zinc-500">Carregando...</p>
      </div>
    );
  }

  // ========== VIEW: PLAN DETAIL ==========
  if (viewMode === 'plan-detail' && selectedPlan) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-black to-zinc-800 text-white p-6">
          <div className="flex items-start gap-4">
            <button 
              onClick={() => { setViewMode('list'); setSelectedPlan(null); }}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{selectedPlan.name}</h2>
                <span className={`px-3 py-1 text-xs font-bold ${
                  selectedPlan.status === 'active' ? 'bg-lime-500 text-black' : 'bg-zinc-600'
                }`}>
                  {selectedPlan.status === 'active' ? 'ATIVO' : selectedPlan.status?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300 mb-3">
                <User className="w-4 h-4" />
                <span>{selectedPlan.athlete_name}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {OBJECTIVES[selectedPlan.objective] || selectedPlan.objective}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedPlan.duration_weeks} semanas
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {selectedPlan.frequency_per_week}x/semana
                </span>
                {selectedPlan.split_type && (
                  <span className="px-2 py-0.5 bg-lime-500 text-black font-bold text-xs">
                    {selectedPlan.split_type}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => openEditPlan(selectedPlan)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors text-sm"
            >
              <Edit className="w-4 h-4" />
              Editar Plano
            </button>
          </div>
        </div>

        {/* Days Section */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Dias de Treino</h3>
            <p className="text-sm text-zinc-500">{trainingDays.length} dias programados</p>
          </div>
          <button 
            onClick={openAddDay}
            className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Dia
          </button>
        </div>

        {/* Days List */}
        {trainingDays.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-zinc-300 bg-zinc-50">
            <Calendar className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Nenhum dia de treino</h3>
            <p className="text-zinc-500 mb-6">Adicione os dias de treino (A, B, C, D, E...)</p>
            <button
              onClick={openAddDay}
              className="inline-flex items-center gap-2 px-6 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Criar Primeiro Dia
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {trainingDays.map(day => {
              const dayExercises = exercisesByDay[day.id] || [];
              const isExpanded = expandedDays.has(day.id);
              
              return (
                <div key={day.id} className="border border-zinc-200 bg-white">
                  {/* Day Header */}
                  <div 
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-zinc-50"
                    onClick={() => toggleDayExpanded(day.id)}
                  >
                    <span className="w-12 h-12 flex items-center justify-center bg-black text-white text-xl font-bold flex-shrink-0">
                      {day.day_letter}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold">{day.day_name || DAY_OF_WEEK_NAMES[day.day_of_week || 1]}</h4>
                        <span className="text-sm text-zinc-400">•</span>
                        <span className="text-sm text-zinc-500">{DAY_OF_WEEK_NAMES[day.day_of_week || 1]}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-zinc-500">
                        {day.focus_muscles && (
                          <span className="text-lime-600 font-medium">{day.focus_muscles}</span>
                        )}
                        <span>{dayExercises.length} exercícios</span>
                        <span>~{day.estimated_duration} min</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditDay(day); }}
                        className="p-2 text-zinc-400 hover:text-lime-600 hover:bg-lime-50 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm({ type: 'day', id: day.id }); }}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                    </div>
                  </div>

                  {/* Exercises */}
                  {isExpanded && (
                    <div className="border-t border-zinc-200">
                      {dayExercises.length === 0 ? (
                        <div className="p-6 text-center text-zinc-400">
                          <p className="mb-3">Nenhum exercício neste dia</p>
                          <button
                            onClick={() => openAddExercise(day)}
                            className="inline-flex items-center gap-1 text-lime-600 hover:text-lime-700 font-bold text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Adicionar exercício
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y divide-zinc-100">
                          {dayExercises.map((ex, idx) => (
                            <div key={ex.id} className="flex items-center gap-4 p-4 hover:bg-zinc-50">
                              <span className="w-8 h-8 flex items-center justify-center bg-zinc-100 text-zinc-600 font-bold text-sm flex-shrink-0">
                                {idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{ex.name}</span>
                                  {ex.video_url && (
                                    <a href={ex.video_url} target="_blank" className="text-xs text-blue-500 hover:underline">📹</a>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                  <span className={`px-2 py-0.5 text-xs font-bold ${MUSCLE_GROUPS[ex.muscle_group]?.color || 'bg-zinc-100'}`}>
                                    {MUSCLE_GROUPS[ex.muscle_group]?.name || ex.muscle_group}
                                  </span>
                                  <span className="text-zinc-600">{ex.sets}x {ex.reps}</span>
                                  {ex.weight && <span className="text-zinc-600">{ex.weight}</span>}
                                  <span className="text-zinc-400">Desc: {ex.rest_seconds}s</span>
                                  {ex.technique !== 'normal' && (
                                    <span className="px-2 py-0.5 text-xs font-bold bg-purple-100 text-purple-700">
                                      {TECHNIQUES[ex.technique]}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEditExercise(ex, day)}
                                  className="p-2 text-zinc-400 hover:text-lime-600 hover:bg-lime-50 rounded transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm({ type: 'exercise', id: ex.id })}
                                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => openAddExercise(day)}
                            className="w-full p-3 text-lime-600 hover:bg-lime-50 font-bold text-sm flex items-center justify-center gap-1 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Adicionar Exercício
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modals */}
        {showPlanModal && <PlanModal />}
        {showDayModal && <DayModal />}
        {showExerciseModal && <ExerciseModal />}
        {showLibraryPicker && <LibraryModal />}
        {showDeleteConfirm && <DeleteModal />}
      </div>
    );
  }

  // ========== VIEW: LIBRARY ==========
  if (viewMode === 'library') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter mb-2">
              <span className="text-lime-500">BIBLIOTECA</span>
            </h1>
            <p className="text-xl text-zinc-600">
              Exercícios disponíveis para os planos de treino
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openAddLibraryExercise}
              className="flex items-center gap-2 px-6 py-3 bg-lime-500 text-black font-bold tracking-wider hover:bg-lime-400 transition-colors"
            >
              <Plus className="w-5 h-5" />
              NOVO EXERCÍCIO
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
            placeholder="Buscar exercício..."
            value={searchLibrary}
            onChange={(e) => setSearchLibrary(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-zinc-200 focus:border-lime-500 outline-none transition-colors"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total de Exercícios"
            value={library.length}
            icon={<Dumbbell className="w-5 h-5" />}
            color="lime"
          />
          <StatCard
            label="Grupos Musculares"
            value={new Set(library.map(e => e.muscle_group)).size}
            icon={<Target className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            label="Com Vídeo"
            value={library.filter(e => e.video_url).length}
            icon={<BookOpen className="w-5 h-5" />}
            color="purple"
          />
          <StatCard
            label="Tipos de Equipamento"
            value={new Set(library.map(e => e.equipment)).size}
            icon={<Library className="w-5 h-5" />}
            color="orange"
          />
        </div>

        {/* Library Table */}
        <Card padding="none" className="overflow-hidden">
          <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-zinc-900 text-white font-bold text-sm tracking-wider rounded-t-2xl">
            <div className="col-span-2">EXERCÍCIO</div>
            <div>MÚSCULO</div>
            <div>EQUIPAMENTO</div>
            <div>VÍDEO</div>
            <div className="text-right">AÇÕES</div>
          </div>
          <div className="divide-y divide-zinc-200">
            {filteredLibrary.length === 0 ? (
              <EmptyState
                icon="training"
                title="Nenhum exercício encontrado"
                description="Adicione exercícios à sua biblioteca para usar nos planos de treino."
                action={{
                  label: "Adicionar Exercício",
                  onClick: openAddLibraryExercise
                }}
              />
            ) : (
              filteredLibrary.map(ex => (
                <div key={ex.id} className="grid grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-zinc-50 transition-colors">
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center text-black">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold">{ex.name}</div>
                      <div className="text-sm text-zinc-500 truncate max-w-xs">{ex.description}</div>
                    </div>
                  </div>
                  <div>
                    <Badge className={MUSCLE_GROUPS[ex.muscle_group]?.color || 'bg-zinc-100 text-zinc-700'}>
                      {MUSCLE_GROUPS[ex.muscle_group]?.name || ex.muscle_group}
                    </Badge>
                  </div>
                  <div className="text-sm">{EQUIPMENT[ex.equipment] || ex.equipment}</div>
                  <div>
                    {ex.video_url ? (
                      <a 
                        href={ex.video_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-lime-600 hover:underline text-sm font-bold"
                      >
                        Assistir →
                      </a>
                    ) : (
                      <span className="text-zinc-400 text-sm">-</span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditLibraryExercise(ex)}
                      className="p-2 text-zinc-600 hover:text-lime-600 hover:bg-lime-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm({ type: 'library', id: ex.id })}
                      className="p-2 text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Modal de Edição da Biblioteca */}
        {showLibraryEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card padding="none" className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {editingLibraryExercise ? 'Editar Exercício' : 'Novo Exercício'}
                </h3>
                <button onClick={() => setShowLibraryEditModal(false)} className="text-zinc-400 hover:text-black p-1 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-zinc-700">Nome do Exercício *</label>
                  <input
                    type="text"
                    value={libraryForm.name}
                    onChange={(e) => setLibraryForm({ ...libraryForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-300 focus:border-lime-500 outline-none rounded-lg text-sm"
                    placeholder="Ex: Supino Reto com Barra"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-zinc-700">Descrição</label>
                  <textarea
                    value={libraryForm.description}
                    onChange={(e) => setLibraryForm({ ...libraryForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-300 focus:border-lime-500 outline-none resize-none rounded-lg text-sm"
                    rows={3}
                    placeholder="Descrição do exercício..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-zinc-700">Grupo Muscular *</label>
                    <select
                      value={libraryForm.muscle_group}
                      onChange={(e) => setLibraryForm({ ...libraryForm, muscle_group: e.target.value })}
                      className="w-full px-4 py-2.5 border border-zinc-300 focus:border-lime-500 outline-none rounded-lg text-sm"
                    >
                      {Object.entries(MUSCLE_GROUPS).map(([key, val]) => (
                        <option key={key} value={key}>{val.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-zinc-700">Equipamento *</label>
                    <select
                      value={libraryForm.equipment}
                      onChange={(e) => setLibraryForm({ ...libraryForm, equipment: e.target.value })}
                      className="w-full px-4 py-2.5 border border-zinc-300 focus:border-lime-500 outline-none rounded-lg text-sm"
                    >
                      {Object.entries(EQUIPMENT).map(([key, val]) => (
                        <option key={key} value={key}>{val}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-zinc-700">URL do Vídeo (opcional)</label>
                  <input
                    type="url"
                    value={libraryForm.video_url}
                    onChange={(e) => setLibraryForm({ ...libraryForm, video_url: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-300 focus:border-lime-500 outline-none rounded-lg text-sm"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
              <div className="p-6 border-t border-zinc-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowLibraryEditModal(false)}
                  className="px-6 py-2.5 border border-zinc-300 font-bold hover:bg-zinc-50 transition-colors rounded-lg text-sm"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleSaveLibraryExercise}
                  disabled={!libraryForm.name}
                  className="px-6 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors disabled:opacity-50 rounded-lg text-sm"
                >
                  {editingLibraryExercise ? 'SALVAR' : 'ADICIONAR'}
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteConfirm?.type === 'library' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Excluir Exercício?</h3>
              <p className="text-zinc-600 text-sm mb-6">
                Esta ação não pode ser desfeita. O exercício será removido permanentemente da sua biblioteca.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2.5 border border-zinc-300 font-bold hover:bg-zinc-50 transition-colors rounded-lg text-sm"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleDeleteLibraryExercise}
                  className="flex-1 py-2.5 bg-red-500 text-white font-bold hover:bg-red-600 transition-colors rounded-lg text-sm"
                >
                  EXCLUIR
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // ========== VIEW: PLANS LIST ==========
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">TREINAMENTO</span>
          </h1>
          <p className="text-xl text-zinc-600">
            Gerencie os planos de treino dos atletas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('library')}
            className="flex items-center gap-2 px-6 py-3 border-2 border-zinc-200 font-bold tracking-wider hover:border-black transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            BIBLIOTECA
          </button>
          <button
            onClick={openAddPlan}
            className="flex items-center gap-2 bg-lime-500 text-black px-6 py-3 font-bold tracking-wider hover:bg-lime-400 transition-colors"
          >
            <Plus className="w-5 h-5" />
            NOVO PLANO
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar por plano ou atleta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-zinc-200 focus:border-lime-500 outline-none transition-colors"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Planos Ativos"
          value={plans.filter(p => p.status === 'active').length}
          icon={<Target className="w-5 h-5" />}
          color="lime"
        />
        <StatCard
          label="Atletas"
          value={athletes.length}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Exercícios na Biblioteca"
          value={library.length}
          icon={<Library className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="Total de Planos"
          value={plans.length}
          icon={<Dumbbell className="w-5 h-5" />}
          color="zinc"
        />
      </div>

      {/* Plans Table/Grid */}
      <Card padding="none" className="overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-7 gap-4 px-6 py-4 bg-zinc-900 text-white font-bold text-sm tracking-wider rounded-t-2xl">
          <div className="col-span-2">ATLETA / PLANO</div>
          <div>OBJETIVO</div>
          <div>DURAÇÃO</div>
          <div>DIVISÃO</div>
          <div>STATUS</div>
          <div className="text-right">AÇÕES</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-zinc-200">
          {filteredPlans.length === 0 ? (
            <EmptyState
              icon="training"
              title="Nenhum plano de treino encontrado"
              description="Crie o primeiro plano de treino para seus atletas."
              action={{
                label: "Criar Plano",
                onClick: openAddPlan
              }}
            />
          ) : (
            filteredPlans.map(plan => (
              <div 
                key={plan.id} 
                className="grid grid-cols-7 gap-4 px-6 py-4 items-center hover:bg-zinc-50 transition-colors cursor-pointer"
                onClick={() => openPlanDetail(plan)}
              >
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center text-black">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">{plan.athlete_name}</div>
                    <div className="text-sm text-zinc-500">{plan.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-zinc-400" />
                  <span>{OBJECTIVES[plan.objective] || plan.objective}</span>
                </div>
                <div>{plan.duration_weeks} sem • {plan.frequency_per_week}x</div>
                <div>
                  {plan.split_type && (
                    <Badge variant="default">{plan.split_type}</Badge>
                  )}
                </div>
                <div>
                  <StatusBadge status={plan.status === 'active' ? 'active' : 'inactive'} />
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEditPlan(plan); }}
                    className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                    title="Editar plano"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openPlanDetail(plan); }}
                    className="p-2 hover:bg-lime-100 text-lime-600 rounded-lg transition-colors"
                    title="Gerenciar"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Modals */}
      {showPlanModal && <PlanModal />}
      {showDeleteConfirm && <DeleteModal />}
    </div>
  );

  // ================== MODAL COMPONENTS ==================

  function PlanModal() {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card padding="none" className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
            <h3 className="text-xl font-bold">
              {editingPlan ? 'Editar Plano' : 'Novo Plano de Treino'}
            </h3>
            <button onClick={() => setShowPlanModal(false)} className="text-zinc-400 hover:text-black p-1 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSavePlan} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-zinc-700">ATLETA *</label>
              <select 
                value={planForm.athlete_id}
                onChange={(e) => setPlanForm({...planForm, athlete_id: Number(e.target.value)})}
                className={`w-full px-4 py-2.5 border outline-none rounded-lg text-sm ${
                  !planForm.athlete_id ? 'border-red-300 bg-red-50' : 'border-zinc-300 focus:border-lime-500'
                }`}
                required
              >
                <option value={0}>Selecione um atleta</option>
                {athletes.map(a => (
                  <option key={a.id} value={a.id}>{a.name} - {a.sport || 'Sem esporte'}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-zinc-700">NOME DO PLANO *</label>
              <input 
                type="text" 
                value={planForm.name}
                onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                className="w-full px-4 py-2.5 border border-zinc-300 focus:border-lime-500 outline-none rounded-lg text-sm" 
                placeholder="Ex: Hipertrofia - Fase 1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-700">OBJETIVO</label>
                <select 
                  value={planForm.objective}
                  onChange={(e) => setPlanForm({...planForm, objective: e.target.value})}
                  className="w-full px-4 py-2.5 border border-zinc-300 focus:border-lime-500 outline-none rounded-lg text-sm"
                >
                  {Object.entries(OBJECTIVES).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-700">NÍVEL</label>
                <select 
                  value={planForm.level}
                  onChange={(e) => setPlanForm({...planForm, level: e.target.value})}
                  className="w-full px-4 py-2.5 border border-zinc-300 focus:border-lime-500 outline-none rounded-lg text-sm"
                >
                  {Object.entries(LEVELS).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-700">DURAÇÃO</label>
                <input 
                  type="number" 
                  value={planForm.duration_weeks}
                  onChange={(e) => setPlanForm({...planForm, duration_weeks: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 border border-zinc-300 focus:border-lime-500 outline-none rounded-lg text-sm" 
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-700">FREQUÊNCIA</label>
                <select 
                  value={planForm.frequency_per_week}
                  onChange={(e) => setPlanForm({...planForm, frequency_per_week: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 border border-zinc-300 focus:border-lime-500 outline-none rounded-lg text-sm"
                >
                  {[1,2,3,4,5,6,7].map(n => (
                    <option key={n} value={n}>{n}x/sem</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-700">DIVISÃO</label>
                <input 
                  type="text" 
                  value={planForm.split_type}
                  onChange={(e) => setPlanForm({...planForm, split_type: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2.5 border border-zinc-300 focus:border-lime-500 outline-none rounded-lg text-sm" 
                  placeholder="ABCD"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="flex-1 py-2.5 border border-black font-bold hover:bg-black hover:text-white transition-colors rounded-lg text-sm"
              >
                CANCELAR
              </button>
              <button 
                type="submit"
                className="flex-1 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors rounded-lg text-sm"
              >
                {editingPlan ? 'SALVAR' : 'CRIAR PLANO'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  function DayModal() {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card padding="none" className="w-full max-w-md">
          <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
            <h3 className="text-xl font-bold">
              {editingDay ? 'Editar Dia' : 'Novo Dia de Treino'}
            </h3>
            <button onClick={() => setShowDayModal(false)} className="text-zinc-400 hover:text-black p-1 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSaveDay} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-700">LETRA</label>
                <input 
                  type="text" 
                  value={dayForm.day_letter}
                  onChange={(e) => setDayForm({...dayForm, day_letter: e.target.value.toUpperCase().slice(0,1)})}
                  className="w-full px-4 py-2.5 border border-zinc-300 focus:border-lime-500 outline-none text-center font-bold text-xl rounded-lg" 
                  maxLength={1}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-700">DIA DA SEMANA</label>
                <select 
                  value={dayForm.day_of_week}
                  onChange={(e) => setDayForm({...dayForm, day_of_week: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 border border-zinc-300 focus:border-lime-500 outline-none rounded-lg text-sm"
                >
                  {Object.entries(DAY_OF_WEEK_NAMES).map(([v, label]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-zinc-700">NOME DO TREINO</label>
              <input 
                type="text" 
                value={dayForm.day_name}
                onChange={(e) => setDayForm({...dayForm, day_name: e.target.value})}
                className="w-full px-4 py-2.5 border border-zinc-300 focus:border-lime-500 outline-none rounded-lg text-sm" 
                placeholder="Ex: Peito e Tríceps"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-zinc-700">FOCO MUSCULAR</label>
              <input 
                type="text" 
                value={dayForm.focus_muscles}
                onChange={(e) => setDayForm({...dayForm, focus_muscles: e.target.value})}
                className="w-full px-4 py-2.5 border border-zinc-300 focus:border-lime-500 outline-none rounded-lg text-sm" 
                placeholder="Ex: Peitoral, Deltóide, Tríceps"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-zinc-700">DURAÇÃO ESTIMADA (min)</label>
              <input 
                type="number" 
                value={dayForm.estimated_duration}
                onChange={(e) => setDayForm({...dayForm, estimated_duration: Number(e.target.value)})}
                className="w-full px-4 py-2.5 border border-zinc-300 focus:border-lime-500 outline-none rounded-lg text-sm" 
                min="15" step="5"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowDayModal(false)} className="flex-1 py-2.5 border border-black font-bold hover:bg-black hover:text-white transition-colors rounded-lg text-sm">
                CANCELAR
              </button>
              <button type="submit" className="flex-1 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors rounded-lg text-sm">
                {editingDay ? 'SALVAR' : 'CRIAR DIA'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  function ExerciseModal() {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
            <h3 className="text-xl font-bold">
              {editingExercise ? 'Editar Exercício' : 'Adicionar Exercício'}
              {selectedDay && <span className="text-lime-600 ml-2">- Treino {selectedDay.day_letter}</span>}
            </h3>
            <button onClick={() => setShowExerciseModal(false)} className="text-zinc-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSaveExercise} className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-lime-50 border border-lime-200">
              <span className="text-sm">📚 Buscar na biblioteca</span>
              <button type="button" onClick={() => setShowLibraryPicker(true)} className="px-4 py-2 bg-black text-white text-xs font-bold hover:bg-lime-500 hover:text-black transition-colors">
                BIBLIOTECA
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">EXERCÍCIO *</label>
              <input type="text" value={exerciseForm.name} onChange={(e) => setExerciseForm({...exerciseForm, name: e.target.value})} className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" placeholder="Nome do exercício" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">MÚSCULO</label>
                <select value={exerciseForm.muscle_group} onChange={(e) => setExerciseForm({...exerciseForm, muscle_group: e.target.value})} className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none">
                  {Object.entries(MUSCLE_GROUPS).map(([id, {name}]) => (<option key={id} value={id}>{name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">EQUIPAMENTO</label>
                <select value={exerciseForm.equipment} onChange={(e) => setExerciseForm({...exerciseForm, equipment: e.target.value})} className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none">
                  {Object.entries(EQUIPMENT).map(([id, name]) => (<option key={id} value={id}>{name}</option>))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">SÉRIES</label>
                <input type="number" value={exerciseForm.sets} onChange={(e) => setExerciseForm({...exerciseForm, sets: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" min="1" required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">REPS</label>
                <input type="text" value={exerciseForm.reps} onChange={(e) => setExerciseForm({...exerciseForm, reps: e.target.value})} className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" placeholder="10-12" required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">CARGA</label>
                <input type="text" value={exerciseForm.weight} onChange={(e) => setExerciseForm({...exerciseForm, weight: e.target.value})} className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" placeholder="50kg" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">DESC. (s)</label>
                <input type="number" value={exerciseForm.rest_seconds} onChange={(e) => setExerciseForm({...exerciseForm, rest_seconds: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" step="15" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">CADÊNCIA</label>
                <input type="text" value={exerciseForm.tempo} onChange={(e) => setExerciseForm({...exerciseForm, tempo: e.target.value})} className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" placeholder="3-1-2-0" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">TÉCNICA</label>
                <select value={exerciseForm.technique} onChange={(e) => setExerciseForm({...exerciseForm, technique: e.target.value})} className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none">
                  {Object.entries(TECHNIQUES).map(([id, name]) => (<option key={id} value={id}>{name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">RPE</label>
                <input type="text" value={exerciseForm.rpe} onChange={(e) => setExerciseForm({...exerciseForm, rpe: e.target.value})} className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" placeholder="7-8" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">VÍDEO (URL)</label>
              <input type="url" value={exerciseForm.video_url} onChange={(e) => setExerciseForm({...exerciseForm, video_url: e.target.value})} className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" placeholder="https://youtube.com/..." />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">OBSERVAÇÕES</label>
              <textarea value={exerciseForm.notes} onChange={(e) => setExerciseForm({...exerciseForm, notes: e.target.value})} className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none h-20 resize-none" placeholder="Instruções..." />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowExerciseModal(false)} className="flex-1 py-3 border-2 border-black font-bold hover:bg-black hover:text-white transition-colors">CANCELAR</button>
              <button type="submit" className="flex-1 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors">{editingExercise ? 'SALVAR' : 'ADICIONAR'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function LibraryModal() {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-black text-white">
            <h3 className="font-bold">📚 Biblioteca de Exercícios</h3>
            <button onClick={() => setShowLibraryPicker(false)} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 border-b border-zinc-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input type="text" placeholder="Buscar exercício..." value={searchLibrary} onChange={(e) => setSearchLibrary(e.target.value)} className="w-full pl-10 pr-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" autoFocus />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredLibrary.map((ex) => (
              <button key={ex.id} onClick={() => selectFromLibrary(ex)} className="w-full flex items-center gap-4 p-4 hover:bg-lime-50 border-b border-zinc-100 text-left transition-colors">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{ex.name}</div>
                  <div className="text-sm text-zinc-500 truncate">{ex.description?.substring(0, 50)}...</div>
                </div>
                <span className={`px-3 py-1 text-xs font-bold ${MUSCLE_GROUPS[ex.muscle_group]?.color || 'bg-zinc-100'}`}>
                  {MUSCLE_GROUPS[ex.muscle_group]?.name || ex.muscle_group}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function DeleteModal() {
    const titles: Record<string, string> = { plan: 'Excluir Plano', day: 'Excluir Dia', exercise: 'Excluir Exercício' };
    const messages: Record<string, string> = {
      plan: 'Todos os dias e exercícios serão excluídos. Esta ação não pode ser desfeita!',
      day: 'Todos os exercícios deste dia serão excluídos.',
      exercise: 'Tem certeza que deseja excluir este exercício?'
    };
    const handlers: Record<string, () => void> = { plan: handleDeletePlan, day: handleDeleteDay, exercise: handleDeleteExercise };
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-sm text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">{titles[showDeleteConfirm!.type]}</h3>
          <p className="text-zinc-600 text-sm mb-6">{messages[showDeleteConfirm!.type]}</p>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 border border-zinc-300 font-bold hover:bg-zinc-50 transition-colors rounded-lg text-sm">CANCELAR</button>
            <button onClick={handlers[showDeleteConfirm!.type]} className="flex-1 py-2.5 bg-red-500 text-white font-bold hover:bg-red-600 transition-colors rounded-lg text-sm">EXCLUIR</button>
          </div>
        </Card>
      </div>
    );
  }
}
