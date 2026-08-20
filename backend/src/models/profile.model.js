const { query } = require('../config/db');

const ProfileModel = {
  async getOrCreateDefaultOrganization() {
    const res = await query('SELECT id FROM organizations LIMIT 1');
    if (res.rows.length > 0) {
      return res.rows[0].id;
    }
    const newOrg = await query(
      `INSERT INTO organizations (name, slug)
       VALUES ('Trakive Organization', 'trakive-org')
       RETURNING id;`
    );
    return newOrg.rows[0].id;
  },

  async findInternProfileByUserId(userId) {
    const res = await query('SELECT * FROM intern_profiles WHERE user_id = $1', [userId]);
    return res.rows[0] || null;
  },

  async findSupervisorProfileByUserId(userId) {
    const res = await query('SELECT * FROM supervisor_profiles WHERE user_id = $1', [userId]);
    return res.rows[0] || null;
  },

  async findSupervisorById(id) {
    const res = await query('SELECT * FROM supervisor_profiles WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async findHeadProfileByUserId(userId) {
    const res = await query('SELECT * FROM head_profiles WHERE user_id = $1', [userId]);
    return res.rows[0] || null;
  },

  async upsertInternProfile({
    user_id,
    organization_id = null,
    department_id = null,
    supervisor_id = null,
    institution = null,
    field_of_study = null,
    academic_year = null,
    emergency_contact = {},
    skills = [],
    status = 'onboarding',
  }) {
    let targetOrgId = organization_id;
    if (!targetOrgId) {
      const userRes = await query('SELECT organization_id FROM users WHERE id = $1', [user_id]);
      if (userRes.rows[0] && userRes.rows[0].organization_id) {
        targetOrgId = userRes.rows[0].organization_id;
      } else {
        targetOrgId = await this.getOrCreateDefaultOrganization();
        await query('UPDATE users SET organization_id = $1 WHERE id = $2', [targetOrgId, user_id]);
      }
    }

    const sql = `
      INSERT INTO intern_profiles (
        user_id, organization_id, department_id, supervisor_id,
        institution, field_of_study, academic_year, emergency_contact, skills, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (user_id) DO UPDATE SET
        department_id = COALESCE(EXCLUDED.department_id, intern_profiles.department_id),
        supervisor_id = COALESCE(EXCLUDED.supervisor_id, intern_profiles.supervisor_id),
        institution = COALESCE(EXCLUDED.institution, intern_profiles.institution),
        field_of_study = COALESCE(EXCLUDED.field_of_study, intern_profiles.field_of_study),
        academic_year = COALESCE(EXCLUDED.academic_year, intern_profiles.academic_year),
        emergency_contact = CASE 
                              WHEN EXCLUDED.emergency_contact = '{}'::jsonb THEN intern_profiles.emergency_contact 
                              ELSE EXCLUDED.emergency_contact 
                            END,
        skills = CASE 
                   WHEN EXCLUDED.skills = '[]'::jsonb THEN intern_profiles.skills 
                   ELSE EXCLUDED.skills 
                 END,
        status = COALESCE(EXCLUDED.status, intern_profiles.status),
        updated_at = NOW()
      RETURNING *;
    `;
    const values = [
      user_id,
      targetOrgId,
      department_id,
      supervisor_id,
      institution,
      field_of_study,
      academic_year,
      JSON.stringify(emergency_contact || {}),
      JSON.stringify(skills || []),
      status,
    ];
    const res = await query(sql, values);
    return res.rows[0];
  },

  async upsertSupervisorProfile({
    user_id,
    organization_id = null,
    department_id = null,
    title = null,
    max_interns = 10,
    specialization = null,
  }) {
    let targetOrgId = organization_id;
    if (!targetOrgId) {
      const userRes = await query('SELECT organization_id FROM users WHERE id = $1', [user_id]);
      if (userRes.rows[0] && userRes.rows[0].organization_id) {
        targetOrgId = userRes.rows[0].organization_id;
      } else {
        targetOrgId = await this.getOrCreateDefaultOrganization();
        await query('UPDATE users SET organization_id = $1 WHERE id = $2', [targetOrgId, user_id]);
      }
    }

    const sql = `
      INSERT INTO supervisor_profiles (user_id, organization_id, department_id, title, max_interns, specialization)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) DO UPDATE SET
        department_id = COALESCE(EXCLUDED.department_id, supervisor_profiles.department_id),
        title = COALESCE(EXCLUDED.title, supervisor_profiles.title),
        max_interns = COALESCE(EXCLUDED.max_interns, supervisor_profiles.max_interns),
        specialization = COALESCE(EXCLUDED.specialization, supervisor_profiles.specialization),
        updated_at = NOW()
      RETURNING *;
    `;
    const res = await query(sql, [user_id, targetOrgId, department_id, title, max_interns, specialization]);
    return res.rows[0];
  },

  async upsertHeadProfile({
    user_id,
    organization_id = null,
    department_id = null,
    title = null,
    office_location = null,
    bio = null,
  }) {
    let targetOrgId = organization_id;
    if (!targetOrgId) {
      const userRes = await query('SELECT organization_id FROM users WHERE id = $1', [user_id]);
      if (userRes.rows[0] && userRes.rows[0].organization_id) {
        targetOrgId = userRes.rows[0].organization_id;
      } else {
        targetOrgId = await this.getOrCreateDefaultOrganization();
        await query('UPDATE users SET organization_id = $1 WHERE id = $2', [targetOrgId, user_id]);
      }
    }

    const sql = `
      INSERT INTO head_profiles (user_id, organization_id, department_id, title, office_location, bio)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) DO UPDATE SET
        department_id = COALESCE(EXCLUDED.department_id, head_profiles.department_id),
        title = COALESCE(EXCLUDED.title, head_profiles.title),
        office_location = COALESCE(EXCLUDED.office_location, head_profiles.office_location),
        bio = COALESCE(EXCLUDED.bio, head_profiles.bio),
        updated_at = NOW()
      RETURNING *;
    `;
    const res = await query(sql, [user_id, targetOrgId, department_id, title, office_location, bio]);
    return res.rows[0];
  },

  async getCompleteInternProfile(userId) {
    const sql = `
      SELECT 
        u.id AS user_id, u.organization_id, u.department_id, u.email,
        u.first_name, u.last_name, u.phone, u.avatar_url, u.status AS user_status,
        u.created_at AS user_created_at,
        r.name AS role_name,
        d.name AS department_name, d.code AS department_code,
        ip.id AS intern_profile_id, ip.institution, ip.field_of_study, ip.academic_year,
        ip.emergency_contact, ip.skills, ip.status AS intern_status, ip.supervisor_id,
        sup_u.id AS supervisor_user_id, sup_u.first_name AS supervisor_first_name,
        sup_u.last_name AS supervisor_last_name, sup_u.email AS supervisor_email,
        head_u.id AS head_user_id, head_u.first_name AS head_first_name,
        head_u.last_name AS head_last_name, head_u.email AS head_email
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN departments d ON d.id = u.department_id
      LEFT JOIN intern_profiles ip ON ip.user_id = u.id
      LEFT JOIN supervisor_profiles sp ON sp.id = ip.supervisor_id
      LEFT JOIN users sup_u ON sup_u.id = sp.user_id
      LEFT JOIN users head_u ON head_u.id = d.head_user_id
      WHERE u.id = $1 AND u.deleted_at IS NULL;
    `;
    const res = await query(sql, [userId]);
    return res.rows[0] || null;
  },

  async updateInternStatus(userId, status) {
    const sql = `
      UPDATE intern_profiles
      SET status = $1, updated_at = NOW()
      WHERE user_id = $2
      RETURNING *;
    `;
    const res = await query(sql, [status, userId]);
    return res.rows[0] || null;
  },

  async assignInternDepartmentAndSupervisor(userId, departmentId, supervisorProfileId = null) {
    await query('UPDATE users SET department_id = $1, updated_at = NOW() WHERE id = $2', [departmentId, userId]);

    const sql = `
      UPDATE intern_profiles
      SET department_id = $1, supervisor_id = $2, updated_at = NOW()
      WHERE user_id = $3
      RETURNING *;
    `;
    const res = await query(sql, [departmentId, supervisorProfileId, userId]);
    return res.rows[0] || null;
  },
};

module.exports = ProfileModel;
