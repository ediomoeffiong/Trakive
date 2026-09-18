/**
 * @file verify_onboarding_cwg_fifthlab.js
 * @description End-to-end verification script for CWG PLC / FifthLab Onboarding Flow
 */

const assert = require('assert');
const app = require('../app');
const { query } = require('../config/db');

// Helper HTTP requester
const request = async (method, path, body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const reqObj = {
    method,
    headers,
  };
  if (body) reqObj.body = JSON.stringify(body);

  // Use fetch on internal app port or express test helper
  const http = require('http');
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      const opts = {
        hostname: '127.0.0.1',
        port,
        path: `/api/v1${path}`,
        method,
        headers,
      };

      const req = http.request(opts, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          server.close();
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = { raw: data };
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      });

      req.on('error', (err) => {
        server.close();
        reject(err);
      });

      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  });
};

async function runVerification() {
  console.log('🧪 Starting E2E Verification for CWG PLC & FifthLab Onboarding Flow...\n');

  // Step 1: Reject registration for invalid email domains
  console.log('Step 1: Testing domain restriction for invalid email domains...');
  const invalidReg = await request('POST', '/auth/register', {
    email: 'unauthorized@gmail.com',
    password: 'Password123!',
    first_name: 'Invalid',
    last_name: 'Domain',
    role: 'intern',
  });
  assert(invalidReg.status === 400, 'Registration with @gmail.com must be rejected');
  assert(
    invalidReg.body.message.includes('@cwg-plc.com or @thefifthlab.com'),
    'Error message must state allowed domains'
  );
  console.log('  ✅ Invalid domain (@gmail.com) registration correctly rejected.');

  const fifthlabOldReg = await request('POST', '/auth/register', {
    email: 'unauthorized@fifthlab.com',
    password: 'Password123!',
    first_name: 'Invalid',
    last_name: 'Fifthlab',
    role: 'intern',
  });
  assert(fifthlabOldReg.status === 400, 'Registration with @fifthlab.com must be rejected');
  assert(
    fifthlabOldReg.body.message.includes('@cwg-plc.com or @thefifthlab.com'),
    'Error message must state allowed domains'
  );
  console.log('  ✅ Invalid domain (@fifthlab.com) registration correctly rejected.\n');

  // Step 2: Register FifthLab Intern
  console.log('Step 2: Registering FifthLab Intern (@thefifthlab.com)...');
  const fifthlabEmail = `test.fifthlab.${Date.now()}@thefifthlab.com`;
  const fifthlabReg = await request('POST', '/auth/register', {
    email: fifthlabEmail,
    password: 'Password123!',
    first_name: 'FifthLab',
    last_name: 'Intern',
    role: 'intern',
  });
  assert(fifthlabReg.status === 201, 'FifthLab intern registration must succeed');
  const fifthlabToken = fifthlabReg.body.data.tokens.accessToken;
  const fifthlabUserId = fifthlabReg.body.data.user.id;
  assert(fifthlabReg.body.data.user.organization_id !== null, 'FifthLab user must have organization_id');
  console.log('  ✅ FifthLab intern registered successfully.\n');

  // Step 3: Register CWG PLC Intern
  console.log('Step 3: Registering CWG PLC Intern (@cwg-plc.com)...');
  const cwgEmail = `test.cwg.${Date.now()}@cwg-plc.com`;
  const cwgReg = await request('POST', '/auth/register', {
    email: cwgEmail,
    password: 'Password123!',
    first_name: 'CWG',
    last_name: 'Intern',
    role: 'intern',
  });
  assert(cwgReg.status === 201, 'CWG PLC intern registration must succeed');
  assert(cwgReg.body.data.user.organization_id !== null, 'CWG user must have organization_id');
  console.log('  ✅ CWG PLC intern registered successfully.\n');

  // Step 4: Login with old @trakive.com email should fail
  console.log('Step 4: Verifying old @trakive.com login fails...');
  const oldLogin = await request('POST', '/auth/login', {
    email: 'supervisor@trakive.com',
    password: 'Supervisor123!',
  });
  assert(oldLogin.status === 401, 'Login with old @trakive.com email must fail');
  console.log('  ✅ Old @trakive.com login correctly rejected.\n');

  // Step 5: Department selection & supervisor auto-assignment
  console.log('Step 5: Selecting department and auto-assigning supervisor...');
  const deptRes = await query('SELECT id FROM departments LIMIT 1');
  const deptId = deptRes.rows[0].id;

  const infoRes = await request(
    'POST',
    '/onboarding/info',
    {
      department_id: deptId,
      institution: 'University of Technology',
      field_of_study: 'Software Engineering',
      academic_year: '2026',
    },
    fifthlabToken
  );
  assert(infoRes.status === 200, 'Submitting onboarding info with department must succeed');
  console.log('  ✅ Department selected & supervisor auto-assignment executed.\n');

  // Step 6: Test document size limit validation (>10MB)
  console.log('Step 6: Testing 10 MB document size limit validation...');
  const oversizedDoc = await request(
    'POST',
    '/onboarding/documents',
    {
      title: 'Oversized Resume',
      file_name: 'resume_huge.pdf',
      file_path: '/uploads/documents/resume_huge.pdf',
      file_size: 11 * 1024 * 1024, // 11 MB
      mime_type: 'application/pdf',
      category: 'resume',
    },
    fifthlabToken
  );
  assert([400, 422].includes(oversizedDoc.status), 'Oversized document (>10MB) must be rejected');
  console.log('  ✅ Document >10 MB correctly rejected.\n');

  // Step 7: Test document file format validation
  console.log('Step 7: Testing file format validation...');
  const invalidFormatDoc = await request(
    'POST',
    '/onboarding/documents',
    {
      title: 'Executable File',
      file_name: 'malicious.exe',
      file_path: '/uploads/documents/malicious.exe',
      file_size: 100000,
      mime_type: 'application/x-msdownload',
      category: 'resume',
    },
    fifthlabToken
  );
  assert([400, 422].includes(invalidFormatDoc.status), 'Invalid MIME type must be rejected');
  console.log('  ✅ Invalid file format correctly rejected.\n');

  // Step 8: Upload all 3 required onboarding documents
  console.log('Step 8: Uploading 3 required onboarding documents...');
  const resumeRes = await request(
    'POST',
    '/onboarding/documents',
    {
      title: 'Intern Resume',
      file_name: 'resume.pdf',
      file_path: '/uploads/documents/resume.pdf',
      file_size: 1024 * 500,
      mime_type: 'application/pdf',
      category: 'resume',
    },
    fifthlabToken
  );
  assert(resumeRes.status === 200 || resumeRes.status === 201, 'Resume upload must succeed');

  const placementRes = await request(
    'POST',
    '/onboarding/documents',
    {
      title: 'Placement Letter',
      file_name: 'placement_letter.pdf',
      file_path: '/uploads/documents/placement_letter.pdf',
      file_size: 1024 * 600,
      mime_type: 'application/pdf',
      category: 'placement_letter',
    },
    fifthlabToken
  );
  assert(placementRes.status === 200 || placementRes.status === 201, 'Placement letter upload must succeed');

  const acceptanceRes = await request(
    'POST',
    '/onboarding/documents',
    {
      title: 'Acceptance Letter',
      file_name: 'acceptance_letter.pdf',
      file_path: '/uploads/documents/acceptance_letter.pdf',
      file_size: 1024 * 400,
      mime_type: 'application/pdf',
      category: 'acceptance_letter',
    },
    fifthlabToken
  );
  assert(acceptanceRes.status === 200 || acceptanceRes.status === 201, 'Acceptance letter upload must succeed');
  console.log('  ✅ All 3 documents uploaded successfully.\n');

  // Step 9: Track intern documents checklist
  console.log('Step 9: Tracking document checklist status...');
  const trackRes = await request('GET', '/onboarding/documents', null, fifthlabToken);
  assert(trackRes.status === 200, 'Document tracking must succeed');
  assert(trackRes.body.data.checklist.length === 3, 'Checklist must contain 3 required documents');
  assert(trackRes.body.data.approved_count === 0, 'Initial approved count must be 0');
  assert(trackRes.body.data.onboarding_ready === false, 'Onboarding ready must be false initially');
  console.log(`  ✅ Document checklist tracked: ${trackRes.body.data.progress_label}.\n`);

  // Step 10: Supervisor review - Login dev supervisor (@thefifthlab.com)
  console.log('Step 10: Logging in Supervisor (@thefifthlab.com)...');
  const supLogin = await request('POST', '/auth/login', {
    email: 'supervisor@thefifthlab.com',
    password: 'Password123!',
  });
  assert(supLogin.status === 200, 'Supervisor login must succeed');
  const supToken = supLogin.body.data.tokens.accessToken;
  console.log('  ✅ Supervisor logged in successfully.\n');

  // Step 11: Supervisor reject/resubmit without comment must fail
  console.log('Step 11: Testing mandatory review comment enforcement for rejection/resubmission...');
  const placementDocId = placementRes.body.data.id;
  const noCommentReview = await request(
    'PATCH',
    `/onboarding/documents/${placementDocId}/review`,
    {
      status: 'resubmission_required',
      notes: '',
    },
    supToken
  );
  assert([400, 422].includes(noCommentReview.status), 'Resubmission request without comment must fail');
  console.log('  ✅ Mandatory review comment correctly enforced.\n');

  // Step 12: Request Resubmission for Placement Letter with comment
  console.log('Step 12: Requesting resubmission for Placement Letter with comment...');
  const resubmitReq = await request(
    'PATCH',
    `/onboarding/documents/${placementDocId}/review`,
    {
      status: 'resubmission_required',
      notes: 'Scan is blurry. Please upload a clear PDF version.',
    },
    supToken
  );
  assert(resubmitReq.status === 200, 'Requesting resubmission with comment must succeed');
  assert(resubmitReq.body.data.review_status === 'resubmission_required', 'Status must be resubmission_required');
  console.log('  ✅ Resubmission requested with comment.\n');

  // Step 13: Intern resubmits Placement Letter replacement
  console.log('Step 13: Intern uploading replacement Placement Letter...');
  const replacementRes = await request(
    'POST',
    '/onboarding/documents',
    {
      title: 'Placement Letter (Updated)',
      file_name: 'placement_letter_v2.pdf',
      file_path: '/uploads/documents/placement_letter_v2.pdf',
      file_size: 1024 * 650,
      mime_type: 'application/pdf',
      category: 'placement_letter',
    },
    fifthlabToken
  );
  assert(replacementRes.status === 200 || replacementRes.status === 201, 'Replacement upload must succeed');
  assert(replacementRes.body.data.review_status === 'pending', 'Document status must reset to pending');

  const verifyTrackAfterResubmit = await request('GET', '/onboarding/documents', null, fifthlabToken);
  const placementItem = verifyTrackAfterResubmit.body.data.checklist.find((c) => c.category === 'placement_letter');
  assert(placementItem.history.length >= 1, 'Previous submission must be preserved in history');
  console.log('  ✅ Replacement uploaded, status reset to pending, history preserved.\n');

  // Step 14: Supervisor approves all 3 documents
  console.log('Step 14: Supervisor approving all 3 documents...');
  const resumeDocId = resumeRes.body.data.id;
  const acceptanceDocId = acceptanceRes.body.data.id;
  const updatedPlacementDocId = replacementRes.body.data.id;

  await request('PATCH', `/onboarding/documents/${resumeDocId}/review`, { status: 'approved' }, supToken);
  await request('PATCH', `/onboarding/documents/${updatedPlacementDocId}/review`, { status: 'approved' }, supToken);
  await request('PATCH', `/onboarding/documents/${acceptanceDocId}/review`, { status: 'approved' }, supToken);
  console.log('  ✅ All 3 documents approved by supervisor.\n');

  // Step 15: Final readiness check
  console.log('Step 15: Performing final Onboarding Readiness check...');
  const finalTrack = await request('GET', '/onboarding/documents', null, fifthlabToken);
  assert(finalTrack.status === 200, 'Final track request must succeed');
  assert(finalTrack.body.data.approved_count === 3, 'Approved count must be 3/3');
  assert(finalTrack.body.data.onboarding_ready === true, 'Onboarding ready must be TRUE');
  console.log(`  ✅ Final Readiness Result: ${finalTrack.body.data.progress_label} -> ONBOARDING READY 🎉\n`);

  console.log('====================================================');
  console.log('🎉 ALL CWG PLC & FIFTHLAB ONBOARDING E2E VERIFICATION TESTS PASSED!');
  console.log('====================================================');
}

runVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
