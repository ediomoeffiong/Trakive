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
    emergency_contact,
    skills,
    work_location = null,
    work_hours = null,
    days_per_week = null,
    status = null,
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
        institution, field_of_study, academic_year, emergency_contact, skills,
        work_location, work_hours, days_per_week, status
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        COALESCE($8::jsonb, '{}'::jsonb),
        COALESCE($9::jsonb, '[]'::jsonb),
        $10, $11, $12,
        COALESCE($13, 'onboarding')
      )
      ON CONFLICT (user_id) DO UPDATE SET
        department_id = COALESCE(EXCLUDED.department_id, intern_profiles.department_id),
        supervisor_id = COALESCE(EXCLUDED.supervisor_id, intern_profiles.supervisor_id),
        institution = COALESCE(EXCLUDED.institution, intern_profiles.institution),
        field_of_study = COALESCE(EXCLUDED.field_of_study, intern_profiles.field_of_study),
        academic_year = COALESCE(EXCLUDED.academic_year, intern_profiles.academic_year),
        emergency_contact = COALESCE($8::jsonb, intern_profiles.emergency_contact),
        skills = COALESCE($9::jsonb, intern_profiles.skills),
        work_location = COALESCE(EXCLUDED.work_location, intern_profiles.work_location),
        work_hours = COALESCE(EXCLUDED.work_hours, intern_profiles.work_hours),
        days_per_week = COALESCE(EXCLUDED.days_per_week, intern_profiles.days_per_week),
        status = COALESCE($13, intern_profiles.status),
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
      emergency_contact === undefined ? null : JSON.stringify(emergency_contact || {}),
      skills === undefined ? null : JSON.stringify(skills || []),
      work_location,
      work_hours,
      days_per_week,
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
        u.first_name, u.last_name, u.phone, u.avatar_url,
        u.date_of_birth, u.gender, u.address, u.city, u.state, u.country, u.bio,
        u.status AS user_status,
        u.created_at AS user_created_at,
        r.name AS role_name,
        d.name AS department_name, d.code AS department_code,
        ip.id AS intern_profile_id, ip.institution, ip.field_of_study, ip.academic_year,
        ip.emergency_contact, ip.skills, ip.work_location, ip.work_hours, ip.days_per_week,
        ip.status AS intern_status, ip.supervisor_id,
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

  async recordSupervisorAssignment(internProfileId, supervisorProfileId, assignedByUserId = null, status = 'active', notes = null) {
    // End any active/reassignment_required assignments for this intern
    await query(
      `UPDATE supervisor_assignments
       SET status = 'ended', ended_at = NOW(), updated_at = NOW()
       WHERE intern_profile_id = $1 AND status IN ('active', 'reassignment_required')`,
      [internProfileId]
    );

    const res = await query(
      `INSERT INTO supervisor_assignments (intern_profile_id, supervisor_id, assigned_by, status, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [internProfileId, supervisorProfileId, assignedByUserId, status, notes]
    );
    return res.rows[0];
  },

  async getSupervisorAssignmentHistory(internProfileId) {
    const res = await query(
      `SELECT 
         sa.*,
         sup_u.first_name AS supervisor_first_name,
         sup_u.last_name AS supervisor_last_name,
         sup_u.email AS supervisor_email,
         by_u.first_name AS assigned_by_first_name,
         by_u.last_name AS assigned_by_last_name
       FROM supervisor_assignments sa
       LEFT JOIN supervisor_profiles sp ON sp.id = sa.supervisor_id
       LEFT JOIN users sup_u ON sup_u.id = sp.user_id
       LEFT JOIN users by_u ON by_u.id = sa.assigned_by
       WHERE sa.intern_profile_id = $1
       ORDER BY sa.created_at DESC`,
      [internProfileId]
    );
    return res.rows;
  },

  async markSupervisorAssignmentsReassignmentRequired(supervisorProfileId) {
    const affectedRes = await query(
      `UPDATE supervisor_assignments
       SET status = 'reassignment_required', ended_at = NOW(), updated_at = NOW()
       WHERE supervisor_id = $1 AND status = 'active'
       RETURNING intern_profile_id`,
      [supervisorProfileId]
    );

    const affectedInternProfileIds = affectedRes.rows.map((r) => r.intern_profile_id);

    if (affectedInternProfileIds.length > 0) {
      await query(
        `UPDATE intern_profiles
         SET supervisor_id = NULL, updated_at = NOW()
         WHERE id = ANY($1::uuid[])`,
        [affectedInternProfileIds]
      );
    }

    return affectedInternProfileIds;
  },
};

module.exports = ProfileModel;
