const http = require('http');
const app = require('../app');
const { pool } = require('../config/db');

async function runDay6Verification() {
  console.log('🧪 Starting Day 6: Attendance, Leave & Activity Automated Verification Suite...\n');

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
      failedTests++;
    }
  };

  try {
    const timestamp = Date.now();
    const testAdminEmail = `admin_d6_${timestamp}@example.com`;
    const testHREmail = `hr_d6_${timestamp}@example.com`;
    const testSupervisorEmail = `sup_d6_${timestamp}@example.com`;
    const testIntern1Email = `intern1_d6_${timestamp}@example.com`;
    const testIntern2Email = `intern2_d6_${timestamp}@example.com`;
    const testPassword = 'Password123!';

    let adminToken, hrToken, supervisorToken, intern1Token, intern2Token;
    let supervisorUserId, intern1UserId, intern2UserId;
    let leaveId1, leaveId2;

    // --- Setup Test Actors ---
    console.log('--- Setup: Registering Test Actors ---');
    const adminReg = await request('POST', '/auth/register', { email: testAdminEmail, password: testPassword, first_name: 'Admin', last_name: 'D6', role: 'admin' });
    adminToken = adminReg.body.data.tokens.accessToken;

    const hrReg = await request('POST', '/auth/register', { email: testHREmail, password: testPassword, first_name: 'HR', last_name: 'D6', role: 'hr' });
    hrToken = hrReg.body.data.tokens.accessToken;

    const supReg = await request('POST', '/auth/register', { email: testSupervisorEmail, password: testPassword, first_name: 'Super', last_name: 'VisorD6', role: 'supervisor' });
    supervisorToken = supReg.body.data.tokens.accessToken;
    supervisorUserId = supReg.body.data.user.id;

    const int1Reg = await request('POST', '/auth/register', { email: testIntern1Email, password: testPassword, first_name: 'Alice', last_name: 'Attendance', role: 'intern' });
    intern1Token = int1Reg.body.data.tokens.accessToken;
    intern1UserId = int1Reg.body.data.user.id;

    const int2Reg = await request('POST', '/auth/register', { email: testIntern2Email, password: testPassword, first_name: 'Bob', last_name: 'Leave', role: 'intern' });
    intern2Token = int2Reg.body.data.tokens.accessToken;
    intern2UserId = int2Reg.body.data.user.id;

    assert(adminToken && hrToken && supervisorToken && intern1Token && intern2Token, 'Successfully created all Day 6 test accounts');

    // --- Section 1: Attendance Clock In / Out & Work Duration ---
    console.log('\n--- 1. Attendance Clock-in & Clock-out Rules ---');

    // Intern 2 attempts to clock out without clocking in -> 400 Bad Request
    const noClockInOutRes = await request('POST', '/attendance/clock-out', { notes: 'Early leave' }, intern2Token);
    assert(noClockInOutRes.status === 400, 'Clock-out without active clock-in returns HTTP 400 Bad Request');

    // Intern 1 Clock In -> 201 Created
    const clockInRes = await request('POST', '/attendance/clock-in', { notes: 'Arrived at office' }, intern1Token);
    assert(clockInRes.status === 201 && clockInRes.body.data.id, 'POST /attendance/clock-in records clock-in with status 201');
    assert(clockInRes.body.data.check_in !== null, 'Clock-in sets server check_in timestamp');
    assert(['present', 'late'].includes(clockInRes.body.data.status), 'Clock-in assigns status (present or late)');

    // Intern 1 attempts duplicate Clock In on same day -> 400 Bad Request
    const dupClockInRes = await request('POST', '/attendance/clock-in', { notes: 'Second clock in' }, intern1Token);
    assert(dupClockInRes.status === 400, 'Duplicate clock-in without clock-out returns HTTP 400 Bad Request');

    // Intern 1 Clock Out -> 200 OK
    const clockOutRes = await request('POST', '/attendance/clock-out', { notes: 'Finished work for today' }, intern1Token);
    assert(clockOutRes.status === 200 && clockOutRes.body.data.check_out !== null, 'POST /attendance/clock-out records check_out timestamp');
    assert(typeof clockOutRes.body.data.work_duration_minutes === 'number', 'Clock-out calculates work_duration_minutes');

    // Intern 1 attempts second Clock Out on same day -> 400 Bad Request
    const dupClockOutRes = await request('POST', '/attendance/clock-out', { notes: 'Second clock out' }, intern1Token);
    assert(dupClockOutRes.status === 400, 'Duplicate clock-out on same day returns HTTP 400 Bad Request');

    // --- Section 2: Attendance History, Filters & Pagination ---
    console.log('\n--- 2. Attendance History & Scoped Views ---');

    const meAttendanceRes = await request('GET', '/attendance/me', null, intern1Token);
    assert(meAttendanceRes.status === 200 && meAttendanceRes.body.data.length === 1, 'GET /attendance/me retrieves intern personal attendance history');

    const int2MeAttendanceRes = await request('GET', '/attendance/me', null, intern2Token);
    assert(int2MeAttendanceRes.status === 200 && int2MeAttendanceRes.body.data.length === 0, 'Unused intern GET /attendance/me returns empty list');

    const hrAttendanceRes = await request('GET', '/attendance', null, hrToken);
    assert(hrAttendanceRes.status === 200 && hrAttendanceRes.body.data.length >= 1, 'HR retrieves organization-wide attendance via GET /attendance');

    const todayStr = new Date().toISOString().split('T')[0];
    const filteredAttendanceRes = await request('GET', `/attendance?start_date=${todayStr}&end_date=${todayStr}`, null, supervisorToken);
    assert(filteredAttendanceRes.status === 200 && filteredAttendanceRes.body.data.length >= 1, 'GET /attendance supports date range filtering');

    // --- Section 3: Leave Request Submission & Date Rules ---
    console.log('\n--- 3. Leave Request Submission & Validation ---');

    // Submit leave with end_date before start_date -> 400 Bad Request
    const invalidDateLeaveRes = await request('POST', '/leave', {
      leave_type: 'casual',
      start_date: '2026-09-10',
      end_date: '2026-09-05',
      reason: 'Invalid end date before start date test',
    }, intern1Token);
    assert([400, 422].includes(invalidDateLeaveRes.status), 'Leave submission with end_date before start_date returns HTTP 400/422 Bad Request');

    // Intern 1 Submits Valid Leave Request
    const submitLeaveRes = await request('POST', '/leave', {
      leave_type: 'sick',
      start_date: '2026-09-01',
      end_date: '2026-09-03',
      reason: 'Attending medical checkup and recovery',
    }, intern1Token);
    assert(submitLeaveRes.status === 201 && submitLeaveRes.body.data.id, 'POST /leave submits leave request with status 201');
    assert(submitLeaveRes.body.data.status === 'pending', 'Newly submitted leave defaults to status: pending');
    leaveId1 = submitLeaveRes.body.data.id;

    // View personal leave
    const meLeaveRes = await request('GET', '/leave/me', null, intern1Token);
    assert(meLeaveRes.status === 200 && meLeaveRes.body.data.length === 1, 'GET /leave/me retrieves intern leave requests');

    // --- Section 4: Leave Approval, Rejection & Attendance Auto-Sync ---
    console.log('\n--- 4. Leave Approval, Rejection & Attendance Sync ---');

    // Intern 2 attempts to approve Intern 1's leave -> 403 Forbidden
    const internApproveRes = await request('POST', `/leave/${leaveId1}/approve`, { reviewer_comment: 'Self approve' }, intern2Token);
    assert(internApproveRes.status === 403, 'Intern blocked from approving leave request with HTTP 403 Forbidden');

    // Supervisor Approves Leave
    const approveRes = await request('POST', `/leave/${leaveId1}/approve`, { reviewer_comment: 'Approved. Get well soon!' }, supervisorToken);
    assert(approveRes.status === 200 && approveRes.body.data.status === 'approved', 'POST /leave/:id/approve approves leave request');
    assert(approveRes.body.data.reviewer_id === supervisorUserId, 'Leave approval records reviewer_id');

    // Verify Attendance Reflects Approved Leave
    const leaveAttendanceSyncRes = await request('GET', '/attendance/me?status=on_leave', null, intern1Token);
    assert(leaveAttendanceSyncRes.status === 200 && leaveAttendanceSyncRes.body.data.length === 3, 'Approved leave automatically populates on_leave attendance records for leave date range');

    // Attempt Overlapping Approved Leave
    const overlapLeaveRes = await request('POST', '/leave', {
      leave_type: 'casual',
      start_date: '2026-09-02',
      end_date: '2026-09-04',
      reason: 'Overlapping leave request test',
    }, intern1Token);
    assert(overlapLeaveRes.status === 400, 'Submitting leave overlapping existing approved leave returns HTTP 400 Bad Request');

    // Intern 2 Submits Leave & Supervisor Rejects
    const submitLeave2Res = await request('POST', '/leave', {
      leave_type: 'academic',
      start_date: '2026-09-15',
      end_date: '2026-09-16',
      reason: 'Attending university exams',
    }, intern2Token);
    leaveId2 = submitLeave2Res.body.data.id;

    const rejectRes = await request('POST', `/leave/${leaveId2}/reject`, { reviewer_comment: 'Insufficient coverage during project release' }, supervisorToken);
    assert(rejectRes.status === 200 && rejectRes.body.data.status === 'rejected', 'POST /leave/:id/reject rejects leave request');

    // Attempting to re-approve rejected leave -> 400 Bad Request
    const reApproveRes = await request('POST', `/leave/${leaveId2}/approve`, { reviewer_comment: 'Try re-approve' }, supervisorToken);
    assert(reApproveRes.status === 400, 'Server-side enforcement blocks approving an already rejected leave request');

    // --- Section 5: Daily Activity Stream ---
    console.log('\n--- 5. Daily Activity Stream ---');

    const activityRes = await request('GET', '/activity', null, supervisorToken);
    assert(activityRes.status === 200 && activityRes.body.data.length >= 4, 'GET /activity retrieves system activity feed');

    const actions = activityRes.body.data.map((a) => a.action);
    assert(
      actions.includes('attendance:clock_in') &&
      actions.includes('attendance:clock_out') &&
      actions.includes('leave:submit') &&
      actions.includes('leave:approve') &&
      actions.includes('leave:reject'),
      'Activity feed tracks key attendance and leave events'
    );

    const leaveActivityRes = await request('GET', '/activity?entity_type=leave_requests', null, hrToken);
    assert(leaveActivityRes.status === 200 && leaveActivityRes.body.data.every((a) => a.entity_type === 'leave_requests'), 'GET /activity supports entity_type filtering');

    console.log(`\n📊 Verification Summary: ${passedTests} Passed, ${failedTests} Failed.`);
    if (failedTests > 0) process.exit(1);
  } catch (err) {
    console.error('\n❌ Verification suite error:', err);
    process.exit(1);
  } finally {
    server.close();
    await pool.end();
  }
}

runDay6Verification();
