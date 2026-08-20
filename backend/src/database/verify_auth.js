const http = require('http');
const app = require('../app');
const { pool } = require('../config/db');

async function runAuthVerification() {
  console.log('🧪 Starting Day 3 Authentication & Authorization Verification Suite...\n');

  // Start temporary HTTP server on random port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;

  const request = async (method, path, body = null, token = null) => {
    const url = `${baseUrl}${path}`;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
    };

    const res = await fetch(url, {
      ...options,
      body: body ? JSON.stringify(body) : null,
    });

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
    const testEmailIntern = `intern_${Date.now()}@example.com`;
    const testEmailHR = `hr_${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const newPassword = 'NewPassword123!';

    let internTokens = null;
    let hrTokens = null;
    let emailVerifyToken = null;
    let passwordResetToken = null;

    // 1. Test Registration (Intern)
    console.log('--- Test 1: User Registration ---');
    const regRes = await request('POST', '/auth/register', {
      email: testEmailIntern,
      password: testPassword,
      first_name: 'Alex',
      last_name: 'Intern',
      role: 'intern',
    });
    assert(
      regRes.status === 201 && regRes.body.data.tokens.accessToken,
      'Registration returns HTTP 201 and access token',
      JSON.stringify(regRes.body)
    );
    assert(
      !regRes.body.data.user.password_hash,
      'Registration response sanitizes password_hash',
      'password_hash returned'
    );
    internTokens = regRes.body.data.tokens;
    emailVerifyToken = regRes.body.data.emailVerificationToken;

    // 2. Test Duplicate Email Rejection
    console.log('\n--- Test 2: Duplicate Email Rejection ---');
    const dupRes = await request('POST', '/auth/register', {
      email: testEmailIntern,
      password: testPassword,
      first_name: 'Duplicate',
      last_name: 'User',
      role: 'intern',
    });
    assert(
      dupRes.status === 409,
      'Duplicate registration rejected with HTTP 409 Conflict',
      `Status: ${dupRes.status}`
    );

    // Register HR User for role testing
    const hrRegRes = await request('POST', '/auth/register', {
      email: testEmailHR,
      password: testPassword,
      first_name: 'Sarah',
      last_name: 'HR',
      role: 'hr',
    });
    hrTokens = hrRegRes.body.data.tokens;

    // 3. Test Login
    console.log('\n--- Test 3: User Login ---');
    const loginRes = await request('POST', '/auth/login', {
      email: testEmailIntern,
      password: testPassword,
    });
    assert(
      loginRes.status === 200 && loginRes.body.data.tokens.accessToken,
      'Login succeeds with HTTP 200 and returns fresh tokens',
      JSON.stringify(loginRes.body)
    );
    internTokens = loginRes.body.data.tokens; // Update tokens

    // 4. Test Invalid Credentials
    console.log('\n--- Test 4: Invalid Credentials ---');
    const badLoginRes = await request('POST', '/auth/login', {
      email: testEmailIntern,
      password: 'WrongPassword123!',
    });
    assert(
      badLoginRes.status === 401,
      'Invalid password rejected with HTTP 401 Unauthorized',
      `Status: ${badLoginRes.status}`
    );

    // 5. Test GET /auth/me
    console.log('\n--- Test 5: GET /auth/me Profile Retrieval ---');
    const meRes = await request('GET', '/auth/me', null, internTokens.accessToken);
    assert(
      meRes.status === 200 && meRes.body.data.user.email === testEmailIntern,
      'GET /auth/me returns authenticated user profile',
      JSON.stringify(meRes.body)
    );

    // 6. Test Access-Token Expiry & Refresh Rotation
    console.log('\n--- Test 6: Access-Token Expiry & Refresh Rotation ---');
    const refreshRes = await request('POST', '/auth/refresh', {
      refreshToken: internTokens.refreshToken,
    });
    assert(
      refreshRes.status === 200 &&
        refreshRes.body.data.tokens.accessToken &&
        refreshRes.body.data.tokens.refreshToken !== internTokens.refreshToken,
      'Refresh endpoint rotates refresh token and issues new access token',
      JSON.stringify(refreshRes.body)
    );
    const oldRefreshToken = internTokens.refreshToken;
    internTokens = refreshRes.body.data.tokens;

    // Verify reused token gets rejected (Token rotation enforcement)
    const reuseRes = await request('POST', '/auth/refresh', {
      refreshToken: oldRefreshToken,
    });
    assert(
      reuseRes.status === 401,
      'Reused old refresh token rejected with HTTP 401 Unauthorized',
      `Status: ${reuseRes.status}`
    );

    // 7. Test Logout and Token Invalidation
    console.log('\n--- Test 7: Logout & Token Invalidation ---');
    const logoutRes = await request('POST', '/auth/logout', {
      refreshToken: internTokens.refreshToken,
    });
    assert(
      logoutRes.status === 200,
      'Logout endpoint invalidates refresh token',
      JSON.stringify(logoutRes.body)
    );

    const postLogoutRefresh = await request('POST', '/auth/refresh', {
      refreshToken: internTokens.refreshToken,
    });
    assert(
      postLogoutRefresh.status === 401,
      'Logged-out refresh token is invalidated',
      `Status: ${postLogoutRefresh.status}`
    );

    // Re-login intern to get fresh tokens
    const relogin = await request('POST', '/auth/login', {
      email: testEmailIntern,
      password: testPassword,
    });
    internTokens = relogin.body.data.tokens;

    // 8. Test Password Change & Reset Flow
    console.log('\n--- Test 8: Password Change & Reset Flow ---');
    const changePassRes = await request(
      'POST',
      '/auth/change-password',
      {
        currentPassword: testPassword,
        newPassword: newPassword,
      },
      internTokens.accessToken
    );
    assert(
      changePassRes.status === 200,
      'Password change succeeds with HTTP 200',
      JSON.stringify(changePassRes.body)
    );

    // Verify login with new password
    const newPassLogin = await request('POST', '/auth/login', {
      email: testEmailIntern,
      password: newPassword,
    });
    assert(
      newPassLogin.status === 200,
      'Login succeeds with new password',
      `Status: ${newPassLogin.status}`
    );
    internTokens = newPassLogin.body.data.tokens;

    // Test Forgot Password
    const forgotRes = await request('POST', '/auth/forgot-password', {
      email: testEmailIntern,
    });
    assert(
      forgotRes.status === 200 && forgotRes.body.data.resetToken,
      'Forgot password generates reset token',
      JSON.stringify(forgotRes.body)
    );
    passwordResetToken = forgotRes.body.data.resetToken;

    // Test Reset Password with token
    const resetRes = await request('POST', '/auth/reset-password', {
      token: passwordResetToken,
      newPassword: testPassword,
    });
    assert(
      resetRes.status === 200,
      'Reset password succeeds with valid token',
      JSON.stringify(resetRes.body)
    );

    // 9. Test Email Verification Flow
    console.log('\n--- Test 9: Email Verification Flow ---');
    const verifyRes = await request('POST', '/auth/verify-email', {
      token: emailVerifyToken,
    });
    assert(
      verifyRes.status === 200,
      'Email verification succeeds with valid token',
      JSON.stringify(verifyRes.body)
    );

    // 10. Test Protected Route Access
    console.log('\n--- Test 10: Protected Route Access ---');
    const noTokenRes = await request('GET', '/auth/me');
    assert(
      noTokenRes.status === 401,
      'Unauthenticated access rejected with HTTP 401',
      `Status: ${noTokenRes.status}`
    );

    // 11. Test Role Restrictions (requireRole)
    console.log('\n--- Test 11: Role-Based Authorization (requireRole) ---');
    // Intern attempting to access HR endpoint
    const internAccessHR = await request('GET', '/test/hr', null, internTokens.accessToken);
    assert(
      internAccessHR.status === 403,
      'Intern blocked from HR endpoint with HTTP 403 Forbidden',
      `Status: ${internAccessHR.status}`
    );

    // HR user accessing HR endpoint
    const hrAccessHR = await request('GET', '/test/hr', null, hrTokens.accessToken);
    assert(
      hrAccessHR.status === 200,
      'HR user granted access to HR endpoint with HTTP 200',
      JSON.stringify(hrAccessHR.body)
    );

    // 12. Test Permission Restrictions (requirePermission)
    console.log('\n--- Test 12: Permission-Based Authorization (requirePermission) ---');
    // HR user accessing users:write permitted endpoint
    const hrAccessPerm = await request(
      'GET',
      '/test/permission-users-write',
      null,
      hrTokens.accessToken
    );
    assert(
      hrAccessPerm.status === 200,
      'User with required permission granted access with HTTP 200',
      JSON.stringify(hrAccessPerm.body)
    );

    // Intern (who lacks users:write) attempting access
    const internAccessPerm = await request(
      'GET',
      '/test/permission-users-write',
      null,
      internTokens.accessToken
    );
    assert(
      internAccessPerm.status === 403,
      'User without required permission blocked with HTTP 403 Forbidden',
      `Status: ${internAccessPerm.status}`
    );

    console.log(`\n📊 Verification Summary: ${passedTests} Passed, ${failedTests} Failed.`);
    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Verification suite error:', error);
    process.exit(1);
  } finally {
    server.close();
    await pool.end();
  }
}

runAuthVerification();
