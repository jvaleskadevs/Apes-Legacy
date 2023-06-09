module.exports = {
  apps : [{
    name: "EPNS Staging Showrunners",
    script: "build/app.js",
    instances: "max",
    max_memory_restart: "2048M",
    env: {
      NODE_ENV: "development"
    },
    env_production: {
      NODE_ENV: "production"
    }
  }]
};
