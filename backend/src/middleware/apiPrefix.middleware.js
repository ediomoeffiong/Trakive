const API_V1_ROOTS = new Set([
  'health',
  'auth',
  'users',
  'departments',
  'interns',
  'applications',
  'onboarding',
  'analytics',
  'reports',
  'reviews',
  'search',
  'audit-logs',
  'automations',
  'tasks',
  'attendance',
  'leave',
  'notifications',
  'documents',
  'conversations',
  'projects',
  'weekly-plans',
  'test',
]);

/**
 * Some production clients call /auth/login instead of /api/v1/auth/login.
 * Rewrite those to the versioned API so Express can match the real routes.
 */
const rewriteUnprefixedApi = (req, res, next) => {
  const path = req.path || '';
  if (path === '/' || path.startsWith('/api')) {
    return next();
  }

  const root = path.split('/').filter(Boolean)[0];
  if (root && API_V1_ROOTS.has(root)) {
    const originalUrl = req.url || path;
    req.url = `/api/v1${originalUrl.startsWith('/') ? originalUrl : `/${originalUrl}`}`;
  }

  return next();
};

rewriteUnprefixedApi.API_V1_ROOTS = API_V1_ROOTS;

module.exports = rewriteUnprefixedApi;
