const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { validateEnv } = require('./config/env');
const router = require('./routes/index');
const errorMiddleware = require('./middleware/error.middleware');

validateEnv();

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const { checkDbConnection } = require('./config/db');

// Health and Root checks
app.get('/', (req, res) => res.json({
  service: 'LINC API',
  status: 'running',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString(),
}));

app.get('/health', (req, res) => res.json({
  status: 'ok',
  service: 'LINC API',
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
}));

app.get('/health/db', async (req, res) => {
  const dbStatus = await checkDbConnection();
  const statusCode = dbStatus.connected ? 200 : 503;
  res.status(statusCode).json(dbStatus);
});

// All API routes
app.use('/api', router);

// Global error handler (must be last)
app.use(errorMiddleware);

module.exports = app;
