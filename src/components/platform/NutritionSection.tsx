import { useState, useEffect } from 'react';
import { Download, Loader2, Utensils, ChevronDown, ChevronRight, Apple, Droplets, Target } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = '/api';

interface NutritionSectionProps {
  athleteId?: number;
}

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

export function NutritionSection({ athleteId }: NutritionSectionProps) {
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

  const downloadPDF = () => {
    if (!plan) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(132, 204, 22); // lime-500
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PLANO NUTRICIONAL', 14, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(plan.name, 14, 30);

    // Macros
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    let yPos = 55;
    
    doc.setFont('helvetica', 'bold');
    doc.text('METAS DIÁRIAS', 14, yPos);
    yPos += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Calorias: ${plan.daily_calories} kcal`, 14, yPos);
    doc.text(`Proteínas: ${plan.protein_grams}g`, 80, yPos);
    doc.text(`Carboidratos: ${plan.carbs_grams}g`, 130, yPos);
    doc.text(`Gorduras: ${plan.fat_grams}g`, 180, yPos);
    
    yPos += 15;

    // Meals
    plan.meals?.forEach((meal) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      // Meal header
      doc.setFillColor(245, 245, 245);
      doc.rect(14, yPos - 5, pageWidth - 28, 10, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`${meal.name} • ${meal.time?.substring(0, 5) || '--:--'}`, 16, yPos + 2);
      yPos += 12;

      // Agrupar alimentos por opção
      const optionGroups = getOptionGroups(meal.foods);
      const availableOptions = Object.keys(optionGroups).map(Number).sort((a, b) => a - b);
      
      availableOptions.forEach((optNum, optIdx) => {
        const foods = optionGroups[optNum] || [];
        if (foods.length === 0) return;
        
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }

        // Option label
        if (availableOptions.length > 1) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          const optLabel = optNum === 0 ? '🍽️ OPÇÃO PRINCIPAL' : `🔄 SUBSTITUIÇÃO ${optNum}`;
          doc.setTextColor(optNum === 0 ? 34 : 194, optNum === 0 ? 139 : 65, optNum === 0 ? 34 : 12);
          doc.text(optLabel, 16, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 6;
        }

        const tableData = foods.map(food => [
          food.name,
          `${food.quantity} ${food.unit}`,
          `${food.calories}`,
          `${food.protein}g`,
          `${food.carbs}g`,
          `${food.fat}g`
        ]);

        // Add totals row
        const totals = calculateMealTotals(foods, optNum);
        tableData.push([
          'TOTAL',
          '',
          `${totals.calories}`,
          `${totals.protein}g`,
          `${totals.carbs}g`,
          `${totals.fat}g`
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Alimento', 'Qtd', 'Kcal', 'P', 'C', 'G']],
          body: tableData,
          theme: 'plain',
          headStyles: { 
            fillColor: optNum === 0 ? [132, 204, 22] : [251, 146, 60], 
            textColor: [255, 255, 255],
            fontSize: 8,
            fontStyle: 'bold'
          },
          bodyStyles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 30 },
            2: { cellWidth: 20 },
            3: { cellWidth: 20 },
            4: { cellWidth: 20 },
            5: { cellWidth: 20 },
          },
          didParseCell: (data) => {
            if (data.row.index === tableData.length - 1) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [132, 204, 22];
            }
          }
        });

        yPos = (doc as any).lastAutoTable.finalY + 8;
      }); // End of availableOptions.forEach

      yPos += 5;
    });

    // Footer
    const today = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Gerado em ${today} • VITAE`, 14, 290);

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
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">NUTRIÇÃO</span>
          </h1>
        </div>
        <div className="bg-white p-12 text-center">
          <Apple className="w-16 h-16 mx-auto text-zinc-300 mb-4" />
          <h3 className="text-xl font-bold mb-2">Nenhum plano nutricional</h3>
          <p className="text-zinc-500">Seu nutricionista ainda não criou um plano para você.</p>
        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 border-l-4 border-lime-500">
          <div className="text-sm tracking-wider text-zinc-600 mb-2">META CALÓRICA</div>
          <div className="text-2xl font-bold">{plan.daily_calories} kcal</div>
          <div className="text-xs text-zinc-500 mt-1">Por dia</div>
        </div>
        <div className="bg-white p-6 border-l-4 border-red-500">
          <div className="text-sm tracking-wider text-zinc-600 mb-2">PROTEÍNA</div>
          <div className="text-2xl font-bold">{plan.protein_grams}g</div>
          <div className="text-xs text-zinc-500 mt-1">
            {plan.protein_grams && plan.daily_calories ? Math.round((plan.protein_grams * 4 / plan.daily_calories) * 100) : 0}% das calorias
          </div>
        </div>
        <div className="bg-white p-6 border-l-4 border-yellow-500">
          <div className="text-sm tracking-wider text-zinc-600 mb-2">CARBOIDRATOS</div>
          <div className="text-2xl font-bold">{plan.carbs_grams}g</div>
          <div className="text-xs text-zinc-500 mt-1">
            {plan.carbs_grams && plan.daily_calories ? Math.round((plan.carbs_grams * 4 / plan.daily_calories) * 100) : 0}% das calorias
          </div>
        </div>
        <div className="bg-white p-6 border-l-4 border-blue-500">
          <div className="text-sm tracking-wider text-zinc-600 mb-2">GORDURAS</div>
          <div className="text-2xl font-bold">{plan.fat_grams}g</div>
          <div className="text-xs text-zinc-500 mt-1">
            {plan.fat_grams && plan.daily_calories ? Math.round((plan.fat_grams * 9 / plan.daily_calories) * 100) : 0}% das calorias
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Suas Refeições</h2>
        
        {plan.meals?.length === 0 ? (
          <div className="bg-white p-8 text-center text-zinc-500">
            Nenhuma refeição cadastrada neste plano ainda.
          </div>
        ) : (
          plan.meals?.map((meal) => {
            const currentOption = getSelectedOptionForMeal(meal.id);
            const totals = meal.foods ? calculateMealTotals(meal.foods, currentOption) : { calories: 0, protein: 0, carbs: 0, fat: 0 };
            
            return (
              <div key={meal.id} className="bg-white overflow-hidden">
                {/* Meal Header */}
                <div 
                  className="flex items-center justify-between p-6 cursor-pointer hover:bg-zinc-50 transition-colors"
                  onClick={() => toggleMealExpand(meal.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-lime-500 rounded-lg flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{meal.name}</h3>
                      <div className="text-sm text-zinc-500">{meal.time?.substring(0, 5) || '--:--'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
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
                  <div className="border-t border-zinc-100 px-6 pb-6">
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
                                      className={`px-4 py-2 text-sm font-bold rounded transition-colors ${
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
                                      <span className="text-zinc-500">({food.quantity} {food.unit})</span>
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
              </div>
            );
          })
        )}
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <Droplets className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-bold">Hidratação</h3>
          </div>
          <p className="text-zinc-600 mb-3">
            Mantenha-se hidratado ao longo do dia. A recomendação é de pelo menos 35ml de água por kg de peso corporal.
          </p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <span className="text-blue-700 font-bold">Dica:</span>
            <span className="text-blue-600 ml-2">Beba água antes das refeições para ajudar na digestão.</span>
          </div>
        </div>

        <div className="bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-lime-500" />
            <h3 className="text-lg font-bold">Consistência</h3>
          </div>
          <p className="text-zinc-600 mb-3">
            Tente manter os horários das refeições consistentes. Isso ajuda seu metabolismo a funcionar de forma otimizada.
          </p>
          <div className="bg-lime-50 p-3 rounded-lg">
            <span className="text-lime-700 font-bold">Dica:</span>
            <span className="text-lime-600 ml-2">Use as substituições quando precisar variar o cardápio.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
