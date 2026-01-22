-- =====================================================
-- SEED DE DADOS DEMO PARA SCREENSHOTS
-- Profissional: admin@teste.com
-- =====================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Variáveis para armazenar IDs
SET @admin_email = 'admin@teste.com';

-- Buscar o ID do profissional e consultoria
SELECT @professional_id := id, @consultancy_id := consultancy_id 
FROM users WHERE email = @admin_email LIMIT 1;

-- Verificar se encontrou
SELECT CONCAT('Profissional ID: ', IFNULL(@professional_id, 'NÃO ENCONTRADO')) AS info;
SELECT CONCAT('Consultoria ID: ', IFNULL(@consultancy_id, 'NÃO ENCONTRADO')) AS info;

-- =====================================================
-- 1. CRIAR PACIENTES (USERS + ATHLETES)
-- =====================================================

-- Paciente 1: Lucas Silva (Hipertrofia)
INSERT INTO users (consultancy_id, email, password_hash, name, role, phone, is_active)
VALUES (@consultancy_id, 'lucas.silva@demo.com', '$2b$10$demo', 'Lucas Silva', 'athlete', '(11) 99999-1001', TRUE);
SET @user1_id = LAST_INSERT_ID();

INSERT INTO athletes (user_id, birth_date, sport, height, weight, goals, medical_notes)
VALUES (@user1_id, '1995-03-15', 'Musculação', 178.00, 82.50, 'Ganhar massa muscular e definição', 'Sem restrições médicas');
SET @athlete1_id = LAST_INSERT_ID();

-- Paciente 2: Maria Santos (Emagrecimento)
INSERT INTO users (consultancy_id, email, password_hash, name, role, phone, is_active)
VALUES (@consultancy_id, 'maria.santos@demo.com', '$2b$10$demo', 'Maria Santos', 'athlete', '(11) 99999-1002', TRUE);
SET @user2_id = LAST_INSERT_ID();

INSERT INTO athletes (user_id, birth_date, sport, height, weight, goals, medical_notes)
VALUES (@user2_id, '1988-07-22', 'Funcional', 165.00, 72.00, 'Perder 10kg e melhorar condicionamento', 'Histórico de pressão alta controlada');
SET @athlete2_id = LAST_INSERT_ID();

-- Paciente 3: Pedro Oliveira (Atleta de Corrida)
INSERT INTO users (consultancy_id, email, password_hash, name, role, phone, is_active)
VALUES (@consultancy_id, 'pedro.oliveira@demo.com', '$2b$10$demo', 'Pedro Oliveira', 'athlete', '(11) 99999-1003', TRUE);
SET @user3_id = LAST_INSERT_ID();

INSERT INTO athletes (user_id, birth_date, sport, height, weight, goals, medical_notes)
VALUES (@user3_id, '1992-11-08', 'Corrida', 175.00, 68.00, 'Completar maratona em menos de 4h', 'Nenhuma');
SET @athlete3_id = LAST_INSERT_ID();

-- Paciente 4: Ana Costa (Reabilitação)
INSERT INTO users (consultancy_id, email, password_hash, name, role, phone, is_active)
VALUES (@consultancy_id, 'ana.costa@demo.com', '$2b$10$demo', 'Ana Costa', 'athlete', '(11) 99999-1004', TRUE);
SET @user4_id = LAST_INSERT_ID();

INSERT INTO athletes (user_id, birth_date, sport, height, weight, goals, medical_notes)
VALUES (@user4_id, '1990-05-30', 'Pilates', 162.00, 58.00, 'Recuperação pós-cirurgia de joelho', 'Cirurgia LCA há 3 meses');
SET @athlete4_id = LAST_INSERT_ID();

-- Paciente 5: Carlos Ferreira (Força)
INSERT INTO users (consultancy_id, email, password_hash, name, role, phone, is_active)
VALUES (@consultancy_id, 'carlos.ferreira@demo.com', '$2b$10$demo', 'Carlos Ferreira', 'athlete', '(11) 99999-1005', TRUE);
SET @user5_id = LAST_INSERT_ID();

INSERT INTO athletes (user_id, birth_date, sport, height, weight, goals, medical_notes)
VALUES (@user5_id, '1985-09-12', 'Powerlifting', 182.00, 95.00, 'Aumentar força no supino e agachamento', 'Lombalgia ocasional');
SET @athlete5_id = LAST_INSERT_ID();

-- Paciente 6: Juliana Mendes (Fitness)
INSERT INTO users (consultancy_id, email, password_hash, name, role, phone, is_active)
VALUES (@consultancy_id, 'juliana.mendes@demo.com', '$2b$10$demo', 'Juliana Mendes', 'athlete', '(11) 99999-1006', TRUE);
SET @user6_id = LAST_INSERT_ID();

INSERT INTO athletes (user_id, birth_date, sport, height, weight, goals, medical_notes)
VALUES (@user6_id, '1998-01-25', 'CrossFit', 168.00, 62.00, 'Melhorar performance nos WODs', 'Nenhuma');
SET @athlete6_id = LAST_INSERT_ID();

-- Paciente 7: Roberto Lima (Saúde)
INSERT INTO users (consultancy_id, email, password_hash, name, role, phone, is_active)
VALUES (@consultancy_id, 'roberto.lima@demo.com', '$2b$10$demo', 'Roberto Lima', 'athlete', '(11) 99999-1007', TRUE);
SET @user7_id = LAST_INSERT_ID();

