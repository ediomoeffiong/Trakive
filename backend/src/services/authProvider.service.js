const config = require('../config/env');
const LocalAuthService = require('./auth.service');
const SupabaseAuthService = require('./supabaseAuth.service');

const providers = { local: LocalAuthService, supabase: SupabaseAuthService };
const provider = providers[config.authProvider];
if (!provider) throw new Error(`Unsupported authentication provider: ${config.authProvider}`);

module.exports = provider;
