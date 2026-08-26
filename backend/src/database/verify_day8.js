const http = require('http');
const app = require('../app');
const { pool } = require('../config/db');

async function runDay8Verification() {
  console.log('🧪 Starting Day 8: Reports & Analytics Layer Automated Verification Suite...\n');

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
    const testAdminEmail = `admin_d8_${timestamp}@example.com`;
    const testHREmail = `hr_d8_${timestamp}@example.com`;
    const testHeadEmail = `head_d8_${timestamp}@example.com`;
    const testSupervisorEmail = `sup_d8_${timestamp}@example.com`;
    const testInternEmail = `intern_d8_${timestamp}@example.com`;
    const testPassword = 'Password123!';

    let adminToken, hrToken, headToken, supervisorToken, internToken;
    let adminUser, hrUser, headUser, supervisorUser, internUser;
    let createdDepartmentId, createdSupervisorProfileId;

    // --- Setup Test Users ---
    console.log('--- Setup: Registering Test Actors & Assigning Roles ---');
    const adminReg = await request('POST', '/auth/register', { email: testAdminEmail, password: testPassword, first_name: 'Admin', last_name: 'D8', role: 'admin' });
    adminToken = adminReg.body.data.tokens.accessToken;
    adminUser = adminReg.body.data.user;

    const hrReg = await request('POST', '/auth/register', { email: testHREmail, password: testPassword, first_name: 'HR', last_name: 'D8', role: 'hr' });
    hrToken = hrReg.body.data.tokens.accessToken;
    hrUser = hrReg.body.data.user;

    const headReg = await request('POST', '/auth/register', { email: testHeadEmail, password: testPassword, first_name: 'Head', last_name: 'D8', role: 'head' });
    headToken = headReg.body.data.tokens.accessToken;
    headUser = headReg.body.data.user;

    const supReg = await request('POST', '/auth/register', { email: testSupervisorEmail, password: testPassword, first_name: 'Super', last_name: 'VisorD8', role: 'supervisor' });
    supervisorToken = supReg.body.data.tokens.accessToken;
    supervisorUser = supReg.body.data.user;

    const internReg = await request('POST', '/auth/register', { email: testInternEmail, password: testPassword, first_name: 'Intern', last_name: 'D8', role: 'intern' });
    internToken = internReg.body.data.tokens.accessToken;
    internUser = internReg.body.data.user;

    assert(adminToken && hrToken && headToken && supervisorToken && internToken, 'Successfully created test accounts for all roles');

    // Create Department & Assign Supervisor + Intern
    const createDeptRes = await request('POST', '/departments', { name: `Analytics Dept ${timestamp}`, code: `ANALYTICS_${timestamp}` }, hrToken);
    createdDepartmentId = createDeptRes.body.data.id;

    await request('POST', `/departments/${createdDepartmentId}/head`, { head_user_id: headUser.id }, hrToken);
    const assignSupRes = await request('POST', `/departments/${createdDepartmentId}/supervisors`, { supervisor_user_ids: [supervisorUser.id] }, hrToken);
    createdSupervisorProfileId = assignSupRes.body.data.assigned_supervisors[0].id;

    // Assign Intern to Department and Supervisor
    const dbClient = await pool.connect();
    const orgRes = await dbClient.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0].id;

    await dbClient.query('UPDATE users SET organization_id = $1, department_id = $2 WHERE id = $3', [orgId, createdDepartmentId, internUser.id]);
    await dbClient.query('UPDATE users SET organization_id = $1, department_id = $2 WHERE id = $3', [orgId, createdDepartmentId, supervisorUser.id]);
    await dbClient.query('UPDATE users SET organization_id = $1, department_id = $2 WHERE id = $3', [orgId, createdDepartmentId, headUser.id]);

    await dbClient.query(
      `INSERT INTO intern_profiles (user_id, organization_id, department_id, supervisor_id, status)
       VALUES ($1, $2, $3, $4, 'active')
       ON CONFLICT (user_id) DO UPDATE SET department_id = $3, supervisor_id = $4, status = 'active';`,
      [internUser.id, orgId, createdDepartmentId, createdSupervisorProfileId]
    );

    // Create Test Tasks for Analytics
    const task1 = await dbClient.query(
      `INSERT INTO tasks (organization_id, department_id, creator_id, assignee_id, title, priority, status, due_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'Database Index Optimization', 'high', 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day')
       RETURNING id;`,
      [orgId, createdDepartmentId, supervisorUser.id, internUser.id]
    );
    const task1Id = task1.rows[0].id;

    const task2 = await dbClient.query(
      `INSERT INTO tasks (organization_id, department_id, creator_id, assignee_id, title, priority, status, due_date, created_at)
       VALUES ($1, $2, $3, $4, 'API Documentation Review', 'medium', 'in_progress', NOW() + INTERVAL '5 days', NOW() - INTERVAL '1 day')
       RETURNING id;`,
      [orgId, createdDepartmentId, supervisorUser.id, internUser.id]
    );

    const task3Overdue = await dbClient.query(
      `INSERT INTO tasks (organization_id, department_id, creator_id, assignee_id, title, priority, status, due_date, created_at)
       VALUES ($1, $2, $3, $4, 'Legacy Code Refactor', 'urgent', 'todo', NOW() - INTERVAL '1 day', NOW() - INTERVAL '5 days')
       RETURNING id;`,
      [orgId, createdDepartmentId, supervisorUser.id, internUser.id]
    );

    // Insert Task Review for Task 1
    await dbClient.query(
      `INSERT INTO task_reviews (task_id, reviewer_id, rating, feedback, status)
       VALUES ($1, $2, 5, 'Excellent performance on database optimization', 'approved');`,
      [task1Id, supervisorUser.id]
    );

    // Insert Attendance Records
    await dbClient.query(
      `INSERT INTO attendance (organization_id, intern_id, date, check_in, check_out, status, notes)
       VALUES 
       ($1, $2, CURRENT_DATE - 2, (CURRENT_DATE - 2) + INTERVAL '9 hours', (CURRENT_DATE - 2) + INTERVAL '17 hours', 'present', 'On time'),
       ($1, $2, CURRENT_DATE - 1, (CURRENT_DATE - 1) + INTERVAL '9 hours 30 minutes', (CURRENT_DATE - 1) + INTERVAL '17 hours 30 minutes', 'late', 'Traffic delay');`,
      [orgId, internUser.id]
    );

    // Insert Leave Request
    await dbClient.query(
      `INSERT INTO leave_requests (organization_id, intern_id, leave_type, start_date, end_date, reason, status, reviewer_id, reviewer_comment, reviewed_at)
       VALUES ($1, $2, 'sick', CURRENT_DATE + 3, CURRENT_DATE + 4, 'Medical appointment', 'approved', $3, 'Approved take rest', NOW());`,
      [orgId, internUser.id, supervisorUser.id]
    );

    dbClient.release();
    console.log('✅ Setup data seeded successfully');

    // --- Section 1: Dashboard Metrics ---
    console.log('\n--- 1. Dashboard Metrics Endpoints ---');

    // 1a. Intern Dashboard
    const internDash = await request('GET', '/analytics/dashboard', null, internToken);
    assert(internDash.status === 200, 'GET /analytics/dashboard for Intern returns HTTP 200');
    assert(internDash.body.data.role === 'intern', 'Intern dashboard identifies role as intern');
    assert(internDash.body.data.tasks.assigned >= 3, 'Intern dashboard returns correct assigned tasks count');
    assert(internDash.body.data.tasks.completed >= 1, 'Intern dashboard returns correct completed tasks count');
    assert(internDash.body.data.attendance.present >= 1, 'Intern dashboard returns attendance present count');
    assert(internDash.body.data.leave.approved >= 1, 'Intern dashboard returns approved leave count');

    // 1b. Supervisor Dashboard
    const supDash = await request('GET', '/analytics/dashboard', null, supervisorToken);
    assert(supDash.status === 200, 'GET /analytics/dashboard for Supervisor returns HTTP 200');
    assert(supDash.body.data.role === 'supervisor', 'Supervisor dashboard identifies role as supervisor');
    assert(supDash.body.data.assigned_interns >= 1, 'Supervisor dashboard returns assigned interns count');
    assert(supDash.body.data.tasks.total >= 3, 'Supervisor dashboard returns team tasks count');

    // 1c. HR / Admin Dashboard
    const hrDash = await request('GET', '/analytics/dashboard', null, hrToken);
    assert(hrDash.status === 200, 'GET /analytics/dashboard for HR returns HTTP 200');
    assert(hrDash.body.data.users.total_users >= 1, 'HR dashboard returns user statistics');
    assert(Array.isArray(hrDash.body.data.department_statistics), 'HR dashboard returns department statistics');

    // --- Section 2: Task Analytics ---
    console.log('\n--- 2. Task Analytics Endpoints ---');
    const taskAnalytics = await request('GET', '/analytics/tasks', null, hrToken);
    assert(taskAnalytics.status === 200, 'GET /analytics/tasks returns HTTP 200');
    assert(taskAnalytics.body.data.total_tasks >= 3, 'Task analytics calculates total tasks correctly');
    assert(taskAnalytics.body.data.completed >= 1, 'Task analytics calculates completed count correctly');
    assert(taskAnalytics.body.data.overdue >= 1, 'Task analytics calculates overdue count correctly');
    assert(taskAnalytics.body.data.completion_percentage > 0, 'Task analytics calculates completion percentage');
    assert(taskAnalytics.body.data.average_completion_time_hours >= 0, 'Task analytics calculates average completion time');

    // Filter by priority
    const taskFilterPriority = await request('GET', '/analytics/tasks?priority=high', null, hrToken);
    assert(taskFilterPriority.status === 200 && taskFilterPriority.body.data.total_tasks >= 1, 'Task analytics supports priority filter');

    // --- Section 3: Attendance Analytics ---
    console.log('\n--- 3. Attendance Analytics Endpoints ---');
    const attAnalytics = await request('GET', `/analytics/attendance?internId=${internUser.id}&groupBy=day`, null, hrToken);
    assert(attAnalytics.status === 200, 'GET /analytics/attendance returns HTTP 200');
    assert(attAnalytics.body.data.present_count >= 1, 'Attendance analytics returns present count');
    assert(attAnalytics.body.data.late_count >= 1, 'Attendance analytics returns late count');
    assert(attAnalytics.body.data.attendance_rate > 0, 'Attendance analytics calculates attendance rate');
    assert(attAnalytics.body.data.average_work_duration_hours === 8, 'Attendance analytics calculates correct work duration');
    assert(Array.isArray(attAnalytics.body.data.summaries), 'Attendance analytics returns time-series summaries');

    // --- Section 4: Leave Analytics ---
    console.log('\n--- 4. Leave Analytics Endpoints ---');
    const leaveAnalytics = await request('GET', '/analytics/leave', null, hrToken);
    assert(leaveAnalytics.status === 200, 'GET /analytics/leave returns HTTP 200');
    assert(leaveAnalytics.body.data.total_requests >= 1, 'Leave analytics returns total requests');
    assert(leaveAnalytics.body.data.approved >= 1, 'Leave analytics returns approved count');
    assert(leaveAnalytics.body.data.by_leave_type.sick >= 1, 'Leave analytics returns breakdown by leave type');

    // --- Section 5: Performance & Internship Progress Analytics ---
    console.log('\n--- 5. Performance & Progress Analytics Endpoints ---');
    const perfAnalytics = await request('GET', '/analytics/performance', null, hrToken);
    assert(perfAnalytics.status === 200, 'GET /analytics/performance returns HTTP 200');
    assert(perfAnalytics.body.data.overall_team_performance_score >= 0, 'Performance analytics calculates overall performance score');
    assert(perfAnalytics.body.data.interns.length >= 1, 'Performance analytics returns intern breakdown list');

    const progressAnalytics = await request('GET', '/analytics/internship-progress', null, hrToken);
    assert(progressAnalytics.status === 200, 'GET /analytics/internship-progress returns HTTP 200');
    assert(progressAnalytics.body.data.active_count >= 1, 'Progress analytics returns active interns count');

    // --- Section 6: Detailed Reports Endpoints ---
    console.log('\n--- 6. Detailed Reports Endpoints & Pagination ---');
    const internReport = await request('GET', '/reports/interns?page=1&limit=5', null, hrToken);
    assert(internReport.status === 200, 'GET /reports/interns returns HTTP 200');
    assert(internReport.body.meta.page === 1 && internReport.body.meta.limit === 5, 'Intern report includes pagination meta');
    assert(Array.isArray(internReport.body.data), 'Intern report returns data array');

    const taskReport = await request('GET', '/reports/tasks?page=1&limit=5', null, hrToken);
    assert(taskReport.status === 200, 'GET /reports/tasks returns HTTP 200');

    const attReport = await request('GET', '/reports/attendance?page=1&limit=5', null, hrToken);
    assert(attReport.status === 200, 'GET /reports/attendance returns HTTP 200');

    const leaveReport = await request('GET', '/reports/leave?page=1&limit=5', null, hrToken);
    assert(leaveReport.status === 200, 'GET /reports/leave returns HTTP 200');

    const deptReport = await request('GET', '/reports/departments?page=1&limit=5', null, hrToken);
    assert(deptReport.status === 200, 'GET /reports/departments returns HTTP 200');

    const progressReport = await request('GET', '/reports/internship-progress?page=1&limit=5', null, hrToken);
    assert(progressReport.status === 200, 'GET /reports/internship-progress returns HTTP 200');

    // --- Section 7: Security & Data Scope Enforcement ---
    console.log('\n--- 7. Security & Role Data Scoping Enforcement ---');
    // Intern attempting to pass another intern's ID in query
    const internAttScoping = await request('GET', `/analytics/tasks?internId=${adminUser.id}`, null, internToken);
    assert(internAttScoping.status === 200, 'Intern query with external internId filter returns HTTP 200');
    assert(internAttScoping.body.data.total_tasks <= 3, 'Client-supplied internId does not bypass Intern role scope (scoped to self)');

    // --- Section 8: Live State Mutation & Auto Analytics Update Verification ---
    console.log('\n--- 8. Live State Mutation & Analytics Updates ---');

    // 8a. Add new task and check total_tasks increases
    const prevTaskCount = taskAnalytics.body.data.total_tasks;
    const dbClient2 = await pool.connect();
    await dbClient2.query(
      `INSERT INTO tasks (organization_id, department_id, creator_id, assignee_id, title, priority, status, due_date)
       VALUES ($1, $2, $3, $4, 'New Dynamic Analytics Task', 'low', 'todo', NOW() + INTERVAL '10 days');`,
      [orgId, createdDepartmentId, supervisorUser.id, internUser.id]
    );

    const newTaskAnalytics = await request('GET', '/analytics/tasks', null, hrToken);
    assert(newTaskAnalytics.body.data.total_tasks === prevTaskCount + 1, 'Task analytics updates immediately when a new task is created');

    // 8b. Add attendance record and check attendance present_count increases
    const prevPresentCount = attAnalytics.body.data.present_count;
    await dbClient2.query(
      `INSERT INTO attendance (organization_id, intern_id, date, check_in, check_out, status)
       VALUES ($1, $2, CURRENT_DATE - 10, (CURRENT_DATE - 10) + INTERVAL '9 hours', (CURRENT_DATE - 10) + INTERVAL '17 hours', 'present');`,
      [orgId, internUser.id]
    );
    dbClient2.release();

    const newAttAnalytics = await request('GET', `/analytics/attendance?internId=${internUser.id}`, null, hrToken);
    assert(newAttAnalytics.body.data.present_count === prevPresentCount + 1, 'Attendance analytics updates immediately when attendance is recorded');

    console.log(`\n📊 Verification Summary: ${passedTests} Passed, ${failedTests} Failed.`);
    if (failedTests > 0) process.exit(1);
  } catch (err) {
    console.error('\n❌ Verification suite error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

if (require.main === module) {
  runDay8Verification().then(() => pool.end());
}

module.exports = runDay8Verification;


