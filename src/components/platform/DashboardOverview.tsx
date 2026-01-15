import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, AlertCircle, Dumbbell, Apple, Stethoscope, HeartPulse, Loader2 } from 'lucide-react';
import { DashboardView } from './Dashboard';
import { ActiveModule } from './LoginPage';

const API_URL = 'http://localhost:3001/api';

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
}

interface ModuleCard {
  id: DashboardView;
  module: ActiveModule;
  icon: string;
  label: string;
  description: string;
}

const allModuleCards: ModuleCard[] = [
  { id: 'medical', module: 'medical', icon: '🏥', label: 'Medicina', description: 'Exames, prescrições e histórico médico' },
  { id: 'nutrition', module: 'nutrition', icon: '🥗', label: 'Nutrição', description: 'Plano alimentar e orientações' },
  { id: 'training', module: 'training', icon: '💪', label: 'Treinamento', description: 'Treinos e exercícios personalizados' },
  { id: 'rehab', module: 'rehab', icon: '🩹', label: 'Reabilitação', description: 'Fisioterapia e recuperação' },
];

export function DashboardOverview({ onNavigate, patientName = 'Paciente', athleteId, activeModules }: DashboardOverviewProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QuickStats>({ daysInProgram: 0, adherence: 0, appointments: 0 });
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
      // Em produção, isso buscaria dados do backend
      
      setStats({
        daysInProgram: Math.floor(Math.random() * 200) + 30,
        adherence: Math.floor(Math.random() * 30) + 70,
        appointments: Math.floor(Math.random() * 20) + 5,
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

      setTodaySchedule(scheduleItems.slice(0, 3)); // Mostrar no máximo 3
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
      {/* Header */}
      <div>
        <h1 className="text-5xl font-bold tracking-tighter mb-2">
          Bem-vindo, <span className="text-lime-500">{firstName}</span>
        </h1>
        <p className="text-xl text-zinc-600">
          {activeModules.length === 0 
            ? 'Aguardando ativação do seu plano.'
            : 'Aqui está um resumo do seu acompanhamento hoje.'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border-l-4 border-lime-500">
          <div className="text-4xl font-bold mb-2">{stats.daysInProgram}</div>
          <div className="text-sm tracking-wider text-zinc-600">DIAS NO PROGRAMA</div>
        </div>
        <div className="bg-white p-6 border-l-4 border-black">
          <div className="text-4xl font-bold mb-2">{stats.adherence}%</div>
          <div className="text-sm tracking-wider text-zinc-600">ADERÊNCIA</div>
        </div>
        <div className="bg-white p-6 border-l-4 border-black">
          <div className="text-4xl font-bold mb-2">{stats.appointments}</div>
          <div className="text-sm tracking-wider text-zinc-600">CONSULTAS</div>
        </div>
      </div>

      {/* Alert for no modules */}
      {activeModules.length === 0 ? (
        <div className="bg-yellow-100 text-yellow-800 p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <div className="font-bold text-lg mb-1">Plano Pendente</div>
            <p className="mb-3">
              Seu plano ainda não foi ativado. Entre em contato com sua consultoria para mais informações.
            </p>
          </div>
        </div>
      ) : todaySchedule.length > 0 && (
        <div className="bg-lime-500 text-black p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <div className="font-bold text-lg mb-1">Agenda de Hoje</div>
            <p className="mb-3">
              Você tem {todaySchedule.length} {todaySchedule.length === 1 ? 'compromisso' : 'compromissos'} agendado{todaySchedule.length === 1 ? '' : 's'} para hoje.
            </p>
            <button 
              onClick={() => onNavigate('appointments')}
              className="text-sm font-bold underline hover:no-underline"
            >
              Ver Detalhes →
            </button>
          </div>
        </div>
      )}

      {/* Today's Schedule */}
      {activeModules.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {/* Today's Schedule */}
          <div className="bg-white p-8">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Agenda de Hoje</h2>
            </div>
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <p>Nenhum compromisso agendado para hoje.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaySchedule.map((item, idx) => (
                  <div key={idx} className={`flex items-start gap-4 pb-4 ${idx < todaySchedule.length - 1 ? 'border-b border-zinc-200' : ''}`}>
                    <div className="text-center min-w-[60px]">
                      <div className="text-2xl font-bold">{item.time}</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold mb-1">{item.title}</div>
                      <div className="text-sm text-zinc-600">{item.professional}</div>
                      <div className="mt-2">
                        <span className={`inline-block px-3 py-1 text-xs font-bold ${
                          item.status === 'confirmed' ? 'bg-lime-500 text-black' : 'bg-zinc-200 text-black'
                        }`}>
                          {item.status === 'confirmed' ? 'CONFIRMADO' : 'PENDENTE'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button 
              onClick={() => onNavigate('appointments')}
              className="mt-6 w-full py-3 border-2 border-black hover:bg-black hover:text-white transition-colors font-bold tracking-wider"
            >
              VER AGENDA COMPLETA
            </button>
          </div>

        </div>
      )}

      {/* Quick Access Cards - Baseado nos módulos ativos */}
      <div className={`grid grid-cols-1 gap-6 ${
        visibleModuleCards.length === 4 ? 'md:grid-cols-4' :
        visibleModuleCards.length === 3 ? 'md:grid-cols-3' :
        visibleModuleCards.length === 2 ? 'md:grid-cols-2' :
        'md:grid-cols-1'
      }`}>
        {visibleModuleCards.map((card) => (
          <button 
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className="bg-white p-6 text-left hover:border-l-4 hover:border-lime-500 transition-all group"
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <div className="font-bold text-lg mb-2">{card.label}</div>
            <div className="text-sm text-zinc-600">{card.description}</div>
          </button>
        ))}
        
        {/* Sempre mostrar Progresso se tiver algum módulo ativo */}
        {activeModules.length > 0 && (
          <button 
            onClick={() => onNavigate('progress')}
            className="bg-white p-6 text-left hover:border-l-4 hover:border-lime-500 transition-all group"
          >
            <div className="text-3xl mb-3">📊</div>
            <div className="font-bold text-lg mb-2">Progresso</div>
            <div className="text-sm text-zinc-600">Evolução e resultados alcançados</div>
          </button>
        )}
      </div>
    </div>
  );
}