INSERT INTO athletes (user_id, birth_date, sport, height, weight, goals, medical_notes)
VALUES (@user7_id, '1975-12-03', 'Caminhada', 170.00, 88.00, 'Controlar diabetes e melhorar qualidade de vida', 'Diabetes tipo 2, usa metformina');
SET @athlete7_id = LAST_INSERT_ID();

-- Paciente 8: Fernanda Rocha (Gestante)
INSERT INTO users (consultancy_id, email, password_hash, name, role, phone, is_active)
VALUES (@consultancy_id, 'fernanda.rocha@demo.com', '$2b$10$demo', 'Fernanda Rocha', 'athlete', '(11) 99999-1008', TRUE);
SET @user8_id = LAST_INSERT_ID();

INSERT INTO athletes (user_id, birth_date, sport, height, weight, goals, medical_notes)
VALUES (@user8_id, '1993-04-18', 'Yoga', 160.00, 65.00, 'Manter atividade física durante gestação', 'Gestante - 5º mês');
SET @athlete8_id = LAST_INSERT_ID();

-- =====================================================
-- 2. BIBLIOTECA DE EXERCÍCIOS
-- =====================================================

INSERT INTO exercise_library (consultancy_id, name, description, muscle_group, equipment, difficulty, instructions, is_global) VALUES
(@consultancy_id, 'Supino Reto com Barra', 'Exercício básico para desenvolvimento do peitoral', 'peito', 'barra', 'intermediario', 'Deite no banco, segure a barra na largura dos ombros, desça até o peito e empurre.', FALSE),
(@consultancy_id, 'Agachamento Livre', 'Exercício fundamental para membros inferiores', 'quadriceps', 'barra', 'intermediario', 'Posicione a barra nas costas, desça até as coxas ficarem paralelas ao chão.', FALSE),
(@consultancy_id, 'Levantamento Terra', 'Exercício composto para força total', 'costas', 'barra', 'avancado', 'Mantenha as costas retas, empurre o chão com os pés e estenda os quadris.', FALSE),
(@consultancy_id, 'Puxada Frontal', 'Exercício para desenvolvimento das costas', 'costas', 'maquina', 'iniciante', 'Puxe a barra até o peito, controlando o movimento.', FALSE),
(@consultancy_id, 'Desenvolvimento com Halteres', 'Exercício para ombros', 'ombros', 'halteres', 'intermediario', 'Eleve os halteres acima da cabeça, estendendo completamente os braços.', FALSE),
(@consultancy_id, 'Rosca Direta', 'Exercício isolado para bíceps', 'biceps', 'barra', 'iniciante', 'Mantenha os cotovelos fixos e flexione os braços.', FALSE),
(@consultancy_id, 'Tríceps Pulley', 'Exercício isolado para tríceps', 'triceps', 'cabo', 'iniciante', 'Estenda os braços empurrando a barra para baixo.', FALSE),
(@consultancy_id, 'Leg Press 45°', 'Exercício para quadríceps e glúteos', 'quadriceps', 'maquina', 'iniciante', 'Empurre a plataforma estendendo as pernas.', FALSE),
(@consultancy_id, 'Stiff', 'Exercício para posterior de coxa', 'posterior', 'barra', 'intermediario', 'Desça o tronco mantendo as pernas semi-estendidas.', FALSE),
(@consultancy_id, 'Elevação de Panturrilha', 'Exercício para panturrilhas', 'panturrilha', 'maquina', 'iniciante', 'Eleve os calcanhares contraindo as panturrilhas.', FALSE),
(@consultancy_id, 'Abdominal Crunch', 'Exercício para região abdominal', 'abdomen', 'peso_corporal', 'iniciante', 'Contraia o abdômen elevando o tronco.', FALSE),
(@consultancy_id, 'Prancha Abdominal', 'Exercício isométrico para core', 'abdomen', 'peso_corporal', 'iniciante', 'Mantenha o corpo reto apoiando-se nos antebraços e pés.', FALSE),
(@consultancy_id, 'Remada Curvada', 'Exercício composto para costas', 'costas', 'barra', 'intermediario', 'Incline o tronco e puxe a barra até o abdômen.', FALSE),
(@consultancy_id, 'Crucifixo com Halteres', 'Exercício isolado para peitoral', 'peito', 'halteres', 'intermediario', 'Abra os braços lateralmente e retorne controlando.', FALSE),
(@consultancy_id, 'Elevação Lateral', 'Exercício isolado para deltóides', 'ombros', 'halteres', 'iniciante', 'Eleve os braços lateralmente até a altura dos ombros.', FALSE);

-- =====================================================
-- 3. PLANOS DE TREINO COMPLETOS
-- =====================================================

-- Plano para Lucas (Hipertrofia ABCD)
INSERT INTO training_plans (athlete_id, coach_id, name, description, objective, duration_weeks, frequency_per_week, level, split_type, start_date, end_date, status)
VALUES (@athlete1_id, @professional_id, 'Hipertrofia ABCD', 'Plano focado em ganho de massa muscular com divisão em 4 dias', 'hipertrofia', 8, 4, 'intermediario', 'ABCD', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 8 WEEK), 'active');
SET @plan1_id = LAST_INSERT_ID();

-- Dias do treino Lucas
INSERT INTO training_days (plan_id, day_letter, day_name, focus_muscles, estimated_duration, order_index) VALUES
(@plan1_id, 'A', 'Peito e Tríceps', 'Peitoral maior, peitoral menor, tríceps', 60, 1),
(@plan1_id, 'B', 'Costas e Bíceps', 'Latíssimo dorsal, trapézio, bíceps', 60, 2),
(@plan1_id, 'C', 'Ombros e Abdômen', 'Deltóides, core', 50, 3),
(@plan1_id, 'D', 'Pernas Completo', 'Quadríceps, posterior, glúteos, panturrilha', 70, 4);

