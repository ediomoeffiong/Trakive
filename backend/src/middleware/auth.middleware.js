const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/token.utils');
const UserModel = require('../models/user.model');

/**
 * Role normalization mapping for Trakive roles
 */
const ROLE_ALIASES = {
  intern: ['intern'],
  supervisor: ['supervisor'],
  hr: ['hr'],
  head: ['head', 'department_head'],
  admin: ['admin', 'org_admin', 'super_admin'],
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

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token has expired');
    }
    throw ApiError.unauthorized('Invalid authentication token');
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

  next();
});

/**
 * Require specific role(s) to access route
 * Supports Trakive roles: Intern, Supervisor, HR, Head, Admin
 * @param  {...string} allowedRoles 
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User must be authenticated'));
    }

    const userRole = req.user.role_name ? req.user.role_name.toLowerCase() : '';

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
