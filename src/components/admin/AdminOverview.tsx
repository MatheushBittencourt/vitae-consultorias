import { useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, AlertCircle, UserPlus, Loader2 } from 'lucide-react';
import { AdminView, Patient } from './AdminDashboard';

const API_URL = 'http://localhost:3001/api';

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
}

export function AdminOverview({ onNavigate, onSelectPatient, consultancyId }: AdminOverviewProps) {
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<StatsData>({ activePatients: 0, todayAppointments: 0, pendingItems: 0 });
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
        fetch(`${API_URL}/athletes?consultancy_id=${consultancyId}`),
        fetch(`${API_URL}/appointments?consultancy_id=${consultancyId}`)
      ]);
      
      const athletesData = await athletesRes.json();
      const appointmentsData = await appointmentsRes.json();
      
      setAthletes(athletesData);
      setAppointments(appointmentsData);
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayApts = appointmentsData.filter((a: Appointment) => 
        a.start_time && a.start_time.split('T')[0] === today
      );
      
      setStats({
        activePatients: athletesData.length,
        todayAppointments: todayApts.length,
        pendingItems: appointmentsData.filter((a: Appointment) => a.status === 'pending').length
      });
    } catch (error) {
      console.error('Error loading data:', error);
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
  ).slice(0, 3);

  const recentPatients = athletes.slice(0, 3).map(a => ({
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            Bem-vindo ao <span className="text-lime-500">VITAE</span>
          </h1>
          <p className="text-xl text-zinc-600">
            Aqui está o resumo do seu painel hoje.
          </p>
        </div>
        <button 
          onClick={() => onNavigate('patients')}
          className="flex items-center gap-2 bg-lime-500 text-black px-6 py-3 font-bold tracking-wider hover:bg-lime-400 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          NOVO PACIENTE
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 border-l-4 border-lime-500">
          <div className="text-4xl font-bold mb-2">{stats.activePatients}</div>
          <div className="text-sm tracking-wider text-zinc-600">PACIENTES ATIVOS</div>
        </div>
        <div className="bg-white p-6 border-l-4 border-black">
          <div className="text-4xl font-bold mb-2">{stats.todayAppointments}</div>
          <div className="text-sm tracking-wider text-zinc-600">CONSULTAS HOJE</div>
        </div>
        <div className="bg-white p-6 border-l-4 border-black">
          <div className="text-4xl font-bold mb-2">{appointments.length}</div>
          <div className="text-sm tracking-wider text-zinc-600">TOTAL AGENDAMENTOS</div>
        </div>
        <div className="bg-white p-6 border-l-4 border-yellow-500">
          <div className="text-4xl font-bold mb-2">{stats.pendingItems}</div>
          <div className="text-sm tracking-wider text-zinc-600">PENDÊNCIAS</div>
        </div>
      </div>

      {/* Alerts */}
      {stats.pendingItems > 0 && (
        <div className="bg-zinc-900 text-white p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1 text-lime-500" />
          <div>
            <div className="font-bold text-lg mb-1">Atenção Necessária</div>
            <p className="text-white/80 mb-3">
              {stats.pendingItems} agendamento(s) pendente(s) de confirmação.
              Revise a agenda e confirme os horários.
            </p>
            <button 
              onClick={() => onNavigate('appointments')}
              className="text-sm font-bold text-lime-500 underline hover:no-underline"
            >
              Ver Agendamentos →
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Agenda de Hoje</h2>
            </div>
            <button 
              onClick={() => onNavigate('appointments')}
              className="text-sm text-lime-600 font-bold hover:underline"
            >
              Ver Tudo
            </button>
          </div>
          <div className="space-y-4">
            {todayAppointments.length === 0 ? (
              <div className="text-center text-zinc-500 py-8">
                Nenhum agendamento para hoje
              </div>
            ) : (
              todayAppointments.map((apt) => (
                <div key={apt.id} className="flex items-start gap-4 pb-4 border-b border-zinc-200 last:border-0">
                  <div className="text-center min-w-[60px]">
                    <div className="text-2xl font-bold">{formatTime(apt.start_time)}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold mb-1">{apt.user_name || 'Paciente'}</div>
                    <div className="text-sm text-zinc-600">{apt.title}</div>
                    <div className="mt-2">
                      <span className={`inline-block px-3 py-1 text-xs font-bold ${
                        apt.status === 'confirmed' ? 'bg-lime-500 text-black' : 'bg-zinc-200 text-black'
                      }`}>
                        {apt.status === 'confirmed' ? 'CONFIRMADO' : 'PENDENTE'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Pacientes Recentes</h2>
            </div>
            <button 
              onClick={() => onNavigate('patients')}
              className="text-sm text-lime-600 font-bold hover:underline"
            >
              Ver Todos
            </button>
          </div>
          <div className="space-y-4">
            {recentPatients.length === 0 ? (
              <div className="text-center text-zinc-500 py-8">
                Nenhum paciente cadastrado
              </div>
            ) : (
              recentPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => onSelectPatient(patient)}
                  className="w-full flex items-center gap-4 p-4 border border-zinc-200 hover:border-lime-500 transition-colors text-left"
                >
                  <div className="w-12 h-12 bg-lime-500 rounded-full flex items-center justify-center text-black font-bold text-lg overflow-hidden">
                    {patient.avatarUrl ? (
                      <img src={patient.avatarUrl} alt={patient.name} className="w-full h-full object-cover" />
                    ) : (
                      patient.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{patient.name}</div>
                    <div className="text-sm text-zinc-600">{patient.sport}{patient.club && ` • ${patient.club}`}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold px-2 py-1 rounded bg-lime-500/20 text-lime-700">
                      ATIVO
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">{patient.adherence}% aderência</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button 
          onClick={() => onNavigate('patients')}
          className="bg-white p-6 text-left hover:border-l-4 hover:border-lime-500 transition-all"
        >
          <Users className="w-8 h-8 mb-3 text-lime-500" />
          <div className="font-bold text-lg mb-2">Gerenciar Pacientes</div>
          <div className="text-sm text-zinc-600">
            Lista completa e cadastros
          </div>
        </button>

        <button 
          onClick={() => onNavigate('training')}
          className="bg-white p-6 text-left hover:border-l-4 hover:border-lime-500 transition-all"
        >
          <TrendingUp className="w-8 h-8 mb-3 text-lime-500" />
          <div className="font-bold text-lg mb-2">Planos de Treino</div>
          <div className="text-sm text-zinc-600">
            Criar e editar treinos
          </div>
        </button>

        <button 
          onClick={() => onNavigate('appointments')}
          className="bg-white p-6 text-left hover:border-l-4 hover:border-lime-500 transition-all"
        >
          <Calendar className="w-8 h-8 mb-3 text-lime-500" />
          <div className="font-bold text-lg mb-2">Agendamentos</div>
          <div className="text-sm text-zinc-600">
            Consultas e sessões
          </div>
        </button>

      </div>
    </div>
  );
}
