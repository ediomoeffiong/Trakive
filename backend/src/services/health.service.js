const { testConnection } = require('../config/db');
const config = require('../config/env');

/**
 * Perform application and database health check
 */
const checkHealth = async () => {
  const dbHealth = await testConnection();
  const uptimeSeconds = Math.floor(process.uptime());
  const memoryUsage = process.memoryUsage();

  return {
    status: dbHealth.status === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: config.env,
    uptime: `${uptimeSeconds}s`,
    database: dbHealth,
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      memoryUsage: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      },
    },
  };
};

module.exports = {
  checkHealth,
};
