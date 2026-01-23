import { useState, useEffect } from 'react';
import { getAuthHeaders, removeAuthToken } from '../../services/api';
import { 
  Plus, Search, Edit, Eye, Loader2, Activity, HeartPulse, Calendar, 
  CheckCircle, Users, ClipboardList, TrendingUp, FileText, X, 
  ChevronRight, AlertCircle, Clock, Target, Stethoscope, Dumbbell
} from 'lucide-react';
import { Patient } from './AdminDashboard';
import { Card, StatCard } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

const API_URL = '/api';

interface AdminRehabSectionProps {
  onSelectPatient: (patient: Patient) => void;
  consultancyId?: number;
}

interface PhysioStats {
  active_plans: number;
  patients_in_treatment: number;
  sessions_this_week: number;
  completed_this_month: number;
}

interface TreatmentPlan {
  id: number;
  athlete_id: number;
  physio_id: number;
  name: string;
  condition_treated: string;
  start_date: string;
  estimated_end_date: string;
  frequency: string;
  total_sessions: number;
  completed_sessions: number;
  status: string;
  physio_name: string;
  patient_name: string;
  patient_email: string;
}

interface AthleteData {
  id: number;
  user_id: number;
  name: string;
  email: string;
  sport: string;
}

interface PhysioSession {
  id: number;
  athlete_id: number;
  session_date: string;
  pain_before: number;
  pain_after: number;
  status: string;
  progress_notes: string;
}

