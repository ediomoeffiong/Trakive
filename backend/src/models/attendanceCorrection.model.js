const { query } = require('../config/db');

const AttendanceCorrectionModel = {
  async create(data) {
    const sql = `
      INSERT INTO attendance_correction_requests (
        organization_id, intern_id, internship_record_id, attendance_id,
        request_date, reason, location_state, client_lat, client_lng, client_accuracy_m, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending')
      RETURNING *
    `;
    const res = await query(sql, [
      data.organization_id,
      data.intern_id,
      data.internship_record_id || null,
      data.attendance_id || null,
      data.request_date,
      data.reason,
      data.location_state || null,
      data.client_lat || null,
      data.client_lng || null,
      data.client_accuracy_m ?? null,
    ]);
    return res.rows[0];
  },

  async findById(id) {
    const res = await query(
      `SELECT r.*,
              u.first_name AS intern_first_name, u.last_name AS intern_last_name, u.email AS intern_email
       FROM attendance_correction_requests r
       JOIN users u ON u.id = r.intern_id
       WHERE r.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  async findPendingForInternDate(internId, date) {
    const res = await query(
      `SELECT * FROM attendance_correction_requests
       WHERE intern_id = $1 AND request_date = $2 AND status = 'pending'
       LIMIT 1`,
      [internId, date]
    );
    return res.rows[0] || null;
  },

  async list({ organizationId, internId, status, supervisorProfileId, limit = 50, offset = 0 }) {
    const clauses = ['r.organization_id = $1'];
    const values = [organizationId];
    let idx = 2;
    if (internId) {
      clauses.push(`r.intern_id = $${idx}`);
      values.push(internId);
      idx += 1;
    }
    if (status) {
      clauses.push(`r.status = $${idx}`);
      values.push(status);
      idx += 1;
    }
    if (supervisorProfileId) {
      clauses.push(`EXISTS (SELECT 1 FROM intern_profiles ip WHERE ip.user_id = r.intern_id AND ip.supervisor_id = $${idx})`);
      values.push(supervisorProfileId);
      idx += 1;
    }
    const sql = `
      SELECT r.*,
             u.first_name AS intern_first_name, u.last_name AS intern_last_name, u.email AS intern_email,
             d.name AS department_name
      FROM attendance_correction_requests r
      JOIN users u ON u.id = r.intern_id
      LEFT JOIN intern_profiles ip ON ip.user_id = r.intern_id
      LEFT JOIN departments d ON d.id = COALESCE(ip.department_id, u.department_id)
      WHERE ${clauses.join(' AND ')}
      ORDER BY r.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    const res = await query(sql, [...values, limit, offset]);
    return res.rows;
  },

  async review(id, { status, reviewerId, reviewerNotes }) {
    const res = await query(
      `UPDATE attendance_correction_requests
       SET status = $1, reviewer_id = $2, reviewer_notes = $3, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, reviewerId, reviewerNotes || null, id]
    );
    return res.rows[0] || null;
  },
};

const AttendanceAuditModel = {
  async log({
    organizationId, attendanceId, internId, internshipRecordId,
    actorId, action, previousValue, newValue, reason,
  }) {
    const res = await query(
      `INSERT INTO attendance_audit_events (
        organization_id, attendance_id, intern_id, internship_record_id,
        actor_id, action, previous_value, new_value, reason
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        organizationId,
        attendanceId || null,
        internId,
        internshipRecordId || null,
        actorId || null,
        action,
        previousValue ? JSON.stringify(previousValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        reason || null,
      ]
    );
    return res.rows[0];
  },

  async listForAttendance(attendanceId) {
    const res = await query(
      `SELECT e.*, u.first_name AS actor_first_name, u.last_name AS actor_last_name
       FROM attendance_audit_events e
       LEFT JOIN users u ON u.id = e.actor_id
       WHERE e.attendance_id = $1
       ORDER BY e.created_at DESC`,
      [attendanceId]
    );
    return res.rows;
  },

  async listForIntern(internId, limit = 50) {
    const res = await query(
      `SELECT e.*, u.first_name AS actor_first_name, u.last_name AS actor_last_name
       FROM attendance_audit_events e
       LEFT JOIN users u ON u.id = e.actor_id
       WHERE e.intern_id = $1
       ORDER BY e.created_at DESC
       LIMIT $2`,
      [internId, limit]
    );
    return res.rows;
  },
};

module.exports = {
  AttendanceCorrectionModel,
  AttendanceAuditModel,
};
