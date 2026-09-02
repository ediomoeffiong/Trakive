const { pool } = require('../config/db');

async function cleanupMockData() {
  console.log('🧹 Starting mock business data cleanup...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Delete task-related mock records
    await client.query('DELETE FROM task_activities');
    await client.query('DELETE FROM task_comments');
    await client.query('DELETE FROM task_reviews');
    await client.query('DELETE FROM task_submissions');
    await client.query('DELETE FROM tasks');

    // 2. Delete attendance & leave records
    await client.query('DELETE FROM attendance');
    await client.query('DELETE FROM leave_requests');

    // 3. Delete performance reports
    await client.query('DELETE FROM reports');

    // 4. Delete notifications & documents
    await client.query('DELETE FROM notifications');
    await client.query('DELETE FROM documents');

    // 5. Delete messaging records
    await client.query('DELETE FROM messages');
    await client.query('DELETE FROM conversation_participants');
    await client.query('DELETE FROM conversations');

    // 6. Delete internship & application records
    await client.query('DELETE FROM internship_applications');
    await client.query('DELETE FROM internships');

    // 7. Delete intern profiles (preserves user login accounts in `users` table)
    await client.query('DELETE FROM supervisor_assignments');
    await client.query('DELETE FROM intern_profiles');

    // 8. Delete mock test departments created by automated verification scripts (pattern: Engineering_%, Day9 %, Analytics Dept %)
    // Note: Keeps any standard real departments intact.
    await client.query(`
      DELETE FROM departments 
      WHERE name LIKE 'Engineering_%' 
         OR name LIKE 'Day9 Dept%' 
         OR name LIKE 'Analytics Dept%'
    `);

    // 9. Delete test users created by verification scripts (pattern: %@example.com)
    // Preserves superadmin@trakive.com and any real organization users.
    await client.query(`
      DELETE FROM users 
      WHERE email LIKE '%@example.com' 
        AND email != 'superadmin@trakive.com'
    `);

    await client.query('COMMIT');
    console.log('✅ Mock business data cleaned up successfully while preserving foundational user and system data.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Mock data cleanup failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    if (require.main === module) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  cleanupMockData();
}

module.exports = cleanupMockData;
