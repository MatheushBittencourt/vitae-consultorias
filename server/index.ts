import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { createPool, RowDataPacket } from 'mysql2/promise'
import { MercadoPagoConfig, PreApproval, Payment } from 'mercadopago'
import { createNutritionAdvancedRoutes } from './routes/nutrition-advanced'
import { createRecipeRoutes } from './routes/recipes'

// ===========================================
// CONFIGURAÇÃO DO AMBIENTE
// ===========================================
const NODE_ENV = process.env.NODE_ENV || 'development'
const PORT = process.env.PORT || 3001
const IS_PRODUCTION = NODE_ENV === 'production'

console.log(`
╔════════════════════════════════════════════╗
║           VITAE - Backend Server           ║
╠════════════════════════════════════════════╣
║  Ambiente: ${NODE_ENV.padEnd(30)}║
║  Porta: ${String(PORT).padEnd(33)}║
╚════════════════════════════════════════════╝
`)

// ===========================================
// CONFIGURAÇÃO DO BANCO DE DADOS
// ===========================================
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'app_user',
  password: process.env.MYSQL_PASSWORD || 'app_password',
  database: process.env.MYSQL_DATABASE || 'vitae_db',
  waitForConnections: true,
  connectionLimit: IS_PRODUCTION ? 20 : 10,
  queueLimit: 0,
  charset: 'utf8mb4',
}

console.log(`📦 Database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`)

const pool = createPool(dbConfig)

// ===========================================
// SEED AUTOMÁTICO - BIBLIOTECA GLOBAL
// ===========================================
async function seedGlobalLibraries() {
  try {
    // Verificar se existem exercícios globais
    const [existingExercises] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM exercise_library WHERE is_global = TRUE OR consultancy_id IS NULL'
    )
    
    if (existingExercises[0].count === 0) {
      console.log('📚 Inserindo biblioteca de exercícios global...')
      
      const globalExercises = [
        // PEITO
        [null, 'Supino Reto com Barra', 'Exercício fundamental para desenvolvimento do peitoral', 'peito', 'triceps, ombros', 'barra', 'intermediario', 'https://www.youtube.com/watch?v=rT7DgCr-3pg', null, 'Deite no banco, pés no chão. Segure a barra com pegada um pouco mais larga que os ombros. Desça controladamente até o peito e empurre.', 'Mantenha as escápulas retraídas e o peito estufado. Não deixe os cotovelos abrirem demais.', true],
        [null, 'Supino Inclinado com Halteres', 'Foco na parte superior do peitoral', 'peito', 'ombros, triceps', 'halteres', 'intermediario', 'https://www.youtube.com/watch?v=8iPEnn-ltC8', null, 'Banco inclinado a 30-45°. Halteres na altura do peito, cotovelos em 45°. Empurre para cima e junte no topo.', 'Inclinação maior = mais ombro. Mantenha entre 30-45° para focar no peitoral superior.', true],
        [null, 'Crucifixo na Polia', 'Isolamento para peitoral com tensão constante', 'peito', null, 'cabo', 'iniciante', null, null, 'Polias na posição alta. Pegue os cabos, dê um passo à frente. Braços abertos, leve flexão no cotovelo. Junte as mãos à frente do peito.', 'Squeeze no final do movimento. Mantenha o core ativado para não balançar.', true],
        [null, 'Flexão de Braço', 'Exercício fundamental com peso corporal', 'peito', 'triceps, ombros, core', 'peso_corporal', 'iniciante', null, null, 'Mãos no chão, um pouco mais largas que os ombros. Corpo reto da cabeça aos pés. Desça até o peito quase tocar o chão.', 'Não deixe o quadril subir ou descer. Ative o core durante todo o movimento.', true],
        // COSTAS
        [null, 'Barra Fixa (Pull-up)', 'Exercício composto para costas e bíceps', 'costas', 'biceps, antebraco', 'peso_corporal', 'avancado', 'https://www.youtube.com/watch?v=eGo4IYlbE5g', null, 'Pegada pronada, mãos um pouco mais largas que os ombros. Puxe o corpo até o queixo passar a barra. Desça controladamente.', 'Inicie o movimento retraindo as escápulas. Evite balanço do corpo.', true],
        [null, 'Remada Curvada com Barra', 'Desenvolvimento da espessura das costas', 'costas', 'biceps, posterior', 'barra', 'intermediario', 'https://www.youtube.com/watch?v=kBWAon7ItDw', null, 'Pés na largura dos ombros, joelhos levemente flexionados. Incline o tronco a 45°. Puxe a barra em direção ao umbigo.', 'Mantenha as costas retas. Contraia as escápulas no topo do movimento.', true],
        [null, 'Puxada Frontal', 'Desenvolvimento da largura das costas', 'costas', 'biceps', 'maquina', 'iniciante', null, null, 'Sente-se no equipamento, joelhos sob as almofadas. Pegada pronada um pouco mais larga que os ombros. Puxe a barra até o peito.', 'Incline levemente o tronco para trás. Foque em puxar com os cotovelos, não com as mãos.', true],
        [null, 'Remada Unilateral com Halter', 'Trabalho unilateral para costas', 'costas', 'biceps, core', 'halteres', 'iniciante', null, null, 'Apoie joelho e mão no banco. Outra perna no chão para estabilidade. Puxe o halter em direção ao quadril.', 'Mantenha o tronco paralelo ao chão. Não gire o corpo ao puxar.', true],
        // OMBROS
        [null, 'Desenvolvimento com Halteres', 'Exercício principal para deltoides', 'ombros', 'triceps', 'halteres', 'intermediario', null, null, 'Sentado ou em pé, halteres na altura dos ombros. Empurre para cima até os braços estendidos. Desça controladamente.', 'Não use impulso das pernas. Mantenha o core ativado para proteger a lombar.', true],
        [null, 'Elevação Lateral', 'Isolamento para deltoides médio', 'ombros', null, 'halteres', 'iniciante', null, null, 'Em pé, halteres ao lado do corpo. Eleve os braços até a altura dos ombros, cotovelos levemente flexionados.', 'Não eleve acima da linha dos ombros. Controle a descida, sem balançar.', true],
        [null, 'Elevação Frontal', 'Foco no deltoides anterior', 'ombros', null, 'halteres', 'iniciante', null, null, 'Em pé, halteres à frente das coxas. Eleve um braço de cada vez ou alternadamente até a altura dos ombros.', 'Palmas para baixo. Não balance o corpo para ajudar no movimento.', true],
        [null, 'Face Pull', 'Deltoides posterior e rotadores externos', 'ombros', 'costas', 'cabo', 'iniciante', null, null, 'Polia na altura do rosto. Corda como pegada. Puxe em direção ao rosto, abrindo os cotovelos para os lados.', 'Excelente para saúde do ombro. Faça como aquecimento ou no final do treino.', true],
        // BÍCEPS
        [null, 'Rosca Direta com Barra', 'Exercício clássico para bíceps', 'biceps', 'antebraco', 'barra', 'iniciante', null, null, 'Em pé, barra com pegada supinada na largura dos ombros. Flexione os cotovelos, mantendo-os junto ao corpo.', 'Não balance o tronco. Controle a descida para maximizar o tempo sob tensão.', true],
        [null, 'Rosca Alternada com Halteres', 'Trabalho unilateral para bíceps', 'biceps', 'antebraco', 'halteres', 'iniciante', null, null, 'Em pé, halteres ao lado do corpo. Flexione um braço de cada vez, girando o pulso durante o movimento (supinação).', 'Mantenha o cotovelo fixo ao lado do corpo. Não use impulso.', true],
        [null, 'Rosca Martelo', 'Foco no braquial e braquiorradial', 'biceps', 'antebraco', 'halteres', 'iniciante', null, null, 'Em pé, halteres com pegada neutra (palmas uma de frente para outra). Flexione os cotovelos mantendo a pegada neutra.', 'Excelente para desenvolvimento do antebraço e largura do braço.', true],
        // TRÍCEPS
        [null, 'Tríceps Pulley', 'Isolamento para tríceps com cabo', 'triceps', null, 'cabo', 'iniciante', null, null, 'Polia alta, corda ou barra reta. Cotovelos junto ao corpo. Estenda os braços para baixo, apertando no final.', 'Mantenha os cotovelos fixos. Foque na contração do tríceps.', true],
        [null, 'Tríceps Francês', 'Extensão overhead para tríceps', 'triceps', null, 'halteres', 'intermediario', null, null, 'Sentado ou em pé, halter ou barra atrás da cabeça. Cotovelos apontando para cima. Estenda os braços.', 'Cuidado com a carga - proteja os cotovelos. Movimento controlado.', true],
        [null, 'Mergulho no Banco', 'Tríceps com peso corporal', 'triceps', 'peito, ombros', 'peso_corporal', 'iniciante', null, null, 'Mãos no banco atrás de você, pés no chão ou em outro banco. Flexione os cotovelos até 90° e empurre de volta.', 'Não desça demais para proteger os ombros. Mantenha o corpo próximo ao banco.', true],
        // QUADRÍCEPS
        [null, 'Agachamento Livre', 'Rei dos exercícios para pernas', 'quadriceps', 'gluteos, posterior', 'barra', 'avancado', 'https://www.youtube.com/watch?v=ultWZbUMPL8', null, 'Barra nas costas (high bar ou low bar). Pés na largura dos ombros. Desça até as coxas ficarem paralelas ou mais.', 'Joelhos podem passar dos pés, desde que os calcanhares fiquem no chão. Core sempre ativado.', true],
        [null, 'Leg Press 45°', 'Exercício de força para pernas', 'quadriceps', 'gluteos', 'maquina', 'iniciante', null, null, 'Costas bem apoiadas no encosto. Pés na plataforma na largura dos ombros. Flexione os joelhos até 90° e empurre.', 'Não trave os joelhos no topo. Não tire o glúteo do banco na descida.', true],
        [null, 'Cadeira Extensora', 'Isolamento para quadríceps', 'quadriceps', null, 'maquina', 'iniciante', null, null, 'Sentado na máquina, tornozelos sob o rolo. Estenda as pernas até a extensão completa.', 'Movimento controlado. Segure a contração por 1 segundo no topo.', true],
        [null, 'Afundo (Lunge)', 'Exercício unilateral para pernas', 'quadriceps', 'gluteos', 'peso_corporal', 'iniciante', null, null, 'Dê um passo à frente, flexione ambos os joelhos até 90°. Joelho de trás quase toca o chão. Empurre de volta.', 'Tronco ereto. Joelho da frente não ultrapassa demais os dedos do pé.', true],
        // POSTERIOR
        [null, 'Stiff (Levantamento Terra Romeno)', 'Principal exercício para posteriores', 'posterior', 'gluteos, lombar', 'barra', 'intermediario', null, null, 'Em pé, barra à frente das coxas. Joelhos levemente flexionados. Incline o tronco mantendo as costas retas.', 'Sinta o alongamento nos posteriores. Não arredonde a lombar.', true],
        [null, 'Mesa Flexora', 'Isolamento para posteriores', 'posterior', null, 'maquina', 'iniciante', null, null, 'Deitado na máquina, tornozelos sob o rolo. Flexione os joelhos trazendo os calcanhares em direção ao glúteo.', 'Não levante o quadril do apoio. Controle a volta.', true],
        [null, 'Cadeira Flexora', 'Variação sentado para posteriores', 'posterior', null, 'maquina', 'iniciante', null, null, 'Sentado na máquina, pernas sobre o rolo. Flexione os joelhos empurrando o rolo para baixo.', 'Mantenha as costas apoiadas. Movimento controlado.', true],
        // GLÚTEOS
        [null, 'Hip Thrust', 'Melhor exercício para glúteos', 'gluteos', 'posterior', 'barra', 'intermediario', null, null, 'Costas apoiadas no banco, pés no chão. Barra sobre o quadril. Eleve o quadril até extensão completa.', 'Squeeze máximo no topo. Queixo no peito durante o movimento.', true],
        [null, 'Elevação Pélvica', 'Versão no chão do hip thrust', 'gluteos', 'posterior', 'peso_corporal', 'iniciante', null, null, 'Deitado no chão, joelhos flexionados, pés no chão. Eleve o quadril apertando os glúteos.', 'Excelente para iniciantes ou como aquecimento. Segure a contração no topo.', true],
        // PANTURRILHA
        [null, 'Panturrilha em Pé', 'Foco no gastrocnêmio', 'panturrilha', null, 'maquina', 'iniciante', null, null, 'Em pé na máquina, ombros sob as almofadas. Eleve os calcanhares o máximo possível.', 'Amplitude máxima - desça bem e suba completamente. Segure a contração no topo.', true],
        [null, 'Panturrilha Sentado', 'Foco no sóleo', 'panturrilha', null, 'maquina', 'iniciante', null, null, 'Sentado na máquina, joelhos sob as almofadas. Eleve os calcanhares.', 'Joelhos flexionados trabalham mais o sóleo. Complemente com panturrilha em pé.', true],
        // ABDOMEN
        [null, 'Prancha', 'Estabilização do core', 'abdomen', 'lombar, ombros', 'peso_corporal', 'iniciante', null, null, 'Apoie antebraços e pontas dos pés no chão. Corpo reto da cabeça aos pés. Mantenha a posição.', 'Não deixe o quadril subir ou descer. Respire normalmente.', true],
        [null, 'Abdominal Crunch', 'Exercício básico de abdomen', 'abdomen', null, 'peso_corporal', 'iniciante', null, null, 'Deitado, joelhos flexionados. Mãos atrás da cabeça. Eleve os ombros do chão contraindo o abdomen.', 'Não puxe a cabeça com as mãos. Foque na contração do abdomen.', true],
        [null, 'Elevação de Pernas', 'Foco no abdomen inferior', 'abdomen', null, 'peso_corporal', 'intermediario', null, null, 'Deitado ou pendurado na barra. Eleve as pernas mantendo-as estendidas ou com joelhos flexionados.', 'Controle a descida. Não use impulso.', true],
        // CARDIO
        [null, 'Corrida na Esteira', 'Cardio de baixo impacto', 'cardio', null, 'maquina', 'iniciante', null, null, 'Ajuste velocidade e inclinação conforme condicionamento. Mantenha postura ereta.', 'Varie entre corrida contínua e HIIT para melhores resultados.', true],
        [null, 'Bike Ergométrica', 'Cardio para pernas', 'cardio', 'quadriceps', 'maquina', 'iniciante', null, null, 'Ajuste altura do banco - perna quase estendida no ponto mais baixo. Mantenha cadência constante.', 'Excelente para recuperação ativa ou aquecimento.', true],
        [null, 'Burpee', 'Exercício de corpo inteiro de alta intensidade', 'corpo_todo', 'peito, quadriceps, cardio', 'peso_corporal', 'avancado', null, null, 'Da posição em pé, agache, coloque as mãos no chão, jogue os pés para trás em posição de flexão, faça uma flexão, traga os pés de volta e salte.', 'Excelente para HIIT. Modifique tirando a flexão ou o salto se necessário.', true],
      ]
      
      await pool.query(
        `INSERT INTO exercise_library 
         (consultancy_id, name, description, muscle_group, secondary_muscle, equipment, difficulty, video_url, image_url, instructions, tips, is_global)
         VALUES ?`,
        [globalExercises]
      )
      
      console.log(`✅ ${globalExercises.length} exercícios globais inseridos com sucesso!`)
    } else {
      console.log(`📚 Biblioteca de exercícios: ${existingExercises[0].count} exercícios globais encontrados`)
    }
    
    // Verificar se existem alimentos globais
    const [existingFoods] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM food_library WHERE is_global = TRUE OR consultancy_id IS NULL'
    )
    
    if (existingFoods[0].count === 0) {
      console.log('🍎 Inserindo biblioteca de alimentos global...')
      
      const globalFoods = [
        // PROTEÍNAS
        [null, 'Frango grelhado', null, 'proteina', '100g', 165, 31, 0, 3.6, 0, 0, null, true],
        [null, 'Peito de peru', null, 'proteina', '100g', 104, 17, 4, 2, 0, 0, null, true],
        [null, 'Carne bovina magra', null, 'proteina', '100g', 250, 26, 0, 15, 0, 0, null, true],
        [null, 'Patinho moído', null, 'proteina', '100g', 137, 21, 0, 5, 0, 0, null, true],
        [null, 'Salmão', null, 'proteina', '100g', 208, 20, 0, 13, 0, 0, null, true],
        [null, 'Tilápia', null, 'proteina', '100g', 96, 20, 0, 1.7, 0, 0, null, true],
        [null, 'Atum em água', null, 'proteina', '100g', 116, 26, 0, 1, 0, 0, null, true],
        [null, 'Ovo inteiro', null, 'proteina', '1 unidade (50g)', 72, 6, 0.4, 5, 0, 0, null, true],
        [null, 'Clara de ovo', null, 'proteina', '1 unidade (33g)', 17, 3.6, 0.2, 0, 0, 0, null, true],
        [null, 'Tofu firme', null, 'proteina', '100g', 144, 17, 3, 9, 2, 0, null, true],
        [null, 'Queijo cottage', null, 'proteina', '100g', 98, 11, 3, 4, 0, 0, null, true],
        [null, 'Iogurte grego natural', null, 'proteina', '100g', 97, 9, 4, 5, 0, 0, null, true],
        // CARBOIDRATOS
        [null, 'Arroz integral', null, 'carboidrato', '100g cozido', 111, 2.6, 23, 0.9, 1.8, 0, null, true],
        [null, 'Arroz branco', null, 'carboidrato', '100g cozido', 130, 2.7, 28, 0.3, 0.4, 0, null, true],
        [null, 'Batata doce', null, 'carboidrato', '100g cozida', 86, 1.6, 20, 0.1, 3, 0, null, true],
        [null, 'Batata inglesa', null, 'carboidrato', '100g cozida', 77, 2, 17, 0.1, 1.4, 0, null, true],
        [null, 'Mandioca cozida', null, 'carboidrato', '100g', 125, 1.2, 30, 0.2, 1.5, 0, null, true],
        [null, 'Macarrão integral', null, 'carboidrato', '100g cozido', 124, 5, 25, 1, 4, 0, null, true],
        [null, 'Pão integral', null, 'carboidrato', '1 fatia (30g)', 69, 3.5, 12, 1, 2, 0, null, true],
        [null, 'Aveia em flocos', null, 'carboidrato', '30g', 117, 4.5, 20, 2.5, 3, 0, null, true],
        [null, 'Quinoa cozida', null, 'carboidrato', '100g', 120, 4.4, 21, 1.9, 2.8, 0, null, true],
        [null, 'Feijão preto cozido', null, 'carboidrato', '100g', 77, 4.5, 14, 0.5, 8.7, 0, null, true],
        [null, 'Grão-de-bico cozido', null, 'carboidrato', '100g', 164, 9, 27, 2.6, 8, 0, null, true],
        [null, 'Lentilha cozida', null, 'carboidrato', '100g', 116, 9, 20, 0.4, 8, 0, null, true],
        // GORDURAS
        [null, 'Azeite de oliva', null, 'gordura', '1 colher (13ml)', 119, 0, 0, 13.5, 0, 0, null, true],
        [null, 'Óleo de coco', null, 'gordura', '1 colher (13ml)', 117, 0, 0, 13.5, 0, 0, null, true],
        [null, 'Abacate', null, 'gordura', '100g', 160, 2, 9, 15, 7, 0, null, true],
        [null, 'Castanha de caju', null, 'gordura', '30g', 157, 5, 9, 12, 1, 0, null, true],
        [null, 'Castanha-do-pará', null, 'gordura', '3 unidades (15g)', 99, 2, 2, 10, 1, 0, null, true],
        [null, 'Amêndoas', null, 'gordura', '30g', 173, 6, 6, 15, 4, 0, null, true],
        [null, 'Nozes', null, 'gordura', '30g', 196, 5, 4, 20, 2, 0, null, true],
        [null, 'Pasta de amendoim', null, 'gordura', '1 colher (20g)', 118, 5, 4, 10, 2, 0, null, true],
        [null, 'Semente de chia', null, 'gordura', '15g', 73, 2.5, 6, 5, 5, 0, null, true],
        [null, 'Linhaça', null, 'gordura', '15g', 80, 3, 4, 6, 4, 0, null, true],
        // VEGETAIS
        [null, 'Brócolis cozido', null, 'vegetal', '100g', 35, 2.4, 7, 0.4, 3.3, 0, null, true],
        [null, 'Espinafre cru', null, 'vegetal', '100g', 23, 2.9, 3.6, 0.4, 2.2, 0, null, true],
        [null, 'Couve refogada', null, 'vegetal', '100g', 90, 3, 8, 6, 4, 0, null, true],
        [null, 'Alface', null, 'vegetal', '100g', 15, 1.4, 2.9, 0.2, 1.3, 0, null, true],
        [null, 'Tomate', null, 'vegetal', '100g', 18, 0.9, 3.9, 0.2, 1.2, 0, null, true],
        [null, 'Pepino', null, 'vegetal', '100g', 15, 0.7, 3.6, 0.1, 0.5, 0, null, true],
        [null, 'Cenoura crua', null, 'vegetal', '100g', 41, 0.9, 10, 0.2, 2.8, 0, null, true],
        [null, 'Abobrinha', null, 'vegetal', '100g', 17, 1.2, 3.1, 0.3, 1, 0, null, true],
        [null, 'Berinjela', null, 'vegetal', '100g', 25, 1, 6, 0.2, 3, 0, null, true],
        [null, 'Pimentão', null, 'vegetal', '100g', 26, 1, 6, 0.2, 2.1, 0, null, true],
        // FRUTAS
        [null, 'Banana', null, 'fruta', '1 unidade (100g)', 89, 1.1, 23, 0.3, 2.6, 0, null, true],
        [null, 'Maçã', null, 'fruta', '1 unidade (150g)', 78, 0.4, 21, 0.2, 3.6, 0, null, true],
        [null, 'Laranja', null, 'fruta', '1 unidade (180g)', 85, 1.7, 21, 0.2, 4.4, 0, null, true],
        [null, 'Morango', null, 'fruta', '100g', 32, 0.7, 8, 0.3, 2, 0, null, true],
        [null, 'Mamão papaya', null, 'fruta', '100g', 43, 0.5, 11, 0.3, 1.7, 0, null, true],
        [null, 'Manga', null, 'fruta', '100g', 60, 0.8, 15, 0.4, 1.6, 0, null, true],
        [null, 'Melancia', null, 'fruta', '100g', 30, 0.6, 8, 0.2, 0.4, 0, null, true],
        [null, 'Uva', null, 'fruta', '100g', 69, 0.7, 18, 0.2, 0.9, 0, null, true],
        [null, 'Abacaxi', null, 'fruta', '100g', 50, 0.5, 13, 0.1, 1.4, 0, null, true],
        [null, 'Kiwi', null, 'fruta', '1 unidade (80g)', 49, 0.9, 12, 0.4, 2.4, 0, null, true],
        // LATICÍNIOS
        [null, 'Leite desnatado', null, 'lacteo', '200ml', 70, 7, 10, 0.2, 0, 0, null, true],
        [null, 'Leite integral', null, 'lacteo', '200ml', 122, 6.4, 9.4, 6.6, 0, 0, null, true],
        [null, 'Queijo minas frescal', null, 'lacteo', '30g', 73, 5, 1, 6, 0, 0, null, true],
        [null, 'Ricota', null, 'lacteo', '50g', 87, 6, 2, 6, 0, 0, null, true],
        [null, 'Requeijão light', null, 'lacteo', '30g', 42, 3, 2, 3, 0, 0, null, true],
        // SUPLEMENTOS
        [null, 'Whey Protein', null, 'suplemento', '1 scoop (30g)', 120, 24, 3, 1, 0, 0, null, true],
        [null, 'Caseína', null, 'suplemento', '1 scoop (30g)', 110, 24, 2, 0.5, 0, 0, null, true],
        [null, 'Albumina', null, 'suplemento', '30g', 117, 25, 1.5, 0.5, 0, 0, null, true],
        [null, 'Maltodextrina', null, 'suplemento', '30g', 114, 0, 28, 0, 0, 0, null, true],
        [null, 'Creatina', null, 'suplemento', '5g', 0, 0, 0, 0, 0, 0, null, true],
        [null, 'BCAA', null, 'suplemento', '5g', 20, 5, 0, 0, 0, 0, null, true],
        // BEBIDAS
        [null, 'Água de coco', null, 'bebida', '200ml', 46, 0.4, 10, 0.2, 0, 0, null, true],
        [null, 'Suco de laranja natural', null, 'bebida', '200ml', 88, 1.4, 21, 0.4, 0.4, 0, null, true],
        [null, 'Café sem açúcar', null, 'bebida', '100ml', 2, 0.1, 0, 0, 0, 0, null, true],
        [null, 'Chá verde', null, 'bebida', '200ml', 2, 0, 0, 0, 0, 0, null, true],
      ]
      
      await pool.query(
        `INSERT INTO food_library 
         (consultancy_id, name, description, category, serving_size, calories, protein, carbs, fat, fiber, sodium, image_url, is_global)
         VALUES ?`,
        [globalFoods]
      )
      
      console.log(`✅ ${globalFoods.length} alimentos globais inseridos com sucesso!`)
    } else {
      console.log(`🍎 Biblioteca de alimentos: ${existingFoods[0].count} alimentos globais encontrados`)
    }
    
  } catch (error) {
    console.error('❌ Erro ao inicializar bibliotecas globais:', error)
  }
}

