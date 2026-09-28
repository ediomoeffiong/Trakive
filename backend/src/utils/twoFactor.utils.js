const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { generateSecret, generateURI, verify } = require('otplib');
const config = require('../config/env');

if (config.env === 'production' && !process.env.MFA_ENCRYPTION_KEY) {
  throw new Error('MFA_ENCRYPTION_KEY is required when two-factor authentication runs in production');
}

const encryptionKey = crypto.createHash('sha256')
  .update(process.env.MFA_ENCRYPTION_KEY || config.jwt.secret)
  .digest();

const encryptSecret = (secret) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((value) => value.toString('base64url')).join('.');
};

const decryptSecret = (payload) => {
  const [ivValue, tagValue, encryptedValue] = String(payload || '').split('.');
  if (!ivValue || !tagValue || !encryptedValue) throw new Error('Invalid encrypted two-factor secret');
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, Buffer.from(ivValue, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedValue, 'base64url')), decipher.final()]).toString('utf8');
};

const createSetup = (email) => {
  const secret = generateSecret();
  return { secret, uri: generateURI({ issuer: 'Trakive', label: email, secret }) };
};

const verifyCode = async (encryptedSecret, token) => {
  if (!/^\d{6}$/.test(String(token || '').trim())) return false;
  const result = await verify({
    secret: decryptSecret(encryptedSecret),
    token: String(token).trim(),
    epochTolerance: 30,
  });
  return Boolean(result.valid);
};

const createLoginChallenge = (userId) => jwt.sign(
  { userId, purpose: 'two-factor-login' }, config.jwt.secret,
  { expiresIn: '5m', jwtid: crypto.randomUUID() },
);

const verifyLoginChallenge = (challengeToken) => {
  const payload = jwt.verify(challengeToken, config.jwt.secret);
  if (payload.purpose !== 'two-factor-login' || !payload.userId) throw new Error('Invalid two-factor challenge');
  return payload;
};

module.exports = { createSetup, encryptSecret, verifyCode, createLoginChallenge, verifyLoginChallenge };
