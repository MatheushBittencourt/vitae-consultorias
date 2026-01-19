import { useState, useEffect } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  Dumbbell, 
  Apple, 
  Stethoscope, 
  HeartPulse,
  ChevronRight,
  Flame,
  Target,
  Award,
  Clock
} from 'lucide-react';
import { DashboardView } from './Dashboard';
import { ActiveModule } from './LoginPage';
import { Card, StatCard } from '../ui/Card';
import { StatusBadge, Badge } from '../ui/Badge';
import { EmptyState, CardSkeleton, StatSkeleton } from '../ui/EmptyState';

const API_URL = '/api';

interface DashboardOverviewProps {
  onNavigate: (view: DashboardView) => void;
  patientName?: string;
  athleteId?: number;
  activeModules: ActiveModule[];
}

interface QuickStats {
  daysInProgram: number;
  adherence: number;
  appointments: number;
  streak: number;
}

interface ModuleCard {
  id: DashboardView;
  module: ActiveModule;
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

const allModuleCards: ModuleCard[] = [
  { 
    id: 'medical', 
    module: 'medical', 
    icon: Stethoscope, 
    label: 'Medicina', 
    description: 'Exames, prescrições e histórico médico',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  { 
    id: 'nutrition', 
    module: 'nutrition', 
    icon: Apple, 
    label: 'Nutrição', 
    description: 'Plano alimentar e orientações',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  { 
    id: 'training', 
    module: 'training', 
    icon: Dumbbell, 
    label: 'Treinamento', 
    description: 'Treinos e exercícios personalizados',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  { 
    id: 'rehab', 
    module: 'rehab', 
    icon: HeartPulse, 
    label: 'Reabilitação', 
    description: 'Fisioterapia e recuperação',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100'
  },
];

// Retorna saudação baseada no horário
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function DashboardOverview({ onNavigate, patientName = 'Paciente', athleteId, activeModules }: DashboardOverviewProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QuickStats>({ daysInProgram: 0, adherence: 0, appointments: 0, streak: 0 });
  const [todaySchedule, setTodaySchedule] = useState<{ time: string; title: string; type: string; professional: string; status: string }[]>([]);

  const firstName = patientName.split(' ')[0];

  // Filtrar cards baseado nos módulos ativos
  const visibleModuleCards = activeModules.length === 0 
    ? allModuleCards 
    : allModuleCards.filter(card => activeModules.includes(card.module));

  useEffect(() => {
    loadDashboardData();
  }, [athleteId]);

  const loadDashboardData = async () => {
    try {
      // Simular carregamento de dados reais
      setStats({
        daysInProgram: Math.floor(Math.random() * 200) + 30,
        adherence: Math.floor(Math.random() * 30) + 70,
        appointments: Math.floor(Math.random() * 20) + 5,
        streak: Math.floor(Math.random() * 15) + 3,
      });

      // Agenda de hoje baseada nos módulos ativos
      const scheduleItems = [];
      
      if (activeModules.includes('training')) {
        scheduleItems.push({
          time: '07:00',
          title: 'Treino de Força',
          type: 'training',
          professional: 'Lucas Ferreira',
          status: 'confirmed'
        });
      }
      
      if (activeModules.includes('nutrition')) {
        scheduleItems.push({
          time: '12:30',
          title: 'Check-in Nutricional',
          type: 'nutrition',
          professional: 'Dra. Marina Costa',
          status: 'pending'
        });
      }
      
      if (activeModules.includes('rehab')) {
        scheduleItems.push({
          time: '19:00',
          title: 'Fisioterapia',
          type: 'rehab',
          professional: 'Dr. Carlos Mendes',
          status: 'confirmed'
        });
      }

      if (activeModules.includes('medical')) {
        scheduleItems.push({
          time: '15:00',
          title: 'Consulta Médica',
          type: 'medical',
          professional: 'Dr. Ricardo Santos',
          status: 'confirmed'
        });
      }

      setTodaySchedule(scheduleItems.slice(0, 3));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Retorna ícone e cor para tipo de agendamento
  const getScheduleStyle = (type: string) => {
    const styles: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
      training: { icon: Dumbbell, color: 'text-orange-600', bg: 'bg-orange-100' },
      nutrition: { icon: Apple, color: 'text-green-600', bg: 'bg-green-100' },
      medical: { icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-100' },
      rehab: { icon: HeartPulse, color: 'text-pink-600', bg: 'bg-pink-100' },
    };
    return styles[type] || { icon: Calendar, color: 'text-zinc-600', bg: 'bg-zinc-100' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="h-6 w-24 bg-zinc-200 rounded animate-pulse mb-2" />
          <div className="h-10 w-64 bg-zinc-200 rounded-lg animate-pulse" />
        </div>
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
        
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <p className="text-zinc-500 mb-1">{getGreeting()}</p>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
          Olá, <span className="text-lime-500">{firstName}</span>
        </h1>
        {activeModules.length === 0 ? (
          <p className="text-zinc-500 mt-2">Aguardando ativação do seu plano.</p>
        ) : (
          <p className="text-zinc-500 mt-2">Confira seu acompanhamento de hoje.</p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Dias no Programa"
          value={stats.daysInProgram}
          icon={<Target className="w-full h-full" />}
          color="lime"
          size="sm"
        />
        <StatCard
          label="Aderência"
          value={`${stats.adherence}%`}
          icon={<TrendingUp className="w-full h-full" />}
          color="blue"
          size="sm"
        />
        <StatCard
          label="Sequência"
          value={`${stats.streak} dias`}
          icon={<Flame className="w-full h-full" />}
          color="orange"
          size="sm"
        />
        <StatCard
          label="Consultas"
          value={stats.appointments}
          icon={<Calendar className="w-full h-full" />}
          color="purple"
          size="sm"
        />
      </div>

      {/* Alert for no modules */}
      {activeModules.length === 0 ? (
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 mb-1">Plano Pendente</h3>
              <p className="text-zinc-600 text-sm">
                Seu plano ainda não foi ativado. Entre em contato com sua consultoria para começar seu acompanhamento.
              </p>
            </div>
          </div>
        </Card>
      ) : todaySchedule.length > 0 && (
        <Card className="bg-gradient-to-r from-lime-50 to-green-50 border-lime-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-lime-500 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-black" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-zinc-900 mb-1">Agenda de Hoje</h3>
              <p className="text-zinc-600 text-sm mb-3">
                Você tem {todaySchedule.length} {todaySchedule.length === 1 ? 'compromisso' : 'compromissos'} para hoje.
              </p>
              <button 
                onClick={() => onNavigate('appointments')}
                className="inline-flex items-center gap-1 text-sm font-semibold text-lime-700 hover:text-lime-800"
              >
                Ver Detalhes
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Today's Schedule */}
      {activeModules.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-zinc-600" />
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
              className="text-sm font-semibold text-lime-600 hover:text-lime-700"
            >
              Ver tudo
            </button>
          </div>

          {todaySchedule.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="Dia livre!"
              description="Nenhum compromisso agendado para hoje. Aproveite para descansar."
            />
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((item, idx) => {
                const style = getScheduleStyle(item.type);
                const Icon = style.icon;
                return (
                  <div 
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer"
                    onClick={() => onNavigate('appointments')}
                  >
                    <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${style.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900">{item.title}</span>
                        <StatusBadge 
                          status={item.status === 'confirmed' ? 'confirmed' : 'pending'} 
                          size="sm" 
                        />
                      </div>
                      <p className="text-sm text-zinc-500">{item.professional}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-zinc-900">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button 
            onClick={() => onNavigate('appointments')}
            className="mt-6 w-full py-3 bg-zinc-900 text-white rounded-xl font-semibold
                       hover:bg-lime-500 hover:text-black transition-colors"
          >
            Ver Agenda Completa
          </button>
        </Card>
      )}

      {/* Module Cards */}
      <div>
        <h3 className="font-bold text-zinc-900 mb-4">Seus Módulos</h3>
        <div className={`grid gap-4 ${
          visibleModuleCards.length === 4 ? 'grid-cols-2 lg:grid-cols-4' :
          visibleModuleCards.length === 3 ? 'grid-cols-2 lg:grid-cols-3' :
          visibleModuleCards.length === 2 ? 'grid-cols-2' :
          'grid-cols-1'
        }`}>
          {visibleModuleCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card 
                key={card.id}
                hover
                onClick={() => onNavigate(card.id)}
                className="group"
              >
                <div className={`w-12 h-12 rounded-xl ${card.bgColor} ${card.color} 
                                flex items-center justify-center mb-4
                                group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-zinc-900 mb-1">{card.label}</h4>
                <p className="text-sm text-zinc-500 line-clamp-2">{card.description}</p>
              </Card>
            );
          })}
          
          {/* Sempre mostrar Progresso se tiver algum módulo ativo */}
          {activeModules.length > 0 && (
            <Card 
              hover
              onClick={() => onNavigate('progress')}
              className="group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 
                              flex items-center justify-center mb-4
                              group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-zinc-900 mb-1">Progresso</h4>
              <p className="text-sm text-zinc-500">Evolução e resultados</p>
            </Card>
          )}
        </div>
      </div>

      {/* Motivational Card */}
      {stats.streak >= 7 && (
        <Card className="bg-gradient-to-r from-orange-500 to-amber-500 border-0 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Flame className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">🔥 Sequência Incrível!</h3>
              <p className="text-white/80">
                Você está há {stats.streak} dias consecutivos no programa. Continue assim!
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
