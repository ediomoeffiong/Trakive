const { query } = require('../config/db');
const ApiError = require('../utils/apiError');
const UserModel = require('../models/user.model');
const RoleModel = require('../models/role.model');
const { hashPassword, comparePassword } = require('../utils/password.utils');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateRandomToken,
} = require('../utils/token.utils');
const ProfileModel = require('../models/profile.model');
const InternshipRecordModel = require('../models/internshipRecord.model');
const AuditLogModel = require('../models/auditLog.model');
const { validateInternshipDates } = require('../validators/internshipDate.validator');
const { resolveFifthLabDefaults } = require('../utils/fifthlabDefaults');

/**
 * Role name resolver helper
 */
const resolveRoleName = (roleInput) => {
  if (!roleInput) return 'intern';
  const normalized = roleInput.toLowerCase().trim();
  if (['super_admin', 'superadmin', 'org_admin', 'admin'].includes(normalized)) {
    throw ApiError.badRequest('Registration with Super Admin or System Administrator roles is strictly prohibited');
  }
  if (normalized === 'head') return 'department_head';
  return normalized;
};

const AuthService = {
  /**
   * User Registration
   */
  async register(data) {
    const existingUser = await UserModel.findByEmail(data.email);
    if (existingUser) {
      throw ApiError.conflict('User with this email already exists');
    }

    const targetRoleName = resolveRoleName(data.role);
    const roleRecord = await RoleModel.findByName(targetRoleName);
    if (!roleRecord) {
      throw ApiError.badRequest(`Role '${data.role}' is invalid`);
    }

    const startDate = data.startDate || data.start_date;
    const endDate = data.endDate || data.end_date;

    if (targetRoleName === 'intern' && (startDate || endDate)) {
      validateInternshipDates(startDate, endDate);
    }

    let firstName = data.first_name;
    let lastName = data.last_name;
    if ((!firstName || !lastName) && data.name) {
      const parts = data.name.trim().split(/\s+/);
      firstName = parts[0] || 'Intern';
      lastName = parts.slice(1).join(' ') || 'User';
    }

    const emailDomain = (data.email || '').split('@')[1]?.toLowerCase().trim();
    const allowedDomains = ['thefifthlab.com', 'fifthlab.com', 'cwg-plc.com'];
    if (!allowedDomains.includes(emailDomain)) {
      throw ApiError.badRequest('Please enter your organization email (@cwg-plc.com or @fifthlab.com). Other emails are not supported.');
    }

    let matchedOrg = null;
    if (emailDomain === 'thefifthlab.com' || emailDomain === 'fifthlab.com') {
      const orgRes = await query(`SELECT * FROM organizations WHERE slug = 'fifthlab' OR domain = 'thefifthlab.com' LIMIT 1`);
      matchedOrg = orgRes.rows[0];
      if (!matchedOrg) {
        const createRes = await query(
          `INSERT INTO organizations (name, slug, domain) VALUES ('FifthLab', 'fifthlab', 'thefifthlab.com') RETURNING *`
        );
        matchedOrg = createRes.rows[0];
      }
    } else if (emailDomain === 'cwg-plc.com') {
      const orgRes = await query(`SELECT * FROM organizations WHERE slug = 'cwg-plc' OR domain = 'cwg-plc.com' LIMIT 1`);
      matchedOrg = orgRes.rows[0];
      if (!matchedOrg) {
        const createRes = await query(
          `INSERT INTO organizations (name, slug, domain) VALUES ('CWG PLC', 'cwg-plc', 'cwg-plc.com') RETURNING *`
        );
        matchedOrg = createRes.rows[0];
      }
    }

    const orgId = matchedOrg.id;

    const password_hash = await hashPassword(data.password);
    const initialStatus = 'active';

    const fifthLabDefaults = targetRoleName === 'intern'
      ? await resolveFifthLabDefaults({
          organizationId: orgId,
          departmentId: data.department_id || null,
          email: data.email,
        })
      : { departmentId: data.department_id || null, supervisorId: null };

    const newUser = await UserModel.create({
      organization_id: orgId,
      department_id: fifthLabDefaults.departmentId,
      role_id: roleRecord.id,
      email: data.email,
      password_hash,
      first_name: firstName || 'User',
      last_name: lastName || 'User',
      phone: data.phone || null,
      date_of_birth: data.date_of_birth || data.dateOfBirth || null,
      status: initialStatus,
      is_email_verified: false,
    });

    // If registering an intern, create default intern profile linked to department
    if (targetRoleName === 'intern') {
      const internProfile = await ProfileModel.upsertInternProfile({
        user_id: newUser.id,
        organization_id: orgId,
        department_id: fifthLabDefaults.departmentId,
        supervisor_id: fifthLabDefaults.supervisorId,
        status: 'onboarding',
      });

      if (fifthLabDefaults.supervisorId && internProfile?.id) {
        await ProfileModel.recordSupervisorAssignment(
          internProfile.id,
          fifthLabDefaults.supervisorId,
          newUser.id,
          'active',
          'Auto-assigned default FifthLab supervisor'
        );
      }

      const today = new Date();
      const sixMonths = new Date();
      sixMonths.setMonth(today.getMonth() + 6);

      await InternshipRecordModel.create({
        user_id: newUser.id,
        organization_id: orgId,
        department_id: fifthLabDefaults.departmentId,
        supervisor_id: fifthLabDefaults.supervisorId,
        start_date: startDate || today.toISOString().split('T')[0],
        end_date: endDate || sixMonths.toISOString().split('T')[0],
        status: 'onboarding',
        title: 'Internship #1',
      });
    }

    // Create Email Verification Token
    const verifyToken = generateRandomToken();
    const verifyTokenHash = hashToken(verifyToken);
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await query(
      `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [newUser.id, verifyTokenHash, verifyExpiry]
    );

    // Fetch user profile with role and permissions
    const userProfile = await UserModel.findByIdWithRoleAndPermissions(newUser.id);

    // Audit log registration
    await AuditLogModel.log({
      organizationId: userProfile.organization_id,
      userId: userProfile.id,
      action: 'USER_REGISTER',
      entityType: 'users',
      entityId: userProfile.id,
      details: { email: userProfile.email, role: userProfile.role_name, status: userProfile.status },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: userProfile.id,
      role: userProfile.role_name,
    });
    const refreshToken = generateRefreshToken({
      userId: userProfile.id,
    });

    // Store refresh token
    const refreshTokenHash = hashToken(refreshToken);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userProfile.id, refreshTokenHash, refreshExpiry]
    );

    return {
      user: UserModel.sanitizeUser(userProfile),
      tokens: {
        accessToken,
        refreshToken,
      },
      emailVerificationToken: verifyToken,
    };
  },

  /**
   * User Login
   */
  async login(email, password, ipAddress = null, userAgent = null) {
    const emailDomain = (email || '').split('@')[1]?.toLowerCase().trim();
    if (!['thefifthlab.com', 'fifthlab.com', 'cwg-plc.com'].includes(emailDomain)) {
      throw ApiError.badRequest('Please enter your organization email (@cwg-plc.com or @fifthlab.com). Other emails are not supported.');
    }

    const user = await UserModel.findByEmailWithPassword(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.status === 'pending') {
      throw ApiError.forbidden('User account is awaiting administrative approval and supervisor assignment');
    }

    if (user.status !== 'active') {
      throw ApiError.forbidden('User account is inactive or suspended');
    }

    const isFirstLogin = !user.last_login_at;

    // Update last login time
    await UserModel.updateLastLogin(user.id);

    // Fetch full user profile with role and permissions
    const userProfile = await UserModel.findByIdWithRoleAndPermissions(user.id);

    // Audit log login
    await AuditLogModel.log({
      organizationId: userProfile.organization_id,
      userId: userProfile.id,
      action: 'USER_LOGIN',
      entityType: 'users',
      entityId: userProfile.id,
      details: { email: userProfile.email },
      ipAddress,
      userAgent,
    });

    // Generate token set
    const accessToken = generateAccessToken({
      userId: userProfile.id,
      role: userProfile.role_name,
    });
    const refreshToken = generateRefreshToken({
      userId: userProfile.id,
    });

    // Store refresh token
    const refreshTokenHash = hashToken(refreshToken);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [userProfile.id, refreshTokenHash, ipAddress, userAgent, refreshExpiry]
    );

    const sanitized = UserModel.sanitizeUser(userProfile);

    return {
      user: {
        ...sanitized,
        isFirstLogin,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  },

  /**
   * Refresh Token Rotation
   */
  async refresh(refreshToken, ipAddress = null, userAgent = null) {
    if (!refreshToken) {
      throw ApiError.badRequest('Refresh token is required');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const hashedReqToken = hashToken(refreshToken);

    const tokenRes = await query(
      `SELECT * FROM refresh_tokens WHERE token_hash = $1`,
      [hashedReqToken]
    );
    const storedToken = tokenRes.rows[0];

    // Token reuse protection: If token is revoked or missing, revoke entire family if found!
    if (!storedToken || storedToken.is_revoked || new Date(storedToken.expires_at) < new Date()) {
      if (storedToken && storedToken.family_id) {
        await query(
          `UPDATE refresh_tokens SET is_revoked = true WHERE family_id = $1`,
          [storedToken.family_id]
        );
      }
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const userProfile = await UserModel.findByIdWithRoleAndPermissions(storedToken.user_id);
    if (!userProfile || userProfile.status !== 'active') {
      throw ApiError.forbidden('User account is invalid or suspended');
    }

    // Revoke old refresh token
    await query(
      `UPDATE refresh_tokens SET is_revoked = true WHERE id = $1`,
      [storedToken.id]
    );

    // Generate new token pair
    const newAccessToken = generateAccessToken({
      userId: userProfile.id,
      role: userProfile.role_name,
    });
    const newRefreshToken = generateRefreshToken({
      userId: userProfile.id,
    });

    const newRefreshTokenHash = hashToken(newRefreshToken);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Insert new refresh token with same family_id
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, family_id, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userProfile.id,
        newRefreshTokenHash,
        storedToken.family_id,
        ipAddress,
        userAgent,
        refreshExpiry,
      ]
    );

    return {
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    };
  },

  /**
   * Logout user / invalidate refresh token
   */
  async logout(refreshToken) {
    if (refreshToken) {
      const hashed = hashToken(refreshToken);
      await query(
        `UPDATE refresh_tokens SET is_revoked = true WHERE token_hash = $1`,
        [hashed]
      );
    }
    return { message: 'Logged out successfully' };
  },

  /**
   * Get current authenticated user profile
   */
  async getMe(userId) {
    const userProfile = await UserModel.findByIdWithRoleAndPermissions(userId);
    if (!userProfile) {
      throw ApiError.notFound('User not found');
    }
    return UserModel.sanitizeUser(userProfile);
  },

  /**
   * Change Password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const res = await query('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [userId]);
    const user = res.rows[0];

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    const newPasswordHash = await hashPassword(newPassword);
    await UserModel.updatePassword(userId, newPasswordHash);

    // Invalidate all active refresh tokens for security
    await query(
      `UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1`,
      [userId]
    );

    return { message: 'Password changed successfully' };
  },

  /**
   * Forgot Password request
   */
  async forgotPassword(email) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Return neutral message for security
      return { message: 'If the email exists in our system, a password reset link has been generated' };
    }

    const resetToken = generateRandomToken();
    const resetTokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, resetTokenHash, expiresAt]
    );

    return {
      message: 'If the email exists in our system, a password reset link has been generated',
      resetToken, // Returned for dev/testing infrastructure
    };
  },

  /**
   * Reset Password with token
   */
  async resetPassword(token, newPassword) {
    const hashed = hashToken(token);

    const tokenRes = await query(
      `SELECT * FROM password_reset_tokens 
       WHERE token_hash = $1 AND is_used = false AND expires_at > NOW()`,
      [hashed]
    );

    const resetRecord = tokenRes.rows[0];
    if (!resetRecord) {
      throw ApiError.badRequest('Invalid or expired password reset token');
    }

    const newPasswordHash = await hashPassword(newPassword);
    await UserModel.updatePassword(resetRecord.user_id, newPasswordHash);

    // Mark reset token as used
    await query(
      `UPDATE password_reset_tokens SET is_used = true WHERE id = $1`,
      [resetRecord.id]
    );

    // Invalidate all sessions
    await query(
      `UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1`,
      [resetRecord.user_id]
    );

    return { message: 'Password has been reset successfully' };
  },

  /**
   * Email Verification
   */
  async verifyEmail(token) {
    const hashed = hashToken(token);

    const tokenRes = await query(
      `SELECT * FROM email_verification_tokens
       WHERE token_hash = $1 AND is_used = false AND expires_at > NOW()`,
      [hashed]
    );

    const verifyRecord = tokenRes.rows[0];
    if (!verifyRecord) {
      throw ApiError.badRequest('Invalid or expired email verification token');
    }

    await UserModel.setEmailVerified(verifyRecord.user_id);

    await query(
      `UPDATE email_verification_tokens SET is_used = true WHERE id = $1`,
      [verifyRecord.id]
    );

    return { message: 'Email verified successfully' };
  },
};

module.exports = AuthService;
