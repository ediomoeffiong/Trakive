const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const backendRoot = path.resolve(__dirname, '..');

test('allowed work email domains are normalized and accepted', () => {
  const { assertAllowedEmail, isAllowedEmail } = require('../src/utils/emailDomain');
  assert.equal(assertAllowedEmail(' Person@CWG-PLC.COM '), 'person@cwg-plc.com');
  assert.equal(isAllowedEmail('person@thefifthlab.com'), true);
  assert.equal(isAllowedEmail('person@example.com'), false);
});

test('unsupported AUTH_PROVIDER fails closed during configuration', () => {
  const result = spawnSync(process.execPath, ['-e', "require('./src/config/env')"], {
    cwd: backendRoot,
    env: { ...process.env, AUTH_PROVIDER: 'unknown-provider' },
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /Unsupported AUTH_PROVIDER/);
});

test('production requires an explicit provider selection', () => {
  const env = { ...process.env, NODE_ENV: 'production' };
  delete env.AUTH_PROVIDER;
  const result = spawnSync(process.execPath, ['-e', "require('./src/config/env')"], {
    cwd: backendRoot, env, encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /AUTH_PROVIDER must be explicitly configured/);
});

test('local provider remains the default and loads the existing service', () => {
  const result = spawnSync(process.execPath, ['-e', "const p=require('./src/services/authProvider.service'); if(typeof p.login!=='function'||typeof p.refresh!=='function')process.exit(2)"], {
    cwd: backendRoot,
    env: { ...process.env, AUTH_PROVIDER: 'local' },
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
});

test('supabase provider loads only with explicit complete server configuration', () => {
  const result = spawnSync(process.execPath, ['-e', "const p=require('./src/services/authProvider.service'); if(typeof p.login!=='function'||typeof p.activateExisting!=='function'||typeof p.verifyEmailOtpLogin!=='function')process.exit(2)"], {
    cwd: backendRoot,
    env: {
      ...process.env,
      AUTH_PROVIDER: 'supabase',
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_PUBLISHABLE_KEY: 'public-test-key',
      SUPABASE_SERVICE_ROLE_KEY: 'server-test-key',
      AUTH_CHALLENGE_ENCRYPTION_KEY: 'test-only-independent-challenge-encryption-key',
    },
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
});

test('login challenge session payload encryption round-trips', () => {
  const { encryptChallengePayload, decryptChallengePayload } = require('../src/utils/authChallengeCrypto');
  const value = { accessToken: 'access-secret', refreshToken: 'refresh-secret' };
  const encrypted = encryptChallengePayload(value);
  assert.doesNotMatch(encrypted, /access-secret|refresh-secret/);
  assert.deepEqual(decryptChallengePayload(encrypted), value);
  assert.throws(() => decryptChallengePayload(`${encrypted.slice(0, -2)}aa`));
});

test('cutover migration preserves Trakive IDs and adds a separate unique Supabase identity', () => {
  const migration = require('node:fs').readFileSync(
    path.join(backendRoot, 'src/database/migrations/022_supabase_auth_cutover.sql'),
    'utf8'
  );
  assert.match(migration, /ADD COLUMN IF NOT EXISTS supabase_auth_id UUID/i);
  assert.match(migration, /UNIQUE INDEX IF NOT EXISTS idx_users_supabase_auth_id/i);
  assert.doesNotMatch(migration, /ALTER\s+COLUMN\s+id|DROP\s+COLUMN\s+id/i);
});