export function AdminRehabSection({ onSelectPatient, consultancyId }: AdminRehabSectionProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'protocols' | 'sessions'>('overview');
  const [stats, setStats] = useState<PhysioStats>({ active_plans: 0, patients_in_treatment: 0, sessions_this_week: 0, completed_this_month: 0 });
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modais
  const [showNewProtocol, setShowNewProtocol] = useState(false);
  const [showNewSession, setShowNewSession] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null);
  
  // Formulário de novo protocolo
  const [protocolForm, setProtocolForm] = useState({
    athlete_id: '',
    name: '',
    condition_treated: '',
    start_date: new Date().toISOString().split('T')[0],
    estimated_end_date: '',
    frequency: '2x semana',
    total_sessions: 10,
    precautions: ''
  });
  
  // Formulário de nova sessão
  const [sessionForm, setSessionForm] = useState({
    athlete_id: '',
    treatment_plan_id: '',
    session_date: new Date().toISOString().slice(0, 16),
    duration_minutes: 50,
    pain_before: 5,
    pain_after: 3,
    techniques_applied: '',
    progress_notes: '',
    next_session: ''
  });

  useEffect(() => {
    loadData();
  }, [consultancyId]);

  const loadData = async () => {
    if (!consultancyId) {
      setLoading(false);
      return;
    }
    try {
      const [statsRes, plansRes, athletesRes] = await Promise.all([
        fetch(`${API_URL}/physio/stats?consultancy_id=${consultancyId}`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/physio/treatment-plans?consultancy_id=${consultancyId}`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/athletes?consultancy_id=${consultancyId}`, { headers: getAuthHeaders() })
      ]);
      
      if (!statsRes.ok || !plansRes.ok || !athletesRes.ok) {
        if (statsRes.status === 401 || plansRes.status === 401 || athletesRes.status === 401) {
          removeAuthToken();
          localStorage.removeItem('vitae_admin_session');
          window.location.reload();
          return;
        }
      }
      
      const statsData = await statsRes.json();
      const plansData = await plansRes.json();
      const athletesData = await athletesRes.json();
      
      setStats(statsData);
      setTreatmentPlans(Array.isArray(plansData) ? plansData : []);
      setAthletes(Array.isArray(athletesData) ? athletesData : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProtocol = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/physio/treatment-plans`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...protocolForm,
          athlete_id: parseInt(protocolForm.athlete_id),
          total_sessions: parseInt(String(protocolForm.total_sessions))
        })
      });
      
      if (response.ok) {
        setShowNewProtocol(false);
        setProtocolForm({
          athlete_id: '',
          name: '',
          condition_treated: '',
          start_date: new Date().toISOString().split('T')[0],
          estimated_end_date: '',
          frequency: '2x semana',
          total_sessions: 10,
          precautions: ''
        });
        loadData();
      }
    } catch (error) {
      console.error('Error creating protocol:', error);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/physio/sessions`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sessionForm,
          athlete_id: parseInt(sessionForm.athlete_id),
          treatment_plan_id: sessionForm.treatment_plan_id ? parseInt(sessionForm.treatment_plan_id) : null,
          status: 'scheduled'
        })
      });
      
      if (response.ok) {
        setShowNewSession(false);
        setSessionForm({
          athlete_id: '',
          treatment_plan_id: '',
          session_date: new Date().toISOString().slice(0, 16),
          duration_minutes: 50,
          pain_before: 5,
          pain_after: 3,
          techniques_applied: '',
          progress_notes: '',
          next_session: ''
        });
        loadData();
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      active: { label: 'Em Tratamento', color: 'bg-lime-100 text-lime-700', icon: <Activity className="w-3 h-3" /> },
      completed: { label: 'Concluído', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle className="w-3 h-3" /> },
      paused: { label: 'Pausado', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: <X className="w-3 h-3" /> }
    };
    return statusMap[status] || statusMap['active'];
  };

  const filteredPlans = treatmentPlans.filter(plan =>
    plan.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.condition_treated?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePlans = treatmentPlans.filter(p => p.status === 'active');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">FISIOTERAPIA</span>
          </h1>
          <p className="text-lg text-zinc-600">
            Avaliações, protocolos e acompanhamento de pacientes
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowNewSession(true)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-lime-500 text-lime-600 font-bold hover:bg-lime-50 transition-colors rounded-lg"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Sessão</span>
          </button>
          <button 
            onClick={() => setShowNewProtocol(true)}
            className="flex items-center gap-2 bg-lime-500 text-black px-4 py-2 font-bold hover:bg-lime-400 transition-colors rounded-lg"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Protocolo</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pacientes em Tratamento"
          value={stats.patients_in_treatment}
          icon={<Users className="w-5 h-5" />}
          color="lime"
        />
        <StatCard
          label="Protocolos Ativos"
          value={stats.active_plans}
          icon={<ClipboardList className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Sessões Esta Semana"
          value={stats.sessions_this_week}
          icon={<Calendar className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="Concluídos Este Mês"
          value={stats.completed_this_month}
          icon={<CheckCircle className="w-5 h-5" />}
          color="zinc"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Visão Geral', icon: Activity },
          { id: 'protocols', label: 'Protocolos', icon: ClipboardList },
          { id: 'patients', label: 'Pacientes', icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-lime-500 text-lime-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar por paciente, condição ou protocolo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-zinc-200 focus:border-lime-500 outline-none transition-colors rounded-xl"
        />
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Protocolos Ativos */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Protocolos em Andamento</h2>
                <button 
                  onClick={() => setActiveTab('protocols')}
                  className="text-sm text-lime-600 hover:text-lime-700 font-medium flex items-center gap-1"
                >
                  Ver todos <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              {activePlans.length === 0 ? (
                <EmptyState
                  icon="calendar"
                  title="Nenhum protocolo ativo"
                  description="Crie um novo protocolo de tratamento para seus pacientes."
                  action={{
                    label: "Novo Protocolo",
                    onClick: () => setShowNewProtocol(true)
                  }}
                />
              ) : (
                <div className="space-y-4">
                  {activePlans.slice(0, 5).map(plan => {
                    const progress = plan.total_sessions > 0 
                      ? Math.round((plan.completed_sessions / plan.total_sessions) * 100) 
                      : 0;
                    
                    return (
                      <div 
                        key={plan.id}
                        className="p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold truncate">{plan.patient_name}</h3>
                              <Badge className={getStatusInfo(plan.status).color}>
                                {getStatusInfo(plan.status).label}
                              </Badge>
                            </div>
                            <p className="text-sm text-zinc-600 truncate">{plan.condition_treated || plan.name}</p>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-bold text-lime-600">{plan.completed_sessions}/{plan.total_sessions}</div>
                            <div className="text-zinc-500">sessões</div>
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-lime-500 h-full rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                          <span>{plan.frequency}</span>
                          <span>Início: {new Date(plan.start_date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Quick Actions & Info */}
          <div className="space-y-6">
            {/* Ações Rápidas */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Ações Rápidas</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowNewProtocol(true)}
                  className="w-full flex items-center gap-3 p-3 bg-lime-50 hover:bg-lime-100 rounded-lg transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-lime-500 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Novo Protocolo</div>
                    <div className="text-xs text-zinc-500">Criar plano de tratamento</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setShowNewSession(true)}
                  className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Agendar Sessão</div>
                    <div className="text-xs text-zinc-500">Marcar atendimento</div>
                  </div>
                </button>
                
                <button 
                  className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Nova Avaliação</div>
                    <div className="text-xs text-zinc-500">Avaliar paciente</div>
                  </div>
                </button>
              </div>
            </Card>

            {/* Dicas */}
            <Card className="p-6 bg-gradient-to-br from-lime-50 to-lime-100 border-lime-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-lime-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1">Dica do Sistema</h3>
                  <p className="text-xs text-zinc-600">
                    Registre a escala de dor (EVA) antes e depois de cada sessão para acompanhar a evolução do paciente ao longo do tratamento.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'protocols' && (
        <Card padding="none" className="overflow-hidden">
          {/* Header da tabela - responsivo */}
          <div className="hidden lg:grid grid-cols-7 gap-4 px-6 py-4 bg-zinc-900 text-white font-bold text-sm tracking-wider">
            <div className="col-span-2">PACIENTE / CONDIÇÃO</div>
            <div>PROTOCOLO</div>
            <div>PROGRESSO</div>
            <div>FREQUÊNCIA</div>
            <div>STATUS</div>
            <div className="text-right">AÇÕES</div>
          </div>
          
          <div className="divide-y divide-zinc-200">
            {filteredPlans.length === 0 ? (
              <EmptyState
                icon="calendar"
                title="Nenhum protocolo encontrado"
                description="Crie o primeiro protocolo de tratamento para seus pacientes."
                action={{
                  label: "Novo Protocolo",
                  onClick: () => setShowNewProtocol(true)
                }}
              />
            ) : (
              filteredPlans.map((plan) => {
                const progress = plan.total_sessions > 0 
                  ? Math.round((plan.completed_sessions / plan.total_sessions) * 100) 
                  : 0;
                const statusInfo = getStatusInfo(plan.status);
                
                return (
                  <div key={plan.id} className="p-4 lg:p-0">
                    {/* Mobile Layout */}
                    <div className="lg:hidden space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center text-white">
                            <HeartPulse className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold">{plan.patient_name}</div>
                            <div className="text-sm text-zinc-500">{plan.condition_treated || 'Sem descrição'}</div>
                          </div>
                        </div>
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="bg-zinc-50 p-2 rounded-lg">
                          <div className="text-zinc-500 text-xs">Protocolo</div>
                          <div className="font-medium truncate">{plan.name}</div>
                        </div>
                        <div className="bg-zinc-50 p-2 rounded-lg">
                          <div className="text-zinc-500 text-xs">Progresso</div>
                          <div className="font-medium">{plan.completed_sessions}/{plan.total_sessions}</div>
                        </div>
                        <div className="bg-zinc-50 p-2 rounded-lg">
                          <div className="text-zinc-500 text-xs">Frequência</div>
                          <div className="font-medium">{plan.frequency}</div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-lime-500 h-full rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedPlan(plan)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" /> Ver Detalhes
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-lime-100 hover:bg-lime-200 text-lime-700 rounded-lg text-sm font-medium">
                          <Edit className="w-4 h-4" /> Editar
                        </button>
                      </div>
                    </div>
                    
                    {/* Desktop Layout */}
                    <div className="hidden lg:grid grid-cols-7 gap-4 px-6 py-4 items-center hover:bg-zinc-50 transition-colors">
                      <div className="col-span-2 flex items-center gap-3">
                        <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center text-white">
                          <HeartPulse className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold">{plan.patient_name}</div>
                          <div className="text-sm text-zinc-500">{plan.condition_treated || 'Sem descrição'}</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">{plan.name}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold">{plan.completed_sessions}/{plan.total_sessions}</span>
                          <span className="text-xs text-zinc-500">({progress}%)</span>
                        </div>
                        <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-lime-500 h-full rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <div className="text-sm">{plan.frequency}</div>
                      <div>
                        <Badge className={statusInfo.color}>
                          <span className="flex items-center gap-1">
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </Badge>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedPlan(plan)}
                          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                          title="Editar protocolo"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {activeTab === 'patients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {athletes.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon="users"
                title="Nenhum paciente cadastrado"
                description="Os pacientes aparecerão aqui após serem cadastrados no sistema."
              />
            </div>
          ) : (
            athletes.map(athlete => {
              const patientPlans = treatmentPlans.filter(p => p.athlete_id === athlete.id);
              const activePlan = patientPlans.find(p => p.status === 'active');
              
              return (
                <Card 
                  key={athlete.id}
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onSelectPatient({
                    id: athlete.user_id,
                    name: athlete.name,
                    email: athlete.email,
                    phone: '',
                    sport: athlete.sport || '',
                    position: '',
                    club: '',
                    birthDate: '',
                    height: 0,
                    weight: 0,
                    goals: '',
                    status: 'active',
                    daysInProgram: 0,
                    adherence: 0
                  })}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-lime-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold text-lime-600">
                        {athlete.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{athlete.name}</h3>
                      <p className="text-sm text-zinc-500 truncate">{athlete.email}</p>
                    </div>
                  </div>
                  
                  {activePlan ? (
                    <div className="bg-lime-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-lime-600" />
                        <span className="text-sm font-medium text-lime-700">Em Tratamento</span>
                      </div>
                      <p className="text-xs text-zinc-600 truncate">{activePlan.condition_treated || activePlan.name}</p>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-zinc-500">{activePlan.completed_sessions}/{activePlan.total_sessions} sessões</span>
                        <span className="font-medium text-lime-600">{activePlan.frequency}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-zinc-50 p-3 rounded-lg">
                      <p className="text-sm text-zinc-500">Nenhum protocolo ativo</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setProtocolForm(prev => ({ ...prev, athlete_id: String(athlete.id) }));
                          setShowNewProtocol(true);
                        }}
                        className="text-xs text-lime-600 hover:text-lime-700 font-medium mt-1"
                      >
                        + Criar protocolo
                      </button>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Modal Novo Protocolo */}
      {showNewProtocol && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-xl font-bold">Novo Protocolo de Tratamento</h3>
              <button onClick={() => setShowNewProtocol(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProtocol} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">PACIENTE *</label>
                <select 
                  value={protocolForm.athlete_id}
                  onChange={(e) => setProtocolForm(prev => ({ ...prev, athlete_id: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none rounded-lg"
                  required
                >
                  <option value="">Selecione um paciente</option>
                  {athletes.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">NOME DO PROTOCOLO *</label>
                <input 
                  type="text"
                  value={protocolForm.name}
                  onChange={(e) => setProtocolForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none rounded-lg"
                  placeholder="Ex: Reabilitação de Joelho - Fase 1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">CONDIÇÃO TRATADA</label>
                <input 
                  type="text"
                  value={protocolForm.condition_treated}
                  onChange={(e) => setProtocolForm(prev => ({ ...prev, condition_treated: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none rounded-lg"
                  placeholder="Ex: Condromalácia Patelar Grau II"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">DATA INÍCIO</label>
                  <input 
                    type="date"
                    value={protocolForm.start_date}
                    onChange={(e) => setProtocolForm(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">PREVISÃO TÉRMINO</label>
                  <input 
                    type="date"
                    value={protocolForm.estimated_end_date}
                    onChange={(e) => setProtocolForm(prev => ({ ...prev, estimated_end_date: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none rounded-lg"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">FREQUÊNCIA</label>
                  <select
                    value={protocolForm.frequency}
                    onChange={(e) => setProtocolForm(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none rounded-lg"
                  >
                    <option value="1x semana">1x semana</option>
                    <option value="2x semana">2x semana</option>
                    <option value="3x semana">3x semana</option>
                    <option value="4x semana">4x semana</option>
                    <option value="5x semana">5x semana</option>
                    <option value="Diário">Diário</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">TOTAL SESSÕES</label>
                  <input 
                    type="number"
                    value={protocolForm.total_sessions}
                    onChange={(e) => setProtocolForm(prev => ({ ...prev, total_sessions: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none rounded-lg"
                    min="1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">PRECAUÇÕES / OBSERVAÇÕES</label>
                <textarea 
                  value={protocolForm.precautions}
                  onChange={(e) => setProtocolForm(prev => ({ ...prev, precautions: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none rounded-lg resize-none"
                  rows={3}
                  placeholder="Contraindicações, cuidados especiais..."
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowNewProtocol(false)}
                  className="flex-1 py-3 border-2 border-zinc-300 font-bold hover:bg-zinc-50 transition-colors rounded-lg"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors rounded-lg"
                >
                  CRIAR PROTOCOLO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova Sessão */}
      {showNewSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-xl font-bold">Agendar Sessão de Fisioterapia</h3>
              <button onClick={() => setShowNewSession(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateSession} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">PACIENTE *</label>
                <select 
                  value={sessionForm.athlete_id}
                  onChange={(e) => {
                    setSessionForm(prev => ({ ...prev, athlete_id: e.target.value, treatment_plan_id: '' }));
                  }}
                  className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none rounded-lg"
                  required
                >
                  <option value="">Selecione um paciente</option>
                  {athletes.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              
              {sessionForm.athlete_id && (
                <div>
                  <label className="block text-sm font-bold mb-2">PROTOCOLO (Opcional)</label>
                  <select 
                    value={sessionForm.treatment_plan_id}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, treatment_plan_id: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none rounded-lg"
                  >
                    <option value="">Sem protocolo vinculado</option>
                    {treatmentPlans
                      .filter(p => p.athlete_id === parseInt(sessionForm.athlete_id) && p.status === 'active')
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))
                    }
                  </select>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">DATA E HORA *</label>
                  <input 
                    type="datetime-local"
                    value={sessionForm.session_date}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, session_date: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">DURAÇÃO (min)</label>
                  <input 
                    type="number"
                    value={sessionForm.duration_minutes}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none rounded-lg"
                    min="15"
                    step="5"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">TÉCNICAS A APLICAR</label>
                <textarea 
                  value={sessionForm.techniques_applied}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, techniques_applied: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none rounded-lg resize-none"
                  rows={2}
                  placeholder="Ex: Mobilização articular, alongamentos, fortalecimento..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">OBSERVAÇÕES</label>
                <textarea 
                  value={sessionForm.progress_notes}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, progress_notes: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none rounded-lg resize-none"
                  rows={2}
                  placeholder="Anotações sobre a sessão..."
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowNewSession(false)}
                  className="flex-1 py-3 border-2 border-zinc-300 font-bold hover:bg-zinc-50 transition-colors rounded-lg"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors rounded-lg"
                >
                  AGENDAR SESSÃO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Protocolo */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{selectedPlan.name}</h3>
                <p className="text-sm text-zinc-500">{selectedPlan.patient_name}</p>
              </div>
              <button onClick={() => setSelectedPlan(null)} className="p-2 hover:bg-zinc-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status e Progresso */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-zinc-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-lime-600">{selectedPlan.completed_sessions}</div>
                  <div className="text-xs text-zinc-500">Sessões Concluídas</div>
                </div>
                <div className="bg-zinc-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{selectedPlan.total_sessions}</div>
                  <div className="text-xs text-zinc-500">Total Planejado</div>
                </div>
                <div className="bg-zinc-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedPlan.frequency}</div>
                  <div className="text-xs text-zinc-500">Frequência</div>
                </div>
                <div className="bg-zinc-50 p-4 rounded-xl text-center">
                  <Badge className={getStatusInfo(selectedPlan.status).color}>
                    {getStatusInfo(selectedPlan.status).label}
                  </Badge>
                </div>
              </div>
              
              {/* Informações */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">Condição Tratada</h4>
                  <p className="text-zinc-600 bg-zinc-50 p-3 rounded-lg">
                    {selectedPlan.condition_treated || 'Não especificada'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold mb-2">Data Início</h4>
                    <p className="text-zinc-600 bg-zinc-50 p-3 rounded-lg">
                      {new Date(selectedPlan.start_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Previsão Término</h4>
                    <p className="text-zinc-600 bg-zinc-50 p-3 rounded-lg">
                      {selectedPlan.estimated_end_date 
                        ? new Date(selectedPlan.estimated_end_date).toLocaleDateString('pt-BR')
                        : 'Não definida'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Ações */}
              <div className="flex gap-3 pt-4 border-t border-zinc-200">
                <button 
                  onClick={() => {
                    setSessionForm(prev => ({ 
                      ...prev, 
                      athlete_id: String(selectedPlan.athlete_id),
                      treatment_plan_id: String(selectedPlan.id)
                    }));
                    setSelectedPlan(null);
                    setShowNewSession(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors rounded-lg"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar Sessão
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-zinc-300 font-bold hover:bg-zinc-50 transition-colors rounded-lg">
                  <Edit className="w-4 h-4" />
                  Editar Protocolo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
