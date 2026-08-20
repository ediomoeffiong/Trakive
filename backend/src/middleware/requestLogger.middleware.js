const morgan = require('morgan');
const logger = require('../utils/logger');
const config = require('../config/env');

// Morgan stream pointing to custom logger
const stream = {
  write: (message) => logger.info(message.trim()),
};

const morganFormat = config.env === 'development' ? 'dev' : 'combined';

const requestLogger = morgan(morganFormat, { stream });

module.exports = requestLogger;
