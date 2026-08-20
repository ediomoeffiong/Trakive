const config = require('../config/env');

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = config.env === 'development' ? 'debug' : 'info';

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const metaString = meta && Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level.toUpperCase()}]: ${message} ${metaString}`.trim();
};

const logger = {
  info: (message, meta = {}) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.info) {
      console.log(formatMessage('info', message, meta));
    }
  },
  warn: (message, meta = {}) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.warn) {
      console.warn(formatMessage('warn', message, meta));
    }
  },
  error: (message, meta = {}) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.error) {
      console.error(formatMessage('error', message, meta));
    }
  },
  debug: (message, meta = {}) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.debug) {
      console.debug(formatMessage('debug', message, meta));
    }
  },
};

module.exports = logger;
