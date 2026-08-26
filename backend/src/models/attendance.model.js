const { query } = require('../config/db');

const AttendanceModel = {
  async findByInternAndDate(internId, date) {
    const res = await query('SELECT * FROM attendance WHERE intern_id = $1 AND date = $2', [internId, date]);
    return res.rows[0] || null;
  },

  async findById(id) {
    const res = await query(
      `SELECT a.*, 
              u.first_name AS intern_first_name, 
              u.last_name AS intern_last_name, 
              u.email AS intern_email
       FROM attendance a
       JOIN users u ON a.intern_id = u.id
       WHERE a.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  async create({ organizationId, internId, date, checkIn, status = 'present', notes = null }) {
    const res = await query(
      `INSERT INTO attendance (organization_id, intern_id, date, check_in, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [organizationId, internId, date, checkIn, status, notes]
    );
    return res.rows[0];
  },

  async updateClockOut(id, checkOut, workDurationMinutes, notes = null) {
    const res = await query(
      `UPDATE attendance
       SET check_out = $1,
           work_duration_minutes = $2,
           notes = CASE WHEN $3::text IS NOT NULL THEN $3::text ELSE notes END,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [checkOut, workDurationMinutes, notes, id]
    );
    return res.rows[0];
  },

  async update(id, updates) {
    const keys = Object.keys(updates);
    if (keys.length === 0) return this.findById(id);

    const setClauses = [];
    const values = [];

    keys.forEach((key, index) => {
      setClauses.push(`${key} = $${index + 1}`);
      values.push(updates[key]);
    });

    values.push(id);
    const sql = `UPDATE attendance SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`;
    const res = await query(sql, values);
    return res.rows[0];
  },

  async findAttendance({
    organizationId,
    internId,
    departmentId,
    supervisorId,
    startDate,
    endDate,
    status,
    limit = 10,
    offset = 0,
    sortBy = 'date',
    order = 'DESC',
  }) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (organizationId) {
      conditions.push(`a.organization_id = $${paramIndex++}`);
      values.push(organizationId);
    }

    if (internId) {
      conditions.push(`a.intern_id = $${paramIndex++}`);
      values.push(internId);
    }

    if (departmentId) {
      conditions.push(`u.department_id = $${paramIndex++}`);
      values.push(departmentId);
    }

    if (supervisorId) {
      conditions.push(`EXISTS (
        SELECT 1 FROM intern_profiles ip 
        WHERE ip.user_id = a.intern_id AND ip.supervisor_id = $${paramIndex++}
      )`);
      values.push(supervisorId);
    }

    if (startDate) {
      conditions.push(`a.date >= $${paramIndex++}`);
      values.push(startDate);
    }

    if (endDate) {
      conditions.push(`a.date <= $${paramIndex++}`);
      values.push(endDate);
    }

    if (status) {
      conditions.push(`a.status = $${paramIndex++}`);
      values.push(status);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeSortBy = ['date', 'created_at', 'status', 'check_in', 'check_out', 'work_duration_minutes'].includes(sortBy)
      ? `a.${sortBy}`
      : 'a.date';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const sql = `
      SELECT a.*,
             u.first_name AS intern_first_name,
             u.last_name AS intern_last_name,
             u.email AS intern_email,
             u.department_id
      FROM attendance a
      JOIN users u ON a.intern_id = u.id
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    values.push(limit, offset);
    const res = await query(sql, values);
    return res.rows;
  },

  async countAttendance({
    organizationId,
    internId,
    departmentId,
    supervisorId,
    startDate,
    endDate,
    status,
  }) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (organizationId) {
      conditions.push(`a.organization_id = $${paramIndex++}`);
      values.push(organizationId);
    }

    if (internId) {
      conditions.push(`a.intern_id = $${paramIndex++}`);
      values.push(internId);
    }

    if (departmentId) {
      conditions.push(`u.department_id = $${paramIndex++}`);
      values.push(departmentId);
    }

    if (supervisorId) {
      conditions.push(`EXISTS (
        SELECT 1 FROM intern_profiles ip 
        WHERE ip.user_id = a.intern_id AND ip.supervisor_id = $${paramIndex++}
      )`);
      values.push(supervisorId);
    }

    if (startDate) {
      conditions.push(`a.date >= $${paramIndex++}`);
      values.push(startDate);
    }

    if (endDate) {
      conditions.push(`a.date <= $${paramIndex++}`);
      values.push(endDate);
    }

    if (status) {
      conditions.push(`a.status = $${paramIndex++}`);
      values.push(status);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT COUNT(*) AS total
      FROM attendance a
      JOIN users u ON a.intern_id = u.id
      ${whereClause}
    `;

    const res = await query(sql, values);
    return parseInt(res.rows[0].total, 10);
  },

  async bulkUpsertLeaveAttendance({ organizationId, internId, startDate, endDate, notes = 'Approved Leave' }) {
    const sql = `
      INSERT INTO attendance (organization_id, intern_id, date, status, notes)
      SELECT $1, $2, d::date, 'on_leave', $3
      FROM generate_series($4::date, $5::date, '1 day'::interval) d
      ON CONFLICT (intern_id, date) 
      DO UPDATE SET status = 'on_leave', notes = EXCLUDED.notes, updated_at = NOW()
      RETURNING *
    `;
    const res = await query(sql, [organizationId, internId, notes, startDate, endDate]);
    return res.rows;
  },
};

module.exports = AttendanceModel;
