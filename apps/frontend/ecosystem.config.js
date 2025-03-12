module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4200
      },
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      restart_delay: 1000,
    },
  ],
}; 