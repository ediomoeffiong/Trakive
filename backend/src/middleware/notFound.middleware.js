const ApiError = require('../utils/apiError');

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
};

module.exports = notFoundHandler;
