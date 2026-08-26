const http = require('http');
const app = require('../app');
const { pool } = require('../config/db');

async function runDay7Verification() {
  console.log('🧪 Starting Day 7: Notifications, Documents & Messaging Automated Verification Suite...\n');

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
    const text = await res.text();
    let json = {};
    try {
      json = JSON.parse(text);
    } catch (_) {
      json = { raw: text };
    }
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
    const testAdminEmail = `admin_d7_${timestamp}@example.com`;
    const testSupervisorEmail = `sup_d7_${timestamp}@example.com`;
    const testIntern1Email = `intern1_d7_${timestamp}@example.com`;
    const testIntern2Email = `intern2_d7_${timestamp}@example.com`;
    const testPassword = 'Password123!';

    let adminToken, supervisorToken, intern1Token, intern2Token;
    let supervisorUserId, intern1UserId, intern2UserId;

    // --- Setup Test Actors ---
    console.log('--- Setup: Registering Test Actors ---');
    const adminReg = await request('POST', '/auth/register', { email: testAdminEmail, password: testPassword, first_name: 'Admin', last_name: 'D7', role: 'admin' });
    adminToken = adminReg.body.data.tokens.accessToken;

    const supReg = await request('POST', '/auth/register', { email: testSupervisorEmail, password: testPassword, first_name: 'Super', last_name: 'VisorD7', role: 'supervisor' });
    supervisorToken = supReg.body.data.tokens.accessToken;
    supervisorUserId = supReg.body.data.user.id;

    const int1Reg = await request('POST', '/auth/register', { email: testIntern1Email, password: testPassword, first_name: 'Alice', last_name: 'Notifier', role: 'intern' });
    intern1Token = int1Reg.body.data.tokens.accessToken;
    intern1UserId = int1Reg.body.data.user.id;

    const int2Reg = await request('POST', '/auth/register', { email: testIntern2Email, password: testPassword, first_name: 'Bob', last_name: 'Messenger', role: 'intern' });
    intern2Token = int2Reg.body.data.tokens.accessToken;
    intern2UserId = int2Reg.body.data.user.id;

    assert(adminToken && supervisorToken && intern1Token && intern2Token, 'Successfully created test accounts for Day 7');

    // --- Section 1: Notifications & Event Triggers ---
    console.log('\n--- 1. Notifications & Event Triggers ---');

    // 1a. Assign a task -> triggers Notification for Intern 1
    const createTaskRes = await request('POST', '/tasks', {
      title: 'Day 7 Notification Test Task',
      description: 'Test task for event notifications',
      assignee_id: intern1UserId,
      priority: 'high',
      due_date: new Date(Date.now() + 86400000).toISOString(),
    }, supervisorToken);

    assert(createTaskRes.status === 201 && createTaskRes.body.data.id, 'Supervisor created task for Intern 1');
    const taskId = createTaskRes.body.data.id;

    // 1b. Intern 1 checks unread count & lists notifications
    const unreadCountRes1 = await request('GET', '/notifications/unread-count', null, intern1Token);
    assert(unreadCountRes1.status === 200 && unreadCountRes1.body.data.unread_count >= 1, 'GET /notifications/unread-count returns unread count >= 1 after task assignment');

    const notifListRes1 = await request('GET', '/notifications', null, intern1Token);
    assert(notifListRes1.status === 200 && Array.isArray(notifListRes1.body.data), 'GET /notifications returns array of user notifications');
    
    const taskNotif = notifListRes1.body.data.find(n => n.type === 'task' && n.user_id === intern1UserId);
    assert(taskNotif !== undefined, 'Task assignment notification received by Intern 1');
    const notifId = taskNotif ? taskNotif.id : null;

    // 1c. Mark single notification as read
    if (notifId) {
      const readRes = await request('PATCH', `/notifications/${notifId}/read`, null, intern1Token);
      assert(readRes.status === 200 && readRes.body.data.is_read === true, 'PATCH /notifications/:id/read marks notification as read');
    }

    // 1d. Unauthorized notification access (Intern 2 attempts to mark/delete Intern 1 notification)
    if (notifId) {
      const unauthReadRes = await request('PATCH', `/notifications/${notifId}/read`, null, intern2Token);
      assert(unauthReadRes.status === 403, 'Intern 2 modifying Intern 1 notification returns HTTP 403 Forbidden');
    }

    // 1e. Mark all notifications as read
    const readAllRes = await request('PATCH', '/notifications/read-all', null, intern1Token);
    assert(readAllRes.status === 200, 'PATCH /notifications/read-all executes successfully');

    const unreadCountRes2 = await request('GET', '/notifications/unread-count', null, intern1Token);
    assert(unreadCountRes2.status === 200 && unreadCountRes2.body.data.unread_count === 0, 'Unread notification count is now 0');

    // --- Section 2: Documents & Access Control ---
    console.log('\n--- 2. Documents Management & Server-side Security ---');

    // 2a. Intern 1 registers a document
    const createDocRes = await request('POST', '/documents', {
      title: 'Intern 1 ID Proof Document',
      file_name: 'id_proof.pdf',
      file_size: 1024,
      mime_type: 'application/pdf',
      category: 'id_proof',
      is_private: true,
      entity_type: 'user',
      entity_id: intern1UserId,
    }, intern1Token);

    assert(createDocRes.status === 201 && createDocRes.body.data.id, 'POST /documents registers document metadata with HTTP 201');
    const docId = createDocRes.body.data.id;

    // 2b. Intern 1 reads own document
    const getDocRes1 = await request('GET', `/documents/${docId}`, null, intern1Token);
    assert(getDocRes1.status === 200 && getDocRes1.body.data.title === 'Intern 1 ID Proof Document', 'Owner can retrieve document metadata');

    // 2c. Supervisor reads Intern 1 document
    const getDocResSup = await request('GET', `/documents/${docId}`, null, supervisorToken);
    assert(getDocResSup.status === 200, 'Supervisor can retrieve intern document');

    // 2d. Intern 2 attempts to read Intern 1 private document -> 403 Forbidden
    const getDocRes2 = await request('GET', `/documents/${docId}`, null, intern2Token);
    assert(getDocRes2.status === 403, 'Unauthorized user (Intern 2) accessing private document returns HTTP 403 Forbidden');

    // 2e. Download endpoint authorization check
    const dlRes1 = await request('GET', `/documents/${docId}/download`, null, intern1Token);
    assert(dlRes1.status === 200, 'Owner can access download endpoint');

    const dlRes2 = await request('GET', `/documents/${docId}/download`, null, intern2Token);
    assert(dlRes2.status === 403, 'Unauthorized user downloading document returns HTTP 403 Forbidden');

    // 2f. Update document metadata & soft delete
    const updateDocRes = await request('PUT', `/documents/${docId}`, { title: 'Updated Intern ID Document' }, intern1Token);
    assert(updateDocRes.status === 200 && updateDocRes.body.data.title === 'Updated Intern ID Document', 'PUT /documents/:id updates document metadata');

    const deleteDocRes = await request('DELETE', `/documents/${docId}`, null, intern1Token);
    assert(deleteDocRes.status === 200, 'DELETE /documents/:id soft-deletes document');

    // --- Section 3: Internal Messaging & Conversations ---
    console.log('\n--- 3. Internal Messaging & Access Boundaries ---');

    // 3a. Supervisor creates direct conversation with Intern 1
    const createConvRes1 = await request('POST', '/conversations', {
      recipient_id: intern1UserId,
      type: 'direct',
      initial_message: 'Welcome to Trakive! Let us know if you need any guidance.',
    }, supervisorToken);

    assert(createConvRes1.status === 201 && createConvRes1.body.data.id, 'POST /conversations creates direct conversation between Supervisor and Intern 1');
    const convId = createConvRes1.body.data.id;

    // 3b. Verify conversation idempotency (re-request direct conversation returns existing ID)
    const createConvRes2 = await request('POST', '/conversations', {
      recipient_id: intern1UserId,
      type: 'direct',
    }, supervisorToken);

    assert(createConvRes2.body.data.id === convId, 'Re-creating direct conversation between same participants returns existing conversation');

    // 3c. Send message from Intern 1 to Supervisor in conversation
    const sendMsgRes = await request('POST', `/conversations/${convId}/messages`, {
      content: 'Thank you Supervisor, I appreciate it!',
    }, intern1Token);

    assert(sendMsgRes.status === 201 && sendMsgRes.body.data.id, 'POST /conversations/:id/messages sends message successfully');
    const messageId = sendMsgRes.body.data.id;

    // 3d. Intern 1 lists conversations
    const listConvRes = await request('GET', '/conversations', null, intern1Token);
    assert(listConvRes.status === 200 && listConvRes.body.data.length > 0, 'GET /conversations lists user conversations');

    // 3e. Fetch conversation messages
    const getMsgsRes = await request('GET', `/conversations/${convId}/messages`, null, intern1Token);
    assert(getMsgsRes.status === 200 && Array.isArray(getMsgsRes.body.data) && getMsgsRes.body.data.length >= 2, 'GET /conversations/:id/messages returns conversation message history');

    // 3f. Non-participant (Intern 2) attempts to read & send message in conversation -> 403 Forbidden
    const unauthGetMsgsRes = await request('GET', `/conversations/${convId}/messages`, null, intern2Token);
    assert(unauthGetMsgsRes.status === 403, 'Non-participant reading conversation messages returns HTTP 403 Forbidden');

    const unauthSendMsgRes = await request('POST', `/conversations/${convId}/messages`, { content: 'Sneaky message' }, intern2Token);
    assert(unauthSendMsgRes.status === 403, 'Non-participant sending message to conversation returns HTTP 403 Forbidden');

    // 3g. Soft delete message
    const deleteMsgRes = await request('DELETE', `/messages/${messageId}`, null, intern1Token);
    assert(deleteMsgRes.status === 200, 'DELETE /messages/:id soft deletes message');

    // --- Section 4: End-to-End Event Integration Verification ---
    console.log('\n--- 4. End-to-End Event Integration Verification ---');

    // 4a. Task Submit Event
    const submitTaskRes = await request('POST', `/tasks/${taskId}/submit`, {
      submission_text: 'Task implementation complete with documentation.',
    }, intern1Token);

    assert(submitTaskRes.status === 201, 'Intern 1 submitted task');

    const supNotifsRes = await request('GET', '/notifications', null, supervisorToken);
    const taskSubNotif = supNotifsRes.body.data.find(n => n.type === 'task');
    assert(taskSubNotif !== undefined, 'Task submit event automatically triggered notification to Task Creator/Supervisor');

    // 4b. Task Review Approved Event
    const reviewTaskRes = await request('POST', `/tasks/${taskId}/review`, {
      status: 'approved',
      rating: 5,
      feedback: 'Excellent work!',
    }, supervisorToken);

    assert(reviewTaskRes.status === 201, 'Supervisor approved task');

    const int1NotifsRes = await request('GET', '/notifications', null, intern1Token);
    const taskApprovedNotif = int1NotifsRes.body.data.find(n => n.type === 'task' && n.title.includes('Approved'));
    assert(taskApprovedNotif !== undefined, 'Task approval event automatically triggered notification to Intern 1');

    // 4c. Leave Approved Event
    const submitLeaveRes = await request('POST', '/leave', {
      leave_type: 'casual',
      start_date: '2026-09-10',
      end_date: '2026-09-12',
      reason: 'Personal affairs',
    }, intern1Token);

    assert(submitLeaveRes.status === 201, 'Intern 1 submitted leave request');
    const leaveId = submitLeaveRes.body.data.id;

    const approveLeaveRes = await request('PATCH', `/leave/${leaveId}/approve`, {
      reviewer_comment: 'Enjoy your break',
    }, supervisorToken);

    assert(approveLeaveRes.status === 200, 'Supervisor approved leave request');

    const int1NotifsRes2 = await request('GET', '/notifications', null, intern1Token);
    const leaveApprovedNotif = int1NotifsRes2.body.data.find(n => n.type === 'leave' && n.title.includes('Approved'));
    assert(leaveApprovedNotif !== undefined, 'Leave approval event automatically triggered notification to Intern 1');

    console.log('\n==================================================');
    console.log(`📊 Day 7 Verification Complete: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('==================================================\n');

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Verification suite execution error:', err);
    process.exit(1);
  } finally {
    server.close();
    await pool.end();
  }
}

if (require.main === module) {
  runDay7Verification();
}

module.exports = runDay7Verification;
