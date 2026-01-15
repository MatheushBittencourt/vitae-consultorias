-- ===========================================
-- VITAE - Setup do Banco de Dados para Produção
-- ===========================================
-- Execute este script no servidor MySQL de produção
-- mysql -u root -p < scripts/setup-production-db.sql
-- ===========================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS vitae_production
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Criar usuário da aplicação
CREATE USER IF NOT EXISTS 'vitae_user'@'localhost' 
  IDENTIFIED BY 'ALTERE_ESTA_SENHA_SEGURA';

-- Conceder permissões
GRANT ALL PRIVILEGES ON vitae_production.* TO 'vitae_user'@'localhost';
FLUSH PRIVILEGES;

-- Usar o banco
USE vitae_production;

-- Agora execute o schema:
-- mysql -u vitae_user -p vitae_production < database/init/01-schema.sql

-- E opcionalmente o seed (apenas para QA/testes):
-- mysql -u vitae_user -p vitae_production < database/init/02-seed.sql

SELECT 'Banco de dados configurado com sucesso!' AS status;
