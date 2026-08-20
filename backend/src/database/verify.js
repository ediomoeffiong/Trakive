const { pool } = require('../config/db');

async function verifyDatabase() {
  console.log('🔍 Starting database schema and data verification...');
  const client = await pool.connect();
  try {
    const tablesRes = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name"
    );
    console.log(`📋 Total Tables Created (${tablesRes.rows.length}):`);
    tablesRes.rows.forEach((r, idx) => console.log(`   ${idx + 1}. ${r.table_name}`));

    const rolesRes = await client.query('SELECT name FROM roles ORDER BY name');
    console.log(`\n👑 System Roles Seeded (${rolesRes.rows.length}):`, rolesRes.rows.map((r) => r.name).join(', '));

    const permsRes = await client.query('SELECT COUNT(1) AS count FROM permissions');
    console.log(`🔐 Total Permissions Seeded: ${permsRes.rows[0].count}`);

    const rolePermsRes = await client.query('SELECT COUNT(1) AS count FROM role_permissions');
    console.log(`🔗 Role-Permission Mappings: ${rolePermsRes.rows[0].count}`);

    const indexRes = await client.query("SELECT COUNT(1) AS count FROM pg_indexes WHERE schemaname='public'");
    console.log(`⚡ Performance Indexes Created: ${indexRes.rows[0].count}`);

    console.log('\n✅ Database verification successfully completed!');
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  verifyDatabase();
}

module.exports = verifyDatabase;
