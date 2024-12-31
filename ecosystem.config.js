module.exports = {
  apps: [
    {
      name: 'qsyjx',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      exp_backoff_restart_delay: 100,
      max_memory_restart: '256M',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      autorestart: true,
      max_restarts: 10
    }
  ]
} 