SET @day_a = LAST_INSERT_ID() - 3;
SET @day_b = LAST_INSERT_ID() - 2;
SET @day_c = LAST_INSERT_ID() - 1;
SET @day_d = LAST_INSERT_ID();

-- Exercícios Dia A (Peito e Tríceps)
INSERT INTO training_exercises (plan_id, training_day_id, name, muscle_group, equipment, sets, reps, weight, rest_seconds, tempo, technique, order_index, notes) VALUES
(@plan1_id, @day_a, 'Supino Reto com Barra', 'peito', 'barra', 4, '8-10', '70kg', 90, '3-1-2-0', 'normal', 1, 'Foco na contração do peitoral'),
(@plan1_id, @day_a, 'Supino Inclinado com Halteres', 'peito', 'halteres', 4, '10-12', '26kg', 75, '3-0-2-0', 'normal', 2, 'Banco a 30-45 graus'),
(@plan1_id, @day_a, 'Crucifixo na Máquina', 'peito', 'maquina', 3, '12-15', '50kg', 60, '2-1-2-1', 'normal', 3, 'Squeeze no final'),
(@plan1_id, @day_a, 'Cross Over', 'peito', 'cabo', 3, '12-15', '20kg', 60, '2-1-2-1', 'drop_set', 4, 'Última série drop set'),
(@plan1_id, @day_a, 'Tríceps Pulley Corda', 'triceps', 'cabo', 4, '10-12', '30kg', 60, '2-0-2-0', 'normal', 5, NULL),
(@plan1_id, @day_a, 'Tríceps Francês', 'triceps', 'halteres', 3, '10-12', '14kg', 60, '3-0-2-0', 'normal', 6, 'Cotovelos apontando para cima'),
(@plan1_id, @day_a, 'Mergulho no Banco', 'triceps', 'peso_corporal', 3, '12-15', 'Peso corporal', 45, '2-0-2-0', 'normal', 7, NULL);

-- Exercícios Dia B (Costas e Bíceps)
INSERT INTO training_exercises (plan_id, training_day_id, name, muscle_group, equipment, sets, reps, weight, rest_seconds, tempo, technique, order_index, notes) VALUES
(@plan1_id, @day_b, 'Puxada Frontal Aberta', 'costas', 'maquina', 4, '8-10', '70kg', 90, '3-1-2-0', 'normal', 1, 'Puxar até o peito'),
(@plan1_id, @day_b, 'Remada Curvada', 'costas', 'barra', 4, '8-10', '60kg', 90, '3-0-2-0', 'normal', 2, 'Manter lombar neutra'),
(@plan1_id, @day_b, 'Remada Unilateral', 'costas', 'halteres', 3, '10-12', '30kg', 60, '2-1-2-0', 'normal', 3, 'Foco na retração escapular'),
(@plan1_id, @day_b, 'Pulldown Corda', 'costas', 'cabo', 3, '12-15', '40kg', 60, '2-1-2-1', 'normal', 4, NULL),
(@plan1_id, @day_b, 'Rosca Direta com Barra', 'biceps', 'barra', 4, '10-12', '30kg', 60, '3-0-2-0', 'normal', 5, 'Cotovelos fixos'),
(@plan1_id, @day_b, 'Rosca Alternada', 'biceps', 'halteres', 3, '10-12', '14kg', 60, '2-0-2-1', 'normal', 6, 'Supinação no topo'),
(@plan1_id, @day_b, 'Rosca Martelo', 'biceps', 'halteres', 3, '12-15', '12kg', 45, '2-0-2-0', 'drop_set', 7, 'Última série drop set');

-- Exercícios Dia C (Ombros e Abdômen)
INSERT INTO training_exercises (plan_id, training_day_id, name, muscle_group, equipment, sets, reps, weight, rest_seconds, tempo, technique, order_index, notes) VALUES
(@plan1_id, @day_c, 'Desenvolvimento com Halteres', 'ombros', 'halteres', 4, '8-10', '22kg', 90, '3-0-2-0', 'normal', 1, NULL),
(@plan1_id, @day_c, 'Elevação Lateral', 'ombros', 'halteres', 4, '12-15', '10kg', 60, '2-1-2-0', 'normal', 2, 'Não subir acima dos ombros'),
(@plan1_id, @day_c, 'Elevação Frontal Alternada', 'ombros', 'halteres', 3, '12-15', '8kg', 60, '2-0-2-0', 'normal', 3, NULL),
(@plan1_id, @day_c, 'Crucifixo Inverso', 'ombros', 'maquina', 3, '12-15', '35kg', 60, '2-1-2-1', 'normal', 4, 'Foco no deltóide posterior'),
(@plan1_id, @day_c, 'Encolhimento com Halteres', 'ombros', 'halteres', 3, '12-15', '26kg', 60, '2-2-2-0', 'normal', 5, 'Segurar no topo'),
(@plan1_id, @day_c, 'Abdominal na Máquina', 'abdomen', 'maquina', 4, '15-20', '40kg', 45, '2-1-2-0', 'normal', 6, NULL),
(@plan1_id, @day_c, 'Prancha', 'abdomen', 'peso_corporal', 3, '45-60s', 'Isométrico', 30, NULL, 'normal', 7, 'Manter quadril alinhado');

