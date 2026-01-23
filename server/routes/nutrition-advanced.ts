/**
 * Rotas Avançadas de Nutrição (Estilo DietBox)
 * 
 * Este módulo contém todas as APIs relacionadas a:
 * - Anamnese Nutricional
 * - Avaliação Antropométrica
 * - Cálculo de Necessidades Energéticas (TMB/GET/VET)
 * - Recordatório Alimentar 24h
 * - Receitas
 * - Lista de Compras
 * - Equivalentes Alimentares
 * - Acompanhamento Diário
 */

import { Router, Request, Response } from 'express';
import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

// ===========================================
// SECURITY: Sanitização de erros para não expor stack traces
// ===========================================
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const sanitizeError = (error: unknown, isProduction: boolean): string => {
  if (!isProduction && error instanceof Error) {
    return error.message;
  }
  return 'Erro interno do servidor';
};

// ===========================================
// SECURITY: Whitelist de campos permitidos para queries dinâmicas
// ===========================================
const ALLOWED_ANAMNESIS_FIELDS = [
  'athlete_id', 'nutritionist_id', 'evaluation_date', 'main_complaint', 'clinical_history',
  'family_history', 'current_medications', 'supplements', 'allergies', 'food_intolerances',
  'dietary_restrictions', 'eating_habits', 'meal_frequency', 'water_intake', 'alcohol_consumption',
  'smoking', 'physical_activity', 'sleep_quality', 'stress_level', 'bowel_function',
  'appetite', 'food_preferences', 'food_aversions', 'goals', 'observations'
];

const ALLOWED_ANTHROPOMETRIC_FIELDS = [
  'athlete_id', 'nutritionist_id', 'assessment_date', 'weight', 'height', 'bmi', 'bmi_classification',
  'body_fat_percentage', 'muscle_mass', 'bone_mass', 'body_water', 'visceral_fat',
  'waist_circumference', 'hip_circumference', 'chest_circumference', 'arm_circumference',
  'thigh_circumference', 'calf_circumference', 'neck_circumference', 'subscapular_skinfold',
  'triceps_skinfold', 'biceps_skinfold', 'suprailiac_skinfold', 'abdominal_skinfold',
  'thigh_skinfold', 'calf_skinfold', 'observations'
];

const ALLOWED_ENERGY_FIELDS = [
  'athlete_id', 'nutritionist_id', 'calculation_date', 'weight', 'height', 'age', 'sex',
  'activity_level', 'bmr_formula', 'bmr', 'tdee', 'goal', 'caloric_adjustment',
  'target_calories', 'protein_ratio', 'carb_ratio', 'fat_ratio', 'protein_grams',
  'carb_grams', 'fat_grams', 'observations', 'is_active', 'protein_per_kg', 'protein_percentage',
  'protein_calories', 'carbs_per_kg', 'carbs_percentage', 'carbs_calories', 'fat_per_kg',
  'fat_percentage', 'fat_calories', 'fiber_grams', 'water_liters'
];

// Função para filtrar apenas campos permitidos
const filterAllowedFields = (data: Record<string, any>, allowedFields: string[]): Record<string, any> => {
  const filtered: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    if (allowedFields.includes(key)) {
      filtered[key] = data[key];
    }
  }
  return filtered;
};

// Interfaces
interface NutritionAnamnesis {
  id?: number;
  athlete_id: number;
  nutritionist_id: number;
  evaluation_date: string;
  // ... outros campos
  [key: string]: any;
}

interface AnthropometricAssessment {
  id?: number;
  athlete_id: number;
  nutritionist_id: number;
  assessment_date: string;
  weight: number;
  height: number;
  // ... outros campos
  [key: string]: any;
}

interface EnergyRequirements {
  id?: number;
  athlete_id: number;
  nutritionist_id: number;
  calculation_date: string;
  weight: number;
  height: number;
  age: number;
  sex: 'male' | 'female';
  // ... outros campos
  [key: string]: any;
}

