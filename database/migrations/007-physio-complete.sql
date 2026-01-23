-- =====================================================
-- Migração 007: Sistema Completo de Fisioterapia
-- =====================================================

-- 1. Tabela de Avaliações Fisioterapêuticas
CREATE TABLE IF NOT EXISTS physio_evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    physio_id INT NOT NULL,
    evaluation_date DATE NOT NULL,
    
    -- Anamnese
    chief_complaint TEXT,                    -- Queixa principal
    pain_location VARCHAR(255),              -- Localização da dor
    pain_onset VARCHAR(100),                 -- Início (agudo, gradual)
    pain_duration VARCHAR(100),              -- Duração
    pain_type VARCHAR(100),                  -- Tipo (pontada, queimação, latejante)
    pain_triggers TEXT,                      -- Fatores que pioram
    pain_relief TEXT,                        -- Fatores que melhoram
    previous_treatments TEXT,                -- Tratamentos anteriores
    medical_history TEXT,                    -- Histórico médico
    medications TEXT,                        -- Medicamentos em uso
    surgeries TEXT,                          -- Cirurgias anteriores
    lifestyle TEXT,                          -- Estilo de vida/atividades
    
    -- Exame Físico
    posture_assessment TEXT,                 -- Avaliação postural
    gait_analysis TEXT,                      -- Análise de marcha
    range_of_motion TEXT,                    -- Amplitude de movimento (JSON)
    muscle_strength TEXT,                    -- Força muscular (JSON)
    special_tests TEXT,                      -- Testes especiais realizados (JSON)
    palpation_findings TEXT,                 -- Achados de palpação
    neurological_exam TEXT,                  -- Exame neurológico
    
    -- Escalas e Medidas
    pain_scale_eva INT,                      -- Escala Visual Analógica (0-10)
    functional_score INT,                    -- Score funcional
    
    -- Diagnóstico
    physio_diagnosis TEXT,                   -- Diagnóstico fisioterapêutico
    icd_code VARCHAR(20),                    -- CID (opcional)
    prognosis TEXT,                          -- Prognóstico
    
    -- Objetivos
    short_term_goals TEXT,                   -- Objetivos de curto prazo
    long_term_goals TEXT,                    -- Objetivos de longo prazo
    
    -- Anexos
    attachments TEXT,                        -- Lista de anexos (JSON)
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (physio_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Tabela de Protocolos de Tratamento
CREATE TABLE IF NOT EXISTS physio_treatment_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    physio_id INT NOT NULL,
    evaluation_id INT,
    
    name VARCHAR(255) NOT NULL,              -- Nome do protocolo
    condition_treated VARCHAR(255),          -- Condição tratada
    
    start_date DATE NOT NULL,
    estimated_end_date DATE,
    actual_end_date DATE,
    
    frequency VARCHAR(50),                   -- Frequência (ex: 2x semana)
    total_sessions INT,                      -- Total de sessões previstas
    completed_sessions INT DEFAULT 0,
    
    -- Técnicas planejadas
    techniques TEXT,                         -- Técnicas a utilizar (JSON)
    home_exercises TEXT,                     -- Exercícios para casa (JSON)
    precautions TEXT,                        -- Precauções e contraindicações
    
    status ENUM('active', 'completed', 'cancelled', 'paused') DEFAULT 'active',
    discharge_notes TEXT,                    -- Notas de alta
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (physio_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluation_id) REFERENCES physio_evaluations(id) ON DELETE SET NULL
);

-- 3. Expandir tabela de sessões (adicionar campos se não existirem)
ALTER TABLE rehab_sessions 
    ADD COLUMN IF NOT EXISTS treatment_plan_id INT AFTER physio_id,
    ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 50 AFTER session_date,
    ADD COLUMN IF NOT EXISTS pain_before INT AFTER progress_notes,
    ADD COLUMN IF NOT EXISTS pain_after INT AFTER pain_before,
    ADD COLUMN IF NOT EXISTS techniques_applied TEXT AFTER pain_after,
    ADD COLUMN IF NOT EXISTS patient_feedback TEXT AFTER techniques_applied,
    ADD COLUMN IF NOT EXISTS therapist_notes TEXT AFTER patient_feedback;

-- 4. Tabela de Evolução do Paciente
CREATE TABLE IF NOT EXISTS physio_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    treatment_plan_id INT,
    record_date DATE NOT NULL,
    
    -- Medidas de evolução
    pain_level INT,                          -- Nível de dor (0-10)
    mobility_score INT,                      -- Score de mobilidade (0-100)
    strength_score INT,                      -- Score de força (0-100)
    functional_score INT,                    -- Score funcional (0-100)
    
    -- ROM específico (em graus)
    rom_data TEXT,                           -- JSON com dados de amplitude
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (treatment_plan_id) REFERENCES physio_treatment_plans(id) ON DELETE SET NULL
);

-- 5. Biblioteca de Exercícios Terapêuticos
CREATE TABLE IF NOT EXISTS physio_exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consultancy_id INT,                      -- NULL = global
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,                       -- Instruções detalhadas
    
    category ENUM('stretching', 'strengthening', 'mobility', 'proprioception', 'cardio', 'functional', 'other') DEFAULT 'other',
    body_region VARCHAR(100),                -- Região do corpo
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    
    video_url VARCHAR(500),
    image_url VARCHAR(500),
    
    contraindications TEXT,                  -- Contraindicações
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (consultancy_id) REFERENCES consultancies(id) ON DELETE CASCADE
);

