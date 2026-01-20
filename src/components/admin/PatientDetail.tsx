import { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Dumbbell, 
  Apple, 
  Stethoscope, 
  HeartPulse,
  Calendar,
  TrendingUp,
  Save,
  Plus,
  Trash2,
  Edit,
  Upload,
  FileText,
  Image,
  Download,
  X,
  Eye,
  Search,
  Target,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Ruler,
  Weight,
  Cake,
  Activity,
  Mail,
  Phone,
  MapPin,
  ClipboardList,
  Calculator,
  BarChart3
} from 'lucide-react';
import { Patient } from './AdminDashboard';
import { AdminUser } from './AdminLoginPage';
import { Card, StatCard } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { StatusBadge, Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { 
  NutritionAnamnesis, 
  AnthropometricAssessment, 
  EnergyCalculator,
  NutritionEvolutionDashboard 
} from '../nutrition';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  consultancyId?: number;
  adminUser: AdminUser;
}

type Tab = 'info' | 'training' | 'nutrition' | 'medical' | 'rehab' | 'progress' | 'appointments';

export function PatientDetail({ patient, onBack, consultancyId, adminUser }: PatientDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(patient);

  // Módulos disponíveis baseados na consultoria
  const modules = adminUser.modules || { training: true, nutrition: true, medical: true, rehab: true };

  // Tabs dinâmicas baseadas nos módulos ativos
  const allTabs = [
    { id: 'info' as Tab, label: 'Informações', icon: User, module: null },
    { id: 'training' as Tab, label: 'Treinamento', icon: Dumbbell, module: 'training' },
    { id: 'nutrition' as Tab, label: 'Nutrição', icon: Apple, module: 'nutrition' },
    { id: 'medical' as Tab, label: 'Médico', icon: Stethoscope, module: 'medical' },
    { id: 'rehab' as Tab, label: 'Reabilitação', icon: HeartPulse, module: 'rehab' },
    { id: 'progress' as Tab, label: 'Progresso', icon: TrendingUp, module: null },
    { id: 'appointments' as Tab, label: 'Agendamentos', icon: Calendar, module: null },
  ];

  const tabs = allTabs.filter(tab => 
    tab.module === null || modules[tab.module as keyof typeof modules]
  );

  const handleSave = () => {
    // TODO: Salvar no banco de dados
    setIsEditing(false);
    console.log('Salvando:', formData);
  };

  const patientAge = new Date().getFullYear() - new Date(patient.birthDate).getFullYear();

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-zinc-100 transition-colors rounded-lg"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar src={null} name={patient.name} size="xl" />
          <div className="min-w-0">
            <h1 className="text-2xl lg:text-4xl font-bold tracking-tighter truncate">{patient.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="default">{patient.sport}</Badge>
              {patient.position && <Badge variant="default">{patient.position}</Badge>}
              {patient.club && (
                <span className="text-sm text-zinc-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {patient.club}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={patient.status === 'active' ? 'active' : patient.status === 'pending' ? 'pending' : 'inactive'} />
              <span className="text-sm text-zinc-500">{patient.daysInProgram} dias no programa</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-auto lg:ml-0">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors text-sm rounded-md">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Agendar</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard 
          label="Altura" 
          value={`${patient.height}cm`} 
          icon={<Ruler className="w-5 h-5" />} 
          color="lime"
        />
        <StatCard 
          label="Peso" 
          value={`${patient.weight}kg`} 
          icon={<Weight className="w-5 h-5" />} 
          color="zinc"
        />
        <StatCard 
          label="Idade" 
          value={`${patientAge} anos`} 
          icon={<Cake className="w-5 h-5" />} 
          color="zinc"
        />
        <StatCard 
          label="No Programa" 
          value={`${patient.daysInProgram} dias`} 
          icon={<Activity className="w-5 h-5" />} 
          color="zinc"
        />
      </div>

      {/* Contact Info */}
      <Card className="p-4 flex flex-wrap items-center gap-4 lg:gap-8">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Mail className="w-4 h-4 text-zinc-400" />
          <span>{patient.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Phone className="w-4 h-4 text-zinc-400" />
          <span>{patient.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Cake className="w-4 h-4 text-zinc-400" />
          <span>{new Date(patient.birthDate).toLocaleDateString('pt-BR')}</span>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="p-0 overflow-hidden">
        <div className="border-b border-zinc-200">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 lg:px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-lime-500 text-black bg-lime-50'
                      : 'border-transparent text-zinc-500 hover:text-black hover:bg-zinc-50'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-6">
          {activeTab === 'info' && (
            <PatientInfoTab 
              patient={formData} 
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              onChange={setFormData}
              onSave={handleSave}
            />
          )}
          {activeTab === 'training' && <TrainingTab patient={patient} consultancyId={consultancyId} adminUser={adminUser} />}
          {activeTab === 'nutrition' && <NutritionTab patient={patient} consultancyId={consultancyId} adminUser={adminUser} />}
          {activeTab === 'medical' && <MedicalTab patient={patient} />}
          {activeTab === 'rehab' && <RehabTab patient={patient} />}
          {activeTab === 'progress' && <ProgressTab patient={patient} />}
          {activeTab === 'appointments' && <AppointmentsTab patient={patient} />}
        </div>
      </Card>
    </div>
  );
}

// Sub-components for each tab

function PatientInfoTab({ 
  patient, 
  isEditing, 
  setIsEditing,
  onChange,
  onSave 
}: { 
  patient: Patient; 
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  onChange: (p: Patient) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold">Informações Pessoais</h2>
        {isEditing ? (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-zinc-300 hover:border-black transition-colors text-sm rounded-md"
            >
              Cancelar
            </button>
            <button 
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors text-sm rounded-md"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors text-sm rounded-md"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs tracking-wider font-bold mb-2 text-zinc-500 uppercase">Nome Completo</label>
          {isEditing ? (
            <input 
              type="text" 
              value={patient.name}
              onChange={(e) => onChange({ ...patient, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm"
            />
          ) : (
            <p className="text-base font-medium">{patient.name}</p>
          )}
        </div>
        <div>
          <label className="block text-xs tracking-wider font-bold mb-2 text-zinc-500 uppercase">Email</label>
          {isEditing ? (
            <input 
              type="email" 
              value={patient.email}
              onChange={(e) => onChange({ ...patient, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm"
            />
          ) : (
            <p className="text-base font-medium">{patient.email}</p>
          )}
        </div>
        <div>
          <label className="block text-xs tracking-wider font-bold mb-2 text-zinc-500 uppercase">Telefone</label>
          {isEditing ? (
            <input 
              type="tel" 
              value={patient.phone}
              onChange={(e) => onChange({ ...patient, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm"
            />
          ) : (
            <p className="text-base font-medium">{patient.phone}</p>
          )}
        </div>
        <div>
          <label className="block text-xs tracking-wider font-bold mb-2 text-zinc-500 uppercase">Data de Nascimento</label>
          {isEditing ? (
            <input 
              type="date" 
              value={patient.birthDate}
              onChange={(e) => onChange({ ...patient, birthDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm"
            />
          ) : (
            <p className="text-base font-medium">{new Date(patient.birthDate).toLocaleDateString('pt-BR')}</p>
          )}
        </div>
        <div>
          <label className="block text-xs tracking-wider font-bold mb-2 text-zinc-500 uppercase">Esporte</label>
          {isEditing ? (
            <input 
              type="text" 
              value={patient.sport}
              onChange={(e) => onChange({ ...patient, sport: e.target.value })}
              className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm"
            />
          ) : (
            <p className="text-base font-medium">{patient.sport}</p>
          )}
        </div>
        <div>
          <label className="block text-xs tracking-wider font-bold mb-2 text-zinc-500 uppercase">Posição</label>
          {isEditing ? (
            <input 
              type="text" 
              value={patient.position}
              onChange={(e) => onChange({ ...patient, position: e.target.value })}
              className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm"
            />
          ) : (
            <p className="text-base font-medium">{patient.position || '-'}</p>
          )}
        </div>
        <div>
          <label className="block text-xs tracking-wider font-bold mb-2 text-zinc-500 uppercase">Clube/Equipe</label>
          {isEditing ? (
            <input 
              type="text" 
              value={patient.club}
              onChange={(e) => onChange({ ...patient, club: e.target.value })}
              className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm"
            />
          ) : (
            <p className="text-base font-medium">{patient.club || '-'}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs tracking-wider font-bold mb-2 text-zinc-500 uppercase">Altura (cm)</label>
            {isEditing ? (
              <input 
                type="number" 
                value={patient.height}
                onChange={(e) => onChange({ ...patient, height: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm"
              />
            ) : (
              <p className="text-base font-medium">{patient.height} cm</p>
            )}
          </div>
          <div>
            <label className="block text-xs tracking-wider font-bold mb-2 text-zinc-500 uppercase">Peso (kg)</label>
            {isEditing ? (
              <input 
                type="number" 
                value={patient.weight}
                onChange={(e) => onChange({ ...patient, weight: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm"
              />
            ) : (
              <p className="text-base font-medium">{patient.weight} kg</p>
            )}
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-xs tracking-wider font-bold mb-2 text-zinc-500 uppercase">Objetivos</label>
        {isEditing ? (
          <textarea 
            value={patient.goals}
            onChange={(e) => onChange({ ...patient, goals: e.target.value })}
            className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none h-32 resize-none rounded-md text-sm"
          />
        ) : (
          <div className="p-4 bg-zinc-50 rounded-md">
            <p className="text-base">{patient.goals || 'Nenhum objetivo definido.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const API_URL = '/api';

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

const DAY_OF_WEEK_NAMES: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado'
};

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


interface ExerciseLibraryItem {
  id: number;
  name: string;
  muscle_group: string;
  equipment: string;
  description?: string;
  video_url?: string;
}

interface PlanForm {
  name: string;
  objective: string;
  duration_weeks: number;
  frequency_per_week: number;
  split_type: string;
}

interface DayForm {
  day_letter: string;
  day_name: string;
  day_of_week: number;
  focus_muscles: string;
  estimated_duration: number;
}

interface ExerciseForm {
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
  notes: string;
  video_url: string;
}

const DAY_TEMPLATES = [
  { letter: 'A', name: 'Treino A', focus: 'Peito e Tríceps' },
  { letter: 'B', name: 'Treino B', focus: 'Costas e Bíceps' },
  { letter: 'C', name: 'Treino C', focus: 'Pernas' },
  { letter: 'D', name: 'Treino D', focus: 'Ombros e Abdômen' },
  { letter: 'E', name: 'Treino E', focus: 'Full Body' },
  { letter: 'F', name: 'Treino F', focus: 'Cardio' },
];

function TrainingTab({ patient, consultancyId, adminUser }: { patient: Patient; consultancyId?: number; adminUser: AdminUser }) {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [exercisesByDay, setExercisesByDay] = useState<Record<number, TrainingExercise[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const [athleteId, setAthleteId] = useState<number | null>(null);
  
  // Modais
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [showEditDayModal, setShowEditDayModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showEditExerciseModal, setShowEditExerciseModal] = useState(false);
  
  // Estados de form
  const [planForm, setPlanForm] = useState<PlanForm>({
    name: '',
    objective: 'hipertrofia',
    duration_weeks: 12,
    frequency_per_week: 4,
    split_type: 'ABCD',
  });
  const [dayForm, setDayForm] = useState<DayForm>({
    day_letter: 'A',
    day_name: 'Treino A',
    day_of_week: 1,
    focus_muscles: 'Peito e Tríceps',
    estimated_duration: 60,
  });
  const [exerciseForm, setExerciseForm] = useState<ExerciseForm>({
    exercise_library_id: null,
    name: '',
    muscle_group: 'peito',
    equipment: 'barra',
    sets: 3,
    reps: '10-12',
    weight: '',
    rest_seconds: 60,
    tempo: '',
    technique: 'normal',
    notes: '',
    video_url: '',
  });
  
  // Estados de edição
  const [editingDayId, setEditingDayId] = useState<number | null>(null);
  const [editingExerciseId, setEditingExerciseId] = useState<number | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  
  // Biblioteca de exercícios
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseLibraryItem[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<ExerciseLibraryItem[]>([]);
  
  // Loading states
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlans();
    loadExerciseLibrary();
  }, [patient.id, consultancyId]);

  useEffect(() => {
    if (exerciseSearch.trim()) {
      const filtered = exerciseLibrary.filter(ex =>
        ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
        ex.muscle_group.toLowerCase().includes(exerciseSearch.toLowerCase())
      );
      setFilteredExercises(filtered.slice(0, 10));
    } else {
      setFilteredExercises([]);
    }
  }, [exerciseSearch, exerciseLibrary]);

  const loadExerciseLibrary = async () => {
    try {
      const res = await fetch(`${API_URL}/exercise-library?consultancy_id=${consultancyId}`);
      const data = await res.json();
      setExerciseLibrary(data as ExerciseLibraryItem[]);
    } catch (error) {
      console.error('Error loading exercise library:', error);
    }
  };

  const loadPlans = async () => {
    try {
      setLoading(true);
      const athleteRes = await fetch(`${API_URL}/athletes?user_id=${patient.id}&consultancy_id=${consultancyId}`);
      const athletes = await athleteRes.json();
      const athlete = athletes[0];
      
      if (athlete) {
        setAthleteId(athlete.id);
        const response = await fetch(`${API_URL}/training-plans?athlete_id=${athlete.id}`);
        const data = await response.json();
        setPlans(data);
        
        const activePlan = data.find((p: TrainingPlan) => p.status === 'active') || data[0];
        if (activePlan) {
          setSelectedPlanId(activePlan.id);
          setPlanForm({
            name: activePlan.name,
            objective: activePlan.objective || 'hipertrofia',
            duration_weeks: activePlan.duration_weeks || 12,
            frequency_per_week: activePlan.frequency_per_week || 4,
            split_type: activePlan.split_type || 'ABCD',
          });
          await loadPlanDetails(activePlan.id);
        }
      } else {
        setAthleteId(null);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlanDetails = async (planId: number) => {
    try {
      const daysRes = await fetch(`${API_URL}/training-days?plan_id=${planId}`);
      const daysData: TrainingDay[] = await daysRes.json();
      setTrainingDays(daysData);
      
      const exercisesMap: Record<number, TrainingExercise[]> = {};
      for (const day of daysData) {
        const exRes = await fetch(`${API_URL}/training-exercises?day_id=${day.id}`);
        exercisesMap[day.id] = await exRes.json();
      }
      setExercisesByDay(exercisesMap);
      setExpandedDays(new Set(daysData.map(d => d.id)));
    } catch (error) {
      console.error('Error loading plan details:', error);
    }
  };

  const toggleDay = (dayId: number) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  };

  // CRUD Plano
  const handleCreatePlan = async () => {
    if (!athleteId || !planForm.name) return;
    setSaving(true);
    try {
      await fetch(`${API_URL}/training-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athlete_id: athleteId,
          trainer_id: adminUser.id,
          name: planForm.name,
          objective: planForm.objective,
          duration_weeks: planForm.duration_weeks,
          frequency_per_week: planForm.frequency_per_week,
          split_type: planForm.split_type,
          status: 'active',
        }),
      });
      setShowCreatePlanModal(false);
      loadPlans();
    } catch (error) {
      console.error('Erro ao criar plano:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditPlan = async () => {
    if (!selectedPlanId || !planForm.name) return;
    setSaving(true);
    try {
      await fetch(`${API_URL}/training-plans/${selectedPlanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: planForm.name,
          objective: planForm.objective,
          duration_weeks: planForm.duration_weeks,
          frequency_per_week: planForm.frequency_per_week,
          split_type: planForm.split_type,
        }),
      });
      setShowEditPlanModal(false);
      loadPlans();
    } catch (error) {
      console.error('Erro ao editar plano:', error);
    } finally {
      setSaving(false);
    }
  };

  // CRUD Dia
  const openAddDayModal = () => {
    const usedLetters = trainingDays.map(d => d.day_letter);
    const nextTemplate = DAY_TEMPLATES.find(t => !usedLetters.includes(t.letter)) || DAY_TEMPLATES[0];
    setDayForm({
      day_letter: nextTemplate.letter,
      day_name: nextTemplate.name,
      day_of_week: 1,
      focus_muscles: nextTemplate.focus,
      estimated_duration: 60,
    });
    setEditingDayId(null);
    setShowAddDayModal(true);
  };

  const openEditDayModal = (day: TrainingDay) => {
    setDayForm({
      day_letter: day.day_letter,
      day_name: day.day_name || '',
      day_of_week: day.day_of_week || 1,
      focus_muscles: day.focus_muscles || '',
      estimated_duration: day.estimated_duration || 60,
    });
    setEditingDayId(day.id);
    setShowEditDayModal(true);
  };

  const handleSaveDay = async () => {
    if (!selectedPlanId || !dayForm.day_letter) return;
    setSaving(true);
    try {
      if (editingDayId) {
        await fetch(`${API_URL}/training-days/${editingDayId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dayForm),
        });
      } else {
        await fetch(`${API_URL}/training-days`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan_id: selectedPlanId,
            ...dayForm,
          }),
        });
      }
      setShowAddDayModal(false);
      setShowEditDayModal(false);
      loadPlanDetails(selectedPlanId);
    } catch (error) {
      console.error('Erro ao salvar dia:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDay = async (dayId: number) => {
    if (!confirm('Excluir este dia de treino? Todos os exercícios serão removidos.')) return;
    try {
      await fetch(`${API_URL}/training-days/${dayId}`, { method: 'DELETE' });
      if (selectedPlanId) loadPlanDetails(selectedPlanId);
    } catch (error) {
      console.error('Erro ao excluir dia:', error);
    }
  };

  // CRUD Exercício
  const openAddExerciseModal = (dayId: number) => {
    setSelectedDayId(dayId);
    setExerciseForm({
      exercise_library_id: null,
      name: '',
      muscle_group: 'peito',
      equipment: 'barra',
      sets: 3,
      reps: '10-12',
      weight: '',
      rest_seconds: 60,
      tempo: '',
      technique: 'normal',
      notes: '',
      video_url: '',
    });
    setExerciseSearch('');
    setEditingExerciseId(null);
    setShowAddExerciseModal(true);
  };

  const openEditExerciseModal = (exercise: TrainingExercise, dayId: number) => {
    setSelectedDayId(dayId);
    setExerciseForm({
      exercise_library_id: exercise.exercise_library_id || null,
      name: exercise.name,
      muscle_group: exercise.muscle_group,
      equipment: exercise.equipment || 'barra',
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight || '',
      rest_seconds: exercise.rest_seconds,
      tempo: exercise.tempo || '',
      technique: exercise.technique || 'normal',
      notes: exercise.notes || '',
      video_url: exercise.video_url || '',
    });
    setEditingExerciseId(exercise.id);
    setShowEditExerciseModal(true);
  };

  const selectExerciseFromLibrary = (ex: ExerciseLibraryItem) => {
    setExerciseForm({
      ...exerciseForm,
      exercise_library_id: ex.id,
      name: ex.name,
      muscle_group: ex.muscle_group,
      equipment: ex.equipment,
      video_url: ex.video_url || '',
    });
    setExerciseSearch('');
    setFilteredExercises([]);
  };

  const handleSaveExercise = async () => {
    if (!selectedDayId || !exerciseForm.name) return;
    setSaving(true);
    try {
      if (editingExerciseId) {
        await fetch(`${API_URL}/training-exercises/${editingExerciseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            training_day_id: selectedDayId,
            ...exerciseForm,
          }),
        });
      } else {
        await fetch(`${API_URL}/training-exercises`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan_id: selectedPlanId,
            training_day_id: selectedDayId,
            ...exerciseForm,
          }),
        });
      }
      setShowAddExerciseModal(false);
      setShowEditExerciseModal(false);
      if (selectedPlanId) loadPlanDetails(selectedPlanId);
    } catch (error) {
      console.error('Erro ao salvar exercício:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    if (!confirm('Excluir este exercício?')) return;
    try {
      await fetch(`${API_URL}/training-exercises/${exerciseId}`, { method: 'DELETE' });
      if (selectedPlanId) loadPlanDetails(selectedPlanId);
    } catch (error) {
      console.error('Erro ao excluir exercício:', error);
    }
  };

  const currentPlan = plans.find(p => p.id === selectedPlanId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
      </div>
    );
  }

  if (!athleteId) {
    return (
      <EmptyState
        icon="training"
        title="Paciente não configurado"
        description="Este paciente ainda não está configurado como atleta no sistema."
      />
    );
  }

  if (plans.length === 0) {
    return (
      <>
        <EmptyState
          icon="training"
          title="Nenhum plano de treino"
          description="Este paciente ainda não possui um plano de treino ativo."
          action={{
            label: 'Criar Plano de Treino',
            onClick: () => {
              setPlanForm({
                name: `Treino - ${patient.name}`,
                objective: 'hipertrofia',
                duration_weeks: 12,
                frequency_per_week: 4,
                split_type: 'ABCD',
              });
              setShowCreatePlanModal(true);
            }
          }}
        />

        {/* Modal Criar Plano */}
        {showCreatePlanModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg p-0">
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                <h3 className="text-xl font-bold">Novo Plano de Treino</h3>
                <button onClick={() => setShowCreatePlanModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Nome do Plano</label>
                  <input
                    type="text"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Objetivo</label>
                    <select
                      value={planForm.objective}
                      onChange={(e) => setPlanForm({ ...planForm, objective: e.target.value })}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                    >
                      {Object.entries(OBJECTIVES).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Duração (semanas)</label>
                    <input
                      type="number"
                      value={planForm.duration_weeks}
                      onChange={(e) => setPlanForm({ ...planForm, duration_weeks: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Frequência (x/semana)</label>
                    <input
                      type="number"
                      value={planForm.frequency_per_week}
                      onChange={(e) => setPlanForm({ ...planForm, frequency_per_week: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Divisão</label>
                    <select
                      value={planForm.split_type}
                      onChange={(e) => setPlanForm({ ...planForm, split_type: e.target.value })}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                    >
                      <option value="ABC">ABC (3 dias)</option>
                      <option value="ABCD">ABCD (4 dias)</option>
                      <option value="ABCDE">ABCDE (5 dias)</option>
                      <option value="PUSH_PULL_LEGS">Push/Pull/Legs</option>
                      <option value="UPPER_LOWER">Upper/Lower</option>
                      <option value="FULL_BODY">Full Body</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-zinc-200 flex gap-3">
                <button
                  onClick={() => setShowCreatePlanModal(false)}
                  className="flex-1 py-2.5 border border-black font-bold hover:bg-black hover:text-white transition-colors rounded-lg"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleCreatePlan}
                  disabled={saving || !planForm.name}
                  className="flex-1 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors rounded-lg disabled:opacity-50"
                >
                  {saving ? 'CRIANDO...' : 'CRIAR PLANO'}
                </button>
              </div>
            </Card>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <div className="bg-black text-white p-5 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold">{currentPlan?.name}</h2>
              <span className={`px-2 py-1 text-xs font-bold rounded ${
                currentPlan?.status === 'active' ? 'bg-lime-500 text-black' : 'bg-zinc-600'
              }`}>
                {currentPlan?.status === 'active' ? 'ATIVO' : currentPlan?.status?.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                {OBJECTIVES[currentPlan?.objective || ''] || currentPlan?.objective}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {currentPlan?.duration_weeks} semanas
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {currentPlan?.frequency_per_week}x/semana
              </span>
              {currentPlan?.split_type && (
                <span className="px-2 py-0.5 bg-lime-500 text-black font-bold text-xs rounded">
                  {currentPlan.split_type}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {plans.length > 1 && (
              <select 
                value={selectedPlanId || ''}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedPlanId(id);
                  loadPlanDetails(id);
                }}
                className="px-3 py-2 bg-white text-black font-bold text-sm rounded-md"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => setShowEditPlanModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold text-sm hover:bg-lime-500 transition-colors rounded-md"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
          </div>
        </div>
      </div>

      {/* Days List */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Dias de Treino</h3>
        <button
          onClick={openAddDayModal}
          className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-black font-bold hover:bg-lime-400 text-sm rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Dia
        </button>
      </div>

      {trainingDays.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="Nenhum dia de treino configurado"
          description="Adicione os dias de treino para este plano."
          action={{
            label: 'Adicionar Primeiro Dia',
            onClick: openAddDayModal
          }}
        />
      ) : (
        <div className="space-y-3">
          {trainingDays.map(day => {
            const dayExercises = exercisesByDay[day.id] || [];
            const isExpanded = expandedDays.has(day.id);
            
            return (
              <Card key={day.id} className="p-0 overflow-hidden">
                <div 
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
                  onClick={() => toggleDay(day.id)}
                >
                  <span className="w-12 h-12 flex items-center justify-center bg-lime-500 text-black text-xl font-bold flex-shrink-0 rounded-lg">
                    {day.day_letter}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold">{day.day_name || DAY_OF_WEEK_NAMES[day.day_of_week || 1]}</h4>
                      <span className="text-sm text-zinc-400">•</span>
                      <span className="text-sm text-zinc-500">{DAY_OF_WEEK_NAMES[day.day_of_week || 1]}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      {day.focus_muscles && <Badge variant="success" className="font-medium">{day.focus_muscles}</Badge>}
                      <span>{dayExercises.length} exercícios</span>
                      <span>~{day.estimated_duration} min</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEditDayModal(day)}
                      className="p-2 text-zinc-400 hover:text-lime-600 hover:bg-lime-50 rounded-md transition-colors"
                      title="Editar dia"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDay(day.id)}
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Excluir dia"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                </div>

                {isExpanded && (
                  <div className="border-t border-zinc-200">
                    {dayExercises.length > 0 ? (
                      <div className="divide-y divide-zinc-100">
                        {dayExercises.map((ex, idx) => (
                          <div key={ex.id} className="flex items-start gap-4 p-4 group hover:bg-zinc-50">
                            <span className="w-8 h-8 flex items-center justify-center bg-zinc-100 text-zinc-600 font-bold text-sm flex-shrink-0 rounded-md">
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-medium">{ex.name}</span>
                                {ex.video_url && (
                                  <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">📹 vídeo</a>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className={`px-2 py-0.5 text-xs font-bold rounded ${MUSCLE_GROUPS[ex.muscle_group]?.color || 'bg-zinc-100'}`}>
                                  {MUSCLE_GROUPS[ex.muscle_group]?.name || ex.muscle_group}
                                </span>
                                <span className="text-zinc-600">{ex.sets}x {ex.reps}</span>
                                {ex.weight && <span className="text-zinc-600 font-medium">{ex.weight}</span>}
                                <span className="text-zinc-400">Desc: {ex.rest_seconds}s</span>
                                {ex.tempo && <span className="text-zinc-400">Cadência: {ex.tempo}</span>}
                                {ex.technique !== 'normal' && (
                                  <Badge variant="info">
                                    {TECHNIQUES[ex.technique] || ex.technique}
                                  </Badge>
                                )}
                              </div>
                              {ex.notes && (
                                <p className="text-xs text-zinc-500 mt-2 italic">💡 {ex.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditExerciseModal(ex, day.id)}
                                className="p-1.5 text-zinc-400 hover:text-lime-600 hover:bg-lime-50 rounded-md transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteExercise(ex.id)}
                                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-zinc-400 text-sm">
                        Nenhum exercício configurado para este dia
                      </div>
                    )}
                    <div className="p-3 border-t border-zinc-200 bg-zinc-50">
                      <button
                        onClick={() => openAddExerciseModal(day.id)}
                        className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-lime-600 hover:bg-lime-100 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Exercício
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Editar Plano */}
      {showEditPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-0">
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-xl font-bold">Editar Plano de Treino</h3>
              <button onClick={() => setShowEditPlanModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Nome do Plano</label>
                <input
                  type="text"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Objetivo</label>
                  <select
                    value={planForm.objective}
                    onChange={(e) => setPlanForm({ ...planForm, objective: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  >
                    {Object.entries(OBJECTIVES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Duração (semanas)</label>
                  <input
                    type="number"
                    value={planForm.duration_weeks}
                    onChange={(e) => setPlanForm({ ...planForm, duration_weeks: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Frequência (x/semana)</label>
                  <input
                    type="number"
                    value={planForm.frequency_per_week}
                    onChange={(e) => setPlanForm({ ...planForm, frequency_per_week: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Divisão</label>
                  <select
                    value={planForm.split_type}
                    onChange={(e) => setPlanForm({ ...planForm, split_type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  >
                    <option value="ABC">ABC (3 dias)</option>
                    <option value="ABCD">ABCD (4 dias)</option>
                    <option value="ABCDE">ABCDE (5 dias)</option>
                    <option value="PUSH_PULL_LEGS">Push/Pull/Legs</option>
                    <option value="UPPER_LOWER">Upper/Lower</option>
                    <option value="FULL_BODY">Full Body</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-zinc-200 flex gap-3">
              <button
                onClick={() => setShowEditPlanModal(false)}
                className="flex-1 py-2.5 border border-black font-bold hover:bg-black hover:text-white transition-colors rounded-lg"
              >
                CANCELAR
              </button>
              <button
                onClick={handleEditPlan}
                disabled={saving || !planForm.name}
                className="flex-1 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors rounded-lg disabled:opacity-50"
              >
                {saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Adicionar/Editar Dia */}
      {(showAddDayModal || showEditDayModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-0">
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-xl font-bold">{editingDayId ? 'Editar Dia de Treino' : 'Novo Dia de Treino'}</h3>
              <button onClick={() => { setShowAddDayModal(false); setShowEditDayModal(false); }} className="p-2 hover:bg-zinc-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {!editingDayId && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {DAY_TEMPLATES.map(template => (
                    <button
                      key={template.letter}
                      onClick={() => setDayForm({
                        ...dayForm,
                        day_letter: template.letter,
                        day_name: template.name,
                        focus_muscles: template.focus,
                      })}
                      className={`px-3 py-2 text-sm font-bold rounded-lg transition-colors ${
                        dayForm.day_letter === template.letter
                          ? 'bg-lime-500 text-black'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {template.letter}
                    </button>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Letra do Dia</label>
                  <input
                    type="text"
                    value={dayForm.day_letter}
                    onChange={(e) => setDayForm({ ...dayForm, day_letter: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Nome do Treino</label>
                  <input
                    type="text"
                    value={dayForm.day_name}
                    onChange={(e) => setDayForm({ ...dayForm, day_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Foco Muscular</label>
                <input
                  type="text"
                  value={dayForm.focus_muscles}
                  onChange={(e) => setDayForm({ ...dayForm, focus_muscles: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  placeholder="Ex: Peito e Tríceps"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Dia da Semana</label>
                  <select
                    value={dayForm.day_of_week}
                    onChange={(e) => setDayForm({ ...dayForm, day_of_week: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  >
                    {Object.entries(DAY_OF_WEEK_NAMES).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Duração (min)</label>
                  <input
                    type="number"
                    value={dayForm.estimated_duration}
                    onChange={(e) => setDayForm({ ...dayForm, estimated_duration: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-zinc-200 flex gap-3">
              <button
                onClick={() => { setShowAddDayModal(false); setShowEditDayModal(false); }}
                className="flex-1 py-2.5 border border-black font-bold hover:bg-black hover:text-white transition-colors rounded-lg"
              >
                CANCELAR
              </button>
              <button
                onClick={handleSaveDay}
                disabled={saving || !dayForm.day_letter}
                className="flex-1 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors rounded-lg disabled:opacity-50"
              >
                {saving ? 'SALVANDO...' : (editingDayId ? 'SALVAR' : 'ADICIONAR DIA')}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Adicionar/Editar Exercício */}
      {(showAddExerciseModal || showEditExerciseModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-xl font-bold">{editingExerciseId ? 'Editar Exercício' : 'Adicionar Exercício'}</h3>
              <button onClick={() => { setShowAddExerciseModal(false); setShowEditExerciseModal(false); }} className="p-2 hover:bg-zinc-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Busca na biblioteca */}
              {!editingExerciseId && (
                <div className="relative">
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Buscar na Biblioteca</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={exerciseSearch}
                      onChange={(e) => setExerciseSearch(e.target.value)}
                      placeholder="Digite o nome do exercício..."
                      className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                    />
                  </div>
                  {filteredExercises.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredExercises.map(ex => (
                        <button
                          key={ex.id}
                          onClick={() => selectExerciseFromLibrary(ex)}
                          className="w-full px-4 py-3 text-left hover:bg-lime-50 flex items-center gap-3 transition-colors"
                        >
                          <span className={`px-2 py-0.5 text-xs font-bold rounded ${MUSCLE_GROUPS[ex.muscle_group]?.color || 'bg-zinc-100'}`}>
                            {MUSCLE_GROUPS[ex.muscle_group]?.name || ex.muscle_group}
                          </span>
                          <span className="font-medium">{ex.name}</span>
                          <span className="text-xs text-zinc-400 ml-auto">{EQUIPMENT[ex.equipment] || ex.equipment}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Nome do Exercício</label>
                <input
                  type="text"
                  value={exerciseForm.name}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Grupo Muscular</label>
                  <select
                    value={exerciseForm.muscle_group}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, muscle_group: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  >
                    {Object.entries(MUSCLE_GROUPS).map(([key, val]) => (
                      <option key={key} value={key}>{val.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Equipamento</label>
                  <select
                    value={exerciseForm.equipment}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, equipment: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  >
                    {Object.entries(EQUIPMENT).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Séries</label>
                  <input
                    type="number"
                    value={exerciseForm.sets}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, sets: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Repetições</label>
                  <input
                    type="text"
                    value={exerciseForm.reps}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, reps: e.target.value })}
                    placeholder="10-12"
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Carga</label>
                  <input
                    type="text"
                    value={exerciseForm.weight}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, weight: e.target.value })}
                    placeholder="20kg"
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Descanso (s)</label>
                  <input
                    type="number"
                    value={exerciseForm.rest_seconds}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, rest_seconds: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Cadência/Tempo</label>
                  <input
                    type="text"
                    value={exerciseForm.tempo}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, tempo: e.target.value })}
                    placeholder="2-0-2-0"
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Técnica</label>
                  <select
                    value={exerciseForm.technique}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, technique: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                  >
                    {Object.entries(TECHNIQUES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">URL do Vídeo</label>
                <input
                  type="text"
                  value={exerciseForm.video_url}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, video_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Observações</label>
                <textarea
                  value={exerciseForm.notes}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })}
                  placeholder="Dicas de execução, ajustes, etc..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-zinc-200 flex gap-3">
              <button
                onClick={() => { setShowAddExerciseModal(false); setShowEditExerciseModal(false); }}
                className="flex-1 py-2.5 border border-black font-bold hover:bg-black hover:text-white transition-colors rounded-lg"
              >
                CANCELAR
              </button>
              <button
                onClick={handleSaveExercise}
                disabled={saving || !exerciseForm.name}
                className="flex-1 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors rounded-lg disabled:opacity-50"
              >
                {saving ? 'SALVANDO...' : (editingExerciseId ? 'SALVAR' : 'ADICIONAR EXERCÍCIO')}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

interface NutritionPlan {
  id: number;
  name: string;
  nutritionist_name: string;
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  status?: string;
  meals?: NutritionMeal[];
}

interface NutritionMeal {
  id: number;
  name: string;
  time: string;
  foods?: NutritionFood[];
}

interface NutritionFood {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  option_group: number;
}

type NutritionSubView = 'plan' | 'anamnesis' | 'anthropometric' | 'energy' | 'evolution';

interface MealForm {
  name: string;
  time: string;
  notes: string;
}

interface FoodForm {
  food_id: number | null;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  option_group: number;
}

function NutritionTab({ patient, consultancyId, adminUser }: { patient: Patient; consultancyId?: number; adminUser: AdminUser }) {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [athleteId, setAthleteId] = useState<number | null>(null);
  const [subView, setSubView] = useState<NutritionSubView>('plan');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingMealId, setEditingMealId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [foodLibrary, setFoodLibrary] = useState<Array<{ id: number; name: string; calories: number; protein: number; carbs: number; fat: number; serving_size: string }>>([]);
  const [foodSearch, setFoodSearch] = useState('');
  
  const [planForm, setPlanForm] = useState({
    name: `Plano Nutricional - ${patient.name}`,
    daily_calories: 2000,
    protein_grams: 150,
    carbs_grams: 250,
    fat_grams: 70,
  });

  const [mealForm, setMealForm] = useState<MealForm>({
    name: '',
    time: '08:00',
    notes: ''
  });

  const [foodForm, setFoodForm] = useState<FoodForm>({
    food_id: null,
    name: '',
    quantity: 1,
    unit: 'porção',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    option_group: 0
  });

  const mealTemplates = [
    { name: 'Café da manhã', time: '07:00' },
    { name: 'Lanche da manhã', time: '10:00' },
    { name: 'Almoço', time: '12:30' },
    { name: 'Lanche da tarde', time: '15:30' },
    { name: 'Jantar', time: '19:00' },
    { name: 'Ceia', time: '21:30' },
    { name: 'Pré-treino', time: '17:00' },
    { name: 'Pós-treino', time: '18:30' },
  ];

  useEffect(() => {
    loadNutritionPlan();
    loadFoodLibrary();
  }, [patient.id, consultancyId]);

  const loadFoodLibrary = async () => {
    try {
      const response = await fetch(`/api/food-library?consultancy_id=${consultancyId}`);
      const data = await response.json();
      setFoodLibrary(data || []);
    } catch (error) {
      console.error('Erro ao carregar biblioteca:', error);
    }
  };

  const loadNutritionPlan = async () => {
    try {
      // Primeiro buscar o athlete_id
      const athleteRes = await fetch(`/api/athletes?user_id=${patient.id}&consultancy_id=${consultancyId}`);
      const athletes = await athleteRes.json();
      
      if (athletes.length === 0) {
        setLoading(false);
        return;
      }

      const athlete = athletes[0];
      setAthleteId(athlete.id);
      
      // Buscar planos do atleta
      const plansRes = await fetch(`/api/nutrition-plans?athlete_id=${athlete.id}`);
      const plans = await plansRes.json();
      
      const activePlan = plans.find((p: NutritionPlan) => p.status === 'active') || plans[0];
      
      if (activePlan) {
        // Buscar plano completo
        const completeRes = await fetch(`/api/nutrition-plans/${activePlan.id}/complete`);
        const completeData = await completeRes.json();
        setPlan(completeData);
      }
    } catch (error) {
      console.error('Error loading nutrition plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOptionGroups = (foods: NutritionFood[] | undefined): Record<number, NutritionFood[]> => {
    if (!foods) return {};
    const groups: Record<number, NutritionFood[]> = {};
    foods.forEach(food => {
      const group = food.option_group || 0;
      if (!groups[group]) groups[group] = [];
      groups[group].push(food);
    });
    return groups;
  };

  const handleCreatePlan = async () => {
    if (!athleteId) {
      alert('Erro: Atleta não encontrado');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/nutrition-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athlete_id: athleteId,
          nutritionist_id: adminUser.id,
          name: planForm.name,
          daily_calories: planForm.daily_calories,
          protein_grams: planForm.protein_grams,
          carbs_grams: planForm.carbs_grams,
          fat_grams: planForm.fat_grams,
          status: 'active'
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar plano');
      }

      setShowCreateModal(false);
      loadNutritionPlan();
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      alert('Erro ao criar plano nutricional');
    } finally {
      setCreating(false);
    }
  };

  const handleEditPlan = async () => {
    if (!plan) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/nutrition-plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: planForm.name,
          daily_calories: planForm.daily_calories,
          protein_grams: planForm.protein_grams,
          carbs_grams: planForm.carbs_grams,
          fat_grams: planForm.fat_grams,
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar plano');
      }

      setShowEditModal(false);
      loadNutritionPlan();
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      alert('Erro ao atualizar plano nutricional');
    } finally {
      setSaving(false);
    }
  };

  const openEditPlan = () => {
    if (plan) {
      setPlanForm({
        name: plan.name,
        daily_calories: plan.daily_calories,
        protein_grams: plan.protein_grams,
        carbs_grams: plan.carbs_grams,
        fat_grams: plan.fat_grams,
      });
      setShowEditModal(true);
    }
  };

  const openAddMeal = () => {
    setEditingMealId(null);
    setMealForm({ name: '', time: '08:00', notes: '' });
    setShowMealModal(true);
  };

  const handleSaveMeal = async () => {
    if (!plan || !mealForm.name) return;

    try {
      setSaving(true);
      
      if (editingMealId) {
        // Editar refeição existente
        await fetch(`/api/meals/${editingMealId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: mealForm.name,
            time: mealForm.time,
            notes: mealForm.notes
          })
        });
      } else {
        // Criar nova refeição
        await fetch('/api/meals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan_id: plan.id,
            name: mealForm.name,
            time: mealForm.time,
            notes: mealForm.notes,
            order_index: (plan.meals?.length || 0) + 1
          })
        });
      }

      setShowMealModal(false);
      loadNutritionPlan();
    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
      alert('Erro ao salvar refeição');
    } finally {
      setSaving(false);
    }
  };

  const openEditMeal = (meal: NutritionMeal) => {
    setEditingMealId(meal.id);
    setMealForm({
      name: meal.name,
      time: meal.time || '08:00',
      notes: ''
    });
    setShowMealModal(true);
  };

  const handleDeleteMeal = async (mealId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta refeição?')) return;

    try {
      await fetch(`/api/meals/${mealId}`, { method: 'DELETE' });
      loadNutritionPlan();
    } catch (error) {
      console.error('Erro ao excluir refeição:', error);
      alert('Erro ao excluir refeição');
    }
  };

  const openAddFood = (mealId: number, optionGroup: number = 0) => {
    setEditingMealId(mealId);
    setFoodForm({
      food_id: null,
      name: '',
      quantity: 1,
      unit: 'porção',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      option_group: optionGroup
    });
    setFoodSearch('');
    setShowFoodModal(true);
  };

  const selectFoodFromLibrary = (food: typeof foodLibrary[0]) => {
    setFoodForm({
      ...foodForm,
      food_id: food.id,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      unit: food.serving_size || 'porção'
    });
    setFoodSearch(food.name);
  };

  const handleSaveFood = async () => {
    if (!editingMealId || !foodForm.name) return;

    try {
      setSaving(true);
      await fetch('/api/meal-foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal_id: editingMealId,
          food_id: foodForm.food_id,
          name: foodForm.name,
          quantity: foodForm.quantity,
          unit: foodForm.unit,
          calories: foodForm.calories * foodForm.quantity,
          protein: foodForm.protein * foodForm.quantity,
          carbs: foodForm.carbs * foodForm.quantity,
          fat: foodForm.fat * foodForm.quantity,
          option_group: foodForm.option_group
        })
      });

      setShowFoodModal(false);
      loadNutritionPlan();
    } catch (error) {
      console.error('Erro ao adicionar alimento:', error);
      alert('Erro ao adicionar alimento');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFood = async (foodId: number) => {
    if (!confirm('Remover este alimento da refeição?')) return;

    try {
      await fetch(`/api/meal-foods/${foodId}`, { method: 'DELETE' });
      loadNutritionPlan();
    } catch (error) {
      console.error('Erro ao remover alimento:', error);
    }
  };

  const filteredFoods = foodLibrary.filter(f => 
    f.name.toLowerCase().includes(foodSearch.toLowerCase())
  ).slice(0, 10);

  const subViewOptions = [
    { id: 'plan' as NutritionSubView, label: 'Plano Alimentar', icon: Apple },
    { id: 'anamnesis' as NutritionSubView, label: 'Anamnese', icon: ClipboardList },
    { id: 'anthropometric' as NutritionSubView, label: 'Antropometria', icon: Ruler },
    { id: 'energy' as NutritionSubView, label: 'Cálculo Energético', icon: Calculator },
    { id: 'evolution' as NutritionSubView, label: 'Evolução', icon: BarChart3 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
      </div>
    );
  }

  // Sub-navigation
  const renderSubNav = () => (
    <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-zinc-200">
      {subViewOptions.map(option => {
        const Icon = option.icon;
        const isActive = subView === option.id;
        return (
          <button
            key={option.id}
            onClick={() => setSubView(option.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-lime-500 text-black'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );

  // Renderizar conteúdo baseado na sub-view
  if (subView === 'anamnesis' && athleteId) {
    return (
      <div className="space-y-6">
        {renderSubNav()}
        <NutritionAnamnesis
          athleteId={athleteId}
          nutritionistId={adminUser.id}
          athleteName={patient.name}
          onSave={() => {}}
        />
      </div>
    );
  }

  if (subView === 'anthropometric' && athleteId) {
    return (
      <div className="space-y-6">
        {renderSubNav()}
        <AnthropometricAssessment
          athleteId={athleteId}
          nutritionistId={adminUser.id}
          athleteName={patient.name}
          onSave={() => {}}
        />
      </div>
    );
  }

  if (subView === 'energy' && athleteId) {
    return (
      <div className="space-y-6">
        {renderSubNav()}
        <EnergyCalculator
          athleteId={athleteId}
          nutritionistId={adminUser.id}
          athleteName={patient.name}
          initialWeight={patient.weight}
          initialHeight={patient.height}
          initialAge={new Date().getFullYear() - new Date(patient.birthDate).getFullYear()}
          onSave={() => {}}
        />
      </div>
    );
  }

  if (subView === 'evolution' && athleteId) {
    return (
      <div className="space-y-6">
        {renderSubNav()}
        <NutritionEvolutionDashboard
          athleteId={athleteId}
          athleteName={patient.name}
        />
      </div>
    );
  }

  // Plano alimentar (default)
  return (
    <div className="space-y-6">
      {renderSubNav()}

      {!plan ? (
        <>
          <EmptyState
            icon="nutrition"
            title="Nenhum plano nutricional"
            description="Este paciente ainda não possui um plano nutricional ativo."
            action={{
              label: 'Criar Plano',
              onClick: () => setShowCreateModal(true)
            }}
          />

          {/* Modal de Criação de Plano */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-lg p-0">
                <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                  <h3 className="text-xl font-bold">Novo Plano Nutricional</h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Nome do Plano</label>
                    <input
                      type="text"
                      value={planForm.name}
                      onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Calorias Diárias</label>
                      <input
                        type="number"
                        value={planForm.daily_calories}
                        onChange={(e) => setPlanForm({ ...planForm, daily_calories: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Proteína (g)</label>
                      <input
                        type="number"
                        value={planForm.protein_grams}
                        onChange={(e) => setPlanForm({ ...planForm, protein_grams: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Carboidrato (g)</label>
                      <input
                        type="number"
                        value={planForm.carbs_grams}
                        onChange={(e) => setPlanForm({ ...planForm, carbs_grams: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Gordura (g)</label>
                      <input
                        type="number"
                        value={planForm.fat_grams}
                        onChange={(e) => setPlanForm({ ...planForm, fat_grams: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-lime-50 p-4 rounded-lg">
                    <p className="text-sm text-lime-700">
                      💡 <strong>Dica:</strong> Use o <strong>Cálculo Energético</strong> para determinar os valores ideais de macronutrientes para este paciente.
                    </p>
                  </div>
                </div>

                <div className="p-6 border-t border-zinc-200 flex gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 border border-black font-bold hover:bg-black hover:text-white transition-colors rounded-lg"
                  >
                    CANCELAR
                  </button>
                  <button
                    onClick={handleCreatePlan}
                    disabled={creating || !planForm.name}
                    className="flex-1 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors rounded-lg disabled:opacity-50"
                  >
                    {creating ? 'CRIANDO...' : 'CRIAR PLANO'}
                  </button>
                </div>
              </Card>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="text-sm text-zinc-600">Nutricionista: {plan.nutritionist_name}</p>
            </div>
            <button 
              onClick={openEditPlan}
              className="flex items-center gap-2 px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors text-sm rounded-md"
            >
              <Edit className="w-4 h-4" />
              Editar Plano
            </button>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-lime-50 border-lime-200 text-center p-4">
              <div className="text-2xl font-bold text-lime-700">{plan.daily_calories}</div>
              <div className="text-xs text-lime-600 font-medium uppercase">kcal/dia</div>
            </Card>
            <Card className="bg-zinc-50 text-center p-4">
              <div className="text-2xl font-bold">{plan.protein_grams}g</div>
              <div className="text-xs text-zinc-500 font-medium uppercase">Proteína</div>
            </Card>
            <Card className="bg-zinc-50 text-center p-4">
              <div className="text-2xl font-bold">{plan.carbs_grams}g</div>
              <div className="text-xs text-zinc-500 font-medium uppercase">Carboidrato</div>
            </Card>
            <Card className="bg-zinc-50 text-center p-4">
              <div className="text-2xl font-bold">{plan.fat_grams}g</div>
              <div className="text-xs text-zinc-500 font-medium uppercase">Gordura</div>
            </Card>
          </div>

          {/* Meals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Refeições</h3>
              {plan.meals && plan.meals.length > 0 && (
                <button 
                  onClick={openAddMeal}
                  className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-black font-bold hover:bg-lime-400 text-sm rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Refeição
                </button>
              )}
            </div>
            {plan.meals && plan.meals.length > 0 ? (
              plan.meals.map((meal) => {
                const optionGroups = getOptionGroups(meal.foods);
                const availableOptions = Object.keys(optionGroups).map(Number).sort((a, b) => a - b);
                const hasMainFoods = optionGroups[0]?.length > 0;
                
                return (
                  <Card key={meal.id} className="p-4 hover:border-lime-500 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[60px] bg-lime-100 text-lime-700 p-2 rounded-lg">
                          <div className="text-lg font-bold">{meal.time?.substring(0, 5) || '--:--'}</div>
                        </div>
                        <div className="font-bold text-lg">{meal.name}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditMeal(meal)}
                          className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                          title="Editar refeição"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir refeição"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Alimentos principais */}
                    <div className="ml-[76px] mb-3">
                      {hasMainFoods ? (
                        <div className="space-y-2">
                          {optionGroups[0].map((food) => (
                            <div key={food.id} className="flex items-center justify-between py-1.5 px-3 bg-lime-50 rounded-lg group">
                              <div className="flex-1">
                                <span className="font-medium text-zinc-800">{food.name}</span>
                                <span className="text-zinc-500 ml-2">({food.quantity} {food.unit})</span>
                                <span className="text-xs text-zinc-400 ml-2">
                                  {food.calories}kcal | P:{food.protein}g | C:{food.carbs}g | G:{food.fat}g
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteFood(food.id)}
                                className="p-1 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-400 italic">Nenhum alimento adicionado</p>
                      )}
                      
                      <button
                        onClick={() => openAddFood(meal.id, 0)}
                        className="mt-2 flex items-center gap-1 text-sm text-lime-600 hover:text-lime-700 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar alimento
                      </button>
                    </div>

                    {/* Substituições */}
                    {availableOptions.filter(n => n > 0).map(optNum => {
                      const foods = optionGroups[optNum] || [];
                      return (
                        <div key={optNum} className="ml-[76px] mb-3 pl-3 border-l-2 border-orange-400">
                          <div className="text-xs font-bold mb-2 text-orange-500 flex items-center justify-between">
                            <span>🔄 SUBSTITUIÇÃO {optNum}</span>
                          </div>
                          <div className="space-y-1">
                            {foods.map((food) => (
                              <div key={food.id} className="flex items-center justify-between py-1 px-2 bg-orange-50 rounded group">
                                <span className="text-sm text-zinc-700">
                                  {food.name} ({food.quantity} {food.unit})
                                </span>
                                <button
                                  onClick={() => handleDeleteFood(food.id)}
                                  className="p-1 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => openAddFood(meal.id, optNum)}
                            className="mt-1 text-xs text-orange-500 hover:text-orange-600"
                          >
                            + Adicionar substituto
                          </button>
                        </div>
                      );
                    })}

                    {/* Botão para nova substituição */}
                    <div className="ml-[76px]">
                      <button
                        onClick={() => openAddFood(meal.id, (Math.max(...availableOptions, 0) + 1))}
                        className="text-xs text-zinc-500 hover:text-orange-500 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Adicionar opção de substituição
                      </button>
                    </div>
                  </Card>
                );
              })
            ) : (
              <EmptyState
                icon="nutrition"
                title="Nenhuma refeição"
                description="Este plano ainda não possui refeições cadastradas."
                action={{
                  label: 'Adicionar Primeira Refeição',
                  onClick: openAddMeal
                }}
              />
            )}
          </div>

          {/* Modal de Editar Plano */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-lg p-0">
                <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                  <h3 className="text-xl font-bold">Editar Plano</h3>
                  <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Nome do Plano</label>
                    <input
                      type="text"
                      value={planForm.name}
                      onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Calorias</label>
                      <input
                        type="number"
                        value={planForm.daily_calories}
                        onChange={(e) => setPlanForm({ ...planForm, daily_calories: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Proteína (g)</label>
                      <input
                        type="number"
                        value={planForm.protein_grams}
                        onChange={(e) => setPlanForm({ ...planForm, protein_grams: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Carboidrato (g)</label>
                      <input
                        type="number"
                        value={planForm.carbs_grams}
                        onChange={(e) => setPlanForm({ ...planForm, carbs_grams: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Gordura (g)</label>
                      <input
                        type="number"
                        value={planForm.fat_grams}
                        onChange={(e) => setPlanForm({ ...planForm, fat_grams: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-zinc-200 flex gap-3">
                  <button onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 border border-black font-bold hover:bg-black hover:text-white transition-colors rounded-lg">
                    CANCELAR
                  </button>
                  <button onClick={handleEditPlan} disabled={saving} className="flex-1 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors rounded-lg disabled:opacity-50">
                    {saving ? 'SALVANDO...' : 'SALVAR'}
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* Modal de Adicionar/Editar Refeição */}
          {showMealModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-lg p-0">
                <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                  <h3 className="text-xl font-bold">{editingMealId ? 'Editar Refeição' : 'Nova Refeição'}</h3>
                  <button onClick={() => setShowMealModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {/* Templates de refeição */}
                  {!editingMealId && (
                    <div>
                      <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Atalhos</label>
                      <div className="flex flex-wrap gap-2">
                        {mealTemplates.map(template => (
                          <button
                            key={template.name}
                            onClick={() => setMealForm({ ...mealForm, name: template.name, time: template.time })}
                            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                              mealForm.name === template.name
                                ? 'bg-lime-500 text-black border-lime-500'
                                : 'border-zinc-200 hover:border-lime-500'
                            }`}
                          >
                            {template.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Nome da Refeição</label>
                    <input
                      type="text"
                      value={mealForm.name}
                      onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                      placeholder="Ex: Café da manhã, Almoço..."
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Horário</label>
                    <input
                      type="time"
                      value={mealForm.time}
                      onChange={(e) => setMealForm({ ...mealForm, time: e.target.value })}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-zinc-200 flex gap-3">
                  <button onClick={() => setShowMealModal(false)} className="flex-1 py-2.5 border border-black font-bold hover:bg-black hover:text-white transition-colors rounded-lg">
                    CANCELAR
                  </button>
                  <button onClick={handleSaveMeal} disabled={saving || !mealForm.name} className="flex-1 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors rounded-lg disabled:opacity-50">
                    {saving ? 'SALVANDO...' : editingMealId ? 'SALVAR' : 'ADICIONAR'}
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* Modal de Adicionar Alimento */}
          {showFoodModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-xl p-0 max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                  <h3 className="text-xl font-bold">
                    {foodForm.option_group === 0 ? 'Adicionar Alimento' : `Adicionar Substituto (Opção ${foodForm.option_group})`}
                  </h3>
                  <button onClick={() => setShowFoodModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  {/* Busca na biblioteca */}
                  <div>
                    <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Buscar na Biblioteca</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        value={foodSearch}
                        onChange={(e) => setFoodSearch(e.target.value)}
                        placeholder="Digite para buscar..."
                        className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                      />
                    </div>
                    
                    {/* Resultados da busca */}
                    {foodSearch && filteredFoods.length > 0 && (
                      <div className="mt-2 border border-zinc-200 rounded-lg max-h-48 overflow-y-auto">
                        {filteredFoods.map(food => (
                          <button
                            key={food.id}
                            onClick={() => selectFoodFromLibrary(food)}
                            className={`w-full text-left px-4 py-2 hover:bg-lime-50 border-b border-zinc-100 last:border-b-0 ${
                              foodForm.food_id === food.id ? 'bg-lime-50' : ''
                            }`}
                          >
                            <div className="font-medium">{food.name}</div>
                            <div className="text-xs text-zinc-500">
                              {food.calories}kcal | P:{food.protein}g | C:{food.carbs}g | G:{food.fat}g
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Nome do alimento */}
                  <div>
                    <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Nome do Alimento</label>
                    <input
                      type="text"
                      value={foodForm.name}
                      onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                      placeholder="Ex: Frango grelhado"
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                    />
                  </div>

                  {/* Quantidade e unidade */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Quantidade</label>
                      <input
                        type="number"
                        step="0.5"
                        value={foodForm.quantity}
                        onChange={(e) => setFoodForm({ ...foodForm, quantity: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Unidade</label>
                      <select
                        value={foodForm.unit}
                        onChange={(e) => setFoodForm({ ...foodForm, unit: e.target.value })}
                        className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none"
                      >
                        <option value="porção">porção</option>
                        <option value="g">gramas (g)</option>
                        <option value="ml">mililitros (ml)</option>
                        <option value="unidade">unidade</option>
                        <option value="fatia">fatia</option>
                        <option value="colher de sopa">colher de sopa</option>
                        <option value="colher de chá">colher de chá</option>
                        <option value="xícara">xícara</option>
                        <option value="copo">copo</option>
                      </select>
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-2 text-zinc-500">KCAL</label>
                      <input
                        type="number"
                        value={foodForm.calories}
                        onChange={(e) => setFoodForm({ ...foodForm, calories: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 text-zinc-500">PROT (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={foodForm.protein}
                        onChange={(e) => setFoodForm({ ...foodForm, protein: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 text-zinc-500">CARB (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={foodForm.carbs}
                        onChange={(e) => setFoodForm({ ...foodForm, carbs: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 text-zinc-500">GORD (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={foodForm.fat}
                        onChange={(e) => setFoodForm({ ...foodForm, fat: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:border-lime-500 outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Preview dos valores totais */}
                  {foodForm.quantity > 0 && foodForm.calories > 0 && (
                    <div className="bg-lime-50 p-4 rounded-lg">
                      <p className="text-xs font-bold text-zinc-500 mb-2 uppercase">Total para {foodForm.quantity} {foodForm.unit}(s)</p>
                      <div className="flex gap-4 text-sm">
                        <span><strong>{Math.round(foodForm.calories * foodForm.quantity)}</strong> kcal</span>
                        <span><strong>{(foodForm.protein * foodForm.quantity).toFixed(1)}</strong>g prot</span>
                        <span><strong>{(foodForm.carbs * foodForm.quantity).toFixed(1)}</strong>g carb</span>
                        <span><strong>{(foodForm.fat * foodForm.quantity).toFixed(1)}</strong>g gord</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-zinc-200 flex gap-3">
                  <button onClick={() => setShowFoodModal(false)} className="flex-1 py-2.5 border border-black font-bold hover:bg-black hover:text-white transition-colors rounded-lg">
                    CANCELAR
                  </button>
                  <button onClick={handleSaveFood} disabled={saving || !foodForm.name} className="flex-1 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors rounded-lg disabled:opacity-50">
                    {saving ? 'SALVANDO...' : 'ADICIONAR'}
                  </button>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'image';
  size: string;
  url: string;
  uploadedAt: string;
}

interface MedicalRecord {
  id: string;
  date: string;
  type: 'Consulta' | 'Exame' | 'Avaliação' | 'Lesão';
  title: string;
  doctor: string;
  notes: string;
  diagnosis?: string;
  treatment?: string;
  attachments?: Attachment[];
}

function MedicalTab({ patient }: { patient: Patient }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [records, setRecords] = useState<MedicalRecord[]>([
    { 
      id: '1', 
      date: '2024-01-08', 
      type: 'Consulta', 
      title: 'Avaliação mensal', 
      doctor: 'Dr. Ricardo Santos', 
      notes: 'Paciente apresenta boa evolução. Manter protocolo atual.',
      attachments: [
        { id: 'a1', name: 'avaliacao_janeiro.pdf', type: 'pdf', size: '245 KB', url: '#', uploadedAt: '2024-01-08' }
      ]
    },
    { 
      id: '2', 
      date: '2024-01-02', 
      type: 'Exame', 
      title: 'Hemograma completo', 
      doctor: 'Dr. Ricardo Santos', 
      notes: 'Resultados dentro da normalidade.',
      attachments: [
        { id: 'a2', name: 'hemograma_resultado.pdf', type: 'pdf', size: '128 KB', url: '#', uploadedAt: '2024-01-02' },
        { id: 'a3', name: 'exame_imagem.jpg', type: 'image', size: '1.2 MB', url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400', uploadedAt: '2024-01-02' }
      ]
    },
    { id: '3', date: '2023-12-15', type: 'Consulta', title: 'Check-up inicial', doctor: 'Dr. Ricardo Santos', notes: 'Liberado para atividades físicas intensas.' },
  ]);

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);

  const [recordForm, setRecordForm] = useState({
    date: '',
    type: 'Consulta' as MedicalRecord['type'],
    title: '',
    doctor: '',
    notes: '',
    diagnosis: '',
    treatment: ''
  });

  const openAddRecord = () => {
    setEditingRecord(null);
    setPendingAttachments([]);
    setRecordForm({
      date: new Date().toISOString().split('T')[0],
      type: 'Consulta',
      title: '',
      doctor: '',
      notes: '',
      diagnosis: '',
      treatment: ''
    });
    setShowRecordModal(true);
  };

  const openEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record);
    setPendingAttachments(record.attachments || []);
    setRecordForm({
      date: record.date,
      type: record.type,
      title: record.title,
      doctor: record.doctor,
      notes: record.notes,
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || ''
    });
    setShowRecordModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      
      if (!isImage && !isPdf) {
        alert('Apenas PDF e imagens são permitidos');
        return;
      }

      const newAttachment: Attachment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: isPdf ? 'pdf' : 'image',
        size: formatFileSize(file.size),
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString().split('T')[0]
      };

      setPendingAttachments(prev => [...prev, newAttachment]);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const removeAttachment = (attachmentId: string) => {
    setPendingAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();

    const newRecord: MedicalRecord = {
      id: editingRecord?.id || Date.now().toString(),
      date: recordForm.date,
      type: recordForm.type,
      title: recordForm.title,
      doctor: recordForm.doctor,
      notes: recordForm.notes,
      diagnosis: recordForm.diagnosis,
      treatment: recordForm.treatment,
      attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined
    };

    if (editingRecord) {
      setRecords(prev => prev.map(r => r.id === editingRecord.id ? newRecord : r));
    } else {
      setRecords(prev => [newRecord, ...prev]);
    }

    setShowRecordModal(false);
    setEditingRecord(null);
    setPendingAttachments([]);
  };

  const confirmDelete = (recordId: string) => {
    setDeletingRecordId(recordId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteRecord = () => {
    if (!deletingRecordId) return;
    setRecords(prev => prev.filter(r => r.id !== deletingRecordId));
    setShowDeleteConfirm(false);
    setDeletingRecordId(null);
  };

  const getTypeColor = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'Exame': return 'bg-blue-100 text-blue-700';
      case 'Consulta': return 'bg-lime-100 text-lime-700';
      case 'Avaliação': return 'bg-purple-100 text-purple-700';
      case 'Lesão': return 'bg-red-100 text-red-700';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold">Histórico Médico</h2>
        <button 
          onClick={openAddRecord}
          className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors text-sm rounded-md"
        >
          <Plus className="w-4 h-4" />
          Novo Registro
        </button>
      </div>

      <div className="space-y-4">
        {records.map((record) => (
          <Card key={record.id} className="p-4 hover:border-zinc-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${getTypeColor(record.type)}`}>
                  {record.type.toUpperCase()}
                </span>
                <span className="text-sm text-zinc-500">{new Date(record.date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => openEditRecord(record)}
                  className="p-1.5 text-zinc-400 hover:text-lime-600 hover:bg-lime-50 rounded-md transition-colors"
                  title="Editar registro"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => confirmDelete(record.id)}
                  className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Excluir registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-1">{record.title}</h3>
            <p className="text-sm text-zinc-500 mb-2">{record.doctor}</p>
            <p className="text-sm text-zinc-600">{record.notes}</p>
            {record.diagnosis && (
              <div className="mt-4 pt-4 border-t border-zinc-100">
                <p className="text-xs font-bold text-zinc-500 mb-1 uppercase">Diagnóstico</p>
                <p className="text-sm text-zinc-600">{record.diagnosis}</p>
              </div>
            )}
            {record.treatment && (
              <div className="mt-3">
                <p className="text-xs font-bold text-zinc-500 mb-1 uppercase">Tratamento</p>
                <p className="text-sm text-zinc-600">{record.treatment}</p>
              </div>
            )}
            {record.attachments && record.attachments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-100">
                <p className="text-xs font-bold text-zinc-500 mb-2 uppercase">Anexos ({record.attachments.length})</p>
                <div className="flex flex-wrap gap-2">
                  {record.attachments.map(attachment => (
                    <div 
                      key={attachment.id}
                      className="flex items-center gap-2 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm group hover:border-lime-500 transition-colors"
                    >
                      {attachment.type === 'pdf' ? (
                        <FileText className="w-4 h-4 text-red-500" />
                      ) : (
                        <Image className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="max-w-[120px] truncate">{attachment.name}</span>
                      <span className="text-xs text-zinc-400">{attachment.size}</span>
                      <div className="flex items-center gap-1 ml-1">
                        {attachment.type === 'image' && (
                          <button
                            onClick={() => setShowImagePreview(attachment.url)}
                            className="p-1 hover:bg-lime-100 rounded-md transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-3.5 h-3.5 text-zinc-400 hover:text-lime-600" />
                          </button>
                        )}
                        <a
                          href={attachment.url}
                          download={attachment.name}
                          className="p-1 hover:bg-lime-100 rounded-md transition-colors"
                          title="Baixar"
                        >
                          <Download className="w-3.5 h-3.5 text-zinc-400 hover:text-lime-600" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
        {records.length === 0 && (
          <EmptyState
            icon="files"
            title="Nenhum registro médico"
            description="Este paciente ainda não possui registros médicos cadastrados."
            action={{
              label: "Adicionar Registro",
              onClick: openAddRecord
            }}
          />
        )}
      </div>

      {/* Add/Edit Record Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-0">
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingRecord ? 'Editar Registro Médico' : 'Novo Registro Médico'}
              </h3>
              <button onClick={() => { setShowRecordModal(false); setEditingRecord(null); }} className="text-zinc-400 hover:text-black p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveRecord} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Data</label>
                  <input 
                    type="date" 
                    value={recordForm.date}
                    onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Tipo</label>
                  <select 
                    value={recordForm.type}
                    onChange={(e) => setRecordForm({ ...recordForm, type: e.target.value as MedicalRecord['type'] })}
                    className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm"
                    required
                  >
                    <option value="Consulta">Consulta</option>
                    <option value="Exame">Exame</option>
                    <option value="Avaliação">Avaliação</option>
                    <option value="Lesão">Lesão</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Título</label>
                <input 
                  type="text" 
                  value={recordForm.title}
                  onChange={(e) => setRecordForm({ ...recordForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm" 
                  placeholder="Ex: Avaliação física mensal"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Profissional</label>
                <input 
                  type="text" 
                  value={recordForm.doctor}
                  onChange={(e) => setRecordForm({ ...recordForm, doctor: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm" 
                  placeholder="Dr. Nome Completo"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Observações</label>
                <textarea 
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none h-20 resize-none rounded-md text-sm" 
                  placeholder="Anotações sobre a consulta/exame..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Diagnóstico (opcional)</label>
                <textarea 
                  value={recordForm.diagnosis}
                  onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none h-16 resize-none rounded-md text-sm" 
                  placeholder="Diagnóstico médico..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Tratamento (opcional)</label>
                <textarea 
                  value={recordForm.treatment}
                  onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none h-16 resize-none rounded-md text-sm" 
                  placeholder="Tratamento recomendado..."
                />
              </div>

              {/* Upload de Anexos */}
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Anexos (PDF, Imagens)</label>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,image/*"
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 border border-dashed border-zinc-300 text-zinc-500 hover:border-lime-500 hover:text-lime-600 transition-colors flex items-center justify-center gap-2 rounded-md"
                >
                  <Upload className="w-5 h-5" />
                  Clique para adicionar arquivos
                </button>
                
                {/* Lista de anexos pendentes */}
                {pendingAttachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {pendingAttachments.map(attachment => (
                      <div 
                        key={attachment.id}
                        className="flex items-center justify-between px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          {attachment.type === 'pdf' ? (
                            <FileText className="w-4 h-4 text-red-500" />
                          ) : (
                            <Image className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="text-sm max-w-[200px] truncate">{attachment.name}</span>
                          <span className="text-xs text-zinc-400">{attachment.size}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment.id)}
                          className="p-1 hover:bg-red-100 rounded-md transition-colors"
                        >
                          <X className="w-4 h-4 text-zinc-400 hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setShowRecordModal(false);
                    setEditingRecord(null);
                  }}
                  className="flex-1 py-2.5 border border-black font-bold hover:bg-black hover:text-white transition-colors text-sm rounded-md"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors text-sm rounded-md"
                >
                  {editingRecord ? 'SALVAR' : 'ADICIONAR'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Excluir Registro</h3>
              <p className="text-zinc-600 text-sm">
                Tem certeza que deseja excluir este registro médico? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingRecordId(null);
                }}
                className="flex-1 py-2.5 border border-zinc-300 font-bold hover:border-black transition-colors text-sm rounded-md"
              >
                CANCELAR
              </button>
              <button 
                onClick={handleDeleteRecord}
                className="flex-1 py-2.5 bg-red-500 text-white font-bold hover:bg-red-600 transition-colors text-sm rounded-md"
              >
                EXCLUIR
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImagePreview(null)}
        >
          <button
            onClick={() => setShowImagePreview(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img 
            src={showImagePreview} 
            alt="Preview" 
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

interface RehabSession {
  id: string;
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  injury: string;
  treatment: string;
  exercises: string;
  physio: string;
  progressNotes: string;
  nextSession?: string;
}

function RehabTab({ patient }: { patient: Patient }) {
  const [sessions, setSessions] = useState<RehabSession[]>([
    { 
      id: '1', 
      date: '2024-01-10', 
      status: 'scheduled', 
      injury: 'Tendinite patelar', 
      treatment: 'Exercícios de fortalecimento, crioterapia',
      exercises: 'Extensão de joelho isométrica, Agachamento parcial, Alongamento quadríceps',
      physio: 'Dr. Carlos Mendes',
      progressNotes: 'Paciente apresenta melhora de 40% na dor',
      nextSession: '2024-01-15'
    },
    { 
      id: '2', 
      date: '2024-01-05', 
      status: 'completed', 
      injury: 'Tendinite patelar', 
      treatment: 'Alongamentos, mobilização articular',
      exercises: 'Mobilização patelar, Alongamento de isquiotibiais, Fortalecimento de glúteo',
      physio: 'Dr. Carlos Mendes',
      progressNotes: 'Primeira sessão. Avaliação inicial completa.'
    },
  ]);

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingSession, setEditingSession] = useState<RehabSession | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const [sessionForm, setSessionForm] = useState({
    date: '',
    status: 'scheduled' as RehabSession['status'],
    injury: '',
    treatment: '',
    exercises: '',
    physio: '',
    progressNotes: '',
    nextSession: ''
  });

  const openAddSession = () => {
    setEditingSession(null);
    setSessionForm({
      date: new Date().toISOString().split('T')[0],
      status: 'scheduled',
      injury: '',
      treatment: '',
      exercises: '',
      physio: '',
      progressNotes: '',
      nextSession: ''
    });
    setShowSessionModal(true);
  };

  const openEditSession = (session: RehabSession) => {
    setEditingSession(session);
    setSessionForm({
      date: session.date,
      status: session.status,
      injury: session.injury,
      treatment: session.treatment,
      exercises: session.exercises,
      physio: session.physio,
      progressNotes: session.progressNotes,
      nextSession: session.nextSession || ''
    });
    setShowSessionModal(true);
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();

    const newSession: RehabSession = {
      id: editingSession?.id || Date.now().toString(),
      date: sessionForm.date,
      status: sessionForm.status,
      injury: sessionForm.injury,
      treatment: sessionForm.treatment,
      exercises: sessionForm.exercises,
      physio: sessionForm.physio,
      progressNotes: sessionForm.progressNotes,
      nextSession: sessionForm.nextSession || undefined
    };

    if (editingSession) {
      setSessions(prev => prev.map(s => s.id === editingSession.id ? newSession : s));
    } else {
      setSessions(prev => [newSession, ...prev]);
    }

    setShowSessionModal(false);
    setEditingSession(null);
  };

  const confirmDelete = (sessionId: string) => {
    setDeletingSessionId(sessionId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteSession = () => {
    if (!deletingSessionId) return;
    setSessions(prev => prev.filter(s => s.id !== deletingSessionId));
    setShowDeleteConfirm(false);
    setDeletingSessionId(null);
  };

  const getStatusStyle = (status: RehabSession['status']) => {
    switch (status) {
      case 'completed': return { bg: 'bg-lime-100', text: 'text-lime-700', label: 'CONCLUÍDA' };
      case 'scheduled': return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'AGENDADA' };
      case 'in_progress': return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'EM ANDAMENTO' };
      case 'cancelled': return { bg: 'bg-zinc-100', text: 'text-zinc-600', label: 'CANCELADA' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold">Sessões de Reabilitação</h2>
        <button 
          onClick={openAddSession}
          className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors text-sm rounded-md"
        >
          <Plus className="w-4 h-4" />
          Nova Sessão
        </button>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => {
          const statusStyle = getStatusStyle(session.status);
          return (
            <Card key={session.id} className="p-4 hover:border-zinc-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${statusStyle.bg} ${statusStyle.text}`}>
                    {statusStyle.label}
                  </span>
                  <span className="text-sm text-zinc-500">{new Date(session.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => openEditSession(session)}
                    className="p-1.5 text-zinc-400 hover:text-lime-600 hover:bg-lime-50 rounded-md transition-colors"
                    title="Editar sessão"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => confirmDelete(session.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Excluir sessão"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1">{session.injury}</h3>
              <p className="text-sm text-zinc-500 mb-3">{session.physio}</p>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-zinc-700">Tratamento: </span>
                  <span className="text-zinc-600">{session.treatment}</span>
                </div>
                {session.exercises && (
                  <div>
                    <span className="font-medium text-zinc-700">Exercícios: </span>
                    <span className="text-zinc-600">{session.exercises}</span>
                  </div>
                )}
                {session.progressNotes && (
                  <div className="mt-3 p-3 bg-zinc-50 rounded-md">
                    <span className="font-medium text-zinc-700">Notas: </span>
                    <span className="text-zinc-600">{session.progressNotes}</span>
                  </div>
                )}
                {session.nextSession && (
                  <div className="mt-3 text-lime-600 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Próxima sessão: {new Date(session.nextSession).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
        {sessions.length === 0 && (
          <EmptyState
            icon="calendar"
            title="Nenhuma sessão de reabilitação"
            description="Este paciente ainda não possui sessões de reabilitação cadastradas."
            action={{
              label: "Adicionar Sessão",
              onClick: openAddSession
            }}
          />
        )}
      </div>

      {/* Add/Edit Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-0">
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingSession ? 'Editar Sessão' : 'Nova Sessão de Reabilitação'}
              </h3>
              <button onClick={() => { setShowSessionModal(false); setEditingSession(null); }} className="text-zinc-400 hover:text-black p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSession} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Data</label>
                  <input 
                    type="date" 
                    value={sessionForm.date}
                    onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Status</label>
                  <select 
                    value={sessionForm.status}
                    onChange={(e) => setSessionForm({ ...sessionForm, status: e.target.value as RehabSession['status'] })}
                    className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm"
                    required
                  >
                    <option value="scheduled">Agendada</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="completed">Concluída</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Lesão / Condição</label>
                <input 
                  type="text" 
                  value={sessionForm.injury}
                  onChange={(e) => setSessionForm({ ...sessionForm, injury: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm" 
                  placeholder="Ex: Tendinite patelar, Lesão no ombro..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Fisioterapeuta</label>
                <input 
                  type="text" 
                  value={sessionForm.physio}
                  onChange={(e) => setSessionForm({ ...sessionForm, physio: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm" 
                  placeholder="Dr. Nome Completo"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Tratamento</label>
                <textarea 
                  value={sessionForm.treatment}
                  onChange={(e) => setSessionForm({ ...sessionForm, treatment: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none h-20 resize-none rounded-md text-sm" 
                  placeholder="Descrição do tratamento aplicado..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Exercícios</label>
                <textarea 
                  value={sessionForm.exercises}
                  onChange={(e) => setSessionForm({ ...sessionForm, exercises: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none h-20 resize-none rounded-md text-sm" 
                  placeholder="Lista de exercícios prescritos..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Notas de Progresso</label>
                <textarea 
                  value={sessionForm.progressNotes}
                  onChange={(e) => setSessionForm({ ...sessionForm, progressNotes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none h-16 resize-none rounded-md text-sm" 
                  placeholder="Observações sobre a evolução do paciente..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase">Próxima Sessão (opcional)</label>
                <input 
                  type="date" 
                  value={sessionForm.nextSession}
                  onChange={(e) => setSessionForm({ ...sessionForm, nextSession: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-200 focus:border-lime-500 outline-none rounded-md text-sm" 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setShowSessionModal(false);
                    setEditingSession(null);
                  }}
                  className="flex-1 py-2.5 border border-black font-bold hover:bg-black hover:text-white transition-colors text-sm rounded-md"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors text-sm rounded-md"
                >
                  {editingSession ? 'SALVAR' : 'ADICIONAR'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Excluir Sessão</h3>
              <p className="text-zinc-600 text-sm">
                Tem certeza que deseja excluir esta sessão de reabilitação? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingSessionId(null);
                }}
                className="flex-1 py-2.5 border border-zinc-300 font-bold hover:border-black transition-colors text-sm rounded-md"
              >
                CANCELAR
              </button>
              <button 
                onClick={handleDeleteSession}
                className="flex-1 py-2.5 bg-red-500 text-white font-bold hover:bg-red-600 transition-colors text-sm rounded-md"
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

function ProgressTab({ patient }: { patient: Patient }) {
  const progressData = [
    { date: '2024-01-08', weight: 75.5, bodyFat: 12.5, muscleMass: 65.2 },
    { date: '2024-01-01', weight: 76.0, bodyFat: 13.0, muscleMass: 64.8 },
    { date: '2023-12-15', weight: 77.2, bodyFat: 14.2, muscleMass: 64.0 },
    { date: '2023-12-01', weight: 78.5, bodyFat: 15.0, muscleMass: 63.5 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold">Evolução do Paciente</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors text-sm rounded-md">
          <Plus className="w-4 h-4" />
          Registrar Medição
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center bg-lime-50 border-lime-200">
          <div className="text-xl md:text-2xl font-bold text-lime-600">-3.0kg</div>
          <div className="text-xs text-zinc-600 uppercase font-medium">Peso perdido</div>
        </Card>
        <Card className="text-center bg-lime-50 border-lime-200">
          <div className="text-xl md:text-2xl font-bold text-lime-600">-2.5%</div>
          <div className="text-xs text-zinc-600 uppercase font-medium">Gordura reduzida</div>
        </Card>
        <Card className="text-center bg-lime-50 border-lime-200">
          <div className="text-xl md:text-2xl font-bold text-lime-600">+1.7kg</div>
          <div className="text-xs text-zinc-600 uppercase font-medium">Massa muscular</div>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-xs uppercase text-zinc-500">Data</th>
                <th className="text-left px-4 py-3 font-bold text-xs uppercase text-zinc-500">Peso (kg)</th>
                <th className="text-left px-4 py-3 font-bold text-xs uppercase text-zinc-500">% Gordura</th>
                <th className="text-left px-4 py-3 font-bold text-xs uppercase text-zinc-500">Massa Muscular (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {progressData.map((record, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-sm">{new Date(record.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-sm font-bold">{record.weight}</td>
                  <td className="px-4 py-3 text-sm">{record.bodyFat}%</td>
                  <td className="px-4 py-3 text-sm">{record.muscleMass}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {progressData.length === 0 && (
        <EmptyState
          icon="search"
          title="Nenhum dado de progresso"
          description="Registre medições para acompanhar a evolução do paciente."
        />
      )}
    </div>
  );
}

function AppointmentsTab({ patient }: { patient: Patient }) {
  const appointments = [
    { date: '2024-01-15', time: '14:00', type: 'Avaliação', professional: 'Dr. Ricardo Santos', status: 'scheduled' },
    { date: '2024-01-12', time: '10:00', type: 'Nutrição', professional: 'Dra. Marina Costa', status: 'scheduled' },
    { date: '2024-01-08', time: '08:00', type: 'Treino', professional: 'Lucas Ferreira', status: 'completed' },
  ];

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Avaliação': 'bg-orange-100 text-orange-700',
      'Nutrição': 'bg-green-100 text-green-700',
      'Treino': 'bg-lime-100 text-lime-700',
      'Médico': 'bg-blue-100 text-blue-700',
      'Fisioterapia': 'bg-purple-100 text-purple-700',
    };
    return colors[type] || 'bg-zinc-100 text-zinc-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold">Agendamentos</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors text-sm rounded-md">
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </button>
      </div>

      <div className="space-y-4">
        {appointments.length > 0 ? (
          appointments.map((apt, idx) => (
            <Card key={idx} className="flex items-center gap-4 lg:gap-6 p-4 hover:border-lime-500 transition-colors">
              <div className="text-center min-w-[70px] bg-zinc-100 p-2 rounded-lg">
                <div className="text-xl font-bold">{apt.time}</div>
                <div className="text-xs text-zinc-500">{new Date(apt.date).toLocaleDateString('pt-BR')}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${getTypeColor(apt.type)}`}>
                    {apt.type}
                  </span>
                </div>
                <div className="text-sm text-zinc-600">{apt.professional}</div>
              </div>
              <StatusBadge status={apt.status === 'completed' ? 'confirmed' : 'pending'} />
            </Card>
          ))
        ) : (
          <EmptyState
            icon="calendar"
            title="Nenhum agendamento"
            description="Este paciente não possui agendamentos no momento."
          />
        )}
      </div>
    </div>
  );
}
