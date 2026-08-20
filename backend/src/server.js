const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');
const { testConnection, pool } = require('./config/db');

let server;

/**
 * Start Express Server
 */
const startServer = async () => {
  try {
    // Start listening
    server = app.listen(config.port, () => {
      logger.info(`🚀 Server running in [${config.env}] mode on port ${config.port}`);
      logger.info(`🔗 Health check available at: http://localhost:${config.port}/api/health`);
    });

    // Test database connection asynchronously on startup
    const dbStatus = await testConnection();
    if (dbStatus.status === 'connected') {
      logger.info(`✅ SQL Database connection established successfully (${dbStatus.latencyMs}ms)`);
    } else {
      logger.warn(`⚠️ SQL Database connection check failed: ${dbStatus.error || dbStatus.message}`);
    }
  } catch (error) {
    logger.error('Failed to start server:', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

/**
 * Graceful Shutdown Handler
 * @param {string} signal 
 */
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await pool.end();
        logger.info('Database pool closed.');
      } catch (err) {
        logger.error('Error closing database pool:', { error: err.message });
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', { reason: reason instanceof Error ? reason.message : reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});

startServer();