// Funções de cálculo nutricional
const NutritionCalculator = {
  /**
   * Calcula IMC (Índice de Massa Corporal)
   */
  calculateBMI(weight: number, heightCm: number): { value: number; classification: string } {
    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    
    let classification = 'normal';
    if (bmi < 18.5) classification = 'underweight';
    else if (bmi >= 18.5 && bmi < 25) classification = 'normal';
    else if (bmi >= 25 && bmi < 30) classification = 'overweight';
    else if (bmi >= 30 && bmi < 35) classification = 'obese_1';
    else if (bmi >= 35 && bmi < 40) classification = 'obese_2';
    else classification = 'obese_3';
    
    return { value: Math.round(bmi * 100) / 100, classification };
  },

  /**
   * Calcula Relação Cintura-Quadril (RCQ)
   */
  calculateWaistHipRatio(waist: number, hip: number): number {
    return Math.round((waist / hip) * 1000) / 1000;
  },

  /**
   * Calcula Relação Cintura-Estatura (RCEst)
   */
  calculateWaistHeightRatio(waist: number, height: number): number {
    return Math.round((waist / height) * 1000) / 1000;
  },

  /**
   * Calcula % de Gordura Corporal (Protocolo 7 dobras - Jackson & Pollock)
   */
  calculateBodyFat7Folds(
    sex: 'male' | 'female',
    age: number,
    folds: {
      triceps: number;
      subscapular: number;
      chest: number;
      midaxillary: number;
      suprailiac: number;
      abdominal: number;
      thigh: number;
    }
  ): { percentage: number; classification: string } {
    const sumFolds = Object.values(folds).reduce((a, b) => a + b, 0);
    let density: number;
    
    if (sex === 'male') {
      // Fórmula Jackson & Pollock para homens (7 dobras)
      density = 1.112 - (0.00043499 * sumFolds) + (0.00000055 * sumFolds * sumFolds) - (0.00028826 * age);
    } else {
      // Fórmula Jackson & Pollock para mulheres (7 dobras)
      density = 1.097 - (0.00046971 * sumFolds) + (0.00000056 * sumFolds * sumFolds) - (0.00012828 * age);
    }
    
    // Fórmula de Siri para converter densidade em % gordura
    const bodyFatPercentage = ((4.95 / density) - 4.5) * 100;
    
    // Classificação
    let classification = 'normal';
    if (sex === 'male') {
      if (bodyFatPercentage < 6) classification = 'essential';
      else if (bodyFatPercentage < 14) classification = 'athletic';
      else if (bodyFatPercentage < 18) classification = 'fitness';
      else if (bodyFatPercentage < 25) classification = 'normal';
      else classification = 'obese';
    } else {
      if (bodyFatPercentage < 14) classification = 'essential';
      else if (bodyFatPercentage < 21) classification = 'athletic';
      else if (bodyFatPercentage < 25) classification = 'fitness';
      else if (bodyFatPercentage < 32) classification = 'normal';
      else classification = 'obese';
    }
    
    return {
      percentage: Math.round(bodyFatPercentage * 100) / 100,
      classification
    };
  },

  /**
   * Calcula TMB (Taxa Metabólica Basal) usando diferentes fórmulas
   */
  calculateBMR(
    weight: number,
    heightCm: number,
    age: number,
    sex: 'male' | 'female',
    formula: 'harris_benedict' | 'mifflin_st_jeor' | 'katch_mcardle' = 'mifflin_st_jeor',
    leanMass?: number
  ): number {
    let bmr: number;
    
    switch (formula) {
      case 'harris_benedict':
        // Fórmula Harris-Benedict Revisada (1984)
        if (sex === 'male') {
          bmr = 88.362 + (13.397 * weight) + (4.799 * heightCm) - (5.677 * age);
        } else {
          bmr = 447.593 + (9.247 * weight) + (3.098 * heightCm) - (4.330 * age);
        }
        break;
        
      case 'mifflin_st_jeor':
        // Fórmula Mifflin-St Jeor (mais precisa para a maioria das pessoas)
        if (sex === 'male') {
          bmr = (10 * weight) + (6.25 * heightCm) - (5 * age) + 5;
        } else {
          bmr = (10 * weight) + (6.25 * heightCm) - (5 * age) - 161;
        }
        break;
        
      case 'katch_mcardle':
        // Fórmula Katch-McArdle (requer massa magra)
        if (leanMass) {
          bmr = 370 + (21.6 * leanMass);
        } else {
          // Fallback para Mifflin-St Jeor se não tiver massa magra
          return this.calculateBMR(weight, heightCm, age, sex, 'mifflin_st_jeor');
        }
        break;
        
      default:
        bmr = this.calculateBMR(weight, heightCm, age, sex, 'mifflin_st_jeor');
    }
    
    return Math.round(bmr);
  },

  /**
   * Fatores de atividade para cálculo do GET
   */
  activityFactors: {
    sedentary: 1.2,        // Pouco ou nenhum exercício
    light: 1.375,          // Exercício leve 1-3 dias/semana
    moderate: 1.55,        // Exercício moderado 3-5 dias/semana
    active: 1.725,         // Exercício intenso 6-7 dias/semana
    very_active: 1.9,      // Exercício muito intenso, trabalho físico
    athlete: 2.0           // Atleta profissional, 2x treinos/dia
  } as Record<string, number>,

  /**
   * Calcula GET (Gasto Energético Total / TDEE)
   */
  calculateTDEE(bmr: number, activityLevel: string): number {
    const factor = this.activityFactors[activityLevel] || 1.2;
    return Math.round(bmr * factor);
  },

  /**
   * Calcula distribuição de macronutrientes
   */
  calculateMacros(
    totalCalories: number,
    weight: number,
    goal: 'maintenance' | 'weight_loss' | 'muscle_gain' | 'athletic_performance'
  ): {
    protein: { grams: number; calories: number; percentage: number; perKg: number };
    carbs: { grams: number; calories: number; percentage: number; perKg: number };
    fat: { grams: number; calories: number; percentage: number; perKg: number };
  } {
    let proteinPerKg: number;
    let fatPercentage: number;
    
    // Define proteína por kg e % gordura baseado no objetivo
    switch (goal) {
      case 'weight_loss':
        proteinPerKg = 2.0; // Maior proteína para preservar massa magra
        fatPercentage = 25;
        break;
      case 'muscle_gain':
        proteinPerKg = 2.2;
        fatPercentage = 25;
        break;
      case 'athletic_performance':
        proteinPerKg = 1.8;
        fatPercentage = 20; // Mais carbs para energia
        break;
      default: // maintenance
        proteinPerKg = 1.6;
        fatPercentage = 30;
    }
    
    const proteinGrams = Math.round(weight * proteinPerKg);
    const proteinCalories = proteinGrams * 4;
    
    const fatCalories = Math.round(totalCalories * (fatPercentage / 100));
    const fatGrams = Math.round(fatCalories / 9);
    
    const carbsCalories = totalCalories - proteinCalories - fatCalories;
    const carbsGrams = Math.round(carbsCalories / 4);
    
    return {
      protein: {
        grams: proteinGrams,
        calories: proteinCalories,
        percentage: Math.round((proteinCalories / totalCalories) * 100),
        perKg: proteinPerKg
      },
      carbs: {
        grams: carbsGrams,
        calories: carbsCalories,
        percentage: Math.round((carbsCalories / totalCalories) * 100),
        perKg: Math.round((carbsGrams / weight) * 10) / 10
      },
      fat: {
        grams: fatGrams,
        calories: fatCalories,
        percentage: fatPercentage,
        perKg: Math.round((fatGrams / weight) * 10) / 10
      }
    };
  },

  /**
   * Calcula necessidade hídrica
   */
  calculateWaterNeeds(weight: number, activityLevel: string, climate: 'normal' | 'hot' = 'normal'): number {
    // Base: 35ml por kg
    let mlPerKg = 35;
    
    // Ajuste por atividade
    if (['active', 'very_active', 'athlete'].includes(activityLevel)) {
      mlPerKg += 10;
    } else if (activityLevel === 'moderate') {
      mlPerKg += 5;
    }
    
    // Ajuste por clima
    if (climate === 'hot') {
      mlPerKg += 10;
    }
    
    const totalMl = weight * mlPerKg;
    return Math.round((totalMl / 1000) * 10) / 10; // Em litros
  }
};