-- 6. Exercícios prescritos ao paciente
CREATE TABLE IF NOT EXISTS physio_prescribed_exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    treatment_plan_id INT NOT NULL,
    exercise_id INT,
    
    custom_name VARCHAR(255),                -- Nome customizado (se não usar da biblioteca)
    custom_instructions TEXT,
    
    sets INT,
    reps VARCHAR(50),                        -- Pode ser "10-15" ou "30 segundos"
    hold_time INT,                           -- Tempo de sustentação em segundos
    frequency VARCHAR(100),                  -- Frequência (ex: "3x ao dia")
    
    notes TEXT,
    order_index INT DEFAULT 0,
    
    is_home_exercise BOOLEAN DEFAULT FALSE,  -- Exercício para fazer em casa
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (treatment_plan_id) REFERENCES physio_treatment_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES physio_exercises(id) ON DELETE SET NULL
);

-- 7. Anexos/Documentos do paciente
CREATE TABLE IF NOT EXISTS physio_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    
    document_type ENUM('exam', 'xray', 'mri', 'ct', 'ultrasound', 'report', 'prescription', 'other') DEFAULT 'other',
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    
    exam_date DATE,                          -- Data do exame
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_physio_evaluations_athlete ON physio_evaluations(athlete_id);
CREATE INDEX idx_physio_evaluations_date ON physio_evaluations(evaluation_date);
CREATE INDEX idx_physio_treatment_plans_athlete ON physio_treatment_plans(athlete_id);
CREATE INDEX idx_physio_treatment_plans_status ON physio_treatment_plans(status);
CREATE INDEX idx_physio_progress_athlete ON physio_progress(athlete_id);
CREATE INDEX idx_physio_progress_date ON physio_progress(record_date);
CREATE INDEX idx_physio_exercises_category ON physio_exercises(category);
CREATE INDEX idx_physio_documents_athlete ON physio_documents(athlete_id);

-- Inserir alguns exercícios terapêuticos globais de exemplo
INSERT INTO physio_exercises (consultancy_id, name, description, instructions, category, body_region, difficulty, contraindications) VALUES
(NULL, 'Alongamento de Quadríceps', 'Alongamento do músculo quadríceps femoral', 'Em pé, segure o tornozelo e puxe o calcanhar em direção ao glúteo. Mantenha o joelho apontando para baixo. Segure por 30 segundos.', 'stretching', 'Coxa Anterior', 'easy', 'Lesão aguda no joelho'),
(NULL, 'Alongamento de Isquiotibiais', 'Alongamento dos músculos posteriores da coxa', 'Sentado, estenda uma perna e incline o tronco para frente mantendo a coluna reta. Segure por 30 segundos.', 'stretching', 'Coxa Posterior', 'easy', 'Hérnia de disco lombar aguda'),
(NULL, 'Fortalecimento de VMO', 'Fortalecimento do vasto medial oblíquo', 'Sentado com uma toalha enrolada sob o joelho. Pressione o joelho contra a toalha contraindo o quadríceps. Mantenha 5 segundos.', 'strengthening', 'Joelho', 'easy', 'Dor aguda no joelho'),
(NULL, 'Ponte de Glúteo', 'Fortalecimento de glúteos e core', 'Deitado com joelhos flexionados, eleve o quadril contraindo os glúteos. Mantenha 3 segundos no topo.', 'strengthening', 'Quadril/Glúteo', 'easy', NULL),
(NULL, 'Prancha Abdominal', 'Fortalecimento do core e estabilidade', 'Apoie-se nos antebraços e pontas dos pés, mantendo o corpo alinhado. Mantenha a posição.', 'strengthening', 'Core', 'medium', 'Dor lombar aguda'),
(NULL, 'Agachamento na Parede', 'Fortalecimento isométrico de membros inferiores', 'Encoste as costas na parede e desça até os joelhos ficarem a 90°. Mantenha a posição.', 'strengthening', 'Membros Inferiores', 'medium', 'Lesão ligamentar do joelho'),
(NULL, 'Propriocepção em Apoio Unipodal', 'Treino de equilíbrio e propriocepção', 'Fique em apoio unipodal por 30 segundos. Progrida fechando os olhos ou em superfície instável.', 'proprioception', 'Tornozelo/Joelho', 'medium', 'Lesão aguda de tornozelo'),
(NULL, 'Mobilização de Tornozelo', 'Mobilidade articular do tornozelo', 'Em pé de frente para a parede, avance o joelho sem tirar o calcanhar do chão. Retorne e repita.', 'mobility', 'Tornozelo', 'easy', NULL),
(NULL, 'CATS - Mobilização de Coluna', 'Mobilização da coluna em flexão e extensão', 'Em quatro apoios, alterne entre arquear (olhar para cima) e arredondar (olhar para umbigo) a coluna.', 'mobility', 'Coluna', 'easy', 'Espondilolistese instável'),
(NULL, 'Liberação Miofascial com Rolo', 'Auto liberação miofascial', 'Use o rolo de espuma na região indicada, fazendo movimentos lentos. Pare em pontos de tensão por 30-60 segundos.', 'other', 'Geral', 'easy', 'Trombose venosa profunda');