-- Exercícios Dia D (Pernas)
INSERT INTO training_exercises (plan_id, training_day_id, name, muscle_group, equipment, sets, reps, weight, rest_seconds, tempo, technique, order_index, notes) VALUES
(@plan1_id, @day_d, 'Agachamento Livre', 'quadriceps', 'barra', 4, '8-10', '100kg', 120, '3-1-2-0', 'normal', 1, 'Descer até 90 graus'),
(@plan1_id, @day_d, 'Leg Press 45°', 'quadriceps', 'maquina', 4, '10-12', '200kg', 90, '3-0-2-0', 'normal', 2, 'Pés na largura dos ombros'),
(@plan1_id, @day_d, 'Cadeira Extensora', 'quadriceps', 'maquina', 3, '12-15', '60kg', 60, '2-1-2-1', 'drop_set', 3, 'Última série drop set'),
(@plan1_id, @day_d, 'Stiff', 'posterior', 'barra', 4, '10-12', '60kg', 90, '3-1-2-0', 'normal', 4, 'Sentir alongamento'),
(@plan1_id, @day_d, 'Mesa Flexora', 'posterior', 'maquina', 3, '12-15', '45kg', 60, '2-1-2-1', 'normal', 5, NULL),
(@plan1_id, @day_d, 'Elevação Pélvica', 'gluteos', 'barra', 3, '12-15', '80kg', 60, '2-2-2-0', 'normal', 6, 'Squeeze no topo'),
(@plan1_id, @day_d, 'Panturrilha em Pé', 'panturrilha', 'maquina', 4, '15-20', '100kg', 45, '2-2-2-0', 'normal', 7, 'Amplitude completa');

-- Plano para Maria (Emagrecimento)
INSERT INTO training_plans (athlete_id, coach_id, name, description, objective, duration_weeks, frequency_per_week, level, split_type, start_date, end_date, status)
VALUES (@athlete2_id, @professional_id, 'Emagrecimento Funcional', 'Circuito metabólico para perda de gordura', 'emagrecimento', 12, 3, 'iniciante', 'ABC', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 12 WEEK), 'active');
SET @plan2_id = LAST_INSERT_ID();

INSERT INTO training_days (plan_id, day_letter, day_name, focus_muscles, estimated_duration, order_index) VALUES
(@plan2_id, 'A', 'Full Body + Cardio', 'Corpo inteiro', 50, 1),
(@plan2_id, 'B', 'Upper Body + Core', 'Membros superiores e core', 45, 2),
(@plan2_id, 'C', 'Lower Body + HIIT', 'Membros inferiores', 50, 3);

-- Plano para Pedro (Corrida - Resistência)
INSERT INTO training_plans (athlete_id, coach_id, name, description, objective, duration_weeks, frequency_per_week, level, split_type, start_date, end_date, status)
VALUES (@athlete3_id, @professional_id, 'Preparação Maratona', 'Periodização para maratona sub-4h', 'resistencia', 16, 5, 'intermediario', 'Periodizado', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 16 WEEK), 'active');

-- Plano para Carlos (Força - Powerlifting)
INSERT INTO training_plans (athlete_id, coach_id, name, description, objective, duration_weeks, frequency_per_week, level, split_type, start_date, end_date, status)
VALUES (@athlete5_id, @professional_id, 'Força Máxima 5x5', 'Programa de força baseado em 5x5', 'forca', 8, 4, 'avancado', 'Upper/Lower', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 8 WEEK), 'active');

-- =====================================================
-- 4. PLANOS NUTRICIONAIS
-- =====================================================

-- Plano Nutricional Lucas (Hipertrofia - 3000 kcal)
INSERT INTO nutrition_plans (athlete_id, nutritionist_id, name, description, daily_calories, protein_grams, carbs_grams, fat_grams, start_date, end_date, status)
VALUES (@athlete1_id, @professional_id, 'Dieta Hipertrofia 3000kcal', 'Plano hipercalórico para ganho de massa', 3000, 180, 375, 83, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 8 WEEK), 'active');
SET @nutri_plan1_id = LAST_INSERT_ID();

-- Refeições do Lucas
INSERT INTO meals (plan_id, name, time, description, order_index) VALUES
(@nutri_plan1_id, 'Café da Manhã', '07:00:00', 'Primeira refeição do dia', 1),
(@nutri_plan1_id, 'Lanche da Manhã', '10:00:00', 'Lanche pré-treino', 2),
(@nutri_plan1_id, 'Almoço', '12:30:00', 'Refeição principal', 3),
(@nutri_plan1_id, 'Lanche da Tarde', '15:30:00', 'Lanche pós-treino', 4),
(@nutri_plan1_id, 'Jantar', '19:00:00', 'Segunda refeição principal', 5),
(@nutri_plan1_id, 'Ceia', '21:30:00', 'Última refeição', 6);

SET @meal1 = LAST_INSERT_ID() - 5;
SET @meal2 = LAST_INSERT_ID() - 4;
SET @meal3 = LAST_INSERT_ID() - 3;
SET @meal4 = LAST_INSERT_ID() - 2;
SET @meal5 = LAST_INSERT_ID() - 1;
SET @meal6 = LAST_INSERT_ID();

-- Alimentos Café da Manhã
INSERT INTO meal_foods (meal_id, name, quantity, unit, calories, protein, carbs, fat, order_index) VALUES
(@meal1, 'Ovos mexidos', 3, 'unidades', 210, 18, 2, 15, 1),
(@meal1, 'Pão integral', 2, 'fatias', 140, 6, 24, 2, 2),
(@meal1, 'Queijo minas', 2, 'fatias', 100, 8, 1, 7, 3),
(@meal1, 'Banana', 1, 'unidade média', 105, 1, 27, 0, 4),
(@meal1, 'Café com leite', 200, 'ml', 80, 4, 8, 3, 5);

