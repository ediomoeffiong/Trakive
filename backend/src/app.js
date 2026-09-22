const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const { securityHeaders, apiLimiter } = require('./middleware/security.middleware');
const rewriteUnprefixedApi = require('./middleware/apiPrefix.middleware');
const requestLogger = require('./middleware/requestLogger.middleware');
const notFoundHandler = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');
const apiRoutes = require('./routes');
const v1Routes = require('./routes/v1');

const app = express();
const unprefixedApiMounts = Array.from(
  rewriteUnprefixedApi.API_V1_ROOTS,
  (root) => `/${root}`
);

// Render (and similar hosts) terminate TLS and proxy to localhost.
app.set('trust proxy', 1);

// Security HTTP headers
app.use(securityHeaders);

// CORS configuration — CORS_ORIGIN may be a single origin or a comma-separated list
app.use(
  cors({
    origin: config.corsOrigin.length === 1 ? config.corsOrigin[0] : config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
  })
);

// Map /auth/login → /api/v1/auth/login before rate limiting and routing
app.use(rewriteUnprefixedApi);

// Rate limiting
app.use('/api', apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb', parameterLimit: 100 }));

// HTTP Request logging
app.use(requestLogger);

// Mount main API routes under /api
app.use('/api', apiRoutes);

// Backwards-compatible aliases for older production frontend bundles that call
// the Render origin without `/api/v1` (for example `/projects` or `/auth/login`).
app.use(
  unprefixedApiMounts,
  (req, res, next) => {
    req.url = `${req.baseUrl}${req.url === '/' ? '' : req.url}`;
    v1Routes(req, res, next);
  }
);

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