// ===========================================
// CONFIGURAÇÃO DO MERCADO PAGO
// ===========================================
const mercadoPagoAccessToken = process.env.MP_ACCESS_TOKEN || ''
const mercadoPagoWebhookSecret = process.env.MP_WEBHOOK_SECRET || ''
const SKIP_PAYMENT = process.env.SKIP_PAYMENT === 'true' || (!IS_PRODUCTION && !mercadoPagoAccessToken)

if (SKIP_PAYMENT) {
  console.log('⚠️  Mercado Pago: SKIP_PAYMENT ativo (pagamentos não serão processados)')
} else if (mercadoPagoAccessToken) {
  console.log('💳 Mercado Pago: Configurado e ativo')
} else {
  console.log('⚠️  Mercado Pago: Access Token não configurado')
}

const mercadoPagoClient = new MercadoPagoConfig({ 
  accessToken: mercadoPagoAccessToken || 'placeholder',
  options: { timeout: 10000 }
})

// ===========================================
// MIDDLEWARE
// ===========================================
const app = express()

// Trust proxy - necessário quando atrás de Nginx/reverse proxy
app.set('trust proxy', 1)

// Helmet - Headers de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: IS_PRODUCTION ? undefined : false,
}))

// Rate Limiting - Proteção contra brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: IS_PRODUCTION ? 10 : 100, // 10 tentativas em prod, 100 em dev
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: IS_PRODUCTION ? 100 : 1000, // 100 req/min em prod
  message: { error: 'Muitas requisições. Tente novamente em breve.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// CORS configurado para permitir frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
  origin: IS_PRODUCTION ? process.env.FRONTEND_URL : allowedOrigins,
  credentials: true
}))

app.use(express.json({ limit: '10mb' })) // Limite de payload

// Rate limit global para API
app.use('/api/', apiLimiter)

// ===========================================
// FUNÇÕES DE VALIDAÇÃO E SANITIZAÇÃO
// ===========================================

// Validar formato de email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validar senha forte (mínimo 6 caracteres)
const isValidPassword = (password: string): boolean => {
  return password && password.length >= 6
}

// Sanitizar string para prevenir XSS
const sanitizeString = (str: string): string => {
  if (!str) return ''
  return str.replace(/[<>]/g, '').trim()
}

// Validar ID numérico
const isValidId = (id: unknown): id is number => {
  const num = Number(id)
  return !isNaN(num) && num > 0 && Number.isInteger(num)
}

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1')
    res.json({ status: 'ok', database: 'connected', result: rows })
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: String(error) })
  }
})

// ===============================
// SUPER ADMIN - Autenticação
// ===============================

// Rate limit específico para login
app.post('/api/superadmin/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    // Buscar usuário pelo email
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, email, name, password_hash FROM super_admins WHERE email = ?`,
      [email.toLowerCase()]
    )

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    const user = rows[0]
    
    // Verificar senha com bcrypt (ou comparação direta para senhas antigas)
    const isValidPassword = user.password_hash?.startsWith('$2') 
      ? await bcrypt.compare(password, user.password_hash)
      : password === user.password_hash // Fallback para senhas antigas não hasheadas
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: 'superadmin'
      }
    })
  } catch (error) {
    console.error('Super admin login error:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// Super Admin - Atualizar Perfil
app.put('/api/superadmin/:id/profile', async (req, res) => {
  try {
    const { id } = req.params
    const { name, email } = req.body

    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' })
    }

    // Verificar se email já existe para outro superadmin
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM super_admins WHERE email = ? AND id != ?',
      [email.toLowerCase(), id]
    )

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Este email já está em uso' })
    }

    await pool.query(
      'UPDATE super_admins SET name = ?, email = ? WHERE id = ?',
      [name, email.toLowerCase(), id]
    )

    res.json({ success: true, message: 'Perfil atualizado com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// Super Admin - Alterar Senha
app.put('/api/superadmin/:id/password', async (req, res) => {
  try {
    const { id } = req.params
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 8 caracteres' })
    }

    // Buscar usuário
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT password_hash FROM super_admins WHERE id = ?',
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const user = rows[0]

    // Verificar senha atual
    const isValidPassword = user.password_hash?.startsWith('$2')
      ? await bcrypt.compare(currentPassword, user.password_hash)
      : currentPassword === user.password_hash

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Senha atual incorreta' })
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await pool.query(
      'UPDATE super_admins SET password_hash = ? WHERE id = ?',
      [hashedPassword, id]
    )

    res.json({ success: true, message: 'Senha alterada com sucesso' })
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// ===============================
// SUPER ADMIN - Gerenciar Consultorias
// ===============================

app.get('/api/superadmin/consultancies', async (_req, res) => {
  try {
    const [consultancies] = await pool.query<RowDataPacket[]>(`
      SELECT c.*,
        (SELECT COUNT(*) FROM users u WHERE u.consultancy_id = c.id AND u.role != 'athlete') as professionals_count,
        (SELECT COUNT(*) FROM users u WHERE u.consultancy_id = c.id AND u.role = 'athlete') as patients_count
      FROM consultancies c
      ORDER BY c.created_at DESC
    `)
    res.json(consultancies)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.get('/api/superadmin/consultancies/:id', async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM consultancies WHERE id = ?`,
      [req.params.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Consultoria não encontrada' })
    }
    
    // Buscar profissionais e pacientes
    const [professionals] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, email, role, is_active FROM users WHERE consultancy_id = ? AND role != 'athlete'`,
      [req.params.id]
    )
    const [patients] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.name, u.email, u.is_active, a.sport, a.club
       FROM users u
       LEFT JOIN athletes a ON u.id = a.user_id
       WHERE u.consultancy_id = ? AND u.role = 'athlete'`,
      [req.params.id]
    )
    
    res.json({
      ...rows[0],
      professionals,
      patients
    })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.post('/api/superadmin/consultancies', async (req, res) => {
  try {
    const { 
      name, slug, email, phone, plan, price_monthly,
      has_training, has_nutrition, has_medical, has_rehab,
      max_professionals, max_patients, status, trial_ends_at
    } = req.body

    // Verificar se slug já existe
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM consultancies WHERE slug = ?',
      [slug]
    )
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Slug já existe' })
    }

    const [result] = await pool.query(
      `INSERT INTO consultancies 
       (name, slug, email, phone, plan, price_monthly, has_training, has_nutrition, has_medical, has_rehab, max_professionals, max_patients, status, trial_ends_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, email, phone, plan || 'trial', price_monthly || 0, 
       has_training ?? true, has_nutrition ?? true, has_medical ?? true, has_rehab ?? true,
       max_professionals || 5, max_patients || 50, status || 'trial', trial_ends_at]
    )
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Consultoria criada' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.put('/api/superadmin/consultancies/:id', async (req, res) => {
  try {
    const { 
      name, email, phone, plan, price_monthly,
      has_training, has_nutrition, has_medical, has_rehab,
      max_professionals, max_patients, status, trial_ends_at
    } = req.body

    await pool.query(
      `UPDATE consultancies SET
       name = ?, email = ?, phone = ?, plan = ?, price_monthly = ?,
       has_training = ?, has_nutrition = ?, has_medical = ?, has_rehab = ?,
       max_professionals = ?, max_patients = ?, status = ?, trial_ends_at = ?
       WHERE id = ?`,
      [name, email, phone, plan, price_monthly,
       has_training, has_nutrition, has_medical, has_rehab,
       max_professionals, max_patients, status, trial_ends_at, req.params.id]
    )
    res.json({ message: 'Consultoria atualizada' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.delete('/api/superadmin/consultancies/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM consultancies WHERE id = ?', [req.params.id])
    res.json({ message: 'Consultoria excluída' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Criar usuário para uma consultoria
app.post('/api/superadmin/consultancies/:id/users', async (req, res) => {
  try {
    const consultancyId = req.params.id
    const { email, password, name, role, phone } = req.body

    // Verificar se email já existe
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' })
    }

    // Hash da senha antes de salvar
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const [result] = await pool.query(
      `INSERT INTO users (consultancy_id, email, password_hash, name, role, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [consultancyId, email, hashedPassword, name, role, phone]
    )
    
    // Se for atleta, criar registro na tabela athletes
    if (role === 'athlete') {
      const userId = (result as { insertId: number }).insertId
      await pool.query(
        'INSERT INTO athletes (user_id) VALUES (?)',
        [userId]
      )
    }

    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Usuário criado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Deletar usuário de uma consultoria (usado pelo admin para remover pacientes)
app.delete('/api/superadmin/consultancies/:consultancyId/users/:userId', async (req, res) => {
  try {
    const { consultancyId, userId } = req.params
    
    // Verificar se o usuário pertence à consultoria
    const [user] = await pool.query<RowDataPacket[]>(
      'SELECT id, role FROM users WHERE id = ? AND consultancy_id = ?',
      [userId, consultancyId]
    )
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado nesta consultoria' })
    }
    
    // Se for atleta, deletar também o registro na tabela athletes
    if (user[0].role === 'athlete') {
      await pool.query('DELETE FROM athletes WHERE user_id = ?', [userId])
    }
    
    // Deletar o usuário
    await pool.query('DELETE FROM users WHERE id = ?', [userId])
    
    res.json({ message: 'Usuário removido com sucesso' })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ error: String(error) })
  }
})

