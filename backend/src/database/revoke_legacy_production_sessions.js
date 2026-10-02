const config = require('../config/env');
const { pool } = require('../config/db');

async function revokeLegacyProductionSessions() {
  if (config.authProvider !== 'supabase') {
    throw new Error('Refusing to revoke legacy sessions unless AUTH_PROVIDER=supabase');
  }
  const result = await pool.query(
    `UPDATE refresh_tokens
     SET is_revoked = true, revoked_at = COALESCE(revoked_at, NOW())
     WHERE is_revoked = false
     RETURNING id`
  );
  console.log(`Revoked ${result.rowCount} legacy refresh-token record(s).`);
}

if (require.main === module) {
  revokeLegacyProductionSessions()
    .catch((error) => { console.error(error.message); process.exitCode = 1; })
    .finally(() => pool.end());
}

module.exports = revokeLegacyProductionSessions;
