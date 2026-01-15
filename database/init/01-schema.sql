-- Criação das tabelas principais

-- Configurar charset UTF-8
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ===============================
-- SUPER ADMIN (Dono do SaaS)
-- ===============================
CREATE TABLE IF NOT EXISTS super_admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- CONSULTORIAS (Clientes do SaaS)
-- ===============================
CREATE TABLE IF NOT EXISTS consultancies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    logo_url VARCHAR(500),
    
    -- Plano e cobrança
    plan ENUM('basic', 'professional', 'enterprise') NOT NULL DEFAULT 'basic',
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    billing_day INT DEFAULT 1,
    
    -- Módulos habilitados
    has_training BOOLEAN DEFAULT TRUE,
    has_nutrition BOOLEAN DEFAULT TRUE,
    has_medical BOOLEAN DEFAULT TRUE,
    has_rehab BOOLEAN DEFAULT TRUE,
    
    -- Limites
    max_professionals INT DEFAULT 5,
    max_patients INT DEFAULT 50,
    
    -- Status
    status ENUM('active', 'trial', 'suspended', 'cancelled') DEFAULT 'trial',
    trial_ends_at DATE,
    
    -- Mercado Pago
    mp_payment_id VARCHAR(100),
    mp_subscription_id VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Usuários do sistema (vinculados a uma consultoria)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consultancy_id INT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'athlete', 'coach', 'nutritionist', 'physio') NOT NULL DEFAULT 'athlete',
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (consultancy_id) REFERENCES consultancies(id) ON DELETE SET NULL
);

-- Atletas
CREATE TABLE IF NOT EXISTS athletes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    birth_date DATE,
    sport VARCHAR(100),
    position VARCHAR(100),
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    club VARCHAR(255),
    goals TEXT,
    medical_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Agendamentos
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    professional_id INT NOT NULL,
    type ENUM('training', 'nutrition', 'medical', 'rehab', 'evaluation') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at DATETIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    status ENUM('scheduled', 'confirmed', 'completed', 'cancelled') DEFAULT 'scheduled',
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (professional_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================
-- BIBLIOTECA DE EXERCÍCIOS (Global por consultoria)
-- ===============================
CREATE TABLE IF NOT EXISTS exercise_library (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consultancy_id INT,
    
    -- Dados básicos
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Classificação
    muscle_group ENUM('peito', 'costas', 'ombros', 'biceps', 'triceps', 'antebraco', 'abdomen', 'quadriceps', 'posterior', 'gluteos', 'panturrilha', 'corpo_todo', 'cardio') NOT NULL,
    secondary_muscle VARCHAR(100),
    equipment ENUM('barra', 'halteres', 'maquina', 'cabo', 'peso_corporal', 'kettlebell', 'elastico', 'bola', 'outros') DEFAULT 'peso_corporal',
    difficulty ENUM('iniciante', 'intermediario', 'avancado') DEFAULT 'intermediario',
    
    -- Mídia
    video_url VARCHAR(500),
    image_url VARCHAR(500),
    
    -- Instruções
    instructions TEXT,
    tips TEXT,
    
    -- Sistema
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (consultancy_id) REFERENCES consultancies(id) ON DELETE CASCADE
);

-- ===============================
-- PLANOS DE TREINO (Estrutura de Plano melhorada)
-- ===============================
CREATE TABLE IF NOT EXISTS training_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    coach_id INT NOT NULL,
    
    -- Dados básicos
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Estrutura do plano
    objective ENUM('hipertrofia', 'forca', 'resistencia', 'emagrecimento', 'condicionamento', 'reabilitacao', 'manutencao') DEFAULT 'hipertrofia',
    duration_weeks INT DEFAULT 4,
    frequency_per_week INT DEFAULT 4,
    level ENUM('iniciante', 'intermediario', 'avancado') DEFAULT 'intermediario',
    
    -- Divisão de treino
    split_type VARCHAR(100), -- Ex: "ABC", "ABCD", "Push/Pull/Legs", "Full Body"
    
    -- Datas
    start_date DATE,
    end_date DATE,
    
    -- Status
    status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================
-- DIAS DE TREINO (Estrutura do dia)
-- ===============================
CREATE TABLE IF NOT EXISTS training_days (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    
    -- Identificação do dia
    day_letter VARCHAR(10) NOT NULL, -- A, B, C, D, E, F
    day_name VARCHAR(100), -- Ex: "Peito e Tríceps", "Costas e Bíceps"
    day_of_week INT, -- 0=Domingo, 1=Segunda, etc (opcional)
    
    -- Descrição
    focus_muscles TEXT, -- Músculos principais do dia
    estimated_duration INT DEFAULT 60, -- minutos
    
    -- Ordem
    order_index INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES training_plans(id) ON DELETE CASCADE
);

-- ===============================
-- EXERCÍCIOS DO TREINO (Campos expandidos)
-- ===============================
CREATE TABLE IF NOT EXISTS training_exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    training_day_id INT,
    exercise_library_id INT,
    
    -- Se não usar biblioteca, dados manuais
    name VARCHAR(255) NOT NULL,
    
    -- Classificação
    muscle_group ENUM('peito', 'costas', 'ombros', 'biceps', 'triceps', 'antebraco', 'abdomen', 'quadriceps', 'posterior', 'gluteos', 'panturrilha', 'corpo_todo', 'cardio') DEFAULT 'peito',
    equipment ENUM('barra', 'halteres', 'maquina', 'cabo', 'peso_corporal', 'kettlebell', 'elastico', 'bola', 'outros') DEFAULT 'barra',
    
    -- Parâmetros de execução
    sets INT DEFAULT 3,
    reps VARCHAR(50), -- "8-12", "10", "até falha"
    weight VARCHAR(50), -- "40kg", "70% 1RM"
    rest_seconds INT DEFAULT 60,
    
    -- Cadência (tempo de execução)
    tempo VARCHAR(20), -- "3-1-2-0" (excêntrico-pausa-concêntrico-pausa)
    
    -- Técnicas avançadas
    technique ENUM('normal', 'drop_set', 'rest_pause', 'super_serie', 'bi_set', 'tri_set', 'giant_set', 'piramide', 'fst7', '21s') DEFAULT 'normal',
    technique_details TEXT,
    
    -- Intensidade
    rpe VARCHAR(10), -- "8", "9", "10" (Rate of Perceived Exertion)
    rir VARCHAR(10), -- "2", "1", "0" (Reps in Reserve)
    
    -- Mídia
    video_url VARCHAR(500),
    
    -- Ordem e agrupamento
    order_index INT DEFAULT 0,
    superset_group INT, -- Para agrupar super séries (mesmo número = mesmo grupo)
    
    -- Notas
    notes TEXT,
    
    -- Legado (compatibilidade)
    day_of_week INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES training_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (training_day_id) REFERENCES training_days(id) ON DELETE SET NULL,
    FOREIGN KEY (exercise_library_id) REFERENCES exercise_library(id) ON DELETE SET NULL
);