-- Alimentos Lanche da Manhã
INSERT INTO meal_foods (meal_id, name, quantity, unit, calories, protein, carbs, fat, order_index) VALUES
(@meal2, 'Whey Protein', 1, 'scoop (30g)', 120, 24, 3, 1, 1),
(@meal2, 'Aveia', 40, 'g', 150, 5, 27, 3, 2),
(@meal2, 'Pasta de amendoim', 1, 'colher sopa', 95, 4, 3, 8, 3);

-- Alimentos Almoço
INSERT INTO meal_foods (meal_id, name, quantity, unit, calories, protein, carbs, fat, order_index) VALUES
(@meal3, 'Arroz branco', 150, 'g', 195, 4, 43, 0, 1),
(@meal3, 'Feijão carioca', 100, 'g', 77, 5, 14, 0, 2),
(@meal3, 'Peito de frango grelhado', 200, 'g', 330, 62, 0, 7, 3),
(@meal3, 'Brócolis refogado', 100, 'g', 55, 4, 11, 1, 4),
(@meal3, 'Salada verde', 1, 'porção', 25, 2, 4, 0, 5),
(@meal3, 'Azeite de oliva', 1, 'colher sopa', 120, 0, 0, 14, 6);

-- Alimentos Lanche da Tarde (Pós-treino)
INSERT INTO meal_foods (meal_id, name, quantity, unit, calories, protein, carbs, fat, order_index) VALUES
(@meal4, 'Whey Protein', 1, 'scoop (30g)', 120, 24, 3, 1, 1),
(@meal4, 'Batata doce', 200, 'g', 172, 3, 40, 0, 2),
(@meal4, 'Frango desfiado', 100, 'g', 165, 31, 0, 4, 3);

-- Alimentos Jantar
INSERT INTO meal_foods (meal_id, name, quantity, unit, calories, protein, carbs, fat, order_index) VALUES
(@meal5, 'Arroz integral', 120, 'g', 140, 3, 29, 1, 1),
(@meal5, 'Carne vermelha magra', 180, 'g', 280, 46, 0, 10, 2),
(@meal5, 'Legumes salteados', 150, 'g', 75, 3, 15, 1, 3),
(@meal5, 'Salada colorida', 1, 'porção', 40, 2, 8, 0, 4);

-- Alimentos Ceia
INSERT INTO meal_foods (meal_id, name, quantity, unit, calories, protein, carbs, fat, order_index) VALUES
(@meal6, 'Iogurte natural', 200, 'g', 120, 8, 10, 5, 1),
(@meal6, 'Caseína', 1, 'scoop (30g)', 110, 24, 2, 1, 2),
(@meal6, 'Castanhas mistas', 30, 'g', 180, 5, 6, 16, 3);

-- Plano Nutricional Maria (Emagrecimento - 1600 kcal)
INSERT INTO nutrition_plans (athlete_id, nutritionist_id, name, description, daily_calories, protein_grams, carbs_grams, fat_grams, start_date, end_date, status)
VALUES (@athlete2_id, @professional_id, 'Dieta Low Carb 1600kcal', 'Plano para perda de gordura com baixo carboidrato', 1600, 120, 100, 89, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 12 WEEK), 'active');
SET @nutri_plan2_id = LAST_INSERT_ID();

INSERT INTO meals (plan_id, name, time, description, order_index) VALUES
(@nutri_plan2_id, 'Café da Manhã', '07:30:00', 'Primeira refeição', 1),
(@nutri_plan2_id, 'Almoço', '12:00:00', 'Refeição principal', 2),
(@nutri_plan2_id, 'Lanche da Tarde', '16:00:00', 'Lanche proteico', 3),
(@nutri_plan2_id, 'Jantar', '19:30:00', 'Última refeição sólida', 4);

-- Plano para Pedro (Corredor - 2800 kcal)
INSERT INTO nutrition_plans (athlete_id, nutritionist_id, name, description, daily_calories, protein_grams, carbs_grams, fat_grams, start_date, end_date, status)
VALUES (@athlete3_id, @professional_id, 'Dieta Endurance', 'Alto carboidrato para performance em corrida', 2800, 126, 455, 56, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 16 WEEK), 'active');

-- Plano para Roberto (Diabetes - Controle)
INSERT INTO nutrition_plans (athlete_id, nutritionist_id, name, description, daily_calories, protein_grams, carbs_grams, fat_grams, start_date, end_date, status)
VALUES (@athlete7_id, @professional_id, 'Controle Glicêmico', 'Plano para controle de diabetes tipo 2', 1800, 90, 180, 67, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 24 WEEK), 'active');

-- =====================================================
-- 5. BIBLIOTECA DE ALIMENTOS (Alguns exemplos)
-- =====================================================

