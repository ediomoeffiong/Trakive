const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/token.utils');
const UserModel = require('../models/user.model');
const { query } = require('../config/db');
const { isSupabaseAuth } = require('../utils/authProvider');
const { getSupabasePublicClient } = require('../config/supabase');
const { resolveSupabaseIdentity } = require('../services/supabaseIdentity.service');

/**
 * Role normalization mapping for Trakive roles
 */
const ROLE_ALIASES = {
  intern: ['intern'],
  supervisor: ['supervisor'],
  hr: ['hr'],
  head: ['head', 'department_head'],
  admin: ['admin', 'org_admin', 'super_admin'],
  super_admin: ['super_admin'],
};

/**
 * Authenticate incoming requests via Bearer JWT Access Token
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication token is required');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw ApiError.unauthorized('Authentication token is missing');
  }

  if (isSupabaseAuth()) {
    const { data, error } = await getSupabasePublicClient().auth.getUser(token);
    if (error || !data?.user) throw ApiError.unauthorized('Invalid or expired Supabase access token');
    const user = await resolveSupabaseIdentity(data.user, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });
    req.user = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role_id: user.role_id,
      role_name: user.role_name,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      organization_id: user.organization_id,
      department_id: user.department_id,
      status: user.status,
      is_email_verified: true,
      supabase_auth_id: data.user.id,
    };
    req.authProvider = 'supabase';
    req.authToken = token;
    return next();
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token has expired');
    }
    throw ApiError.unauthorized('Invalid authentication token');
  }

  // Access tokens are tied to a stable refresh-token family. Revoking a device
  // invalidates that family, so its next API request is rejected immediately
  // instead of remaining authenticated until the short-lived JWT expires.
  if (!decoded.sessionId) {
    // Existing clients will transparently use their refresh token once and
    // receive a session-bound access token through the normal 401 retry flow.
    throw ApiError.unauthorized('Session token must be refreshed');
  }

  const sessionResult = await query(
    `SELECT 1
     FROM refresh_tokens
     WHERE user_id = $1
       AND family_id = $2
       AND is_revoked = false
       AND expires_at > NOW()
       AND COALESCE(last_seen_at, created_at) > NOW() - INTERVAL '7 days'
     LIMIT 1`,
    [decoded.userId, decoded.sessionId],
  );
  if (!sessionResult.rows[0]) {
    throw ApiError.unauthorized('Session has been signed out');
  }

  const user = await UserModel.findByIdWithRoleAndPermissions(decoded.userId);
  if (!user) {
    throw ApiError.unauthorized('Authenticated user no longer exists');
  }

  if (user.status !== 'active') {
    throw ApiError.forbidden('User account is inactive or suspended');
  }

  req.user = {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role_id: user.role_id,
    role_name: user.role_name,
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
    organization_id: user.organization_id,
    department_id: user.department_id,
    status: user.status,
    is_email_verified: user.is_email_verified,
  };
  req.sessionId = decoded.sessionId || null;
  req.authProvider = 'local';

  next();
});

/**
 * Require specific role(s) to access route
 * Supports Trakive roles: Intern, Supervisor, HR, Head, Admin, Super Admin
 * @param  {...string} allowedRoles 
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User must be authenticated'));
    }

    const userRole = req.user.role_name ? req.user.role_name.toLowerCase() : '';

    // Super Admin has global access to administrative functions
    if (userRole === 'super_admin') {
      return next();
    }

    // Expand allowed roles with aliases
    const expandedAllowedRoles = new Set();
    for (const role of allowedRoles) {
      const normalized = role.toLowerCase();
      if (ROLE_ALIASES[normalized]) {
        ROLE_ALIASES[normalized].forEach((r) => expandedAllowedRoles.add(r));
      } else {
        expandedAllowedRoles.add(normalized);
      }
    }

    if (!expandedAllowedRoles.has(userRole)) {
      return next(ApiError.forbidden('Access denied: Insufficient role privileges'));
    }

    next();
  };
};

/**
 * Require specific permission(s) to access route
 * @param  {...string} requiredPermissions 
 */
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User must be authenticated'));
    }

    const userPermissions = req.user.permissions || [];

    // Check if user possesses all specified required permissions
    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasAllPermissions) {
      return next(ApiError.forbidden('Access denied: Missing required permission'));
    }

    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
  requirePermission,
};
