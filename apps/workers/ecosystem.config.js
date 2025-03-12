module.exports = {
  apps: [
    {
      name: 'workers',
      script: './dist/apps/workers/src/main.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      restart_delay: 1000,
    },
  ],
}; 