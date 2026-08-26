const { query } = require('../config/db');

const LeaveModel = {
  async findById(id) {
    const res = await query(
      `SELECT l.*,
              u.first_name AS intern_first_name,
              u.last_name AS intern_last_name,
              u.email AS intern_email,
              u.department_id,
              r.first_name AS reviewer_first_name,
              r.last_name AS reviewer_last_name
       FROM leave_requests l
       JOIN users u ON l.intern_id = u.id
       LEFT JOIN users r ON l.reviewer_id = r.id
       WHERE l.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  async create({ organizationId, internId, leaveType, startDate, endDate, reason }) {
    const res = await query(
      `INSERT INTO leave_requests (organization_id, intern_id, leave_type, start_date, end_date, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [organizationId, internId, leaveType, startDate, endDate, reason]
    );
    return res.rows[0];
  },

  async findOverlappingApprovedLeave(internId, startDate, endDate, excludeId = null) {
    const conditions = [`intern_id = $1`, `status = 'approved'`, `start_date <= $3`, `end_date >= $2`];
    const values = [internId, startDate, endDate];

    if (excludeId) {
      conditions.push(`id != $4`);
      values.push(excludeId);
    }

    const sql = `SELECT * FROM leave_requests WHERE ${conditions.join(' AND ')} LIMIT 1`;
    const res = await query(sql, values);
    return res.rows[0] || null;
  },

  async findLeaveRequests({
    organizationId,
    internId,
    departmentId,
    supervisorId,
    status,
    leaveType,
    startDate,
    endDate,
    limit = 10,
    offset = 0,
    sortBy = 'created_at',
    order = 'DESC',
  }) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (organizationId) {
      conditions.push(`l.organization_id = $${paramIndex++}`);
      values.push(organizationId);
    }

    if (internId) {
      conditions.push(`l.intern_id = $${paramIndex++}`);
      values.push(internId);
    }

    if (departmentId) {
      conditions.push(`u.department_id = $${paramIndex++}`);
      values.push(departmentId);
    }

    if (supervisorId) {
      conditions.push(`EXISTS (
        SELECT 1 FROM intern_profiles ip 
        WHERE ip.user_id = l.intern_id AND ip.supervisor_id = $${paramIndex++}
      )`);
      values.push(supervisorId);
    }

    if (status) {
      conditions.push(`l.status = $${paramIndex++}`);
      values.push(status);
    }

    if (leaveType) {
      conditions.push(`l.leave_type = $${paramIndex++}`);
      values.push(leaveType);
    }

    if (startDate) {
      conditions.push(`l.end_date >= $${paramIndex++}`);
      values.push(startDate);
    }

    if (endDate) {
      conditions.push(`l.start_date <= $${paramIndex++}`);
      values.push(endDate);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeSortBy = ['created_at', 'start_date', 'end_date', 'status', 'leave_type'].includes(sortBy)
      ? `l.${sortBy}`
      : 'l.created_at';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const sql = `
      SELECT l.*,
             u.first_name AS intern_first_name,
             u.last_name AS intern_last_name,
             u.email AS intern_email,
             u.department_id,
             r.first_name AS reviewer_first_name,
             r.last_name AS reviewer_last_name
      FROM leave_requests l
      JOIN users u ON l.intern_id = u.id
      LEFT JOIN users r ON l.reviewer_id = r.id
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    values.push(limit, offset);
    const res = await query(sql, values);
    return res.rows;
  },

  async countLeaveRequests({
    organizationId,
    internId,
    departmentId,
    supervisorId,
    status,
    leaveType,
    startDate,
    endDate,
  }) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (organizationId) {
      conditions.push(`l.organization_id = $${paramIndex++}`);
      values.push(organizationId);
    }

    if (internId) {
      conditions.push(`l.intern_id = $${paramIndex++}`);
      values.push(internId);
    }

    if (departmentId) {
      conditions.push(`u.department_id = $${paramIndex++}`);
      values.push(departmentId);
    }

    if (supervisorId) {
      conditions.push(`EXISTS (
        SELECT 1 FROM intern_profiles ip 
        WHERE ip.user_id = l.intern_id AND ip.supervisor_id = $${paramIndex++}
      )`);
      values.push(supervisorId);
    }

    if (status) {
      conditions.push(`l.status = $${paramIndex++}`);
      values.push(status);
    }

    if (leaveType) {
      conditions.push(`l.leave_type = $${paramIndex++}`);
      values.push(leaveType);
    }

    if (startDate) {
      conditions.push(`l.end_date >= $${paramIndex++}`);
      values.push(startDate);
    }

    if (endDate) {
      conditions.push(`l.start_date <= $${paramIndex++}`);
      values.push(endDate);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT COUNT(*) AS total
      FROM leave_requests l
      JOIN users u ON l.intern_id = u.id
      ${whereClause}
    `;

    const res = await query(sql, values);
    return parseInt(res.rows[0].total, 10);
  },

  async updateStatus(id, { status, reviewerId, reviewerComment = null, reviewedAt = new Date() }) {
    const res = await query(
      `UPDATE leave_requests
       SET status = $1,
           reviewer_id = $2,
           reviewer_comment = $3,
           reviewed_at = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [status, reviewerId, reviewerComment, reviewedAt, id]
    );
    return res.rows[0];
  },
};

module.exports = LeaveModel;
