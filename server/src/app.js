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

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'LINC API' }));

// All API routes
app.use('/api', router);

// Global error handler (must be last)
app.use(errorMiddleware);

module.exports = app;
