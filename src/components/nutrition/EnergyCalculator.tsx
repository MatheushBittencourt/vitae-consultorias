/**
 * Calculadora de Necessidades Energéticas
 * 
 * Calcula TMB (Taxa Metabólica Basal), GET (Gasto Energético Total)
 * e VET (Valor Energético Total) com distribuição de macronutrientes.
 */

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, StatCard } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  Calculator, Save, Zap, Flame, Beef, Wheat, Droplet,
  Target, TrendingUp, TrendingDown, Minus, Info
} from 'lucide-react';
import api from '../../services/api';

interface EnergyCalculatorProps {
  athleteId: number;
  nutritionistId: number;
  athleteName: string;
  initialWeight?: number;
  initialHeight?: number;
  initialAge?: number;
  initialSex?: 'male' | 'female';
  initialLeanMass?: number;
  onSave?: () => void;
}

interface CalculationResult {
  bmr: number;
  tdee: number;
  vet: number;
  macros: {
    protein: { grams: number; calories: number; percentage: number; perKg: number };
    carbs: { grams: number; calories: number; percentage: number; perKg: number };
    fat: { grams: number; calories: number; percentage: number; perKg: number };
  };
  water: number;
  fiber: number;
}

interface ExistingEnergyData {
  weight: number;
  height: number;
  age: number;
  sex: 'male' | 'female';
  activity_level: string;
  bmr_formula: 'harris_benedict' | 'mifflin_st_jeor' | 'katch_mcardle';
  caloric_adjustment: number;
  bmr_value: number;
  tdee_value: number;
  vet_value: number;
  protein_grams: number;
  protein_calories: number;
  protein_percentage: number;
  protein_per_kg: number;
  carbs_grams: number;
  carbs_calories: number;
  carbs_percentage: number;
  carbs_per_kg: number;
  fat_grams: number;
  fat_calories: number;
  fat_percentage: number;
  fat_per_kg: number;
  water_liters: number;
  fiber_grams: number;
}

