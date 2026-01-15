-- Dados de exemplo para desenvolvimento
-- Senhas em texto simples para desenvolvimento (em produção usar bcrypt)

-- Configurar charset UTF-8
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Limpar dados existentes (para re-execução)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE food_substitutions;
TRUNCATE TABLE meal_foods;
TRUNCATE TABLE food_library;
TRUNCATE TABLE rehab_sessions;
TRUNCATE TABLE athlete_progress;
TRUNCATE TABLE messages;
TRUNCATE TABLE medical_records;
TRUNCATE TABLE meals;
TRUNCATE TABLE nutrition_plans;
TRUNCATE TABLE training_exercises;
TRUNCATE TABLE training_days;
TRUNCATE TABLE training_plans;
TRUNCATE TABLE exercise_library;
TRUNCATE TABLE appointments;
TRUNCATE TABLE athletes;
TRUNCATE TABLE users;
TRUNCATE TABLE consultancies;
TRUNCATE TABLE super_admins;
SET FOREIGN_KEY_CHECKS = 1;

-- ===============================
-- SUPER ADMIN (Você - Dono do SaaS)
-- ===============================
INSERT INTO super_admins (id, email, password_hash, name) VALUES
(1, 'matheus@admin.com', 'super123', 'Matheus (Super Admin)');

-- ===============================
-- CONSULTORIAS (Clientes pagantes)
-- ===============================
INSERT INTO consultancies (id, name, slug, email, phone, plan, price_monthly, has_training, has_nutrition, has_medical, has_rehab, max_professionals, max_patients, status, trial_ends_at) VALUES
(1, 'Elite Performance', 'elite', 'contato@eliteperformance.com', '(11) 99999-0000', 'enterprise', 997.00, TRUE, TRUE, TRUE, TRUE, 10, 100, 'active', NULL),
(2, 'FitPro Nutrição', 'fitpro', 'contato@fitpro.com', '(21) 99888-0000', 'basic', 297.00, FALSE, TRUE, FALSE, FALSE, 3, 30, 'active', NULL),
(3, 'SportMed Clínica', 'sportmed', 'contato@sportmed.com', '(31) 99777-0000', 'professional', 597.00, TRUE, FALSE, TRUE, TRUE, 5, 50, 'trial', DATE_ADD(NOW(), INTERVAL 14 DAY));

-- ===============================
-- PROFISSIONAIS da Elite Performance (consultancy_id = 1)
-- ===============================
INSERT INTO users (id, consultancy_id, email, password_hash, name, role, phone, avatar_url) VALUES
(1, 1, 'medico@elite.com', 'medico123', 'Dr. Ricardo Santos', 'admin', '(11) 99999-0001', NULL),
(2, 1, 'nutri@elite.com', 'nutri123', 'Dra. Ana Beatriz', 'nutritionist', '(11) 99999-0002', NULL),
(3, 1, 'treinador@elite.com', 'treinador123', 'Carlos Mendes', 'coach', '(11) 99999-0003', NULL);

