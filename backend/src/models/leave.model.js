const { query } = require('../config/db');

const LeaveModel = {
  async findById(id) {
    const res = await query('SELECT * FROM leave_requests WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async findPaginated({
    organization_id = null,
    search = '',
    status = '',
    leave_type = '',
    intern_id = null,
    department_id = null,
    start_date = null,
    end_date = null,
    limit = 10,
    offset = 0,
    sort = 'created_at:desc',
  }) {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`l.organization_id = $${idx}`);
      values.push(organization_id);
      idx++;
    }

    if (search) {
      whereClauses.push(`(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR l.reason ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (status) {
      whereClauses.push(`l.status = $${idx}`);
      values.push(status);
      idx++;
    }

    if (leave_type) {
      whereClauses.push(`l.leave_type = $${idx}`);
      values.push(leave_type);
      idx++;
    }

    if (intern_id) {
      whereClauses.push(`l.intern_id = $${idx}`);
      values.push(intern_id);
      idx++;
    }

    if (department_id) {
      whereClauses.push(`u.department_id = $${idx}`);
      values.push(department_id);
      idx++;
    }

    if (start_date) {
      whereClauses.push(`l.start_date >= $${idx}`);
      values.push(start_date);
      idx++;
    }

    if (end_date) {
      whereClauses.push(`l.end_date <= $${idx}`);
      values.push(end_date);
      idx++;
    }

    const whereClauseSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let orderBy = 'l.created_at DESC';
    if (sort) {
      const [col, dir] = sort.split(':');
      const allowedCols = ['created_at', 'start_date', 'end_date', 'status', 'leave_type'];
      const orderDir = dir && dir.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      if (allowedCols.includes(col)) {
        orderBy = `l.${col} ${orderDir}`;
      }
    }

    const sql = `
      SELECT 
        l.id, l.organization_id, l.intern_id, l.leave_type, l.start_date, l.end_date,
        l.reason, l.status, l.reviewer_id, l.reviewer_comment, l.reviewed_at,
        l.created_at, l.updated_at,
        u.first_name AS intern_first_name, u.last_name AS intern_last_name, u.email AS intern_email,
        r.first_name AS reviewer_first_name, r.last_name AS reviewer_last_name
      FROM leave_requests l
      JOIN users u ON u.id = l.intern_id
      LEFT JOIN users r ON r.id = l.reviewer_id
      ${whereClauseSql}
      ORDER BY ${orderBy}
      LIMIT $${idx} OFFSET $${idx + 1};
    `;

    values.push(limit, offset);
    const res = await query(sql, values);
    return res.rows;
  },

  async count({
    organization_id = null,
    search = '',
    status = '',
    leave_type = '',
    intern_id = null,
    department_id = null,
    start_date = null,
    end_date = null,
  }) {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`l.organization_id = $${idx}`);
      values.push(organization_id);
      idx++;
    }

    if (search) {
      whereClauses.push(`(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR l.reason ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (status) {
      whereClauses.push(`l.status = $${idx}`);
      values.push(status);
      idx++;
    }

    if (leave_type) {
      whereClauses.push(`l.leave_type = $${idx}`);
      values.push(leave_type);
      idx++;
    }

    if (intern_id) {
      whereClauses.push(`l.intern_id = $${idx}`);
      values.push(intern_id);
      idx++;
    }

    if (department_id) {
      whereClauses.push(`u.department_id = $${idx}`);
      values.push(department_id);
      idx++;
    }

    if (start_date) {
      whereClauses.push(`l.start_date >= $${idx}`);
      values.push(start_date);
      idx++;
    }

    if (end_date) {
      whereClauses.push(`l.end_date <= $${idx}`);
      values.push(end_date);
      idx++;
    }

    const whereClauseSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT COUNT(l.id) as count
      FROM leave_requests l
      JOIN users u ON u.id = l.intern_id
      ${whereClauseSql};
    `;

    const res = await query(sql, values);
    return parseInt(res.rows[0].count, 10);
  },

  async findApprovedLeaveRequests() {
    const sql = `
      SELECT * FROM leave_requests 
      WHERE status = 'approved';
    `;
    const res = await query(sql);
    return res.rows;
  },
};

module.exports = LeaveModel;
