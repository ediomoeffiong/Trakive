const { query } = require('../config/db');

const FIFTHLAB_DOMAIN = 'thefifthlab.com';
const FIFTHLAB_DEPARTMENT = 'FifthLab';
const DEFAULT_SUPERVISOR_EMAILS = [
  'tochukwu.mgbemena@thefifthlab.com',
  'supervisor@thefifthlab.com',
];

const getEmailDomain = (email = '') => String(email || '').split('@')[1]?.toLowerCase().trim() || '';

const isFifthLabOrg = async (organizationId) => {
  if (!organizationId) return false;
  const res = await query(
    `SELECT 1 FROM organizations
     WHERE id = $1 AND (slug = 'fifthlab' OR domain = $2 OR name ILIKE 'FifthLab')
     LIMIT 1`,
    [organizationId, FIFTHLAB_DOMAIN]
  );
  return Boolean(res.rows[0]);
};

const getFifthLabDepartmentId = async (organizationId) => {
  if (!organizationId) return null;

  const existing = await query(
    `SELECT id FROM departments
     WHERE organization_id = $1 AND name = $2
     LIMIT 1`,
    [organizationId, FIFTHLAB_DEPARTMENT]
  );
  if (existing.rows[0]) return existing.rows[0].id;

  const created = await query(
    `INSERT INTO departments (organization_id, name, code, description)
     VALUES ($1, $2, 'FIFTHLAB', 'FifthLab Venture Lab')
     ON CONFLICT (organization_id, name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [organizationId, FIFTHLAB_DEPARTMENT]
  );
  return created.rows[0]?.id || null;
};

const isFifthLabDepartment = async (departmentId) => {
  if (!departmentId) return false;
  const res = await query(
    `SELECT 1 FROM departments
     WHERE id = $1 AND name = $2
     LIMIT 1`,
    [departmentId, FIFTHLAB_DEPARTMENT]
  );
  return Boolean(res.rows[0]);
};

const findDefaultFifthLabSupervisor = async (organizationId) => {
  if (!organizationId) return null;
  const fifthLabDeptId = await getFifthLabDepartmentId(organizationId);

  const res = await query(
    `SELECT sp.*
     FROM supervisor_profiles sp
     JOIN users u ON u.id = sp.user_id
     WHERE u.organization_id = $1
       AND u.status = 'active'
       AND u.deleted_at IS NULL
       AND (
         LOWER(u.email) = ANY($2::text[])
         OR (LOWER(u.first_name) = 'tochukwu' AND LOWER(u.last_name) IN ('mgbemena', 'mgbemmena'))
       )
     ORDER BY
       (sp.department_id = $3) DESC,
       (LOWER(u.email) = 'tochukwu.mgbemena@thefifthlab.com') DESC,
       sp.created_at ASC
     LIMIT 1`,
    [organizationId, DEFAULT_SUPERVISOR_EMAILS, fifthLabDeptId]
  );

  return res.rows[0] || null;
};

const resolveFifthLabDefaults = async ({
  organizationId,
  departmentId = null,
  supervisorId = null,
  email = '',
} = {}) => {
  const selectedFifthLabDepartment = await isFifthLabDepartment(departmentId);
  const shouldUseFifthLab = departmentId
    ? selectedFifthLabDepartment
    : (getEmailDomain(email) === FIFTHLAB_DOMAIN || await isFifthLabOrg(organizationId));

  if (!shouldUseFifthLab) {
    return { departmentId, supervisorId };
  }

  const targetDepartmentId = departmentId || await getFifthLabDepartmentId(organizationId);
  const targetSupervisorId = supervisorId || (await findDefaultFifthLabSupervisor(organizationId))?.id || null;

  return {
    departmentId: targetDepartmentId,
    supervisorId: targetSupervisorId,
  };
};

module.exports = {
  getFifthLabDepartmentId,
  findDefaultFifthLabSupervisor,
  resolveFifthLabDefaults,
};