INSERT INTO food_library (consultancy_id, name, category, serving_size, calories, protein, carbs, fat, fiber, is_global) VALUES
(@consultancy_id, 'Peito de Frango Grelhado', 'proteina', '100g', 165, 31, 0, 3.6, 0, FALSE),
(@consultancy_id, 'Arroz Branco Cozido', 'carboidrato', '100g', 130, 2.7, 28, 0.3, 0.4, FALSE),
(@consultancy_id, 'Batata Doce Cozida', 'carboidrato', '100g', 86, 1.6, 20, 0.1, 3, FALSE),
(@consultancy_id, 'Ovo Inteiro Cozido', 'proteina', '1 unidade (50g)', 78, 6.3, 0.6, 5.3, 0, FALSE),
(@consultancy_id, 'Banana Prata', 'fruta', '1 unidade (100g)', 98, 1.3, 26, 0.1, 2, FALSE),
(@consultancy_id, 'Abacate', 'gordura', '100g', 160, 2, 8.5, 14.7, 6.7, FALSE),
(@consultancy_id, 'Salmão Grelhado', 'proteina', '100g', 208, 20, 0, 13, 0, FALSE),
(@consultancy_id, 'Brócolis Cozido', 'vegetal', '100g', 35, 2.4, 7, 0.4, 3.3, FALSE),
(@consultancy_id, 'Whey Protein Concentrado', 'suplemento', '30g (1 scoop)', 120, 24, 3, 1.5, 0, FALSE),
(@consultancy_id, 'Aveia em Flocos', 'carboidrato', '100g', 379, 13, 66, 7, 10, FALSE),
(@consultancy_id, 'Pasta de Amendoim', 'gordura', '1 colher sopa (15g)', 94, 4, 3, 8, 1, FALSE),
(@consultancy_id, 'Iogurte Natural Integral', 'lacteo', '100g', 61, 3.5, 4.7, 3.3, 0, FALSE),
(@consultancy_id, 'Queijo Cottage', 'lacteo', '100g', 98, 11, 3.4, 4.3, 0, FALSE),
(@consultancy_id, 'Feijão Carioca Cozido', 'carboidrato', '100g', 77, 4.8, 14, 0.5, 8.5, FALSE),
(@consultancy_id, 'Maçã', 'fruta', '1 unidade (150g)', 78, 0.4, 21, 0.2, 3.6, FALSE);

-- =====================================================
-- 6. AGENDAMENTOS (Consultas)
-- =====================================================

INSERT INTO appointments (athlete_id, professional_id, type, title, description, scheduled_at, duration_minutes, status, location, notes) VALUES
-- Consultas de hoje
(@athlete1_id, @professional_id, 'training', 'Avaliação de Treino', 'Avaliação mensal do progresso de treino', DATE_ADD(CURDATE(), INTERVAL 10 HOUR), 60, 'confirmed', 'Sala 1', 'Trazer planilha de treino'),
(@athlete2_id, @professional_id, 'nutrition', 'Consulta Nutricional', 'Acompanhamento semanal da dieta', DATE_ADD(CURDATE(), INTERVAL 14 HOUR), 45, 'scheduled', 'Sala 2', NULL),
(@athlete4_id, @professional_id, 'rehab', 'Sessão de Fisioterapia', 'Reabilitação do joelho', DATE_ADD(CURDATE(), INTERVAL 16 HOUR), 50, 'confirmed', 'Studio', 'Trazer exames'),

-- Consultas amanhã
(@athlete3_id, @professional_id, 'evaluation', 'Avaliação Física', 'Avaliação completa pré-temporada', DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL 9 HOUR), 90, 'scheduled', 'Sala Avaliação', 'Jejum de 3h'),
(@athlete5_id, @professional_id, 'training', 'Ajuste de Cargas', 'Revisão do programa de força', DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL 11 HOUR), 45, 'scheduled', 'Academia', NULL),
(@athlete6_id, @professional_id, 'training', 'Prescrição de Treino', 'Novo programa de CrossFit', DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL 15 HOUR), 60, 'confirmed', 'Box', NULL),

-- Consultas próxima semana
(@athlete7_id, @professional_id, 'medical', 'Consulta Médica', 'Acompanhamento diabetes', DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 3 DAY), INTERVAL 10 HOUR), 30, 'scheduled', 'Consultório', 'Trazer glicemia dos últimos 15 dias'),
(@athlete8_id, @professional_id, 'evaluation', 'Avaliação Gestante', 'Acompanhamento mensal', DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 4 DAY), INTERVAL 14 HOUR), 45, 'scheduled', 'Sala 1', NULL),

-- Consultas passadas (completadas)
(@athlete1_id, @professional_id, 'training', 'Prescrição Inicial', 'Montagem do programa ABCD', DATE_SUB(CURDATE(), INTERVAL 7 DAY), 90, 'completed', 'Sala 1', 'Plano entregue'),
(@athlete2_id, @professional_id, 'nutrition', 'Consulta Inicial', 'Anamnese e montagem do plano', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 60, 'completed', 'Sala 2', 'Exames solicitados'),
(@athlete3_id, @professional_id, 'evaluation', 'Teste de VO2', 'Avaliação cardiorrespiratória', DATE_SUB(CURDATE(), INTERVAL 14 DAY), 120, 'completed', 'Lab', 'VO2max: 52 ml/kg/min'),
(@athlete4_id, @professional_id, 'rehab', 'Sessão 1', 'Início da reabilitação', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 50, 'completed', 'Studio', 'Boa evolução'),
(@athlete5_id, @professional_id, 'training', 'Teste de 1RM', 'Teste de força máxima', DATE_SUB(CURDATE(), INTERVAL 21 DAY), 90, 'completed', 'Academia', 'Supino: 120kg, Agachamento: 160kg, Terra: 180kg');

-- =====================================================
-- 7. PRONTUÁRIOS MÉDICOS
-- =====================================================

