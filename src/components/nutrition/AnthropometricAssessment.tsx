/**
 * Componente de Avaliação Antropométrica
 * 
 * Permite registrar medidas corporais, dobras cutâneas e calcular
 * composição corporal e IMC.
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, StatCard } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  Ruler, Save, Plus, History, TrendingUp, TrendingDown,
  Camera, Calculator, Activity, Scale, Percent
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../ui/Toast';

interface AnthropometricAssessmentProps {
  athleteId: number;
  nutritionistId: number;
  athleteName: string;
  athleteSex?: 'male' | 'female';
  athleteAge?: number;
  onSave?: () => void;
  readOnly?: boolean;
}

interface AssessmentData {
  id?: number;
  athlete_id: number;
  nutritionist_id: number;
  assessment_date: string;
  
  // Medidas Básicas
  weight: number;
  height: number;
  
  // Calculados
  bmi?: number;
  bmi_classification?: string;
  
  // Circunferências
  neck_circumference?: number;
  shoulder_circumference?: number;
  chest_circumference?: number;
  waist_circumference?: number;
  abdomen_circumference?: number;
  hip_circumference?: number;
  right_arm_circumference?: number;
  left_arm_circumference?: number;
  right_forearm_circumference?: number;
  left_forearm_circumference?: number;
  right_thigh_circumference?: number;
  left_thigh_circumference?: number;
  right_calf_circumference?: number;
  left_calf_circumference?: number;
  
  // Relações
  waist_hip_ratio?: number;
  waist_height_ratio?: number;
  
  // Dobras Cutâneas
  triceps_skinfold?: number;
  subscapular_skinfold?: number;
  chest_skinfold?: number;
  midaxillary_skinfold?: number;
  suprailiac_skinfold?: number;
  abdominal_skinfold?: number;
  thigh_skinfold?: number;
  
  // Composição Corporal
  body_fat_percentage?: number;
  fat_mass?: number;
  lean_mass?: number;
  body_fat_classification?: string;
  
  // Bioimpedância
  bioimpedance_fat_percentage?: number;
  bioimpedance_muscle_mass?: number;
  bioimpedance_water_percentage?: number;
  bioimpedance_bone_mass?: number;
  bioimpedance_visceral_fat?: number;
  bioimpedance_basal_metabolism?: number;
  
  // Método
  measurement_method?: string;
  
  // Fotos
  photo_front_url?: string;
  photo_side_url?: string;
  photo_back_url?: string;
  
  // Observações
  observations?: string;
}

interface HistoryItem {
  id: number;
  assessment_date: string;
  weight: number;
  bmi: number;
  body_fat_percentage?: number;
}

export function AnthropometricAssessment({ 
  athleteId, 
  nutritionistId, 
  athleteName,
  athleteSex = 'male',
  athleteAge = 30,
  onSave,
  readOnly = false
}: AnthropometricAssessmentProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'circumferences' | 'skinfolds' | 'bioimpedance' | 'photos'>('basic');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const [formData, setFormData] = useState<AssessmentData>({
    athlete_id: athleteId,
    nutritionist_id: nutritionistId,
    assessment_date: new Date().toISOString().split('T')[0],
    weight: 0,
    height: 0,
    measurement_method: 'skinfold',
  });

  // Classificações de IMC
  const bmiClassifications = {
    underweight: { label: 'Abaixo do peso', color: 'info' },
    normal: { label: 'Peso normal', color: 'success' },
    overweight: { label: 'Sobrepeso', color: 'warning' },
    obese_1: { label: 'Obesidade grau I', color: 'error' },
    obese_2: { label: 'Obesidade grau II', color: 'error' },
    obese_3: { label: 'Obesidade grau III', color: 'error' },
  };

  // Classificações de % Gordura
  const bodyFatClassifications = {
    essential: { label: 'Gordura essencial', color: 'info' },
    athletic: { label: 'Atlético', color: 'lime' },
    fitness: { label: 'Fitness', color: 'success' },
    normal: { label: 'Aceitável', color: 'warning' },
    obese: { label: 'Obesidade', color: 'error' },
  };

  useEffect(() => {
    loadData();
  }, [athleteId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar última avaliação e histórico em paralelo
      const [latestResponse, historyResponse] = await Promise.all([
        api.get<AssessmentData | null>(`/nutrition-advanced/anthropometric/${athleteId}/latest`),
        api.get<HistoryItem[]>(`/nutrition-advanced/anthropometric/${athleteId}?limit=10`),
      ]);
      
      if (latestResponse.data) {
        const latestData = latestResponse.data as AssessmentData;
        setFormData(prev => ({ 
          ...prev, 
          ...latestData,
          // Reset para nova avaliação
          id: undefined,
          assessment_date: new Date().toISOString().split('T')[0],
        }));
      }
      
      if (historyResponse.data) {
        setHistory(historyResponse.data as HistoryItem[]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.weight || !formData.height) {
      toast.warning('Peso e altura são obrigatórios');
      return;
    }
    
    try {
      setSaving(true);
      await api.post('/nutrition-advanced/anthropometric', formData);
      await loadData(); // Recarregar para pegar os valores calculados
      onSave?.();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      toast.error('Erro ao salvar avaliação');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calcular IMC em tempo real
  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return null;
    const heightM = height / 100;
    return Math.round((weight / (heightM * heightM)) * 100) / 100;
  };

  const currentBMI = calculateBMI(formData.weight, formData.height);

  // Componentes de Input
  const InputField = ({ 
    label, 
    field, 
    unit = '',
    placeholder = '',
    step = 0.1,
    min = 0,
    max,
    required = false,
    helpText
  }: { 
    label: string; 
    field: string; 
    unit?: string;
    placeholder?: string;
    step?: number;
    min?: number;
    max?: number;
    required?: boolean;
    helpText?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="number"
          value={(formData as any)[field] || ''}
          onChange={(e) => updateField(field, e.target.value ? Number(e.target.value) : '')}
          placeholder={placeholder}
          step={step}
          min={min}
          max={max}
          disabled={readOnly}
          className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent disabled:bg-zinc-50"
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
            {unit}
          </span>
        )}
      </div>
      {helpText && (
        <p className="text-xs text-zinc-500 mt-1">{helpText}</p>
      )}
    </div>
  );

  // Tabs
  const tabs = [
    { id: 'basic', label: 'Básico', icon: Scale },
    { id: 'circumferences', label: 'Circunferências', icon: Ruler },
    { id: 'skinfolds', label: 'Dobras Cutâneas', icon: Activity },
    { id: 'bioimpedance', label: 'Bioimpedância', icon: Calculator },
    { id: 'photos', label: 'Fotos', icon: Camera },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Avaliação Antropométrica</h2>
          <p className="text-zinc-500 mt-1">Paciente: {athleteName}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
          >
            <History className="w-4 h-4" />
            Histórico
          </button>
          
          {!readOnly && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-lime-500 text-black font-semibold rounded-xl hover:bg-lime-400 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          )}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="IMC"
          value={currentBMI ? currentBMI.toFixed(1) : '-'}
          icon={<Scale className="w-5 h-5" />}
          color={currentBMI && currentBMI >= 18.5 && currentBMI < 25 ? 'lime' : 'orange'}
        />
        <StatCard
          label="% Gordura"
          value={formData.body_fat_percentage ? `${formData.body_fat_percentage}%` : '-'}
          icon={<Percent className="w-5 h-5" />}
          color={formData.body_fat_percentage && formData.body_fat_percentage < 25 ? 'lime' : 'orange'}
        />
        <StatCard
          label="Massa Magra"
          value={formData.lean_mass ? `${formData.lean_mass} kg` : '-'}
          icon={<Activity className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Massa Gorda"
          value={formData.fat_mass ? `${formData.fat_mass} kg` : '-'}
          icon={<Scale className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Histórico */}
      {showHistory && history.length > 0 && (
        <Card className="mb-6">
          <CardHeader title="Histórico de Avaliações" icon={<History className="w-5 h-5" />} />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Data</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-zinc-500">Peso</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-zinc-500">IMC</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-zinc-500">% Gordura</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-zinc-500">Variação</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => {
                  const prevItem = history[index + 1];
                  const weightDiff = prevItem ? item.weight - prevItem.weight : 0;
                  
                  return (
                    <tr key={item.id} className="border-b border-zinc-50 last:border-0">
                      <td className="py-3 px-4 text-sm text-zinc-900">
                        {new Date(item.assessment_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-sm text-center font-medium">
                        {item.weight} kg
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        {item.bmi?.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        {item.body_fat_percentage ? `${item.body_fat_percentage}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {prevItem && (
                          <span className={`inline-flex items-center gap-1 text-sm ${
                            weightDiff > 0 ? 'text-red-600' : weightDiff < 0 ? 'text-green-600' : 'text-zinc-400'
                          }`}>
                            {weightDiff > 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : weightDiff < 0 ? (
                              <TrendingDown className="w-4 h-4" />
                            ) : null}
                            {weightDiff !== 0 && `${weightDiff > 0 ? '+' : ''}${weightDiff.toFixed(1)} kg`}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2 bg-zinc-100 p-1 rounded-xl">
        {tabs.map(tab => (
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

      {/* Conteúdo das Tabs */}
      <Card>
        {/* Tab: Básico */}
        {activeTab === 'basic' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField
                label="Data da Avaliação"
                field="assessment_date"
                required
              />
              <InputField
                label="Peso"
                field="weight"
                unit="kg"
                step={0.1}
                required
                helpText="Preferencialmente em jejum, pela manhã"
              />
              <InputField
                label="Altura"
                field="height"
                unit="cm"
                step={0.1}
                required
              />
            </div>

            {/* IMC Calculado */}
            {currentBMI && (
              <div className="mt-6 p-4 bg-zinc-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">IMC Calculado</p>
                    <p className="text-3xl font-bold text-zinc-900">{currentBMI.toFixed(2)}</p>
                  </div>
                  <Badge 
                    variant={
                      currentBMI < 18.5 ? 'info' :
                      currentBMI < 25 ? 'success' :
                      currentBMI < 30 ? 'warning' : 'error'
                    }
                    size="lg"
                  >
                    {currentBMI < 18.5 ? 'Abaixo do peso' :
                     currentBMI < 25 ? 'Peso normal' :
                     currentBMI < 30 ? 'Sobrepeso' :
                     currentBMI < 35 ? 'Obesidade I' :
                     currentBMI < 40 ? 'Obesidade II' : 'Obesidade III'}
                  </Badge>
                </div>
                
                {/* Barra de referência IMC */}
                <div className="mt-4">
                  <div className="h-2 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500 rounded-full relative">
                    {/* Marcador */}
                    <div 
                      className="absolute w-3 h-3 bg-white border-2 border-zinc-800 rounded-full -top-0.5 transform -translate-x-1/2"
                      style={{ 
                        left: `${Math.min(Math.max((currentBMI - 15) / (40 - 15) * 100, 0), 100)}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-zinc-500 mt-1">
                    <span>15</span>
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                    <span>35</span>
                    <span>40</span>
                  </div>
                </div>
              </div>
            )}

            {/* Método de Medição */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Método de Medição da Composição Corporal
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'skinfold', label: 'Dobras Cutâneas' },
                  { value: 'bioimpedance', label: 'Bioimpedância' },
                  { value: 'dexa', label: 'DEXA' },
                  { value: 'hydrostatic', label: 'Pesagem Hidrostática' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateField('measurement_method', option.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      formData.measurement_method === option.value
                        ? 'bg-lime-500 text-black'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Circunferências */}
        {activeTab === 'circumferences' && (
          <div className="p-6">
            <p className="text-sm text-zinc-500 mb-6">
              Todas as medidas em centímetros (cm). Meça sempre no mesmo ponto de referência.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField label="Pescoço" field="neck_circumference" unit="cm" />
              <InputField label="Ombros" field="shoulder_circumference" unit="cm" />
              <InputField label="Tórax" field="chest_circumference" unit="cm" />
              <InputField label="Cintura" field="waist_circumference" unit="cm" helpText="Na altura do umbigo" />
              <InputField label="Abdômen" field="abdomen_circumference" unit="cm" />
              <InputField label="Quadril" field="hip_circumference" unit="cm" helpText="Na maior circunferência" />
              
              {/* Membros Direito */}
              <div className="col-span-full mt-4 border-t border-zinc-100 pt-4">
                <h4 className="font-medium text-zinc-900 mb-4">Lado Direito</h4>
              </div>
              <InputField label="Braço (relaxado)" field="right_arm_circumference" unit="cm" />
              <InputField label="Antebraço" field="right_forearm_circumference" unit="cm" />
              <InputField label="Coxa" field="right_thigh_circumference" unit="cm" helpText="Ponto médio" />
              <InputField label="Panturrilha" field="right_calf_circumference" unit="cm" />
              
              {/* Membros Esquerdo */}
              <div className="col-span-full mt-4 border-t border-zinc-100 pt-4">
                <h4 className="font-medium text-zinc-900 mb-4">Lado Esquerdo</h4>
              </div>
              <InputField label="Braço (relaxado)" field="left_arm_circumference" unit="cm" />
              <InputField label="Antebraço" field="left_forearm_circumference" unit="cm" />
              <InputField label="Coxa" field="left_thigh_circumference" unit="cm" />
              <InputField label="Panturrilha" field="left_calf_circumference" unit="cm" />
            </div>

            {/* Relações calculadas */}
            {formData.waist_circumference && formData.hip_circumference && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 rounded-xl">
                  <p className="text-sm text-zinc-500">RCQ (Relação Cintura-Quadril)</p>
                  <p className="text-2xl font-bold text-zinc-900">
                    {(formData.waist_circumference / formData.hip_circumference).toFixed(3)}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Risco: {athleteSex === 'male' 
                      ? (formData.waist_circumference / formData.hip_circumference) > 0.95 ? 'Alto' : 'Baixo'
                      : (formData.waist_circumference / formData.hip_circumference) > 0.85 ? 'Alto' : 'Baixo'
                    }
                  </p>
                </div>
                
                {formData.height && (
                  <div className="p-4 bg-zinc-50 rounded-xl">
                    <p className="text-sm text-zinc-500">RCEst (Relação Cintura-Estatura)</p>
                    <p className="text-2xl font-bold text-zinc-900">
                      {(formData.waist_circumference / formData.height).toFixed(3)}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Risco: {(formData.waist_circumference / formData.height) > 0.5 ? 'Elevado' : 'Normal'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab: Dobras Cutâneas */}
        {activeTab === 'skinfolds' && (
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">Protocolo de 7 Dobras (Jackson & Pollock)</h4>
              <p className="text-sm text-blue-700">
                Faça 3 medidas em cada ponto e utilize a média. Meça sempre do lado direito do corpo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField 
                label="Tríceps" 
                field="triceps_skinfold" 
                unit="mm"
                helpText="Posterior do braço, ponto médio"
              />
              <InputField 
                label="Subescapular" 
                field="subscapular_skinfold" 
                unit="mm"
                helpText="Abaixo da escápula, diagonal"
              />
              <InputField 
                label="Peitoral" 
                field="chest_skinfold" 
                unit="mm"
                helpText={athleteSex === 'male' ? 'Diagonal, entre axila e mamilo' : 'Diagonal, próximo à axila'}
              />
              <InputField 
                label="Axilar Média" 
                field="midaxillary_skinfold" 
                unit="mm"
                helpText="Linha axilar média, altura do xifóide"
              />
              <InputField 
                label="Supra-ilíaca" 
                field="suprailiac_skinfold" 
                unit="mm"
                helpText="Diagonal, acima da crista ilíaca"
              />
              <InputField 
                label="Abdominal" 
                field="abdominal_skinfold" 
                unit="mm"
                helpText="Vertical, 2cm lateral ao umbigo"
              />
              <InputField 
                label="Coxa" 
                field="thigh_skinfold" 
                unit="mm"
                helpText="Vertical, ponto médio anterior"
              />
            </div>

            {/* Cálculo automático */}
            {formData.triceps_skinfold && formData.subscapular_skinfold && formData.chest_skinfold &&
             formData.midaxillary_skinfold && formData.suprailiac_skinfold && 
             formData.abdominal_skinfold && formData.thigh_skinfold && (
              <div className="mt-6 p-4 bg-lime-50 border border-lime-100 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-5 h-5 text-lime-600" />
                  <span className="font-medium text-lime-900">Soma das 7 dobras</span>
                </div>
                <p className="text-3xl font-bold text-zinc-900">
                  {(
                    (formData.triceps_skinfold || 0) +
                    (formData.subscapular_skinfold || 0) +
                    (formData.chest_skinfold || 0) +
                    (formData.midaxillary_skinfold || 0) +
                    (formData.suprailiac_skinfold || 0) +
                    (formData.abdominal_skinfold || 0) +
                    (formData.thigh_skinfold || 0)
                  ).toFixed(1)} mm
                </p>
                <p className="text-sm text-zinc-500 mt-2">
                  O cálculo do % de gordura será feito automaticamente ao salvar, usando a fórmula de Jackson & Pollock.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Bioimpedância */}
        {activeTab === 'bioimpedance' && (
          <div className="p-6">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
              <h4 className="font-medium text-amber-900 mb-2">Dados da Bioimpedância</h4>
              <p className="text-sm text-amber-700">
                Preencha os dados obtidos pelo aparelho de bioimpedância. Certifique-se de que o paciente 
                estava em condições adequadas (jejum, hidratação controlada, etc).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField 
                label="% Gordura" 
                field="bioimpedance_fat_percentage" 
                unit="%"
              />
              <InputField 
                label="Massa Muscular" 
                field="bioimpedance_muscle_mass" 
                unit="kg"
              />
              <InputField 
                label="% Água Corporal" 
                field="bioimpedance_water_percentage" 
                unit="%"
              />
              <InputField 
                label="Massa Óssea" 
                field="bioimpedance_bone_mass" 
                unit="kg"
              />
              <InputField 
                label="Gordura Visceral" 
                field="bioimpedance_visceral_fat" 
                unit=""
                step={1}
                helpText="Nível (geralmente 1-59)"
              />
              <InputField 
                label="Metabolismo Basal" 
                field="bioimpedance_basal_metabolism" 
                unit="kcal"
                step={1}
              />
            </div>
          </div>
        )}

        {/* Tab: Fotos */}
        {activeTab === 'photos' && (
          <div className="p-6">
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6">
              <h4 className="font-medium text-purple-900 mb-2">Registro Fotográfico</h4>
              <p className="text-sm text-purple-700">
                Registre fotos de frente, lateral e costas para acompanhamento visual da evolução.
                As fotos ajudam a visualizar mudanças que a balança não mostra.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['front', 'side', 'back'].map(position => {
                const field = `photo_${position}_url` as keyof AssessmentData;
                const labels = { front: 'Frente', side: 'Lateral', back: 'Costas' };
                
                return (
                  <div key={position} className="text-center">
                    <label className="block text-sm font-medium text-zinc-700 mb-3">
                      {labels[position as keyof typeof labels]}
                    </label>
                    <div className="aspect-[3/4] bg-zinc-100 rounded-xl flex items-center justify-center border-2 border-dashed border-zinc-300 hover:border-lime-400 transition-colors cursor-pointer">
                      {formData[field] ? (
                        <img 
                          src={formData[field] as string} 
                          alt={`Foto ${position}`}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Camera className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                          <p className="text-sm text-zinc-400">Clique para adicionar</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Observações
              </label>
              <textarea
                value={formData.observations || ''}
                onChange={(e) => updateField('observations', e.target.value)}
                placeholder="Anotações sobre a avaliação..."
                rows={3}
                disabled={readOnly}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Botão de Salvar (Footer) */}
      {!readOnly && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-lime-500 text-black font-semibold rounded-xl hover:bg-lime-400 transition-colors shadow-lg disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Salvando...' : 'Salvar Avaliação'}
          </button>
        </div>
      )}
    </div>
  );
}
