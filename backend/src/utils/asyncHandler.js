/**
 * Wrap asynchronous express routes to catch unhandled errors and pass to error middleware
 * @param {Function} fn 
 * @returns {import('express').RequestHandler}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
