require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/config/socket');
const { startAutoReleaseJob } = require('./src/modules/payments/autoRelease.job');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  logger.info(`🚀 LINC server running on port ${PORT} [${process.env.NODE_ENV}]`);

  // Start background jobs
  startAutoReleaseJob();
});
