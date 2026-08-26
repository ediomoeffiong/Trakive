const http = require('http');
const app = require('../app');
const { pool } = require('../config/db');

async function runDay5Verification() {
  console.log('🧪 Starting Day 5: Tasks & Workflows Automated Verification Suite...\n');

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
    const testAdminEmail = `admin_d5_${timestamp}@example.com`;
    const testHREmail = `hr_d5_${timestamp}@example.com`;
    const testSupervisorEmail = `sup_d5_${timestamp}@example.com`;
    const testIntern1Email = `intern1_d5_${timestamp}@example.com`;
    const testIntern2Email = `intern2_d5_${timestamp}@example.com`;
    const testPassword = 'Password123!';

    let adminToken, hrToken, supervisorToken, intern1Token, intern2Token;
    let supervisorUserId, intern1UserId, intern2UserId;
    let taskId, task2Id;

    // --- Setup Test Actors ---
    console.log('--- Setup: Registering Test Actors ---');
    const adminReg = await request('POST', '/auth/register', { email: testAdminEmail, password: testPassword, first_name: 'Admin', last_name: 'D5', role: 'admin' });
    adminToken = adminReg.body.data.tokens.accessToken;

    const hrReg = await request('POST', '/auth/register', { email: testHREmail, password: testPassword, first_name: 'HR', last_name: 'D5', role: 'hr' });
    hrToken = hrReg.body.data.tokens.accessToken;

    const supReg = await request('POST', '/auth/register', { email: testSupervisorEmail, password: testPassword, first_name: 'Super', last_name: 'VisorD5', role: 'supervisor' });
    supervisorToken = supReg.body.data.tokens.accessToken;
    supervisorUserId = supReg.body.data.user.id;

    const int1Reg = await request('POST', '/auth/register', { email: testIntern1Email, password: testPassword, first_name: 'Alice', last_name: 'Assignee', role: 'intern' });
    intern1Token = int1Reg.body.data.tokens.accessToken;
    intern1UserId = int1Reg.body.data.user.id;

    const int2Reg = await request('POST', '/auth/register', { email: testIntern2Email, password: testPassword, first_name: 'Bob', last_name: 'Bystander', role: 'intern' });
    intern2Token = int2Reg.body.data.tokens.accessToken;
    intern2UserId = int2Reg.body.data.user.id;

    assert(adminToken && hrToken && supervisorToken && intern1Token && intern2Token, 'Successfully created all Day 5 test accounts');

    // --- Section 1: Task Creation & Assignment ---
    console.log('\n--- 1. Task Creation & Assignment ---');

    // Intern attempts to create task -> 403 Forbidden
    const internCreateRes = await request('POST', '/tasks', { title: 'Unauthorized Task', assignee_id: intern1UserId }, intern1Token);
    assert(internCreateRes.status === 403, 'Intern blocked from creating tasks with HTTP 403 Forbidden');

    // Supervisor creates task for Intern 1
    const createRes = await request('POST', '/tasks', {
      title: 'Build Auth Verification API',
      description: 'Implement automated integration tests for JWT token rotation',
      assignee_id: intern1UserId,
      priority: 'high',
      due_date: new Date(Date.now() + 86400000 * 7).toISOString(),
    }, supervisorToken);

    assert(createRes.status === 201 && createRes.body.data.id, 'POST /tasks creates task with status assigned');
    assert(createRes.body.data.status === 'assigned', 'Newly created task defaults to status: assigned');
    assert(createRes.body.data.assignee_id === intern1UserId, 'Task tracks correct assignee_id');
    assert(createRes.body.data.creator_id === supervisorUserId, 'Task tracks correct creator_id');
    taskId = createRes.body.data.id;

    // --- Section 2: Task Retrieval, Filtering & Pagination ---
    console.log('\n--- 2. Task Retrieval, Filtering & Pagination ---');

    const intern1ListRes = await request('GET', '/tasks', null, intern1Token);
    assert(intern1ListRes.status === 200 && intern1ListRes.body.data.length === 1, 'Assigned intern sees their task in GET /tasks');

    const intern2ListRes = await request('GET', '/tasks', null, intern2Token);
    assert(intern2ListRes.status === 200 && intern2ListRes.body.data.length === 0, 'Unassigned intern receives empty array in GET /tasks (RBAC filter)');

    const supSearchRes = await request('GET', '/tasks?search=Auth&priority=high', null, supervisorToken);
    assert(supSearchRes.status === 200 && supSearchRes.body.data.length === 1, 'GET /tasks supports search and priority filters');

    const getTaskRes = await request('GET', `/tasks/${taskId}`, null, intern1Token);
    assert(getTaskRes.status === 200 && getTaskRes.body.data.assignee_first_name === 'Alice', 'GET /tasks/:id returns detailed task view with user names');

    // --- Section 3: Task Workflow & Invalid Status Transitions ---
    console.log('\n--- 3. Task Workflow & Invalid Status Transitions ---');

    // Intern 1 starts task: assigned -> in_progress
    const startTaskRes = await request('PATCH', `/tasks/${taskId}/status`, { status: 'in_progress' }, intern1Token);
    assert(startTaskRes.status === 200 && startTaskRes.body.data.status === 'in_progress', 'PATCH /tasks/:id/status transitions status from assigned -> in_progress');

    // Invalid transition attempt: in_progress -> approved (intern trying to self-approve)
    const invalidTransRes = await request('PATCH', `/tasks/${taskId}/status`, { status: 'approved' }, intern1Token);
    assert(invalidTransRes.status === 400, 'Server-side enforcement blocks invalid state transition (in_progress -> approved)');

    // --- Section 4: Task Submissions ---
    console.log('\n--- 4. Task Submissions ---');

    // Intern 2 attempts to submit work for Intern 1's task -> 403 Forbidden
    const wrongSubmitRes = await request('POST', `/tasks/${taskId}/submit`, { submission_text: 'Wrong intern submit' }, intern2Token);
    assert(wrongSubmitRes.status === 403, 'Non-assignee intern blocked from submitting work with HTTP 403 Forbidden');

    // Intern 1 submits Version 1
    const submit1Res = await request('POST', `/tasks/${taskId}/submit`, {
      submission_text: 'Completed initial draft of Auth verification API',
      attachments: [{ file_name: 'auth_v1.js', file_size: 2048, mime_type: 'application/javascript' }],
    }, intern1Token);

    assert(submit1Res.status === 201 && submit1Res.body.data.version === 1, 'POST /tasks/:id/submit submits Version 1');
    assert(submit1Res.body.data.status === 'pending_review', 'Submission status defaults to pending_review');

    // Verify task status updated to submitted
    const postSubmitTaskRes = await request('GET', `/tasks/${taskId}`, null, supervisorToken);
    assert(postSubmitTaskRes.body.data.status === 'submitted', 'Task status updated to submitted after work submission');

    // --- Section 5: Review & Rejection Workflow ---
    console.log('\n--- 5. Review & Rejection Workflow ---');

    // Intern 1 attempts to review submission -> 403 Forbidden
    const internReviewRes = await request('POST', `/tasks/${taskId}/review`, { status: 'approved' }, intern1Token);
    assert(internReviewRes.status === 403, 'Intern blocked from reviewing task with HTTP 403 Forbidden');

    // Supervisor reviews and rejects Version 1
    const review1Res = await request('POST', `/tasks/${taskId}/review`, {
      status: 'rejected',
      rating: 2,
      feedback: 'Code needs error handling for expired JWT tokens and rate limiting',
    }, supervisorToken);

    assert(review1Res.status === 201 && review1Res.body.data.status === 'rejected', 'POST /tasks/:id/review submits rejection review');
    assert(review1Res.body.data.rating === 2, 'Review records score/rating');

    // Verify task status updated to rejected
    const postRejectTaskRes = await request('GET', `/tasks/${taskId}`, null, intern1Token);
    assert(postRejectTaskRes.body.data.status === 'rejected', 'Task status updated to rejected after supervisor rejection');

    // --- Section 6: Resubmission & Approval Workflow ---
    console.log('\n--- 6. Resubmission & Approval Workflow ---');

    // Intern 1 resubmits Version 2
    const resubmitRes = await request('POST', `/tasks/${taskId}/submit`, {
      submission_text: 'Added expired JWT handling and rate-limiter tests',
      attachments: [{ file_name: 'auth_v2.js', file_size: 4096, mime_type: 'application/javascript' }],
    }, intern1Token);

    assert(resubmitRes.status === 201 && resubmitRes.body.data.version === 2, 'POST /tasks/:id/submit resubmits Version 2 (preserves history)');

    // Verify submission history contains both v1 and v2
    const subHistoryRes = await request('GET', `/tasks/${taskId}/submissions`, null, supervisorToken);
    assert(subHistoryRes.status === 200 && subHistoryRes.body.data.length === 2, 'GET /tasks/:id/submissions preserves complete submission history');

    // Verify task status updated to resubmitted
    const postResubmitTaskRes = await request('GET', `/tasks/${taskId}`, null, supervisorToken);
    assert(postResubmitTaskRes.body.data.status === 'resubmitted', 'Task status updated to resubmitted after resubmission');

    // Supervisor reviews and approves Version 2
    const review2Res = await request('POST', `/tasks/${taskId}/review`, {
      status: 'approved',
      rating: 5,
      feedback: 'Outstanding work! Comprehensive coverage and clean code.',
    }, supervisorToken);

    assert(review2Res.status === 201 && review2Res.body.data.status === 'approved', 'POST /tasks/:id/review approves resubmission');

    // Verify task status updated to approved
    const postApproveTaskRes = await request('GET', `/tasks/${taskId}`, null, intern1Token);
    assert(postApproveTaskRes.body.data.status === 'approved', 'Task status updated to approved after review approval');

    // --- Section 7: Finalized State, Comments & Activity History ---
    console.log('\n--- 7. Finalized State, Comments & Activity History ---');

    // Attempting to resubmit approved task -> 400 Bad Request
    const submitApprovedRes = await request('POST', `/tasks/${taskId}/submit`, { submission_text: 'Try resubmit approved' }, intern1Token);
    assert(submitApprovedRes.status === 400, 'Server-side enforcement blocks resubmission of finalized/approved task');

    // Add comment
    const commentRes = await request('POST', `/tasks/${taskId}/comments`, { content: 'Thank you for the review feedback!' }, intern1Token);
    assert(commentRes.status === 201 && commentRes.body.data.content.includes('Thank you'), 'POST /tasks/:id/comments adds comment');

    const getCommentsRes = await request('GET', `/tasks/${taskId}/comments`, null, supervisorToken);
    assert(getCommentsRes.status === 200 && getCommentsRes.body.data.length === 1, 'GET /tasks/:id/comments retrieves task comments');

    // Activity history
    const activityRes = await request('GET', `/tasks/${taskId}/activity`, null, supervisorToken);
    assert(activityRes.status === 200 && activityRes.body.data.length >= 6, 'GET /tasks/:id/activity retrieves complete task activity timeline');

    const actions = activityRes.body.data.map((a) => a.action);
    assert(
      actions.includes('created') &&
      actions.includes('assigned') &&
      actions.includes('started') &&
      actions.includes('submitted') &&
      actions.includes('rejected') &&
      actions.includes('resubmitted') &&
      actions.includes('approved'),
      'Activity log contains all key events: created, assigned, started, submitted, rejected, resubmitted, approved'
    );

    // --- Section 8: Reassignment & Archiving ---
    console.log('\n--- 8. Reassignment & Task Archiving ---');

    const create2Res = await request('POST', '/tasks', { title: 'Draft Task 2', assignee_id: intern1UserId }, supervisorToken);
    task2Id = create2Res.body.data.id;

    // Reassign task to Intern 2
    const reassignRes = await request('PUT', `/tasks/${task2Id}`, { assignee_id: intern2UserId }, supervisorToken);
    assert(reassignRes.status === 200 && reassignRes.body.data.assignee_id === intern2UserId, 'PUT /tasks/:id reassigns task to new intern');

    const act2Res = await request('GET', `/tasks/${task2Id}/activity`, null, supervisorToken);
    assert(act2Res.body.data.some((a) => a.action === 'reassigned'), 'Activity log records reassigned action when assignee changes');

    // Archive task
    const deleteRes = await request('DELETE', `/tasks/${task2Id}`, null, supervisorToken);
    assert(deleteRes.status === 200 && deleteRes.body.data.deleted_at, 'DELETE /tasks/:id safely archives/soft-deletes task');

    const getDeletedRes = await request('GET', `/tasks/${task2Id}`, null, supervisorToken);
    assert(getDeletedRes.status === 404, 'Soft-deleted task returns HTTP 404 Not Found on subsequent requests');

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

runDay5Verification();
