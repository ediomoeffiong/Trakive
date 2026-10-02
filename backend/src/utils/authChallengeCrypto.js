const crypto = require('crypto');
const config = require('../config/env');

const key = crypto.createHash('sha256')
  .update(config.authChallengeEncryptionKey || config.jwt.secret)
  .digest();

const encryptChallengePayload = (value) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.');
};

const decryptChallengePayload = (value) => {
  const [iv, tag, encrypted] = String(value || '').split('.').map((part) => Buffer.from(part, 'base64url'));
  if (!iv?.length || !tag?.length || !encrypted?.length) throw new Error('Invalid challenge payload');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8'));
};

module.exports = { encryptChallengePayload, decryptChallengePayload };
