import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import { createPool, RowDataPacket } from 'mysql2/promise'
import { MercadoPagoConfig, PreApproval, Payment } from 'mercadopago'

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
// CONFIGURAÇÃO DO MERCADO PAGO
// ===========================================
const mercadoPagoAccessToken = process.env.MP_ACCESS_TOKEN || ''
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
      `SELECT id, name, slug, email, phone, logo_url, plan, price_monthly, billing_day,
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

    // Validar token do cartão
    if (!cardToken) {
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`)
})
