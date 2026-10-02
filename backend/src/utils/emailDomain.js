const ApiError = require('./apiError');

const ALLOWED_EMAIL_DOMAINS = Object.freeze(['cwg-plc.com', 'thefifthlab.com']);
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const isAllowedEmail = (email) => ALLOWED_EMAIL_DOMAINS.some((domain) => normalizeEmail(email).endsWith(`@${domain}`));
const assertAllowedEmail = (email) => {
  const normalized = normalizeEmail(email);
  if (!isAllowedEmail(normalized)) {
    throw ApiError.badRequest('Please enter your organization email (@cwg-plc.com or @thefifthlab.com). Other emails are not supported.');
  }
  return normalized;
};

module.exports = { ALLOWED_EMAIL_DOMAINS, normalizeEmail, isAllowedEmail, assertAllowedEmail };
