import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, User, CheckCircle, XCircle, Loader2, X } from 'lucide-react';

const API_URL = '/api';

interface Appointment {
  id: number;
  user_id: number;
  professional_id: number;
  title: string;
  description: string;
  appointment_type: string;
  start_time: string;
  end_time: string;
  location: string;
  status: string;
  notes: string;
  user_name: string;
  professional_name: string;
}

interface AthleteData {
  id: number;
  user_id: number;
  name: string;
}

interface AdminAppointmentsSectionProps {
  consultancyId?: number;
}

export function AdminAppointmentsSection({ consultancyId }: AdminAppointmentsSectionProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, [consultancyId]);

  const loadData = async () => {
    if (!consultancyId) {
      setLoading(false);
      return;
    }
    try {
      const [aptsRes, athletesRes] = await Promise.all([
        fetch(`${API_URL}/appointments?consultancy_id=${consultancyId}`),
        fetch(`${API_URL}/athletes?consultancy_id=${consultancyId}`)
      ]);
      const aptsData = await aptsRes.json();
      const athletesData = await athletesRes.json();
      setAppointments(aptsData);
      setAthletes(athletesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (!apt.start_time) return false;
    const aptDate = apt.start_time.split('T')[0];
    return aptDate === selectedDate;
  });

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      training: 'Treino',
      nutrition: 'Nutrição',
      medical: 'Médico',
      physio: 'Fisioterapia',
      evaluation: 'Avaliação',
      other: 'Outro'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      training: 'bg-lime-100 text-lime-700',
      nutrition: 'bg-green-100 text-green-700',
      medical: 'bg-blue-100 text-blue-700',
      physio: 'bg-purple-100 text-purple-700',
      evaluation: 'bg-orange-100 text-orange-700',
      other: 'bg-zinc-100 text-zinc-700'
    };
    return colors[type] || 'bg-zinc-100 text-zinc-700';
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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
            <span className="text-lime-500">AGENDAMENTOS</span>
          </h1>
          <p className="text-xl text-zinc-600">
            Gerencie consultas e sessões
          </p>
        </div>
        <button 
          onClick={() => setShowNewAppointment(true)}
          className="flex items-center gap-2 bg-lime-500 text-black px-6 py-3 font-bold tracking-wider hover:bg-lime-400 transition-colors"
        >
          <Plus className="w-5 h-5" />
          NOVO AGENDAMENTO
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 border-l-4 border-lime-500">
          <div className="text-2xl font-bold">{filteredAppointments.length}</div>
          <div className="text-sm text-zinc-600">Hoje</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-500">
          <div className="text-2xl font-bold">{appointments.filter(a => a.status === 'confirmed').length}</div>
          <div className="text-sm text-zinc-600">Confirmados</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-yellow-500">
          <div className="text-2xl font-bold">{appointments.filter(a => a.status === 'pending').length}</div>
          <div className="text-sm text-zinc-600">Pendentes</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-black">
          <div className="text-2xl font-bold">{appointments.length}</div>
          <div className="text-sm text-zinc-600">Total</div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-4">
        <Calendar className="w-5 h-5 text-zinc-500" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-3 bg-white border-2 border-zinc-200 focus:border-lime-500 outline-none"
        />
        <div className="ml-auto flex gap-2">
          <button 
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="px-4 py-2 bg-white border-2 border-zinc-200 hover:border-black transition-colors"
          >
            ← Anterior
          </button>
          <button 
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-4 py-2 bg-black text-white hover:bg-zinc-800 transition-colors"
          >
            Hoje
          </button>
          <button 
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="px-4 py-2 bg-white border-2 border-zinc-200 hover:border-black transition-colors"
          >
            Próximo →
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white">
        <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-zinc-900 text-white font-bold text-sm tracking-wider">
          <div>HORÁRIO</div>
          <div className="col-span-2">PACIENTE / TÍTULO</div>
          <div>TIPO</div>
          <div>PROFISSIONAL</div>
          <div className="text-right">STATUS</div>
        </div>
        <div className="divide-y divide-zinc-200">
          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center text-zinc-500">
              Nenhum agendamento para esta data
            </div>
          ) : (
            filteredAppointments.map((apt) => (
              <div key={apt.id} className="grid grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span className="font-bold">{formatTime(apt.start_time)}</span>
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-lime-500 rounded-full flex items-center justify-center text-black font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">{apt.user_name || 'Paciente'}</div>
                    <div className="text-sm text-zinc-500">{apt.title}</div>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 text-xs font-bold ${getTypeColor(apt.appointment_type)}`}>
                    {getTypeLabel(apt.appointment_type)}
                  </span>
                </div>
                <div className="text-sm text-zinc-600">{apt.professional_name || '-'}</div>
                <div className="text-right">
                  {apt.status === 'confirmed' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-lime-100 text-lime-700 text-xs font-bold">
                      <CheckCircle className="w-3 h-3" /> CONFIRMADO
                    </span>
                  ) : apt.status === 'cancelled' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold">
                      <XCircle className="w-3 h-3" /> CANCELADO
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold">
                      PENDENTE
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Novo Agendamento</h3>
              <button onClick={() => setShowNewAppointment(false)} className="text-zinc-400 hover:text-black">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">PACIENTE</label>
                <select className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none">
                  <option value="">Selecione um paciente</option>
                  {athletes.map(a => (
                    <option key={a.id} value={a.user_id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">TÍTULO</label>
                <input type="text" className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" placeholder="Ex: Consulta de rotina" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">TIPO</label>
                <select className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none">
                  <option value="training">Treino</option>
                  <option value="nutrition">Nutrição</option>
                  <option value="medical">Médico</option>
                  <option value="physio">Fisioterapia</option>
                  <option value="evaluation">Avaliação</option>
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
                  onClick={() => setShowNewAppointment(false)}
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