export function EnergyCalculator({
  athleteId,
  nutritionistId,
  athleteName,
  initialWeight = 70,
  initialHeight = 170,
  initialAge = 30,
  initialSex = 'male',
  initialLeanMass,
  onSave,
}: EnergyCalculatorProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  
  // Inputs do formulário
  const [weight, setWeight] = useState(initialWeight);
  const [height, setHeight] = useState(initialHeight);
  const [age, setAge] = useState(initialAge);
  const [sex, setSex] = useState<'male' | 'female'>(initialSex);
  const [leanMass, setLeanMass] = useState<number | undefined>(initialLeanMass);
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goal, setGoal] = useState<'maintenance' | 'weight_loss' | 'muscle_gain' | 'athletic_performance'>('maintenance');
  const [bmrFormula, setBmrFormula] = useState<'harris_benedict' | 'mifflin_st_jeor' | 'katch_mcardle'>('mifflin_st_jeor');
  const [caloricAdjustment, setCaloricAdjustment] = useState(0);
  
  // Resultado do cálculo
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Opções
  const activityLevels = [
    { value: 'sedentary', label: 'Sedentário', description: 'Pouco ou nenhum exercício', factor: 1.2 },
    { value: 'light', label: 'Leve', description: '1-2x por semana', factor: 1.375 },
    { value: 'moderate', label: 'Moderado', description: '3-4x por semana', factor: 1.55 },
    { value: 'active', label: 'Ativo', description: '5-6x por semana', factor: 1.725 },
    { value: 'very_active', label: 'Muito Ativo', description: 'Exercício intenso diário', factor: 1.9 },
    { value: 'athlete', label: 'Atleta', description: '2x treinos/dia', factor: 2.0 },
  ];

  const goals = [
    { value: 'weight_loss', label: 'Perda de peso', icon: TrendingDown, color: 'text-red-500' },
    { value: 'maintenance', label: 'Manutenção', icon: Minus, color: 'text-zinc-500' },
    { value: 'muscle_gain', label: 'Ganho muscular', icon: TrendingUp, color: 'text-green-500' },
    { value: 'athletic_performance', label: 'Performance', icon: Zap, color: 'text-blue-500' },
  ];

  const bmrFormulas = [
    { 
      value: 'mifflin_st_jeor', 
      label: 'Mifflin-St Jeor', 
      description: 'Mais precisa para a maioria das pessoas' 
    },
    { 
      value: 'harris_benedict', 
      label: 'Harris-Benedict', 
      description: 'Fórmula clássica, revisada em 1984' 
    },
    { 
      value: 'katch_mcardle', 
      label: 'Katch-McArdle', 
      description: 'Usa massa magra (mais precisa se disponível)' 
    },
  ];

  // Carregar dados existentes
  useEffect(() => {
    loadExisting();
  }, [athleteId]);

  const loadExisting = async () => {
    try {
      const response = await api.get<ExistingEnergyData | null>(`/nutrition-advanced/energy-requirements/${athleteId}`);
      if (response.data) {
        const data = response.data as ExistingEnergyData;
        setHasExisting(true);
        // Preencher formulário com dados existentes
        setWeight(data.weight);
        setHeight(data.height);
        setAge(data.age);
        setSex(data.sex);
        setActivityLevel(data.activity_level);
        setBmrFormula(data.bmr_formula);
        setCaloricAdjustment(data.caloric_adjustment || 0);
        
        // Definir resultado
        setResult({
          bmr: data.bmr_value,
          tdee: data.tdee_value,
          vet: data.vet_value,
          macros: {
            protein: {
              grams: data.protein_grams,
              calories: data.protein_calories,
              percentage: data.protein_percentage,
              perKg: data.protein_per_kg,
            },
            carbs: {
              grams: data.carbs_grams,
              calories: data.carbs_calories,
              percentage: data.carbs_percentage,
              perKg: data.carbs_per_kg,
            },
            fat: {
              grams: data.fat_grams,
              calories: data.fat_calories,
              percentage: data.fat_percentage,
              perKg: data.fat_per_kg,
            },
          },
          water: data.water_liters,
          fiber: data.fiber_grams,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados existentes:', error);
    }
  };

  // Calcular preview em tempo real
  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await api.post<CalculationResult>('/nutrition-advanced/energy-requirements/preview', {
        weight,
        height,
        age,
        sex,
        activity_level: activityLevel,
        goal,
        bmr_formula: bmrFormula,
        caloric_adjustment: caloricAdjustment,
        lean_mass: leanMass,
      });
      setResult(response.data as CalculationResult);
    } catch (error) {
      console.error('Erro ao calcular:', error);
    } finally {
      setLoading(false);
    }
  };

  // Salvar cálculo
  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/nutrition-advanced/energy-requirements/calculate', {
        athlete_id: athleteId,
        nutritionist_id: nutritionistId,
        weight,
        height,
        age,
        sex,
        activity_level: activityLevel,
        goal,
        bmr_formula: bmrFormula,
        caloric_adjustment: caloricAdjustment,
        lean_mass: leanMass,
      });
      setHasExisting(true);
      onSave?.();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar cálculo');
    } finally {
      setSaving(false);
    }
  };

  // Macro chart (gráfico de pizza simples)
  const MacroPieChart = () => {
    if (!result) return null;
    
    const total = result.macros.protein.percentage + result.macros.carbs.percentage + result.macros.fat.percentage;
    let currentAngle = 0;
    
    const segments = [
      { name: 'Proteína', percentage: result.macros.protein.percentage, color: '#ef4444' },
      { name: 'Carboidrato', percentage: result.macros.carbs.percentage, color: '#f59e0b' },
      { name: 'Gordura', percentage: result.macros.fat.percentage, color: '#3b82f6' },
    ];

    return (
      <div className="flex items-center justify-center gap-8">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {segments.map((seg, index) => {
              const angle = (seg.percentage / 100) * 360;
              const startAngle = currentAngle;
              currentAngle += angle;
              
              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
              
              const largeArc = angle > 180 ? 1 : 0;
              
              return (
                <path
                  key={seg.name}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={seg.color}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-zinc-900">{result.vet}</p>
              <p className="text-xs text-zinc-500">kcal/dia</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {segments.map(seg => (
            <div key={seg.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-sm text-zinc-600">{seg.name}</span>
              <span className="text-sm font-semibold text-zinc-900">{seg.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900">Calculadora de Necessidades Energéticas</h2>
        <p className="text-zinc-500 mt-1">Paciente: {athleteName}</p>
        {hasExisting && (
          <Badge variant="success" className="mt-2">Cálculo existente encontrado</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="space-y-6">
          {/* Dados básicos */}
          <Card className="p-6">
            <CardHeader 
              title="Dados do Paciente" 
              icon={<Calculator className="w-5 h-5" />}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Peso</label>
                <div className="relative">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    step={0.1}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">kg</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Altura</label>
                <div className="relative">
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    step={0.1}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">cm</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Idade</label>
                <div className="relative">
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">anos</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Sexo</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as 'male' | 'female')}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                </select>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Massa Magra (opcional)
                  <span className="font-normal text-zinc-400 ml-1">- para Katch-McArdle</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={leanMass || ''}
                    onChange={(e) => setLeanMass(e.target.value ? Number(e.target.value) : undefined)}
                    step={0.1}
                    placeholder="Se disponível"
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">kg</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Fórmula TMB */}
          <Card className="p-6">
            <CardHeader 
              title="Fórmula para TMB" 
              icon={<Flame className="w-5 h-5" />}
            />
            
            <div className="space-y-3">
              {bmrFormulas.map(formula => (
                <label
                  key={formula.value}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    bmrFormula === formula.value
                      ? 'bg-lime-50 border-2 border-lime-500'
                      : 'bg-zinc-50 border-2 border-transparent hover:bg-zinc-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="bmr_formula"
                    value={formula.value}
                    checked={bmrFormula === formula.value}
                    onChange={() => setBmrFormula(formula.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium text-zinc-900">{formula.label}</span>
                    <p className="text-sm text-zinc-500">{formula.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Nível de Atividade */}
          <Card className="p-6">
            <CardHeader 
              title="Nível de Atividade" 
              icon={<Zap className="w-5 h-5" />}
            />
            
            <div className="space-y-2">
              {activityLevels.map(level => (
                <label
                  key={level.value}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    activityLevel === level.value
                      ? 'bg-lime-50 border-2 border-lime-500'
                      : 'bg-zinc-50 border-2 border-transparent hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="activity_level"
                      value={level.value}
                      checked={activityLevel === level.value}
                      onChange={() => setActivityLevel(level.value)}
                    />
                    <div>
                      <span className="font-medium text-zinc-900">{level.label}</span>
                      <p className="text-sm text-zinc-500">{level.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{level.factor}x</Badge>
                </label>
              ))}
            </div>
          </Card>

          {/* Objetivo */}
          <Card className="p-6">
            <CardHeader 
              title="Objetivo" 
              icon={<Target className="w-5 h-5" />}
            />
            
            <div className="grid grid-cols-2 gap-3">
              {goals.map(g => {
                const Icon = g.icon;
                return (
                  <button
                    key={g.value}
                    onClick={() => {
                      setGoal(g.value as any);
                      // Ajustar déficit/superávit automaticamente
                      if (g.value === 'weight_loss') setCaloricAdjustment(-500);
                      else if (g.value === 'muscle_gain') setCaloricAdjustment(300);
                      else setCaloricAdjustment(0);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                      goal === g.value
                        ? 'bg-lime-50 border-2 border-lime-500'
                        : 'bg-zinc-50 border-2 border-transparent hover:bg-zinc-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${g.color}`} />
                    <span className="font-medium text-zinc-900">{g.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Ajuste calórico */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Ajuste Calórico
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={-1000}
                  max={1000}
                  step={50}
                  value={caloricAdjustment}
                  onChange={(e) => setCaloricAdjustment(Number(e.target.value))}
                  className="flex-1"
                />
                <div className={`px-3 py-1 rounded-lg font-semibold ${
                  caloricAdjustment < 0 ? 'bg-red-100 text-red-700' :
                  caloricAdjustment > 0 ? 'bg-green-100 text-green-700' :
                  'bg-zinc-100 text-zinc-700'
                }`}>
                  {caloricAdjustment > 0 ? '+' : ''}{caloricAdjustment} kcal
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {caloricAdjustment < 0 ? 'Déficit para perda de peso' :
                 caloricAdjustment > 0 ? 'Superávit para ganho de massa' :
                 'Manutenção do peso atual'}
              </p>
            </div>
          </Card>

          {/* Botão Calcular */}
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white font-semibold rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <Calculator className="w-5 h-5" />
            {loading ? 'Calculando...' : 'Calcular'}
          </button>
        </div>

        {/* Resultado */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Cards de Resumo */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  label="TMB"
                  value={`${result.bmr} kcal`}
                  icon={<Flame className="w-5 h-5" />}
                  color="orange"
                  subtitle="Taxa Metabólica Basal"
                />
                <StatCard
                  label="GET"
                  value={`${result.tdee} kcal`}
                  icon={<Zap className="w-5 h-5" />}
                  color="blue"
                  subtitle="Gasto Energético Total"
                />
              </div>

              {/* VET com Gráfico */}
              <Card className="p-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-zinc-500 mb-1">Valor Energético Total (VET)</p>
                  <p className="text-5xl font-bold text-zinc-900">{result.vet}</p>
                  <p className="text-lg text-zinc-500">kcal/dia</p>
                </div>
                
                <MacroPieChart />
              </Card>

              {/* Macronutrientes Detalhado */}
              <Card className="p-6">
                <CardHeader title="Distribuição de Macronutrientes" />
                
                <div className="space-y-4">
                  {/* Proteína */}
                  <div className="p-4 bg-red-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Beef className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-zinc-900">Proteína</span>
                      </div>
                      <span className="text-2xl font-bold text-red-600">{result.macros.protein.grams}g</span>
                    </div>
                    <div className="flex justify-between text-sm text-zinc-600">
                      <span>{result.macros.protein.perKg}g/kg</span>
                      <span>{result.macros.protein.calories} kcal</span>
                      <span>{result.macros.protein.percentage}%</span>
                    </div>
                    <div className="h-2 bg-red-100 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full transition-all"
                        style={{ width: `${result.macros.protein.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Carboidrato */}
                  <div className="p-4 bg-amber-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Wheat className="w-5 h-5 text-amber-600" />
                        <span className="font-semibold text-zinc-900">Carboidrato</span>
                      </div>
                      <span className="text-2xl font-bold text-amber-600">{result.macros.carbs.grams}g</span>
                    </div>
                    <div className="flex justify-between text-sm text-zinc-600">
                      <span>{result.macros.carbs.perKg}g/kg</span>
                      <span>{result.macros.carbs.calories} kcal</span>
                      <span>{result.macros.carbs.percentage}%</span>
                    </div>
                    <div className="h-2 bg-amber-100 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${result.macros.carbs.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Gordura */}
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-zinc-900">Gordura</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{result.macros.fat.grams}g</span>
                    </div>
                    <div className="flex justify-between text-sm text-zinc-600">
                      <span>{result.macros.fat.perKg}g/kg</span>
                      <span>{result.macros.fat.calories} kcal</span>
                      <span>{result.macros.fat.percentage}%</span>
                    </div>
                    <div className="h-2 bg-blue-100 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${result.macros.fat.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Fibras e Água */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <Wheat className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Fibras</p>
                      <p className="text-xl font-bold text-zinc-900">{result.fiber}g</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                      <Droplet className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Água</p>
                      <p className="text-xl font-bold text-zinc-900">{result.water}L</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Botão Salvar */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-lime-500 text-black font-semibold rounded-xl hover:bg-lime-400 transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Salvando...' : hasExisting ? 'Atualizar Cálculo' : 'Salvar Cálculo'}
              </button>

              {/* Info */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Sobre os cálculos</p>
                  <p className="text-blue-600">
                    Estes valores são estimativas baseadas em fórmulas científicas. 
                    Ajustes podem ser necessários baseados na resposta individual do paciente.
                    Reavalie em 2-4 semanas.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-96 bg-zinc-50 rounded-xl">
              <div className="text-center">
                <Calculator className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500">
                  Preencha os dados e clique em <strong>Calcular</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