-- ===============================
-- PACIENTES da Elite Performance (consultancy_id = 1)
-- ===============================
INSERT INTO users (id, consultancy_id, email, password_hash, name, role, phone, avatar_url) VALUES
(4, 1, 'joao@email.com', 'joao123', 'João Silva', 'athlete', '(11) 98888-0001', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
(5, 1, 'maria@email.com', 'maria123', 'Maria Santos', 'athlete', '(11) 98888-0002', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'),
(6, 1, 'pedro@email.com', 'pedro123', 'Pedro Oliveira', 'athlete', '(11) 98888-0003', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face');

-- ===============================
-- PROFISSIONAIS da FitPro (consultancy_id = 2 - só nutrição)
-- ===============================
INSERT INTO users (id, consultancy_id, email, password_hash, name, role, phone, avatar_url) VALUES
(7, 2, 'nutri@fitpro.com', 'nutri123', 'Dr. Lucas Nutrição', 'nutritionist', '(21) 99888-0001', NULL);

-- ===============================
-- PROFISSIONAIS da SportMed (consultancy_id = 3 - treino + médico + reab)
-- ===============================
INSERT INTO users (id, consultancy_id, email, password_hash, name, role, phone, avatar_url) VALUES
(8, 3, 'medico@sportmed.com', 'medico123', 'Dra. Carla Médica', 'admin', '(31) 99777-0001', NULL),
(9, 3, 'fisio@sportmed.com', 'fisio123', 'Dr. Fernando Fisio', 'physio', '(31) 99777-0002', NULL);

-- Dados dos atletas
INSERT INTO athletes (id, user_id, birth_date, sport, position, height, weight, club, goals) VALUES
(1, 4, '1995-03-15', 'Futebol', 'Atacante', 178.00, 75.50, 'São Paulo FC', 'Melhorar velocidade e resistência para a próxima temporada'),
(2, 5, '1998-07-22', 'Natação', 'Velocista', 165.00, 58.00, 'Pinheiros', 'Quebrar recorde pessoal nos 100m livre'),
(3, 6, '1997-11-08', 'Basquete', 'Ala', 195.00, 92.00, 'Flamengo', 'Aumentar massa muscular e melhorar salto vertical');

-- ===============================
-- BIBLIOTECA DE EXERCÍCIOS (Global - disponível para todas consultorias)
-- ===============================
INSERT INTO exercise_library (id, consultancy_id, name, description, muscle_group, secondary_muscle, equipment, difficulty, video_url, instructions, tips, is_global) VALUES
-- PEITO
(1, NULL, 'Supino Reto com Barra', 'Exercício fundamental para desenvolvimento do peitoral', 'peito', 'triceps, ombros', 'barra', 'intermediario', 'https://www.youtube.com/watch?v=rT7DgCr-3pg', 'Deite no banco, pés no chão. Segure a barra com pegada um pouco mais larga que os ombros. Desça controladamente até o peito e empurre.', 'Mantenha as escápulas retraídas e o peito estufado. Não deixe os cotovelos abrirem demais.', TRUE),
(2, NULL, 'Supino Inclinado com Halteres', 'Foco na parte superior do peitoral', 'peito', 'ombros, triceps', 'halteres', 'intermediario', 'https://www.youtube.com/watch?v=8iPEnn-ltC8', 'Banco inclinado a 30-45°. Halteres na altura do peito, cotovelos em 45°. Empurre para cima e junte no topo.', 'Inclinação maior = mais ombro. Mantenha entre 30-45° para focar no peitoral superior.', TRUE),
(3, NULL, 'Crucifixo na Polia', 'Isolamento para peitoral com tensão constante', 'peito', NULL, 'cabo', 'iniciante', NULL, 'Polias na posição alta. Pegue os cabos, dê um passo à frente. Braços abertos, leve flexão no cotovelo. Junte as mãos à frente do peito.', 'Squeeze no final do movimento. Mantenha o core ativado para não balançar.', TRUE),
(4, NULL, 'Flexão de Braço', 'Exercício fundamental com peso corporal', 'peito', 'triceps, ombros, core', 'peso_corporal', 'iniciante', NULL, 'Mãos no chão, um pouco mais largas que os ombros. Corpo reto da cabeça aos pés. Desça até o peito quase tocar o chão.', 'Não deixe o quadril subir ou descer. Ative o core durante todo o movimento.', TRUE),

-- COSTAS
(5, NULL, 'Barra Fixa (Pull-up)', 'Exercício composto para costas e bíceps', 'costas', 'biceps, antebraco', 'peso_corporal', 'avancado', 'https://www.youtube.com/watch?v=eGo4IYlbE5g', 'Pegada pronada, mãos um pouco mais largas que os ombros. Puxe o corpo até o queixo passar a barra. Desça controladamente.', 'Inicie o movimento retraindo as escápulas. Evite balanço do corpo.', TRUE),
(6, NULL, 'Remada Curvada com Barra', 'Desenvolvimento da espessura das costas', 'costas', 'biceps, posterior', 'barra', 'intermediario', 'https://www.youtube.com/watch?v=kBWAon7ItDw', 'Pés na largura dos ombros, joelhos levemente flexionados. Incline o tronco a 45°. Puxe a barra em direção ao umbigo.', 'Mantenha as costas retas. Contraia as escápulas no topo do movimento.', TRUE),
(7, NULL, 'Puxada Frontal', 'Desenvolvimento da largura das costas', 'costas', 'biceps', 'maquina', 'iniciante', NULL, 'Sente-se no equipamento, joelhos sob as almofadas. Pegada pronada um pouco mais larga que os ombros. Puxe a barra até o peito.', 'Incline levemente o tronco para trás. Foque em puxar com os cotovelos, não com as mãos.', TRUE),
(8, NULL, 'Remada Unilateral com Halter', 'Trabalho unilateral para costas', 'costas', 'biceps, core', 'halteres', 'iniciante', NULL, 'Apoie joelho e mão no banco. Outra perna no chão para estabilidade. Puxe o halter em direção ao quadril.', 'Mantenha o tronco paralelo ao chão. Não gire o corpo ao puxar.', TRUE),

-- OMBROS
(9, NULL, 'Desenvolvimento com Halteres', 'Exercício principal para deltoides', 'ombros', 'triceps', 'halteres', 'intermediario', NULL, 'Sentado ou em pé, halteres na altura dos ombros. Empurre para cima até os braços estendidos. Desça controladamente.', 'Não use impulso das pernas. Mantenha o core ativado para proteger a lombar.', TRUE),
(10, NULL, 'Elevação Lateral', 'Isolamento para deltoides médio', 'ombros', NULL, 'halteres', 'iniciante', NULL, 'Em pé, halteres ao lado do corpo. Eleve os braços até a altura dos ombros, cotovelos levemente flexionados.', 'Não eleve acima da linha dos ombros. Controle a descida, sem balançar.', TRUE),
(11, NULL, 'Elevação Frontal', 'Foco no deltoides anterior', 'ombros', NULL, 'halteres', 'iniciante', NULL, 'Em pé, halteres à frente das coxas. Eleve um braço de cada vez ou alternadamente até a altura dos ombros.', 'Palmas para baixo. Não balance o corpo para ajudar no movimento.', TRUE),
(12, NULL, 'Face Pull', 'Deltoides posterior e rotadores externos', 'ombros', 'costas', 'cabo', 'iniciante', NULL, 'Polia na altura do rosto. Corda como pegada. Puxe em direção ao rosto, abrindo os cotovelos para os lados.', 'Excelente para saúde do ombro. Faça como aquecimento ou no final do treino.', TRUE),

-- BÍCEPS
(13, NULL, 'Rosca Direta com Barra', 'Exercício clássico para bíceps', 'biceps', 'antebraco', 'barra', 'iniciante', NULL, 'Em pé, barra com pegada supinada na largura dos ombros. Flexione os cotovelos, mantendo-os junto ao corpo.', 'Não balance o tronco. Controle a descida para maximizar o tempo sob tensão.', TRUE),
(14, NULL, 'Rosca Alternada com Halteres', 'Trabalho unilateral para bíceps', 'biceps', 'antebraco', 'halteres', 'iniciante', NULL, 'Em pé, halteres ao lado do corpo. Flexione um braço de cada vez, girando o pulso durante o movimento (supinação).', 'Mantenha o cotovelo fixo ao lado do corpo. Não use impulso.', TRUE),
(15, NULL, 'Rosca Martelo', 'Foco no braquial e braquiorradial', 'biceps', 'antebraco', 'halteres', 'iniciante', NULL, 'Em pé, halteres com pegada neutra (palmas uma de frente para outra). Flexione os cotovelos mantendo a pegada neutra.', 'Excelente para desenvolvimento do antebraço e largura do braço.', TRUE),

-- TRÍCEPS
(16, NULL, 'Tríceps Pulley', 'Isolamento para tríceps com cabo', 'triceps', NULL, 'cabo', 'iniciante', NULL, 'Polia alta, corda ou barra reta. Cotovelos junto ao corpo. Estenda os braços para baixo, apertando no final.', 'Mantenha os cotovelos fixos. Foque na contração do tríceps.', TRUE),
(17, NULL, 'Tríceps Francês', 'Extensão overhead para tríceps', 'triceps', NULL, 'halteres', 'intermediario', NULL, 'Sentado ou em pé, halter ou barra atrás da cabeça. Cotovelos apontando para cima. Estenda os braços.', 'Cuidado com a carga - proteja os cotovelos. Movimento controlado.', TRUE),
(18, NULL, 'Mergulho no Banco', 'Tríceps com peso corporal', 'triceps', 'peito, ombros', 'peso_corporal', 'iniciante', NULL, 'Mãos no banco atrás de você, pés no chão ou em outro banco. Flexione os cotovelos até 90° e empurre de volta.', 'Não desça demais para proteger os ombros. Mantenha o corpo próximo ao banco.', TRUE),

-- QUADRÍCEPS
(19, NULL, 'Agachamento Livre', 'Rei dos exercícios para pernas', 'quadriceps', 'gluteos, posterior', 'barra', 'avancado', 'https://www.youtube.com/watch?v=ultWZbUMPL8', 'Barra nas costas (high bar ou low bar). Pés na largura dos ombros. Desça até as coxas ficarem paralelas ou mais.', 'Joelhos podem passar dos pés, desde que os calcanhares fiquem no chão. Core sempre ativado.', TRUE),
(20, NULL, 'Leg Press 45°', 'Exercício de força para pernas', 'quadriceps', 'gluteos', 'maquina', 'iniciante', NULL, 'Costas bem apoiadas no encosto. Pés na plataforma na largura dos ombros. Flexione os joelhos até 90° e empurre.', 'Não trave os joelhos no topo. Não tire o glúteo do banco na descida.', TRUE),
(21, NULL, 'Cadeira Extensora', 'Isolamento para quadríceps', 'quadriceps', NULL, 'maquina', 'iniciante', NULL, 'Sentado na máquina, tornozelos sob o rolo. Estenda as pernas até a extensão completa.', 'Movimento controlado. Segure a contração por 1 segundo no topo.', TRUE),
(22, NULL, 'Afundo (Lunge)', 'Exercício unilateral para pernas', 'quadriceps', 'gluteos', 'peso_corporal', 'iniciante', NULL, 'Dê um passo à frente, flexione ambos os joelhos até 90°. Joelho de trás quase toca o chão. Empurre de volta.', 'Tronco ereto. Joelho da frente não ultrapassa demais os dedos do pé.', TRUE),

-- POSTERIOR DE COXA
(23, NULL, 'Stiff (Levantamento Terra Romeno)', 'Principal exercício para posteriores', 'posterior', 'gluteos, lombar', 'barra', 'intermediario', NULL, 'Em pé, barra à frente das coxas. Joelhos levemente flexionados. Incline o tronco mantendo as costas retas.', 'Sinta o alongamento nos posteriores. Não arredonde a lombar.', TRUE),
(24, NULL, 'Mesa Flexora', 'Isolamento para posteriores', 'posterior', NULL, 'maquina', 'iniciante', NULL, 'Deitado na máquina, tornozelos sob o rolo. Flexione os joelhos trazendo os calcanhares em direção ao glúteo.', 'Não levante o quadril do apoio. Controle a volta.', TRUE),
(25, NULL, 'Cadeira Flexora', 'Variação sentado para posteriores', 'posterior', NULL, 'maquina', 'iniciante', NULL, 'Sentado na máquina, pernas sobre o rolo. Flexione os joelhos empurrando o rolo para baixo.', 'Mantenha as costas apoiadas. Movimento controlado.', TRUE),

-- GLÚTEOS
(26, NULL, 'Hip Thrust', 'Melhor exercício para glúteos', 'gluteos', 'posterior', 'barra', 'intermediario', NULL, 'Costas apoiadas no banco, pés no chão. Barra sobre o quadril. Eleve o quadril até extensão completa.', 'Squeeze máximo no topo. Queixo no peito durante o movimento.', TRUE),
(27, NULL, 'Elevação Pélvica', 'Versão no chão do hip thrust', 'gluteos', 'posterior', 'peso_corporal', 'iniciante', NULL, 'Deitado no chão, joelhos flexionados, pés no chão. Eleve o quadril apertando os glúteos.', 'Excelente para iniciantes ou como aquecimento. Segure a contração no topo.', TRUE),

-- PANTURRILHA
(28, NULL, 'Panturrilha em Pé', 'Foco no gastrocnêmio', 'panturrilha', NULL, 'maquina', 'iniciante', NULL, 'Em pé na máquina, ombros sob as almofadas. Eleve os calcanhares o máximo possível.', 'Amplitude máxima - desça bem e suba completamente. Segure a contração no topo.', TRUE),
(29, NULL, 'Panturrilha Sentado', 'Foco no sóleo', 'panturrilha', NULL, 'maquina', 'iniciante', NULL, 'Sentado na máquina, joelhos sob as almofadas. Eleve os calcanhares.', 'Joelhos flexionados trabalham mais o sóleo. Complemente com panturrilha em pé.', TRUE),

-- ABDOMEN
(30, NULL, 'Prancha', 'Estabilização do core', 'abdomen', 'lombar, ombros', 'peso_corporal', 'iniciante', NULL, 'Apoie antebraços e pontas dos pés no chão. Corpo reto da cabeça aos pés. Mantenha a posição.', 'Não deixe o quadril subir ou descer. Respire normalmente.', TRUE),
(31, NULL, 'Abdominal Crunch', 'Exercício básico de abdomen', 'abdomen', NULL, 'peso_corporal', 'iniciante', NULL, 'Deitado, joelhos flexionados. Mãos atrás da cabeça. Eleve os ombros do chão contraindo o abdomen.', 'Não puxe a cabeça com as mãos. Foque na contração do abdomen.', TRUE),
(32, NULL, 'Elevação de Pernas', 'Foco no abdomen inferior', 'abdomen', NULL, 'peso_corporal', 'intermediario', NULL, 'Deitado ou pendurado na barra. Eleve as pernas mantendo-as estendidas ou com joelhos flexionados.', 'Controle a descida. Não use impulso.', TRUE),

-- CARDIO
(33, NULL, 'Corrida na Esteira', 'Cardio de baixo impacto', 'cardio', NULL, 'maquina', 'iniciante', NULL, 'Ajuste velocidade e inclinação conforme condicionamento. Mantenha postura ereta.', 'Varie entre corrida contínua e HIIT para melhores resultados.', TRUE),
(34, NULL, 'Bike Ergométrica', 'Cardio para pernas', 'cardio', 'quadriceps', 'maquina', 'iniciante', NULL, 'Ajuste altura do banco - perna quase estendida no ponto mais baixo. Mantenha cadência constante.', 'Excelente para recuperação ativa ou aquecimento.', TRUE),
(35, NULL, 'Burpee', 'Exercício de corpo inteiro de alta intensidade', 'corpo_todo', 'peito, quadriceps, cardio', 'peso_corporal', 'avancado', NULL, 'Da posição em pé, agache, coloque as mãos no chão, jogue os pés para trás em posição de flexão, faça uma flexão, traga os pés de volta e salte.', 'Excelente para HIIT. Modifique tirando a flexão ou o salto se necessário.', TRUE);

-- ===============================
-- EXERCÍCIOS ESPECÍFICOS DA ELITE PERFORMANCE (consultancy_id = 1)
-- ===============================
INSERT INTO exercise_library (consultancy_id, name, description, muscle_group, equipment, difficulty, instructions, is_global) VALUES
(1, 'Agachamento Búlgaro', 'Exercício unilateral avançado para pernas', 'quadriceps', 'halteres', 'avancado', 'Pé traseiro elevado em um banco. Desça até o joelho da frente formar 90°. Muito usado com atletas de futebol.', FALSE),
(1, 'Sprint com Paraquedas', 'Treino de velocidade com resistência', 'quadriceps', 'outros', 'avancado', 'Corrida de velocidade máxima com paraquedas de resistência. Desenvolve potência e aceleração.', FALSE);

-- ===============================
-- AGENDAMENTOS
-- ===============================
INSERT INTO appointments (athlete_id, professional_id, type, title, scheduled_at, duration_minutes, status, location, description) VALUES
(1, 1, 'medical', 'Consulta de rotina', DATE_ADD(NOW(), INTERVAL 1 DAY), 45, 'scheduled', 'Consultório 1', 'Avaliação mensal de saúde'),
(1, 2, 'nutrition', 'Ajuste de dieta', DATE_ADD(NOW(), INTERVAL 2 DAY), 60, 'scheduled', 'Sala 3', 'Revisão do plano alimentar'),
(1, 3, 'training', 'Treino de força', DATE_ADD(NOW(), INTERVAL 3 DAY), 90, 'scheduled', 'Academia Principal', 'Treino focado em membros inferiores'),
(2, 2, 'nutrition', 'Consulta nutricional', DATE_ADD(NOW(), INTERVAL 1 DAY), 60, 'scheduled', 'Sala 3', 'Plano para competição'),
(3, 3, 'training', 'Avaliação física', DATE_ADD(NOW(), INTERVAL 2 DAY), 120, 'scheduled', 'Academia Principal', 'Testes de performance');

-- ===============================
-- PLANOS DE TREINO (com novos campos)
-- ===============================
INSERT INTO training_plans (id, athlete_id, coach_id, name, description, objective, duration_weeks, frequency_per_week, level, split_type, start_date, end_date, status) VALUES
(1, 1, 3, 'Preparação Física - Temporada 2024', 'Programa de condicionamento para a próxima temporada de futebol', 'condicionamento', 24, 5, 'avancado', 'ABCDE', '2024-01-01', '2024-06-30', 'active'),
(2, 2, 3, 'Treino de Velocidade - Natação', 'Foco em explosão e técnica para provas de velocidade', 'resistencia', 16, 6, 'avancado', 'ABC', '2024-01-15', '2024-04-30', 'active'),
(3, 3, 3, 'Hipertrofia - Basquete', 'Ganho de massa muscular e força funcional', 'hipertrofia', 20, 4, 'intermediario', 'ABCD', '2024-01-01', '2024-05-31', 'active');

-- ===============================
-- DIAS DE TREINO DO PLANO 1 (João - Futebol)
-- ===============================
INSERT INTO training_days (id, plan_id, day_letter, day_name, day_of_week, focus_muscles, estimated_duration, order_index) VALUES
(1, 1, 'A', 'Pernas - Quadríceps', 1, 'Quadríceps, Glúteos', 75, 1),
(2, 1, 'B', 'Peito e Tríceps', 2, 'Peitoral, Tríceps', 60, 2),
(3, 1, 'C', 'Costas e Bíceps', 3, 'Dorsais, Bíceps', 60, 3),
(4, 1, 'D', 'Pernas - Posterior', 4, 'Posteriores, Panturrilha', 65, 4),
(5, 1, 'E', 'Ombros e Abdomen', 5, 'Deltoides, Core', 55, 5);

-- ===============================
-- EXERCÍCIOS DO PLANO 1 (com novos campos)
-- ===============================
-- Dia A - Pernas Quadríceps
INSERT INTO training_exercises (plan_id, training_day_id, exercise_library_id, name, muscle_group, equipment, sets, reps, weight, rest_seconds, tempo, technique, rpe, video_url, order_index, notes) VALUES
(1, 1, 19, 'Agachamento Livre', 'quadriceps', 'barra', 4, '8-10', '80kg', 120, '3-1-2-0', 'normal', '8', 'https://www.youtube.com/watch?v=ultWZbUMPL8', 1, 'Foco em profundidade e postura. Aquecimento progressivo obrigatório.'),
(1, 1, 20, 'Leg Press 45°', 'quadriceps', 'maquina', 4, '12', '150kg', 90, '2-0-2-0', 'normal', '8', NULL, 2, 'Pés na posição média da plataforma.'),
(1, 1, 22, 'Afundo com Halteres', 'quadriceps', 'halteres', 3, '10 cada', '20kg', 60, '2-0-2-0', 'normal', '7', NULL, 3, 'Alternando as pernas. Passada longa.'),
(1, 1, 21, 'Cadeira Extensora', 'quadriceps', 'maquina', 3, '15', '40kg', 45, '2-1-2-0', 'drop_set', '9', NULL, 4, 'Última série drop set: tirar 30% e fazer até a falha.');

-- Dia B - Peito e Tríceps
INSERT INTO training_exercises (plan_id, training_day_id, exercise_library_id, name, muscle_group, equipment, sets, reps, weight, rest_seconds, tempo, technique, rpe, video_url, order_index, superset_group, notes) VALUES
(1, 2, 1, 'Supino Reto com Barra', 'peito', 'barra', 4, '8-10', '70kg', 120, '3-1-2-0', 'normal', '8', 'https://www.youtube.com/watch?v=rT7DgCr-3pg', 1, NULL, 'Aquecimento: 2x12 com 40kg'),
(1, 2, 2, 'Supino Inclinado com Halteres', 'peito', 'halteres', 4, '10-12', '28kg', 90, '3-0-2-0', 'normal', '8', NULL, 2, NULL, 'Banco a 30°'),
(1, 2, 3, 'Crucifixo na Polia', 'peito', 'cabo', 3, '12-15', '15kg', 60, '2-1-2-0', 'normal', '7', NULL, 3, NULL, 'Foco no squeeze'),
(1, 2, 16, 'Tríceps Pulley Corda', 'triceps', 'cabo', 3, '12', '25kg', 60, '2-0-2-1', 'normal', '7', NULL, 4, 1, 'Super série com próximo exercício'),
(1, 2, 17, 'Tríceps Francês', 'triceps', 'halteres', 3, '12', '14kg', 60, '3-0-2-0', 'super_serie', '8', NULL, 5, 1, 'Super série com exercício anterior');

-- Dia C - Costas e Bíceps  
INSERT INTO training_exercises (plan_id, training_day_id, exercise_library_id, name, muscle_group, equipment, sets, reps, weight, rest_seconds, tempo, technique, rpe, order_index, notes) VALUES
(1, 3, 5, 'Barra Fixa', 'costas', 'peso_corporal', 4, '8-10', 'Peso corporal', 120, '2-0-2-1', 'normal', '9', 1, 'Se necessário, usar banda elástica para assistência'),
(1, 3, 6, 'Remada Curvada com Barra', 'costas', 'barra', 4, '10', '60kg', 90, '2-1-2-0', 'normal', '8', 2, 'Pegada pronada, um pouco mais larga que os ombros'),
(1, 3, 8, 'Remada Unilateral', 'costas', 'halteres', 3, '12 cada', '32kg', 60, '2-0-2-1', 'normal', '7', 3, 'Cotovelo próximo ao corpo'),
(1, 3, 13, 'Rosca Direta com Barra', 'biceps', 'barra', 3, '10-12', '30kg', 60, '2-0-2-0', 'normal', '8', 4, 'Sem balançar o corpo'),
(1, 3, 15, 'Rosca Martelo', 'biceps', 'halteres', 3, '12', '14kg', 45, '2-0-2-0', 'normal', '7', 5, 'Alternado');

-- ===============================
-- PLANOS NUTRICIONAIS
-- ===============================
INSERT INTO nutrition_plans (id, athlete_id, nutritionist_id, name, description, daily_calories, protein_grams, carbs_grams, fat_grams, start_date, end_date, status) VALUES
(1, 1, 2, 'Plano de Performance - João', 'Dieta balanceada para atleta de alta performance', 3200, 180, 400, 90, '2024-01-01', '2024-06-30', 'active'),
(2, 2, 2, 'Plano Competição - Maria', 'Dieta para período competitivo de natação', 2400, 120, 300, 70, '2024-01-15', '2024-04-30', 'active'),
(3, 3, 2, 'Plano Hipertrofia - Pedro', 'Dieta hipercalórica para ganho de massa', 3800, 220, 450, 110, '2024-01-01', '2024-05-31', 'active');

-- Refeições do plano do João
INSERT INTO meals (plan_id, name, time, description, order_index) VALUES
(1, 'Café da Manhã', '07:00:00', 'Ovos mexidos (4), pão integral (2), banana, suco de laranja', 1),
(1, 'Lanche da Manhã', '10:00:00', 'Whey protein com aveia e frutas vermelhas', 2),
(1, 'Almoço', '13:00:00', 'Arroz integral, frango grelhado (200g), legumes, salada verde', 3),
(1, 'Lanche da Tarde', '16:00:00', 'Sanduíche natural de atum, maçã', 4),
(1, 'Jantar', '20:00:00', 'Batata doce, carne vermelha magra (150g), brócolis', 5),
(1, 'Ceia', '22:00:00', 'Caseína, pasta de amendoim', 6);

-- ===============================
-- REGISTROS MÉDICOS
-- ===============================
INSERT INTO medical_records (athlete_id, doctor_id, record_date, type, title, description, diagnosis, treatment, attachments) VALUES
(1, 1, '2024-01-08', 'consultation', 'Avaliação mensal', 'Paciente apresenta boa evolução. Manter protocolo atual.', 'Atleta saudável', 'Manter acompanhamento mensal', '[]'),
(1, 1, '2024-01-02', 'exam', 'Hemograma completo', 'Resultados dentro da normalidade. Todos os marcadores adequados.', 'Normal', NULL, '[{"name": "Hemograma_02-01-2024.pdf", "url": "/uploads/hemograma.pdf", "type": "pdf"}]'),
(1, 1, '2023-12-15', 'evaluation', 'Check-up inicial', 'Avaliação inicial do atleta. Liberado para atividades físicas intensas.', 'Apto para treinos de alta intensidade', 'Iniciar programa de treinamento', '[]'),
(2, 1, '2024-01-05', 'consultation', 'Consulta de acompanhamento', 'Nadadora em excelente condição física.', 'Atleta saudável', 'Manter rotina', '[]'),
(3, 1, '2024-01-03', 'exam', 'Avaliação cardiológica', 'ECG normal, liberado para treinos intensos.', 'Normal', NULL, '[]');

-- ===============================
-- SESSÕES DE REABILITAÇÃO
-- ===============================
INSERT INTO rehab_sessions (athlete_id, physio_id, session_date, injury_description, treatment, exercises, progress_notes, next_session, status) VALUES
(1, 1, DATE_ADD(NOW(), INTERVAL -5 DAY), 'Tendinite patelar leve', 'Alongamentos, mobilização articular, crioterapia', 'Mobilização patelar, Alongamento de isquiotibiais, Fortalecimento de glúteo', 'Primeira sessão. Dor inicial 6/10.', DATE_ADD(NOW(), INTERVAL 2 DAY), 'completed'),
(1, 1, DATE_ADD(NOW(), INTERVAL 2 DAY), 'Tendinite patelar leve', 'Exercícios de fortalecimento, crioterapia', 'Extensão de joelho isométrica, Agachamento parcial, Alongamento quadríceps', 'Paciente apresenta melhora de 40% na dor. Dor atual 4/10.', DATE_ADD(NOW(), INTERVAL 7 DAY), 'scheduled');

-- ===============================
-- PROGRESSO DOS ATLETAS
-- ===============================
INSERT INTO athlete_progress (athlete_id, record_date, weight, body_fat_percentage, muscle_mass, notes) VALUES
(1, '2024-01-08', 75.5, 12.5, 65.2, 'Excelente evolução. Mantendo consistência.'),
(1, '2024-01-01', 76.0, 13.0, 64.8, 'Início do mês. Foco em definição.'),
(1, '2023-12-15', 77.2, 14.2, 64.0, 'Retorno das férias. Ajustar alimentação.'),
(1, '2023-12-01', 78.5, 15.0, 63.5, 'Início do programa de preparação.'),
(2, '2024-01-08', 57.8, 18.0, 45.2, 'Peso ideal para competição.'),
(2, '2024-01-01', 58.2, 18.5, 45.0, 'Ajustando composição corporal.'),
(3, '2024-01-08', 93.0, 14.0, 78.5, 'Ganho de 1kg de massa magra.'),
(3, '2024-01-01', 92.0, 14.5, 77.5, 'Progresso consistente.');

-- ===============================
-- MENSAGENS
-- ===============================
INSERT INTO messages (sender_id, receiver_id, subject, content, is_read, created_at) VALUES
(1, 4, 'Resultado dos exames', 'João, seus exames estão todos normais. Parabéns pela dedicação! Continue assim.', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 4, 'Ajuste na dieta', 'Olá João! Fiz alguns ajustes no seu plano alimentar. Confira na seção de nutrição.', FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 4, 'Treino de amanhã', 'João, amanhã teremos treino focado em membros inferiores. Lembre de descansar bem hoje!', TRUE, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 1, 'Dúvida sobre medicamento', 'Dr. Ricardo, posso tomar anti-inflamatório antes do treino?', TRUE, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, 5, 'Próxima consulta', 'Maria, sua próxima consulta está agendada para a semana que vem.', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ===============================
-- BIBLIOTECA DE ALIMENTOS (Global)
-- ===============================
INSERT INTO food_library (consultancy_id, name, category, serving_size, calories, protein, carbs, fat, fiber, is_global) VALUES
-- PROTEÍNAS
(NULL, 'Frango grelhado', 'proteina', '100g', 165, 31, 0, 3.6, 0, TRUE),
(NULL, 'Peito de peru', 'proteina', '100g', 104, 17, 4, 2, 0, TRUE),
(NULL, 'Carne bovina magra', 'proteina', '100g', 250, 26, 0, 15, 0, TRUE),
(NULL, 'Patinho moído', 'proteina', '100g', 137, 21, 0, 5, 0, TRUE),
(NULL, 'Salmão', 'proteina', '100g', 208, 20, 0, 13, 0, TRUE),
(NULL, 'Tilápia', 'proteina', '100g', 96, 20, 0, 1.7, 0, TRUE),
(NULL, 'Atum em água', 'proteina', '100g', 116, 26, 0, 1, 0, TRUE),
(NULL, 'Ovo inteiro', 'proteina', '1 unidade (50g)', 72, 6, 0.4, 5, 0, TRUE),
(NULL, 'Clara de ovo', 'proteina', '1 unidade (33g)', 17, 3.6, 0.2, 0, 0, TRUE),
(NULL, 'Tofu firme', 'proteina', '100g', 144, 17, 3, 9, 2, TRUE),
(NULL, 'Queijo cottage', 'proteina', '100g', 98, 11, 3, 4, 0, TRUE),
(NULL, 'Iogurte grego natural', 'proteina', '100g', 97, 9, 4, 5, 0, TRUE),

-- CARBOIDRATOS
(NULL, 'Arroz integral', 'carboidrato', '100g cozido', 111, 2.6, 23, 0.9, 1.8, TRUE),
(NULL, 'Arroz branco', 'carboidrato', '100g cozido', 130, 2.7, 28, 0.3, 0.4, TRUE),
(NULL, 'Batata doce', 'carboidrato', '100g cozida', 86, 1.6, 20, 0.1, 3, TRUE),
(NULL, 'Batata inglesa', 'carboidrato', '100g cozida', 77, 2, 17, 0.1, 1.4, TRUE),
(NULL, 'Mandioca cozida', 'carboidrato', '100g', 125, 1.2, 30, 0.2, 1.5, TRUE),
(NULL, 'Macarrão integral', 'carboidrato', '100g cozido', 124, 5, 25, 1, 4, TRUE),
(NULL, 'Pão integral', 'carboidrato', '1 fatia (30g)', 69, 3.5, 12, 1, 2, TRUE),
(NULL, 'Aveia em flocos', 'carboidrato', '30g', 117, 4.5, 20, 2.5, 3, TRUE),
(NULL, 'Quinoa cozida', 'carboidrato', '100g', 120, 4.4, 21, 1.9, 2.8, TRUE),
(NULL, 'Feijão preto cozido', 'carboidrato', '100g', 77, 4.5, 14, 0.5, 8.7, TRUE),
(NULL, 'Grão-de-bico cozido', 'carboidrato', '100g', 164, 9, 27, 2.6, 8, TRUE),
(NULL, 'Lentilha cozida', 'carboidrato', '100g', 116, 9, 20, 0.4, 8, TRUE),

-- GORDURAS
(NULL, 'Azeite de oliva', 'gordura', '1 colher (13ml)', 119, 0, 0, 13.5, 0, TRUE),
(NULL, 'Óleo de coco', 'gordura', '1 colher (13ml)', 117, 0, 0, 13.5, 0, TRUE),
(NULL, 'Abacate', 'gordura', '100g', 160, 2, 9, 15, 7, TRUE),
(NULL, 'Castanha de caju', 'gordura', '30g', 157, 5, 9, 12, 1, TRUE),
(NULL, 'Castanha-do-pará', 'gordura', '3 unidades (15g)', 99, 2, 2, 10, 1, TRUE),
(NULL, 'Amêndoas', 'gordura', '30g', 173, 6, 6, 15, 4, TRUE),
(NULL, 'Nozes', 'gordura', '30g', 196, 5, 4, 20, 2, TRUE),
(NULL, 'Pasta de amendoim', 'gordura', '1 colher (20g)', 118, 5, 4, 10, 2, TRUE),
(NULL, 'Semente de chia', 'gordura', '15g', 73, 2.5, 6, 5, 5, TRUE),
(NULL, 'Linhaça', 'gordura', '15g', 80, 3, 4, 6, 4, TRUE),

-- VEGETAIS
(NULL, 'Brócolis cozido', 'vegetal', '100g', 35, 2.4, 7, 0.4, 3.3, TRUE),
(NULL, 'Espinafre cru', 'vegetal', '100g', 23, 2.9, 3.6, 0.4, 2.2, TRUE),
(NULL, 'Couve refogada', 'vegetal', '100g', 90, 3, 8, 6, 4, TRUE),
(NULL, 'Alface', 'vegetal', '100g', 15, 1.4, 2.9, 0.2, 1.3, TRUE),
(NULL, 'Tomate', 'vegetal', '100g', 18, 0.9, 3.9, 0.2, 1.2, TRUE),
(NULL, 'Pepino', 'vegetal', '100g', 15, 0.7, 3.6, 0.1, 0.5, TRUE),
(NULL, 'Cenoura crua', 'vegetal', '100g', 41, 0.9, 10, 0.2, 2.8, TRUE),
(NULL, 'Abobrinha', 'vegetal', '100g', 17, 1.2, 3.1, 0.3, 1, TRUE),
(NULL, 'Berinjela', 'vegetal', '100g', 25, 1, 6, 0.2, 3, TRUE),
(NULL, 'Pimentão', 'vegetal', '100g', 26, 1, 6, 0.2, 2.1, TRUE),

-- FRUTAS
(NULL, 'Banana', 'fruta', '1 unidade (100g)', 89, 1.1, 23, 0.3, 2.6, TRUE),
(NULL, 'Maçã', 'fruta', '1 unidade (150g)', 78, 0.4, 21, 0.2, 3.6, TRUE),
(NULL, 'Laranja', 'fruta', '1 unidade (180g)', 85, 1.7, 21, 0.2, 4.4, TRUE),
(NULL, 'Morango', 'fruta', '100g', 32, 0.7, 8, 0.3, 2, TRUE),
(NULL, 'Mamão papaya', 'fruta', '100g', 43, 0.5, 11, 0.3, 1.7, TRUE),
(NULL, 'Manga', 'fruta', '100g', 60, 0.8, 15, 0.4, 1.6, TRUE),
(NULL, 'Melancia', 'fruta', '100g', 30, 0.6, 8, 0.2, 0.4, TRUE),
(NULL, 'Uva', 'fruta', '100g', 69, 0.7, 18, 0.2, 0.9, TRUE),
(NULL, 'Abacaxi', 'fruta', '100g', 50, 0.5, 13, 0.1, 1.4, TRUE),
(NULL, 'Kiwi', 'fruta', '1 unidade (80g)', 49, 0.9, 12, 0.4, 2.4, TRUE),

-- LATICÍNIOS
(NULL, 'Leite desnatado', 'lacteo', '200ml', 70, 7, 10, 0.2, 0, TRUE),
(NULL, 'Leite integral', 'lacteo', '200ml', 122, 6.4, 9.4, 6.6, 0, TRUE),
(NULL, 'Queijo minas frescal', 'lacteo', '30g', 73, 5, 1, 6, 0, TRUE),
(NULL, 'Ricota', 'lacteo', '50g', 87, 6, 2, 6, 0, TRUE),
(NULL, 'Requeijão light', 'lacteo', '30g', 42, 3, 2, 3, 0, TRUE),

-- SUPLEMENTOS
(NULL, 'Whey Protein', 'suplemento', '1 scoop (30g)', 120, 24, 3, 1, 0, TRUE),
(NULL, 'Caseína', 'suplemento', '1 scoop (30g)', 110, 24, 2, 0.5, 0, TRUE),
(NULL, 'Albumina', 'suplemento', '30g', 117, 25, 1.5, 0.5, 0, TRUE),
(NULL, 'Maltodextrina', 'suplemento', '30g', 114, 0, 28, 0, 0, TRUE),
(NULL, 'Creatina', 'suplemento', '5g', 0, 0, 0, 0, 0, TRUE),
(NULL, 'BCAA', 'suplemento', '5g', 20, 5, 0, 0, 0, TRUE),

-- BEBIDAS
(NULL, 'Água de coco', 'bebida', '200ml', 46, 0.4, 10, 0.2, 0, TRUE),
(NULL, 'Suco de laranja natural', 'bebida', '200ml', 88, 1.4, 21, 0.4, 0.4, TRUE),
(NULL, 'Café sem açúcar', 'bebida', '100ml', 2, 0.1, 0, 0, 0, TRUE),
(NULL, 'Chá verde', 'bebida', '200ml', 2, 0, 0, 0, 0, TRUE);

-- ===============================
-- ALIMENTOS NAS REFEIÇÕES (meal_foods)
-- ===============================
-- Café da Manhã do João (meal_id = 1)
INSERT INTO meal_foods (meal_id, food_id, name, quantity, unit, calories, protein, carbs, fat, order_index) VALUES
(1, NULL, 'Ovos mexidos', 4, 'unidades', 288, 24, 1.6, 20, 1),
(1, NULL, 'Pão integral', 2, 'fatias', 138, 7, 24, 2, 2),
(1, NULL, 'Banana', 1, 'unidade', 89, 1.1, 23, 0.3, 3),
(1, NULL, 'Suco de laranja natural', 200, 'ml', 88, 1.4, 21, 0.4, 4);

-- Lanche da Manhã do João (meal_id = 2)
INSERT INTO meal_foods (meal_id, food_id, name, quantity, unit, calories, protein, carbs, fat, order_index) VALUES
(2, NULL, 'Whey Protein', 1, 'scoop', 120, 24, 3, 1, 1),
(2, NULL, 'Aveia em flocos', 30, 'g', 117, 4.5, 20, 2.5, 2),
(2, NULL, 'Morango', 100, 'g', 32, 0.7, 8, 0.3, 3);

-- Almoço do João (meal_id = 3)
INSERT INTO meal_foods (meal_id, food_id, name, quantity, unit, calories, protein, carbs, fat, order_index) VALUES
(3, NULL, 'Arroz integral', 150, 'g', 166, 3.9, 34.5, 1.4, 1),
(3, NULL, 'Frango grelhado', 200, 'g', 330, 62, 0, 7.2, 2),
(3, NULL, 'Brócolis cozido', 100, 'g', 35, 2.4, 7, 0.4, 3),
(3, NULL, 'Salada verde', 1, 'porção', 30, 2, 5, 0.5, 4),
(3, NULL, 'Azeite de oliva', 1, 'colher', 119, 0, 0, 13.5, 5);

-- ===============================
-- SUBSTITUIÇÕES DE ALIMENTOS
-- ===============================
-- Substituições para o Frango grelhado (meal_food_id = 6 - almoço)
INSERT INTO food_substitutions (meal_food_id, name, quantity, unit, calories, protein, carbs, fat, order_index) VALUES
(6, 'Patinho moído', 200, 'g', 274, 42, 0, 10, 1),
(6, 'Tilápia grelhada', 200, 'g', 192, 40, 0, 3.4, 2),
(6, 'Peito de peru', 200, 'g', 208, 34, 8, 4, 3);

-- Substituições para o Arroz integral (meal_food_id = 5 - almoço)
INSERT INTO food_substitutions (meal_food_id, name, quantity, unit, calories, protein, carbs, fat, order_index) VALUES
(5, 'Batata doce', 200, 'g', 172, 3.2, 40, 0.2, 1),
(5, 'Quinoa cozida', 150, 'g', 180, 6.6, 31.5, 2.9, 2),
(5, 'Macarrão integral', 150, 'g', 186, 7.5, 37.5, 1.5, 3);
