// ===========================================
// VITAE - Configuração PM2 para Produção
// ===========================================
// Uso:
//   pm2 start ecosystem.config.js
//   pm2 stop vitae-api
//   pm2 restart vitae-api
//   pm2 logs vitae-api
// ===========================================

module.exports = {
  apps: [
    {
      name: 'vitae-api',
      script: './server/index.ts',
      interpreter: 'node_modules/.bin/tsx',
      instances: 'max', // Usar todos os CPUs disponíveis
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_qa: {
        NODE_ENV: 'qa',
        PORT: 3001,
      },
      env_production: {
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
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
