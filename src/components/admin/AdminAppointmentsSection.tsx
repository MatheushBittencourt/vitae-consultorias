import { useState, useEffect } from 'react';
import { getAuthHeaders } from '../../services/api';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Dumbbell,
  Apple,
  Stethoscope,
  HeartPulse,
  ClipboardList,
  MapPin,
  Video
} from 'lucide-react';
import { Card, StatCard } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { StatusBadge, Badge } from '../ui/Badge';
import { EmptyState, ListSkeleton, StatSkeleton } from '../ui/EmptyState';

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

// Configuração de tipos de agendamento
const appointmentTypes = {
  training: { label: 'Treino', icon: Dumbbell, color: 'bg-orange-100 text-orange-600', iconBg: 'bg-orange-500' },
  nutrition: { label: 'Nutrição', icon: Apple, color: 'bg-green-100 text-green-600', iconBg: 'bg-green-500' },
  medical: { label: 'Médico', icon: Stethoscope, color: 'bg-blue-100 text-blue-600', iconBg: 'bg-blue-500' },
  physio: { label: 'Fisioterapia', icon: HeartPulse, color: 'bg-pink-100 text-pink-600', iconBg: 'bg-pink-500' },
  evaluation: { label: 'Avaliação', icon: ClipboardList, color: 'bg-purple-100 text-purple-600', iconBg: 'bg-purple-500' },
  other: { label: 'Outro', icon: Calendar, color: 'bg-zinc-100 text-zinc-600', iconBg: 'bg-zinc-500' }
};

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
        fetch(`${API_URL}/appointments?consultancy_id=${consultancyId}`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/athletes?consultancy_id=${consultancyId}`, { headers: getAuthHeaders() })
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

  const getTypeConfig = (type: string) => {
    return appointmentTypes[type as keyof typeof appointmentTypes] || appointmentTypes.other;
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    
    const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays === -1) return 'Ontem';
    
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  const navigateDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const stats = {
    today: filteredAppointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    total: appointments.length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="h-10 w-48 bg-zinc-200 rounded-lg animate-pulse mb-2" />
            <div className="h-5 w-64 bg-zinc-200 rounded animate-pulse" />
          </div>
          <div className="h-12 w-44 bg-zinc-200 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
        <ListSkeleton items={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
            <span className="text-lime-500">Agendamentos</span>
          </h1>
          <p className="text-zinc-500 mt-1">Gerencie consultas e sessões</p>
        </div>
        <button 
          onClick={() => setShowNewAppointment(true)}
          className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-5 py-3 
                     font-semibold rounded-xl hover:bg-lime-500 hover:text-black 
                     transition-all duration-200 shadow-sm hover:shadow-lg
                     transform hover:-translate-y-0.5 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Novo Agendamento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Hoje"
          value={stats.today}
          icon={<Calendar className="w-full h-full" />}
          color="lime"
          size="sm"
        />
        <StatCard
          label="Confirmados"
          value={stats.confirmed}
          icon={<CheckCircle className="w-full h-full" />}
          color="blue"
          size="sm"
        />
        <StatCard
          label="Pendentes"
          value={stats.pending}
          icon={<Clock className="w-full h-full" />}
          color="orange"
          size="sm"
        />
        <StatCard
          label="Total"
          value={stats.total}
          icon={<ClipboardList className="w-full h-full" />}
          color="zinc"
          size="sm"
        />
      </div>

      {/* Date Navigation */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-zinc-600" />
          </div>
          <div>
            <p className="font-bold text-zinc-900 capitalize">{formatDateLabel(selectedDate)}</p>
            <p className="text-sm text-zinc-500">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigateDate(-1)}
            className="p-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white font-medium hover:bg-lime-500 hover:text-black transition-colors"
          >
            Hoje
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 focus:border-lime-500 
                       focus:ring-2 focus:ring-lime-500/20 outline-none transition-all"
          />
          <button 
            onClick={() => navigateDate(1)}
            className="p-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </Card>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <EmptyState
            icon="calendar"
            title="Nenhum agendamento"
            description={`Não há agendamentos para ${formatDateLabel(selectedDate).toLowerCase()}`}
            action={{
              label: 'Novo Agendamento',
              onClick: () => setShowNewAppointment(true)
            }}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((apt) => {
            const typeConfig = getTypeConfig(apt.appointment_type);
            const TypeIcon = typeConfig.icon;
            
            return (
              <Card key={apt.id} hover padding="none" className="overflow-hidden">
                <div className="flex items-center gap-4 p-4 lg:p-5">
                  {/* Time */}
                  <div className="text-center min-w-[70px]">
                    <p className="text-2xl font-bold text-zinc-900">{formatTime(apt.start_time)}</p>
                    {apt.end_time && (
                      <p className="text-xs text-zinc-400">até {formatTime(apt.end_time)}</p>
                    )}
                  </div>
                  
                  {/* Divider */}
                  <div className="w-px h-12 bg-zinc-200" />
                  
                  {/* Type Icon */}
                  <div className={`w-12 h-12 rounded-xl ${typeConfig.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <TypeIcon className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-zinc-900 truncate">{apt.title}</h3>
                      <Badge variant="default" size="sm" className={typeConfig.color}>
                        {typeConfig.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={apt.user_name || 'Paciente'} size="xs" />
                        <span>{apt.user_name || 'Paciente'}</span>
                      </div>
                      {apt.location && (
                        <div className="flex items-center gap-1">
                          {apt.location.toLowerCase().includes('online') ? (
                            <Video className="w-4 h-4" />
                          ) : (
                            <MapPin className="w-4 h-4" />
                          )}
                          <span>{apt.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Professional */}
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-zinc-900">{apt.professional_name || '-'}</p>
                    <p className="text-xs text-zinc-500">Profissional</p>
                  </div>
                  
                  {/* Status */}
                  <StatusBadge 
                    status={apt.status === 'confirmed' ? 'confirmed' : apt.status === 'cancelled' ? 'cancelled' : 'pending'} 
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg" padding="none">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Novo Agendamento</h2>
                <p className="text-zinc-500 text-sm">Preencha os dados</p>
              </div>
              <button 
                onClick={() => setShowNewAppointment(false)} 
                className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Paciente</label>
                <select className="w-full px-4 py-3 rounded-xl border border-zinc-200 
                                   focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none">
                  <option value="">Selecione um paciente</option>
                  {athletes.map(a => (
                    <option key={a.id} value={a.user_id}>{a.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Título</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 
                             focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none" 
                  placeholder="Ex: Consulta de rotina" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Tipo</label>
                <select className="w-full px-4 py-3 rounded-xl border border-zinc-200 
                                   focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none">
                  {Object.entries(appointmentTypes).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Data</label>
                  <input 
                    type="date" 
                    defaultValue={selectedDate}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 
                               focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Horário</label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 
                               focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none" 
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowNewAppointment(false)}
                  className="flex-1 py-3 px-6 border border-zinc-200 rounded-xl font-semibold
                             hover:bg-zinc-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 px-6 bg-lime-500 text-black rounded-xl font-semibold
                             hover:bg-lime-400 transition-colors"
                >
                  Agendar
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
