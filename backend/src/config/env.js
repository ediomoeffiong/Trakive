const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if ((process.env.NODE_ENV || 'development') === 'production' && !process.env.AUTH_PROVIDER) {
  throw new Error('AUTH_PROVIDER must be explicitly configured in production');
}
const authProvider = String(process.env.AUTH_PROVIDER || 'local').trim().toLowerCase();
if (!['local', 'supabase'].includes(authProvider)) {
  throw new Error(`Unsupported AUTH_PROVIDER '${authProvider}'. Expected 'local' or 'supabase'.`);
}

const config = {
  env: process.env.NODE_ENV || 'development',
  authProvider,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  port: parseInt(process.env.PORT, 10) || 5000,
  corsOrigin: (() => {
    const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
    return origins.length ? origins : ['http://localhost:5173'];
  })(),
  db: {
    url: process.env.DATABASE_URL || process.env.DB_URL || null,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'trakive_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true' || Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require')),
    sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    max: parseInt(process.env.DB_MAX_CONNECTIONS, 10) || 10,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS, 10) || 30000,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 10000,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'trakive-super-secret-access-key-2026',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'trakive-super-secret-refresh-key-2026',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'documents',
    signedUrlExpiresIn: parseInt(process.env.SUPABASE_SIGNED_URL_EXPIRES_IN, 10) || 300,
  },
  authChallengeEncryptionKey: process.env.AUTH_CHALLENGE_ENCRYPTION_KEY || '',
};

if (config.authProvider === 'supabase') {
  const missing = [];
  if (!config.supabase.url) missing.push('SUPABASE_URL');
  if (!config.supabase.publishableKey) missing.push('SUPABASE_PUBLISHABLE_KEY');
  if (!config.supabase.serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!config.authChallengeEncryptionKey) missing.push('AUTH_CHALLENGE_ENCRYPTION_KEY');
  if (missing.length) throw new Error(`Supabase authentication requires: ${missing.join(', ')}`);
}

module.exports = config;