// Estatísticas gerais do SaaS (expandidas)
app.get('/api/superadmin/stats', async (_req, res) => {
  try {
    // Contadores básicos
    const [totalConsultancies] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM consultancies'
    )
    const [activeConsultancies] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM consultancies WHERE status = 'active'"
    )
    const [trialConsultancies] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM consultancies WHERE status = 'trial'"
    )
    const [suspendedConsultancies] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM consultancies WHERE status = 'suspended'"
    )
    const [cancelledConsultancies] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM consultancies WHERE status = 'cancelled'"
    )
    const [totalRevenue] = await pool.query<RowDataPacket[]>(
      "SELECT SUM(price_monthly) as total FROM consultancies WHERE status = 'active'"
    )
    const [totalProfessionals] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM users WHERE role != 'athlete'"
    )
    const [totalPatients] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM users WHERE role = 'athlete'"
    )
    
    // Contagem por módulos
    const [modulesCount] = await pool.query<RowDataPacket[]>(`
      SELECT 
        SUM(has_training) as training,
        SUM(has_nutrition) as nutrition,
        SUM(has_medical) as medical,
        SUM(has_rehab) as rehab
      FROM consultancies
    `)
    
    // Consultorias criadas por mês (últimos 6 meses)
    const [monthlyGrowth] = await pool.query<RowDataPacket[]>(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM consultancies
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `)
    
    // Top 5 consultorias por pacientes
    const [topConsultancies] = await pool.query<RowDataPacket[]>(`
      SELECT 
        c.id, c.name, c.status, c.price_monthly,
        (SELECT COUNT(*) FROM users u WHERE u.consultancy_id = c.id AND u.role = 'athlete') as patients_count,
        (SELECT COUNT(*) FROM users u WHERE u.consultancy_id = c.id AND u.role != 'athlete') as professionals_count
      FROM consultancies c
      ORDER BY patients_count DESC
      LIMIT 5
    `)
    
    // Consultorias recentes
    const [recentConsultancies] = await pool.query<RowDataPacket[]>(`
      SELECT id, name, email, status, created_at, price_monthly
      FROM consultancies
      ORDER BY created_at DESC
      LIMIT 5
    `)
    
    // Distribuição por plano
    const [planDistribution] = await pool.query<RowDataPacket[]>(`
      SELECT plan, COUNT(*) as count
      FROM consultancies
      GROUP BY plan
    `)

    res.json({
      totalConsultancies: totalConsultancies[0].total,
      activeConsultancies: activeConsultancies[0].total,
      trialConsultancies: trialConsultancies[0].total,
      suspendedConsultancies: suspendedConsultancies[0].total,
      cancelledConsultancies: cancelledConsultancies[0].total,
      monthlyRevenue: totalRevenue[0].total || 0,
      totalProfessionals: totalProfessionals[0].total,
      totalPatients: totalPatients[0].total,
      modulesCount: modulesCount[0],
      monthlyGrowth,
      topConsultancies,
      recentConsultancies,
      planDistribution
    })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Detalhes completos de uma consultoria
app.get('/api/superadmin/consultancies/:id/details', async (req, res) => {
  try {
    const consultancyId = req.params.id
    
    // Dados básicos da consultoria
    const [consultancy] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM consultancies WHERE id = ?`,
      [consultancyId]
    )
    
    if (consultancy.length === 0) {
      return res.status(404).json({ error: 'Consultoria não encontrada' })
    }
    
    // Profissionais
    const [professionals] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, email, role, phone, is_active, created_at, avatar_url
       FROM users 
       WHERE consultancy_id = ? AND role != 'athlete'
       ORDER BY created_at DESC`,
      [consultancyId]
    )
    
    // Pacientes
    const [patients] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.name, u.email, u.is_active, u.created_at,
              a.sport, a.club
       FROM users u
       LEFT JOIN athletes a ON u.id = a.user_id
       WHERE u.consultancy_id = ? AND u.role = 'athlete'
       ORDER BY u.created_at DESC`,
      [consultancyId]
    )
    
    // Estatísticas de uso
    const [trainingPlans] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM training_plans tp
       JOIN athletes a ON tp.athlete_id = a.id
       JOIN users u ON a.user_id = u.id
       WHERE u.consultancy_id = ?`,
      [consultancyId]
    )
    
    const [nutritionPlans] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM nutrition_plans np
       JOIN athletes a ON np.athlete_id = a.id
       JOIN users u ON a.user_id = u.id
       WHERE u.consultancy_id = ?`,
      [consultancyId]
    )
    
    const [appointments] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM appointments ap
       JOIN athletes a ON ap.athlete_id = a.id
       JOIN users u ON a.user_id = u.id
       WHERE u.consultancy_id = ?`,
      [consultancyId]
    )
    
    // Atividade recente (últimos logins - simulado pelos últimos usuários criados)
    const [recentActivity] = await pool.query<RowDataPacket[]>(
      `SELECT u.name, u.email, u.role, u.created_at as last_activity
       FROM users u
       WHERE u.consultancy_id = ?
       ORDER BY u.updated_at DESC
       LIMIT 10`,
      [consultancyId]
    )

    res.json({
      ...consultancy[0],
      professionals,
      patients,
      stats: {
        trainingPlans: trainingPlans[0].total,
        nutritionPlans: nutritionPlans[0].total,
        appointments: appointments[0].total,
        professionalsCount: professionals.length,
        patientsCount: patients.length
      },
      recentActivity
    })
  } catch (error) {
    console.error('Error fetching consultancy details:', error)
    res.status(500).json({ error: String(error) })
  }
})

// ===============================
// AUTENTICAÇÃO
// ===============================

// Login de profissionais (admin, coach, nutritionist, physio)
app.post('/api/auth/admin/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' })
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.email, u.name, u.role, u.avatar_url, u.phone, u.consultancy_id, u.password_hash,
              c.name as consultancy_name, c.slug as consultancy_slug,
              c.has_training, c.has_nutrition, c.has_medical, c.has_rehab
       FROM users u
       LEFT JOIN consultancies c ON u.consultancy_id = c.id
       WHERE u.email = ? AND u.role IN ('admin', 'coach', 'nutritionist', 'physio')`,
      [email.toLowerCase()]
    )

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' })
    }

    const user = rows[0]
    
    // Verificar senha com bcrypt (ou comparação direta para senhas antigas)
    const isValidPassword = user.password_hash?.startsWith('$2') 
      ? await bcrypt.compare(password, user.password_hash)
      : password === user.password_hash
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos' })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatar_url,
        phone: user.phone,
        consultancyId: user.consultancy_id,
        consultancyName: user.consultancy_name,
        consultancySlug: user.consultancy_slug,
        modules: {
          training: user.has_training === 1,
          nutrition: user.has_nutrition === 1,
          medical: user.has_medical === 1,
          rehab: user.has_rehab === 1
        }
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// Login de pacientes (athletes)
app.post('/api/auth/patient/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' })
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.email, u.name, u.avatar_url, u.phone, u.password_hash,
              a.id as athlete_id, a.sport, a.club, a.position
       FROM users u
       LEFT JOIN athletes a ON u.id = a.user_id
       WHERE u.email = ? AND u.role = 'athlete'`,
      [email.toLowerCase()]
    )

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' })
    }

    const user = rows[0]
    
    // Verificar senha com bcrypt (ou comparação direta para senhas antigas)
    const isValidPassword = user.password_hash?.startsWith('$2') 
      ? await bcrypt.compare(password, user.password_hash)
      : password === user.password_hash
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos' })
    }
    const athleteId = user.athlete_id

    // Verificar módulos ativos do atleta
    const activeModules: string[] = []

    if (athleteId) {
      // Treinamento - verifica se tem plano de treino ativo
      const [trainingPlans] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM training_plans WHERE athlete_id = ? AND status = 'active'`,
        [athleteId]
      )
      if (trainingPlans[0].count > 0) activeModules.push('training')

      // Nutrição - verifica se tem plano nutricional ativo
      const [nutritionPlans] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM nutrition_plans WHERE athlete_id = ? AND status = 'active'`,
        [athleteId]
      )
      if (nutritionPlans[0].count > 0) activeModules.push('nutrition')

      // Médico - verifica se tem registros médicos
      const [medicalRecords] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM medical_records WHERE athlete_id = ?`,
        [athleteId]
      )
      if (medicalRecords[0].count > 0) activeModules.push('medical')

      // Reabilitação - verifica se tem sessões de reabilitação
      const [rehabSessions] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM rehab_sessions WHERE athlete_id = ?`,
        [athleteId]
      )
      if (rehabSessions[0].count > 0) activeModules.push('rehab')
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        athleteId: user.athlete_id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        phone: user.phone,
        sport: user.sport || 'Esporte',
        club: user.club || 'Clube',
        position: user.position,
        activeModules: activeModules
      }
    })
  } catch (error) {
    console.error('Patient login error:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// ===============================
// GESTÃO DA CONSULTORIA
// ===============================

// Obter detalhes da consultoria (plano, limites, etc)
app.get('/api/consultancy/:id', async (req, res) => {
  try {
    const consultancyId = req.params.id
    
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, slug, email, phone, logo_url, primary_color, plan, price_monthly, billing_day,
              has_training, has_nutrition, has_medical, has_rehab,
              max_professionals, max_patients, status, trial_ends_at, created_at
       FROM consultancies
       WHERE id = ?`,
      [consultancyId]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Consultoria não encontrada' })
    }
    
    // Contar profissionais ativos
    const [profCount] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM users WHERE consultancy_id = ? AND role IN ('admin', 'coach', 'nutritionist', 'physio') AND is_active = TRUE`,
      [consultancyId]
    )
    
    // Contar pacientes ativos
    const [patientCount] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM athletes a JOIN users u ON a.user_id = u.id WHERE u.consultancy_id = ? AND u.is_active = TRUE`,
      [consultancyId]
    )
    
    res.json({
      ...rows[0],
      currentProfessionals: profCount[0].count,
      currentPatients: patientCount[0].count
    })
  } catch (error) {
    console.error('Error fetching consultancy:', error)
    res.status(500).json({ error: String(error) })
  }
})

