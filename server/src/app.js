const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { validateEnv } = require('./config/env');
const router = require('./routes/index');
const errorMiddleware = require('./middleware/error.middleware');

validateEnv();

const app = express();

// Security & CORS
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : true;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, Postman, server-to-server) with no origin
    if (!origin || allowedOrigins === true) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev fallback
  },
  credentials: true,
}));

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
