/**
 * Dashboard de Evolução Nutricional
 * 
 * Apresenta gráficos e métricas de progresso do paciente:
 * - Evolução de peso e composição corporal
 * - Aderência ao plano nutricional
 * - Comparativo de metas vs realizado
 * - Histórico de avaliações
 */

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, StatCard } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  TrendingUp, TrendingDown, Target, Activity, Scale, Percent,
  Calendar, Award, Flame, Droplet, ArrowRight, ChevronLeft,
  ChevronRight, Download, Filter, BarChart3
} from 'lucide-react';
import api from '../../services/api';

interface NutritionEvolutionDashboardProps {
  athleteId: number;
  athleteName: string;
}

interface WeightEntry {
  date: string;
  weight: number;
  body_fat_percentage?: number;
  lean_mass?: number;
  fat_mass?: number;
}

interface NutritionLog {
  date: string;
  target_calories: number;
  consumed_calories: number;
  adherence: number;
  protein_adherence: number;
  carbs_adherence: number;
  fat_adherence: number;
}

interface CircumferenceEntry {
  date: string;
  waist: number;
  hip: number;
  chest: number;
  arm: number;
  thigh: number;
}

export function NutritionEvolutionDashboard({
  athleteId,
  athleteName,
}: NutritionEvolutionDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'weight' | 'adherence' | 'measurements' | 'composition'>('weight');
  
  // Dados de evolução
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [circumferences, setCircumferences] = useState<CircumferenceEntry[]>([]);
  const [currentGoals, setCurrentGoals] = useState<any>(null);

  // Dados simulados para demonstração (substituir por API real)
  useEffect(() => {
    loadEvolutionData();
  }, [athleteId, period]);

  const loadEvolutionData = async () => {
    setLoading(true);
    try {
      // Carregar dados de avaliações antropométricas
      const [anthropometricResponse, energyResponse] = await Promise.all([
        api.get(`/nutrition-advanced/anthropometric/${athleteId}?limit=20`),
        api.get(`/nutrition-advanced/energy-requirements/${athleteId}`),
      ]);

      // Transformar dados de antropometria em histórico de peso
      if (anthropometricResponse.data && Array.isArray(anthropometricResponse.data)) {
        const weightData: WeightEntry[] = anthropometricResponse.data.map((item: any) => ({
          date: item.assessment_date,
          weight: item.weight,
          body_fat_percentage: item.body_fat_percentage,
          lean_mass: item.lean_mass,
          fat_mass: item.fat_mass,
        })).reverse();
        
        setWeightHistory(weightData);
        
        // Extrair circunferências
        const circumData: CircumferenceEntry[] = anthropometricResponse.data
          .filter((item: any) => item.waist_circumference)
          .map((item: any) => ({
            date: item.assessment_date,
            waist: item.waist_circumference,
            hip: item.hip_circumference,
            chest: item.chest_circumference,
            arm: item.right_arm_circumference,
            thigh: item.right_thigh_circumference,
          })).reverse();
        
        setCircumferences(circumData);
      }

      if (energyResponse.data) {
        setCurrentGoals(energyResponse.data);
      }

      // Simular logs de nutrição (em produção, viriam do backend)
      const simulatedLogs = generateSimulatedLogs(period);
      setNutritionLogs(simulatedLogs);

    } catch (error) {
      console.error('Erro ao carregar dados de evolução:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gerar logs simulados para demonstração
  const generateSimulatedLogs = (period: string): NutritionLog[] => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const logs: NutritionLog[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const targetCalories = 2200;
      const variance = Math.random() * 0.4 - 0.2; // -20% a +20%
      const consumed = Math.round(targetCalories * (1 + variance));
      const adherence = Math.min(100, Math.max(0, 100 - Math.abs(variance * 100)));
      
      logs.push({
        date: date.toISOString().split('T')[0],
        target_calories: targetCalories,
        consumed_calories: consumed,
        adherence: Math.round(adherence),
        protein_adherence: Math.round(70 + Math.random() * 30),
        carbs_adherence: Math.round(60 + Math.random() * 40),
        fat_adherence: Math.round(75 + Math.random() * 25),
      });
    }
    
    return logs;
  };

  // Calcular métricas
  const metrics = useMemo(() => {
    if (weightHistory.length < 2) return null;
    
    const first = weightHistory[0];
    const last = weightHistory[weightHistory.length - 1];
    const weightChange = last.weight - first.weight;
    const weightChangePercent = (weightChange / first.weight) * 100;
    
    let fatChange = 0;
    let leanChange = 0;
    if (first.body_fat_percentage && last.body_fat_percentage) {
      fatChange = last.body_fat_percentage - first.body_fat_percentage;
    }
    if (first.lean_mass && last.lean_mass) {
      leanChange = last.lean_mass - first.lean_mass;
    }
    
    const avgAdherence = nutritionLogs.length > 0
      ? nutritionLogs.reduce((acc, log) => acc + log.adherence, 0) / nutritionLogs.length
      : 0;
    
    return {
      weightChange,
      weightChangePercent,
      fatChange,
      leanChange,
      avgAdherence: Math.round(avgAdherence),
      totalDays: nutritionLogs.length,
      goodDays: nutritionLogs.filter(l => l.adherence >= 80).length,
    };
  }, [weightHistory, nutritionLogs]);

  // Componente de gráfico de linha simples
  const LineChart = ({ 
    data, 
    dataKey, 
    color = '#84cc16',
    height = 200,
    showArea = false,
    formatValue = (v: number) => v.toString(),
    label = ''
  }: { 
    data: any[];
    dataKey: string;
    color?: string;
    height?: number;
    showArea?: boolean;
    formatValue?: (v: number) => string;
    label?: string;
  }) => {
    if (data.length === 0) return <div className="text-center text-zinc-400 py-8">Sem dados</div>;

    const values = data.map(d => d[dataKey]).filter(v => v != null);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    const padding = 40;
    const chartWidth = 100; // percentual
    const chartHeight = height - padding * 2;

    const points = data
      .map((d, i) => {
        const value = d[dataKey];
        if (value == null) return null;
        const x = (i / (data.length - 1)) * (chartWidth - 10) + 5;
        const y = chartHeight - ((value - min) / range) * chartHeight + padding;
        return { x, y, value, date: d.date };
      })
      .filter(p => p !== null);

    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p!.x}% ${p!.y}`)
      .join(' ');

    const areaPathD = pathD + ` L ${points[points.length - 1]!.x}% ${chartHeight + padding} L ${points[0]!.x}% ${chartHeight + padding} Z`;

    return (
      <div className="relative" style={{ height }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-zinc-400 py-8">
          <span>{formatValue(max)}</span>
          <span>{formatValue((max + min) / 2)}</span>
          <span>{formatValue(min)}</span>
        </div>
        
        {/* Chart */}
        <svg className="w-full h-full" style={{ marginLeft: 48 }}>
          {/* Grid lines */}
          <line x1="5%" y1={padding} x2="95%" y2={padding} stroke="#e4e4e7" strokeDasharray="4" />
          <line x1="5%" y1={padding + chartHeight / 2} x2="95%" y2={padding + chartHeight / 2} stroke="#e4e4e7" strokeDasharray="4" />
          <line x1="5%" y1={padding + chartHeight} x2="95%" y2={padding + chartHeight} stroke="#e4e4e7" strokeDasharray="4" />
          
          {/* Area */}
          {showArea && (
            <path d={areaPathD} fill={color} fillOpacity="0.1" />
          )}
          
          {/* Line */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={`${p!.x}%`} cy={p!.y} r="4" fill="white" stroke={color} strokeWidth="2" />
              {/* Tooltip on hover would go here */}
            </g>
          ))}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-zinc-400 px-12 mt-2">
          {data.length > 0 && (
            <>
              <span>{new Date(data[0].date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
              {data.length > 2 && (
                <span>{new Date(data[Math.floor(data.length / 2)].date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
              )}
              <span>{new Date(data[data.length - 1].date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
            </>
          )}
        </div>
        
        {label && (
          <div className="absolute top-2 right-2 text-xs text-zinc-500">{label}</div>
        )}
      </div>
    );
  };

  // Componente de gráfico de barras
  const BarChart = ({ 
    data, 
    dataKey,
    targetKey,
    color = '#84cc16',
    height = 200,
  }: { 
    data: any[];
    dataKey: string;
    targetKey?: string;
    color?: string;
    height?: number;
  }) => {
    if (data.length === 0) return <div className="text-center text-zinc-400 py-8">Sem dados</div>;

    const maxBars = 14;
    const displayData = data.slice(-maxBars);
    const values = displayData.map(d => d[dataKey]);
    const max = Math.max(...values, ...(targetKey ? displayData.map(d => d[targetKey]) : []));
    
    const barWidth = 100 / displayData.length;

    return (
      <div className="relative" style={{ height }}>
        <svg className="w-full h-full">
          {/* Bars */}
          {displayData.map((d, i) => {
            const value = d[dataKey];
            const target = targetKey ? d[targetKey] : null;
            const barHeight = (value / max) * (height - 40);
            const targetHeight = target ? (target / max) * (height - 40) : 0;
            const x = i * barWidth + barWidth * 0.1;
            const width = barWidth * 0.8;
            
            const isAboveTarget = target && value > target;
            const isBelowTarget = target && value < target * 0.8;
            const barColor = isBelowTarget ? '#ef4444' : isAboveTarget ? '#f59e0b' : color;
            
            return (
              <g key={i}>
                {/* Target line */}
                {target && (
                  <line 
                    x1={`${x}%`} 
                    y1={height - 20 - targetHeight} 
                    x2={`${x + width}%`} 
                    y2={height - 20 - targetHeight}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeDasharray="4"
                  />
                )}
                {/* Bar */}
                <rect
                  x={`${x}%`}
                  y={height - 20 - barHeight}
                  width={`${width}%`}
                  height={barHeight}
                  fill={barColor}
                  rx="4"
                />
              </g>
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-zinc-400 px-2">
          {displayData.map((d, i) => (
            <span key={i} className="text-center" style={{ width: `${barWidth}%` }}>
              {new Date(d.date).getDate()}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Componente de aderência circular
  const AdherenceRing = ({ value, size = 120, label }: { value: number; size?: number; label: string }) => {
    const radius = (size - 16) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    
    const color = value >= 80 ? '#84cc16' : value >= 60 ? '#f59e0b' : '#ef4444';
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg className="transform -rotate-90" width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e4e4e7"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold" style={{ color }}>{value}%</span>
          </div>
        </div>
        <span className="text-sm text-zinc-500 mt-2">{label}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Dashboard de Evolução</h2>
          <p className="text-zinc-500 mt-1">Paciente: {athleteName}</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-xl">
          {(['7d', '30d', '90d', '1y'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : p === '90d' ? '3 meses' : '1 ano'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Variação de Peso"
            value={`${metrics.weightChange > 0 ? '+' : ''}${metrics.weightChange.toFixed(1)} kg`}
            icon={metrics.weightChange <= 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            color={metrics.weightChange <= 0 ? 'lime' : 'orange'}
            subtitle={`${metrics.weightChangePercent.toFixed(1)}%`}
          />
          <StatCard
            label="Variação % Gordura"
            value={metrics.fatChange ? `${metrics.fatChange > 0 ? '+' : ''}${metrics.fatChange.toFixed(1)}%` : '-'}
            icon={<Percent className="w-5 h-5" />}
            color={metrics.fatChange && metrics.fatChange <= 0 ? 'lime' : 'orange'}
          />
          <StatCard
            label="Aderência Média"
            value={`${metrics.avgAdherence}%`}
            icon={<Target className="w-5 h-5" />}
            color={metrics.avgAdherence >= 80 ? 'lime' : metrics.avgAdherence >= 60 ? 'orange' : 'red'}
          />
          <StatCard
            label="Dias no Plano"
            value={`${metrics.goodDays}/${metrics.totalDays}`}
            icon={<Calendar className="w-5 h-5" />}
            color="blue"
            subtitle="dias com boa aderência"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl overflow-x-auto">
        {[
          { id: 'weight', label: 'Peso', icon: Scale },
          { id: 'adherence', label: 'Aderência', icon: Target },
          { id: 'measurements', label: 'Medidas', icon: Activity },
          { id: 'composition', label: 'Composição', icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <Card className="p-6">
        {/* Weight Evolution */}
        {activeTab === 'weight' && (
          <div>
            <CardHeader 
              title="Evolução de Peso" 
              icon={<Scale className="w-5 h-5" />}
              subtitle="Acompanhamento do peso ao longo do tempo"
            />
            
            {weightHistory.length > 0 ? (
              <LineChart 
                data={weightHistory} 
                dataKey="weight" 
                color="#84cc16"
                height={250}
                showArea
                formatValue={(v) => `${v.toFixed(1)} kg`}
              />
            ) : (
              <div className="text-center py-12 text-zinc-400">
                <Scale className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma avaliação de peso registrada</p>
              </div>
            )}
            
            {/* Weight History Table */}
            {weightHistory.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      <th className="text-left py-2 px-4 font-medium text-zinc-500">Data</th>
                      <th className="text-right py-2 px-4 font-medium text-zinc-500">Peso</th>
                      <th className="text-right py-2 px-4 font-medium text-zinc-500">% Gordura</th>
                      <th className="text-right py-2 px-4 font-medium text-zinc-500">Variação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weightHistory.slice(-5).reverse().map((entry, i, arr) => {
                      const prev = arr[i + 1];
                      const change = prev ? entry.weight - prev.weight : 0;
                      
                      return (
                        <tr key={entry.date} className="border-b border-zinc-50">
                          <td className="py-2 px-4">{new Date(entry.date).toLocaleDateString('pt-BR')}</td>
                          <td className="py-2 px-4 text-right font-medium">{entry.weight.toFixed(1)} kg</td>
                          <td className="py-2 px-4 text-right">{entry.body_fat_percentage?.toFixed(1) || '-'}%</td>
                          <td className="py-2 px-4 text-right">
                            {prev && (
                              <span className={change <= 0 ? 'text-green-600' : 'text-red-600'}>
                                {change > 0 ? '+' : ''}{change.toFixed(1)} kg
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Adherence */}
        {activeTab === 'adherence' && (
          <div>
            <CardHeader 
              title="Aderência ao Plano" 
              icon={<Target className="w-5 h-5" />}
              subtitle="Comparativo de consumo vs meta diária"
            />
            
            {/* Adherence Rings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <AdherenceRing 
                value={metrics?.avgAdherence || 0} 
                label="Geral" 
              />
              <AdherenceRing 
                value={nutritionLogs.length > 0 
                  ? Math.round(nutritionLogs.reduce((a, l) => a + l.protein_adherence, 0) / nutritionLogs.length)
                  : 0
                } 
                label="Proteína" 
                size={100}
              />
              <AdherenceRing 
                value={nutritionLogs.length > 0 
                  ? Math.round(nutritionLogs.reduce((a, l) => a + l.carbs_adherence, 0) / nutritionLogs.length)
                  : 0
                } 
                label="Carboidrato" 
                size={100}
              />
              <AdherenceRing 
                value={nutritionLogs.length > 0 
                  ? Math.round(nutritionLogs.reduce((a, l) => a + l.fat_adherence, 0) / nutritionLogs.length)
                  : 0
                } 
                label="Gordura" 
                size={100}
              />
            </div>
            
            {/* Daily Calories Chart */}
            <h4 className="font-medium text-zinc-900 mb-4">Consumo Calórico Diário</h4>
            <BarChart 
              data={nutritionLogs}
              dataKey="consumed_calories"
              targetKey="target_calories"
              color="#84cc16"
              height={200}
            />
            
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-zinc-500">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-lime-500 rounded" />
                Consumido (dentro da meta)
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-zinc-400" style={{ borderStyle: 'dashed', borderWidth: 2 }} />
                Meta
              </span>
            </div>
          </div>
        )}

        {/* Measurements */}
        {activeTab === 'measurements' && (
          <div>
            <CardHeader 
              title="Evolução de Medidas" 
              icon={<Activity className="w-5 h-5" />}
              subtitle="Circunferências corporais ao longo do tempo"
            />
            
            {circumferences.length > 0 ? (
              <div className="space-y-6">
                {/* Waist */}
                <div>
                  <h4 className="font-medium text-zinc-700 mb-2">Cintura (cm)</h4>
                  <LineChart 
                    data={circumferences.filter(c => c.waist)} 
                    dataKey="waist" 
                    color="#ef4444"
                    height={150}
                    formatValue={(v) => `${v} cm`}
                  />
                </div>
                
                {/* Hip */}
                <div>
                  <h4 className="font-medium text-zinc-700 mb-2">Quadril (cm)</h4>
                  <LineChart 
                    data={circumferences.filter(c => c.hip)} 
                    dataKey="hip" 
                    color="#3b82f6"
                    height={150}
                    formatValue={(v) => `${v} cm`}
                  />
                </div>
                
                {/* Comparison Table */}
                {circumferences.length >= 2 && (
                  <div className="mt-6 p-4 bg-zinc-50 rounded-xl">
                    <h4 className="font-medium text-zinc-900 mb-3">Comparativo</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Primeira Avaliação</p>
                        <p className="text-sm text-zinc-600">
                          {new Date(circumferences[0].date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Variação Cintura</p>
                        <p className={`text-lg font-bold ${
                          circumferences[circumferences.length - 1].waist - circumferences[0].waist <= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {circumferences[circumferences.length - 1].waist - circumferences[0].waist > 0 ? '+' : ''}
                          {(circumferences[circumferences.length - 1].waist - circumferences[0].waist).toFixed(1)} cm
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Última Avaliação</p>
                        <p className="text-sm text-zinc-600">
                          {new Date(circumferences[circumferences.length - 1].date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-400">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma medida registrada</p>
              </div>
            )}
          </div>
        )}

        {/* Body Composition */}
        {activeTab === 'composition' && (
          <div>
            <CardHeader 
              title="Composição Corporal" 
              icon={<BarChart3 className="w-5 h-5" />}
              subtitle="Massa magra vs massa gorda"
            />
            
            {weightHistory.some(w => w.lean_mass && w.fat_mass) ? (
              <div className="space-y-6">
                {/* Stacked bar comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {weightHistory.filter(w => w.lean_mass && w.fat_mass).slice(-2).map((entry, i, arr) => {
                    const totalMass = (entry.lean_mass || 0) + (entry.fat_mass || 0);
                    const leanPercent = totalMass > 0 ? ((entry.lean_mass || 0) / totalMass) * 100 : 0;
                    const fatPercent = 100 - leanPercent;
                    
                    return (
                      <div key={entry.date} className="text-center">
                        <p className="text-sm text-zinc-500 mb-2">
                          {i === arr.length - 1 ? 'Atual' : 'Anterior'} - {new Date(entry.date).toLocaleDateString('pt-BR')}
                        </p>
                        <div className="h-8 rounded-full overflow-hidden flex">
                          <div 
                            className="bg-blue-500 transition-all duration-500"
                            style={{ width: `${leanPercent}%` }}
                          />
                          <div 
                            className="bg-orange-400 transition-all duration-500"
                            style={{ width: `${fatPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-blue-600">Magra: {entry.lean_mass?.toFixed(1)} kg</span>
                          <span className="text-orange-600">Gorda: {entry.fat_mass?.toFixed(1)} kg</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Evolution Chart */}
                <div>
                  <h4 className="font-medium text-zinc-700 mb-2">Evolução da Massa Magra</h4>
                  <LineChart 
                    data={weightHistory.filter(w => w.lean_mass)} 
                    dataKey="lean_mass" 
                    color="#3b82f6"
                    height={150}
                    formatValue={(v) => `${v.toFixed(1)} kg`}
                  />
                </div>
                
                <div>
                  <h4 className="font-medium text-zinc-700 mb-2">Evolução da Massa Gorda</h4>
                  <LineChart 
                    data={weightHistory.filter(w => w.fat_mass)} 
                    dataKey="fat_mass" 
                    color="#f97316"
                    height={150}
                    formatValue={(v) => `${v.toFixed(1)} kg`}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Dados de composição corporal não disponíveis</p>
                <p className="text-sm mt-2">Realize uma avaliação antropométrica com dobras cutâneas</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
          <Download className="w-4 h-4" />
          Exportar Relatório
        </button>
      </div>
    </div>
  );
}
