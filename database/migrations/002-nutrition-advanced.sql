-- ===============================
-- MIGRAÇÃO: Sistema Avançado de Nutrição (Estilo DietBox)
-- Data: 2026-01-19
-- ===============================

-- ===============================
-- 1. AVALIAÇÃO NUTRICIONAL
-- ===============================

-- Anamnese Nutricional (histórico alimentar completo)
CREATE TABLE IF NOT EXISTS nutrition_anamnesis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL UNIQUE,
    nutritionist_id INT NOT NULL,
    
    -- Data da avaliação
    evaluation_date DATE NOT NULL,
    
    -- Histórico de Peso
    current_weight DECIMAL(5,2),
    usual_weight DECIMAL(5,2),
    desired_weight DECIMAL(5,2),
    max_weight_ever DECIMAL(5,2),
    min_weight_adult DECIMAL(5,2),
    weight_variation_last_6m VARCHAR(50), -- 'stable', 'gained', 'lost'
    weight_variation_amount DECIMAL(5,2),
    
    -- Histórico de Dietas
    previous_diets TEXT, -- JSON array de dietas anteriores
    diet_history_notes TEXT,
    
    -- Hábitos Alimentares
    meals_per_day INT DEFAULT 3,
    main_meals_location VARCHAR(100), -- 'home', 'work', 'restaurant'
    who_prepares_meals VARCHAR(100),
    eating_speed VARCHAR(50), -- 'slow', 'normal', 'fast'
    chewing_quality VARCHAR(50), -- 'good', 'regular', 'poor'
    appetite VARCHAR(50), -- 'normal', 'increased', 'decreased'
    food_preferences TEXT, -- JSON array
    food_aversions TEXT, -- JSON array
    
    -- Alergias e Intolerâncias
    has_food_allergies BOOLEAN DEFAULT FALSE,
    food_allergies TEXT, -- JSON array
    has_food_intolerances BOOLEAN DEFAULT FALSE,
    food_intolerances TEXT, -- JSON array (lactose, gluten, etc)
    
    -- Restrições Alimentares
    dietary_restrictions TEXT, -- JSON array (vegetarian, vegan, kosher, halal, etc)
    religious_restrictions TEXT,
    
    -- Suplementação
    uses_supplements BOOLEAN DEFAULT FALSE,
    supplements TEXT, -- JSON array com nome, dose, frequência
    
    -- Hidratação
    daily_water_intake DECIMAL(4,2), -- em litros
    water_intake_preference VARCHAR(100), -- tipo de água preferida
    other_beverages TEXT, -- JSON array (café, chá, refrigerante, etc)
    
    -- Hábitos Intestinais
    bowel_frequency VARCHAR(50), -- 'daily', 'every_2_days', 'irregular'
    bowel_consistency VARCHAR(50), -- 'normal', 'hard', 'soft', 'liquid'
    has_constipation BOOLEAN DEFAULT FALSE,
    has_diarrhea BOOLEAN DEFAULT FALSE,
    
    -- Sono e Estresse
    sleep_hours DECIMAL(3,1),
    sleep_quality VARCHAR(50), -- 'good', 'regular', 'poor'
    stress_level VARCHAR(50), -- 'low', 'moderate', 'high'
    
    -- Atividade Física
    physical_activity_level VARCHAR(50), -- 'sedentary', 'light', 'moderate', 'active', 'very_active'
    exercise_frequency INT, -- vezes por semana
    exercise_types TEXT, -- JSON array
    exercise_duration INT, -- minutos por sessão
    exercise_time VARCHAR(50), -- 'morning', 'afternoon', 'evening'
    
    -- Condições de Saúde
    health_conditions TEXT, -- JSON array (diabetes, hipertensão, etc)
    medications TEXT, -- JSON array com nome, dose
    family_health_history TEXT, -- JSON array
    
    -- Sintomas Gastrointestinais
    has_heartburn BOOLEAN DEFAULT FALSE,
    has_bloating BOOLEAN DEFAULT FALSE,
    has_nausea BOOLEAN DEFAULT FALSE,
    has_gas BOOLEAN DEFAULT FALSE,
    gi_symptoms_notes TEXT,
    
    -- Objetivo Nutricional
    primary_goal VARCHAR(100), -- 'weight_loss', 'weight_gain', 'muscle_gain', 'health', 'performance'
    secondary_goals TEXT, -- JSON array
    goal_deadline DATE,
    motivation_level VARCHAR(50), -- 'low', 'moderate', 'high'
    
    -- Recordatório Alimentar 24h Inicial
    recall_24h TEXT, -- JSON com o que comeu nas últimas 24h
    
    -- Observações
    observations TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (nutritionist_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================
-- 2. AVALIAÇÃO ANTROPOMÉTRICA
-- ===============================

CREATE TABLE IF NOT EXISTS anthropometric_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    nutritionist_id INT NOT NULL,
    assessment_date DATE NOT NULL,
    
    -- Medidas Básicas
    weight DECIMAL(5,2) NOT NULL, -- kg
    height DECIMAL(5,2) NOT NULL, -- cm
    
    -- Calculados automaticamente (pelo backend)
    bmi DECIMAL(4,2), -- IMC
    bmi_classification VARCHAR(50), -- 'underweight', 'normal', 'overweight', 'obese_1', 'obese_2', 'obese_3'
    
    -- Circunferências (cm)
    neck_circumference DECIMAL(5,2),
    shoulder_circumference DECIMAL(5,2),
    chest_circumference DECIMAL(5,2),
    waist_circumference DECIMAL(5,2),
    abdomen_circumference DECIMAL(5,2),
    hip_circumference DECIMAL(5,2),
    right_arm_circumference DECIMAL(5,2),
    left_arm_circumference DECIMAL(5,2),
    right_forearm_circumference DECIMAL(5,2),
    left_forearm_circumference DECIMAL(5,2),
    right_thigh_circumference DECIMAL(5,2),
    left_thigh_circumference DECIMAL(5,2),
    right_calf_circumference DECIMAL(5,2),
    left_calf_circumference DECIMAL(5,2),
    
    -- Relações Calculadas
    waist_hip_ratio DECIMAL(4,3), -- RCQ
    waist_height_ratio DECIMAL(4,3), -- RCEst
    
    -- Dobras Cutâneas (mm) - Protocolo de 7 dobras (Jackson & Pollock)
    triceps_skinfold DECIMAL(4,1),
    subscapular_skinfold DECIMAL(4,1),
    chest_skinfold DECIMAL(4,1),
    midaxillary_skinfold DECIMAL(4,1),
    suprailiac_skinfold DECIMAL(4,1),
    abdominal_skinfold DECIMAL(4,1),
    thigh_skinfold DECIMAL(4,1),
    
    -- Composição Corporal Calculada
    body_fat_percentage DECIMAL(4,2),
    fat_mass DECIMAL(5,2), -- kg
    lean_mass DECIMAL(5,2), -- kg
    body_fat_classification VARCHAR(50),
    
    -- Bioimpedância (se disponível)
    bioimpedance_fat_percentage DECIMAL(4,2),
    bioimpedance_muscle_mass DECIMAL(5,2),
    bioimpedance_water_percentage DECIMAL(4,2),
    bioimpedance_bone_mass DECIMAL(4,2),
    bioimpedance_visceral_fat INT,
    bioimpedance_basal_metabolism INT,
    
    -- Método utilizado
    measurement_method VARCHAR(50), -- 'skinfold', 'bioimpedance', 'dexa', 'hydrostatic'
    
    -- Fotos (URLs)
    photo_front_url VARCHAR(500),
    photo_side_url VARCHAR(500),
    photo_back_url VARCHAR(500),
    
    -- Observações
    observations TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (nutritionist_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índice para busca por atleta e data
CREATE INDEX idx_anthropometric_athlete ON anthropometric_assessments(athlete_id);
CREATE INDEX idx_anthropometric_date ON anthropometric_assessments(assessment_date);

-- ===============================
-- 3. CÁLCULO DE NECESSIDADES ENERGÉTICAS
-- ===============================

CREATE TABLE IF NOT EXISTS energy_requirements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    nutritionist_id INT NOT NULL,
    calculation_date DATE NOT NULL,
    
    -- Dados base para cálculo
    weight DECIMAL(5,2) NOT NULL,
    height DECIMAL(5,2) NOT NULL,
    age INT NOT NULL,
    sex ENUM('male', 'female') NOT NULL,
    
    -- Taxa Metabólica Basal (TMB/BMR)
    bmr_formula VARCHAR(50), -- 'harris_benedict', 'mifflin_st_jeor', 'katch_mcardle'
    bmr_value DECIMAL(8,2), -- kcal/dia
    
    -- Fator de Atividade
    activity_factor DECIMAL(3,2), -- 1.2 a 2.4
    activity_level VARCHAR(50), -- 'sedentary', 'light', 'moderate', 'active', 'very_active', 'athlete'
    
    -- Gasto Energético Total (GET/TDEE)
    tdee_value DECIMAL(8,2), -- kcal/dia
    
    -- Efeito Térmico dos Alimentos (ETA)
    tea_percentage DECIMAL(4,2) DEFAULT 10, -- geralmente 10%
    tea_value DECIMAL(8,2),
    
    -- Gasto com Exercício (se adicional)
    exercise_calories DECIMAL(8,2) DEFAULT 0,
    
    -- Valor Energético Total (VET) - Meta calórica
    vet_value DECIMAL(8,2), -- kcal/dia (pode ter déficit ou superávit)
    caloric_adjustment INT DEFAULT 0, -- déficit negativo, superávit positivo
    adjustment_type VARCHAR(50), -- 'maintenance', 'deficit', 'surplus'
    
    -- Distribuição de Macronutrientes
    protein_per_kg DECIMAL(3,2), -- g/kg de peso
    protein_grams INT,
    protein_percentage DECIMAL(4,2),
    protein_calories INT,
    
    carbs_per_kg DECIMAL(3,2),
    carbs_grams INT,
    carbs_percentage DECIMAL(4,2),
    carbs_calories INT,
    
    fat_per_kg DECIMAL(3,2),
    fat_grams INT,
    fat_percentage DECIMAL(4,2),
    fat_calories INT,
    
    -- Fibras e Água
    fiber_grams INT DEFAULT 25,
    water_liters DECIMAL(3,2),
    
    -- Observações
    observations TEXT,
    
    -- Se está sendo usado atualmente
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (nutritionist_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_energy_req_athlete ON energy_requirements(athlete_id);

-- ===============================
-- 4. APRIMORAMENTO DA BIBLIOTECA DE ALIMENTOS
-- ===============================

-- Adicionar novos campos à tabela food_library existente
ALTER TABLE food_library
    ADD COLUMN IF NOT EXISTS sugar DECIMAL(8,2) DEFAULT 0 AFTER fiber,
    ADD COLUMN IF NOT EXISTS saturated_fat DECIMAL(8,2) DEFAULT 0 AFTER sugar,
    ADD COLUMN IF NOT EXISTS trans_fat DECIMAL(8,2) DEFAULT 0 AFTER saturated_fat,
    ADD COLUMN IF NOT EXISTS cholesterol DECIMAL(8,2) DEFAULT 0 AFTER trans_fat,
    ADD COLUMN IF NOT EXISTS calcium DECIMAL(8,2) DEFAULT 0 AFTER cholesterol,
    ADD COLUMN IF NOT EXISTS iron DECIMAL(8,2) DEFAULT 0 AFTER calcium,
    ADD COLUMN IF NOT EXISTS potassium DECIMAL(8,2) DEFAULT 0 AFTER iron,
    ADD COLUMN IF NOT EXISTS vitamin_a DECIMAL(8,2) DEFAULT 0 AFTER potassium,
    ADD COLUMN IF NOT EXISTS vitamin_c DECIMAL(8,2) DEFAULT 0 AFTER vitamin_a,
    ADD COLUMN IF NOT EXISTS vitamin_d DECIMAL(8,2) DEFAULT 0 AFTER vitamin_c,
    ADD COLUMN IF NOT EXISTS glycemic_index INT DEFAULT NULL AFTER vitamin_d,
    ADD COLUMN IF NOT EXISTS glycemic_load DECIMAL(5,2) DEFAULT NULL AFTER glycemic_index,
    ADD COLUMN IF NOT EXISTS has_gluten BOOLEAN DEFAULT FALSE AFTER glycemic_load,
    ADD COLUMN IF NOT EXISTS has_lactose BOOLEAN DEFAULT FALSE AFTER has_gluten,
    ADD COLUMN IF NOT EXISTS is_vegan BOOLEAN DEFAULT FALSE AFTER has_lactose,
    ADD COLUMN IF NOT EXISTS is_vegetarian BOOLEAN DEFAULT FALSE AFTER is_vegan,
    ADD COLUMN IF NOT EXISTS food_group VARCHAR(50) DEFAULT NULL AFTER is_vegetarian,
    ADD COLUMN IF NOT EXISTS taco_id INT DEFAULT NULL AFTER food_group,
    ADD COLUMN IF NOT EXISTS portion_description VARCHAR(100) DEFAULT NULL AFTER serving_size,
    ADD COLUMN IF NOT EXISTS portion_weight DECIMAL(8,2) DEFAULT NULL AFTER portion_description;

-- ===============================
-- 5. RECORDATÓRIO ALIMENTAR 24H
-- ===============================

CREATE TABLE IF NOT EXISTS food_recalls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    recall_date DATE NOT NULL,
    recall_type ENUM('24h', '3day', 'habitual') DEFAULT '24h',
    
    -- Status
    status ENUM('draft', 'submitted', 'reviewed') DEFAULT 'draft',
    reviewed_by INT,
    reviewed_at TIMESTAMP,
    
    -- Totais calculados
    total_calories DECIMAL(8,2) DEFAULT 0,
    total_protein DECIMAL(8,2) DEFAULT 0,
    total_carbs DECIMAL(8,2) DEFAULT 0,
    total_fat DECIMAL(8,2) DEFAULT 0,
    total_fiber DECIMAL(8,2) DEFAULT 0,
    
    -- Observações do paciente
    patient_notes TEXT,
    
    -- Análise do nutricionista
    nutritionist_notes TEXT,
    adherence_score INT, -- 0-100
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Itens do recordatório
CREATE TABLE IF NOT EXISTS food_recall_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recall_id INT NOT NULL,
    
    -- Horário e refeição
    meal_time TIME,
    meal_name VARCHAR(100), -- 'Café da manhã', 'Almoço', etc
    
    -- Alimento
    food_id INT, -- referência à biblioteca (opcional)
    food_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(8,2),
    unit VARCHAR(50),
    portion_description VARCHAR(200), -- "2 colheres de sopa", "1 fatia média"
    
    -- Valores nutricionais
    calories DECIMAL(8,2) DEFAULT 0,
    protein DECIMAL(8,2) DEFAULT 0,
    carbs DECIMAL(8,2) DEFAULT 0,
    fat DECIMAL(8,2) DEFAULT 0,
    
    -- Local e preparação
    location VARCHAR(100), -- 'home', 'work', 'restaurant'
    preparation_method VARCHAR(100), -- 'grilled', 'fried', 'raw', etc
    
    -- Observações
    notes TEXT,
    
    order_index INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (recall_id) REFERENCES food_recalls(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES food_library(id) ON DELETE SET NULL
);

CREATE INDEX idx_food_recalls_athlete ON food_recalls(athlete_id);
CREATE INDEX idx_food_recalls_date ON food_recalls(recall_date);
CREATE INDEX idx_food_recall_items_recall ON food_recall_items(recall_id);

-- ===============================
-- 6. SISTEMA DE RECEITAS
-- ===============================

CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consultancy_id INT,
    created_by INT NOT NULL,
    
    -- Dados da receita
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- 'breakfast', 'lunch', 'dinner', 'snack', 'dessert'
    preparation_time INT, -- minutos
    cooking_time INT, -- minutos
    difficulty VARCHAR(20), -- 'easy', 'medium', 'hard'
    servings INT DEFAULT 1,
    serving_size VARCHAR(50), -- "1 porção de 150g"
    
    -- Instruções
    instructions TEXT, -- JSON array com passos
    tips TEXT,
    
    -- Valores nutricionais por porção (calculados)
    calories_per_serving DECIMAL(8,2) DEFAULT 0,
    protein_per_serving DECIMAL(8,2) DEFAULT 0,
    carbs_per_serving DECIMAL(8,2) DEFAULT 0,
    fat_per_serving DECIMAL(8,2) DEFAULT 0,
    fiber_per_serving DECIMAL(8,2) DEFAULT 0,
    
    -- Classificações
    is_gluten_free BOOLEAN DEFAULT FALSE,
    is_lactose_free BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_low_carb BOOLEAN DEFAULT FALSE,
    is_high_protein BOOLEAN DEFAULT FALSE,
    
    -- Mídia
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    
    -- Sistema
    is_global BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (consultancy_id) REFERENCES consultancies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Ingredientes da receita
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    food_id INT, -- referência à biblioteca (opcional)
    
    -- Dados do ingrediente
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(8,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    
    -- Valores nutricionais
    calories DECIMAL(8,2) DEFAULT 0,
    protein DECIMAL(8,2) DEFAULT 0,
    carbs DECIMAL(8,2) DEFAULT 0,
    fat DECIMAL(8,2) DEFAULT 0,
    
    -- Preparação específica
    preparation_notes VARCHAR(255), -- "picado", "em cubos", "ralado"
    is_optional BOOLEAN DEFAULT FALSE,
    
    order_index INT DEFAULT 0,
    
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES food_library(id) ON DELETE SET NULL
);

CREATE INDEX idx_recipes_consultancy ON recipes(consultancy_id);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);

-- ===============================
-- 7. LISTA DE COMPRAS
-- ===============================

CREATE TABLE IF NOT EXISTS shopping_lists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    plan_id INT, -- referência ao plano nutricional
    
    name VARCHAR(255),
    period_start DATE,
    period_end DATE,
    
    status ENUM('draft', 'active', 'completed') DEFAULT 'draft',
    
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES nutrition_plans(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS shopping_list_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    list_id INT NOT NULL,
    food_id INT,
    
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(8,2),
    unit VARCHAR(50),
    
    category VARCHAR(50), -- para organizar por seção do mercado
    is_checked BOOLEAN DEFAULT FALSE,
    
    notes VARCHAR(255),
    
    FOREIGN KEY (list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES food_library(id) ON DELETE SET NULL
);

CREATE INDEX idx_shopping_lists_athlete ON shopping_lists(athlete_id);

-- ===============================
-- 8. TABELA DE EQUIVALENTES
-- ===============================

CREATE TABLE IF NOT EXISTS food_equivalents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consultancy_id INT,
    
    -- Grupo de equivalência
    equivalent_group VARCHAR(50) NOT NULL, -- 'carboidrato', 'proteina', 'gordura', 'fruta', 'vegetal', 'lacteo'
    
    -- Alimento de referência
    food_id INT,
    food_name VARCHAR(255) NOT NULL,
    reference_quantity DECIMAL(8,2) NOT NULL,
    reference_unit VARCHAR(50) NOT NULL,
    
    -- Valores nutricionais da porção de referência
    calories DECIMAL(8,2),
    protein DECIMAL(8,2),
    carbs DECIMAL(8,2),
    fat DECIMAL(8,2),
    
    -- Descrição da porção
    portion_description VARCHAR(200), -- "1 fatia de pão francês (25g)"
    
    is_global BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (consultancy_id) REFERENCES consultancies(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES food_library(id) ON DELETE SET NULL
);

CREATE INDEX idx_food_equivalents_group ON food_equivalents(equivalent_group);
CREATE INDEX idx_food_equivalents_consultancy ON food_equivalents(consultancy_id);

-- ===============================
-- 9. METAS E ACOMPANHAMENTO DIÁRIO
-- ===============================

CREATE TABLE IF NOT EXISTS daily_nutrition_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    log_date DATE NOT NULL,
    
    -- Metas do dia (copiadas do plano)
    target_calories INT,
    target_protein INT,
    target_carbs INT,
    target_fat INT,
    target_water DECIMAL(3,2), -- litros
    
    -- Consumido (calculado dos recordatórios ou entrada manual)
    consumed_calories INT DEFAULT 0,
    consumed_protein INT DEFAULT 0,
    consumed_carbs INT DEFAULT 0,
    consumed_fat INT DEFAULT 0,
    consumed_water DECIMAL(3,2) DEFAULT 0,
    
    -- Aderência
    calories_adherence DECIMAL(5,2), -- percentual
    overall_adherence DECIMAL(5,2),
    
    -- Exercício do dia
    exercise_done BOOLEAN DEFAULT FALSE,
    exercise_calories_burned INT DEFAULT 0,
    
    -- Anotações
    notes TEXT,
    mood VARCHAR(20), -- 'great', 'good', 'neutral', 'bad', 'terrible'
    energy_level INT, -- 1-5
    sleep_quality INT, -- 1-5
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_athlete_date (athlete_id, log_date)
);

CREATE INDEX idx_daily_logs_athlete ON daily_nutrition_logs(athlete_id);
CREATE INDEX idx_daily_logs_date ON daily_nutrition_logs(log_date);

-- ===============================
-- FIM DA MIGRAÇÃO
-- ===============================