// Listar profissionais da consultoria
app.get('/api/consultancy/:id/professionals', async (req, res) => {
  try {
    const consultancyId = req.params.id
    
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, email, name, role, avatar_url, phone, is_active, created_at
       FROM users
       WHERE consultancy_id = ? AND role IN ('admin', 'coach', 'nutritionist', 'physio')
       ORDER BY role, name`,
      [consultancyId]
    )
    
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Adicionar novo profissional
app.post('/api/consultancy/:id/professionals', async (req, res) => {
  try {
    const consultancyId = req.params.id
    const { email, password, name, role, phone } = req.body
    
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Email, senha, nome e função são obrigatórios' })
    }
    
    // Verificar consultoria e seus módulos
    const [consultancy] = await pool.query<RowDataPacket[]>(
      'SELECT max_professionals, has_training, has_nutrition, has_medical, has_rehab FROM consultancies WHERE id = ?',
      [consultancyId]
    )
    
    if (consultancy.length === 0) {
      return res.status(404).json({ error: 'Consultoria não encontrada' })
    }
    
    const cons = consultancy[0]
    
    // Validar se a role corresponde a um módulo ativo
    const roleModuleMap: Record<string, string> = {
      coach: 'has_training',
      nutritionist: 'has_nutrition',
      physio: 'has_rehab',
      // admin sempre permitido
    }
    
    if (role !== 'admin' && roleModuleMap[role]) {
      const moduleField = roleModuleMap[role]
      if (!cons[moduleField]) {
        const roleLabels: Record<string, string> = {
          coach: 'Personal Trainer',
          nutritionist: 'Nutricionista',
          physio: 'Fisioterapeuta',
        }
        return res.status(400).json({ 
          error: `Não é possível adicionar ${roleLabels[role]}. O módulo correspondente não está ativo no seu plano.`
        })
      }
    }
    
    // Verificar limite de profissionais
    const [currentCount] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM users WHERE consultancy_id = ? AND role IN ('admin', 'coach', 'nutritionist', 'physio') AND is_active = TRUE`,
      [consultancyId]
    )
    
    if (currentCount[0].count >= cons.max_professionals) {
      return res.status(400).json({ 
        error: `Limite de profissionais atingido (${cons.max_professionals}). Atualize seu plano para adicionar mais.`
      })
    }
    
    // Verificar se email já existe
    const [existingEmail] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    )
    
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: 'Este email já está cadastrado' })
    }
    
    // Hash da senha antes de salvar
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Criar usuário
    const [result] = await pool.query(
      `INSERT INTO users (consultancy_id, email, password_hash, name, role, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [consultancyId, email.toLowerCase(), hashedPassword, name, role, phone || null]
    )
    
    const userId = (result as { insertId: number }).insertId
    
    res.status(201).json({
      id: userId,
      email: email.toLowerCase(),
      name,
      role,
      phone,
      is_active: true,
      message: 'Profissional adicionado com sucesso'
    })
  } catch (error) {
    console.error('Error adding professional:', error)
    res.status(500).json({ error: String(error) })
  }
})

// Atualizar profissional
app.put('/api/consultancy/:consultancyId/professionals/:userId', async (req, res) => {
  try {
    const { consultancyId, userId } = req.params
    const { name, role, phone, is_active } = req.body
    
    // Verificar se o usuário pertence à consultoria
    const [user] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ? AND consultancy_id = ?',
      [userId, consultancyId]
    )
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'Profissional não encontrado' })
    }
    
    await pool.query(
      `UPDATE users SET name = ?, role = ?, phone = ?, is_active = ? WHERE id = ?`,
      [name, role, phone, is_active, userId]
    )
    
    res.json({ message: 'Profissional atualizado com sucesso' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Remover profissional (soft delete - desativa)
app.delete('/api/consultancy/:consultancyId/professionals/:userId', async (req, res) => {
  try {
    const { consultancyId, userId } = req.params
    
    // Verificar se o usuário pertence à consultoria
    const [user] = await pool.query<RowDataPacket[]>(
      'SELECT id, role FROM users WHERE id = ? AND consultancy_id = ?',
      [userId, consultancyId]
    )
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'Profissional não encontrado' })
    }
    
    // Não permitir remover o último admin
    if (user[0].role === 'admin') {
      const [adminCount] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM users WHERE consultancy_id = ? AND role = 'admin' AND is_active = TRUE`,
        [consultancyId]
      )
      
      if (adminCount[0].count <= 1) {
        return res.status(400).json({ error: 'Não é possível remover o único administrador' })
      }
    }
    
    // Desativar usuário ao invés de deletar
    await pool.query('UPDATE users SET is_active = FALSE WHERE id = ?', [userId])
    
    res.json({ message: 'Profissional removido com sucesso' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Atualizar plano da consultoria
app.put('/api/consultancy/:id/plan', async (req, res) => {
  try {
    const consultancyId = req.params.id
    const { modules, maxProfessionals, maxPatients, priceMonthly } = req.body
    
    // Verificar se a consultoria existe
    const [consultancy] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM consultancies WHERE id = ?',
      [consultancyId]
    )
    
    if (consultancy.length === 0) {
      return res.status(404).json({ error: 'Consultoria não encontrada' })
    }
    
    // Se está diminuindo o limite de profissionais, verificar se não excede o atual
    if (maxProfessionals) {
      const [currentCount] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM users WHERE consultancy_id = ? AND role IN ('admin', 'coach', 'nutritionist', 'physio') AND is_active = TRUE`,
        [consultancyId]
      )
      
      if (currentCount[0].count > maxProfessionals) {
        return res.status(400).json({ 
          error: `Você possui ${currentCount[0].count} profissionais ativos. Remova alguns antes de reduzir o limite.`
        })
      }
    }
    
    // Atualizar consultoria
    await pool.query(
      `UPDATE consultancies SET 
        has_training = ?,
        has_nutrition = ?,
        has_medical = ?,
        has_rehab = ?,
        max_professionals = ?,
        max_patients = ?,
        price_monthly = ?
       WHERE id = ?`,
      [
        modules?.training ?? true,
        modules?.nutrition ?? true,
        modules?.medical ?? true,
        modules?.rehab ?? true,
        maxProfessionals || 5,
        maxPatients || 50,
        priceMonthly || 0,
        consultancyId
      ]
    )
    
    res.json({ 
      message: 'Plano atualizado com sucesso',
      modules: {
        training: modules?.training ?? true,
        nutrition: modules?.nutrition ?? true,
        medical: modules?.medical ?? true,
        rehab: modules?.rehab ?? true,
      },
      maxProfessionals: maxProfessionals || 5,
      maxPatients: maxPatients || 50,
      priceMonthly: priceMonthly || 0
    })
  } catch (error) {
    console.error('Error updating plan:', error)
    res.status(500).json({ error: String(error) })
  }
})

// Atualizar branding da consultoria (cor e logo)
app.put('/api/consultancy/:id/branding', async (req, res) => {
  try {
    const consultancyId = req.params.id
    const { primary_color, logo_url } = req.body
    
    // Validar cor hex
    if (primary_color && !/^#[0-9A-Fa-f]{6}$/.test(primary_color)) {
      return res.status(400).json({ error: 'Cor inválida. Use formato hex (#RRGGBB)' })
    }
    
    // Atualizar campos
    const updates: string[] = []
    const values: (string | number)[] = []
    
    if (primary_color !== undefined) {
      updates.push('primary_color = ?')
      values.push(primary_color)
    }
    
    if (logo_url !== undefined) {
      updates.push('logo_url = ?')
      values.push(logo_url)
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' })
    }
    
    values.push(Number(consultancyId))
    
    await pool.query(
      `UPDATE consultancies SET ${updates.join(', ')} WHERE id = ?`,
      values
    )
    
    res.json({ 
      message: 'Branding atualizado com sucesso',
      primary_color,
      logo_url
    })
  } catch (error) {
    console.error('Error updating branding:', error)
    res.status(500).json({ error: String(error) })
  }
})

// ===============================
// MERCADO PAGO - PAGAMENTOS
// ===============================

// Criar assinatura recorrente
app.post('/api/payments/subscription', async (req, res) => {
  try {
    const {
      cardToken,
      email,
      payerName,
      amount,
      description,
      consultancyName
    } = req.body

    if (!cardToken || !email || !amount) {
      return res.status(400).json({ error: 'Token do cartão, email e valor são obrigatórios' })
    }

    const preApproval = new PreApproval(mercadoPagoClient)
    
    // Criar assinatura recorrente
    const subscriptionData = {
      preapproval_plan_id: undefined, // Sem plano pré-definido, criamos dinâmico
      reason: `Assinatura VITAE - ${consultancyName || 'Consultoria'}`,
      external_reference: `consultancy_${Date.now()}`,
      payer_email: email,
      card_token_id: cardToken,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months' as const,
        transaction_amount: amount,
        currency_id: 'BRL',
        start_date: new Date().toISOString(),
      },
      back_url: 'http://localhost:5173/signup/success',
      status: 'authorized' as const,
    }

    const result = await preApproval.create({ body: subscriptionData })

    res.json({
      success: true,
      subscriptionId: result.id,
      status: result.status,
      message: 'Assinatura criada com sucesso'
    })
  } catch (error: any) {
    console.error('Subscription error:', error)
    res.status(500).json({ 
      error: error.message || 'Erro ao processar assinatura',
      details: error.cause || error
    })
  }
})

// Processar pagamento único (primeira cobrança)
app.post('/api/payments/process', async (req, res) => {
  try {
    const {
      cardToken,
      email,
      amount,
      description,
      payerFirstName,
      payerLastName,
      payerDocType,
      payerDocNumber,
      installments
    } = req.body

    if (!cardToken || !email || !amount) {
      return res.status(400).json({ error: 'Token do cartão, email e valor são obrigatórios' })
    }

    const payment = new Payment(mercadoPagoClient)
    
    const paymentData = {
      transaction_amount: amount,
      token: cardToken,
      description: description || 'Assinatura VITAE',
      installments: installments || 1,
      payment_method_id: 'master', // Será detectado automaticamente pelo token
      payer: {
        email: email,
        first_name: payerFirstName,
        last_name: payerLastName,
        identification: payerDocType && payerDocNumber ? {
          type: payerDocType,
          number: payerDocNumber
        } : undefined
      }
    }

    const result = await payment.create({ body: paymentData })

    if (result.status === 'approved') {
      res.json({
        success: true,
        paymentId: result.id,
        status: result.status,
        statusDetail: result.status_detail,
        message: 'Pagamento aprovado'
      })
    } else {
      res.json({
        success: false,
        paymentId: result.id,
        status: result.status,
        statusDetail: result.status_detail,
        message: `Pagamento ${result.status}: ${result.status_detail}`
      })
    }
  } catch (error: any) {
    console.error('Payment error:', error)
    res.status(500).json({ 
      error: error.message || 'Erro ao processar pagamento',
      details: error.cause || error
    })
  }
})

// Obter public key para o frontend
app.get('/api/payments/public-key', (_req, res) => {
  // Em produção, usar variável de ambiente
  const publicKey = process.env.MP_PUBLIC_KEY || 'TEST-8f2e0407-fba9-4767-8bd1-6a61411d9d1c'
  res.json({ publicKey })
})

// ===============================
// REGISTRO DE NOVA CONSULTORIA (COM PAGAMENTO)
// ===============================

app.post('/api/signup/consultancy', async (req, res) => {
  try {
    const {
      // Dados da consultoria
      consultancyName,
      consultancySlug,
      // Dados do admin
      adminName,
      adminEmail,
      adminPhone,
      adminPassword,
      // Módulos e capacidade
      modules,
      maxProfessionals,
      maxPatients,
      priceMonthly,
      // Dados do pagamento
      cardToken,
      payerDocType,
      payerDocNumber
    } = req.body

    // Validações básicas
    if (!consultancyName || !consultancySlug || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' })
    }

    // Validar token do cartão (apenas se pagamento não for pulado)
    if (!SKIP_PAYMENT && !cardToken) {
      return res.status(400).json({ error: 'Dados do cartão são obrigatórios' })
    }

    // Verificar se o slug já existe
    const [existingSlug] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM consultancies WHERE slug = ?',
      [consultancySlug.toLowerCase()]
    )
    if (existingSlug.length > 0) {
      return res.status(400).json({ error: 'Esta URL já está em uso. Escolha outra.' })
    }

    // Verificar se o email já existe
    const [existingEmail] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail.toLowerCase()]
    )
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: 'Este email já está cadastrado.' })
    }

    // ========== PROCESSAR PAGAMENTO PRIMEIRO ==========
    
    // Modo de desenvolvimento: pular pagamento
    if (SKIP_PAYMENT) {
      console.log('⚠️ DEV MODE: Skipping payment processing')
      
      // Criar consultoria diretamente sem pagamento
      const [consultancyResult] = await pool.query(
        `INSERT INTO consultancies 
         (name, slug, email, phone, plan, price_monthly, has_training, has_nutrition, has_medical, has_rehab, max_professionals, max_patients, status)
         VALUES (?, ?, ?, ?, 'professional', ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
          consultancyName,
          consultancySlug.toLowerCase(),
          adminEmail.toLowerCase(),
          adminPhone || null,
          priceMonthly || 97,
          modules?.training || false,
          modules?.nutrition || false,
          modules?.medical || false,
          modules?.rehab || false,
          maxProfessionals || 3,
          maxPatients || 30,
        ]
      )

      const consultancyId = (consultancyResult as { insertId: number }).insertId

      // Hash da senha antes de salvar
      const hashedPassword = await bcrypt.hash(adminPassword, 10)
      
      const [userResult] = await pool.query(
        `INSERT INTO users (consultancy_id, email, password_hash, name, role, phone, is_active)
         VALUES (?, ?, ?, ?, 'admin', ?, TRUE)`,
        [consultancyId, adminEmail.toLowerCase(), hashedPassword, adminName, adminPhone || null]
      )

      const userId = (userResult as { insertId: number }).insertId

      // Copiar biblioteca de exercícios
      const [globalExercises] = await pool.query<RowDataPacket[]>(
        `SELECT name, description, muscle_group, secondary_muscle, equipment, 
                difficulty, video_url, image_url, instructions, tips
         FROM exercise_library 
         WHERE is_global = TRUE OR consultancy_id IS NULL`
      )

      if (globalExercises.length > 0) {
        const insertValues = globalExercises.map((ex: RowDataPacket) => [
          consultancyId, ex.name, ex.description, ex.muscle_group, ex.secondary_muscle,
          ex.equipment, ex.difficulty, ex.video_url, ex.image_url, ex.instructions, ex.tips, false
        ])
        await pool.query(
          `INSERT INTO exercise_library 
           (consultancy_id, name, description, muscle_group, secondary_muscle, 
            equipment, difficulty, video_url, image_url, instructions, tips, is_global)
           VALUES ?`,
          [insertValues]
        )
      }

      // Copiar biblioteca de alimentos padrão para a nova consultoria
      const [globalFoods] = await pool.query<RowDataPacket[]>(
        `SELECT name, description, category, serving_size, calories, protein, carbs, fat, fiber, sodium, image_url
         FROM food_library 
         WHERE is_global = TRUE OR consultancy_id IS NULL`
      )

      if (globalFoods.length > 0) {
        const foodInsertValues = globalFoods.map((food: RowDataPacket) => [
          consultancyId, food.name, food.description, food.category, food.serving_size,
          food.calories, food.protein, food.carbs, food.fat, food.fiber, food.sodium, food.image_url, false
        ])
        await pool.query(
          `INSERT INTO food_library 
           (consultancy_id, name, description, category, serving_size, calories, protein, carbs, fat, fiber, sodium, image_url, is_global)
           VALUES ?`,
          [foodInsertValues]
        )
      }

      return res.status(201).json({
        success: true,
        message: 'Consultoria criada (modo desenvolvimento - sem pagamento)',
        data: { consultancyId, userId, consultancyName, consultancySlug: consultancySlug.toLowerCase(), adminEmail: adminEmail.toLowerCase(), exercisesCopied: globalExercises.length, foodsCopied: globalFoods.length }
      })
    }
    
    const payment = new Payment(mercadoPagoClient)
    
    // Separar nome em primeiro e último
    const nameParts = adminName.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName

    const paymentData = {
      transaction_amount: priceMonthly || 97,
      token: cardToken,
      description: `Assinatura VITAE - ${consultancyName}`,
      installments: 1,
      payer: {
        email: adminEmail.toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        identification: payerDocType && payerDocNumber ? {
          type: payerDocType,
          number: payerDocNumber
        } : undefined
      }
    }

    console.log('Processing payment with data:', JSON.stringify(paymentData, null, 2))

    let paymentResult
    try {
      paymentResult = await payment.create({ body: paymentData })
      console.log('Payment result:', JSON.stringify(paymentResult, null, 2))
    } catch (paymentError: any) {
      console.error('Payment processing error:', paymentError)
      console.error('Error details:', JSON.stringify(paymentError, null, 2))
      
      // Extrair mensagem de erro mais útil
      let errorMessage = 'Erro ao processar pagamento. Verifique os dados do cartão.'
      if (paymentError?.cause) {
        const causes = paymentError.cause
        if (Array.isArray(causes) && causes.length > 0) {
          errorMessage = causes.map((c: any) => c.description || c.message).join('. ')
        }
      } else if (paymentError?.message) {
        errorMessage = paymentError.message
      }
      
      return res.status(400).json({ 
        error: errorMessage,
        details: paymentError.message 
      })
    }

    // Verificar se o pagamento foi aprovado
    if (paymentResult.status !== 'approved') {
      const statusMessages: Record<string, string> = {
        rejected: 'Pagamento recusado. Verifique os dados do cartão ou tente outro cartão.',
        in_process: 'Pagamento em processamento. Aguarde a confirmação.',
        pending: 'Pagamento pendente. Complete a autenticação no seu banco.',
      }
      return res.status(400).json({ 
        error: statusMessages[paymentResult.status || ''] || `Pagamento não aprovado: ${paymentResult.status_detail}`,
        paymentStatus: paymentResult.status,
        paymentStatusDetail: paymentResult.status_detail
      })
    }

    // ========== PAGAMENTO APROVADO - CRIAR CONSULTORIA ==========
    
    // Criar a consultoria com status 'active' (pagamento confirmado)
    const [consultancyResult] = await pool.query(
      `INSERT INTO consultancies 
       (name, slug, email, phone, plan, price_monthly, has_training, has_nutrition, has_medical, has_rehab, max_professionals, max_patients, status, mp_payment_id)
       VALUES (?, ?, ?, ?, 'professional', ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
      [
        consultancyName,
        consultancySlug.toLowerCase(),
        adminEmail.toLowerCase(),
        adminPhone || null,
        priceMonthly || 97,
        modules?.training || false,
        modules?.nutrition || false,
        modules?.medical || false,
        modules?.rehab || false,
        maxProfessionals || 3,
        maxPatients || 30,
        paymentResult.id
      ]
    )

    const consultancyId = (consultancyResult as { insertId: number }).insertId

    // Hash da senha antes de salvar
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)

    // Criar o usuário admin
    const [userResult] = await pool.query(
      `INSERT INTO users (consultancy_id, email, password_hash, name, role, phone, is_active)
       VALUES (?, ?, ?, ?, 'admin', ?, TRUE)`,
      [
        consultancyId,
        adminEmail.toLowerCase(),
        hashedAdminPassword,
        adminName,
        adminPhone || null
      ]
    )

    const userId = (userResult as { insertId: number }).insertId

    // Copiar biblioteca de exercícios padrão para a nova consultoria
    const [globalExercises] = await pool.query<RowDataPacket[]>(
      `SELECT name, description, muscle_group, secondary_muscle, equipment, 
              difficulty, video_url, image_url, instructions, tips
       FROM exercise_library 
       WHERE is_global = TRUE OR consultancy_id IS NULL`
    )

    if (globalExercises.length > 0) {
      const insertValues = globalExercises.map((ex: RowDataPacket) => [
        consultancyId,
        ex.name,
        ex.description,
        ex.muscle_group,
        ex.secondary_muscle,
        ex.equipment,
        ex.difficulty,
        ex.video_url,
        ex.image_url,
        ex.instructions,
        ex.tips,
        false
      ])

      await pool.query(
        `INSERT INTO exercise_library 
         (consultancy_id, name, description, muscle_group, secondary_muscle, 
          equipment, difficulty, video_url, image_url, instructions, tips, is_global)
         VALUES ?`,
        [insertValues]
      )
    }

    // Copiar biblioteca de alimentos padrão para a nova consultoria
    const [globalFoods] = await pool.query<RowDataPacket[]>(
      `SELECT name, description, category, serving_size, calories, protein, carbs, fat, fiber, sodium, image_url
       FROM food_library 
       WHERE is_global = TRUE OR consultancy_id IS NULL`
    )

    if (globalFoods.length > 0) {
      const foodInsertValues = globalFoods.map((food: RowDataPacket) => [
        consultancyId, food.name, food.description, food.category, food.serving_size,
        food.calories, food.protein, food.carbs, food.fat, food.fiber, food.sodium, food.image_url, false
      ])
      await pool.query(
        `INSERT INTO food_library 
         (consultancy_id, name, description, category, serving_size, calories, protein, carbs, fat, fiber, sodium, image_url, is_global)
         VALUES ?`,
        [foodInsertValues]
      )
    }

    res.status(201).json({
      success: true,
      message: 'Consultoria criada com sucesso! Pagamento aprovado.',
      data: {
        consultancyId,
        userId,
        consultancyName,
        consultancySlug: consultancySlug.toLowerCase(),
        adminEmail: adminEmail.toLowerCase(),
        exercisesCopied: globalExercises.length,
        foodsCopied: globalFoods.length,
        payment: {
          id: paymentResult.id,
          status: paymentResult.status,
          amount: priceMonthly || 97
        }
      }
    })

  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Erro ao criar consultoria. Tente novamente.' })
  }
})

// ===============================
// PAGAMENTO PIX - Signup com PIX
// ===============================

// Interface para armazenar dados pendentes do signup PIX
interface PendingPixSignup {
  consultancyName: string;
  consultancySlug: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminPassword: string;
  modules: { training: boolean; nutrition: boolean; medical: boolean; rehab: boolean };
  maxProfessionals: number;
  maxPatients: number;
  priceMonthly: number;
  payerDocType: string;
  payerDocNumber: string;
  createdAt: Date;
}

// Armazenamento temporário de signups pendentes (em produção, usar Redis ou banco)
const pendingPixSignups = new Map<number, PendingPixSignup>();

// Gerar pagamento PIX para signup (plano anual)
app.post('/api/signup/consultancy/pix', async (req, res) => {
  try {
    const {
      consultancyName,
      consultancySlug,
      adminName,
      adminEmail,
      adminPhone,
      adminPassword,
      modules,
      maxProfessionals,
      maxPatients,
      priceMonthly,
      priceAnnual,
      isAnnual,
      payerDocType,
      payerDocNumber
    } = req.body
    
    // Calcular valor a cobrar (anual = 10x mensal)
    const amountToCharge = isAnnual ? (priceAnnual || priceMonthly * 10) : priceMonthly

    // Validações básicas
    if (!consultancyName || !consultancySlug || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' })
    }

    // Verificar se o slug já existe
    const [existingSlug] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM consultancies WHERE slug = ?',
      [consultancySlug.toLowerCase()]
    )
    if (existingSlug.length > 0) {
      return res.status(400).json({ error: 'Esta URL já está em uso. Escolha outra.' })
    }

    // Verificar se o email já existe
    const [existingEmail] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail.toLowerCase()]
    )
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: 'Este email já está cadastrado.' })
    }

    // Gerar pagamento PIX no Mercado Pago
    const payment = new Payment(mercadoPagoClient)
    
    const nameParts = adminName.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName

    // Data de expiração (30 minutos)
    const expirationDate = new Date()
    expirationDate.setMinutes(expirationDate.getMinutes() + 30)

    const paymentData = {
      transaction_amount: amountToCharge,
      description: `VITAE - ${consultancyName} (Plano Anual)`,
      payment_method_id: 'pix',
      payer: {
        email: adminEmail.toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        identification: payerDocType && payerDocNumber ? {
          type: payerDocType,
          number: payerDocNumber
        } : undefined
      },
      date_of_expiration: expirationDate.toISOString()
    }

    console.log('Creating PIX payment with data:', JSON.stringify(paymentData, null, 2))

    let paymentResult
    try {
      paymentResult = await payment.create({ body: paymentData })
      console.log('PIX payment created:', JSON.stringify(paymentResult, null, 2))
    } catch (paymentError: any) {
      console.error('PIX payment error:', paymentError)
      return res.status(400).json({ 
        error: 'Erro ao gerar PIX. Tente novamente.',
        details: paymentError.message 
      })
    }

    if (!paymentResult.id) {
      return res.status(400).json({ error: 'Erro ao gerar PIX. Tente novamente.' })
    }

    // Extrair dados do PIX
    const pixInfo = paymentResult.point_of_interaction?.transaction_data
    if (!pixInfo?.qr_code || !pixInfo?.qr_code_base64) {
      console.error('PIX info missing:', paymentResult.point_of_interaction)
      return res.status(400).json({ error: 'Erro ao gerar QR Code PIX. Tente novamente.' })
    }

    // Armazenar dados do signup pendente
    pendingPixSignups.set(paymentResult.id, {
      consultancyName,
      consultancySlug: consultancySlug.toLowerCase(),
      adminName,
      adminEmail: adminEmail.toLowerCase(),
      adminPhone,
      adminPassword,
      modules,
      maxProfessionals,
      maxPatients,
      priceMonthly,
      payerDocType,
      payerDocNumber,
      createdAt: new Date()
    })

    // Limpar signups antigos (mais de 1 hora)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    pendingPixSignups.forEach((value, key) => {
      if (value.createdAt < oneHourAgo) {
        pendingPixSignups.delete(key)
      }
    })

    res.json({
      success: true,
      pixData: {
        qrCode: pixInfo.qr_code,
        qrCodeBase64: pixInfo.qr_code_base64,
        expirationDate: expirationDate.toISOString(),
        paymentId: paymentResult.id
      },
      pendingConsultancy: {
        consultancyName,
        adminEmail: adminEmail.toLowerCase()
      }
    })

  } catch (error) {
    console.error('PIX signup error:', error)
    res.status(500).json({ error: 'Erro ao gerar PIX. Tente novamente.' })
  }
})

// Verificar status do pagamento PIX
app.get('/api/signup/pix/status/:paymentId', async (req, res) => {
  try {
    const paymentId = parseInt(req.params.paymentId)
    
    if (isNaN(paymentId)) {
      return res.status(400).json({ error: 'ID de pagamento inválido' })
    }

    // Buscar status no Mercado Pago
    const payment = new Payment(mercadoPagoClient)
    
    let paymentResult
    try {
      paymentResult = await payment.get({ id: paymentId })
    } catch (error) {
      console.error('Error fetching payment status:', error)
      return res.status(400).json({ error: 'Erro ao verificar pagamento' })
    }

    const status = paymentResult.status

    // Se pagamento foi aprovado, criar a consultoria
    if (status === 'approved') {
      const pendingData = pendingPixSignups.get(paymentId)
      
      if (pendingData) {
        // Verificar novamente se não foi criada (evitar duplicação)
        const [existingSlug] = await pool.query<RowDataPacket[]>(
          'SELECT id FROM consultancies WHERE slug = ?',
          [pendingData.consultancySlug]
        )
        
        if (existingSlug.length === 0) {
          // Criar a consultoria
          const [consultancyResult] = await pool.query(
            `INSERT INTO consultancies 
             (name, slug, email, phone, plan, price_monthly, has_training, has_nutrition, has_medical, has_rehab, max_professionals, max_patients, status, mp_payment_id)
             VALUES (?, ?, ?, ?, 'professional', ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
            [
              pendingData.consultancyName,
              pendingData.consultancySlug,
              pendingData.adminEmail,
              pendingData.adminPhone || null,
              pendingData.priceMonthly || 97,
              pendingData.modules?.training || false,
              pendingData.modules?.nutrition || false,
              pendingData.modules?.medical || false,
              pendingData.modules?.rehab || false,
              pendingData.maxProfessionals || 3,
              pendingData.maxPatients || 30,
              paymentId
            ]
          )

          const consultancyId = (consultancyResult as { insertId: number }).insertId

          // Hash da senha
          const hashedPassword = await bcrypt.hash(pendingData.adminPassword, 10)

          // Criar usuário admin
          await pool.query(
            `INSERT INTO users (consultancy_id, email, password_hash, name, role, phone, is_active)
             VALUES (?, ?, ?, ?, 'admin', ?, TRUE)`,
            [
              consultancyId,
              pendingData.adminEmail,
              hashedPassword,
              pendingData.adminName,
              pendingData.adminPhone || null
            ]
          )

          // Copiar biblioteca de exercícios
          const [globalExercises] = await pool.query<RowDataPacket[]>(
            `SELECT name, description, muscle_group, secondary_muscle, equipment, 
                    difficulty, video_url, image_url, instructions, tips
             FROM exercise_library 
             WHERE is_global = TRUE OR consultancy_id IS NULL`
          )

          if (globalExercises.length > 0) {
            const insertValues = globalExercises.map((ex: RowDataPacket) => [
              consultancyId, ex.name, ex.description, ex.muscle_group, ex.secondary_muscle,
              ex.equipment, ex.difficulty, ex.video_url, ex.image_url, ex.instructions, ex.tips, false
            ])
            await pool.query(
              `INSERT INTO exercise_library 
               (consultancy_id, name, description, muscle_group, secondary_muscle, 
                equipment, difficulty, video_url, image_url, instructions, tips, is_global)
               VALUES ?`,
              [insertValues]
            )
          }

          // Copiar biblioteca de alimentos
          const [globalFoods] = await pool.query<RowDataPacket[]>(
            `SELECT name, description, category, serving_size, calories, protein, carbs, fat, fiber, sodium, image_url
             FROM food_library 
             WHERE is_global = TRUE OR consultancy_id IS NULL`
          )

          if (globalFoods.length > 0) {
            const foodInsertValues = globalFoods.map((food: RowDataPacket) => [
              consultancyId, food.name, food.description, food.category, food.serving_size,
              food.calories, food.protein, food.carbs, food.fat, food.fiber, food.sodium, food.image_url, false
            ])
            await pool.query(
              `INSERT INTO food_library 
               (consultancy_id, name, description, category, serving_size, calories, protein, carbs, fat, fiber, sodium, image_url, is_global)
               VALUES ?`,
              [foodInsertValues]
            )
          }

          console.log(`✅ Consultoria "${pendingData.consultancyName}" criada via PIX!`)
        }

        // Remover dos pendentes
        pendingPixSignups.delete(paymentId)

        return res.json({
          status: 'approved',
          consultancyData: {
            consultancyName: pendingData.consultancyName,
            adminEmail: pendingData.adminEmail,
            paymentId: String(paymentId)
          }
        })
      } else {
        // Dados pendentes não encontrados, mas pagamento aprovado
        // Pode ser que já foi processado antes
        return res.json({ status: 'approved' })
      }
    }

    // Retornar status atual
    res.json({ status: status || 'pending' })

  } catch (error) {
    console.error('PIX status check error:', error)
    res.status(500).json({ error: 'Erro ao verificar status' })
  }
})

