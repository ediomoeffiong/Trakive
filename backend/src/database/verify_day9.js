const http = require('http');
const app = require('../app');
const { pool } = require('../config/db');
const runDay8Verification = require('./verify_day8');

async function runDay9Verification() {
  console.log('🧪 Starting Day 9: Search, Automations & Audit Logs Automated Verification Suite...\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;

  const request = async (method, path, body = null, token = null) => {
    const url = `${baseUrl}${path}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    const res = await fetch(url, { ...options, body: body ? JSON.stringify(body) : null });
    const json = await res.json();
    return { status: res.status, body: json };
  };

  let passedTests = 0;
  let failedTests = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(` ❌ FAIL: ${testName} - ${details}`);
      if (details) console.error(`    Details:`, details);
      failedTests++;
    }
  };

  try {
    const timestamp = Date.now();
    const testAdminEmail = `admin_d9_${timestamp}@example.com`;
    const testHREmail = `hr_d9_${timestamp}@example.com`;
    const testSupervisorEmail = `sup_d9_${timestamp}@example.com`;
    const testInternEmail = `intern_d9_${timestamp}@example.com`;
    const testPassword = 'Password123!';

    let adminToken, hrToken, supervisorToken, internToken;
    let adminUser, hrUser, supervisorUser, internUser;

    // --- 1. Setup Test Users & Login Audit Verification ---
    console.log('--- 1. Setup & Auth Audit Verification ---');
    const adminReg = await request('POST', '/auth/register', { email: testAdminEmail, password: testPassword, first_name: 'Admin', last_name: 'D9', role: 'admin' });
    adminToken = adminReg.body.data.tokens.accessToken;
    adminUser = adminReg.body.data.user;

    const hrReg = await request('POST', '/auth/register', { email: testHREmail, password: testPassword, first_name: 'HR', last_name: 'D9', role: 'hr' });
    hrToken = hrReg.body.data.tokens.accessToken;
    hrUser = hrReg.body.data.user;

    const supReg = await request('POST', '/auth/register', { email: testSupervisorEmail, password: testPassword, first_name: 'Super', last_name: 'VisorD9', role: 'supervisor' });
    supervisorToken = supReg.body.data.tokens.accessToken;
    supervisorUser = supReg.body.data.user;

    const internReg = await request('POST', '/auth/register', { email: testInternEmail, password: testPassword, first_name: 'Intern', last_name: 'D9', role: 'intern' });
    internToken = internReg.body.data.tokens.accessToken;
    internUser = internReg.body.data.user;

    assert(adminToken && hrToken && supervisorToken && internToken, 'Successfully created test accounts for all roles');

    // Perform Login to trigger USER_LOGIN audit event
    const loginRes = await request('POST', '/auth/login', { email: testAdminEmail, password: testPassword });
    assert(loginRes.status === 200, 'Admin login successful');

    // --- Seed Setup Data for Search & Automation ---
    const dbClient = await pool.connect();
    const orgRes = await dbClient.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0].id;

    // Create Department
    const deptRes = await dbClient.query(
      `INSERT INTO departments (organization_id, name, code) VALUES ($1, $2, $3) RETURNING id;`,
      [orgId, `Day9 Dept ${timestamp}`, `D9_${timestamp}`]
    );
    const deptId = deptRes.rows[0].id;

    await dbClient.query('UPDATE users SET organization_id = $1, department_id = $2 WHERE id = $3', [orgId, deptId, internUser.id]);
    await dbClient.query('UPDATE users SET organization_id = $1, department_id = $2 WHERE id = $3', [orgId, deptId, supervisorUser.id]);

    // Create Task due in 12 hours (Approaching deadline)
    const taskUpcoming = await dbClient.query(
      `INSERT INTO tasks (organization_id, department_id, creator_id, assignee_id, title, description, priority, status, due_date)
       VALUES ($1, $2, $3, $4, 'Approaching Deadline Task', 'Finish before midnight', 'high', 'todo', NOW() + INTERVAL '12 hours')
       RETURNING id;`,
      [orgId, deptId, supervisorUser.id, internUser.id]
    );
    const taskUpcomingId = taskUpcoming.rows[0].id;

    // Create Overdue Task
    const taskOverdue = await dbClient.query(
      `INSERT INTO tasks (organization_id, department_id, creator_id, assignee_id, title, description, priority, status, due_date)
       VALUES ($1, $2, $3, $4, 'Past Overdue Task', 'Should have been done yesterday', 'urgent', 'in_progress', NOW() - INTERVAL '1 day')
       RETURNING id;`,
      [orgId, deptId, supervisorUser.id, internUser.id]
    );
    const taskOverdueId = taskOverdue.rows[0].id;

    // Create Approved Leave Request for tomorrow
    const leaveRes = await dbClient.query(
      `INSERT INTO leave_requests (organization_id, intern_id, leave_type, start_date, end_date, reason, status)
       VALUES ($1, $2, 'sick', CURRENT_DATE + 1, CURRENT_DATE + 2, 'Medical leave', 'approved')
       RETURNING id;`,
      [orgId, internUser.id]
    );

    // Create Document
    await dbClient.query(
      `INSERT INTO documents (organization_id, uploader_id, owner_id, title, file_name, file_path, file_size, mime_type, category)
       VALUES ($1, $2, $3, 'Searchable Agreement Doc', 'agreement_d9.pdf', '/files/agreement_d9.pdf', 1024, 'application/pdf', 'agreement');`,
      [orgId, supervisorUser.id, internUser.id]
    );

    dbClient.release();
    console.log('✅ Day 9 test seed data initialized');

    // --- 2. Search & Filtering Tests ---
    console.log('\n--- 2. Server-side Search & Filtering Endpoints ---');

    // 2a. Users Search
    const searchUsersRes = await request('GET', `/search/users?search=Intern&departmentId=${deptId}&page=1&limit=5`, null, hrToken);
    assert(searchUsersRes.status === 200, 'GET /search/users returns HTTP 200');
    assert(Array.isArray(searchUsersRes.body.data), 'GET /search/users returns data array');
    assert(searchUsersRes.body.meta.currentPage === 1, 'GET /search/users returns pagination metadata');

    // 2b. Tasks Search & Filtering
    const searchTasksRes = await request('GET', `/search/tasks?search=Approaching&priority=high&page=1&limit=5`, null, hrToken);
    assert(searchTasksRes.status === 200, 'GET /search/tasks returns HTTP 200');
    assert(searchTasksRes.body.data.length >= 1, 'GET /search/tasks filters by title search and priority');
    assert(searchTasksRes.body.data[0].title === 'Approaching Deadline Task', 'GET /search/tasks returns exact task match');

    // 2c. Attendance Search & Filtering
    const searchAttRes = await request('GET', `/search/attendance?page=1&limit=5`, null, hrToken);
    assert(searchAttRes.status === 200, 'GET /search/attendance returns HTTP 200');

    // 2d. Leave Search & Filtering
    const searchLeaveRes = await request('GET', `/search/leave?type=sick&status=approved&page=1&limit=5`, null, hrToken);
    assert(searchLeaveRes.status === 200, 'GET /search/leave returns HTTP 200');
    assert(searchLeaveRes.body.data.length >= 1, 'GET /search/leave filters by type and status');

    // 2e. Documents Search
    const searchDocRes = await request('GET', `/search/documents?search=Agreement&category=agreement`, null, hrToken);
    assert(searchDocRes.status === 200, 'GET /search/documents returns HTTP 200');
    assert(searchDocRes.body.data.length >= 1, 'GET /search/documents matches category and title');

    // 2f. Query Parameter Validation & Error Handling
    const invalidQueryRes = await request('GET', `/search/tasks?priority=invalid_priority_val`, null, hrToken);
    assert(invalidQueryRes.status === 422 || invalidQueryRes.status === 400, 'Invalid query parameter returns validation error response (HTTP 422/400)');


    // 2g. RBAC Data Scope Enforcement
    const internTaskSearch = await request('GET', `/search/tasks?internId=${adminUser.id}`, null, internToken);
    assert(internTaskSearch.status === 200, 'Intern task search returns HTTP 200');
    assert(internTaskSearch.body.data.every(t => t.assignee_id === internUser.id), 'Intern query is strictly scoped to own assignee_id regardless of query params');

    // --- 3. Automation Engine & Idempotency Verification ---
    console.log('\n--- 3. Automations Engine & Idempotency Testing ---');

    // Run Automations (Run 1)
    const autoRun1 = await request('POST', '/automations/run', null, adminToken);
    assert(autoRun1.status === 200, 'POST /automations/run executed successfully (Run 1)');
    assert(autoRun1.body.data.reminders.notificationsSent >= 1, 'Run 1 created task deadline reminder notification');
    assert(autoRun1.body.data.overdue.notificationsSent >= 1, 'Run 1 created overdue task notification');
    assert(autoRun1.body.data.leaveConsistency.reconciledDays >= 2, 'Run 1 reconciled approved leave into attendance');

    // Verify Notification Created for Intern
    const internNotifs1 = await request('GET', `/notifications?page=1&limit=10`, null, internToken);
    assert(internNotifs1.status === 200, 'Intern retrieves notifications');
    const initialNotifCount = internNotifs1.body.data.length;
    assert(initialNotifCount >= 2, 'Intern has deadline and overdue notifications');

    // Verify Attendance Reconciled for Leave
    const internAttendance = await request('GET', `/attendance?internId=${internUser.id}`, null, hrToken);
    assert(internAttendance.body.data.some(a => a.status === 'excused'), 'Leave request automatically reconciled into excused attendance record');

    // RUN AUTOMATIONS AGAIN (Run 2 - Idempotency Check)
    console.log('--- Executing Automation Engine Second Time (Idempotency Check) ---');
    const autoRun2 = await request('POST', '/automations/run', null, adminToken);
    assert(autoRun2.status === 200, 'POST /automations/run executed successfully (Run 2)');
    assert(autoRun2.body.data.reminders.notificationsSent === 0, 'Run 2 sent 0 duplicate task reminders (Idempotent)');
    assert(autoRun2.body.data.overdue.notificationsSent === 0, 'Run 2 sent 0 duplicate overdue notifications (Idempotent)');

    const internNotifs2 = await request('GET', `/notifications?page=1&limit=10`, null, internToken);
    assert(internNotifs2.body.data.length === initialNotifCount, 'Total notifications count unchanged after Run 2 (No duplicate notifications created)');

    // --- 4. Audit Logs Endpoints & RBAC Security ---
    console.log('\n--- 4. Audit Logs Endpoints & Security Checks ---');

    // Admin/HR fetch audit logs
    const auditLogsRes = await request('GET', '/audit-logs?page=1&limit=10', null, hrToken);
    assert(auditLogsRes.status === 200, 'GET /audit-logs for HR returns HTTP 200');
    assert(auditLogsRes.body.data.length >= 2, 'Audit log entries retrieved');
    assert(auditLogsRes.body.data.some(a => a.action === 'USER_REGISTER'), 'Audit logs record USER_REGISTER');
    assert(auditLogsRes.body.data.some(a => a.action === 'USER_LOGIN'), 'Audit logs record USER_LOGIN');

    // Verify Unauthorized Access (Intern accessing /audit-logs)
    const unauthorizedAudit = await request('GET', '/audit-logs', null, internToken);
    assert(unauthorizedAudit.status === 403, 'Normal user (Intern) accessing /audit-logs receives HTTP 403 Forbidden');

    // --- 5. Regression Test Execution (Day 8 Suite) ---
    console.log('\n--- 5. Days 1–8 Regression Suite Verification ---');
    // Run day 8 verification suite inside this process
    await runDay8Verification();

    console.log(`\n📊 Day 9 Verification Summary: ${passedTests} Passed, ${failedTests} Failed.`);
    if (failedTests > 0) process.exit(1);
  } catch (err) {
    console.error('\n❌ Day 9 verification suite error:', err);
    process.exit(1);
  } finally {
    server.close();
    await pool.end();
  }
}

if (require.main === module) {
  runDay9Verification();
}

module.exports = runDay9Verification;