INSERT INTO medical_records (athlete_id, doctor_id, record_date, type, title, description, diagnosis, treatment) VALUES
(@athlete2_id, @professional_id, DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'consultation', 'Avaliação Inicial', 'Paciente relata histórico de hipertensão controlada com medicamento', 'Hipertensão arterial sistêmica controlada', 'Manter medicação atual, monitorar PA durante exercícios'),
(@athlete4_id, @professional_id, DATE_SUB(CURDATE(), INTERVAL 90 DAY), 'injury', 'Lesão LCA', 'Lesão do ligamento cruzado anterior durante prática esportiva', 'Ruptura completa do LCA joelho direito', 'Cirurgia de reconstrução realizada, iniciar fisioterapia'),
(@athlete4_id, @professional_id, DATE_SUB(CURDATE(), INTERVAL 60 DAY), 'exam', 'Ressonância Pós-Op', 'Exame de controle após cirurgia', 'Enxerto bem posicionado, sem complicações', 'Prosseguir com protocolo de reabilitação'),
(@athlete5_id, @professional_id, DATE_SUB(CURDATE(), INTERVAL 45 DAY), 'consultation', 'Dor Lombar', 'Paciente refere dor lombar após treino pesado', 'Lombalgia mecânica', 'Ajustar técnica de levantamento terra, alongamentos diários'),
(@athlete7_id, @professional_id, DATE_SUB(CURDATE(), INTERVAL 60 DAY), 'exam', 'Hemoglobina Glicada', 'Resultado de exame de HbA1c', 'HbA1c: 7.2% - Controle moderado', 'Intensificar atividade física, manter metformina'),
(@athlete7_id, @professional_id, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'consultation', 'Retorno Diabetes', 'Acompanhamento mensal', 'Glicemia em jejum: 126 mg/dL', 'Solicitar novo HbA1c em 30 dias'),
(@athlete8_id, @professional_id, DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'evaluation', 'Liberação para Exercícios', 'Gestante de 20 semanas solicita liberação para atividade física', 'Gestação de baixo risco', 'Liberada para exercícios leves a moderados, evitar impacto');

-- =====================================================
-- 8. SESSÕES DE REABILITAÇÃO
-- =====================================================

