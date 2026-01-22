/**
 * Componente de Anamnese Nutricional
 * 
 * Formulário completo para coleta de histórico alimentar e informações
 * relevantes para o planejamento nutricional do paciente.
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, StatCard } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  FileText, Save, ChevronDown, ChevronUp, AlertCircle,
  Utensils, Activity, Heart, Droplet, Moon, Target
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../ui/Toast';

interface NutritionAnamnesisProps {
  athleteId: number;
  nutritionistId: number;
  athleteName: string;
  onSave?: () => void;
  readOnly?: boolean;
}

interface AnamnesisData {
  id?: number;
  athlete_id: number;
  nutritionist_id: number;
  evaluation_date: string;
  
  // Histórico de Peso
  current_weight?: number;
  usual_weight?: number;
  desired_weight?: number;
  max_weight_ever?: number;
  min_weight_adult?: number;
  weight_variation_last_6m?: string;
  weight_variation_amount?: number;
  
  // Histórico de Dietas
  previous_diets?: string[];
  diet_history_notes?: string;
  
  // Hábitos Alimentares
  meals_per_day?: number;
  main_meals_location?: string;
  who_prepares_meals?: string;
  eating_speed?: string;
  chewing_quality?: string;
  appetite?: string;
  food_preferences?: string[];
  food_aversions?: string[];
  
  // Alergias e Intolerâncias
  has_food_allergies?: boolean;
  food_allergies?: string[];
  has_food_intolerances?: boolean;
  food_intolerances?: string[];
  
  // Restrições
  dietary_restrictions?: string[];
  religious_restrictions?: string;
  
  // Suplementação
  uses_supplements?: boolean;
  supplements?: { name: string; dose: string; frequency: string }[];
  
  // Hidratação
  daily_water_intake?: number;
  water_intake_preference?: string;
  other_beverages?: { name: string; amount: string; frequency: string }[];
  
  // Hábitos Intestinais
  bowel_frequency?: string;
  bowel_consistency?: string;
  has_constipation?: boolean;
  has_diarrhea?: boolean;
  
  // Sono e Estresse
  sleep_hours?: number;
  sleep_quality?: string;
  stress_level?: string;
  
  // Atividade Física
  physical_activity_level?: string;
  exercise_frequency?: number;
  exercise_types?: string[];
  exercise_duration?: number;
  exercise_time?: string;
  
  // Condições de Saúde
  health_conditions?: string[];
  medications?: { name: string; dose: string }[];
  family_health_history?: string[];
  
  // Sintomas GI
  has_heartburn?: boolean;
  has_bloating?: boolean;
  has_nausea?: boolean;
  has_gas?: boolean;
  gi_symptoms_notes?: string;
  
  // Objetivos
  primary_goal?: string;
  secondary_goals?: string[];
  goal_deadline?: string;
  motivation_level?: string;
  
  // Recordatório 24h
  recall_24h?: string;
  
  // Observações
  observations?: string;
}

export function NutritionAnamnesis({ 
  athleteId, 
  nutritionistId, 
  athleteName,
  onSave,
  readOnly = false
}: NutritionAnamnesisProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['peso', 'habitos']);
  
  const [formData, setFormData] = useState<AnamnesisData>({
    athlete_id: athleteId,
    nutritionist_id: nutritionistId,
    evaluation_date: new Date().toISOString().split('T')[0],
    meals_per_day: 3,
    has_food_allergies: false,
    has_food_intolerances: false,
    uses_supplements: false,
    has_constipation: false,
    has_diarrhea: false,
    has_heartburn: false,
    has_bloating: false,
    has_nausea: false,
    has_gas: false,
  });

  // Lista de opções para os selects
  const weightVariationOptions = [
    { value: 'stable', label: 'Estável' },
    { value: 'gained', label: 'Ganhou peso' },
    { value: 'lost', label: 'Perdeu peso' },
  ];

  const mealLocationOptions = [
    { value: 'home', label: 'Em casa' },
    { value: 'work', label: 'No trabalho' },
    { value: 'restaurant', label: 'Restaurantes' },
    { value: 'mixed', label: 'Variado' },
  ];

  const speedOptions = [
    { value: 'slow', label: 'Devagar' },
    { value: 'normal', label: 'Normal' },
    { value: 'fast', label: 'Rápido' },
  ];

  const qualityOptions = [
    { value: 'good', label: 'Boa' },
    { value: 'regular', label: 'Regular' },
    { value: 'poor', label: 'Ruim' },
  ];

  const appetiteOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'increased', label: 'Aumentado' },
    { value: 'decreased', label: 'Diminuído' },
    { value: 'variable', label: 'Variável' },
  ];

  const bowelFrequencyOptions = [
    { value: 'daily', label: 'Diário' },
    { value: 'every_2_days', label: 'A cada 2 dias' },
    { value: 'every_3_days', label: 'A cada 3+ dias' },
    { value: 'irregular', label: 'Irregular' },
  ];

  const bowelConsistencyOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'hard', label: 'Endurecido' },
    { value: 'soft', label: 'Amolecido' },
    { value: 'liquid', label: 'Líquido' },
    { value: 'variable', label: 'Variável' },
  ];

  const activityLevelOptions = [
    { value: 'sedentary', label: 'Sedentário' },
    { value: 'light', label: 'Leve (1-2x/semana)' },
    { value: 'moderate', label: 'Moderado (3-4x/semana)' },
    { value: 'active', label: 'Ativo (5-6x/semana)' },
    { value: 'very_active', label: 'Muito ativo (diário)' },
    { value: 'athlete', label: 'Atleta (2x/dia)' },
  ];

  const exerciseTimeOptions = [
    { value: 'morning', label: 'Manhã' },
    { value: 'afternoon', label: 'Tarde' },
    { value: 'evening', label: 'Noite' },
    { value: 'variable', label: 'Variável' },
  ];

  const goalOptions = [
    { value: 'weight_loss', label: 'Perda de peso' },
    { value: 'weight_gain', label: 'Ganho de peso' },
    { value: 'muscle_gain', label: 'Ganho de massa muscular' },
    { value: 'health', label: 'Melhoria da saúde' },
    { value: 'performance', label: 'Performance esportiva' },
    { value: 'maintenance', label: 'Manutenção' },
  ];

  const motivationOptions = [
    { value: 'low', label: 'Baixa' },
    { value: 'moderate', label: 'Moderada' },
    { value: 'high', label: 'Alta' },
  ];

  const stressOptions = [
    { value: 'low', label: 'Baixo' },
    { value: 'moderate', label: 'Moderado' },
    { value: 'high', label: 'Alto' },
  ];

  const commonAllergies = [
    'Amendoim', 'Nozes', 'Leite', 'Ovos', 'Trigo', 'Soja', 'Peixes', 
    'Frutos do mar', 'Gergelim'
  ];

  const commonIntolerances = [
    'Lactose', 'Glúten', 'Frutose', 'Histamina', 'FODMAPs'
  ];

  const dietaryRestrictionOptions = [
    'Vegetariano', 'Vegano', 'Sem glúten', 'Sem lactose', 'Low carb',
    'Kosher', 'Halal', 'Sem carne vermelha', 'Sem porco'
  ];

  const commonHealthConditions = [
    'Diabetes tipo 1', 'Diabetes tipo 2', 'Pré-diabetes', 'Hipertensão',
    'Colesterol alto', 'Triglicerídeos alto', 'Hipotireoidismo', 'Hipertireoidismo',
    'Gastrite', 'Refluxo', 'Síndrome do intestino irritável', 'Doença celíaca',
    'Esteatose hepática', 'Gota', 'Anemia'
  ];

  // Carregar dados existentes
  useEffect(() => {
    loadAnamnesis();
  }, [athleteId]);

  const loadAnamnesis = async () => {
    try {
      setLoading(true);
      const response = await api.get<AnamnesisData>(`/nutrition-advanced/anamnesis/${athleteId}`);
      if (response.data) {
        setFormData(prev => ({ ...prev, ...(response.data as AnamnesisData) }));
      }
    } catch (error) {
      console.error('Erro ao carregar anamnese:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post('/nutrition-advanced/anamnesis', formData);
      onSave?.();
    } catch (error) {
      console.error('Erro ao salvar anamnese:', error);
      toast.error('Erro ao salvar anamnese');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: string, item: string) => {
    const currentArray = (formData as any)[field] || [];
    if (currentArray.includes(item)) {
      updateField(field, currentArray.filter((i: string) => i !== item));
    } else {
      updateField(field, [...currentArray, item]);
    }
  };

  // Componente de Seção Colapsável
  const Section = ({ 
    id, 
    title, 
    icon: Icon, 
    children 
  }: { 
    id: string; 
    title: string; 
    icon: any; 
    children: React.ReactNode 
  }) => {
    const isExpanded = expandedSections.includes(id);
    
    return (
      <Card className="mb-4">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-100 flex items-center justify-center">
              <Icon className="w-5 h-5 text-lime-600" />
            </div>
            <span className="font-semibold text-zinc-900">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          )}
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4">
            <div className="border-t border-zinc-100 pt-4">
              {children}
            </div>
          </div>
        )}
      </Card>
    );
  };

  // Componentes de Input
  const InputField = ({ 
    label, 
    type = 'text', 
    field, 
    placeholder = '',
    unit = '',
    min,
    max,
    step
  }: { 
    label: string; 
    type?: string; 
    field: string; 
    placeholder?: string;
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
  }) => (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={(formData as any)[field] || ''}
          onChange={(e) => updateField(field, type === 'number' ? Number(e.target.value) : e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={readOnly}
          className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent disabled:bg-zinc-50 disabled:text-zinc-500"
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  );

  const SelectField = ({ 
    label, 
    field, 
    options 
  }: { 
    label: string; 
    field: string; 
    options: { value: string; label: string }[] 
  }) => (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">
        {label}
      </label>
      <select
        value={(formData as any)[field] || ''}
        onChange={(e) => updateField(field, e.target.value)}
        disabled={readOnly}
        className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent disabled:bg-zinc-50"
      >
        <option value="">Selecione...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const TextAreaField = ({ 
    label, 
    field, 
    placeholder = '',
    rows = 3
  }: { 
    label: string; 
    field: string; 
    placeholder?: string;
    rows?: number;
  }) => (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">
        {label}
      </label>
      <textarea
        value={(formData as any)[field] || ''}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={readOnly}
        className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none disabled:bg-zinc-50"
      />
    </div>
  );

  const CheckboxGroup = ({ 
    label, 
    field, 
    options 
  }: { 
    label: string; 
    field: string; 
    options: string[] 
  }) => (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const isSelected = ((formData as any)[field] || []).includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => !readOnly && toggleArrayItem(field, option)}
              disabled={readOnly}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-lime-500 text-black'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              } ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );

  const ToggleField = ({ 
    label, 
    field,
    description
  }: { 
    label: string; 
    field: string;
    description?: string;
  }) => (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={(formData as any)[field] || false}
        onChange={(e) => updateField(field, e.target.checked)}
        disabled={readOnly}
        className="mt-1 w-5 h-5 rounded border-zinc-300 text-lime-500 focus:ring-lime-500"
      />
      <div>
        <span className="text-sm font-medium text-zinc-700">{label}</span>
        {description && (
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Anamnese Nutricional</h2>
          <p className="text-zinc-500 mt-1">Paciente: {athleteName}</p>
        </div>
        
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

      {/* Data da Avaliação */}
      <Card className="mb-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Data da Avaliação"
            type="date"
            field="evaluation_date"
          />
        </div>
      </Card>

      {/* Seção: Histórico de Peso */}
      <Section id="peso" title="Histórico de Peso" icon={Activity}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField
            label="Peso Atual"
            type="number"
            field="current_weight"
            unit="kg"
            step={0.1}
          />
          <InputField
            label="Peso Habitual"
            type="number"
            field="usual_weight"
            unit="kg"
            step={0.1}
          />
          <InputField
            label="Peso Desejado"
            type="number"
            field="desired_weight"
            unit="kg"
            step={0.1}
          />
          <InputField
            label="Maior Peso (já teve)"
            type="number"
            field="max_weight_ever"
            unit="kg"
            step={0.1}
          />
          <InputField
            label="Menor Peso (adulto)"
            type="number"
            field="min_weight_adult"
            unit="kg"
            step={0.1}
          />
          <SelectField
            label="Variação nos últimos 6 meses"
            field="weight_variation_last_6m"
            options={weightVariationOptions}
          />
          {(formData.weight_variation_last_6m === 'gained' || formData.weight_variation_last_6m === 'lost') && (
            <InputField
              label="Quantidade (kg)"
              type="number"
              field="weight_variation_amount"
              unit="kg"
              step={0.1}
            />
          )}
        </div>
        
        <div className="mt-4">
          <TextAreaField
            label="Histórico de Dietas Anteriores"
            field="diet_history_notes"
            placeholder="Descreva dietas já realizadas, resultados obtidos, etc."
            rows={3}
          />
        </div>
      </Section>

      {/* Seção: Hábitos Alimentares */}
      <Section id="habitos" title="Hábitos Alimentares" icon={Utensils}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField
            label="Refeições por dia"
            type="number"
            field="meals_per_day"
            min={1}
            max={10}
          />
          <SelectField
            label="Local das principais refeições"
            field="main_meals_location"
            options={mealLocationOptions}
          />
          <InputField
            label="Quem prepara as refeições"
            type="text"
            field="who_prepares_meals"
            placeholder="Ex: Eu mesmo, esposa, marmita..."
          />
          <SelectField
            label="Velocidade ao comer"
            field="eating_speed"
            options={speedOptions}
          />
          <SelectField
            label="Qualidade da mastigação"
            field="chewing_quality"
            options={qualityOptions}
          />
          <SelectField
            label="Apetite"
            field="appetite"
            options={appetiteOptions}
          />
        </div>

        <div className="mt-4 space-y-4">
          <TextAreaField
            label="Preferências Alimentares"
            field="food_preferences_text"
            placeholder="Alimentos que gosta..."
            rows={2}
          />
          <TextAreaField
            label="Aversões Alimentares"
            field="food_aversions_text"
            placeholder="Alimentos que não gosta ou evita..."
            rows={2}
          />
        </div>
      </Section>

      {/* Seção: Alergias e Intolerâncias */}
      <Section id="alergias" title="Alergias e Intolerâncias" icon={AlertCircle}>
        <div className="space-y-6">
          <div>
            <ToggleField
              label="Possui alergias alimentares?"
              field="has_food_allergies"
            />
            {formData.has_food_allergies && (
              <div className="mt-3 ml-8">
                <CheckboxGroup
                  label="Selecione as alergias"
                  field="food_allergies"
                  options={commonAllergies}
                />
              </div>
            )}
          </div>

          <div>
            <ToggleField
              label="Possui intolerâncias alimentares?"
              field="has_food_intolerances"
            />
            {formData.has_food_intolerances && (
              <div className="mt-3 ml-8">
                <CheckboxGroup
                  label="Selecione as intolerâncias"
                  field="food_intolerances"
                  options={commonIntolerances}
                />
              </div>
            )}
          </div>

          <CheckboxGroup
            label="Restrições Alimentares"
            field="dietary_restrictions"
            options={dietaryRestrictionOptions}
          />

          <InputField
            label="Restrições religiosas"
            type="text"
            field="religious_restrictions"
            placeholder="Ex: Não come carne na sexta-feira..."
          />
        </div>
      </Section>

      {/* Seção: Suplementação */}
      <Section id="suplementos" title="Suplementação" icon={FileText}>
        <ToggleField
          label="Utiliza suplementos?"
          field="uses_supplements"
        />
        {formData.uses_supplements && (
          <div className="mt-4">
            <TextAreaField
              label="Descreva os suplementos utilizados"
              field="supplements_text"
              placeholder="Ex: Whey Protein 30g após treino, Creatina 5g/dia, Multivitamínico 1x/dia..."
              rows={3}
            />
          </div>
        )}
      </Section>

      {/* Seção: Hidratação */}
      <Section id="hidratacao" title="Hidratação" icon={Droplet}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Consumo diário de água"
            type="number"
            field="daily_water_intake"
            unit="litros"
            step={0.1}
            min={0}
            max={10}
          />
          <InputField
            label="Preferência de água"
            type="text"
            field="water_intake_preference"
            placeholder="Ex: Natural, gelada, com gás..."
          />
        </div>
        <div className="mt-4">
          <TextAreaField
            label="Outras bebidas consumidas"
            field="other_beverages_text"
            placeholder="Ex: 3 cafés/dia, 1 refrigerante/semana, chá à noite..."
            rows={2}
          />
        </div>
      </Section>

      {/* Seção: Hábitos Intestinais */}
      <Section id="intestino" title="Hábitos Intestinais" icon={Activity}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Frequência evacuatória"
            field="bowel_frequency"
            options={bowelFrequencyOptions}
          />
          <SelectField
            label="Consistência das fezes"
            field="bowel_consistency"
            options={bowelConsistencyOptions}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <ToggleField label="Constipação" field="has_constipation" />
          <ToggleField label="Diarreia frequente" field="has_diarrhea" />
        </div>
      </Section>

      {/* Seção: Sono e Estresse */}
      <Section id="sono" title="Sono e Estresse" icon={Moon}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Horas de sono por noite"
            type="number"
            field="sleep_hours"
            unit="h"
            step={0.5}
            min={0}
            max={24}
          />
          <SelectField
            label="Qualidade do sono"
            field="sleep_quality"
            options={qualityOptions}
          />
          <SelectField
            label="Nível de estresse"
            field="stress_level"
            options={stressOptions}
          />
        </div>
      </Section>

      {/* Seção: Atividade Física */}
      <Section id="atividade" title="Atividade Física" icon={Activity}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField
            label="Nível de atividade"
            field="physical_activity_level"
            options={activityLevelOptions}
          />
          <InputField
            label="Frequência semanal"
            type="number"
            field="exercise_frequency"
            unit="x/sem"
            min={0}
            max={14}
          />
          <InputField
            label="Duração por sessão"
            type="number"
            field="exercise_duration"
            unit="min"
            min={0}
            max={300}
          />
          <SelectField
            label="Horário preferido"
            field="exercise_time"
            options={exerciseTimeOptions}
          />
        </div>
        <div className="mt-4">
          <TextAreaField
            label="Tipos de exercício"
            field="exercise_types_text"
            placeholder="Ex: Musculação, corrida, natação..."
            rows={2}
          />
        </div>
      </Section>

      {/* Seção: Condições de Saúde */}
      <Section id="saude" title="Condições de Saúde" icon={Heart}>
        <CheckboxGroup
          label="Condições de saúde"
          field="health_conditions"
          options={commonHealthConditions}
        />
        
        <div className="mt-4">
          <TextAreaField
            label="Medicamentos em uso"
            field="medications_text"
            placeholder="Ex: Metformina 500mg 2x/dia, Losartana 50mg 1x/dia..."
            rows={2}
          />
        </div>

        <div className="mt-4">
          <TextAreaField
            label="Histórico de saúde familiar"
            field="family_health_history_text"
            placeholder="Ex: Mãe diabética, pai com hipertensão..."
            rows={2}
          />
        </div>

        {/* Sintomas GI */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-zinc-700 mb-3">
            Sintomas Gastrointestinais
          </label>
          <div className="flex flex-wrap gap-4">
            <ToggleField label="Azia/Refluxo" field="has_heartburn" />
            <ToggleField label="Distensão" field="has_bloating" />
            <ToggleField label="Náusea" field="has_nausea" />
            <ToggleField label="Gases" field="has_gas" />
          </div>
          <div className="mt-3">
            <TextAreaField
              label="Observações sobre sintomas GI"
              field="gi_symptoms_notes"
              placeholder="Descreva detalhes..."
              rows={2}
            />
          </div>
        </div>
      </Section>

      {/* Seção: Objetivos */}
      <Section id="objetivos" title="Objetivos" icon={Target}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Objetivo principal"
            field="primary_goal"
            options={goalOptions}
          />
          <InputField
            label="Prazo para atingir"
            type="date"
            field="goal_deadline"
          />
          <SelectField
            label="Nível de motivação"
            field="motivation_level"
            options={motivationOptions}
          />
        </div>
        <div className="mt-4">
          <TextAreaField
            label="Objetivos secundários"
            field="secondary_goals_text"
            placeholder="Ex: Melhorar energia, reduzir % gordura, performance..."
            rows={2}
          />
        </div>
      </Section>

      {/* Seção: Recordatório 24h */}
      <Section id="recordatorio" title="Recordatório 24h Inicial" icon={FileText}>
        <TextAreaField
          label="O que o paciente comeu nas últimas 24 horas"
          field="recall_24h"
          placeholder="Descreva todas as refeições e lanches do dia anterior, com horários e quantidades aproximadas..."
          rows={6}
        />
      </Section>

      {/* Observações Finais */}
      <Card className="mb-6 p-4">
        <TextAreaField
          label="Observações Gerais"
          field="observations"
          placeholder="Anotações adicionais relevantes para o acompanhamento nutricional..."
          rows={4}
        />
      </Card>

      {/* Botão de Salvar (Footer) */}
      {!readOnly && (
        <div className="sticky bottom-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-lime-500 text-black font-semibold rounded-xl hover:bg-lime-400 transition-colors shadow-lg disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Salvando...' : 'Salvar Anamnese'}
          </button>
        </div>
      )}
    </div>
  );
}