-- Planos nutricionais
CREATE TABLE IF NOT EXISTS nutrition_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    nutritionist_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    daily_calories INT,
    protein_grams INT,
    carbs_grams INT,
    fat_grams INT,
    start_date DATE,
    end_date DATE,
    status ENUM('draft', 'active', 'completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (nutritionist_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Refeições
CREATE TABLE IF NOT EXISTS meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    time TIME,
    description TEXT,
    calories INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES nutrition_plans(id) ON DELETE CASCADE
);

-- Prontuário médico
CREATE TABLE IF NOT EXISTS medical_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    doctor_id INT NOT NULL,
    record_date DATE NOT NULL,
    type ENUM('exam', 'consultation', 'injury', 'evaluation') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    diagnosis TEXT,
    treatment TEXT,
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Mensagens
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Progresso do atleta
CREATE TABLE IF NOT EXISTS athlete_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    record_date DATE NOT NULL,
    weight DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    muscle_mass DECIMAL(5,2),
    notes TEXT,
    metrics JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
);

-- Sessões de reabilitação
CREATE TABLE IF NOT EXISTS rehab_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    physio_id INT NOT NULL,
    session_date DATETIME NOT NULL,
    injury_description TEXT,
    treatment TEXT,
    exercises TEXT,
    progress_notes TEXT,
    next_session DATE,
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (physio_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_appointments_athlete ON appointments(athlete_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_messages_receiver ON messages(receiver_id, is_read);
CREATE INDEX idx_progress_athlete_date ON athlete_progress(athlete_id, record_date);
CREATE INDEX idx_exercise_library_consultancy ON exercise_library(consultancy_id);
CREATE INDEX idx_exercise_library_muscle ON exercise_library(muscle_group);
CREATE INDEX idx_training_exercises_plan ON training_exercises(plan_id);
CREATE INDEX idx_training_days_plan ON training_days(plan_id);
