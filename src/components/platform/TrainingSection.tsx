import { useState, useEffect } from 'react';
import { 
  Play, CheckCircle, Clock, Loader2, User, Download, 
  ChevronDown, ChevronUp, Dumbbell, Target, Calendar,
  Timer, FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = 'http://localhost:3001/api';

interface TrainingSectionProps {
  athleteId?: number;
}

interface TrainingPlan {
  id: number;
  name: string;
  objective: string;
  duration_weeks: number;
  frequency_per_week: number;
  level: string;
  split_type: string;
  status: string;
  coach_name: string;
}

interface TrainingDay {
  id: number;
  plan_id: number;
  day_letter: string;
  day_name: string;
  day_of_week: number;
  focus_muscles: string;
  estimated_duration: number;
  order_index: number;
}

interface TrainingExercise {
  id: number;
  training_day_id: number;
  name: string;
  muscle_group: string;
  equipment: string;
  sets: number;
  reps: string;
  weight: string;
  rest_seconds: number;
  tempo: string;
  technique: string;
  rpe: string;
  video_url: string;
  notes: string;
}

const DAY_NAMES: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
  7: 'Domingo'
};

const DAY_NAMES_SHORT: Record<number, string> = {
  0: 'DOM',
  1: 'SEG',
  2: 'TER',
  3: 'QUA',
  4: 'QUI',
  5: 'SEX',
  6: 'SAB',
  7: 'DOM'
};

const OBJECTIVES: Record<string, string> = {
  hipertrofia: 'Hipertrofia',
  forca: 'Força',
  resistencia: 'Resistência',
  emagrecimento: 'Emagrecimento',
  condicionamento: 'Condicionamento',
  reabilitacao: 'Reabilitação',
  manutencao: 'Manutenção'
};

const MUSCLE_GROUPS: Record<string, string> = {
  peito: 'Peito',
  costas: 'Costas',
  ombros: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  quadriceps: 'Quadríceps',
  posterior: 'Posterior',
  gluteos: 'Glúteos',
  panturrilha: 'Panturrilha',
  abdomen: 'Abdômen',
  corpo_todo: 'Corpo Todo',
  cardio: 'Cardio'
};

const TECHNIQUES: Record<string, string> = {
  normal: 'Normal',
  drop_set: 'Drop Set',
  rest_pause: 'Rest-Pause',
  super_serie: 'Super Série',
  bi_set: 'Bi-Set',
  piramide: 'Pirâmide'
};

