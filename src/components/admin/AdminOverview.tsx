import { useState, useEffect } from 'react';
import { getAuthHeaders, removeAuthToken } from '../../services/api';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  UserPlus, 
  Clock,
  ChevronRight,
  Dumbbell,
  Apple,
  Stethoscope,
  HeartPulse,
  ArrowUpRight,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { AdminView, Patient } from './AdminDashboard';
import { Card, StatCard } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { StatusBadge, Badge } from '../ui/Badge';
import { EmptyState, CardSkeleton, StatSkeleton } from '../ui/EmptyState';

const API_URL = '/api';

interface AdminOverviewProps {
  onNavigate: (view: AdminView) => void;
  onSelectPatient: (patient: Patient) => void;
  consultancyId?: number;
}

interface AthleteData {
  id: number;
  user_id: number;
  name: string;
  email: string;
  sport: string;
  club: string;
  avatar_url: string;
}

interface Appointment {
  id: number;
  title: string;
  start_time: string;
  user_name: string;
  status: string;
}

interface StatsData {
  activePatients: number;
  todayAppointments: number;
  pendingItems: number;
  weeklyGrowth: number;
}

// Retorna saudação baseada no horário
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

// Retorna ícone e cor para tipo de appointment
function getAppointmentStyle(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes('treino') || lower.includes('training')) {
    return { icon: Dumbbell, color: 'bg-orange-100 text-orange-600' };
  }
  if (lower.includes('nutri') || lower.includes('dieta')) {
    return { icon: Apple, color: 'bg-green-100 text-green-600' };
  }
  if (lower.includes('médic') || lower.includes('consul')) {
    return { icon: Stethoscope, color: 'bg-blue-100 text-blue-600' };
  }
  if (lower.includes('fisio') || lower.includes('reab')) {
    return { icon: HeartPulse, color: 'bg-pink-100 text-pink-600' };
  }
  return { icon: Calendar, color: 'bg-zinc-100 text-zinc-600' };
}

