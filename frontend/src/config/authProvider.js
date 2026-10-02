export const AUTH_PROVIDERS = Object.freeze({ LOCAL: 'local', SUPABASE: 'supabase' });

if (import.meta.env.PROD && !import.meta.env.VITE_AUTH_PROVIDER) {
  throw new Error('VITE_AUTH_PROVIDER must be explicitly configured in production');
}
const configured = String(import.meta.env.VITE_AUTH_PROVIDER || 'local').trim().toLowerCase();
if (!Object.values(AUTH_PROVIDERS).includes(configured)) {
  throw new Error(`Unsupported VITE_AUTH_PROVIDER '${configured}'. Expected 'local' or 'supabase'.`);
}

export const authProvider = configured;
export const isSupabaseAuth = authProvider === AUTH_PROVIDERS.SUPABASE;
export const isLocalAuth = authProvider === AUTH_PROVIDERS.LOCAL;
