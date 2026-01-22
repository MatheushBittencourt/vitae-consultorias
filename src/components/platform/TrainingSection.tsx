import { useState, useEffect } from 'react';
import { 
  Play, CheckCircle, Clock, Loader2, User, Download, 
  ChevronDown, ChevronUp, Dumbbell, Target, Calendar,
  Timer, FileText, Video
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, StatCard } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

const API_URL = '/api';

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
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 16;
      const contentWidth = pageWidth - (margin * 2);
      
      // Helper function to draw rounded rectangle
      const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number, fill: boolean = true, stroke: boolean = false) => {
        doc.roundedRect(x, y, w, h, r, r, fill ? 'F' : stroke ? 'S' : 'FD');
      };
      
      // === PAGE 1: Cover / Plan Info ===
      
      // Background accent
      doc.setFillColor(250, 250, 250);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Top accent bar
      doc.setFillColor(132, 204, 22); // lime-500
      doc.rect(0, 0, pageWidth, 8, 'F');
      
      // Plan name header
      let yPos = 35;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      doc.text(selectedPlan.name.toUpperCase(), margin, yPos);
      
      // Subtitle
      yPos += 12;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Plano de Treinamento Personalizado', margin, yPos);
      
      // Info cards row
      yPos += 20;
      const cardWidth = (contentWidth - 12) / 4;
      const cardHeight = 32;
      const cardData = [
        { label: 'OBJETIVO', value: OBJECTIVES[selectedPlan.objective] || selectedPlan.objective },
        { label: 'DURAÇÃO', value: `${selectedPlan.duration_weeks} semanas` },
        { label: 'FREQUÊNCIA', value: `${selectedPlan.frequency_per_week}x/semana` },
        { label: 'DIVISÃO', value: selectedPlan.split_type || '-' }
      ];
      
      cardData.forEach((card, i) => {
        const x = margin + (i * (cardWidth + 4));
        
        // Card background
        doc.setFillColor(255, 255, 255);
        drawRoundedRect(x, yPos, cardWidth, cardHeight, 3);
        
        // Card border
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.5);
        doc.roundedRect(x, yPos, cardWidth, cardHeight, 3, 3, 'S');
        
        // Label
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150, 150, 150);
        doc.text(card.label, x + 6, yPos + 10);
        
        // Value
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(card.value, x + 6, yPos + 22);
      });
      
      // Coach and level info
      yPos += cardHeight + 16;
      doc.setFillColor(255, 255, 255);
      drawRoundedRect(margin, yPos, contentWidth, 24, 3);
      doc.setDrawColor(230, 230, 230);
      doc.roundedRect(margin, yPos, contentWidth, 24, 3, 3, 'S');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Treinador: ${selectedPlan.coach_name || 'Não atribuído'}`, margin + 8, yPos + 10);
      doc.text(`Nível: ${selectedPlan.level || '-'}`, margin + 8, yPos + 18);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, contentWidth - 20, yPos + 14, { align: 'right' });
      
      // Training days summary
      yPos += 40;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('ESTRUTURA DO TREINO', margin, yPos);
      
      yPos += 12;
      trainingDays.forEach((day) => {
        const dayExercises = exercises[day.id] || [];
        
        // Day card
        doc.setFillColor(255, 255, 255);
        drawRoundedRect(margin, yPos, contentWidth, 20, 3);
        doc.setDrawColor(230, 230, 230);
        doc.roundedRect(margin, yPos, contentWidth, 20, 3, 3, 'S');
        
        // Day letter badge
        doc.setFillColor(132, 204, 22);
        drawRoundedRect(margin + 4, yPos + 4, 12, 12, 2);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(day.day_letter, margin + 7, yPos + 12);
        
        // Day name
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(day.day_name || DAY_NAMES[day.day_of_week], margin + 22, yPos + 9);
        
        // Focus muscles
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(day.focus_muscles || '', margin + 22, yPos + 16);
        
        // Exercise count
        doc.setFontSize(9);
        doc.setTextColor(132, 204, 22);
        doc.text(`${dayExercises.length} exercícios`, contentWidth - 10, yPos + 12, { align: 'right' });
        
        yPos += 24;
      });
      
      // === TRAINING DAYS PAGES ===
      for (const day of trainingDays) {
        const dayExercises = exercises[day.id] || [];
        
        // New page for each day
        doc.addPage();
        
        // Background
        doc.setFillColor(250, 250, 250);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Top accent bar
        doc.setFillColor(132, 204, 22);
        doc.rect(0, 0, pageWidth, 6, 'F');
        
        // Day header
        yPos = 25;
        
        // Day letter badge (larger)
        doc.setFillColor(0, 0, 0);
        drawRoundedRect(margin, yPos - 10, 24, 24, 4);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(132, 204, 22);
        doc.text(day.day_letter, margin + 8, yPos + 5);
        
        // Day name
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(day.day_name || DAY_NAMES[day.day_of_week], margin + 32, yPos);
        
        // Focus muscles badge
        if (day.focus_muscles) {
          yPos += 8;
          doc.setFillColor(240, 240, 240);
          const focusText = `Foco: ${day.focus_muscles}`;
          const focusWidth = doc.getTextWidth(focusText) + 12;
          drawRoundedRect(margin + 32, yPos - 5, focusWidth, 14, 3);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(80, 80, 80);
          doc.text(focusText, margin + 38, yPos + 3);
        }
        
        yPos += 20;
        
        if (dayExercises.length > 0) {
          // Modern table
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
            head: [['#', 'EXERCÍCIO', 'MÚSCULO', 'SÉRIES', 'CARGA', 'DESC.', 'TEMPO', 'TÉCNICA']],
            body: tableData,
            theme: 'plain',
            headStyles: {
              fillColor: [0, 0, 0],
              textColor: [132, 204, 22],
              fontStyle: 'bold',
              fontSize: 7,
              cellPadding: 4,
              halign: 'left'
            },
            bodyStyles: {
              fontSize: 9,
              cellPadding: 5,
              textColor: [40, 40, 40],
              lineColor: [240, 240, 240],
              lineWidth: 0.5
            },
            alternateRowStyles: {
              fillColor: [255, 255, 255]
            },
            columnStyles: {
              0: { cellWidth: 10, halign: 'center', fontStyle: 'bold', fillColor: [245, 245, 245] },
              1: { cellWidth: 48, fontStyle: 'bold' },
              2: { cellWidth: 28 },
              3: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
              4: { cellWidth: 18, halign: 'center' },
              5: { cellWidth: 14, halign: 'center' },
              6: { cellWidth: 18, halign: 'center' },
              7: { cellWidth: 22 }
            },
            margin: { left: margin, right: margin },
            tableLineColor: [230, 230, 230],
            tableLineWidth: 0.5,
            didParseCell: (data) => {
              // Highlight technique column if has value
              if (data.column.index === 7 && data.cell.raw !== '-' && data.section === 'body') {
                data.cell.styles.textColor = [132, 204, 22];
                data.cell.styles.fontStyle = 'bold';
              }
            }
          });
          
          yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
          
          // Exercise notes section (if any have notes)
          const exercisesWithNotes = dayExercises.filter(ex => ex.notes);
          if (exercisesWithNotes.length > 0 && yPos < pageHeight - 60) {
            doc.setFillColor(255, 253, 240);
            drawRoundedRect(margin, yPos, contentWidth, 8 + (exercisesWithNotes.length * 12), 3);
            doc.setDrawColor(255, 220, 100);
            doc.roundedRect(margin, yPos, contentWidth, 8 + (exercisesWithNotes.length * 12), 3, 3, 'S');
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(180, 140, 0);
            doc.text('OBSERVAÇÕES:', margin + 6, yPos + 8);
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 80, 0);
            exercisesWithNotes.forEach((ex, i) => {
              doc.text(`• ${ex.name}: ${ex.notes}`, margin + 6, yPos + 16 + (i * 10));
            });
          }
          
          // Exercise videos section (if any have video_url)
          const exercisesWithVideo = dayExercises.filter(ex => ex.video_url);
          if (exercisesWithVideo.length > 0) {
            yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
            if (exercisesWithNotes.length > 0) yPos += 8 + (exercisesWithNotes.length * 12) + 8;
            
            if (yPos < pageHeight - 40) {
              doc.setFontSize(7);
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(100, 100, 200);
              doc.text(`📹 ${exercisesWithVideo.length} exercício(s) com vídeo demonstrativo disponível no app`, margin, yPos);
            }
          }
        } else {
          doc.setFillColor(245, 245, 245);
          drawRoundedRect(margin, yPos, contentWidth, 30, 3);
          doc.setTextColor(150, 150, 150);
          doc.setFontSize(10);
          doc.text('Nenhum exercício cadastrado para este dia', margin + 10, yPos + 18);
        }
      }
      
      // Footer on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Footer line
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
        
        // Footer text
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text(selectedPlan.name, margin, pageHeight - 10);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
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
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">TREINAMENTO</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600">
            Seu programa de treino personalizado
          </p>
        </div>
        <EmptyState
          icon="training"
          title="Nenhum plano de treino"
          description="Seu treinador ainda não criou um plano de treino para você."
        />
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
        <StatCard
          label="Plano"
          value={selectedPlan?.name || '-'}
          icon={<FileText className="w-5 h-5" />}
          color="lime"
        />
        <StatCard
          label="Objetivo"
          value={OBJECTIVES[selectedPlan?.objective || ''] || selectedPlan?.objective || '-'}
          icon={<Target className="w-5 h-5" />}
          color="zinc"
        />
        <StatCard
          label="Frequência"
          value={`${selectedPlan?.frequency_per_week}x/sem`}
          icon={<Calendar className="w-5 h-5" />}
          color="zinc"
        />
        <StatCard
          label="Duração"
          value={`${selectedPlan?.duration_weeks} sem`}
          icon={<Timer className="w-5 h-5" />}
          color="zinc"
        />
        <StatCard
          label="Divisão"
          value={selectedPlan?.split_type || '-'}
          icon={<Dumbbell className="w-5 h-5" />}
          color="zinc"
        />
      </div>

      {/* Today's Training Highlight */}
      {todaysTraining && (
        <Card className="bg-lime-500 text-black p-6 border-none">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black text-white flex items-center justify-center rounded-xl">
                <span className="text-2xl font-bold">{todaysTraining.day_letter}</span>
              </div>
              <div>
                <div className="text-sm font-bold tracking-wider">TREINO DE HOJE • {DAY_NAMES[todayDayOfWeek].toUpperCase()}</div>
                <div className="text-2xl font-bold">{todaysTraining.day_name}</div>
                {todaysTraining.focus_muscles && (
                  <Badge className="bg-black/20 text-black mt-1">Foco: {todaysTraining.focus_muscles}</Badge>
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
            className="flex items-center gap-2 bg-black text-white px-6 py-3 font-bold tracking-wider hover:bg-zinc-800 transition-colors rounded-lg"
          >
            <Play className="w-5 h-5" />
            {expandedDays.has(todaysTraining.id) ? 'OCULTAR EXERCÍCIOS' : 'VER EXERCÍCIOS'}
          </button>
        </Card>
      )}

      {/* Weekly Schedule */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-6 py-4 bg-zinc-900 text-white rounded-t-2xl">
          <h2 className="text-xl font-bold tracking-wider">PROGRAMAÇÃO SEMANAL</h2>
        </div>
        
        <div className="divide-y divide-zinc-200">
          {trainingDays.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="Nenhum dia configurado"
              description="Seu treinador ainda não configurou os dias de treino."
            />
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
                    <div className={`w-12 h-12 flex items-center justify-center font-bold text-xl rounded-xl ${isToday ? 'bg-lime-500 text-black' : 'bg-black text-white'}`}>
                      {day.day_letter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-lg">{day.day_name}</span>
                        {isToday && (
                          <Badge variant="success">HOJE</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-sm text-zinc-500 flex-wrap">
                        <span>{DAY_NAMES[day.day_of_week]}</span>
                        {day.focus_muscles && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <Badge variant="info" className="text-xs">{day.focus_muscles}</Badge>
                          </>
                        )}
                        <span className="hidden sm:inline">•</span>
                        <span>{dayExercises.length} exercícios</span>
                        {day.estimated_duration && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">~{day.estimated_duration} min</span>
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
                              <div className="w-10 h-10 bg-lime-500 text-black flex items-center justify-center font-bold flex-shrink-0 rounded-lg">
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-2">
                                  <div>
                                    <h4 className="font-bold text-lg">{ex.name}</h4>
                                    <div className="flex items-center gap-2 text-sm flex-wrap mt-1">
                                      <Badge variant="secondary">
                                        {MUSCLE_GROUPS[ex.muscle_group] || ex.muscle_group}
                                      </Badge>
                                      {ex.technique && ex.technique !== 'normal' && (
                                        <Badge variant="warning">
                                          {TECHNIQUES[ex.technique] || ex.technique}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {ex.video_url && (
                                    <a 
                                      href={ex.video_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 px-3 py-1.5 bg-black text-white text-sm font-bold hover:bg-lime-500 hover:text-black transition-colors rounded-lg"
                                    >
                                      <Video className="w-4 h-4" />
                                      VÍDEO
                                    </a>
                                  )}
                                </div>

                                {/* Exercise Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
                                  <div className="bg-white p-2 border border-zinc-200 rounded-lg">
                                    <div className="text-zinc-500 text-xs">Séries</div>
                                    <div className="font-bold">{ex.sets}x</div>
                                  </div>
                                  <div className="bg-white p-2 border border-zinc-200 rounded-lg">
                                    <div className="text-zinc-500 text-xs">Repetições</div>
                                    <div className="font-bold">{ex.reps}</div>
                                  </div>
                                  {ex.weight && (
                                    <div className="bg-white p-2 border border-zinc-200 rounded-lg">
                                      <div className="text-zinc-500 text-xs">Carga</div>
                                      <div className="font-bold">{ex.weight}</div>
                                    </div>
                                  )}
                                  <div className="bg-white p-2 border border-zinc-200 rounded-lg">
                                    <div className="text-zinc-500 text-xs">Descanso</div>
                                    <div className="font-bold">{ex.rest_seconds}s</div>
                                  </div>
                                  {ex.tempo && (
                                    <div className="bg-white p-2 border border-zinc-200 rounded-lg">
                                      <div className="text-zinc-500 text-xs">Cadência</div>
                                      <div className="font-bold">{ex.tempo}</div>
                                    </div>
                                  )}
                                  {ex.rpe && (
                                    <div className="bg-white p-2 border border-zinc-200 rounded-lg">
                                      <div className="text-zinc-500 text-xs">RPE</div>
                                      <div className="font-bold">{ex.rpe}</div>
                                    </div>
                                  )}
                                </div>

                                {ex.notes && (
                                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 text-sm rounded-lg">
                                    <strong>💡 Observações:</strong> {ex.notes}
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
      </Card>

      {/* Coach Info */}
      <Card className="bg-black text-white p-6 border-none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-zinc-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-zinc-400">Seu Treinador</div>
            <div className="text-xl font-bold">{selectedPlan?.coach_name || 'Não atribuído'}</div>
          </div>
          <button className="px-6 py-3 bg-lime-500 text-black font-bold tracking-wider hover:bg-lime-400 transition-colors rounded-lg w-full sm:w-auto">
            MENSAGEM
          </button>
        </div>
      </Card>
    </div>
  );
}
