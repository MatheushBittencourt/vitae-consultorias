import { useState, useEffect } from 'react';
import { 
  Activity, Calendar, FileText, CheckCircle, Target, TrendingDown, 
  Clock, HeartPulse, Dumbbell, Home, MessageCircle, ChevronRight,
  Play, AlertCircle, User, Loader2
} from 'lucide-react';
import { getAuthHeaders } from '../../services/api';
import { Card, StatCard } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface RehabSectionProps {
  athleteId?: number;
}

interface TreatmentPlan {
  id: number;
  name: string;
  condition_treated: string;
  start_date: string;
  estimated_end_date: string;
  frequency: string;
  total_sessions: number;
  completed_sessions: number;
  status: string;
  physio_name: string;
  techniques: string;
  home_exercises: string;
  precautions: string;
}

interface PhysioSession {
  id: number;
  session_date: string;
  duration_minutes: number;
  pain_before: number;
  pain_after: number;
  status: string;
  progress_notes: string;
  techniques_applied: string;
}

interface PhysioProgress {
  id: number;
  record_date: string;
  pain_level: number;
  mobility_score: number;
  strength_score: number;
  functional_score: number;
}

interface PrescribedExercise {
  id: number;
  exercise_name: string;
  custom_name: string;
  custom_instructions: string;
  sets: number;
  reps: string;
  hold_time: number;
  frequency: string;
  is_home_exercise: boolean;
  video_url: string;
}