INSERT INTO rehab_sessions (athlete_id, physio_id, session_date, injury_description, treatment, exercises, progress_notes, next_session, status) VALUES
(@athlete4_id, @professional_id, DATE_SUB(CURDATE(), INTERVAL 14 DAY), 'Pós-operatório LCA - Fase 1', 'Mobilização passiva, crioterapia, exercícios isométricos', 'Contrações isométricas de quadríceps, flexão passiva de joelho até 90°, elevação da perna estendida', 'Amplitude de flexão atingiu 85°, dor controlada', DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'completed'),
(@athlete4_id, @professional_id, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'Pós-operatório LCA - Fase 2', 'Exercícios ativos assistidos, propriocepção inicial', 'Mini agachamento na parede, step up baixo, propriocepção em superfície estável', 'Boa evolução, flexão em 100°, iniciando apoio bipodal', CURDATE(), 'completed'),
(@athlete4_id, @professional_id, CURDATE(), 'Pós-operatório LCA - Fase 2/3', 'Fortalecimento progressivo, treino de marcha', 'Leg press leve, propriocepção em bosu, caminhada na esteira', NULL, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'scheduled'),
(@athlete5_id, @professional_id, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Lombalgia mecânica', 'Liberação miofascial, mobilização vertebral, estabilização de core', 'Cat-cow, bird-dog, prancha lateral, alongamento de iliopsoas', 'Dor reduziu de 7/10 para 3/10, sem irradiação', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'completed'),
(@athlete5_id, @professional_id, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Lombalgia mecânica - Retorno', 'Exercícios de estabilização avançados, educação postural', 'Dead bug, pallof press, agachamento com foco em bracing', 'Paciente assintomático em AVDs, liberado para retorno gradual', NULL, 'completed');

-- =====================================================
-- 9. PROGRESSO DOS ATLETAS
-- =====================================================

INSERT INTO athlete_progress (athlete_id, record_date, weight, body_fat_percentage, muscle_mass, notes, metrics) VALUES
-- Lucas (ganho de massa)
(@athlete1_id, DATE_SUB(CURDATE(), INTERVAL 60 DAY), 78.00, 18.0, 36.5, 'Início do programa', '{"chest": 98, "arm": 35, "waist": 82, "thigh": 56}'),
(@athlete1_id, DATE_SUB(CURDATE(), INTERVAL 45 DAY), 79.50, 17.5, 37.2, 'Boa adaptação ao treino', '{"chest": 99, "arm": 35.5, "waist": 82, "thigh": 57}'),
(@athlete1_id, DATE_SUB(CURDATE(), INTERVAL 30 DAY), 80.80, 17.0, 38.0, 'Aumento de força significativo', '{"chest": 100, "arm": 36, "waist": 83, "thigh": 58}'),
(@athlete1_id, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 82.00, 16.5, 38.8, 'Progresso excelente', '{"chest": 101, "arm": 36.5, "waist": 83, "thigh": 58.5}'),
(@athlete1_id, CURDATE(), 82.50, 16.0, 39.2, 'Meta de massa atingida', '{"chest": 102, "arm": 37, "waist": 83, "thigh": 59}'),

-- Maria (emagrecimento)
(@athlete2_id, DATE_SUB(CURDATE(), INTERVAL 60 DAY), 72.00, 32.0, 24.5, 'Início do programa', '{"waist": 88, "hip": 104, "thigh": 62}'),
(@athlete2_id, DATE_SUB(CURDATE(), INTERVAL 45 DAY), 70.50, 30.5, 24.8, 'Adaptação à dieta', '{"waist": 86, "hip": 102, "thigh": 61}'),
(@athlete2_id, DATE_SUB(CURDATE(), INTERVAL 30 DAY), 68.80, 29.0, 25.0, 'Perda consistente', '{"waist": 84, "hip": 100, "thigh": 60}'),
(@athlete2_id, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 67.20, 27.5, 25.2, 'Motivada com resultados', '{"waist": 82, "hip": 98, "thigh": 59}'),
(@athlete2_id, CURDATE(), 66.00, 26.0, 25.5, 'Já perdeu 6kg!', '{"waist": 80, "hip": 96, "thigh": 58}'),

-- Pedro (manutenção peso, melhora VO2)
(@athlete3_id, DATE_SUB(CURDATE(), INTERVAL 45 DAY), 68.00, 12.0, 30.0, 'Base aeróbica', '{"vo2max": 48, "resting_hr": 58}'),
(@athlete3_id, DATE_SUB(CURDATE(), INTERVAL 30 DAY), 67.50, 11.5, 30.2, 'Volume aumentado', '{"vo2max": 50, "resting_hr": 56}'),
(@athlete3_id, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 67.00, 11.0, 30.5, 'Treinos de limiar', '{"vo2max": 51, "resting_hr": 54}'),
(@athlete3_id, CURDATE(), 68.00, 10.5, 31.0, 'Fase de intensidade', '{"vo2max": 52, "resting_hr": 52}'),

-- Carlos (força)
(@athlete5_id, DATE_SUB(CURDATE(), INTERVAL 45 DAY), 93.00, 20.0, 42.0, 'Início do 5x5', '{"squat_1rm": 140, "bench_1rm": 100, "deadlift_1rm": 160}'),
(@athlete5_id, DATE_SUB(CURDATE(), INTERVAL 30 DAY), 94.00, 19.5, 43.0, 'Adaptação neural', '{"squat_1rm": 150, "bench_1rm": 110, "deadlift_1rm": 170}'),
(@athlete5_id, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 94.50, 19.0, 43.5, 'Força aumentando', '{"squat_1rm": 155, "bench_1rm": 115, "deadlift_1rm": 175}'),
(@athlete5_id, CURDATE(), 95.00, 18.5, 44.0, 'Novos PRs!', '{"squat_1rm": 160, "bench_1rm": 120, "deadlift_1rm": 180}'),

-- Roberto (controle diabetes)
(@athlete7_id, DATE_SUB(CURDATE(), INTERVAL 60 DAY), 90.00, 28.0, 32.0, 'Início - glicemia elevada', '{"fasting_glucose": 145, "hba1c": 7.8}'),
(@athlete7_id, DATE_SUB(CURDATE(), INTERVAL 30 DAY), 88.50, 27.0, 32.5, 'Melhora nos marcadores', '{"fasting_glucose": 130, "hba1c": 7.4}'),
(@athlete7_id, CURDATE(), 88.00, 26.5, 33.0, 'Controle melhorando', '{"fasting_glucose": 126, "hba1c": 7.2}');

-- =====================================================
-- 10. MENSAGENS
-- =====================================================

INSERT INTO messages (sender_id, receiver_id, subject, content, is_read, created_at) VALUES
(@user1_id, @professional_id, 'Dúvida sobre suplementação', 'Prof, posso tomar creatina junto com o whey no pós-treino?', TRUE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(@professional_id, @user1_id, 'Re: Dúvida sobre suplementação', 'Pode sim, Lucas! Inclusive é uma boa estratégia. 5g de creatina por dia, pode ser no pós-treino junto com o whey.', TRUE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(@user2_id, @professional_id, 'Cardápio do fim de semana', 'O que posso comer no churrasco de domingo sem sair muito da dieta?', TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(@professional_id, @user2_id, 'Re: Cardápio do fim de semana', 'Maria, priorize as carnes magras (frango, maminha). Faça um prato de salada antes. Evite a farofa e o pão de alho. Uma cerveja no máximo! 😉', TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(@user4_id, @professional_id, 'Dor no joelho', 'Prof, senti uma fisgada no joelho hoje ao subir escada. É normal?', FALSE, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(@user6_id, @professional_id, 'Competição próxima', 'Tem como adiantar meu treino de quinta? Vou viajar para competir no fim de semana.', FALSE, DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT 'Pacientes criados:' AS info, COUNT(*) AS total FROM athletes WHERE user_id IN (SELECT id FROM users WHERE consultancy_id = @consultancy_id);
SELECT 'Planos de treino:' AS info, COUNT(*) AS total FROM training_plans WHERE coach_id = @professional_id;
SELECT 'Exercícios prescritos:' AS info, COUNT(*) AS total FROM training_exercises WHERE plan_id IN (SELECT id FROM training_plans WHERE coach_id = @professional_id);
SELECT 'Planos nutricionais:' AS info, COUNT(*) AS total FROM nutrition_plans WHERE nutritionist_id = @professional_id;
SELECT 'Refeições:' AS info, COUNT(*) AS total FROM meals WHERE plan_id IN (SELECT id FROM nutrition_plans WHERE nutritionist_id = @professional_id);
SELECT 'Agendamentos:' AS info, COUNT(*) AS total FROM appointments WHERE professional_id = @professional_id;
SELECT 'Prontuários:' AS info, COUNT(*) AS total FROM medical_records WHERE doctor_id = @professional_id;
SELECT 'Sessões reab:' AS info, COUNT(*) AS total FROM rehab_sessions WHERE physio_id = @professional_id;
SELECT 'Registros progresso:' AS info, COUNT(*) AS total FROM athlete_progress;

SELECT '✅ DADOS DEMO INSERIDOS COM SUCESSO!' AS resultado;
