const { query } = require('../config/db');

const DEFAULT_WEEKDAYS = [2, 3, 4];

const AttendanceConfigModel = {
  async getPolicy(organizationId) {
    const res = await query(
      'SELECT * FROM attendance_policies WHERE organization_id = $1',
      [organizationId]
    );
    if (res.rows[0]) return res.rows[0];
    const created = await query(
      `INSERT INTO attendance_policies (organization_id) VALUES ($1)
       ON CONFLICT (organization_id) DO UPDATE SET updated_at = attendance_policies.updated_at
       RETURNING *`,
      [organizationId]
    );
    return created.rows[0];
  },

  async upsertPolicy(organizationId, updates = {}) {
    await this.getPolicy(organizationId);
    const allowed = [
      'timezone',
      'country_code',
      'required_arrival_time',
      'grace_minutes',
      'default_radius_m',
      'max_accuracy_m',
    ];
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(updates[key]);
        idx += 1;
      }
    }
    if (!fields.length) return this.getPolicy(organizationId);
    fields.push('updated_at = NOW()');
    values.push(organizationId);
    const res = await query(
      `UPDATE attendance_policies SET ${fields.join(', ')} WHERE organization_id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0];
  },

  async getDepartmentSchedule(departmentId, organizationId) {
    const res = await query(
      'SELECT * FROM department_attendance_schedules WHERE department_id = $1',
      [departmentId]
    );
    if (res.rows[0]) return res.rows[0];
    if (!organizationId || !departmentId) {
      return { department_id: departmentId, weekdays: DEFAULT_WEEKDAYS };
    }
    const created = await query(
      `INSERT INTO department_attendance_schedules (organization_id, department_id, weekdays)
       VALUES ($1, $2, $3)
       ON CONFLICT (department_id) DO UPDATE SET updated_at = department_attendance_schedules.updated_at
       RETURNING *`,
      [organizationId, departmentId, DEFAULT_WEEKDAYS]
    );
    return created.rows[0];
  },

  async listDepartmentSchedules(organizationId) {
    const sql = `
      SELECT s.*, d.name AS department_name, d.code AS department_code
      FROM department_attendance_schedules s
      JOIN departments d ON d.id = s.department_id
      WHERE s.organization_id = $1 AND d.deleted_at IS NULL
      ORDER BY d.name ASC
    `;
    const res = await query(sql, [organizationId]);
    return res.rows;
  },

  async upsertDepartmentSchedule({ organizationId, departmentId, weekdays, createdBy }) {
    const sql = `
      INSERT INTO department_attendance_schedules (organization_id, department_id, weekdays, created_by)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (department_id) DO UPDATE SET
        weekdays = EXCLUDED.weekdays,
        updated_at = NOW()
      RETURNING *
    `;
    const res = await query(sql, [organizationId, departmentId, weekdays, createdBy || null]);
    return res.rows[0];
  },

  async getPerformanceSettings(organizationId) {
    const res = await query(
      'SELECT * FROM attendance_performance_settings WHERE organization_id = $1',
      [organizationId]
    );
    if (res.rows[0]) return res.rows[0];
    const created = await query(
      `INSERT INTO attendance_performance_settings (organization_id) VALUES ($1)
       ON CONFLICT (organization_id) DO UPDATE SET updated_at = attendance_performance_settings.updated_at
       RETURNING *`,
      [organizationId]
    );
    return created.rows[0];
  },

  async upsertPerformanceSettings(organizationId, updates = {}, updatedBy = null) {
    await this.getPerformanceSettings(organizationId);
    const allowed = [
      'enabled',
      'attendance_weight',
      'task_weight',
      'rating_weight',
      'present_points',
      'late_points',
      'remote_points',
    ];
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(updates[key]);
        idx += 1;
      }
    }
    fields.push(`updated_by = $${idx}`);
    values.push(updatedBy);
    idx += 1;
    fields.push('updated_at = NOW()');
    values.push(organizationId);
    const res = await query(
      `UPDATE attendance_performance_settings SET ${fields.join(', ')} WHERE organization_id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0];
  },

  async listOverrides({ organizationId, internId, departmentId, startDate, endDate }) {
    const clauses = ['organization_id = $1'];
    const values = [organizationId];
    let idx = 2;
    if (internId) {
      clauses.push(`(scope_type = 'intern' AND intern_id = $${idx})`);
      values.push(internId);
      idx += 1;
    }
    if (departmentId) {
      clauses.push(`(scope_type = 'department' AND department_id = $${idx})`);
      values.push(departmentId);
      idx += 1;
    }
    if (startDate && endDate) {
      clauses.push(`start_date <= $${idx} AND end_date >= $${idx + 1}`);
      values.push(endDate, startDate);
      idx += 2;
    }
    const res = await query(
      `SELECT * FROM attendance_schedule_overrides
       WHERE ${clauses.join(' AND ')}
       ORDER BY start_date DESC, created_at DESC`,
      values
    );
    return res.rows;
  },

  async findOverridesForDate({ organizationId, internId, departmentId, date }) {
    const sql = `
      SELECT * FROM attendance_schedule_overrides
      WHERE organization_id = $1
        AND start_date <= $2 AND end_date >= $2
        AND (
          (scope_type = 'intern' AND intern_id = $3)
          OR (scope_type = 'department' AND department_id = $4)
        )
      ORDER BY
        CASE WHEN scope_type = 'intern' THEN 0 ELSE 1 END,
        created_at DESC
    `;
    const res = await query(sql, [organizationId, date, internId || null, departmentId || null]);
    return res.rows;
  },

  async createOverride(data) {
    const sql = `
      INSERT INTO attendance_schedule_overrides (
        organization_id, scope_type, department_id, intern_id,
        start_date, end_date, weekdays, kind, reason, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `;
    const res = await query(sql, [
      data.organization_id,
      data.scope_type,
      data.department_id || null,
      data.intern_id || null,
      data.start_date,
      data.end_date,
      data.weekdays || null,
      data.kind,
      data.reason,
      data.created_by || null,
    ]);
    return res.rows[0];
  },

  async deleteOverride(id, organizationId) {
    const res = await query(
      'DELETE FROM attendance_schedule_overrides WHERE id = $1 AND organization_id = $2 RETURNING *',
      [id, organizationId]
    );
    return res.rows[0] || null;
  },
};

module.exports = AttendanceConfigModel;
