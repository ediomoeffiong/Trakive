const { Pool } = require('pg');
const config = require('./env');

/**
 * Construct Pool configuration supporting both direct credentials
 * and Supabase connection strings (DATABASE_URL) with SSL support.
 */
const getPoolConfig = () => {
  let poolConfig = {};

  if (config.db.url) {
    poolConfig.connectionString = config.db.url;
  } else {
    poolConfig = {
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
    };
  }

  poolConfig.max = config.db.max;
  poolConfig.idleTimeoutMillis = config.db.idleTimeoutMillis;
  poolConfig.connectionTimeoutMillis = 5000;

  if (config.db.ssl) {
    poolConfig.ssl = {
      rejectUnauthorized: config.db.sslRejectUnauthorized,
    };
  }

  return poolConfig;
};

const pool = new Pool(getPoolConfig());

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL database pool error:', err.message);
});

/**
 * Execute SQL query with parameter binding
 * @param {string} text 
 * @param {Array} [params] 
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

/**
 * Test PostgreSQL database connectivity for GET /api/health
 * @returns {Promise<{ status: string, latencyMs: number, error?: string }>}
 */
const testConnection = async () => {
  const start = Date.now();
  try {
    const res = await pool.query('SELECT 1 AS alive');
    const latencyMs = Date.now() - start;
    if (res.rows && res.rows[0] && Number(res.rows[0].alive) === 1) {
      return { status: 'connected', latencyMs };
    }
    return { status: 'degraded', latencyMs, message: 'Unexpected query output' };
  } catch (error) {
    const latencyMs = Date.now() - start;
    return {
      status: 'disconnected',
      latencyMs,
      error: error.message,
    };
  }
};

module.exports = {
  pool,
  query,
  testConnection,
};
