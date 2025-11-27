module.exports = {
  apps: [
    {
      name: "timewave-radio",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3030",
      cwd: "/root/prod-dev.timewave.org.uk",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3030,
      },
    },
  ],
}
