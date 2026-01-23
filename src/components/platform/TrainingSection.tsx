import { useState, useEffect } from 'react';
import { getAuthHeaders } from '../../services/api';
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
import { useToast } from '../ui/Toast';

const API_URL = '/api';

interface TrainingSectionProps {
  athleteId?: number;
  primaryColor?: string;
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

// Helper function to convert hex color to RGB
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [132, 204, 22]; // Default lime-500
};

export function TrainingSection({ athleteId, primaryColor = '#84CC16' }: TrainingSectionProps) {
  const toast = useToast();
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
      const response = await fetch(`${API_URL}/training-plans?athlete_id=${athleteId}`, { headers: getAuthHeaders() });
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
      const response = await fetch(`${API_URL}/training-days?plan_id=${planId}`, { headers: getAuthHeaders() });
      const data: TrainingDay[] = await response.json();
      setTrainingDays(data);
      
      // Load all exercises for all days
      const exercisesMap: Record<number, TrainingExercise[]> = {};
      for (const day of data) {
        const exRes = await fetch(`${API_URL}/training-exercises?day_id=${day.id}`, { headers: getAuthHeaders() });
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
      // Fetch current branding from consultancy
      let brandColor: [number, number, number] = hexToRgb(primaryColor);
      let logoUrl: string | null = null;
      if (athleteId) {
        try {
          const brandingRes = await fetch(`${API_URL}/consultancy/branding/athlete/${athleteId}`, { headers: getAuthHeaders() });
          const branding = await brandingRes.json();
          if (branding.primary_color) {
            brandColor = hexToRgb(branding.primary_color);
          }
          if (branding.logo_url) {
            logoUrl = branding.logo_url;
          }
        } catch (e) {
          console.error('Error fetching branding:', e);
        }
      }
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;
      const contentWidth = pageWidth - (margin * 2);
      
      // Helper to check if we need new page
      const checkNewPage = (neededHeight: number, currentY: number): number => {
        if (currentY + neededHeight > pageHeight - 20) {
          doc.addPage();
          return 15;
        }
        return currentY;
      };

      // Helper to load image as base64
      const loadImageAsBase64 = (url: string): Promise<string | null> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
              } else {
                resolve(null);
              }
            } catch {
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
          img.src = url;
        });
      };
      
      // === HEADER (compact) ===
      let yPos = 12;
      
      // Top accent bar
      doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.rect(0, 0, pageWidth, 4, 'F');

      // Add logo if available (positioned in the top-right corner)
      const logoSize = 14;
      let logoSpace = 0;
      if (logoUrl) {
        try {
          const logoData = logoUrl.startsWith('data:') ? logoUrl : await loadImageAsBase64(logoUrl);
          if (logoData) {
            doc.addImage(logoData, 'PNG', pageWidth - margin - logoSize, yPos - 4, logoSize, logoSize);
            logoSpace = logoSize + 4; // Space for the logo
          }
        } catch (e) {
          console.error('Error adding logo to PDF:', e);
        }
      }
      
      // Plan name + info on same line
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(selectedPlan.name.toUpperCase(), margin, yPos + 8);
      
      // Info inline (adjust position if logo exists)
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const infoText = `${OBJECTIVES[selectedPlan.objective] || selectedPlan.objective} • ${selectedPlan.duration_weeks} sem • ${selectedPlan.frequency_per_week}x/sem • ${selectedPlan.split_type || '-'}`;
      doc.text(infoText, pageWidth - margin - logoSpace, yPos + 8, { align: 'right' });
      
      yPos += 16;
      
      // Separator line
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      
      yPos += 6;
      
      // === TRAINING DAYS (compact, flowing) ===
      for (let dayIndex = 0; dayIndex < trainingDays.length; dayIndex++) {
        const day = trainingDays[dayIndex];
        const dayExercises = exercises[day.id] || [];
        
        // Estimate height needed for this day
        const headerHeight = 14;
        const rowHeight = 7;
        const tableHeight = headerHeight + (dayExercises.length * rowHeight) + 4;
        const totalNeeded = 18 + tableHeight;
        
        // Check if we need new page
        yPos = checkNewPage(totalNeeded, yPos);
        
        // Day header (compact)
        doc.setFillColor(0, 0, 0);
        doc.roundedRect(margin, yPos, 14, 14, 2, 2, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
        doc.text(day.day_letter, margin + 4, yPos + 10);
        
        // Day name
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(day.day_name || DAY_NAMES[day.day_of_week], margin + 18, yPos + 6);
        
        // Focus muscles (inline)
        if (day.focus_muscles) {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(120, 120, 120);
          doc.text(`Foco: ${day.focus_muscles}`, margin + 18, yPos + 12);
        }
        
        yPos += 18;
        
        if (dayExercises.length > 0) {
          // Compact table with video link column
          const tableData = dayExercises.map((ex, idx) => [
            (idx + 1).toString(),
            ex.name,
            MUSCLE_GROUPS[ex.muscle_group] || ex.muscle_group,
            `${ex.sets}x${ex.reps}`,
            ex.weight || '-',
            `${ex.rest_seconds}s`,
            ex.tempo || '-',
            ex.technique !== 'normal' ? TECHNIQUES[ex.technique] : '-',
            ex.video_url ? 'Ver vídeo' : '-'
          ]);
          
          autoTable(doc, {
            startY: yPos,
            head: [['#', 'EXERCÍCIO', 'MÚSCULO', 'SÉRIES', 'CARGA', 'DESC.', 'TEMPO', 'TÉCNICA', 'DEMO']],
            body: tableData,
            theme: 'plain',
            headStyles: {
              fillColor: brandColor as [number, number, number],
              textColor: [0, 0, 0],
              fontStyle: 'bold',
              fontSize: 6,
              cellPadding: 2
            },
            bodyStyles: {
              fontSize: 8,
              cellPadding: 2,
              textColor: [40, 40, 40],
              lineColor: [245, 245, 245],
              lineWidth: 0.2
            },
            alternateRowStyles: {
              fillColor: [252, 252, 252]
            },
            columnStyles: {
              0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
              1: { cellWidth: 50, fontStyle: 'bold' },
              2: { cellWidth: 24 },
              3: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
              4: { cellWidth: 16, halign: 'center' },
              5: { cellWidth: 12, halign: 'center' },
              6: { cellWidth: 16, halign: 'center' },
              7: { cellWidth: 20 },
              8: { cellWidth: 22, halign: 'center' }
            },
            margin: { left: margin, right: margin },
            tableWidth: contentWidth,
            didParseCell: (data) => {
              // Highlight technique column
              if (data.column.index === 7 && data.cell.raw !== '-' && data.section === 'body') {
                data.cell.styles.textColor = brandColor;
                data.cell.styles.fontStyle = 'bold';
              }
              // Style video link column
              if (data.column.index === 8 && data.cell.raw !== '-' && data.section === 'body') {
                data.cell.styles.textColor = [59, 130, 246]; // blue
                data.cell.styles.fontStyle = 'bold';
              }
            },
            didDrawCell: (data) => {
              // Add clickable link for video column
              if (data.column.index === 8 && data.section === 'body' && data.row.index < dayExercises.length) {
                const exercise = dayExercises[data.row.index];
                if (exercise.video_url) {
                  doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: exercise.video_url });
                }
              }
            }
          });
          
          yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
        } else {
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text('Nenhum exercício cadastrado', margin + 18, yPos);
          yPos += 10;
        }
        
        // Small gap between days
        yPos += 4;
      }
      
      // Footer on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text(`${selectedPlan.name} • Gerado em ${new Date().toLocaleDateString('pt-BR')}`, margin, pageHeight - 8);
        doc.text(`${i}/${pageCount}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
      }
      
      // Download
      doc.save(`treino-${selectedPlan.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
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
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mb-1 sm:mb-2">
            <span className="text-lime-500">TREINAMENTO</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-zinc-600">
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mb-1 sm:mb-2">
            <span className="text-lime-500">TREINAMENTO</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-zinc-600">
            Seu programa de treino personalizado
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
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
              className="px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none font-bold rounded-lg text-sm sm:text-base"
            >
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={generatePDF}
            disabled={generatingPdf}
            className="flex items-center justify-center gap-2 bg-black text-white px-4 sm:px-6 py-3 font-bold tracking-wider hover:bg-zinc-800 transition-colors disabled:opacity-50 rounded-lg text-sm sm:text-base"
          >
            {generatingPdf ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span className="whitespace-nowrap">BAIXAR PDF</span>
          </button>
        </div>
      </div>

      {/* Plan Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
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
        <Card className="bg-lime-500 text-black p-4 sm:p-6 border-none">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black text-white flex items-center justify-center rounded-xl flex-shrink-0">
                <span className="text-xl sm:text-2xl font-bold">{todaysTraining.day_letter}</span>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold tracking-wider">TREINO DE HOJE • {DAY_NAMES[todayDayOfWeek].toUpperCase()}</div>
                <div className="text-xl sm:text-2xl font-bold">{todaysTraining.day_name}</div>
                {todaysTraining.focus_muscles && (
                  <Badge className="bg-black/20 text-black mt-1 text-xs">Foco: {todaysTraining.focus_muscles}</Badge>
                )}
              </div>
            </div>
            <div className="text-left sm:text-right flex sm:block items-center gap-2">
              <div className="text-2xl sm:text-3xl font-bold">{todaysExercises.length}</div>
              <div className="text-sm">exercícios</div>
            </div>
          </div>
          <button 
            onClick={() => toggleDay(todaysTraining.id)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-4 sm:px-6 py-3 font-bold tracking-wider hover:bg-zinc-800 transition-colors rounded-lg text-sm sm:text-base"
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
      <Card className="bg-black text-white p-4 sm:p-6 border-none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 sm:w-8 sm:h-8 text-zinc-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs sm:text-sm text-zinc-400">Seu Treinador</div>
            <div className="text-lg sm:text-xl font-bold truncate">{selectedPlan?.coach_name || 'Não atribuído'}</div>
          </div>
          <button className="px-4 sm:px-6 py-3 bg-lime-500 text-black font-bold tracking-wider hover:bg-lime-400 transition-colors rounded-lg w-full sm:w-auto text-sm sm:text-base">
            MENSAGEM
          </button>
        </div>
      </Card>
    </div>
  );
}
