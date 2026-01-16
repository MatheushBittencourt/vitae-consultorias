// ===========================================
// VITAE - Configuração PM2 para Produção
// ===========================================
// Uso:
//   pm2 start ecosystem.config.cjs
//   pm2 stop vitae-api
//   pm2 restart vitae-api
//   pm2 logs vitae-api
// ===========================================
// IMPORTANTE: Instale tsx globalmente no servidor:
//   npm install -g tsx
// ===========================================

module.exports = {
  apps: [
    {
      name: 'vitae-api',
      script: 'server/index.ts',
      interpreter: 'tsx', // Usar tsx global (npm install -g tsx)
      instances: 2, // 2 instâncias para balanceamento
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      // Graceful shutdown
      kill_timeout: 5000,
    },
  ],
};
