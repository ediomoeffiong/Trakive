const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');

/**
 * Generate short-lived access JWT token
 * @param {object} payload { userId, role }
 * @returns {string}
 */
const generateAccessToken = (payload) => {
  return jwt.sign({ ...payload, jti: crypto.randomUUID() }, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiry,
  });
};

/**
 * Generate long-lived refresh JWT token
 * @param {object} payload { userId, familyId }
 * @returns {string}
 */
const generateRefreshToken = (payload) => {
  return jwt.sign({ ...payload, jti: crypto.randomUUID() }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  });
};

/**
 * Verify access token
 * @param {string} token 
 * @returns {object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Verify refresh token
 * @param {string} token 
 * @returns {object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

/**
 * SHA-256 hash token for database storage
 * @param {string} token 
 * @returns {string}
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a random token string (e.g. for email verify or password reset)
 * @param {number} bytes 
 * @returns {string}
 */
const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  generateRandomToken,
};