export function RehabSection({ athleteId }: RehabSectionProps) {
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState<TreatmentPlan | null>(null);
  const [sessions, setSessions] = useState<PhysioSession[]>([]);
  const [progress, setProgress] = useState<PhysioProgress[]>([]);
  const [homeExercises, setHomeExercises] = useState<PrescribedExercise[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'exercises' | 'history'>('overview');

  useEffect(() => {
    if (athleteId) {
      loadData();
    }
  }, [athleteId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar protocolo ativo
      const plansRes = await fetch(`/api/physio/treatment-plans/${athleteId}`, { headers: getAuthHeaders() });
      if (plansRes.ok) {
        const plans = await plansRes.json();
        const active = plans.find((p: TreatmentPlan) => p.status === 'active');
        setActivePlan(active || null);
        
        // Se tiver protocolo ativo, carregar exercícios prescritos
        if (active) {
          const exercisesRes = await fetch(`/api/physio/prescribed/${active.id}`, { headers: getAuthHeaders() });
          if (exercisesRes.ok) {
            const exercises = await exercisesRes.json();
            setHomeExercises(exercises.filter((e: PrescribedExercise) => e.is_home_exercise));
          }
        }
      }
      
      // Carregar sessões
      const sessionsRes = await fetch(`/api/physio/sessions/${athleteId}`, { headers: getAuthHeaders() });
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      }
      
      // Carregar evolução
      const progressRes = await fetch(`/api/physio/progress/${athleteId}`, { headers: getAuthHeaders() });
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgress(Array.isArray(progressData) ? progressData : []);
      }
      
    } catch (error) {
      console.error('Error loading physio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPainColor = (pain: number) => {
    if (pain <= 3) return 'text-green-600 bg-green-100';
    if (pain <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getProgressPercentage = () => {
    if (!activePlan || activePlan.total_sessions === 0) return 0;
    return Math.round((activePlan.completed_sessions / activePlan.total_sessions) * 100);
  };

  const nextSession = sessions.find(s => s.status === 'scheduled' && new Date(s.session_date) > new Date());
  const lastSession = sessions.find(s => s.status === 'completed');
  const latestProgress = progress[0];

  // Calcular evolução da dor
  const painEvolution = progress.length >= 2 
    ? progress[progress.length - 1].pain_level - progress[0].pain_level 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
      </div>
    );
  }

  if (!activePlan) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mb-2">
              <span className="text-lime-500">FISIOTERAPIA</span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-600">
              Acompanhamento do seu tratamento
            </p>
          </div>
        </div>

        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HeartPulse className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Nenhum Tratamento Ativo</h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            Você não possui um protocolo de fisioterapia ativo no momento. 
            Entre em contato com seu fisioterapeuta para iniciar um tratamento.
          </p>
        </Card>

        {/* Histórico se houver */}
        {sessions.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Histórico de Sessões</h2>
            <div className="space-y-3">
              {sessions.slice(0, 5).map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {new Date(session.session_date).toLocaleDateString('pt-BR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                    <div className="text-sm text-zinc-500">{session.techniques_applied || 'Sessão de fisioterapia'}</div>
                  </div>
                  <Badge className={session.status === 'completed' ? 'bg-lime-100 text-lime-700' : 'bg-zinc-100 text-zinc-700'}>
                    {session.status === 'completed' ? 'Concluída' : 'Agendada'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">FISIOTERAPIA</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600">
            Acompanhamento do seu tratamento
          </p>
        </div>
        {nextSession && (
          <button className="w-full sm:w-auto bg-black text-white px-6 py-3 text-sm font-bold tracking-wider hover:bg-lime-500 hover:text-black transition-colors rounded-lg">
            VER PRÓXIMA SESSÃO
          </button>
        )}
      </div>

      {/* Status Card */}
      <Card className="bg-gradient-to-r from-lime-500 to-lime-400 text-black p-4 sm:p-6 border-none">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg mb-1">{activePlan.name}</div>
            <p className="text-sm sm:text-base opacity-90">
              {activePlan.condition_treated || 'Protocolo de fisioterapia em andamento'}
            </p>
          </div>
          <div className="bg-black/10 px-4 py-2 rounded-lg text-center">
            <div className="text-2xl font-bold">{getProgressPercentage()}%</div>
            <div className="text-xs opacity-80">Progresso</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>{activePlan.completed_sessions} de {activePlan.total_sessions} sessões</span>
            <span>{activePlan.frequency}</span>
          </div>
          <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-black h-full rounded-full transition-all"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Sessões Semana"
          value={activePlan.frequency.replace(' semana', '')}
          icon={<Calendar className="w-5 h-5" />}
          color="lime"
        />
        <StatCard
          label="Sessões Concluídas"
          value={`${activePlan.completed_sessions}/${activePlan.total_sessions}`}
          icon={<CheckCircle className="w-5 h-5" />}
          color="blue"
          subtitle={`${getProgressPercentage()}% completo`}
        />
        <StatCard
          label="Nível de Dor"
          value={latestProgress?.pain_level ?? '-'}
          icon={<Target className="w-5 h-5" />}
          color={latestProgress && latestProgress.pain_level <= 3 ? 'lime' : latestProgress && latestProgress.pain_level <= 6 ? 'orange' : 'red'}
          subtitle="Escala 0-10"
        />
        <StatCard
          label="Evolução Dor"
          value={painEvolution > 0 ? `+${painEvolution}` : painEvolution.toString()}
          icon={<TrendingDown className="w-5 h-5" />}
          color={painEvolution <= 0 ? 'lime' : 'red'}
          subtitle={painEvolution <= 0 ? 'Melhorando' : 'Aumentou'}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Visão Geral', icon: Activity },
          { id: 'exercises', label: 'Exercícios em Casa', icon: Dumbbell },
          { id: 'history', label: 'Histórico', icon: Clock },
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

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Próxima Sessão */}
            {nextSession && (
              <Card className="p-6 border-l-4 border-l-lime-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-lime-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-lime-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Próxima Sessão</h3>
                    <p className="text-zinc-600">
                      {new Date(nextSession.session_date).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm text-zinc-500 mt-1">
                      Duração: {nextSession.duration_minutes} minutos
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Última Sessão */}
            {lastSession && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Última Sessão</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600">Data</span>
                    <span className="font-medium">
                      {new Date(lastSession.session_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600">Dor Antes</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPainColor(lastSession.pain_before)}`}>
                      {lastSession.pain_before}/10
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600">Dor Depois</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPainColor(lastSession.pain_after)}`}>
                      {lastSession.pain_after}/10
                    </span>
                  </div>
                  
                  {lastSession.techniques_applied && (
                    <div className="pt-4 border-t border-zinc-200">
                      <div className="text-sm text-zinc-500 mb-2">Técnicas Aplicadas</div>
                      <p className="text-zinc-700">{lastSession.techniques_applied}</p>
                    </div>
                  )}
                  
                  {lastSession.progress_notes && (
                    <div className="pt-4 border-t border-zinc-200">
                      <div className="text-sm text-zinc-500 mb-2">Observações do Fisioterapeuta</div>
                      <p className="text-zinc-700 bg-zinc-50 p-3 rounded-lg">{lastSession.progress_notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Evolução da Dor */}
            {progress.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Evolução da Dor</h2>
                <div className="space-y-4">
                  {progress.slice(0, 5).map((p, idx) => {
                    const prevPain = progress[idx + 1]?.pain_level;
                    const diff = prevPain !== undefined ? p.pain_level - prevPain : 0;
                    
                    return (
                      <div key={p.id}>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-zinc-600">
                            {new Date(p.record_date).toLocaleDateString('pt-BR')}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge className={getPainColor(p.pain_level)}>
                              {p.pain_level}/10
                            </Badge>
                            {diff !== 0 && (
                              <span className={`text-xs ${diff < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {diff > 0 ? '+' : ''}{diff}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              p.pain_level <= 3 ? 'bg-green-500' : 
                              p.pain_level <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${p.pain_level * 10}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Fisioterapeuta */}
            <Card className="bg-zinc-900 text-white p-6 border-none">
              <h3 className="text-lg font-bold mb-4">Seu Fisioterapeuta</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-lime-500 rounded-xl flex items-center justify-center">
                  <User className="w-8 h-8 text-black" />
                </div>
                <div>
                  <div className="font-bold text-lg">{activePlan.physio_name || 'Dr. Carlos Mendes'}</div>
                  <div className="text-white/60 text-sm">Fisioterapeuta</div>
                </div>
              </div>
              <button className="w-full py-3 bg-lime-500 text-black font-bold tracking-wider hover:bg-lime-400 transition-colors rounded-lg flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                ENVIAR MENSAGEM
              </button>
            </Card>

            {/* Recomendações */}
            {activePlan.precautions && (
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Recomendações</h3>
                <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-700">{activePlan.precautions}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Datas Importantes */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Cronograma</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-lime-500 rounded-full" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Início do Tratamento</div>
                    <div className="text-xs text-zinc-500">
                      {new Date(activePlan.start_date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
                {activePlan.estimated_end_date && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Previsão de Alta</div>
                      <div className="text-xs text-zinc-500">
                        {new Date(activePlan.estimated_end_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'exercises' && (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Exercícios para Casa</h3>
                <p className="text-zinc-600 text-sm">
                  Realize estes exercícios diariamente conforme orientação do seu fisioterapeuta.
                </p>
              </div>
            </div>
          </Card>

          {homeExercises.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-zinc-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Nenhum Exercício Prescrito</h2>
              <p className="text-zinc-500">
                Seu fisioterapeuta ainda não prescreveu exercícios para fazer em casa.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homeExercises.map((exercise, idx) => (
                <Card key={exercise.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-lime-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-lime-600">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold mb-1">
                        {exercise.custom_name || exercise.exercise_name}
                      </h4>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {exercise.sets && (
                          <Badge className="bg-zinc-100 text-zinc-700">
                            {exercise.sets} séries
                          </Badge>
                        )}
                        {exercise.reps && (
                          <Badge className="bg-zinc-100 text-zinc-700">
                            {exercise.reps} reps
                          </Badge>
                        )}
                        {exercise.hold_time && (
                          <Badge className="bg-zinc-100 text-zinc-700">
                            {exercise.hold_time}s sustentação
                          </Badge>
                        )}
                        {exercise.frequency && (
                          <Badge className="bg-lime-100 text-lime-700">
                            {exercise.frequency}
                          </Badge>
                        )}
                      </div>
                      
                      {exercise.custom_instructions && (
                        <p className="text-sm text-zinc-600 mb-3">{exercise.custom_instructions}</p>
                      )}
                      
                      {exercise.video_url && (
                        <a 
                          href={exercise.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-lime-600 hover:text-lime-700 font-medium"
                        >
                          <Play className="w-4 h-4" />
                          Ver demonstração
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-zinc-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Nenhuma Sessão Registrada</h2>
              <p className="text-zinc-500">
                Suas sessões de fisioterapia aparecerão aqui após serem realizadas.
              </p>
            </Card>
          ) : (
            sessions.map(session => (
              <Card key={session.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      session.status === 'completed' 
                        ? 'bg-lime-100' 
                        : session.status === 'scheduled'
                        ? 'bg-blue-100'
                        : 'bg-red-100'
                    }`}>
                      {session.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-lime-600" />
                      ) : session.status === 'scheduled' ? (
                        <Calendar className="w-6 h-6 text-blue-600" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold">
                        {new Date(session.session_date).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-zinc-500">
                        {session.duration_minutes} minutos
                        {session.techniques_applied && ` • ${session.techniques_applied}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {session.status === 'completed' && session.pain_before !== null && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500">Dor:</span>
                        <span className={`px-2 py-0.5 rounded ${getPainColor(session.pain_before)}`}>
                          {session.pain_before}
                        </span>
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                        <span className={`px-2 py-0.5 rounded ${getPainColor(session.pain_after)}`}>
                          {session.pain_after}
                        </span>
                      </div>
                    )}
                    <Badge className={
                      session.status === 'completed' 
                        ? 'bg-lime-100 text-lime-700' 
                        : session.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }>
                      {session.status === 'completed' ? 'Concluída' : 
                       session.status === 'scheduled' ? 'Agendada' : 'Cancelada'}
                    </Badge>
                  </div>
                </div>
                
                {session.progress_notes && (
                  <div className="mt-4 pt-4 border-t border-zinc-100">
                    <p className="text-sm text-zinc-600 bg-zinc-50 p-3 rounded-lg">
                      {session.progress_notes}
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
