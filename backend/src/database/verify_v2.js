const http = require('http');
const app = require('../app');
const { pool } = require('../config/db');

async function runVerificationV2() {
  console.log('🧪 Starting Trakive Refactored Verification Suite (V2)...\n');

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

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  };

  try {
    const timestamp = Date.now();
    const superAdminEmail = 'superadmin@trakive.com';
    const superAdminPassword = 'SuperAdmin123!';

    let superAdminToken = null;
    let dept1Id = null;
    let dept2Id = null;
    let supervisor1UserId = null;
    let supervisor1ProfileId = null;
    let supervisor2UserId = null;
    let supervisor2ProfileId = null;
    let internUserId = null;

    // --- TEST 1: Mock Data Cleanliness ---
    console.log('--- Test 1: Verify Mock Business Data Removal & System Data Preservation ---');
    const client = await pool.connect();
    const tasksCount = await client.query('SELECT COUNT(*) FROM tasks');
    const attCount = await client.query('SELECT COUNT(*) FROM attendance');
    const leaveCount = await client.query('SELECT COUNT(*) FROM leave_requests');
    const docsCount = await client.query('SELECT COUNT(*) FROM documents');
    const rolesCount = await client.query('SELECT COUNT(*) FROM roles');
    const orgsCount = await client.query('SELECT COUNT(*) FROM organizations');
    client.release();

    assert(
      parseInt(tasksCount.rows[0].count, 10) === 0 &&
      parseInt(attCount.rows[0].count, 10) === 0 &&
      parseInt(leaveCount.rows[0].count, 10) === 0 &&
      parseInt(docsCount.rows[0].count, 10) === 0,
      'All business mock data (tasks, attendance, leave, documents) cleared'
    );
    assert(
      parseInt(rolesCount.rows[0].count, 10) >= 5 && parseInt(orgsCount.rows[0].count, 10) >= 1,
      'System roles and organization foundational data preserved'
    );

    // --- TEST 2: Super Admin Login & Privilege ---
    console.log('\n--- Test 2: Super Admin Login & System Administration ---');
    const saLogin = await request('POST', '/auth/login', {
      email: superAdminEmail,
      password: superAdminPassword,
    });
    assert(
      saLogin.status === 200 && saLogin.body.data.tokens.accessToken,
      'Super Admin logs in successfully with HTTP 200'
    );
    superAdminToken = saLogin.body.data.tokens.accessToken;

    const saProfile = await request('GET', '/auth/me', null, superAdminToken);
    assert(
      saProfile.status === 200 && saProfile.body.data.user.role_name === 'super_admin',
      'Super Admin profile returned with role super_admin'
    );

    // Block SUPER_ADMIN selection during registration
    const blockSaReg = await request('POST', '/auth/register', {
      email: `fake_sa_${timestamp}@example.com`,
      password: 'Password123!',
      first_name: 'Fake',
      last_name: 'SuperAdmin',
      role: 'super_admin',
    });
    assert(
      blockSaReg.status === 400 || blockSaReg.status === 422,
      'Registration with role super_admin blocked with client error (HTTP 400/422)',
      `Status: ${blockSaReg.status}`
    );

    // --- TEST 3: Department Setup ---
    console.log('\n--- Test 3: Create Departments & Supervisors ---');
    const dept1Res = await request('POST', '/departments', {
      name: `IT Department ${timestamp}`,
      code: `IT_${timestamp}`,
      description: 'Information Technology',
    }, superAdminToken);
    assert(dept1Res.status === 201, 'Super Admin creates IT Department');
    dept1Id = dept1Res.body.data.id;

    const dept2Res = await request('POST', '/departments', {
      name: `HR Department ${timestamp}`,
      code: `HR_${timestamp}`,
      description: 'Human Resources',
    }, superAdminToken);
    assert(dept2Res.status === 201, 'Super Admin creates HR Department');
    dept2Id = dept2Res.body.data.id;

    // Register Supervisor 1 in IT Dept
    const sup1Email = `sup1_it_${timestamp}@example.com`;
    const sup1Reg = await request('POST', '/auth/register', {
      email: sup1Email,
      password: 'Password123!',
      first_name: 'David',
      last_name: 'IT Supervisor',
      role: 'supervisor',
      department_id: dept1Id,
    });
    assert(sup1Reg.status === 201, 'Registered IT Supervisor 1');
    supervisor1UserId = sup1Reg.body.data.user.id;

    // Assign supervisor profile to IT dept
    const sup1Assign = await request('POST', `/departments/${dept1Id}/supervisors`, {
      supervisor_user_ids: [supervisor1UserId],
    }, superAdminToken);
    assert(sup1Assign.status === 200, 'Super Admin assigned Supervisor 1 to IT Department');
    supervisor1ProfileId = sup1Assign.body.data.assigned_supervisors[0].id;

    // Register Supervisor 2 in HR Dept
    const sup2Email = `sup2_hr_${timestamp}@example.com`;
    const sup2Reg = await request('POST', '/auth/register', {
      email: sup2Email,
      password: 'Password123!',
      first_name: 'Alice',
      last_name: 'HR Supervisor',
      role: 'supervisor',
      department_id: dept2Id,
    });
    assert(sup2Reg.status === 201, 'Registered HR Supervisor 2');
    supervisor2UserId = sup2Reg.body.data.user.id;

    const sup2Assign = await request('POST', `/departments/${dept2Id}/supervisors`, {
      supervisor_user_ids: [supervisor2UserId],
    }, superAdminToken);
    assert(sup2Assign.status === 200, 'Super Admin assigned Supervisor 2 to HR Department');
    supervisor2ProfileId = sup2Assign.body.data.assigned_supervisors[0].id;

    // --- TEST 4: Registration -> Pending Status -> Department Supervisor Assignment ---
    console.log('\n--- Test 4: Intern Registration, Pending Approval, Department Supervisor Assignment ---');
    const internEmail = `intern_test_${timestamp}@example.com`;
    const internPassword = 'Password123!';

    const internReg = await request('POST', '/auth/register', {
      email: internEmail,
      password: internPassword,
      first_name: 'John',
      last_name: 'Doe',
      department_id: dept1Id,
    });
    assert(
      internReg.status === 201 && internReg.body.data.user.status === 'pending',
      'Intern registers with department; default status is pending'
    );
    internUserId = internReg.body.data.user.id;

    // Login attempt while pending must be forbidden
    const pendingLogin = await request('POST', '/auth/login', {
      email: internEmail,
      password: internPassword,
    });
    assert(
      pendingLogin.status === 403,
      'Login blocked while account status is pending (HTTP 403)'
    );

    // Attempt assigning supervisor from wrong department (HR Supervisor to IT Intern)
    const wrongSupAssign = await request('PATCH', `/interns/${internUserId}/supervisor`, {
      supervisor_id: supervisor2ProfileId,
    }, superAdminToken);
    assert(
      wrongSupAssign.status === 400,
      'Assigning supervisor from wrong department blocked with HTTP 400 Bad Request',
      `Status: ${wrongSupAssign.status}`
    );

    // Assign supervisor from correct department (IT Supervisor 1 to IT Intern)
    const validSupAssign = await request('PATCH', `/interns/${internUserId}/supervisor`, {
      supervisor_id: supervisor1ProfileId,
    }, superAdminToken);
    assert(
      validSupAssign.status === 200 && validSupAssign.body.data.supervisor_id === supervisor1ProfileId,
      'Assigning supervisor from same department succeeds'
    );

    // Intern account should now be active and able to login
    const activeLogin = await request('POST', '/auth/login', {
      email: internEmail,
      password: internPassword,
    });
    assert(
      activeLogin.status === 200 && activeLogin.body.data.tokens.accessToken,
      'Intern account activated upon supervisor assignment and login succeeds'
    );

    // --- TEST 5: Supervisor Departure & Reassignment Flow ---
    console.log('\n--- Test 5: Supervisor Departure & Reassignment Flow ---');
    // Deactivate IT Supervisor 1
    const deactSup = await request('PATCH', `/users/${supervisor1UserId}/status`, {
      status: 'inactive',
    }, superAdminToken);
    assert(
      deactSup.status === 200 && deactSup.body.data.status === 'inactive',
      'Supervisor 1 account deactivated to inactive status (account preserved)'
    );

    // Verify affected intern's supervisor_id set to null & history marked reassignment_required
    const getInternRes = await request('GET', `/interns/${internUserId}`, null, superAdminToken);
    assert(
      getInternRes.status === 200 && getInternRes.body.data.supervisor_id === null,
      "Deactivated supervisor cleared from intern profile (supervisor_id = null)"
    );

    const historyRes = await request('GET', `/interns/${internUserId}/history`, null, superAdminToken);
    assert(
      historyRes.status === 200 &&
      historyRes.body.data.assignment_history.length > 0 &&
      historyRes.body.data.assignment_history[0].status === 'reassignment_required',
      'Historical assignment marked as reassignment_required'
    );

    // Verify Super Admin notification created
    const notifRes = await request('GET', '/notifications', null, superAdminToken);
    assert(
      notifRes.status === 200 &&
      notifRes.body.data.some((n) => n.title.includes('Supervisor Deactivated')),
      'Super Admin receives notification for supervisor deactivation & required reassignment'
    );

    // Register a new replacement supervisor in IT Dept
    const sup3Email = `sup3_it_${timestamp}@example.com`;
    const sup3Reg = await request('POST', '/auth/register', {
      email: sup3Email,
      password: 'Password123!',
      first_name: 'Bob',
      last_name: 'IT Replacement Supervisor',
      role: 'supervisor',
      department_id: dept1Id,
    });
    const sup3UserId = sup3Reg.body.data.user.id;
    const sup3Assign = await request('POST', `/departments/${dept1Id}/supervisors`, {
      supervisor_user_ids: [sup3UserId],
    }, superAdminToken);
    const supervisor3ProfileId = sup3Assign.body.data.assigned_supervisors[0].id;

    // Super Admin reassigns intern to new replacement supervisor in IT department
    const reassignRes = await request('PATCH', `/interns/${internUserId}/supervisor`, {
      supervisor_id: supervisor3ProfileId,
    }, superAdminToken);
    assert(
      reassignRes.status === 200 && reassignRes.body.data.supervisor_id === supervisor3ProfileId,
      'Super Admin reassigns intern to new replacement supervisor in IT department'
    );

    const updatedHistoryRes = await request('GET', `/interns/${internUserId}/history`, null, superAdminToken);
    assert(
      updatedHistoryRes.status === 200 &&
      updatedHistoryRes.body.data.assignment_history.length >= 2 &&
      updatedHistoryRes.body.data.assignment_history[0].status === 'active',
      'Assignment history retains old reassignment_required record and adds new active assignment'
    );

    console.log(`\n📊 Verification Summary: ${passed} Passed, ${failed} Failed.`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('\n❌ Verification suite error:', err);
    process.exit(1);
  } finally {
    server.close();
    await pool.end();
  }
}

runVerificationV2();
