const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function seedDefaultAccounts() {
  const filePath = path.join(__dirname, 'seeds', '004_default_test_users.sql');
  const sql = fs.readFileSync(filePath, 'utf-8');

  console.log('Seeding default Trakive login accounts...');
  try {
    await pool.query(sql);
    console.log('Default Trakive login accounts seeded successfully.');
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedDefaultAccounts().catch((error) => {
    console.error('Default account seeding failed:', error.message);
    process.exit(1);
  });
}

module.exports = seedDefaultAccounts;
