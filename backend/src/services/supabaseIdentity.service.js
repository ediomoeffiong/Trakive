const ApiError = require('../utils/apiError');
const UserModel = require('../models/user.model');
const AuditLogModel = require('../models/auditLog.model');
const { assertAllowedEmail, normalizeEmail } = require('../utils/emailDomain');

const isConfirmed = (identity) => Boolean(identity?.email_confirmed_at || identity?.confirmed_at);

const resolveSupabaseIdentity = async (identity, requestMeta = {}) => {
  if (!identity?.id || !identity?.email) throw ApiError.unauthorized('Supabase identity is incomplete');
  const email = assertAllowedEmail(identity.email);
  if (!isConfirmed(identity)) throw ApiError.forbidden('Verify your work email before accessing Trakive');

  let user = await UserModel.findBySupabaseAuthId(identity.id);
  if (!user) {
    const emailUser = await UserModel.findByEmail(email);
    if (!emailUser) throw ApiError.forbidden('No Trakive profile is linked to this verified identity');
    if (emailUser.supabase_auth_id && emailUser.supabase_auth_id !== identity.id) {
      throw ApiError.forbidden('This Trakive profile is linked to a different authentication identity');
    }
    user = await UserModel.linkSupabaseIdentity(emailUser.id, identity.id, email);
    if (!user) throw ApiError.forbidden('Unable to link this verified identity to a Trakive profile');
    await AuditLogModel.log({
      organizationId: user.organization_id,
      userId: user.id,
      action: 'SUPABASE_IDENTITY_LINKED',
      entityType: 'users',
      entityId: user.id,
      details: { email: normalizeEmail(email) },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });
  }

  if (normalizeEmail(user.email) !== email) {
    throw ApiError.forbidden('Your authentication email no longer matches your Trakive profile');
  }
  if (!user.is_email_verified) {
    await UserModel.setEmailVerified(user.id);
    user.is_email_verified = true;
    await AuditLogModel.log({
      organizationId: user.organization_id,
      userId: user.id,
      action: 'SUPABASE_EMAIL_VERIFIED',
      entityType: 'users', entityId: user.id,
      details: { email },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });
  }
  if (user.status !== 'active') throw ApiError.forbidden('User account is inactive or suspended');
  return user;
};

module.exports = { resolveSupabaseIdentity, isConfirmed };
