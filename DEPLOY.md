# VITAE - Guia de Deploy

## 📁 Estrutura de Ambientes

```
├── config/
│   ├── env.example        # Template de configuração
│   ├── env.development    # Config para desenvolvimento (Docker)
│   └── env.production     # Config para produção
├── docker-compose.yml     # APENAS para desenvolvimento local
├── ecosystem.config.js    # Configuração PM2 para produção
└── scripts/
    ├── deploy.sh          # Script de deploy
    └── setup-production-db.sql  # Setup inicial do banco
```

---

## 🖥️ Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- Docker Desktop

### Setup

```bash
# 1. Clonar o projeto
git clone <repo>
cd consultoria_edu

# 2. Instalar dependências
npm install

# 3. Iniciar MySQL via Docker
npm run db:up

# 4. Iniciar aplicação (frontend + backend)
npm run dev:all
```

### URLs de Desenvolvimento
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/api/health

### Comandos Úteis

```bash
npm run dev:all     # Inicia frontend + backend
npm run db:up       # Inicia MySQL (Docker)
npm run db:down     # Para MySQL
npm run db:reset    # Reseta banco de dados (apaga tudo)
npm run db:schema   # Recria tabelas
npm run db:seed     # Insere dados de teste
```

---

## 🚀 Produção / QA

### Pré-requisitos no Servidor
- Node.js 18+
- MySQL 8.0+
- PM2 (`npm install -g pm2`)
- Nginx (opcional, para proxy reverso)

### 1. Configurar MySQL no Servidor

```bash
# Conectar no MySQL como root
mysql -u root -p

# Executar o script de setup
source scripts/setup-production-db.sql

# Criar as tabelas
mysql -u vitae_user -p vitae_production < database/init/01-schema.sql
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar template de produção
cp config/env.production .env

# Editar com suas configurações
nano .env
```

**Variáveis importantes:**
```env
NODE_ENV=production
MYSQL_HOST=localhost
MYSQL_USER=vitae_user
MYSQL_PASSWORD=SUA_SENHA_SEGURA
MYSQL_DATABASE=vitae_production
MP_PUBLIC_KEY=APP_USR-xxx
MP_ACCESS_TOKEN=APP_USR-xxx
SKIP_PAYMENT=false
FRONTEND_URL=https://seu-dominio.com
```

### 3. Build e Deploy

```bash
# Instalar dependências
npm ci --production

# Build do frontend
npm run build

# Iniciar com PM2
pm2 start ecosystem.config.js --env production

# Verificar status
pm2 status

# Ver logs
pm2 logs vitae-api
```

### 4. Configurar Nginx (Proxy Reverso)

```nginx
# /etc/nginx/sites-available/vitae

server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend (arquivos estáticos)
    location / {
        root /var/www/vitae/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/vitae /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL com Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

---

## 🔄 Atualizações

```bash
# Puxar mudanças
git pull origin main

# Reinstalar dependências
npm ci --production

# Rebuild
npm run build

# Reiniciar aplicação
pm2 restart vitae-api
```

---

## 📊 Monitoramento

```bash
# Status dos processos
pm2 status

# Logs em tempo real
pm2 logs vitae-api

# Monitoramento
pm2 monit

# Métricas
pm2 show vitae-api
```

---

## 🛡️ Segurança

### Checklist de Produção

- [ ] Senhas fortes para MySQL
- [ ] Access Token do Mercado Pago de PRODUÇÃO (não teste)
- [ ] HTTPS configurado
- [ ] Firewall configurado (apenas portas 80, 443, 22)
- [ ] MySQL não exposto externamente
- [ ] Variáveis de ambiente NÃO no código
- [ ] Logs sendo rotacionados

### Backup do Banco

```bash
# Criar backup
mysqldump -u vitae_user -p vitae_production > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u vitae_user -p vitae_production < backup_20240115.sql
```

---

## 🐛 Troubleshooting

### Erro de conexão com banco
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Testar conexão
mysql -u vitae_user -p -e "SELECT 1"
```

### Erro de permissão
```bash
# Verificar dono dos arquivos
ls -la

# Corrigir permissões
sudo chown -R $USER:$USER /var/www/vitae
```

### PM2 não inicia
```bash
# Ver logs de erro
pm2 logs vitae-api --err

# Reiniciar com --update-env
pm2 restart vitae-api --update-env
```
