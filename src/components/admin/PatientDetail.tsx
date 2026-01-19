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
          {activeTab === 'training' && <TrainingTab patient={patient} consultancyId={consultancyId} />}
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


function TrainingTab({ patient, consultancyId }: { patient: Patient; consultancyId?: number }) {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [exercisesByDay, setExercisesByDay] = useState<Record<number, TrainingExercise[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadPlans();
  }, [patient.id, consultancyId]);

  const loadPlans = async () => {
    try {
      const athleteRes = await fetch(`${API_URL}/athletes?user_id=${patient.id}&consultancy_id=${consultancyId}`);
      const athletes = await athleteRes.json();
      const athlete = athletes[0];
      
      if (athlete) {
        const response = await fetch(`${API_URL}/training-plans?athlete_id=${athlete.id}`);
        const data = await response.json();
        setPlans(data);
        
        if (data.length > 0) {
          setSelectedPlanId(data[0].id);
          await loadPlanDetails(data[0].id);
        }
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

  const currentPlan = plans.find(p => p.id === selectedPlanId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <EmptyState
        icon="training"
        title="Nenhum plano de treino"
        description="Este paciente ainda não possui um plano de treino ativo. Para criar um plano, acesse Treinamento no menu lateral."
      />
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
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 p-4 flex items-center gap-3 rounded-lg">
        <div className="text-blue-500 text-xl">ℹ️</div>
        <div>
          <p className="text-sm text-blue-700">
            Esta é uma visualização do plano de treino. Para editar, acesse <strong>Treinamento</strong> no menu lateral.
          </p>
        </div>
      </div>

      {/* Days List */}
      {trainingDays.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="Nenhum dia de treino configurado"
          description="Configure os dias de treino na área de Treinamento."
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
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                </div>

                {isExpanded && dayExercises.length > 0 && (
                  <div className="border-t border-zinc-200 divide-y divide-zinc-100">
                    {dayExercises.map((ex, idx) => (
                      <div key={ex.id} className="flex items-start gap-4 p-4">
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
                      </div>
                    ))}
                  </div>
                )}

                {isExpanded && dayExercises.length === 0 && (
                  <div className="border-t border-zinc-200 p-4 text-center text-zinc-400 text-sm">
                    Nenhum exercício configurado para este dia
                  </div>
                )}
              </Card>
            );
          })}
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

function NutritionTab({ patient, consultancyId, adminUser }: { patient: Patient; consultancyId?: number; adminUser: AdminUser }) {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [athleteId, setAthleteId] = useState<number | null>(null);
  const [subView, setSubView] = useState<NutritionSubView>('plan');

  useEffect(() => {
    loadNutritionPlan();
  }, [patient.id, consultancyId]);

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
        <EmptyState
          icon="nutrition"
          title="Nenhum plano nutricional"
          description="Este paciente ainda não possui um plano nutricional ativo."
          action={{
            label: 'Criar Plano',
            onClick: () => {}
          }}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="text-sm text-zinc-600">Nutricionista: {plan.nutritionist_name}</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors text-sm rounded-md">
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
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-lime-600 hover:bg-lime-50 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
            {plan.meals && plan.meals.length > 0 ? (
              plan.meals.map((meal) => {
                const optionGroups = getOptionGroups(meal.foods);
                const availableOptions = Object.keys(optionGroups).map(Number).sort((a, b) => a - b);
                
                return (
                  <Card key={meal.id} className="p-4 hover:border-lime-500 transition-colors">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="text-center min-w-[60px] bg-zinc-100 p-2 rounded-lg">
                        <div className="text-lg font-bold">{meal.time?.substring(0, 5) || '--:--'}</div>
                      </div>
                      <div className="font-bold text-lg">{meal.name}</div>
                    </div>
                    
                    {availableOptions.map(optNum => {
                      const foods = optionGroups[optNum] || [];
                      if (foods.length === 0) return null;
                      
                      return (
                        <div key={optNum} className={`ml-[76px] mb-3 pl-3 border-l-2 ${optNum === 0 ? 'border-lime-500' : 'border-orange-400'}`}>
                          <div className={`text-xs font-bold mb-1 ${optNum === 0 ? 'text-lime-600' : 'text-orange-500'}`}>
                            {optNum === 0 ? '🍽️ PRINCIPAL' : `🔄 SUBSTITUIÇÃO ${optNum}`}
                          </div>
                          <div className="text-sm text-zinc-600">
                            {foods.map((food, idx) => (
                              <span key={food.id}>
                                {food.name} ({food.quantity} {food.unit})
                                {idx < foods.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </Card>
                );
              })
            ) : (
              <EmptyState
                icon="nutrition"
                title="Nenhuma refeição"
                description="Este plano ainda não possui refeições cadastradas."
              />
            )}
          </div>
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
