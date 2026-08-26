const { query } = require('../config/db');

const AttendanceModel = {
  async findByInternAndDate(internId, date) {
    const res = await query('SELECT * FROM attendance WHERE intern_id = $1 AND date = $2', [internId, date]);
    return res.rows[0] || null;
  },

  async findPaginated({
    organization_id = null,
    search = '',
    status = '',
    intern_id = null,
    department_id = null,
    start_date = null,
    end_date = null,
    limit = 10,
    offset = 0,
    sort = 'date:desc',
  }) {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`a.organization_id = $${idx}`);
      values.push(organization_id);
      idx++;
    }

    if (search) {
      whereClauses.push(`(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR a.notes ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (status) {
      whereClauses.push(`a.status = $${idx}`);
      values.push(status);
      idx++;
    }

    if (intern_id) {
      whereClauses.push(`a.intern_id = $${idx}`);
      values.push(intern_id);
      idx++;
    }

    if (department_id) {
      whereClauses.push(`u.department_id = $${idx}`);
      values.push(department_id);
      idx++;
    }

    if (start_date) {
      whereClauses.push(`a.date >= $${idx}`);
      values.push(start_date);
      idx++;
    }

    if (end_date) {
      whereClauses.push(`a.date <= $${idx}`);
      values.push(end_date);
      idx++;
    }

    const whereClauseSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let orderBy = 'a.date DESC';
    if (sort) {
      const [col, dir] = sort.split(':');
      const allowedCols = ['date', 'status', 'created_at'];
      const orderDir = dir && dir.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      if (allowedCols.includes(col)) {
        orderBy = `a.${col} ${orderDir}`;
      }
    }

    const sql = `
      SELECT 
        a.id, a.organization_id, a.intern_id, a.date, a.check_in, a.check_out,
        a.status, a.notes, a.verified_by, a.created_at, a.updated_at,
        u.first_name AS intern_first_name, u.last_name AS intern_last_name, u.email AS intern_email
      FROM attendance a
      JOIN users u ON u.id = a.intern_id
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
    intern_id = null,
    department_id = null,
    start_date = null,
    end_date = null,
  }) {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`a.organization_id = $${idx}`);
      values.push(organization_id);
      idx++;
    }

    if (search) {
      whereClauses.push(`(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR a.notes ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (status) {
      whereClauses.push(`a.status = $${idx}`);
      values.push(status);
      idx++;
    }

    if (intern_id) {
      whereClauses.push(`a.intern_id = $${idx}`);
      values.push(intern_id);
      idx++;
    }

    if (department_id) {
      whereClauses.push(`u.department_id = $${idx}`);
      values.push(department_id);
      idx++;
    }

    if (start_date) {
      whereClauses.push(`a.date >= $${idx}`);
      values.push(start_date);
      idx++;
    }

    if (end_date) {
      whereClauses.push(`a.date <= $${idx}`);
      values.push(end_date);
      idx++;
    }

    const whereClauseSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT COUNT(a.id) as count
      FROM attendance a
      JOIN users u ON u.id = a.intern_id
      ${whereClauseSql};
    `;

    const res = await query(sql, values);
    return parseInt(res.rows[0].count, 10);
  },

  async upsertExcusedAttendance(organizationId, internId, date, notes = 'On Approved Leave') {
    const sql = `
      INSERT INTO attendance (organization_id, intern_id, date, status, notes)
      VALUES ($1, $2, $3, 'excused', $4)
      ON CONFLICT (intern_id, date)
      DO UPDATE SET status = 'excused', notes = EXCLUDED.notes, updated_at = NOW();
    `;
    await query(sql, [organizationId, internId, date, notes]);
  },
};

module.exports = AttendanceModel;
