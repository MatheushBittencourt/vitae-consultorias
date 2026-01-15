#!/bin/bash

# ===========================================
# VITAE - Script de Deploy
# ===========================================
# Uso: ./scripts/deploy.sh [qa|production]
# ===========================================

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "╔════════════════════════════════════════════╗"
echo "║           VITAE - Deploy Script            ║"
echo "╠════════════════════════════════════════════╣"
echo "║  Ambiente: $ENVIRONMENT"
echo "╚════════════════════════════════════════════╝"

cd "$PROJECT_DIR"

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "❌ Erro: Arquivo .env não encontrado!"
    echo "   Copie config/env.$ENVIRONMENT para .env e configure as variáveis."
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci --production

# Build do frontend
echo "🔨 Fazendo build do frontend..."
npm run build

# Verificar conexão com banco de dados
echo "🔍 Verificando conexão com banco de dados..."
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
    try {
        const conn = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        });
        console.log('✅ Conexão com banco de dados OK');
        await conn.end();
    } catch (err) {
        console.error('❌ Erro ao conectar no banco:', err.message);
        process.exit(1);
    }
}
test();
"

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "Para iniciar a aplicação:"
echo "  npm run start:prod"
echo ""
echo "Ou use PM2 para produção:"
echo "  pm2 start ecosystem.config.js"
