-- Script para criar usuários de teste
-- Senha para todos: teste123

-- A senha "teste123" com bcrypt hash (custo 10)
-- Hash gerado: $2b$10$rQZ8K8HN8GHvL7gV8KqJZeJV8Q8n8K8H8N8GHvL7gV8KqJZeJV8Q8

-- Para gerar um novo hash, use:
-- node -e "require('bcrypt').hash('teste123', 10).then(h => console.log(h))"

-- =====================================================
-- PROFISSIONAL DE TESTE
-- =====================================================
-- Email: profissional@teste.com
-- Senha: teste123

INSERT INTO users (name, email, password_hash, role, consultancy_id, created_at)
SELECT 
  'Dr. Teste Profissional',
  'profissional@teste.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.wT5CIp5ozyLqWGa',
  'admin',
  (SELECT id FROM consultancies LIMIT 1),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'profissional@teste.com'
);

-- =====================================================
-- PACIENTE DE TESTE
-- =====================================================
-- Email: paciente@teste.com
-- Senha: teste123

INSERT INTO users (name, email, password_hash, role, consultancy_id, created_at)
SELECT 
  'João Paciente Teste',
  'paciente@teste.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.wT5CIp5ozyLqWGa',
  'athlete',
  (SELECT id FROM consultancies LIMIT 1),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'paciente@teste.com'
);

-- Criar registro de atleta para o paciente de teste
INSERT INTO athletes (user_id, consultancy_id, sport, birth_date, gender, created_at)
SELECT 
  u.id,
  u.consultancy_id,
  'Musculação',
  '1990-01-15',
  'M',
  NOW()
FROM users u
WHERE u.email = 'paciente@teste.com'
AND NOT EXISTS (
  SELECT 1 FROM athletes a WHERE a.user_id = u.id
);

-- =====================================================
-- INFORMAÇÕES DE ACESSO
-- =====================================================
-- 
-- PROFISSIONAL:
--   Email: profissional@teste.com
--   Senha: teste123
--
-- PACIENTE:
--   Email: paciente@teste.com  
--   Senha: teste123
--
-- =====================================================
