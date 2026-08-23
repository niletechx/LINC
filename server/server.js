require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/config/socket');
const { startAutoReleaseJob, stopAutoReleaseJob } = require('./src/modules/payments/autoRelease.job');
const { pool } = require('./src/config/db');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = initSocket(server);

// Start server only in standalone/container mode (not in Vercel serverless functions or tests)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  server.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 LINC server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);

    // Start background jobs
    startAutoReleaseJob();
  });
}

// ── Graceful Shutdown ──────────────────────────────────────────────────────────
let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  // Stop background jobs
  stopAutoReleaseJob();

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');

    // Close Socket.IO connections
    try {
      if (io) {
        io.close();
        logger.info('Socket.IO connections closed');
      }
    } catch (e) {
      logger.warn('Error closing Socket.IO: ' + e.message);
    }

    // Close DB pool if initialized
    try {
      if (pool) {
        await pool.end();
        logger.info('PostgreSQL pool closed');
      }
    } catch (e) {
      logger.warn('Error closing DB pool: ' + e.message);
    }

    logger.info('Graceful shutdown completed. Exiting process.');
    process.exit(0);
  });

  // Force exit if shutdown hangs beyond 10s
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason?.message || reason}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}\n${err.stack}`);
  // In production, give winston time to log before exit
  setTimeout(() => process.exit(1), 1000);
});

module.exports = app;
