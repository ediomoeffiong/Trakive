const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

const noSession = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
let publicClient;
let adminClient;

const assertConfigured = () => {
  if (!config.supabase.url || !config.supabase.publishableKey || !config.supabase.serviceRoleKey) {
    throw new Error('Supabase authentication is not configured');
  }
};

const getSupabasePublicClient = () => {
  assertConfigured();
  if (!publicClient) publicClient = createClient(config.supabase.url, config.supabase.publishableKey, noSession);
  return publicClient;
};

const getSupabaseAdminClient = () => {
  assertConfigured();
  if (!adminClient) adminClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, noSession);
  return adminClient;
};

module.exports = { getSupabasePublicClient, getSupabaseAdminClient };