export function AdminOverview({ onNavigate, onSelectPatient, consultancyId }: AdminOverviewProps) {
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<StatsData>({ 
    activePatients: 0, 
    todayAppointments: 0, 
    pendingItems: 0,
    weeklyGrowth: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [consultancyId]);

  const loadData = async () => {
    if (!consultancyId) {
      setLoading(false);
      return;
    }
    try {
      const [athletesRes, appointmentsRes] = await Promise.all([
        fetch(`${API_URL}/athletes?consultancy_id=${consultancyId}`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/appointments?consultancy_id=${consultancyId}`, { headers: getAuthHeaders() })
      ]);
      
      // Verificar se as respostas foram bem-sucedidas
      if (!athletesRes.ok || !appointmentsRes.ok) {
        console.error('API error:', athletesRes.status, appointmentsRes.status);
        
        // Se 401, fazer logout automático
        if (athletesRes.status === 401 || appointmentsRes.status === 401) {
          removeAuthToken();
          localStorage.removeItem('vitae_admin_session');
          localStorage.removeItem('vitae_patient_session');
          localStorage.removeItem('vitae_superadmin_session');
          window.location.reload();
          return;
        }
        
        setAthletes([]);
        setAppointments([]);
        setStats({ activePatients: 0, todayAppointments: 0, pendingItems: 0, weeklyGrowth: 0 });
        return;
      }
      
      const athletesData = await athletesRes.json();
      const appointmentsData = await appointmentsRes.json();
      
      // Garantir que são arrays
      const safeAthletes = Array.isArray(athletesData) ? athletesData : [];
      const safeAppointments = Array.isArray(appointmentsData) ? appointmentsData : [];
      
      setAthletes(safeAthletes);
      setAppointments(safeAppointments);
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayApts = safeAppointments.filter((a: Appointment) => 
        a.start_time && a.start_time.split('T')[0] === today
      );
      
      setStats({
        activePatients: safeAthletes.length,
        todayAppointments: todayApts.length,
        pendingItems: safeAppointments.filter((a: Appointment) => a.status === 'pending').length,
        weeklyGrowth: Math.floor(Math.random() * 15) + 5 // TODO: calcular real
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setAthletes([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => 
    a.start_time && a.start_time.split('T')[0] === today
  ).slice(0, 4);

  const recentPatients = athletes.slice(0, 5).map(a => ({
    id: a.user_id,
    name: a.name,
    email: a.email,
    phone: '',
    sport: a.sport || 'Não definido',
    position: '',
    club: a.club || '',
    birthDate: '',
    height: 0,
    weight: 0,
    goals: '',
    status: 'active' as const,
    daysInProgram: Math.floor(Math.random() * 100) + 30,
    adherence: Math.floor(Math.random() * 20) + 80,
    avatarUrl: a.avatar_url
  }));

  // Quick actions
  const quickActions = [
    { id: 'patients', label: 'Pacientes', icon: Users, desc: 'Gerenciar lista', color: 'lime' },
    { id: 'training', label: 'Treinos', icon: Dumbbell, desc: 'Criar protocolos', color: 'orange' },
    { id: 'nutrition', label: 'Nutrição', icon: Apple, desc: 'Planos alimentares', color: 'green' },
    { id: 'appointments', label: 'Agenda', icon: Calendar, desc: 'Ver compromissos', color: 'blue' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-start justify-between">
          <div>
            <div className="h-10 w-64 bg-zinc-200 rounded-lg animate-pulse mb-2" />
            <div className="h-5 w-48 bg-zinc-200 rounded animate-pulse" />
          </div>
          <div className="h-12 w-40 bg-zinc-200 rounded-xl animate-pulse" />
        </div>
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
        
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton lines={5} />
          <CardSkeleton lines={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-zinc-500 mb-1">{getGreeting()}</p>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Painel <span className="text-lime-500">VITAE</span>
          </h1>
        </div>
        <button 
          onClick={() => onNavigate('patients')}
          className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-5 py-3 
                     font-semibold rounded-xl hover:bg-lime-500 hover:text-black 
                     transition-all duration-200 shadow-sm hover:shadow-lg
                     transform hover:-translate-y-0.5"
        >
          <UserPlus className="w-5 h-5" />
          Novo Paciente
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pacientes"
          value={stats.activePatients}
          icon={<Users className="w-full h-full" />}
          color="lime"
          trend={stats.weeklyGrowth > 0 ? { value: stats.weeklyGrowth, positive: true } : undefined}
        />
        <StatCard
          label="Consultas Hoje"
          value={stats.todayAppointments}
          icon={<Calendar className="w-full h-full" />}
          color="blue"
        />
        <StatCard
          label="Agendamentos"
          value={appointments.length}
          icon={<Clock className="w-full h-full" />}
          color="purple"
        />
        <StatCard
          label="Pendências"
          value={stats.pendingItems}
          icon={<AlertCircle className="w-full h-full" />}
          color={stats.pendingItems > 0 ? 'orange' : 'zinc'}
        />
      </div>

      {/* Alert Banner */}
      {stats.pendingItems > 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-zinc-900 mb-1">Atenção Necessária</h3>
              <p className="text-zinc-600 text-sm mb-3">
                {stats.pendingItems} agendamento(s) pendente(s) de confirmação. Revise a agenda.
              </p>
              <button 
                onClick={() => onNavigate('appointments')}
                className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-800"
              >
                Ver Agendamentos
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-zinc-900">Agenda de Hoje</h2>
                <p className="text-sm text-zinc-500">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('appointments')}
              className="text-sm font-semibold text-lime-600 hover:text-lime-700 flex items-center gap-1"
            >
              Ver tudo
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="Agenda livre"
              description="Nenhum compromisso agendado para hoje"
            />
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt, idx) => {
                const style = getAppointmentStyle(apt.title);
                const Icon = style.icon;
                return (
                  <div 
                    key={apt.id}
                    className={`
                      flex items-center gap-4 p-3 rounded-xl
                      ${idx === 0 ? 'bg-zinc-50' : 'hover:bg-zinc-50'}
                      transition-colors cursor-pointer
                    `}
                    onClick={() => onNavigate('appointments')}
                  >
                    <div className={`w-10 h-10 rounded-xl ${style.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 truncate">{apt.user_name || 'Paciente'}</span>
                        <StatusBadge 
                          status={apt.status === 'confirmed' ? 'confirmed' : 'pending'} 
                          size="sm" 
                        />
                      </div>
                      <p className="text-sm text-zinc-500 truncate">{apt.title}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-zinc-900">{formatTime(apt.start_time)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent Patients */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-lime-600" />
              </div>
              <div>
                <h2 className="font-bold text-zinc-900">Pacientes Recentes</h2>
                <p className="text-sm text-zinc-500">{stats.activePatients} cadastrados</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('patients')}
              className="text-sm font-semibold text-lime-600 hover:text-lime-700 flex items-center gap-1"
            >
              Ver todos
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {recentPatients.length === 0 ? (
            <EmptyState
              icon="users"
              title="Nenhum paciente"
              description="Comece cadastrando seu primeiro paciente"
              action={{
                label: 'Novo Paciente',
                onClick: () => onNavigate('patients')
              }}
            />
          ) : (
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => onSelectPatient(patient)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors text-left"
                >
                  <Avatar 
                    name={patient.name} 
                    src={patient.avatarUrl} 
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 truncate">{patient.name}</p>
                    <p className="text-sm text-zinc-500 truncate">
                      {patient.sport}{patient.club && ` • ${patient.club}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge variant="lime" size="sm">{patient.adherence}%</Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-bold text-zinc-900 mb-4">Acesso Rápido</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card 
                key={action.id}
                hover
                onClick={() => onNavigate(action.id as AdminView)}
                className="group"
              >
                <div className={`
                  w-12 h-12 rounded-xl mb-4
                  flex items-center justify-center
                  transition-colors duration-200
                  ${action.color === 'lime' ? 'bg-lime-100 text-lime-600 group-hover:bg-lime-500 group-hover:text-black' : ''}
                  ${action.color === 'orange' ? 'bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white' : ''}
                  ${action.color === 'green' ? 'bg-green-100 text-green-600 group-hover:bg-green-500 group-hover:text-white' : ''}
                  ${action.color === 'blue' ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white' : ''}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-zinc-900 mb-1">{action.label}</h4>
                <p className="text-sm text-zinc-500">{action.desc}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
