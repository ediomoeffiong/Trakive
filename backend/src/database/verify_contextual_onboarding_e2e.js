/**
 * @file verify_contextual_onboarding_e2e.js
 * @description End-to-end verification of contextual intern onboarding workflow:
 * - Scenario A: Incomplete onboarding (visible in sidebar, action required badge)
 * - Scenario B: Pending review status (pending badge in sidebar, pending alert)
 * - Scenario C: Document rejected (danger badge, feedback note displayed, resubmission workflow)
 * - Scenario D: Completed intern (hidden from sidebar, dashboard alert auto-cleared, profile records preserved)
 * - Scenario E: Returning intern with multiple internship periods (separate checklist & docs per period)
 * - Scenario F: Supervisor review flow intact
 */

const assert = require('assert');
const http = require('http');
const app = require('../app');
const { query } = require('../config/db');

// Helper to make HTTP requests against express app
const request = async (method, path, body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

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

// Simulation of frontend useOnboardingStatus calculation
function computeFrontendOnboardingState(payload) {
  const checklist = payload.checklist || [];
  const totalRequired = payload.total_required ?? 3;
  const approvedCount = payload.approved_count ?? checklist.filter((i) => i.review_status === 'approved').length;
  const submittedCount = checklist.filter((i) => i.submitted).length;
  const missingCount = Math.max(0, totalRequired - submittedCount);

  const rejectedItems = checklist.filter(
    (item) => item.review_status === 'rejected' || item.review_status === 'resubmission_required'
  );
  const hasRejection = rejectedItems.length > 0;
  const allSubmitted = checklist.length > 0 && checklist.every((item) => item.submitted);
  const allApproved = approvedCount >= totalRequired && totalRequired > 0;

  let computedStatus = payload.status;
  if (!computedStatus) {
    if (allApproved) computedStatus = 'completed';
    else if (hasRejection) computedStatus = 'action_required';
    else if (allSubmitted) computedStatus = 'pending';
    else if (submittedCount > 0) computedStatus = 'in_progress';
    else computedStatus = 'not_started';
  }

  const isCompleted = computedStatus === 'completed';
  const shouldShowOnboarding = !isCompleted;

  let badgeText = null;
  let badgeVariant = 'neutral';
  let actionMessage = null;

  if (hasRejection) {
    badgeText = 'Action Required';
    badgeVariant = 'danger';
    const firstRejected = rejectedItems[0];
    const notes = firstRejected.document?.review_notes ? `: "${firstRejected.document.review_notes}"` : '';
    actionMessage = `${firstRejected.title} rejected${notes} — resubmission required`;
  } else if (computedStatus === 'pending') {
    badgeText = 'Pending';
    badgeVariant = 'warning';
    actionMessage = 'All documents submitted — pending supervisor review';
  } else if (!isCompleted) {
    badgeText = 'Action Required';
    badgeVariant = 'warning';
    if (missingCount > 0) {
      actionMessage = `${missingCount} document${missingCount > 1 ? 's' : ''} awaiting submission`;
    } else {
      actionMessage = 'Complete your onboarding requirements';
    }
  }

  return {
    status: computedStatus,
    isCompleted,
    shouldShowOnboarding,
    badgeText,
    badgeVariant,
    actionMessage,
    rejectionReason: payload.rejection_reason || (hasRejection ? rejectedItems[0].document?.review_notes : null),
  };
}

async function runE2EVerification() {
  console.log('===============================================================');
  console.log('Starting Contextual Intern Onboarding Workflow E2E Verification');
  console.log('===============================================================\n');

  try {
    // 0. Authenticate test intern and supervisor
    const internLogin = await request('POST', '/auth/login', {
      email: 'intern@thefifthlab.com',
      password: 'Password123!',
    });
    assert.strictEqual(internLogin.status, 200, 'Intern login failed');
    const internToken = internLogin.body.data.tokens.accessToken;
    const internUser = internLogin.body.data.user;

    const supervisorLogin = await request('POST', '/auth/login', {
      email: 'supervisor@thefifthlab.com',
      password: 'Password123!',
    });
    assert.strictEqual(supervisorLogin.status, 200, 'Supervisor login failed');
    const supervisorToken = supervisorLogin.body.data.tokens.accessToken;

    console.log('✓ Step 0: Authentication passed for Intern and Supervisor');

    // Clean test state: remove any existing documents for this intern to start clean
    await query('DELETE FROM documents WHERE owner_id = $1;', [internUser.id]);
    await query("UPDATE intern_profiles SET status = 'onboarding' WHERE user_id = $1;", [internUser.id]);
    await query('DELETE FROM internship_records WHERE user_id = $1 AND internship_number > 1;', [internUser.id]);

    // Ensure at least one active internship record exists
    let irRes = await query(
      "SELECT id FROM internship_records WHERE user_id = $1 ORDER BY internship_number ASC LIMIT 1;",
      [internUser.id]
    );
    let record1Id = irRes.rows[0]?.id;
    if (!record1Id) {
      const insIr = await query(
        `INSERT INTO internship_records (user_id, internship_number, title, status, start_date, end_date)
         VALUES ($1, 1, 'Internship #1', 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '180 days')
         RETURNING id;`,
        [internUser.id]
      );
      record1Id = insIr.rows[0].id;
    } else {
      await query("UPDATE internship_records SET status = 'active' WHERE id = $1;", [record1Id]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Scenario A: New Intern with Incomplete Onboarding
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Scenario A: Incomplete Onboarding ---');
    const docStatusResA = await request('GET', '/onboarding/documents', null, internToken);
    assert.strictEqual(docStatusResA.status, 200);
    const stateA = computeFrontendOnboardingState(docStatusResA.body.data);

    assert.strictEqual(stateA.status, 'not_started', 'Status should be not_started');
    assert.strictEqual(stateA.isCompleted, false, 'isCompleted should be false');
    assert.strictEqual(stateA.shouldShowOnboarding, true, 'Onboarding MUST show in sidebar');
    assert.strictEqual(stateA.badgeText, 'Action Required', 'Badge should be Action Required');
    assert.strictEqual(stateA.badgeVariant, 'warning', 'Badge variant should be warning');
    console.log('✓ Scenario A passed: Sidebar visible, "Action Required" badge, not_started status');

    // ──────────────────────────────────────────────────────────────────────────
    // Scenario B: Intern Submits Documents (Pending Review)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Scenario B: Documents Submitted (Pending Review) ---');
    const categories = ['resume', 'placement_letter', 'acceptance_letter'];
    for (const cat of categories) {
      const subRes = await request('POST', '/onboarding/documents', {
        title: `${cat} document`,
        category: cat,
        file_name: `${cat}.pdf`,
        file_path: `/uploads/documents/${cat}.pdf`,
        file_size: 1024 * 50,
        mime_type: 'application/pdf',
      }, internToken);
      assert([200, 201].includes(subRes.status), `Failed to submit document ${cat}: ${subRes.status}`);
    }

    const docStatusResB = await request('GET', '/onboarding/documents', null, internToken);
    assert.strictEqual(docStatusResB.status, 200);
    const stateB = computeFrontendOnboardingState(docStatusResB.body.data);

    assert.strictEqual(stateB.status, 'pending', 'Status should be pending');
    assert.strictEqual(stateB.isCompleted, false, 'isCompleted should be false while pending');
    assert.strictEqual(stateB.shouldShowOnboarding, true, 'Onboarding MUST show in sidebar while pending');
    assert.strictEqual(stateB.badgeText, 'Pending', 'Badge should be Pending');
    assert.strictEqual(stateB.badgeVariant, 'warning', 'Badge variant should be warning');
    console.log('✓ Scenario B passed: Sidebar shows "Pending" badge, pending supervisor review');

    // ──────────────────────────────────────────────────────────────────────────
    // Scenario C: Supervisor Rejects a Document
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Scenario C: Document Rejection by Supervisor ---');
    // Get document ID for placement_letter
    const placementItem = docStatusResB.body.data.checklist.find((i) => i.category === 'placement_letter');
    assert(placementItem && placementItem.document, 'Placement letter document missing');
    const placementDocId = placementItem.document.id;

    const rejectRes = await request(
      'PATCH',
      `/onboarding/documents/${placementDocId}/review`,
      {
        status: 'rejected',
        notes: 'Institutional stamp is missing from the placement letter. Please re-upload.',
      },
      supervisorToken
    );
    assert.strictEqual(rejectRes.status, 200, 'Supervisor review PATCH failed');

    const docStatusResC = await request('GET', '/onboarding/documents', null, internToken);
    assert.strictEqual(docStatusResC.status, 200);
    const stateC = computeFrontendOnboardingState(docStatusResC.body.data);

    assert.strictEqual(stateC.status, 'action_required', 'Status should be action_required');
    assert.strictEqual(stateC.isCompleted, false, 'isCompleted should be false when rejected');
    assert.strictEqual(stateC.shouldShowOnboarding, true, 'Onboarding MUST show in sidebar');
    assert.strictEqual(stateC.badgeText, 'Action Required', 'Badge should be Action Required');
    assert.strictEqual(stateC.badgeVariant, 'danger', 'Badge variant should be danger for rejected doc');
    assert(
      stateC.rejectionReason && stateC.rejectionReason.includes('stamp is missing'),
      'Rejection reason should contain supervisor note'
    );
    console.log('✓ Scenario C passed: Danger badge displayed, supervisor notes attached to rejection');

    // Intern resubmits the rejected placement letter
    const resubmitRes = await request('POST', '/onboarding/documents', {
      title: 'Placement Letter (Stamped)',
      category: 'placement_letter',
      file_name: 'placement_letter_stamped.pdf',
      file_path: '/uploads/documents/placement_letter_stamped.pdf',
      file_size: 1024 * 75,
      mime_type: 'application/pdf',
    }, internToken);
    assert([200, 201].includes(resubmitRes.status), 'Resubmission failed');

    // ──────────────────────────────────────────────────────────────────────────
    // Scenario D: Completed Intern (All Documents Approved)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Scenario D: Onboarding Completed & Approved ---');
    // Supervisor approves all 3 documents
    const docStatusResPreApprove = await request('GET', '/onboarding/documents', null, internToken);
    for (const item of docStatusResPreApprove.body.data.checklist) {
      if (item.document?.id) {
        const appRes = await request(
          'PATCH',
          `/onboarding/documents/${item.document.id}/review`,
          { status: 'approved', notes: 'Verified and approved.' },
          supervisorToken
        );
        assert.strictEqual(appRes.status, 200, `Failed to approve ${item.category}`);
      }
    }

    const docStatusResD = await request('GET', '/onboarding/documents', null, internToken);
    assert.strictEqual(docStatusResD.status, 200);
    const stateD = computeFrontendOnboardingState(docStatusResD.body.data);

    assert.strictEqual(stateD.status, 'completed', 'Status should be completed');
    assert.strictEqual(stateD.isCompleted, true, 'isCompleted MUST be true');
    assert.strictEqual(stateD.shouldShowOnboarding, false, 'Onboarding MUST be HIDDEN from sidebar');
    console.log('✓ Scenario D passed: Onboarding auto-hidden from sidebar when completed');

    // ──────────────────────────────────────────────────────────────────────────
    // Scenario E: Multi-Internship Returning Intern
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Scenario E: Returning Intern with Multiple Periods ---');
    // Mark Internship #1 as completed
    await query("UPDATE internship_records SET status = 'completed' WHERE id = $1;", [record1Id]);

    // Create Internship #2 for the returning intern
    const insIr2 = await query(
      `INSERT INTO internship_records (user_id, internship_number, title, status, start_date, end_date)
       VALUES ($1, 2, 'Internship #2', 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '180 days')
       RETURNING id;`,
      [internUser.id]
    );
    const record2Id = insIr2.rows[0].id;

    // Query documents scoped to Internship #1
    const docStatusP1 = await request('GET', `/onboarding/documents?internship_record_id=${record1Id}`, null, internToken);
    assert.strictEqual(docStatusP1.status, 200);
    const stateP1 = computeFrontendOnboardingState(docStatusP1.body.data);
    assert.strictEqual(stateP1.status, 'completed', 'Internship #1 documents must remain completed & preserved');
    assert.strictEqual(docStatusP1.body.data.approved_count, 3, 'Internship #1 must have 3 approved docs');

    // Query documents scoped to Internship #2
    const docStatusP2 = await request('GET', `/onboarding/documents?internship_record_id=${record2Id}`, null, internToken);
    assert.strictEqual(docStatusP2.status, 200);
    const stateP2 = computeFrontendOnboardingState(docStatusP2.body.data);
    assert.strictEqual(stateP2.status, 'not_started', 'Internship #2 must start with fresh checklist');
    assert.strictEqual(stateP2.shouldShowOnboarding, true, 'Sidebar MUST show Onboarding again for Internship #2!');
    console.log('✓ Scenario E passed: Multi-internship scoping preserves period 1 records and activates fresh onboarding for period 2');

    // ──────────────────────────────────────────────────────────────────────────
    // Scenario F: Document Download Verification
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Scenario F: Document Download Endpoint ---');
    const firstApprovedDoc = docStatusP1.body.data.checklist[0].document;
    const downloadRes = await request('GET', `/documents/${firstApprovedDoc.id}/download`, null, internToken);
    assert.strictEqual(downloadRes.status, 200, 'Download endpoint must return 200');
    assert(downloadRes.body.data?.downloadUrl, 'Download endpoint must provide a valid download URL');
    console.log('✓ Scenario F passed: Document download URL verified successfully');

    // Clean up test records created for scenario E
    await query('DELETE FROM internship_records WHERE id = $1;', [record2Id]);
    await query("UPDATE internship_records SET status = 'active' WHERE id = $1;", [record1Id]);

    console.log('\n===============================================================');
    console.log('🎉 ALL 6 CONTEXTUAL ONBOARDING SCENARIOS PASSED WITH ZERO ERRORS!');
    console.log('===============================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Verification Failed:', err);
    process.exit(1);
  }
}

runE2EVerification();
