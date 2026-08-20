const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function runSeeds() {
  console.log('🌱 Starting database seeding...');
  const client = await pool.connect();
  try {
    const seedsDir = path.join(__dirname, 'seeds');
    const files = fs.readdirSync(seedsDir).filter((file) => file.endsWith('.sql')).sort();

    for (const file of files) {
      console.log(`🌱 Executing seed file: ${file}`);
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      await client.query(sql);
      console.log(`✅ Seed applied successfully: ${file}`);
    }

    console.log('🎉 Database seeding completed successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runSeeds();
}

module.exports = runSeeds;
