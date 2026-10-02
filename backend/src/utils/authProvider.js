const config = require('../config/env');

const AUTH_PROVIDERS = Object.freeze({ LOCAL: 'local', SUPABASE: 'supabase' });
const isLocalAuth = () => config.authProvider === AUTH_PROVIDERS.LOCAL;
const isSupabaseAuth = () => config.authProvider === AUTH_PROVIDERS.SUPABASE;

module.exports = { AUTH_PROVIDERS, isLocalAuth, isSupabaseAuth };
