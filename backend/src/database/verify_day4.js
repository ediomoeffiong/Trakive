const http = require('http');
const app = require('../app');
const { pool } = require('../config/db');

async function runDay4Verification() {
  console.log('🧪 Starting Day 4: Users, Interns & Onboarding Automated Verification Suite...\n');

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
    const testAdminEmail = `admin_${timestamp}@example.com`;
    const testHREmail = `hr_${timestamp}@example.com`;
    const testHeadEmail = `head_${timestamp}@example.com`;
    const testSupervisorEmail = `sup_${timestamp}@example.com`;
    const testApplicantEmail = `applicant_${timestamp}@example.com`;
    const testPassword = 'Password123!';

    let adminToken, hrToken, headToken, supervisorToken, applicantToken;
    let createdDepartmentId, createdSupervisorProfileId, createdInternshipId, createdApplicationId;

    // Setup Test Users with Different Roles
    console.log('--- Setup: Registering Test Actors ---');
    const adminReg = await request('POST', '/auth/register', { email: testAdminEmail, password: testPassword, first_name: 'Admin', last_name: 'User', role: 'admin' });
    adminToken = adminReg.body.data.tokens.accessToken;

    const hrReg = await request('POST', '/auth/register', { email: testHREmail, password: testPassword, first_name: 'HR', last_name: 'Manager', role: 'hr' });
    hrToken = hrReg.body.data.tokens.accessToken;

    const headReg = await request('POST', '/auth/register', { email: testHeadEmail, password: testPassword, first_name: 'Dept', last_name: 'Head', role: 'head' });
    headToken = headReg.body.data.tokens.accessToken;
    const headUserId = headReg.body.data.user.id;

    const supReg = await request('POST', '/auth/register', { email: testSupervisorEmail, password: testPassword, first_name: 'Super', last_name: 'Visor', role: 'supervisor' });
    supervisorToken = supReg.body.data.tokens.accessToken;
    const supervisorUserId = supReg.body.data.user.id;

    const appReg = await request('POST', '/auth/register', { email: testApplicantEmail, password: testPassword, first_name: 'App', last_name: 'Lycant', role: 'intern' });
    applicantToken = appReg.body.data.tokens.accessToken;
    const applicantUserId = appReg.body.data.user.id;

    assert(adminToken && hrToken && supervisorToken && applicantToken, 'Successfully created all role test accounts');

    // Section 1: User Management & Profile Security
    console.log('\n--- 1. User Management & Profile Security ---');
    const getProfileRes = await request('GET', '/users/profile', null, applicantToken);
    assert(getProfileRes.status === 200 && getProfileRes.body.data.user.email === testApplicantEmail, 'GET /users/profile returns current user profile');

    const updateProfileRes = await request('PUT', '/users/profile', {
      first_name: 'UpdatedApplicant',
      phone: '+1234567890',
      institution: 'State University',
      field_of_study: 'Computer Science',
      academic_year: 'Senior',
      emergency_contact: { name: 'Parent', relationship: 'Mother', phone: '+1987654321' },
      skills: ['JavaScript', 'Node.js', 'PostgreSQL'],
      role: 'admin', // Attempting privilege escalation
    }, applicantToken);

    assert(updateProfileRes.status === 200 && updateProfileRes.body.data.user.first_name === 'UpdatedApplicant', 'PUT /users/profile updates contact & academic details');
    assert(updateProfileRes.body.data.user.role_name === 'intern', 'Profile update protects system role (privilege escalation blocked)');

    const avatarRes = await request('PATCH', '/users/profile/avatar', { avatar_url: 'https://example.com/avatar.jpg' }, applicantToken);
    assert(avatarRes.status === 200 && avatarRes.body.data.avatar_url === 'https://example.com/avatar.jpg', 'PATCH /users/profile/avatar updates avatar URL reference');

    const searchUsersRes = await request('GET', '/users?search=UpdatedApplicant', null, hrToken);
    assert(searchUsersRes.status === 200 && searchUsersRes.body.data.length > 0, 'GET /users supports search & pagination for HR/Admin');

    const deactivateUserRes = await request('PATCH', `/users/${applicantUserId}/status`, { status: 'suspended' }, hrToken);
    assert(deactivateUserRes.status === 200 && deactivateUserRes.body.data.status === 'suspended', 'PATCH /users/:id/status updates user status to suspended');

    // Reactivate user for remaining workflow
    await request('PATCH', `/users/${applicantUserId}/status`, { status: 'active' }, hrToken);

    // Section 2: Organization & Department Management
    console.log('\n--- 2. Organization & Department Structure ---');
    const createDeptRes = await request('POST', '/departments', {
      name: `Engineering_${timestamp}`,
      code: `ENG_${timestamp}`,
      description: 'Software Engineering Department',
    }, hrToken);
    assert(createDeptRes.status === 201 && createDeptRes.body.data.id, 'POST /departments creates new department');
    createdDepartmentId = createDeptRes.body.data.id;

    const assignHeadRes = await request('POST', `/departments/${createdDepartmentId}/head`, { head_user_id: headUserId }, hrToken);
    assert(assignHeadRes.status === 200 && assignHeadRes.body.data.head_user_id === headUserId, 'POST /departments/:id/head assigns department head');

    const assignSupRes = await request('POST', `/departments/${createdDepartmentId}/supervisors`, { supervisor_user_ids: [supervisorUserId] }, hrToken);
    assert(assignSupRes.status === 200 && assignSupRes.body.data.assigned_supervisors.length > 0, 'POST /departments/:id/supervisors assigns supervisors to department');
    createdSupervisorProfileId = assignSupRes.body.data.assigned_supervisors[0].id;

    const getStaffRes = await request('GET', `/departments/${createdDepartmentId}/staff`, null, hrToken);
    assert(getStaffRes.status === 200 && getStaffRes.body.data.staff.length >= 2, 'GET /departments/:id/staff returns department staff');

    // Section 3: Intern Management
    console.log('\n--- 3. Intern Management ---');
    const createInternRes = await request('POST', '/interns', {
      email: `intern_created_${timestamp}@example.com`,
      password: testPassword,
      first_name: 'Direct',
      last_name: 'Intern',
      department_id: createdDepartmentId,
      supervisor_id: createdSupervisorProfileId,
      institution: 'Tech Institute',
      field_of_study: 'Software Engineering',
    }, hrToken);
    assert(createInternRes.status === 201 && createInternRes.body.data.user_id, 'POST /interns creates intern user and profile');
    const directInternUserId = createInternRes.body.data.user_id;

    const getInternRes = await request('GET', `/interns/${directInternUserId}`, null, hrToken);
    assert(getInternRes.status === 200 && getInternRes.body.data.department_name.startsWith('Engineering'), 'GET /interns/:id retrieves full intern profile');

    const listInternsRes = await request('GET', `/interns?department_id=${createdDepartmentId}`, null, hrToken);
    assert(listInternsRes.status === 200 && listInternsRes.body.data.length > 0, 'GET /interns lists interns with pagination and department filters');

    const updateInternStatusRes = await request('PATCH', `/interns/${directInternUserId}/status`, { status: 'active' }, hrToken);
    assert(updateInternStatusRes.status === 200 && updateInternStatusRes.body.data.status === 'active', 'PATCH /interns/:id/status updates intern status');

    // Section 4: Internship Onboarding Workflow
    console.log('\n--- 4. Internship & Onboarding Workflow ---');

    // Fetch org ID
    const dbClient = await pool.connect();
    const orgResult = await dbClient.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgResult.rows[0].id;

    const internshipResult = await dbClient.query(
      `INSERT INTO internships (organization_id, department_id, title, description, start_date, end_date, capacity, status)
       VALUES ($1, $2, $3, $4, CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', 5, 'open')
       RETURNING id;`,
      [orgId, createdDepartmentId, `Backend Track ${timestamp}`, 'Software Internship']
    );
    createdInternshipId = internshipResult.rows[0].id;
    dbClient.release();

    // 4a. Create Application
    const applyRes = await request('POST', '/applications', {
      internship_id: createdInternshipId,
      institution: 'University of Tech',
      field_of_study: 'Cybernetics',
      academic_year: 'Junior',
      cover_letter: 'Excited to apply for backend track',
    }, applicantToken);
    assert(applyRes.status === 201 && applyRes.body.data.status === 'applied', 'Step 1: POST /applications submits internship application (Status: applied)');
    createdApplicationId = applyRes.body.data.id;

    // 4b. Invalid Transition Check: Try to complete onboarding directly
    const invalidTransRes = await request('POST', '/onboarding/complete', { application_id: createdApplicationId }, hrToken);
    assert(invalidTransRes.status === 400, 'Server-side enforcement blocks invalid state transition (applied -> completed)');

    // 4c. Review Application: Move to under_review then approved
    const reviewRes = await request('PATCH', `/applications/${createdApplicationId}/review`, { status: 'under_review', notes: 'Initial screening passed' }, hrToken);
    assert(reviewRes.status === 200 && reviewRes.body.data.status === 'under_review', 'Step 2: PATCH /applications/:id/review updates status to under_review');

    const approveRes = await request('PATCH', `/applications/${createdApplicationId}/approve`, {}, hrToken);
    assert(approveRes.status === 200 && approveRes.body.data.status === 'accepted', 'Step 3: PATCH /applications/:id/approve approves application (Status: accepted)');

    // 4d. Create/Link Intern Account
    const accountLinkRes = await request('POST', `/applications/${createdApplicationId}/create-account`, { password: testPassword }, hrToken);
    assert(accountLinkRes.status === 201 && accountLinkRes.body.data.application.status === 'account_created', 'Step 4: POST /applications/:id/create-account links account (Status: account_created)');

    // 4e. Submit Onboarding Info & Documents
    const onbInfoRes = await request('POST', '/onboarding/info', {
      application_id: createdApplicationId,
      emergency_contact: { name: 'Guardian', relationship: 'Father', phone: '+1122334455' },
      skills: ['Node.js', 'PostgreSQL'],
    }, applicantToken);
    assert(onbInfoRes.status === 200, 'Step 5: POST /onboarding/info submits onboarding profile info');

    const docUploadRes = await request('POST', '/onboarding/documents', {
      application_id: createdApplicationId,
      title: 'National ID Proof',
      file_name: 'id_card.pdf',
      file_path: '/uploads/documents/id_card.pdf',
      file_size: 102450,
      mime_type: 'application/pdf',
      category: 'id_proof',
    }, applicantToken);
    assert(docUploadRes.status === 201 && docUploadRes.body.data.category === 'id_proof', 'Step 6: POST /onboarding/documents uploads required document');

    const trackDocsRes = await request('GET', '/onboarding/documents', null, applicantToken);
    assert(trackDocsRes.status === 200 && trackDocsRes.body.data.documents.length > 0, 'Step 7: GET /onboarding/documents tracks uploaded documents & checklist');

    // 4f. Assign Department & Supervisor for Onboarding
    const assignOnbRes = await request('PATCH', '/onboarding/assign', {
      application_id: createdApplicationId,
      department_id: createdDepartmentId,
      supervisor_id: createdSupervisorProfileId,
    }, hrToken);
    assert(assignOnbRes.status === 200 && assignOnbRes.body.data.application.status === 'onboarding_in_progress', 'Step 8: PATCH /onboarding/assign assigns supervisor (Status: onboarding_in_progress)');

    // 4g. Complete Onboarding
    const completeOnbRes = await request('POST', '/onboarding/complete', { application_id: createdApplicationId }, hrToken);
    assert(completeOnbRes.status === 200 && completeOnbRes.body.data.application.status === 'onboarding_completed' && completeOnbRes.body.data.intern_profile.intern_status === 'active', 'Step 9: POST /onboarding/complete activates internship (Status: onboarding_completed / active)');

    // Section 5: Access Control Restrictions
    console.log('\n--- 5. Access Control & Role Enforcement ---');
    const applicantTryDeleteDept = await request('PATCH', `/departments/${createdDepartmentId}/status`, {}, applicantToken);
    assert(applicantTryDeleteDept.status === 403, 'Intern blocked from deactivating departments with HTTP 403 Forbidden');

    const supTryCreateIntern = await request('POST', '/interns', { email: 'sup_create@example.com', first_name: 'X', last_name: 'Y' }, supervisorToken);
    assert(supTryCreateIntern.status === 403, 'Supervisor blocked from creating intern accounts with HTTP 403 Forbidden');

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

runDay4Verification();
