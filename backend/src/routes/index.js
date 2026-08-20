const express = require('express');
const v1Router = require('./v1');
const { getHealth } = require('../controllers/health.controller');

const router = express.Router();

// Mount v1 router under /v1
router.use('/v1', v1Router);

// Alias /health at root API router for GET /api/health
router.get('/health', getHealth);

module.exports = router;