// Função para validar assinatura do webhook do Mercado Pago
const validateWebhookSignature = (req: express.Request): boolean => {
  if (!mercadoPagoWebhookSecret) {
    console.log('⚠️ MP_WEBHOOK_SECRET não configurado, pulando validação')
    return true // Em dev, pular validação se não tiver secret
  }

  const xSignature = req.headers['x-signature'] as string
  const xRequestId = req.headers['x-request-id'] as string

  if (!xSignature || !xRequestId) {
    console.log('❌ Headers de assinatura ausentes')
    return false
  }

  // Extrair ts e v1 do header x-signature
  const signatureParts: Record<string, string> = {}
  xSignature.split(',').forEach(part => {
    const [key, value] = part.split('=')
    if (key && value) {
      signatureParts[key.trim()] = value.trim()
    }
  })

  const ts = signatureParts['ts']
  const v1 = signatureParts['v1']

  if (!ts || !v1) {
    console.log('❌ Formato de assinatura inválido')
    return false
  }

  // Construir o manifest para validação
  // Formato: id:[data.id];request-id:[x-request-id];ts:[ts];
  const dataId = req.body?.data?.id || req.query?.['data.id'] || ''
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`

  // Gerar HMAC-SHA256
  const hmac = crypto.createHmac('sha256', mercadoPagoWebhookSecret)
  hmac.update(manifest)
  const generatedSignature = hmac.digest('hex')

  const isValid = generatedSignature === v1
  if (!isValid) {
    console.log('❌ Assinatura inválida')
    console.log('Manifest:', manifest)
    console.log('Expected:', v1)
    console.log('Generated:', generatedSignature)
  }

  return isValid
}

// Webhook do Mercado Pago para receber notificações de pagamento
app.post('/api/webhooks/mercadopago', async (req, res) => {
  try {
    console.log('Webhook received:', JSON.stringify(req.body, null, 2))
    console.log('Headers:', JSON.stringify(req.headers, null, 2))
    
    // Verificar se é requisição de teste do MP (id fictício)
    const isTestRequest = req.body?.data?.id === '123456' || req.body?.id === '123456'
    
    // Validar assinatura do webhook (pular para testes)
    if (!isTestRequest && !validateWebhookSignature(req)) {
      console.log('❌ Webhook com assinatura inválida rejeitado')
      return res.status(401).send('Invalid signature')
    }
    
    if (isTestRequest) {
      console.log('✅ Requisição de teste do MP aceita')
      return res.status(200).send('OK - Test received')
    }
    
    console.log('✅ Assinatura do webhook validada')
    
    const { type, data } = req.body

    // Verificar se é uma notificação de pagamento
    if (type === 'payment' && data?.id) {
      const paymentId = data.id
      
      // Buscar status do pagamento
      const payment = new Payment(mercadoPagoClient)
      const paymentResult = await payment.get({ id: paymentId })
      
      if (paymentResult.status === 'approved') {
        const pendingData = pendingPixSignups.get(paymentId)
        
        if (pendingData) {
          // Processar criação da consultoria (mesmo código do endpoint de status)
          const [existingSlug] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM consultancies WHERE slug = ?',
            [pendingData.consultancySlug]
          )
          
          if (existingSlug.length === 0) {
            const [consultancyResult] = await pool.query(
              `INSERT INTO consultancies 
               (name, slug, email, phone, plan, price_monthly, has_training, has_nutrition, has_medical, has_rehab, max_professionals, max_patients, status, mp_payment_id)
               VALUES (?, ?, ?, ?, 'professional', ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
              [
                pendingData.consultancyName,
                pendingData.consultancySlug,
                pendingData.adminEmail,
                pendingData.adminPhone || null,
                pendingData.priceMonthly || 97,
                pendingData.modules?.training || false,
                pendingData.modules?.nutrition || false,
                pendingData.modules?.medical || false,
                pendingData.modules?.rehab || false,
                pendingData.maxProfessionals || 3,
                pendingData.maxPatients || 30,
                paymentId
              ]
            )

            const consultancyId = (consultancyResult as { insertId: number }).insertId
            const hashedPassword = await bcrypt.hash(pendingData.adminPassword, 10)

            await pool.query(
              `INSERT INTO users (consultancy_id, email, password_hash, name, role, phone, is_active)
               VALUES (?, ?, ?, ?, 'admin', ?, TRUE)`,
              [consultancyId, pendingData.adminEmail, hashedPassword, pendingData.adminName, pendingData.adminPhone || null]
            )

            // Copiar bibliotecas...
            const [globalExercises] = await pool.query<RowDataPacket[]>(
              `SELECT name, description, muscle_group, secondary_muscle, equipment, 
                      difficulty, video_url, image_url, instructions, tips
               FROM exercise_library WHERE is_global = TRUE OR consultancy_id IS NULL`
            )
            if (globalExercises.length > 0) {
              const insertValues = globalExercises.map((ex: RowDataPacket) => [
                consultancyId, ex.name, ex.description, ex.muscle_group, ex.secondary_muscle,
                ex.equipment, ex.difficulty, ex.video_url, ex.image_url, ex.instructions, ex.tips, false
              ])
              await pool.query(
                `INSERT INTO exercise_library 
                 (consultancy_id, name, description, muscle_group, secondary_muscle, 
                  equipment, difficulty, video_url, image_url, instructions, tips, is_global)
                 VALUES ?`,
                [insertValues]
              )
            }

            const [globalFoods] = await pool.query<RowDataPacket[]>(
              `SELECT name, description, category, serving_size, calories, protein, carbs, fat, fiber, sodium, image_url
               FROM food_library WHERE is_global = TRUE OR consultancy_id IS NULL`
            )
            if (globalFoods.length > 0) {
              const foodInsertValues = globalFoods.map((food: RowDataPacket) => [
                consultancyId, food.name, food.description, food.category, food.serving_size,
                food.calories, food.protein, food.carbs, food.fat, food.fiber, food.sodium, food.image_url, false
              ])
              await pool.query(
                `INSERT INTO food_library 
                 (consultancy_id, name, description, category, serving_size, calories, protein, carbs, fat, fiber, sodium, image_url, is_global)
                 VALUES ?`,
                [foodInsertValues]
              )
            }

            console.log(`✅ Consultoria "${pendingData.consultancyName}" criada via Webhook PIX!`)
          }
          
          pendingPixSignups.delete(paymentId)
        }
      }
    }

    // Responder com 200 para o MP
    res.status(200).send('OK')
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(200).send('OK') // Sempre retornar 200 para evitar retentativas
  }
})

// Verificar disponibilidade do slug
app.get('/api/signup/check-slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM consultancies WHERE slug = ?',
      [slug.toLowerCase()]
    )
    res.json({ available: existing.length === 0 })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Verificar disponibilidade do email
