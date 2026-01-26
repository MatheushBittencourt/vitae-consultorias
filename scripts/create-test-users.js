/**
 * Script para criar usuários de teste
 * Execute no servidor: node scripts/create-test-users.js
 */

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTestUsers() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'vitae_production',
    waitForConnections: true,
  });

  try {
    console.log('🔐 Gerando hash da senha...');
    const passwordHash = await bcrypt.hash('teste123', 10);
    console.log('✅ Hash gerado:', passwordHash);

    // Buscar uma consultoria existente
    const [consultancies] = await pool.query('SELECT id FROM consultancies LIMIT 1');
    if (consultancies.length === 0) {
      console.error('❌ Nenhuma consultoria encontrada. Crie uma consultoria primeiro.');
      process.exit(1);
    }
    const consultancyId = consultancies[0].id;
    console.log('📋 Usando consultoria ID:', consultancyId);

    // Criar profissional de teste
    console.log('\n👨‍⚕️ Criando profissional de teste...');
    const [existingPro] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      ['profissional@teste.com']
    );

    if (existingPro.length === 0) {
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role, consultancy_id, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        ['Dr. Teste Profissional', 'profissional@teste.com', passwordHash, 'admin', consultancyId]
      );
      console.log('✅ Profissional criado: profissional@teste.com');
    } else {
      // Atualizar senha
      await pool.query(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [passwordHash, 'profissional@teste.com']
      );
      console.log('✅ Profissional já existe, senha atualizada: profissional@teste.com');
    }

    // Criar paciente de teste
    console.log('\n🏃 Criando paciente de teste...');
    const [existingPatient] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      ['paciente@teste.com']
    );

    let patientUserId;
    if (existingPatient.length === 0) {
      const [result] = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, consultancy_id, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        ['João Paciente Teste', 'paciente@teste.com', passwordHash, 'athlete', consultancyId]
      );
      patientUserId = result.insertId;
      console.log('✅ Paciente criado: paciente@teste.com');
    } else {
      patientUserId = existingPatient[0].id;
      await pool.query(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [passwordHash, 'paciente@teste.com']
      );
      console.log('✅ Paciente já existe, senha atualizada: paciente@teste.com');
    }

    // Criar registro de atleta se não existir
    const [existingAthlete] = await pool.query(
      'SELECT id FROM athletes WHERE user_id = ?',
      [patientUserId]
    );

    if (existingAthlete.length === 0) {
      await pool.query(
        `INSERT INTO athletes (user_id, consultancy_id, sport, birth_date, gender, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [patientUserId, consultancyId, 'Musculação', '1990-01-15', 'M']
      );
      console.log('✅ Registro de atleta criado');
    } else {
      console.log('✅ Registro de atleta já existe');
    }

    console.log('\n========================================');
    console.log('🎉 USUÁRIOS DE TESTE CRIADOS COM SUCESSO!');
    console.log('========================================\n');
    console.log('📱 PROFISSIONAL:');
    console.log('   Email: profissional@teste.com');
    console.log('   Senha: teste123\n');
    console.log('📱 PACIENTE:');
    console.log('   Email: paciente@teste.com');
    console.log('   Senha: teste123\n');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

createTestUsers();