export function TrainingSection({ athleteId }: TrainingSectionProps) {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [exercises, setExercises] = useState<Record<number, TrainingExercise[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    if (athleteId) {
      loadPlans();
    } else {
      setLoading(false);
    }
  }, [athleteId]);

  const loadPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/training-plans?athlete_id=${athleteId}`);
      const data = await response.json();
      setPlans(data);
      
      const activePlan = data.find((p: TrainingPlan) => p.status === 'active') || data[0];
      if (activePlan) {
        setSelectedPlan(activePlan);
        await loadTrainingDays(activePlan.id);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrainingDays = async (planId: number) => {
    try {
      const response = await fetch(`${API_URL}/training-days?plan_id=${planId}`);
      const data: TrainingDay[] = await response.json();
      setTrainingDays(data);
      
      // Load all exercises for all days
      const exercisesMap: Record<number, TrainingExercise[]> = {};
      for (const day of data) {
        const exRes = await fetch(`${API_URL}/training-exercises?day_id=${day.id}`);
        exercisesMap[day.id] = await exRes.json();
      }
      setExercises(exercisesMap);
      
      // Expand today's day by default
      const today = new Date().getDay();
      const todaysDay = data.find(d => d.day_of_week === today);
      if (todaysDay) {
        setExpandedDays(new Set([todaysDay.id]));
      }
    } catch (error) {
      console.error('Error loading training days:', error);
    }
  };

  const toggleDay = (dayId: number) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dayId)) {
        next.delete(dayId);
      } else {
        next.add(dayId);
      }
      return next;
    });
  };

  const getCurrentDayOfWeek = () => new Date().getDay();

  const generatePDF = async () => {
    if (!selectedPlan) return;
    
    setGeneratingPdf(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFillColor(132, 204, 22); // lime-500
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('PLANO DE TREINAMENTO', 14, 20);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(selectedPlan.name, 14, 30);
      
      // Plan info
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      let yPos = 50;
      
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMAÇÕES DO PLANO', 14, yPos);
      yPos += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Treinador: ${selectedPlan.coach_name || 'Não atribuído'}`, 14, yPos);
      yPos += 6;
      doc.text(`Objetivo: ${OBJECTIVES[selectedPlan.objective] || selectedPlan.objective}`, 14, yPos);
      yPos += 6;
      doc.text(`Duração: ${selectedPlan.duration_weeks} semanas`, 14, yPos);
      yPos += 6;
      doc.text(`Frequência: ${selectedPlan.frequency_per_week}x por semana`, 14, yPos);
      yPos += 6;
      doc.text(`Divisão: ${selectedPlan.split_type || '-'}`, 14, yPos);
      yPos += 6;
      doc.text(`Nível: ${selectedPlan.level || '-'}`, 14, yPos);
      yPos += 15;
      
      // Training days
      for (const day of trainingDays) {
        const dayExercises = exercises[day.id] || [];
        
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        // Day header
        doc.setFillColor(0, 0, 0);
        doc.rect(14, yPos - 5, pageWidth - 28, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${day.day_letter} - ${day.day_name || DAY_NAMES[day.day_of_week]}`, 18, yPos + 2);
        
        if (day.focus_muscles) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(`Foco: ${day.focus_muscles}`, pageWidth - 60, yPos + 2);
        }
        
        yPos += 12;
        
        if (dayExercises.length > 0) {
          // Exercises table
          const tableData = dayExercises.map((ex, idx) => [
            (idx + 1).toString(),
            ex.name,
            MUSCLE_GROUPS[ex.muscle_group] || ex.muscle_group,
            `${ex.sets}x${ex.reps}`,
            ex.weight || '-',
            `${ex.rest_seconds}s`,
            ex.tempo || '-',
            ex.technique !== 'normal' ? TECHNIQUES[ex.technique] : '-'
          ]);
          
          autoTable(doc, {
            startY: yPos,
            head: [['#', 'Exercício', 'Músculo', 'Séries', 'Carga', 'Desc.', 'Cadência', 'Técnica']],
            body: tableData,
            theme: 'striped',
            headStyles: {
              fillColor: [132, 204, 22],
              textColor: [0, 0, 0],
              fontStyle: 'bold',
              fontSize: 8
            },
            bodyStyles: {
              fontSize: 8
            },
            columnStyles: {
              0: { cellWidth: 8 },
              1: { cellWidth: 40 },
              2: { cellWidth: 25 },
              3: { cellWidth: 18 },
              4: { cellWidth: 18 },
              5: { cellWidth: 15 },
              6: { cellWidth: 20 },
              7: { cellWidth: 22 }
            },
            margin: { left: 14, right: 14 }
          });
          
          yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
        } else {
          doc.setTextColor(150, 150, 150);
          doc.setFontSize(9);
          doc.text('Nenhum exercício cadastrado', 14, yPos + 5);
          yPos += 15;
        }
        
        doc.setTextColor(60, 60, 60);
      }
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Download
      doc.save(`treino-${selectedPlan.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
      </div>
    );
  }

  if (!athleteId) {
    return (
      <div className="text-center py-12 text-zinc-500">
        Não foi possível carregar os dados do atleta.
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">TREINAMENTO</span>
          </h1>
          <p className="text-xl text-zinc-600">
            Seu programa de treino personalizado
          </p>
        </div>
        <div className="bg-white p-12 text-center">
          <Dumbbell className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Nenhum plano de treino</h3>
          <p className="text-zinc-600">Seu treinador ainda não criou um plano de treino para você.</p>
        </div>
      </div>
    );
  }

  const todayDayOfWeek = getCurrentDayOfWeek();
  const todaysTraining = trainingDays.find(d => d.day_of_week === todayDayOfWeek);
  const todaysExercises = todaysTraining ? exercises[todaysTraining.id] || [] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">TREINAMENTO</span>
          </h1>
          <p className="text-xl text-zinc-600">
            Seu programa de treino personalizado
          </p>
        </div>
        <div className="flex items-center gap-3">
          {plans.length > 1 && (
            <select
              value={selectedPlan?.id || ''}
              onChange={(e) => {
                const plan = plans.find(p => p.id === Number(e.target.value));
                if (plan) {
                  setSelectedPlan(plan);
                  loadTrainingDays(plan.id);
                }
              }}
              className="px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none font-bold"
            >
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={generatePDF}
            disabled={generatingPdf}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 font-bold tracking-wider hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {generatingPdf ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            BAIXAR PDF
          </button>
        </div>
      </div>

      {/* Plan Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 border-l-4 border-lime-500">
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
            <FileText className="w-4 h-4" />
            PLANO
          </div>
          <div className="font-bold text-lg truncate">{selectedPlan?.name}</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-black">
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
            <Target className="w-4 h-4" />
            OBJETIVO
          </div>
          <div className="font-bold text-lg">{OBJECTIVES[selectedPlan?.objective || ''] || selectedPlan?.objective}</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-black">
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
            <Calendar className="w-4 h-4" />
            FREQUÊNCIA
          </div>
          <div className="font-bold text-lg">{selectedPlan?.frequency_per_week}x/semana</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-black">
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
            <Timer className="w-4 h-4" />
            DURAÇÃO
          </div>
          <div className="font-bold text-lg">{selectedPlan?.duration_weeks} semanas</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-black">
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
            <Dumbbell className="w-4 h-4" />
            DIVISÃO
          </div>
          <div className="font-bold text-lg">{selectedPlan?.split_type || '-'}</div>
        </div>
      </div>

      {/* Today's Training Highlight */}
      {todaysTraining && (
        <div className="bg-lime-500 text-black p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black text-white flex items-center justify-center">
                <span className="text-2xl font-bold">{todaysTraining.day_letter}</span>
              </div>
              <div>
                <div className="text-sm font-bold tracking-wider">TREINO DE HOJE • {DAY_NAMES[todayDayOfWeek].toUpperCase()}</div>
                <div className="text-2xl font-bold">{todaysTraining.day_name}</div>
                {todaysTraining.focus_muscles && (
                  <div className="text-sm">Foco: {todaysTraining.focus_muscles}</div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{todaysExercises.length}</div>
              <div className="text-sm">exercícios</div>
            </div>
          </div>
          <button 
            onClick={() => toggleDay(todaysTraining.id)}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 font-bold tracking-wider hover:bg-zinc-800 transition-colors"
          >
            <Play className="w-5 h-5" />
            {expandedDays.has(todaysTraining.id) ? 'OCULTAR EXERCÍCIOS' : 'VER EXERCÍCIOS'}
          </button>
        </div>
      )}

      {/* Weekly Schedule */}
      <div className="bg-white">
        <div className="px-6 py-4 bg-zinc-900 text-white">
          <h2 className="text-xl font-bold tracking-wider">PROGRAMAÇÃO SEMANAL</h2>
        </div>
        
        <div className="divide-y divide-zinc-200">
          {trainingDays.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <p>Nenhum dia de treino configurado</p>
            </div>
          ) : (
            trainingDays.map(day => {
              const dayExercises = exercises[day.id] || [];
              const isExpanded = expandedDays.has(day.id);
              const isToday = day.day_of_week === todayDayOfWeek;
              
              return (
                <div key={day.id} className={isToday ? 'bg-lime-50' : ''}>
                  {/* Day Header */}
                  <div 
                    onClick={() => toggleDay(day.id)}
                    className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-zinc-50 transition-colors ${isToday ? 'hover:bg-lime-100' : ''}`}
                  >
                    <div className={`w-12 h-12 flex items-center justify-center font-bold text-xl ${isToday ? 'bg-lime-500 text-black' : 'bg-black text-white'}`}>
                      {day.day_letter}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{day.day_name}</span>
                        {isToday && (
                          <span className="px-2 py-0.5 bg-lime-500 text-black text-xs font-bold">HOJE</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-zinc-500">
                        <span>{DAY_NAMES[day.day_of_week]}</span>
                        {day.focus_muscles && (
                          <>
                            <span>•</span>
                            <span className="text-lime-600 font-medium">{day.focus_muscles}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{dayExercises.length} exercícios</span>
                        {day.estimated_duration && (
                          <>
                            <span>•</span>
                            <span>~{day.estimated_duration} min</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-zinc-400" />
                      )}
                    </div>
                  </div>

                  {/* Exercises */}
                  {isExpanded && (
                    <div className="border-t border-zinc-200 bg-zinc-50">
                      {dayExercises.length === 0 ? (
                        <div className="p-6 text-center text-zinc-500">
                          Nenhum exercício cadastrado para este dia
                        </div>
                      ) : (
                        <div className="divide-y divide-zinc-200">
                          {dayExercises.map((ex, idx) => (
                            <div key={ex.id} className="p-4 flex gap-4">
                              <div className="w-10 h-10 bg-lime-500 text-black flex items-center justify-center font-bold flex-shrink-0">
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div>
                                    <h4 className="font-bold text-lg">{ex.name}</h4>
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="px-2 py-0.5 bg-zinc-200 text-zinc-700 font-medium">
                                        {MUSCLE_GROUPS[ex.muscle_group] || ex.muscle_group}
                                      </span>
                                      {ex.technique && ex.technique !== 'normal' && (
                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-medium">
                                          {TECHNIQUES[ex.technique] || ex.technique}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {ex.video_url && (
                                    <a 
                                      href={ex.video_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 px-3 py-1 bg-black text-white text-sm font-bold hover:bg-lime-500 hover:text-black transition-colors"
                                    >
                                      <Play className="w-4 h-4" />
                                      VÍDEO
                                    </a>
                                  )}
                                </div>

                                {/* Exercise Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
                                  <div className="bg-white p-2 border border-zinc-200">
                                    <div className="text-zinc-500 text-xs">Séries</div>
                                    <div className="font-bold">{ex.sets}x</div>
                                  </div>
                                  <div className="bg-white p-2 border border-zinc-200">
                                    <div className="text-zinc-500 text-xs">Repetições</div>
                                    <div className="font-bold">{ex.reps}</div>
                                  </div>
                                  {ex.weight && (
                                    <div className="bg-white p-2 border border-zinc-200">
                                      <div className="text-zinc-500 text-xs">Carga</div>
                                      <div className="font-bold">{ex.weight}</div>
                                    </div>
                                  )}
                                  <div className="bg-white p-2 border border-zinc-200">
                                    <div className="text-zinc-500 text-xs">Descanso</div>
                                    <div className="font-bold">{ex.rest_seconds}s</div>
                                  </div>
                                  {ex.tempo && (
                                    <div className="bg-white p-2 border border-zinc-200">
                                      <div className="text-zinc-500 text-xs">Cadência</div>
                                      <div className="font-bold">{ex.tempo}</div>
                                    </div>
                                  )}
                                  {ex.rpe && (
                                    <div className="bg-white p-2 border border-zinc-200">
                                      <div className="text-zinc-500 text-xs">RPE</div>
                                      <div className="font-bold">{ex.rpe}</div>
                                    </div>
                                  )}
                                </div>

                                {ex.notes && (
                                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 text-sm">
                                    <strong>Observações:</strong> {ex.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Coach Info */}
      <div className="bg-black text-white p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-zinc-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-zinc-400">Seu Treinador</div>
            <div className="text-xl font-bold">{selectedPlan?.coach_name || 'Não atribuído'}</div>
          </div>
          <button className="px-6 py-3 bg-lime-500 text-black font-bold tracking-wider hover:bg-lime-400 transition-colors">
            MENSAGEM
          </button>
        </div>
      </div>
    </div>
  );
}