app.get('/api/signup/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    )
    res.json({ available: existing.length === 0 })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Listar profissionais disponíveis (para tela de login)
app.get('/api/auth/admin/available', async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT email, name, role FROM users WHERE role IN ('admin', 'coach', 'nutritionist', 'physio')`
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Listar pacientes disponíveis (para tela de login)
app.get('/api/auth/patients/available', async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.email, u.name, u.avatar_url, a.sport, a.club
       FROM users u
       LEFT JOIN athletes a ON u.id = a.user_id
       WHERE u.role = 'athlete'`
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Users routes
app.get('/api/users', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, name, role, avatar_url, phone, created_at FROM users')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.get('/api/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, name, role, avatar_url, phone, created_at FROM users WHERE id = ?',
      [req.params.id]
    )
    const users = rows as Array<Record<string, unknown>>
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(users[0])
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Alterar senha do usuário (pelo profissional)
app.put('/api/users/:id/password', async (req, res) => {
  try {
    const { id } = req.params
    const { newPassword } = req.body

    if (!newPassword) {
      return res.status(400).json({ error: 'Nova senha é obrigatória' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' })
    }

    // Verificar se usuário existe
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ?',
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Atualizar senha
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, id]
    )

    res.json({ success: true, message: 'Senha alterada com sucesso' })
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    res.status(500).json({ error: 'Erro ao alterar senha' })
  }
})

// Athletes routes
app.get('/api/athletes', async (req, res) => {
  try {
    const consultancyId = req.query.consultancy_id
    const userId = req.query.user_id
    
    if (!consultancyId) {
      return res.status(400).json({ error: 'consultancy_id é obrigatório' })
    }
    
    let query = `
      SELECT a.*, u.name, u.email, u.avatar_url 
      FROM athletes a 
      JOIN users u ON a.user_id = u.id
      WHERE u.consultancy_id = ?
    `
    const params: (string | number)[] = [Number(consultancyId)]
    
    if (userId) {
      query += ' AND a.user_id = ?'
      params.push(Number(userId))
    }
    
    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.get('/api/athletes/:id', async (req, res) => {
  try {
    const consultancyId = req.query.consultancy_id
    
    let query = `SELECT a.*, u.name, u.email, u.avatar_url, u.consultancy_id
       FROM athletes a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.id = ?`
    const params: (string | number)[] = [req.params.id]
    
    // Se consultancy_id for passado, garantir que o atleta pertence à consultoria
    if (consultancyId) {
      query += ' AND u.consultancy_id = ?'
      params.push(consultancyId as string)
    }
    
    const [rows] = await pool.query(query, params)
    const athletes = rows as Array<Record<string, unknown>>
    if (athletes.length === 0) {
      return res.status(404).json({ error: 'Athlete not found' })
    }
    res.json(athletes[0])
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Appointments routes
app.get('/api/appointments', async (req, res) => {
  try {
    const athleteId = req.query.athlete_id
    const consultancyId = req.query.consultancy_id
    
    let query = `
      SELECT ap.*, 
             a.id as athlete_id,
             u1.name as athlete_name,
             u2.name as professional_name
      FROM appointments ap
      JOIN athletes a ON ap.athlete_id = a.id
      JOIN users u1 ON a.user_id = u1.id
      JOIN users u2 ON ap.professional_id = u2.id
    `
    const params: (string | number)[] = []
    const conditions: string[] = []
    
    if (athleteId) {
      conditions.push('ap.athlete_id = ?')
      params.push(Number(athleteId))
    }
    
    if (consultancyId) {
      conditions.push('u2.consultancy_id = ?')
      params.push(Number(consultancyId))
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    
    query += ' ORDER BY ap.scheduled_at ASC'
    
    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.post('/api/appointments', async (req, res) => {
  try {
    const { athlete_id, professional_id, type, title, description, scheduled_at, duration_minutes, location } = req.body
    const [result] = await pool.query(
      `INSERT INTO appointments (athlete_id, professional_id, type, title, description, scheduled_at, duration_minutes, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [athlete_id, professional_id, type, title, description, scheduled_at, duration_minutes || 60, location]
    )
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Appointment created' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Training plans routes
app.get('/api/training-plans', async (req, res) => {
  try {
    const athleteId = req.query.athlete_id
    const consultancyId = req.query.consultancy_id
    
    let query = `
      SELECT tp.*, u.name as coach_name
      FROM training_plans tp
      JOIN users u ON tp.coach_id = u.id
    `
    const params: (string | number)[] = []
    const conditions: string[] = []
    
    if (athleteId) {
      conditions.push('tp.athlete_id = ?')
      params.push(Number(athleteId))
    }
    
    // Filtrar por consultoria (através do coach)
    if (consultancyId) {
      conditions.push('u.consultancy_id = ?')
      params.push(Number(consultancyId))
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    
    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Nutrition plans routes
app.get('/api/nutrition-plans', async (req, res) => {
  try {
    const athleteId = req.query.athlete_id
    const consultancyId = req.query.consultancy_id
    
    let query = `
      SELECT np.*, u.name as nutritionist_name
      FROM nutrition_plans np
      JOIN users u ON np.nutritionist_id = u.id
    `
    const params: (string | number)[] = []
    const conditions: string[] = []
    
    if (athleteId) {
      conditions.push('np.athlete_id = ?')
      params.push(Number(athleteId))
    }
    
    if (consultancyId) {
      conditions.push('u.consultancy_id = ?')
      params.push(Number(consultancyId))
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    
    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Progress routes
app.get('/api/progress', async (req, res) => {
  try {
    const athleteId = req.query.athlete_id
    if (!athleteId) {
      return res.status(400).json({ error: 'athlete_id is required' })
    }
    
    const [rows] = await pool.query(
      `SELECT * FROM athlete_progress WHERE athlete_id = ? ORDER BY record_date DESC`,
      [athleteId]
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.post('/api/progress', async (req, res) => {
  try {
    const { athlete_id, record_date, weight, body_fat_percentage, muscle_mass, notes, metrics } = req.body
    const [result] = await pool.query(
      `INSERT INTO athlete_progress (athlete_id, record_date, weight, body_fat_percentage, muscle_mass, notes, metrics)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [athlete_id, record_date, weight, body_fat_percentage, muscle_mass, notes, JSON.stringify(metrics)]
    )
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Progress recorded' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// ===============================
// BIBLIOTECA DE EXERCÍCIOS
// ===============================

// Listar todos os exercícios (globais + da consultoria)
app.get('/api/exercise-library', async (req, res) => {
  try {
    const consultancyId = req.query.consultancy_id
    const muscleGroup = req.query.muscle_group
    const search = req.query.search
    
    // Mostrar apenas exercícios da consultoria específica
    // Se não tiver consultancy_id, retorna vazio (segurança)
    if (!consultancyId) {
      return res.json([])
    }
    
    let query = `
      SELECT * FROM exercise_library 
      WHERE consultancy_id = ?
    `
    const params: (string | number)[] = [Number(consultancyId)]
    
    if (muscleGroup) {
      query += ' AND muscle_group = ?'
      params.push(String(muscleGroup))
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }
    
    query += ' ORDER BY muscle_group, name'
    
    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Buscar exercício por ID
app.get('/api/exercise-library/:id', async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM exercise_library WHERE id = ?',
      [req.params.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Exercício não encontrado' })
    }
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Criar exercício na biblioteca
app.post('/api/exercise-library', async (req, res) => {
  try {
    const { 
      consultancy_id, name, description, muscle_group, secondary_muscle,
      equipment, difficulty, video_url, image_url, instructions, tips
    } = req.body

    // Validar que consultancy_id foi fornecido
    if (!consultancy_id) {
      return res.status(400).json({ error: 'consultancy_id é obrigatório' })
    }

    const [result] = await pool.query(
      `INSERT INTO exercise_library 
       (consultancy_id, name, description, muscle_group, secondary_muscle, equipment, difficulty, video_url, image_url, instructions, tips, is_global)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
      [consultancy_id, name, description, muscle_group, secondary_muscle, 
       equipment || 'peso_corporal', difficulty || 'intermediario', 
       video_url, image_url, instructions, tips]
    )
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Exercício criado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Atualizar exercício na biblioteca
app.put('/api/exercise-library/:id', async (req, res) => {
  try {
    const { 
      consultancy_id, name, description, muscle_group, secondary_muscle,
      equipment, difficulty, video_url, image_url, instructions, tips
    } = req.body

    // Validar que o exercício pertence à consultoria
    if (!consultancy_id) {
      return res.status(400).json({ error: 'consultancy_id é obrigatório' })
    }

    // Verificar se o exercício pertence à consultoria
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM exercise_library WHERE id = ? AND consultancy_id = ?',
      [req.params.id, consultancy_id]
    )
    if (existing.length === 0) {
      return res.status(403).json({ error: 'Você não tem permissão para editar este exercício' })
    }

    await pool.query(
      `UPDATE exercise_library SET 
       name = ?, description = ?, muscle_group = ?, secondary_muscle = ?,
       equipment = ?, difficulty = ?, video_url = ?, image_url = ?, instructions = ?, tips = ?
       WHERE id = ? AND consultancy_id = ?`,
      [name, description, muscle_group, secondary_muscle, equipment, difficulty, 
       video_url, image_url, instructions, tips, req.params.id, consultancy_id]
    )
    res.json({ message: 'Exercício atualizado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Excluir exercício da biblioteca
app.delete('/api/exercise-library/:id', async (req, res) => {
  try {
    const consultancy_id = req.query.consultancy_id
    
    if (!consultancy_id) {
      return res.status(400).json({ error: 'consultancy_id é obrigatório' })
    }
    
    // Verificar se o exercício pertence à consultoria
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, consultancy_id FROM exercise_library WHERE id = ?',
      [req.params.id]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Exercício não encontrado' })
    }
    
    if (rows[0].consultancy_id !== Number(consultancy_id)) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este exercício' })
    }
    
    await pool.query('DELETE FROM exercise_library WHERE id = ? AND consultancy_id = ?', [req.params.id, consultancy_id])
    res.json({ message: 'Exercício excluído' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Listar grupos musculares disponíveis
app.get('/api/muscle-groups', async (_req, res) => {
  const muscleGroups = [
    { id: 'peito', name: 'Peito', icon: '🫁' },
    { id: 'costas', name: 'Costas', icon: '🔙' },
    { id: 'ombros', name: 'Ombros', icon: '💪' },
    { id: 'biceps', name: 'Bíceps', icon: '💪' },
    { id: 'triceps', name: 'Tríceps', icon: '💪' },
    { id: 'antebraco', name: 'Antebraço', icon: '🦾' },
    { id: 'abdomen', name: 'Abdomen', icon: '🎯' },
    { id: 'quadriceps', name: 'Quadríceps', icon: '🦵' },
    { id: 'posterior', name: 'Posterior', icon: '🦵' },
    { id: 'gluteos', name: 'Glúteos', icon: '🍑' },
    { id: 'panturrilha', name: 'Panturrilha', icon: '🦶' },
    { id: 'corpo_todo', name: 'Corpo Todo', icon: '🏋️' },
    { id: 'cardio', name: 'Cardio', icon: '❤️' },
  ]
  res.json(muscleGroups)
})

// ===============================
// TRAINING PLANS - CRUD Completo (campos atualizados)
// ===============================

app.post('/api/training-plans', async (req, res) => {
  try {
    const { 
      athlete_id, coach_id, name, description, objective, duration_weeks,
      frequency_per_week, level, split_type, start_date, end_date, status 
    } = req.body
    
    const [result] = await pool.query(
      `INSERT INTO training_plans 
       (athlete_id, coach_id, name, description, objective, duration_weeks, frequency_per_week, level, split_type, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [athlete_id, coach_id, name, description, objective || 'hipertrofia', 
       duration_weeks || 4, frequency_per_week || 4, level || 'intermediario',
       split_type, start_date, end_date, status || 'active']
    )
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Plano criado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.put('/api/training-plans/:id', async (req, res) => {
  try {
    const { 
      name, description, objective, duration_weeks, frequency_per_week,
      level, split_type, start_date, end_date, status 
    } = req.body
    
    await pool.query(
      `UPDATE training_plans SET 
       name = ?, description = ?, objective = ?, duration_weeks = ?, frequency_per_week = ?,
       level = ?, split_type = ?, start_date = ?, end_date = ?, status = ?
       WHERE id = ?`,
      [name, description, objective, duration_weeks, frequency_per_week,
       level, split_type, start_date, end_date, status, req.params.id]
    )
    res.json({ message: 'Plano atualizado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.delete('/api/training-plans/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM training_plans WHERE id = ?', [req.params.id])
    res.json({ message: 'Plano excluído' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// ===============================
// TRAINING DAYS - CRUD
// ===============================

app.get('/api/training-days', async (req, res) => {
  try {
    const planId = req.query.plan_id
    if (!planId) {
      return res.status(400).json({ error: 'plan_id é obrigatório' })
    }
    const [rows] = await pool.query(
      'SELECT * FROM training_days WHERE plan_id = ? ORDER BY order_index',
      [planId]
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.post('/api/training-days', async (req, res) => {
  try {
    const { plan_id, day_letter, day_name, day_of_week, focus_muscles, estimated_duration, order_index } = req.body
    const [result] = await pool.query(
      `INSERT INTO training_days (plan_id, day_letter, day_name, day_of_week, focus_muscles, estimated_duration, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [plan_id, day_letter, day_name, day_of_week, focus_muscles, estimated_duration || 60, order_index || 0]
    )
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Dia criado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.put('/api/training-days/:id', async (req, res) => {
  try {
    const { day_letter, day_name, day_of_week, focus_muscles, estimated_duration, order_index } = req.body
    await pool.query(
      `UPDATE training_days SET day_letter = ?, day_name = ?, day_of_week = ?, focus_muscles = ?, estimated_duration = ?, order_index = ? WHERE id = ?`,
      [day_letter, day_name, day_of_week, focus_muscles, estimated_duration, order_index, req.params.id]
    )
    res.json({ message: 'Dia atualizado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.delete('/api/training-days/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM training_days WHERE id = ?', [req.params.id])
    res.json({ message: 'Dia excluído' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// ===============================
// TRAINING EXERCISES - CRUD (campos atualizados)
// ===============================

app.get('/api/training-exercises', async (req, res) => {
  try {
    const planId = req.query.plan_id
    const dayId = req.query.day_id
    
    if (!planId && !dayId) {
      return res.status(400).json({ error: 'plan_id ou day_id é obrigatório' })
    }
    
    let query = `
      SELECT te.*, el.video_url as library_video_url, el.instructions as library_instructions
      FROM training_exercises te
      LEFT JOIN exercise_library el ON te.exercise_library_id = el.id
      WHERE 1=1
    `
    const params: (string | number)[] = []
    
    if (planId) {
      query += ' AND te.plan_id = ?'
      params.push(Number(planId))
    }
    if (dayId) {
      query += ' AND te.training_day_id = ?'
      params.push(Number(dayId))
    }
    
    query += ' ORDER BY te.training_day_id, te.order_index'
    
    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.post('/api/training-exercises', async (req, res) => {
  try {
    const { 
      plan_id, training_day_id, exercise_library_id, name, muscle_group, equipment,
      sets, reps, weight, rest_seconds, tempo, technique, technique_details,
      rpe, rir, video_url, order_index, superset_group, notes, day_of_week
    } = req.body
    
    const [result] = await pool.query(
      `INSERT INTO training_exercises 
       (plan_id, training_day_id, exercise_library_id, name, muscle_group, equipment,
        sets, reps, weight, rest_seconds, tempo, technique, technique_details,
        rpe, rir, video_url, order_index, superset_group, notes, day_of_week)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [plan_id, training_day_id, exercise_library_id, name, muscle_group || 'peito', equipment || 'barra',
       sets || 3, reps, weight, rest_seconds || 60, tempo, technique || 'normal', technique_details,
       rpe, rir, video_url, order_index || 0, superset_group, notes, day_of_week]
    )
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Exercício adicionado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.put('/api/training-exercises/:id', async (req, res) => {
  try {
    const { 
      training_day_id, exercise_library_id, name, muscle_group, equipment,
      sets, reps, weight, rest_seconds, tempo, technique, technique_details,
      rpe, rir, video_url, order_index, superset_group, notes, day_of_week
    } = req.body
    
    await pool.query(
      `UPDATE training_exercises SET 
       training_day_id = ?, exercise_library_id = ?, name = ?, muscle_group = ?, equipment = ?,
       sets = ?, reps = ?, weight = ?, rest_seconds = ?, tempo = ?, technique = ?, technique_details = ?,
       rpe = ?, rir = ?, video_url = ?, order_index = ?, superset_group = ?, notes = ?, day_of_week = ?
       WHERE id = ?`,
      [training_day_id, exercise_library_id, name, muscle_group, equipment,
       sets, reps, weight, rest_seconds, tempo, technique, technique_details,
       rpe, rir, video_url, order_index, superset_group, notes, day_of_week, req.params.id]
    )
    res.json({ message: 'Exercício atualizado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.delete('/api/training-exercises/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM training_exercises WHERE id = ?', [req.params.id])
    res.json({ message: 'Exercício excluído' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// ===============================
// NUTRITION PLANS - CRUD Completo
// ===============================

app.post('/api/nutrition-plans', async (req, res) => {
  try {
    const { athlete_id, nutritionist_id, name, description, daily_calories, protein_grams, carbs_grams, fat_grams, start_date, end_date, status } = req.body
    const [result] = await pool.query(
      `INSERT INTO nutrition_plans (athlete_id, nutritionist_id, name, description, daily_calories, protein_grams, carbs_grams, fat_grams, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [athlete_id, nutritionist_id, name, description, daily_calories, protein_grams, carbs_grams, fat_grams, start_date, end_date, status || 'active']
    )
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Plano nutricional criado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.put('/api/nutrition-plans/:id', async (req, res) => {
  try {
    const { name, description, daily_calories, protein_grams, carbs_grams, fat_grams, start_date, end_date, status } = req.body
    await pool.query(
      `UPDATE nutrition_plans SET name = ?, description = ?, daily_calories = ?, protein_grams = ?, carbs_grams = ?, fat_grams = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?`,
      [name, description, daily_calories, protein_grams, carbs_grams, fat_grams, start_date, end_date, status, req.params.id]
    )
    res.json({ message: 'Plano atualizado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.delete('/api/nutrition-plans/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM nutrition_plans WHERE id = ?', [req.params.id])
    res.json({ message: 'Plano excluído' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Meals
app.get('/api/meals', async (req, res) => {
  try {
    const planId = req.query.plan_id
    if (!planId) {
      return res.status(400).json({ error: 'plan_id é obrigatório' })
    }
    const [rows] = await pool.query('SELECT * FROM meals WHERE plan_id = ? ORDER BY time', [planId])
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.post('/api/meals', async (req, res) => {
  try {
    const { plan_id, name, time, description, order_index } = req.body
    const [result] = await pool.query(
      `INSERT INTO meals (plan_id, name, time, description, order_index) VALUES (?, ?, ?, ?, ?)`,
      [plan_id, name, time, description, order_index || 0]
    )
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Refeição adicionada' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.put('/api/meals/:id', async (req, res) => {
  try {
    const { name, time, description, order_index } = req.body
    await pool.query(
      `UPDATE meals SET name = ?, time = ?, description = ?, order_index = ? WHERE id = ?`,
      [name, time, description, order_index, req.params.id]
    )
    res.json({ message: 'Refeição atualizada' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.delete('/api/meals/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM meals WHERE id = ?', [req.params.id])
    res.json({ message: 'Refeição excluída' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// ===============================
// BIBLIOTECA DE ALIMENTOS
// ===============================

// Listar alimentos da consultoria (igual exercícios)
app.get('/api/food-library', async (req, res) => {
  try {
    const consultancyId = req.query.consultancy_id
    const category = req.query.category
    const search = req.query.search
    
    // Mostrar apenas alimentos da consultoria específica
    if (!consultancyId) {
      return res.json([])
    }
    
    let query = `SELECT * FROM food_library WHERE consultancy_id = ?`
    const params: (string | number)[] = [Number(consultancyId)]
    
    if (category) {
      query += ' AND category = ?'
      params.push(String(category))
    }
    
    if (search) {
      query += ' AND name LIKE ?'
      params.push(`%${search}%`)
    }
    
    query += ' ORDER BY category, name'
    
    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Buscar alimento por ID
app.get('/api/food-library/:id', async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM food_library WHERE id = ?',
      [req.params.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Alimento não encontrado' })
    }
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Criar alimento na biblioteca
app.post('/api/food-library', async (req, res) => {
  try {
    const { consultancy_id, name, description, category, serving_size, calories, protein, carbs, fat, fiber, sodium, image_url } = req.body
    
    if (!consultancy_id) {
      return res.status(400).json({ error: 'consultancy_id é obrigatório' })
    }
    
    const [result] = await pool.query(
      `INSERT INTO food_library (consultancy_id, name, description, category, serving_size, calories, protein, carbs, fat, fiber, sodium, image_url, is_global)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
      [consultancy_id, name, description, category || 'outros', serving_size || '100g', calories || 0, protein || 0, carbs || 0, fat || 0, fiber || 0, sodium || 0, image_url]
    )
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Alimento adicionado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Importar alimentos da Tabela TACO para uma consultoria
app.post('/api/food-library/import-taco', async (req, res) => {
  try {
    const { consultancy_id } = req.body
    
    if (!consultancy_id) {
      return res.status(400).json({ error: 'consultancy_id é obrigatório' })
    }

    // Dados da Tabela TACO (fonte: NEPA/UNICAMP)
    // Categorias mapeadas para o ENUM do banco: proteina, carboidrato, gordura, vegetal, fruta, lacteo, bebida, suplemento, outros
    const tacoFoods = [
      // CEREAIS E DERIVADOS -> carboidrato
      { name: 'Arroz integral cozido', category: 'carboidrato', serving_size: '100g', portion_description: '4 colheres de sopa', calories: 124, protein: 2.6, carbs: 25.8, fat: 1.0, fiber: 2.7, sugar: 0.3, glycemic_index: 50, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 1 },
      { name: 'Arroz branco cozido', category: 'carboidrato', serving_size: '100g', portion_description: '4 colheres de sopa', calories: 128, protein: 2.5, carbs: 28.1, fat: 0.2, fiber: 1.6, sugar: 0.1, glycemic_index: 73, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 2 },
      { name: 'Aveia em flocos', category: 'carboidrato', serving_size: '100g', portion_description: '10 colheres de sopa', calories: 394, protein: 14.0, carbs: 66.6, fat: 8.5, fiber: 9.1, sugar: 0.9, glycemic_index: 55, has_gluten: true, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 4 },
      { name: 'Farinha de mandioca crua', category: 'carboidrato', serving_size: '100g', portion_description: '5 colheres de sopa', calories: 361, protein: 1.6, carbs: 87.9, fat: 0.3, fiber: 6.4, sugar: 0.3, glycemic_index: 70, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 6 },
      { name: 'Macarrão cozido', category: 'carboidrato', serving_size: '100g', portion_description: '1 prato raso', calories: 102, protein: 3.4, carbs: 19.9, fat: 0.5, fiber: 1.2, sugar: 0.2, glycemic_index: 55, has_gluten: true, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 10 },
      { name: 'Pão francês', category: 'carboidrato', serving_size: '100g', portion_description: '2 unidades', calories: 300, protein: 8.0, carbs: 58.6, fat: 3.1, fiber: 2.3, sugar: 2.8, glycemic_index: 95, has_gluten: true, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 13 },
      { name: 'Pão integral', category: 'carboidrato', serving_size: '100g', portion_description: '4 fatias', calories: 253, protein: 9.4, carbs: 49.9, fat: 2.9, fiber: 6.9, sugar: 4.1, glycemic_index: 65, has_gluten: true, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 14 },
      { name: 'Quinoa cozida', category: 'carboidrato', serving_size: '100g', portion_description: '4 colheres de sopa', calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8, sugar: 0.9, glycemic_index: 53, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 16 },
      { name: 'Batata inglesa cozida', category: 'carboidrato', serving_size: '100g', portion_description: '1 unidade média', calories: 52, protein: 1.2, carbs: 11.9, fat: 0.1, fiber: 1.3, sugar: 0.8, glycemic_index: 78, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 206 },
      { name: 'Batata doce cozida', category: 'carboidrato', serving_size: '100g', portion_description: '1 unidade média', calories: 77, protein: 0.6, carbs: 18.4, fat: 0.1, fiber: 2.2, sugar: 5.7, glycemic_index: 63, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 207 },
      { name: 'Mandioca cozida', category: 'carboidrato', serving_size: '100g', portion_description: '2 pedaços médios', calories: 125, protein: 0.6, carbs: 30.1, fat: 0.3, fiber: 1.6, sugar: 1.4, glycemic_index: 55, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 216 },
      
      // LEGUMINOSAS -> proteina
      { name: 'Feijão carioca cozido', category: 'proteina', serving_size: '100g', portion_description: '1 concha média', calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 8.5, sugar: 0.3, glycemic_index: 30, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 101 },
      { name: 'Feijão preto cozido', category: 'proteina', serving_size: '100g', portion_description: '1 concha média', calories: 77, protein: 4.5, carbs: 14.0, fat: 0.5, fiber: 8.4, sugar: 0.3, glycemic_index: 30, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 102 },
      { name: 'Grão-de-bico cozido', category: 'proteina', serving_size: '100g', portion_description: '4 colheres de sopa', calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6, sugar: 4.8, glycemic_index: 33, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 104 },
      { name: 'Lentilha cozida', category: 'proteina', serving_size: '100g', portion_description: '4 colheres de sopa', calories: 116, protein: 9.0, carbs: 20.1, fat: 0.4, fiber: 7.9, sugar: 1.8, glycemic_index: 30, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 105 },
      
      // VERDURAS E LEGUMES -> vegetal
      { name: 'Brócolis cozido', category: 'vegetal', serving_size: '100g', portion_description: '4 colheres de sopa', calories: 25, protein: 2.1, carbs: 4.4, fat: 0.3, fiber: 3.4, sugar: 1.4, glycemic_index: 10, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 210 },
      { name: 'Cenoura crua', category: 'vegetal', serving_size: '100g', portion_description: '1 unidade média', calories: 34, protein: 1.3, carbs: 7.7, fat: 0.2, fiber: 3.2, sugar: 3.2, glycemic_index: 47, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 211 },
      { name: 'Tomate cru', category: 'vegetal', serving_size: '100g', portion_description: '1 unidade média', calories: 15, protein: 1.1, carbs: 3.1, fat: 0.2, fiber: 1.2, sugar: 2.6, glycemic_index: 30, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 220 },
      { name: 'Alface crespa', category: 'vegetal', serving_size: '100g', portion_description: '1 prato cheio', calories: 11, protein: 1.3, carbs: 1.7, fat: 0.2, fiber: 1.8, sugar: 0.5, glycemic_index: 10, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 204 },
      { name: 'Espinafre refogado', category: 'vegetal', serving_size: '100g', portion_description: '4 colheres de sopa', calories: 57, protein: 2.6, carbs: 3.8, fat: 4.0, fiber: 2.5, sugar: 0.4, glycemic_index: 15, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 215 },
      { name: 'Abobrinha cozida', category: 'vegetal', serving_size: '100g', portion_description: '4 colheres de sopa', calories: 15, protein: 0.6, carbs: 3.3, fat: 0.1, fiber: 1.3, sugar: 1.5, glycemic_index: 15, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 202 },
      
      // FRUTAS -> fruta
      { name: 'Abacate', category: 'fruta', serving_size: '100g', portion_description: '4 colheres de sopa', calories: 96, protein: 1.2, carbs: 6.0, fat: 8.4, fiber: 6.3, sugar: 0.3, glycemic_index: 10, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 301 },
      { name: 'Banana prata', category: 'fruta', serving_size: '100g', portion_description: '1 unidade média', calories: 98, protein: 1.3, carbs: 26.0, fat: 0.1, fiber: 2.0, sugar: 15.9, glycemic_index: 55, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 304 },
      { name: 'Laranja pera', category: 'fruta', serving_size: '100g', portion_description: '1 unidade média', calories: 37, protein: 1.0, carbs: 8.9, fat: 0.1, fiber: 0.8, sugar: 8.6, glycemic_index: 42, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 309 },
      { name: 'Maçã fuji', category: 'fruta', serving_size: '100g', portion_description: '1 unidade pequena', calories: 56, protein: 0.3, carbs: 15.2, fat: 0.0, fiber: 1.3, sugar: 10.4, glycemic_index: 38, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 311 },
      { name: 'Mamão papaya', category: 'fruta', serving_size: '100g', portion_description: '1 fatia média', calories: 45, protein: 0.5, carbs: 11.6, fat: 0.1, fiber: 1.0, sugar: 9.1, glycemic_index: 60, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 312 },
      { name: 'Morango', category: 'fruta', serving_size: '100g', portion_description: '10 unidades médias', calories: 30, protein: 0.9, carbs: 6.8, fat: 0.3, fiber: 1.7, sugar: 4.1, glycemic_index: 40, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 317 },
      { name: 'Melancia', category: 'fruta', serving_size: '100g', portion_description: '1 fatia média', calories: 33, protein: 0.9, carbs: 8.1, fat: 0.0, fiber: 0.1, sugar: 6.2, glycemic_index: 72, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 315 },
      { name: 'Abacaxi', category: 'fruta', serving_size: '100g', portion_description: '1 fatia grossa', calories: 48, protein: 0.9, carbs: 12.3, fat: 0.1, fiber: 1.0, sugar: 9.3, glycemic_index: 66, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 302 },
      
      // CARNES -> proteina
      { name: 'Frango peito sem pele grelhado', category: 'proteina', serving_size: '100g', portion_description: '1 filé médio', calories: 159, protein: 32.0, carbs: 0.0, fat: 3.2, fiber: 0.0, sugar: 0.0, glycemic_index: 0, has_gluten: false, has_lactose: false, is_vegan: false, is_vegetarian: false, taco_id: 401 },
      { name: 'Carne bovina patinho grelhado', category: 'proteina', serving_size: '100g', portion_description: '1 bife médio', calories: 219, protein: 35.9, carbs: 0.0, fat: 7.3, fiber: 0.0, sugar: 0.0, glycemic_index: 0, has_gluten: false, has_lactose: false, is_vegan: false, is_vegetarian: false, taco_id: 403 },
      { name: 'Carne bovina alcatra grelhada', category: 'proteina', serving_size: '100g', portion_description: '1 bife médio', calories: 195, protein: 32.0, carbs: 0.0, fat: 7.1, fiber: 0.0, sugar: 0.0, glycemic_index: 0, has_gluten: false, has_lactose: false, is_vegan: false, is_vegetarian: false, taco_id: 405 },
      { name: 'Carne suína lombo assado', category: 'proteina', serving_size: '100g', portion_description: '2 fatias médias', calories: 210, protein: 27.8, carbs: 0.0, fat: 10.8, fiber: 0.0, sugar: 0.0, glycemic_index: 0, has_gluten: false, has_lactose: false, is_vegan: false, is_vegetarian: false, taco_id: 411 },
      { name: 'Ovo de galinha cozido', category: 'proteina', serving_size: '100g', portion_description: '2 unidades', calories: 146, protein: 13.3, carbs: 0.6, fat: 9.5, fiber: 0.0, sugar: 0.6, glycemic_index: 0, has_gluten: false, has_lactose: false, is_vegan: false, is_vegetarian: true, taco_id: 415 },
      { name: 'Atum em conserva', category: 'proteina', serving_size: '100g', portion_description: '1 lata drenada', calories: 166, protein: 26.2, carbs: 0.0, fat: 6.4, fiber: 0.0, sugar: 0.0, glycemic_index: 0, has_gluten: false, has_lactose: false, is_vegan: false, is_vegetarian: false, taco_id: 501 },
      { name: 'Salmão grelhado', category: 'proteina', serving_size: '100g', portion_description: '1 filé pequeno', calories: 243, protein: 26.1, carbs: 0.0, fat: 15.6, fiber: 0.0, sugar: 0.0, glycemic_index: 0, has_gluten: false, has_lactose: false, is_vegan: false, is_vegetarian: false, taco_id: 502 },
      { name: 'Tilápia grelhada', category: 'proteina', serving_size: '100g', portion_description: '1 filé médio', calories: 128, protein: 26.2, carbs: 0.0, fat: 2.7, fiber: 0.0, sugar: 0.0, glycemic_index: 0, has_gluten: false, has_lactose: false, is_vegan: false, is_vegetarian: false, taco_id: 503 },
      
      // LATICÍNIOS -> lacteo
      { name: 'Leite integral', category: 'lacteo', serving_size: '100ml', portion_description: '1/2 copo', calories: 61, protein: 3.2, carbs: 4.5, fat: 3.5, fiber: 0.0, sugar: 4.5, glycemic_index: 31, has_gluten: false, has_lactose: true, is_vegan: false, is_vegetarian: true, taco_id: 601 },
      { name: 'Leite desnatado', category: 'lacteo', serving_size: '100ml', portion_description: '1/2 copo', calories: 35, protein: 3.4, carbs: 5.0, fat: 0.1, fiber: 0.0, sugar: 5.0, glycemic_index: 32, has_gluten: false, has_lactose: true, is_vegan: false, is_vegetarian: true, taco_id: 602 },
      { name: 'Iogurte natural', category: 'lacteo', serving_size: '100g', portion_description: '1 pote pequeno', calories: 51, protein: 4.1, carbs: 6.1, fat: 0.9, fiber: 0.0, sugar: 6.1, glycemic_index: 35, has_gluten: false, has_lactose: true, is_vegan: false, is_vegetarian: true, taco_id: 603 },
      { name: 'Queijo minas frescal', category: 'lacteo', serving_size: '100g', portion_description: '4 fatias', calories: 264, protein: 17.4, carbs: 3.2, fat: 20.2, fiber: 0.0, sugar: 3.2, glycemic_index: 0, has_gluten: false, has_lactose: true, is_vegan: false, is_vegetarian: true, taco_id: 604 },
      { name: 'Queijo mussarela', category: 'lacteo', serving_size: '100g', portion_description: '4 fatias', calories: 330, protein: 22.6, carbs: 3.0, fat: 25.2, fiber: 0.0, sugar: 1.0, glycemic_index: 0, has_gluten: false, has_lactose: true, is_vegan: false, is_vegetarian: true, taco_id: 605 },
      { name: 'Ricota', category: 'lacteo', serving_size: '100g', portion_description: '4 colheres de sopa', calories: 140, protein: 12.6, carbs: 3.8, fat: 8.1, fiber: 0.0, sugar: 0.3, glycemic_index: 0, has_gluten: false, has_lactose: true, is_vegan: false, is_vegetarian: true, taco_id: 606 },
      { name: 'Cottage', category: 'lacteo', serving_size: '100g', portion_description: '4 colheres de sopa', calories: 98, protein: 11.1, carbs: 3.4, fat: 4.3, fiber: 0.0, sugar: 2.7, glycemic_index: 0, has_gluten: false, has_lactose: true, is_vegan: false, is_vegetarian: true, taco_id: 607 },
      
      // GORDURAS E ÓLEOS -> gordura
      { name: 'Azeite de oliva', category: 'gordura', serving_size: '100ml', portion_description: '7 colheres de sopa', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0.0, sugar: 0.0, glycemic_index: 0, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 701 },
      { name: 'Óleo de coco', category: 'gordura', serving_size: '100ml', portion_description: '7 colheres de sopa', calories: 862, protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0.0, sugar: 0.0, glycemic_index: 0, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 702 },
      { name: 'Manteiga', category: 'gordura', serving_size: '100g', portion_description: '7 colheres de sopa', calories: 726, protein: 0.5, carbs: 0.0, fat: 82.0, fiber: 0.0, sugar: 0.0, glycemic_index: 0, has_gluten: false, has_lactose: true, is_vegan: false, is_vegetarian: true, taco_id: 703 },
      { name: 'Castanha de caju', category: 'gordura', serving_size: '100g', portion_description: '30 unidades', calories: 570, protein: 18.5, carbs: 29.1, fat: 46.3, fiber: 3.7, sugar: 5.0, glycemic_index: 22, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 704 },
      { name: 'Amendoim torrado', category: 'gordura', serving_size: '100g', portion_description: '2 punhados', calories: 589, protein: 27.2, carbs: 20.3, fat: 49.4, fiber: 8.0, sugar: 4.1, glycemic_index: 14, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 705 },
      { name: 'Pasta de amendoim', category: 'gordura', serving_size: '100g', portion_description: '5 colheres de sopa', calories: 593, protein: 22.2, carbs: 22.3, fat: 49.2, fiber: 6.0, sugar: 9.2, glycemic_index: 14, has_gluten: false, has_lactose: false, is_vegan: true, is_vegetarian: true, taco_id: 706 },
    ]

    // Verificar quantos já existem
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM food_library WHERE consultancy_id = ? AND taco_id IS NOT NULL',
      [consultancy_id]
    )

    if (existing[0].count > 0) {
      return res.json({ imported: 0, message: 'Alimentos TACO já foram importados anteriormente' })
    }

    // Inserir todos os alimentos
    let imported = 0
    for (const food of tacoFoods) {
      await pool.query(
        `INSERT INTO food_library 
         (consultancy_id, name, category, serving_size, portion_description, calories, protein, carbs, fat, fiber, sugar, glycemic_index, has_gluten, has_lactose, is_vegan, is_vegetarian, taco_id, is_global)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
        [consultancy_id, food.name, food.category, food.serving_size, food.portion_description, food.calories, food.protein, food.carbs, food.fat, food.fiber, food.sugar, food.glycemic_index, food.has_gluten, food.has_lactose, food.is_vegan, food.is_vegetarian, food.taco_id]
      )
      imported++
    }

    res.json({ imported, message: `${imported} alimentos da tabela TACO importados com sucesso` })
  } catch (error) {
    console.error('Erro ao importar TACO:', error)
    res.status(500).json({ error: String(error) })
  }
})

// Atualizar alimento na biblioteca
app.put('/api/food-library/:id', async (req, res) => {
  try {
    const { consultancy_id, name, description, category, serving_size, calories, protein, carbs, fat, fiber, sodium, image_url } = req.body
    
    if (!consultancy_id) {
      return res.status(400).json({ error: 'consultancy_id é obrigatório' })
    }
    
    // Verificar se o alimento pertence à consultoria
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM food_library WHERE id = ? AND consultancy_id = ?',
      [req.params.id, consultancy_id]
    )
    if (existing.length === 0) {
      return res.status(403).json({ error: 'Você não tem permissão para editar este alimento' })
    }
    
    await pool.query(
      `UPDATE food_library SET name = ?, description = ?, category = ?, serving_size = ?, calories = ?, protein = ?, carbs = ?, fat = ?, fiber = ?, sodium = ?, image_url = ? WHERE id = ? AND consultancy_id = ?`,
      [name, description, category, serving_size, calories, protein, carbs, fat, fiber, sodium, image_url, req.params.id, consultancy_id]
    )
    res.json({ message: 'Alimento atualizado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Excluir alimento da biblioteca
app.delete('/api/food-library/:id', async (req, res) => {
  try {
    const consultancy_id = req.query.consultancy_id
    
    if (!consultancy_id) {
      return res.status(400).json({ error: 'consultancy_id é obrigatório' })
    }
    
    // Verificar se o alimento pertence à consultoria
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, consultancy_id FROM food_library WHERE id = ?',
      [req.params.id]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Alimento não encontrado' })
    }
    
    if (rows[0].consultancy_id !== Number(consultancy_id)) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este alimento' })
    }
    
    await pool.query('DELETE FROM food_library WHERE id = ? AND consultancy_id = ?', [req.params.id, consultancy_id])
    res.json({ message: 'Alimento excluído' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Listar categorias de alimentos disponíveis
app.get('/api/food-categories', async (_req, res) => {
  const categories = [
    { value: 'proteina', label: 'Proteínas' },
    { value: 'carboidrato', label: 'Carboidratos' },
    { value: 'gordura', label: 'Gorduras' },
    { value: 'vegetal', label: 'Vegetais' },
    { value: 'fruta', label: 'Frutas' },
    { value: 'lacteo', label: 'Laticínios' },
    { value: 'suplemento', label: 'Suplementos' },
    { value: 'bebida', label: 'Bebidas' },
    { value: 'outros', label: 'Outros' }
  ]
  res.json(categories)
})

// ===============================
// ALIMENTOS DA REFEIÇÃO (meal_foods)
// ===============================

app.get('/api/meal-foods', async (req, res) => {
  try {
    const mealId = req.query.meal_id
    if (!mealId) {
      return res.status(400).json({ error: 'meal_id é obrigatório' })
    }
    const [rows] = await pool.query(
      `SELECT mf.*, fl.name as food_library_name, fl.category, fl.image_url as food_image
       FROM meal_foods mf
       LEFT JOIN food_library fl ON mf.food_id = fl.id
       WHERE mf.meal_id = ?
       ORDER BY mf.order_index`,
      [mealId]
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.post('/api/meal-foods', async (req, res) => {
  try {
    const { meal_id, food_id, name, quantity, unit, calories, protein, carbs, fat, notes, order_index, option_group } = req.body
    const [result] = await pool.query(
      `INSERT INTO meal_foods (meal_id, food_id, name, quantity, unit, calories, protein, carbs, fat, notes, order_index, option_group)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [meal_id, food_id || null, name, quantity || 1, unit || 'porção', calories || 0, protein || 0, carbs || 0, fat || 0, notes, order_index || 0, option_group || 0]
    )
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Alimento adicionado à refeição' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.put('/api/meal-foods/:id', async (req, res) => {
  try {
    const { name, quantity, unit, calories, protein, carbs, fat, notes, order_index, option_group } = req.body
    await pool.query(
      `UPDATE meal_foods SET name = ?, quantity = ?, unit = ?, calories = ?, protein = ?, carbs = ?, fat = ?, notes = ?, order_index = ?, option_group = ? WHERE id = ?`,
      [name, quantity, unit, calories, protein, carbs, fat, notes, order_index, option_group || 0, req.params.id]
    )
    res.json({ message: 'Alimento atualizado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.delete('/api/meal-foods/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM meal_foods WHERE id = ?', [req.params.id])
    res.json({ message: 'Alimento removido da refeição' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// ===============================
// SUBSTITUIÇÕES DE ALIMENTOS
// ===============================

app.get('/api/food-substitutions', async (req, res) => {
  try {
    const mealFoodId = req.query.meal_food_id
    if (!mealFoodId) {
      return res.status(400).json({ error: 'meal_food_id é obrigatório' })
    }
    const [rows] = await pool.query(
      `SELECT fs.*, fl.name as food_library_name, fl.category
       FROM food_substitutions fs
       LEFT JOIN food_library fl ON fs.food_id = fl.id
       WHERE fs.meal_food_id = ?
       ORDER BY fs.order_index`,
      [mealFoodId]
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.post('/api/food-substitutions', async (req, res) => {
  try {
    const { meal_food_id, food_id, name, quantity, unit, calories, protein, carbs, fat, order_index } = req.body
    const [result] = await pool.query(
      `INSERT INTO food_substitutions (meal_food_id, food_id, name, quantity, unit, calories, protein, carbs, fat, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [meal_food_id, food_id || null, name, quantity || 1, unit || 'porção', calories || 0, protein || 0, carbs || 0, fat || 0, order_index || 0]
    )
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Substituição adicionada' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.delete('/api/food-substitutions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM food_substitutions WHERE id = ?', [req.params.id])
    res.json({ message: 'Substituição removida' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Buscar plano nutricional completo (com refeições e opções de alimentos)
app.get('/api/nutrition-plans/:id/complete', async (req, res) => {
  try {
    const planId = req.params.id
    
    // Buscar plano
    const [planRows] = await pool.query<RowDataPacket[]>(
      `SELECT np.*, u.name as nutritionist_name
       FROM nutrition_plans np
       JOIN users u ON np.nutritionist_id = u.id
       WHERE np.id = ?`,
      [planId]
    )
    
    if (planRows.length === 0) {
      return res.status(404).json({ error: 'Plano não encontrado' })
    }
    
    const plan = planRows[0]
    
    // Buscar refeições
    const [mealRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM meals WHERE plan_id = ? ORDER BY order_index, time',
      [planId]
    )
    
    // Para cada refeição, buscar alimentos agrupados por option_group
    const mealsWithFoods = await Promise.all(mealRows.map(async (meal: RowDataPacket) => {
      const [foodRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM meal_foods WHERE meal_id = ? ORDER BY option_group, order_index',
        [meal.id]
      )
      
      // Agrupar alimentos por option_group
      const optionGroups: Record<number, RowDataPacket[]> = {}
      foodRows.forEach((food: RowDataPacket) => {
        const group = food.option_group || 0
        if (!optionGroups[group]) optionGroups[group] = []
        optionGroups[group].push(food)
      })
      
      // Converter para array de opções
      const options = Object.entries(optionGroups).map(([groupNum, foods]) => ({
        optionNumber: Number(groupNum),
        label: Number(groupNum) === 0 ? 'Opção Principal' : `Substituição ${groupNum}`,
        foods: foods
      })).sort((a, b) => a.optionNumber - b.optionNumber)
      
      return { ...meal, options, foods: foodRows }
    }))
    
    res.json({ ...plan, meals: mealsWithFoods })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// ===============================
// MEDICAL RECORDS - CRUD Completo
// ===============================

app.get('/api/medical-records', async (req, res) => {
  try {
    const athleteId = req.query.athlete_id
    const consultancyId = req.query.consultancy_id
    
    let query = `
      SELECT mr.*, u.name as doctor_name
      FROM medical_records mr
      JOIN users u ON mr.doctor_id = u.id
    `
    const params: (string | number)[] = []
    const conditions: string[] = []
    
    if (athleteId) {
      conditions.push('mr.athlete_id = ?')
      params.push(Number(athleteId))
    }
    
    if (consultancyId) {
      conditions.push('u.consultancy_id = ?')
      params.push(Number(consultancyId))
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    
    query += ' ORDER BY mr.record_date DESC'
    
    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.post('/api/medical-records', async (req, res) => {
  try {
    const { athlete_id, doctor_id, record_date, type, title, description, diagnosis, treatment, attachments } = req.body
    const [result] = await pool.query(
      `INSERT INTO medical_records (athlete_id, doctor_id, record_date, type, title, description, diagnosis, treatment, attachments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [athlete_id, doctor_id, record_date, type, title, description, diagnosis, treatment, JSON.stringify(attachments || [])]
    )
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Registro criado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.put('/api/medical-records/:id', async (req, res) => {
  try {
    const { record_date, type, title, description, diagnosis, treatment, attachments } = req.body
    await pool.query(
      `UPDATE medical_records SET record_date = ?, type = ?, title = ?, description = ?, diagnosis = ?, treatment = ?, attachments = ? WHERE id = ?`,
      [record_date, type, title, description, diagnosis, treatment, JSON.stringify(attachments || []), req.params.id]
    )
    res.json({ message: 'Registro atualizado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.delete('/api/medical-records/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM medical_records WHERE id = ?', [req.params.id])
    res.json({ message: 'Registro excluído' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// ===============================
// REHAB SESSIONS - CRUD Completo
// ===============================

app.get('/api/rehab-sessions', async (req, res) => {
  try {
    const athleteId = req.query.athlete_id
    const consultancyId = req.query.consultancy_id
    
    let query = `
      SELECT rs.*, u.name as physio_name
      FROM rehab_sessions rs
      JOIN users u ON rs.physio_id = u.id
    `
    const params: (string | number)[] = []
    const conditions: string[] = []
    
    if (athleteId) {
      conditions.push('rs.athlete_id = ?')
      params.push(Number(athleteId))
    }
    
    if (consultancyId) {
      conditions.push('u.consultancy_id = ?')
      params.push(Number(consultancyId))
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    
    query += ' ORDER BY rs.session_date DESC'
    
    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.post('/api/rehab-sessions', async (req, res) => {
  try {
    const { athlete_id, physio_id, session_date, injury_description, treatment, exercises, progress_notes, next_session, status } = req.body
    const [result] = await pool.query(
      `INSERT INTO rehab_sessions (athlete_id, physio_id, session_date, injury_description, treatment, exercises, progress_notes, next_session, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [athlete_id, physio_id, session_date, injury_description, treatment, exercises, progress_notes, next_session, status || 'scheduled']
    )
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Sessão criada' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.put('/api/rehab-sessions/:id', async (req, res) => {
  try {
    const { session_date, injury_description, treatment, exercises, progress_notes, next_session, status } = req.body
    await pool.query(
      `UPDATE rehab_sessions SET session_date = ?, injury_description = ?, treatment = ?, exercises = ?, progress_notes = ?, next_session = ?, status = ? WHERE id = ?`,
      [session_date, injury_description, treatment, exercises, progress_notes, next_session, status, req.params.id]
    )
    res.json({ message: 'Sessão atualizada' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.delete('/api/rehab-sessions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM rehab_sessions WHERE id = ?', [req.params.id])
    res.json({ message: 'Sessão excluída' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// ===============================
// POPULAR BIBLIOTECA DE CONSULTORIA
// ===============================
// Endpoint para popular biblioteca de consultorias existentes
app.post('/api/consultancies/:id/populate-library', async (req, res) => {
  try {
    const consultancyId = Number(req.params.id)
    
    // Verificar se a consultoria existe
    const [consultancy] = await pool.query<RowDataPacket[]>(
      'SELECT id, name FROM consultancies WHERE id = ?',
      [consultancyId]
    )
    
    if (consultancy.length === 0) {
      return res.status(404).json({ error: 'Consultoria não encontrada' })
    }
    
    // Verificar se já tem exercícios
    const [existingExercises] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM exercise_library WHERE consultancy_id = ?',
      [consultancyId]
    )
    
    let exercisesCopied = 0
    let foodsCopied = 0
    
    if (existingExercises[0].count === 0) {
      // Copiar exercícios globais
      const [globalExercises] = await pool.query<RowDataPacket[]>(
        `SELECT name, description, muscle_group, secondary_muscle, equipment, 
                difficulty, video_url, image_url, instructions, tips
         FROM exercise_library 
         WHERE is_global = TRUE OR consultancy_id IS NULL`
      )
      
      if (globalExercises.length > 0) {
        const insertValues = globalExercises.map((ex: RowDataPacket) => [
          consultancyId, ex.name, ex.description, ex.muscle_group, ex.secondary_muscle,
          ex.equipment, ex.difficulty, ex.video_url, ex.image_url, ex.instructions, ex.tips, false
        ])
        await pool.query(
          `INSERT INTO exercise_library 
           (consultancy_id, name, description, muscle_group, secondary_muscle, 
            equipment, difficulty, video_url, image_url, instructions, tips, is_global)
           VALUES ?`,
          [insertValues]
        )
        exercisesCopied = globalExercises.length
      }
    }
    
    // Verificar se já tem alimentos
    const [existingFoods] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM food_library WHERE consultancy_id = ?',
      [consultancyId]
    )
    
    if (existingFoods[0].count === 0) {
      // Copiar alimentos globais
      const [globalFoods] = await pool.query<RowDataPacket[]>(
        `SELECT name, description, category, serving_size, calories, protein, carbs, fat, fiber, sodium, image_url
         FROM food_library 
         WHERE is_global = TRUE OR consultancy_id IS NULL`
      )
      
      if (globalFoods.length > 0) {
        const foodInsertValues = globalFoods.map((food: RowDataPacket) => [
          consultancyId, food.name, food.description, food.category, food.serving_size,
          food.calories, food.protein, food.carbs, food.fat, food.fiber, food.sodium, food.image_url, false
        ])
        await pool.query(
          `INSERT INTO food_library 
           (consultancy_id, name, description, category, serving_size, calories, protein, carbs, fat, fiber, sodium, image_url, is_global)
           VALUES ?`,
          [foodInsertValues]
        )
        foodsCopied = globalFoods.length
      }
    }
    
    res.json({
      success: true,
      message: `Biblioteca populada para ${consultancy[0].name}`,
      data: {
        consultancyId,
        consultancyName: consultancy[0].name,
        exercisesCopied,
        exercisesExisting: existingExercises[0].count,
        foodsCopied,
        foodsExisting: existingFoods[0].count
      }
    })
  } catch (error) {
    console.error('Erro ao popular biblioteca:', error)
    res.status(500).json({ error: String(error) })
  }
})

// ===============================
// APPOINTMENTS - CRUD Completo
// ===============================

app.put('/api/appointments/:id', async (req, res) => {
  try {
    const { type, title, description, scheduled_at, duration_minutes, status, location, notes } = req.body
    await pool.query(
      `UPDATE appointments SET type = ?, title = ?, description = ?, scheduled_at = ?, duration_minutes = ?, status = ?, location = ?, notes = ? WHERE id = ?`,
      [type, title, description, scheduled_at, duration_minutes, status, location, notes, req.params.id]
    )
    res.json({ message: 'Agendamento atualizado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM appointments WHERE id = ?', [req.params.id])
    res.json({ message: 'Agendamento excluído' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// ===============================
// PROGRESS - CRUD Completo
// ===============================

app.put('/api/progress/:id', async (req, res) => {
  try {
    const { record_date, weight, body_fat_percentage, muscle_mass, notes, metrics } = req.body
    await pool.query(
      `UPDATE athlete_progress SET record_date = ?, weight = ?, body_fat_percentage = ?, muscle_mass = ?, notes = ?, metrics = ? WHERE id = ?`,
      [record_date, weight, body_fat_percentage, muscle_mass, notes, JSON.stringify(metrics), req.params.id]
    )
    res.json({ message: 'Progresso atualizado' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.delete('/api/progress/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM athlete_progress WHERE id = ?', [req.params.id])
    res.json({ message: 'Registro excluído' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// ===============================
// FILE UPLOAD (Base64 para simplicidade)
// ===============================

app.post('/api/upload', async (req, res) => {
  try {
    const { filename, data, type } = req.body
    
    // Em produção, salvar em storage (S3, etc.)
    // Por enquanto, retornamos uma URL simulada
    const fileUrl = `/uploads/${Date.now()}-${filename}`
    
    res.status(201).json({ 
      url: fileUrl,
      filename,
      type,
      message: 'Arquivo salvo (simulado)'
    })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// ===============================
// ROTAS AVANÇADAS DE NUTRIÇÃO
// ===============================
const nutritionAdvancedRouter = createNutritionAdvancedRoutes(pool)
app.use('/api/nutrition-advanced', nutritionAdvancedRouter)

// ===============================
// ROTAS DE RECEITAS
// ===============================
const recipeRouter = createRecipeRoutes(pool)
app.use('/api/recipes', recipeRouter)

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`)
  
  // Inicializar bibliotecas globais (exercícios e alimentos)
  await seedGlobalLibraries()
})
