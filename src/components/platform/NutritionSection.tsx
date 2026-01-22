import { useState, useEffect } from 'react';
import { Download, Loader2, Utensils, ChevronDown, ChevronRight, Apple, Droplets, Target, Flame, Beef, Wheat, CircleDot } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, StatCard } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

const API_URL = '/api';

interface NutritionSectionProps {
  athleteId?: number;
  primaryColor?: string;
}

// Helper function to convert hex color to RGB
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [132, 204, 22]; // Default lime-500
};

interface NutritionPlan {
  id: number;
  athlete_id: number;
  nutritionist_id: number;
  name: string;
  description: string;
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  start_date: string;
  end_date: string;
  status: string;
  nutritionist_name: string;
  meals?: Meal[];
}

interface Meal {
  id: number;
  plan_id: number;
  name: string;
  time: string;
  description: string;
  order_index: number;
  foods?: MealFood[];
  options?: MealOption[];
}

interface MealFood {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes: string;
  option_group: number;
}

interface MealOption {
  optionNumber: number;
  label: string;
  foods: MealFood[];
}

export function NutritionSection({ athleteId, primaryColor = '#84CC16' }: NutritionSectionProps) {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [expandedMeals, setExpandedMeals] = useState<Set<number>>(new Set());
  const [selectedOption, setSelectedOption] = useState<Record<number, number>>({});

  useEffect(() => {
    if (athleteId) {
      loadNutritionPlan();
    }
  }, [athleteId]);

  const loadNutritionPlan = async () => {
    try {
      // Buscar planos do atleta
      const plansRes = await fetch(`${API_URL}/nutrition-plans?athlete_id=${athleteId}`);
      const plans = await plansRes.json();
      
      // Pegar o plano ativo
      const activePlan = plans.find((p: NutritionPlan) => p.status === 'active') || plans[0];
      
      if (activePlan) {
        // Buscar plano completo com refeições e alimentos
        const completeRes = await fetch(`${API_URL}/nutrition-plans/${activePlan.id}/complete`);
        const completeData = await completeRes.json();
        setPlan(completeData);
        
        // Expandir todas as refeições por padrão
        if (completeData.meals) {
          setExpandedMeals(new Set(completeData.meals.map((m: Meal) => m.id)));
        }
      }
    } catch (error) {
      console.error('Error loading nutrition plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMealExpand = (mealId: number) => {
    const newExpanded = new Set(expandedMeals);
    if (newExpanded.has(mealId)) {
      newExpanded.delete(mealId);
    } else {
      newExpanded.add(mealId);
    }
    setExpandedMeals(newExpanded);
  };

  const getOptionGroups = (foods: MealFood[] | undefined): Record<number, MealFood[]> => {
    if (!foods) return {};
    const groups: Record<number, MealFood[]> = {};
    foods.forEach(food => {
      const group = food.option_group || 0;
      if (!groups[group]) groups[group] = [];
      groups[group].push(food);
    });
    return groups;
  };

  const getSelectedOptionForMeal = (mealId: number) => selectedOption[mealId] ?? 0;

  const calculateMealTotals = (foods: MealFood[], optionGroup: number = 0) => {
    const filteredFoods = foods.filter(f => (f.option_group || 0) === optionGroup);
    return filteredFoods.reduce((acc, food) => ({
      calories: acc.calories + (Number(food.calories) || 0),
      protein: acc.protein + (Number(food.protein) || 0),
      carbs: acc.carbs + (Number(food.carbs) || 0),
      fat: acc.fat + (Number(food.fat) || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  // Helper to format quantity - remove unnecessary decimals
  const formatQuantity = (qty: number | string): string => {
    const num = typeof qty === 'string' ? parseFloat(qty) : qty;
    if (isNaN(num)) return String(qty);
    if (Number.isInteger(num)) {
      return num.toString();
    }
    // Remove trailing zeros after decimal
    return parseFloat(num.toFixed(2)).toString();
  };

  const downloadPDF = async () => {
    if (!plan) return;

    // Fetch current branding from consultancy
    let brandColor: [number, number, number] = hexToRgb(primaryColor);
    if (athleteId) {
      try {
        const brandingRes = await fetch(`${API_URL}/consultancy/branding/athlete/${athleteId}`);
        const branding = await brandingRes.json();
        if (branding.primary_color) {
          brandColor = hexToRgb(branding.primary_color);
        }
      } catch (e) {
        console.error('Error fetching branding:', e);
      }
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);
    
    // Helper to check if we need new page
    const checkNewPage = (neededHeight: number, currentY: number): number => {
      if (currentY + neededHeight > pageHeight - 20) {
        doc.addPage();
        return 20;
      }
      return currentY;
    };
    
    // === HEADER ===
    let yPos = 15;
    
    // Top accent bar
    doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.rect(0, 0, pageWidth, 6, 'F');
    
    // Plan name
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(plan.name.toUpperCase(), margin, yPos + 10);
    
    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Seu plano alimentar personalizado', margin, yPos + 18);
    
    yPos += 28;
    
    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 10;
    
    // === MEALS ===
    plan.meals?.forEach((meal) => {
      const mealFoods = meal.foods || [];
      const optionGroups = getOptionGroups(mealFoods);
      const availableOptions = Object.keys(optionGroups).map(Number).sort((a, b) => a - b);
      
      // Estimate height for this meal
      let totalFoods = 0;
      availableOptions.forEach(opt => {
        totalFoods += (optionGroups[opt] || []).length;
      });
      const headerHeight = 20;
      const rowHeight = 10;
      const tableHeight = 12 + (totalFoods * rowHeight);
      const totalNeeded = headerHeight + tableHeight + 15;
      
      // Check if we need new page
      yPos = checkNewPage(totalNeeded, yPos);
      
      // Meal header
      doc.setFillColor(0, 0, 0);
      doc.roundedRect(margin, yPos, 28, 16, 3, 3, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.text(meal.time?.substring(0, 5) || '--:--', margin + 5, yPos + 11);
      
      // Meal name
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(meal.name, margin + 34, yPos + 11);
      
      yPos += 22;
      
      // Options/foods for this meal
      availableOptions.forEach((optNum) => {
        const foods = optionGroups[optNum] || [];
        if (foods.length === 0) return;
        
        // Check for page break
        const optTableHeight = 12 + (foods.length * 10);
        yPos = checkNewPage(optTableHeight + 15, yPos);
        
        // Option label (if multiple options)
        if (availableOptions.length > 1) {
          const isMain = optNum === 0;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          if (isMain) {
            doc.setTextColor(22, 101, 52);
            doc.text('OPÇÃO PRINCIPAL', margin, yPos);
          } else {
            doc.setTextColor(154, 52, 18);
            doc.text(`OU SUBSTITUA POR`, margin, yPos);
          }
          yPos += 8;
        }
        
        // Simple table: just food name and quantity
        const tableData = foods.map(food => [
          food.name,
          `${formatQuantity(food.quantity)} ${food.unit}`
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['ALIMENTO', 'QUANTIDADE']],
          body: tableData,
          theme: 'plain',
          headStyles: {
            fillColor: brandColor as [number, number, number],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: 4
          },
          bodyStyles: {
            fontSize: 11,
            cellPadding: 4,
            textColor: [30, 30, 30],
            lineColor: [240, 240, 240],
            lineWidth: 0.3
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          },
          columnStyles: {
            0: { cellWidth: contentWidth * 0.65, fontStyle: 'bold' },
            1: { cellWidth: contentWidth * 0.35, halign: 'right' }
          },
          margin: { left: margin, right: margin },
          tableWidth: contentWidth
        });
        
        yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
      });
      
      // Gap between meals
      yPos += 8;
    });
    
    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(`${plan.name} • Gerado em ${new Date().toLocaleDateString('pt-BR')}`, margin, pageHeight - 10);
      doc.text(`${i}/${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    doc.save(`plano-nutricional-${plan.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">NUTRIÇÃO</span>
          </h1>
        </div>
        <EmptyState
          icon="nutrition"
          title="Nenhum plano nutricional"
          description="Seu nutricionista ainda não criou um plano para você."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">NUTRIÇÃO</span>
          </h1>
          <p className="text-xl text-zinc-600">{plan.name}</p>
          {plan.nutritionist_name && (
            <p className="text-sm text-zinc-500 mt-1">Nutricionista: {plan.nutritionist_name}</p>
          )}
        </div>
        <button 
          onClick={downloadPDF}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-lime-500 hover:text-black transition-colors"
        >
          <Download className="w-5 h-5" />
          <span className="font-bold tracking-wider">BAIXAR PDF</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Meta Calórica"
          value={`${plan.daily_calories} kcal`}
          icon={<Flame className="w-5 h-5" />}
          color="lime"
          subtitle="Por dia"
        />
        <StatCard
          label="Proteína"
          value={`${plan.protein_grams}g`}
          icon={<Beef className="w-5 h-5" />}
          color="red"
          subtitle={`${plan.protein_grams && plan.daily_calories ? Math.round((plan.protein_grams * 4 / plan.daily_calories) * 100) : 0}% das calorias`}
        />
        <StatCard
          label="Carboidratos"
          value={`${plan.carbs_grams}g`}
          icon={<Wheat className="w-5 h-5" />}
          color="orange"
          subtitle={`${plan.carbs_grams && plan.daily_calories ? Math.round((plan.carbs_grams * 4 / plan.daily_calories) * 100) : 0}% das calorias`}
        />
        <StatCard
          label="Gorduras"
          value={`${plan.fat_grams}g`}
          icon={<CircleDot className="w-5 h-5" />}
          color="blue"
          subtitle={`${plan.fat_grams && plan.daily_calories ? Math.round((plan.fat_grams * 9 / plan.daily_calories) * 100) : 0}% das calorias`}
        />
      </div>

      {/* Meals */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Suas Refeições</h2>
        
        {plan.meals?.length === 0 ? (
          <EmptyState
            icon="nutrition"
            title="Nenhuma refeição cadastrada"
            description="Seu nutricionista ainda não adicionou refeições neste plano."
          />
        ) : (
          plan.meals?.map((meal) => {
            const currentOption = getSelectedOptionForMeal(meal.id);
            const totals = meal.foods ? calculateMealTotals(meal.foods, currentOption) : { calories: 0, protein: 0, carbs: 0, fat: 0 };
            
            return (
              <Card key={meal.id} padding="none" className="overflow-hidden">
                {/* Meal Header */}
                <div 
                  className="flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-zinc-50 transition-colors"
                  onClick={() => toggleMealExpand(meal.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-lime-500 rounded-xl flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold">{meal.name}</h3>
                      <Badge variant="secondary" className="mt-1">{meal.time?.substring(0, 5) || '--:--'}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right hidden sm:block">
                      <div className="font-bold text-lg">{Math.round(totals.calories)} kcal</div>
                      <div className="text-sm text-zinc-500">{Math.round(totals.protein)}g P • {Math.round(totals.carbs)}g C • {Math.round(totals.fat)}g G</div>
                    </div>
                    {expandedMeals.has(meal.id) ? (
                      <ChevronDown className="w-6 h-6 text-zinc-400" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>
                </div>

                {/* Meal Options */}
                {expandedMeals.has(meal.id) && meal.foods && (
                  <div className="border-t border-zinc-100 px-4 sm:px-6 pb-6">
                    {(() => {
                      const optionGroups = getOptionGroups(meal.foods);
                      const availableOptions = Object.keys(optionGroups).map(Number).sort((a, b) => a - b);
                      const currentOption = getSelectedOptionForMeal(meal.id);
                      const currentFoods = optionGroups[currentOption] || [];
                      
                      return (
                        <>
                          {/* Selector de Opção */}
                          {availableOptions.length > 1 && (
                            <div className="py-4 border-b border-zinc-100">
                              <div className="text-sm font-bold text-zinc-500 mb-2">ESCOLHA UMA OPÇÃO:</div>
                              <div className="flex flex-wrap gap-2">
                                {availableOptions.map(optNum => {
                                  const isSelected = currentOption === optNum;
                                  const isMain = optNum === 0;
                                  return (
                                    <button
                                      key={optNum}
                                      onClick={() => setSelectedOption({ ...selectedOption, [meal.id]: optNum })}
                                      className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                                        isSelected
                                          ? isMain ? 'bg-lime-500 text-black' : 'bg-orange-500 text-white'
                                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                      }`}
                                    >
                                      {isMain ? '🍽️ Principal' : `🔄 Substituição ${optNum}`}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Alimentos da opção selecionada */}
                          <div className="divide-y divide-zinc-100">
                            {currentFoods.map((food) => (
                              <div key={food.id} className="py-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-lg">{food.name}</span>
                                      <span className="text-zinc-500">({formatQuantity(food.quantity)} {food.unit})</span>
                                    </div>
                                    <div className="text-sm text-zinc-600 mt-1">
                                      <span className="font-semibold">{Math.round(Number(food.calories))}</span> kcal
                                      <span className="mx-2">•</span>
                                      <span className="text-red-600">{Math.round(Number(food.protein))}g P</span>
                                      <span className="mx-2">•</span>
                                      <span className="text-yellow-600">{Math.round(Number(food.carbs))}g C</span>
                                      <span className="mx-2">•</span>
                                      <span className="text-blue-600">{Math.round(Number(food.fat))}g G</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Meal Total */}
                          <div className="mt-4 pt-4 border-t-2 border-lime-500 flex justify-between items-center">
                            <span className="font-bold">TOTAL DA REFEIÇÃO</span>
                            <span className="font-bold text-lg">
                              {Math.round(totals.calories)} kcal • {Math.round(totals.protein)}g P • {Math.round(totals.carbs)}g C • {Math.round(totals.fat)}g G
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold">Hidratação</h3>
          </div>
          <p className="text-zinc-600 mb-3">
            Mantenha-se hidratado ao longo do dia. A recomendação é de pelo menos 35ml de água por kg de peso corporal.
          </p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <span className="text-blue-700 font-bold">💧 Dica:</span>
            <span className="text-blue-600 ml-2">Beba água antes das refeições para ajudar na digestão.</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-lime-100 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-lime-500" />
            </div>
            <h3 className="text-lg font-bold">Consistência</h3>
          </div>
          <p className="text-zinc-600 mb-3">
            Tente manter os horários das refeições consistentes. Isso ajuda seu metabolismo a funcionar de forma otimizada.
          </p>
          <div className="bg-lime-50 p-3 rounded-lg">
            <span className="text-lime-700 font-bold">🎯 Dica:</span>
            <span className="text-lime-600 ml-2">Use as substituições quando precisar variar o cardápio.</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