export function createNutritionAdvancedRoutes(pool: Pool): Router {
  const router = Router();

  // ===============================
  // ANAMNESE NUTRICIONAL
  // ===============================

  /**
   * Buscar anamnese de um atleta
   */
  router.get('/anamnesis/:athleteId', async (req: Request, res: Response) => {
    try {
      const { athleteId } = req.params;
      
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT na.*, u.name as nutritionist_name, a.name as athlete_name
         FROM nutrition_anamnesis na
         JOIN users u ON na.nutritionist_id = u.id
         JOIN athletes a ON na.athlete_id = a.id
         WHERE na.athlete_id = ?`,
        [athleteId]
      );
      
      if (rows.length === 0) {
        return res.json(null);
      }
      
      // Parse JSON fields
      const anamnesis = rows[0];
      const jsonFields = [
        'previous_diets', 'food_preferences', 'food_aversions', 
        'food_allergies', 'food_intolerances', 'dietary_restrictions',
        'supplements', 'other_beverages', 'exercise_types',
        'health_conditions', 'medications', 'family_health_history',
        'secondary_goals', 'recall_24h'
      ];
      
      jsonFields.forEach(field => {
        if (anamnesis[field] && typeof anamnesis[field] === 'string') {
          try {
            anamnesis[field] = JSON.parse(anamnesis[field]);
          } catch (e) {
            // Keep as string if not valid JSON
          }
        }
      });
      
      res.json(anamnesis);
    } catch (error) {
      console.error('Error fetching anamnesis:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Criar/Atualizar anamnese nutricional
   */
  router.post('/anamnesis', async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      // Stringify JSON fields
      const jsonFields = [
        'previous_diets', 'food_preferences', 'food_aversions', 
        'food_allergies', 'food_intolerances', 'dietary_restrictions',
        'supplements', 'other_beverages', 'exercise_types',
        'health_conditions', 'medications', 'family_health_history',
        'secondary_goals', 'recall_24h'
      ];
      
      jsonFields.forEach(field => {
        if (data[field] && typeof data[field] !== 'string') {
          data[field] = JSON.stringify(data[field]);
        }
      });
      
      // Check if anamnesis already exists
      const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM nutrition_anamnesis WHERE athlete_id = ?',
        [data.athlete_id]
      );
      
      if (existing.length > 0) {
        // Update
        const id = existing[0].id;
        delete data.athlete_id; // Don't update athlete_id
        
        // SECURITY: Filtrar apenas campos permitidos
        const filteredData = filterAllowedFields(data, ALLOWED_ANAMNESIS_FIELDS);
        const fields = Object.keys(filteredData);
        const values = Object.values(filteredData);
        
        if (fields.length === 0) {
          return res.status(400).json({ error: 'Nenhum campo válido para atualizar' });
        }
        
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        
        await pool.query(
          `UPDATE nutrition_anamnesis SET ${setClause} WHERE id = ?`,
          [...values, id]
        );
        
        res.json({ id, message: 'Anamnese atualizada com sucesso' });
      } else {
        // Insert
        // SECURITY: Filtrar apenas campos permitidos
        const filteredData = filterAllowedFields(data, ALLOWED_ANAMNESIS_FIELDS);
        const fields = Object.keys(filteredData);
        const values = Object.values(filteredData);
        
        if (fields.length === 0) {
          return res.status(400).json({ error: 'Nenhum campo válido para inserir' });
        }
        
        const placeholders = fields.map(() => '?').join(', ');
        
        const [result] = await pool.query<ResultSetHeader>(
          `INSERT INTO nutrition_anamnesis (${fields.join(', ')}) VALUES (${placeholders})`,
          values
        );
        
        res.status(201).json({ id: result.insertId, message: 'Anamnese criada com sucesso' });
      }
    } catch (error) {
      console.error('Error saving anamnesis:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  // ===============================
  // AVALIAÇÃO ANTROPOMÉTRICA
  // ===============================

  /**
   * Listar avaliações antropométricas de um atleta
   */
  router.get('/anthropometric/:athleteId', async (req: Request, res: Response) => {
    try {
      const { athleteId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT aa.*, u.name as nutritionist_name
         FROM anthropometric_assessments aa
         JOIN users u ON aa.nutritionist_id = u.id
         WHERE aa.athlete_id = ?
         ORDER BY aa.assessment_date DESC
         LIMIT ?`,
        [athleteId, limit]
      );
      
      res.json(rows);
    } catch (error) {
      console.error('Error fetching anthropometric assessments:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Buscar última avaliação antropométrica
   */
  router.get('/anthropometric/:athleteId/latest', async (req: Request, res: Response) => {
    try {
      const { athleteId } = req.params;
      
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT aa.*, u.name as nutritionist_name
         FROM anthropometric_assessments aa
         JOIN users u ON aa.nutritionist_id = u.id
         WHERE aa.athlete_id = ?
         ORDER BY aa.assessment_date DESC
         LIMIT 1`,
        [athleteId]
      );
      
      res.json(rows[0] || null);
    } catch (error) {
      console.error('Error fetching latest assessment:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Criar avaliação antropométrica
   */
  router.post('/anthropometric', async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      // Calcular IMC
      if (data.weight && data.height) {
        const bmi = NutritionCalculator.calculateBMI(data.weight, data.height);
        data.bmi = bmi.value;
        data.bmi_classification = bmi.classification;
      }
      
      // Calcular RCQ (Relação Cintura-Quadril)
      if (data.waist_circumference && data.hip_circumference) {
        data.waist_hip_ratio = NutritionCalculator.calculateWaistHipRatio(
          data.waist_circumference,
          data.hip_circumference
        );
      }
      
      // Calcular RCEst (Relação Cintura-Estatura)
      if (data.waist_circumference && data.height) {
        data.waist_height_ratio = NutritionCalculator.calculateWaistHeightRatio(
          data.waist_circumference,
          data.height
        );
      }
      
      // Calcular % gordura por dobras cutâneas
      if (data.triceps_skinfold && data.subscapular_skinfold && data.chest_skinfold &&
          data.midaxillary_skinfold && data.suprailiac_skinfold && 
          data.abdominal_skinfold && data.thigh_skinfold) {
        
        // Precisamos buscar sexo e idade do atleta
        const [athleteRows] = await pool.query<RowDataPacket[]>(
          `SELECT u.birth_date, a.sex 
           FROM athletes a 
           JOIN users u ON a.user_id = u.id 
           WHERE a.id = ?`,
          [data.athlete_id]
        );
        
        if (athleteRows.length > 0) {
          const athlete = athleteRows[0];
          const birthDate = new Date(athlete.birth_date);
          const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          const sex = athlete.sex || 'male';
          
          const bodyFat = NutritionCalculator.calculateBodyFat7Folds(
            sex,
            age,
            {
              triceps: data.triceps_skinfold,
              subscapular: data.subscapular_skinfold,
              chest: data.chest_skinfold,
              midaxillary: data.midaxillary_skinfold,
              suprailiac: data.suprailiac_skinfold,
              abdominal: data.abdominal_skinfold,
              thigh: data.thigh_skinfold
            }
          );
          
          data.body_fat_percentage = bodyFat.percentage;
          data.body_fat_classification = bodyFat.classification;
          
          // Calcular massa gorda e magra
          if (data.weight) {
            data.fat_mass = Math.round((data.weight * bodyFat.percentage / 100) * 100) / 100;
            data.lean_mass = Math.round((data.weight - data.fat_mass) * 100) / 100;
          }
        }
      }
      
      // SECURITY: Filtrar apenas campos permitidos
      const filteredData = filterAllowedFields(data, ALLOWED_ANTHROPOMETRIC_FIELDS);
      const fields = Object.keys(filteredData);
      const values = Object.values(filteredData);
      
      if (fields.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo válido para inserir' });
      }
      
      const placeholders = fields.map(() => '?').join(', ');
      
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO anthropometric_assessments (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );
      
      res.status(201).json({ 
        id: result.insertId, 
        message: 'Avaliação antropométrica criada',
        calculations: {
          bmi: data.bmi,
          bmi_classification: data.bmi_classification,
          body_fat_percentage: data.body_fat_percentage,
          body_fat_classification: data.body_fat_classification,
          fat_mass: data.fat_mass,
          lean_mass: data.lean_mass
        }
      });
    } catch (error) {
      console.error('Error creating anthropometric assessment:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Atualizar avaliação antropométrica
   */
  router.put('/anthropometric/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      // Recalcular se peso/altura mudaram
      if (data.weight && data.height) {
        const bmi = NutritionCalculator.calculateBMI(data.weight, data.height);
        data.bmi = bmi.value;
        data.bmi_classification = bmi.classification;
      }
      
      // SECURITY: Filtrar apenas campos permitidos
      const filteredData = filterAllowedFields(data, ALLOWED_ANTHROPOMETRIC_FIELDS);
      const fields = Object.keys(filteredData);
      const values = Object.values(filteredData);
      
      if (fields.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo válido para atualizar' });
      }
      
      const setClause = fields.map(f => `${f} = ?`).join(', ');
      
      await pool.query(
        `UPDATE anthropometric_assessments SET ${setClause} WHERE id = ?`,
        [...values, id]
      );
      
      res.json({ message: 'Avaliação atualizada' });
    } catch (error) {
      console.error('Error updating anthropometric assessment:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  // ===============================
  // CÁLCULO DE NECESSIDADES ENERGÉTICAS
  // ===============================

  /**
   * Buscar necessidades energéticas ativas de um atleta
   */
  router.get('/energy-requirements/:athleteId', async (req: Request, res: Response) => {
    try {
      const { athleteId } = req.params;
      
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT er.*, u.name as nutritionist_name
         FROM energy_requirements er
         JOIN users u ON er.nutritionist_id = u.id
         WHERE er.athlete_id = ? AND er.is_active = TRUE
         ORDER BY er.calculation_date DESC
         LIMIT 1`,
        [athleteId]
      );
      
      res.json(rows[0] || null);
    } catch (error) {
      console.error('Error fetching energy requirements:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Calcular e salvar necessidades energéticas
   */
  router.post('/energy-requirements/calculate', async (req: Request, res: Response) => {
    try {
      const {
        athlete_id,
        nutritionist_id,
        weight,
        height,
        age,
        sex,
        activity_level,
        goal,
        bmr_formula = 'mifflin_st_jeor',
        caloric_adjustment = 0,
        lean_mass
      } = req.body;
      
      // Calcular TMB
      const bmr = NutritionCalculator.calculateBMR(
        weight,
        height,
        age,
        sex,
        bmr_formula,
        lean_mass
      );
      
      // Obter fator de atividade
      const activityFactor = NutritionCalculator.activityFactors[activity_level] || 1.2;
      
      // Calcular GET (TDEE)
      const tdee = NutritionCalculator.calculateTDEE(bmr, activity_level);
      
      // Calcular ETA (Efeito Térmico dos Alimentos) - ~10%
      const teaPercentage = 10;
      const teaValue = Math.round(tdee * 0.1);
      
      // Calcular VET (meta calórica com ajuste)
      const vet = tdee + caloric_adjustment;
      
      // Determinar tipo de ajuste
      let adjustmentType = 'maintenance';
      if (caloric_adjustment < 0) adjustmentType = 'deficit';
      else if (caloric_adjustment > 0) adjustmentType = 'surplus';
      
      // Calcular macros
      const macros = NutritionCalculator.calculateMacros(vet, weight, goal);
      
      // Calcular necessidade hídrica
      const waterLiters = NutritionCalculator.calculateWaterNeeds(weight, activity_level);
      
      // Desativar cálculos anteriores
      await pool.query(
        'UPDATE energy_requirements SET is_active = FALSE WHERE athlete_id = ?',
        [athlete_id]
      );
      
      // Inserir novo cálculo
      const data = {
        athlete_id,
        nutritionist_id,
        calculation_date: new Date().toISOString().split('T')[0],
        weight,
        height,
        age,
        sex,
        bmr_formula,
        bmr_value: bmr,
        activity_factor: activityFactor,
        activity_level,
        tdee_value: tdee,
        tea_percentage: teaPercentage,
        tea_value: teaValue,
        vet_value: vet,
        caloric_adjustment,
        adjustment_type: adjustmentType,
        protein_per_kg: macros.protein.perKg,
        protein_grams: macros.protein.grams,
        protein_percentage: macros.protein.percentage,
        protein_calories: macros.protein.calories,
        carbs_per_kg: macros.carbs.perKg,
        carbs_grams: macros.carbs.grams,
        carbs_percentage: macros.carbs.percentage,
        carbs_calories: macros.carbs.calories,
        fat_per_kg: macros.fat.perKg,
        fat_grams: macros.fat.grams,
        fat_percentage: macros.fat.percentage,
        fat_calories: macros.fat.calories,
        fiber_grams: 25 + Math.round(vet / 1000) * 5, // ~25-30g base + ajuste
        water_liters: waterLiters,
        is_active: true
      };
      
      // SECURITY: Filtrar apenas campos permitidos
      const filteredData = filterAllowedFields(data, ALLOWED_ENERGY_FIELDS);
      const fields = Object.keys(filteredData);
      const values = Object.values(filteredData);
      
      if (fields.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo válido para inserir' });
      }
      
      const placeholders = fields.map(() => '?').join(', ');
      
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO energy_requirements (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );
      
      res.status(201).json({
        id: result.insertId,
        message: 'Necessidades energéticas calculadas',
        data: {
          bmr,
          tdee,
          vet,
          macros,
          water: waterLiters
        }
      });
    } catch (error) {
      console.error('Error calculating energy requirements:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Endpoint para calcular sem salvar (preview)
   */
  router.post('/energy-requirements/preview', async (req: Request, res: Response) => {
    try {
      const {
        weight,
        height,
        age,
        sex,
        activity_level,
        goal,
        bmr_formula = 'mifflin_st_jeor',
        caloric_adjustment = 0,
        lean_mass
      } = req.body;
      
      const bmr = NutritionCalculator.calculateBMR(weight, height, age, sex, bmr_formula, lean_mass);
      const tdee = NutritionCalculator.calculateTDEE(bmr, activity_level);
      const vet = tdee + caloric_adjustment;
      const macros = NutritionCalculator.calculateMacros(vet, weight, goal);
      const water = NutritionCalculator.calculateWaterNeeds(weight, activity_level);
      
      res.json({
        bmr,
        tdee,
        vet,
        macros,
        water,
        fiber: 25 + Math.round(vet / 1000) * 5
      });
    } catch (error) {
      console.error('Error previewing energy requirements:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  // ===============================
  // RECORDATÓRIO ALIMENTAR 24H
  // ===============================

  /**
   * Listar recordatórios de um atleta
   */
  router.get('/food-recalls/:athleteId', async (req: Request, res: Response) => {
    try {
      const { athleteId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT fr.*, u.name as reviewer_name
         FROM food_recalls fr
         LEFT JOIN users u ON fr.reviewed_by = u.id
         WHERE fr.athlete_id = ?
         ORDER BY fr.recall_date DESC
         LIMIT ?`,
        [athleteId, limit]
      );
      
      res.json(rows);
    } catch (error) {
      console.error('Error fetching food recalls:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Buscar recordatório completo com itens
   */
  router.get('/food-recalls/:athleteId/:recallId', async (req: Request, res: Response) => {
    try {
      const { athleteId, recallId } = req.params;
      
      const [recallRows] = await pool.query<RowDataPacket[]>(
        `SELECT fr.*, u.name as reviewer_name
         FROM food_recalls fr
         LEFT JOIN users u ON fr.reviewed_by = u.id
         WHERE fr.id = ? AND fr.athlete_id = ?`,
        [recallId, athleteId]
      );
      
      if (recallRows.length === 0) {
        return res.status(404).json({ error: 'Recordatório não encontrado' });
      }
      
      const [itemRows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM food_recall_items WHERE recall_id = ? ORDER BY meal_time, order_index`,
        [recallId]
      );
      
      res.json({
        ...recallRows[0],
        items: itemRows
      });
    } catch (error) {
      console.error('Error fetching food recall:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Criar recordatório alimentar
   */
  router.post('/food-recalls', async (req: Request, res: Response) => {
    try {
      const { athlete_id, recall_date, recall_type, patient_notes, items } = req.body;
      
      // Calcular totais
      let totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      };
      
      if (items && items.length > 0) {
        items.forEach((item: any) => {
          totals.calories += Number(item.calories) || 0;
          totals.protein += Number(item.protein) || 0;
          totals.carbs += Number(item.carbs) || 0;
          totals.fat += Number(item.fat) || 0;
        });
      }
      
      // Inserir recordatório
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO food_recalls (athlete_id, recall_date, recall_type, patient_notes, 
         total_calories, total_protein, total_carbs, total_fat, total_fiber, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
        [athlete_id, recall_date, recall_type || '24h', patient_notes,
         totals.calories, totals.protein, totals.carbs, totals.fat, totals.fiber]
      );
      
      const recallId = result.insertId;
      
      // Inserir itens
      if (items && items.length > 0) {
        for (const item of items) {
          await pool.query(
            `INSERT INTO food_recall_items 
             (recall_id, meal_time, meal_name, food_id, food_name, quantity, unit, 
              portion_description, calories, protein, carbs, fat, location, 
              preparation_method, notes, order_index)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [recallId, item.meal_time, item.meal_name, item.food_id, item.food_name,
             item.quantity, item.unit, item.portion_description, item.calories,
             item.protein, item.carbs, item.fat, item.location, 
             item.preparation_method, item.notes, item.order_index || 0]
          );
        }
      }
      
      res.status(201).json({ id: recallId, message: 'Recordatório criado', totals });
    } catch (error) {
      console.error('Error creating food recall:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  /**
   * Analisar recordatório (nutricionista)
   */
  router.put('/food-recalls/:recallId/review', async (req: Request, res: Response) => {
    try {
      const { recallId } = req.params;
      const { reviewed_by, nutritionist_notes, adherence_score } = req.body;
      
      await pool.query(
        `UPDATE food_recalls 
         SET status = 'reviewed', reviewed_by = ?, reviewed_at = NOW(),
             nutritionist_notes = ?, adherence_score = ?
         WHERE id = ?`,
        [reviewed_by, nutritionist_notes, adherence_score, recallId]
      );
      
      res.json({ message: 'Recordatório analisado' });
    } catch (error) {
      console.error('Error reviewing food recall:', error);
      res.status(500).json({ error: sanitizeError(error, IS_PRODUCTION) });
    }
  });

  // ===============================
  // UTILITÁRIOS
  // ===============================

  /**
   * Calcular IMC (endpoint público)
   */
  router.post('/utils/calculate-bmi', (req: Request, res: Response) => {
    const { weight, height } = req.body;
    const result = NutritionCalculator.calculateBMI(weight, height);
    res.json(result);
  });

  /**
   * Calcular TMB (endpoint público)
   */
  router.post('/utils/calculate-bmr', (req: Request, res: Response) => {
    const { weight, height, age, sex, formula, lean_mass } = req.body;
    const result = NutritionCalculator.calculateBMR(weight, height, age, sex, formula, lean_mass);
    res.json({ bmr: result });
  });

  /**
   * Obter fatores de atividade
   */
  router.get('/utils/activity-factors', (_req: Request, res: Response) => {
    res.json(NutritionCalculator.activityFactors);
  });

  return router;
}

export { NutritionCalculator };
