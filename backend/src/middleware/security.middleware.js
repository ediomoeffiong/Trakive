const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config/env');

// Configure Helmet security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      baseUri: ["'none'"],
      formAction: ["'none'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      scriptSrc: ["'none'"],
      imgSrc: ["'none'"],
      styleSrc: ["'none'"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'same-site' },
  referrerPolicy: { policy: 'no-referrer' },
});

// Configure General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP, please try again later.',
  },
});

// Configure Strict Auth Rate Limiter for brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.env === 'production' ? 10 : 1000, // 10 attempts in prod, 1000 in dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

module.exports = {
  securityHeaders,
  apiLimiter,
  authLimiter,
};
