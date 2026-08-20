const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const { securityHeaders, apiLimiter } = require('./middleware/security.middleware');
const requestLogger = require('./middleware/requestLogger.middleware');
const notFoundHandler = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');
const apiRoutes = require('./routes');

const app = express();

// Security HTTP headers
app.use(securityHeaders);

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
app.use('/api', apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP Request logging
app.use(requestLogger);

// Mount main API routes under /api
app.use('/api', apiRoutes);

// Root endpoint redirect / simple info
app.get('/', (req, res) => {
  res.json({
    name: 'Trakive API Server',
    status: 'running',
    healthCheck: '/api/health',
    versionedHealthCheck: '/api/v1/health',
  });
});

// 404 Not Found Handler
app.use(notFoundHandler);

// Central Error Handler
app.use(errorHandler);

module.exports = app;
