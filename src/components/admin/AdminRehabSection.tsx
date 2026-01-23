import { useState, useEffect } from 'react';
import { getAuthHeaders } from '../../services/api';
import { Plus, Search, Edit, Eye, Loader2, Activity, HeartPulse, Calendar, CheckCircle } from 'lucide-react';
import { Patient } from './AdminDashboard';
import { Card, StatCard } from '../ui/Card';
import { Badge, StatusBadge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

const API_URL = '/api';

interface AdminRehabSectionProps {
  onSelectPatient: (patient: Patient) => void;
  consultancyId?: number;
}

interface RehabSession {
  id: number;
  athlete_id: number;
  physio_id: number;
  injury_description: string;
  treatment_type: string;
  progress_notes: string;
  pain_level: number;
  mobility_score: number;
  session_date: string;
  next_session_date: string;
  status: string;
  physio_name: string;
}

interface AthleteData {
  id: number;
  user_id: number;
  name: string;
  email: string;
  sport: string;
}

export function AdminRehabSection({ onSelectPatient, consultancyId }: AdminRehabSectionProps) {
  const [sessions, setSessions] = useState<RehabSession[]>([]);
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewSession, setShowNewSession] = useState(false);

  useEffect(() => {
    loadData();
  }, [consultancyId]);

  const loadData = async () => {
    if (!consultancyId) {
      setLoading(false);
      return;
    }
    try {
      const [sessionsRes, athletesRes] = await Promise.all([
        fetch(`${API_URL}/rehab-sessions?consultancy_id=${consultancyId}`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/athletes?consultancy_id=${consultancyId}`, { headers: getAuthHeaders() })
      ]);
      
      // Verificar se as respostas foram bem-sucedidas
      if (!sessionsRes.ok || !athletesRes.ok) {
        console.error('API error:', sessionsRes.status, athletesRes.status);
        setSessions([]);
        setAthletes([]);
        return;
      }
      
      const sessionsData = await sessionsRes.json();
      const athletesData = await athletesRes.json();
      
      // Garantir que são arrays
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setAthletes(Array.isArray(athletesData) ? athletesData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setSessions([]);
      setAthletes([]);
    } finally {
      setLoading(false);
    }
  };

  const getAthleteName = (athleteId: number) => {
    const athlete = athletes.find(a => a.id === athleteId);
    return athlete?.name || 'Desconhecido';
  };

  const filteredSessions = sessions.filter(session => 
    getAthleteName(session.athlete_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.injury_description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusLabels: Record<string, { label: string; color: string }> = {
    in_progress: { label: 'EM ANDAMENTO', color: 'bg-yellow-100 text-yellow-700' },
    completed: { label: 'CONCLUÍDO', color: 'bg-lime-100 text-lime-700' },
    scheduled: { label: 'AGENDADO', color: 'bg-blue-100 text-blue-700' },
    cancelled: { label: 'CANCELADO', color: 'bg-red-100 text-red-700' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">REABILITAÇÃO</span>
          </h1>
          <p className="text-xl text-zinc-600">
            Sessões e protocolos de reabilitação
          </p>
        </div>
        <button 
          onClick={() => setShowNewSession(true)}
          className="flex items-center gap-2 bg-lime-500 text-black px-6 py-3 font-bold tracking-wider hover:bg-lime-400 transition-colors"
        >
          <Plus className="w-5 h-5" />
          NOVA SESSÃO
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar por paciente ou lesão..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-zinc-200 focus:border-lime-500 outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Em Tratamento"
          value={sessions.filter(s => s.status === 'in_progress').length}
          icon={<HeartPulse className="w-5 h-5" />}
          color="lime"
        />
        <StatCard
          label="Agendadas"
          value={sessions.filter(s => s.status === 'scheduled').length}
          icon={<Calendar className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Concluídas"
          value={sessions.filter(s => s.status === 'completed').length}
          icon={<CheckCircle className="w-5 h-5" />}
          color="zinc"
        />
        <StatCard
          label="Total Sessões"
          value={sessions.length}
          icon={<Activity className="w-5 h-5" />}
          color="purple"
        />
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="grid grid-cols-7 gap-4 px-6 py-4 bg-zinc-900 text-white font-bold text-sm tracking-wider rounded-t-2xl">
          <div className="col-span-2">PACIENTE / LESÃO</div>
          <div>TRATAMENTO</div>
          <div>DOR</div>
          <div>DATA</div>
          <div>STATUS</div>
          <div className="text-right">AÇÕES</div>
        </div>
        <div className="divide-y divide-zinc-200">
          {filteredSessions.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="Nenhuma sessão de reabilitação"
              description="Adicione a primeira sessão de reabilitação para seus pacientes."
              action={{
                label: "Nova Sessão",
                onClick: () => setShowNewSession(true)
              }}
            />
          ) : (
            filteredSessions.map((session) => (
              <div key={session.id} className="grid grid-cols-7 gap-4 px-6 py-4 items-center hover:bg-zinc-50 transition-colors">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">{getAthleteName(session.athlete_id)}</div>
                    <div className="text-sm text-zinc-500">{session.injury_description || 'Sem descrição'}</div>
                  </div>
                </div>
                <div className="text-sm">{session.treatment_type || '-'}</div>
                <div>
                  {session.pain_level !== null && session.pain_level !== undefined ? (
                    <div className="flex items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        session.pain_level <= 3 ? 'bg-green-100 text-green-700' :
                        session.pain_level <= 6 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {session.pain_level}
                      </div>
                      <span className="text-xs text-zinc-500">/10</span>
                    </div>
                  ) : '-'}
                </div>
                <div className="text-sm">
                  {session.session_date ? new Date(session.session_date).toLocaleDateString('pt-BR') : '-'}
                </div>
                <div>
                  <Badge className={statusLabels[session.status]?.color || 'bg-zinc-100 text-zinc-700'}>
                    {statusLabels[session.status]?.label || session.status?.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => {
                      const athlete = athletes.find(a => a.id === session.athlete_id);
                      if (athlete) {
                        onSelectPatient({
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
                        });
                      }
                    }}
                    className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button 
                    className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                    title="Editar sessão"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {showNewSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-8">
            <h3 className="text-2xl font-bold mb-6">Nova Sessão de Reabilitação</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">PACIENTE</label>
                <select className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none">
                  <option value="">Selecione um paciente</option>
                  {athletes.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">LESÃO/CONDIÇÃO</label>
                <input type="text" className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" placeholder="Ex: Tendinite patelar" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">TRATAMENTO</label>
                <select className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none">
                  <option value="">Selecione o tipo</option>
                  <option value="physiotherapy">Fisioterapia</option>
                  <option value="exercise_therapy">Cinesioterapia</option>
                  <option value="manual_therapy">Terapia Manual</option>
                  <option value="electrotherapy">Eletroterapia</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">DATA</label>
                  <input type="date" className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">HORÁRIO</label>
                  <input type="time" className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowNewSession(false)}
                  className="flex-1 py-3 border-2 border-black font-bold hover:bg-black hover:text-white transition-colors"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors"
                >
                  AGENDAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
