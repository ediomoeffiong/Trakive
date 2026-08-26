const AutomationService = require('../services/automation.service');
const { pool } = require('../config/db');

async function runStandaloneJob() {
  console.log('🤖 Starting automated background jobs execution...');
  try {
    const results = await AutomationService.runAllAutomations();
    console.log('✅ Automated jobs completed successfully:');
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('❌ Error executing automated jobs:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runStandaloneJob();
}

module.exports = runStandaloneJob;
