import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Apple,
  Stethoscope,
  HeartPulse,
  Bell,
  ExternalLink
} from 'lucide-react';
import { Card, StatCard } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge, StatusBadge } from '../ui/Badge';
import { EmptyState, CardSkeleton } from '../ui/EmptyState';

interface AppointmentsSectionProps {
  userId?: number;
}

interface Appointment {
  id: number;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  type: 'training' | 'nutrition' | 'medical' | 'physio';
  professional: { name: string; specialty: string };
  location: 'online' | 'presencial';
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
}

// Configuração de tipos
const typeConfig = {
  training: { label: 'Treino', icon: Dumbbell, color: 'text-orange-600', bg: 'bg-orange-100', iconBg: 'bg-orange-500' },
  nutrition: { label: 'Nutrição', icon: Apple, color: 'text-green-600', bg: 'bg-green-100', iconBg: 'bg-green-500' },
  medical: { label: 'Médico', icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-100', iconBg: 'bg-blue-500' },
  physio: { label: 'Fisioterapia', icon: HeartPulse, color: 'text-pink-600', bg: 'bg-pink-100', iconBg: 'bg-pink-500' },
};

// Mock data - em produção viria da API
const mockAppointments: Appointment[] = [
  {
    id: 1,
    title: 'Check-in Nutricional',
    date: '2026-01-19',
    time: '12:30',
    endTime: '12:50',
    type: 'nutrition',
    professional: { name: 'Dra. Marina Costa', specialty: 'Nutrição' },
    location: 'online',
    status: 'confirmed',
  },
  {
    id: 2,
    title: 'Consulta Médica',
    date: '2026-01-20',
    time: '14:30',
    endTime: '15:30',
    type: 'medical',
    professional: { name: 'Dr. Ricardo Santos', specialty: 'Medicina' },
    location: 'presencial',
    status: 'confirmed',
    notes: 'Trazer exames de TSH e T4 Livre',
  },
  {
    id: 3,
    title: 'Fisioterapia',
    date: '2026-01-22',
    time: '19:00',
    endTime: '19:45',
    type: 'physio',
    professional: { name: 'Dr. Carlos Mendes', specialty: 'Reabilitação' },
    location: 'presencial',
    status: 'confirmed',
  },
  {
    id: 4,
    title: 'Treino Personalizado',
    date: '2026-01-24',
    time: '07:00',
    endTime: '08:00',
    type: 'training',
    professional: { name: 'Lucas Ferreira', specialty: 'Treinamento' },
    location: 'presencial',
    status: 'pending',
  },
];

export function AppointmentsSection({ userId }: AppointmentsSectionProps) {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setAppointments(mockAppointments);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [userId]);

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

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const isSoon = (dateStr: string, time: string) => {
    const now = new Date();
    const aptDate = new Date(`${dateStr}T${time}`);
    const diffHours = (aptDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 2;
  };

  // Stats
  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    thisMonth: appointments.filter(a => {
      const aptMonth = new Date(a.date).getMonth();
      return aptMonth === selectedMonth.getMonth();
    }).length,
    attendance: 92, // TODO: calcular real
  };

  // Agrupar por data
  const groupedAppointments = appointments.reduce((acc, apt) => {
    if (!acc[apt.date]) acc[apt.date] = [];
    acc[apt.date].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  // Ordenar datas
  const sortedDates = Object.keys(groupedAppointments).sort();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-10 w-48 bg-zinc-200 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-64 bg-zinc-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-zinc-50 border-0">
              <div className="h-4 w-20 bg-zinc-200 rounded animate-pulse mb-2" />
              <div className="h-8 w-12 bg-zinc-200 rounded animate-pulse" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CardSkeleton lines={6} />
          </div>
          <CardSkeleton lines={4} />
        </div>
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
          <p className="text-zinc-500 mt-1">Suas consultas e sessões</p>
        </div>
        <button 
          className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-5 py-3 
                     font-semibold rounded-xl hover:bg-lime-500 hover:text-black 
                     transition-all duration-200 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Solicitar Horário
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-lime-50 border-0">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Este Mês</p>
          <p className="text-2xl font-bold text-zinc-900">{stats.thisMonth}</p>
        </Card>
        <Card className="bg-blue-50 border-0">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Confirmados</p>
          <p className="text-2xl font-bold text-zinc-900">{stats.confirmed}</p>
        </Card>
        <Card className="bg-purple-50 border-0">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
        </Card>
        <Card className="bg-green-50 border-0">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Presença</p>
          <p className="text-2xl font-bold text-green-600">{stats.attendance}%</p>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-zinc-900">Próximos Agendamentos</h2>
          
          {sortedDates.length === 0 ? (
            <Card>
              <EmptyState
                icon="calendar"
                title="Nenhum agendamento"
                description="Você não tem consultas agendadas. Solicite um horário com seu profissional."
              />
            </Card>
          ) : (
            sortedDates.map(date => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`
                    px-3 py-1.5 rounded-lg text-sm font-semibold
                    ${isToday(date) ? 'bg-lime-500 text-black' : 'bg-zinc-100 text-zinc-700'}
                  `}>
                    {formatDateLabel(date)}
                  </div>
                  <div className="flex-1 h-px bg-zinc-200" />
                </div>
                
                {/* Appointments for this date */}
                <div className="space-y-3">
                  {groupedAppointments[date].map(apt => {
                    const config = typeConfig[apt.type];
                    const TypeIcon = config.icon;
                    const soon = isSoon(apt.date, apt.time);
                    
                    return (
                      <Card 
                        key={apt.id} 
                        hover 
                        className={`
                          ${isToday(apt.date) && apt.status === 'confirmed' ? 'border-lime-300 bg-lime-50/50' : ''}
                          ${soon ? 'ring-2 ring-lime-500 ring-offset-2' : ''}
                        `}
                      >
                        {/* Soon Badge */}
                        {soon && (
                          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-lime-200">
                            <Bell className="w-4 h-4 text-lime-600 animate-pulse" />
                            <span className="text-sm font-semibold text-lime-700">Em breve!</span>
                          </div>
                        )}
                        
                        <div className="flex items-start gap-4">
                          {/* Type Icon */}
                          <div className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <TypeIcon className="w-6 h-6 text-white" />
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-zinc-900">{apt.title}</h3>
                              <StatusBadge status={apt.status} size="sm" />
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 mb-2">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{apt.time}{apt.endTime && ` - ${apt.endTime}`}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {apt.location === 'online' ? (
                                  <Video className="w-4 h-4" />
                                ) : (
                                  <MapPin className="w-4 h-4" />
                                )}
                                <span className="capitalize">{apt.location}</span>
                              </div>
                            </div>
                            
                            {/* Professional */}
                            <div className="flex items-center gap-2">
                              <Avatar name={apt.professional.name} size="sm" />
                              <div>
                                <p className="text-sm font-medium text-zinc-900">{apt.professional.name}</p>
                                <p className="text-xs text-zinc-500">{apt.professional.specialty}</p>
                              </div>
                            </div>
                            
                            {/* Notes */}
                            {apt.notes && (
                              <div className="mt-3 p-3 bg-amber-50 border-l-2 border-amber-400 rounded-r-lg">
                                <p className="text-sm text-amber-800">
                                  <strong>Lembrete:</strong> {apt.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        {apt.status === 'confirmed' && apt.location === 'online' && isToday(apt.date) && (
                          <div className="mt-4 pt-4 border-t border-zinc-100 flex gap-3">
                            <button className="flex-1 py-2.5 bg-zinc-900 text-white rounded-xl font-semibold
                                               hover:bg-lime-500 hover:text-black transition-colors
                                               flex items-center justify-center gap-2">
                              <Video className="w-4 h-4" />
                              Entrar na Chamada
                            </button>
                            <button className="px-4 py-2.5 border border-zinc-200 rounded-xl font-semibold
                                               hover:bg-zinc-50 transition-colors">
                              Remarcar
                            </button>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Month Summary */}
          <Card className="bg-zinc-900 text-white border-0">
            <h3 className="font-bold mb-4">Resumo do Mês</h3>
            <div className="space-y-4">
              <div className="pb-4 border-b border-white/10">
                <p className="text-3xl font-bold">{stats.thisMonth}</p>
                <p className="text-sm text-white/60">Total de consultas</p>
              </div>
              <div className="pb-4 border-b border-white/10">
                <p className="text-3xl font-bold">{stats.confirmed}</p>
                <p className="text-sm text-white/60">Confirmadas</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-lime-400">{stats.attendance}%</p>
                <p className="text-sm text-white/60">Taxa de presença</p>
              </div>
            </div>
          </Card>

          {/* Distribution by Type */}
          <Card>
            <h3 className="font-bold text-zinc-900 mb-4">Por Área</h3>
            <div className="space-y-3">
              {Object.entries(typeConfig).map(([key, config]) => {
                const count = appointments.filter(a => a.type === key).length;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                const TypeIcon = config.icon;
                
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded ${config.bg} flex items-center justify-center`}>
                          <TypeIcon className={`w-3.5 h-3.5 ${config.color}`} />
                        </div>
                        <span className="text-sm text-zinc-600">{config.label}</span>
                      </div>
                      <span className="text-sm font-bold">{count}</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${config.iconBg}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Tip Card */}
          <Card className="bg-lime-500 text-black border-0">
            <h3 className="font-bold mb-2">💡 Dica</h3>
            <p className="text-sm">
              Agende suas consultas com antecedência para garantir os melhores horários. 
              Recomendamos agendar com pelo menos 1 semana de antecedência.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
