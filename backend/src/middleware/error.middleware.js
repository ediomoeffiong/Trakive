const ApiError = require('../utils/apiError');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Express central error handling middleware
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, null, false, err.stack);
  }

  const responsePayload = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
  };

  if (error.errors) {
    responsePayload.errors = error.errors;
  }

  if (config.env === 'development') {
    responsePayload.stack = error.stack;
  }

  if (error.statusCode >= 500) {
    logger.error(`[500 Server Error] ${req.method} ${req.originalUrl}: ${error.message}`, {
      stack: error.stack,
    });
  } else {
    logger.warn(`[${error.statusCode} Client Error] ${req.method} ${req.originalUrl}: ${error.message}`);
  }

  return res.status(error.statusCode).json(responsePayload);
};

module.exports = errorHandler;
