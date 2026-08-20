const { query } = require('../config/db');

const DepartmentModel = {
  async findById(id) {
    const sql = `
      SELECT 
        d.*,
        u.first_name AS head_first_name,
        u.last_name AS head_last_name,
        u.email AS head_email
      FROM departments d
      LEFT JOIN users u ON u.id = d.head_user_id
      WHERE d.id = $1 AND d.deleted_at IS NULL;
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  async findByOrganization(orgId) {
    const sql = `
      SELECT 
        d.*,
        u.first_name AS head_first_name,
        u.last_name AS head_last_name,
        u.email AS head_email
      FROM departments d
      LEFT JOIN users u ON u.id = d.head_user_id
      WHERE d.organization_id = $1 AND d.deleted_at IS NULL
      ORDER BY d.name;
    `;
    const res = await query(sql, [orgId]);
    return res.rows;
  },

  async create({ organization_id, name, code = null, description = null, head_user_id = null }) {
    const sql = `
      INSERT INTO departments (organization_id, name, code, description, head_user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const res = await query(sql, [organization_id, name, code, description, head_user_id]);
    return res.rows[0];
  },

  async update(id, { name, code, description, head_user_id }) {
    const setClauses = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      setClauses.push(`name = $${idx++}`);
      values.push(name);
    }
    if (code !== undefined) {
      setClauses.push(`code = $${idx++}`);
      values.push(code);
    }
    if (description !== undefined) {
      setClauses.push(`description = $${idx++}`);
      values.push(description);
    }
    if (head_user_id !== undefined) {
      setClauses.push(`head_user_id = $${idx++}`);
      values.push(head_user_id);
    }

    if (setClauses.length === 0) return this.findById(id);

    setClauses.push('updated_at = NOW()');
    values.push(id);

    const sql = `
      UPDATE departments
      SET ${setClauses.join(', ')}
      WHERE id = $${idx} AND deleted_at IS NULL
      RETURNING *;
    `;
    const res = await query(sql, values);
    return res.rows[0] || null;
  },

  async setHead(id, head_user_id) {
    const sql = `
      UPDATE departments
      SET head_user_id = $1, updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *;
    `;
    const res = await query(sql, [head_user_id, id]);
    return res.rows[0] || null;
  },

  async softDelete(id) {
    const sql = `
      UPDATE departments
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id;
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  async findPaginated({ organization_id = null, search = '', limit = 10, offset = 0 }) {
    let whereClauses = ['d.deleted_at IS NULL'];
    let values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`d.organization_id = $${idx++}`);
      values.push(organization_id);
    }

    if (search) {
      whereClauses.push(`(d.name ILIKE $${idx} OR d.code ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const sql = `
      SELECT 
        d.*,
        u.first_name AS head_first_name,
        u.last_name AS head_last_name,
        u.email AS head_email,
        (SELECT COUNT(u_sub.id) FROM users u_sub WHERE u_sub.department_id = d.id AND u_sub.deleted_at IS NULL) AS total_staff
      FROM departments d
      LEFT JOIN users u ON u.id = d.head_user_id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY d.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++};
    `;

    values.push(limit, offset);
    const res = await query(sql, values);
    return res.rows;
  },

  async count({ organization_id = null, search = '' }) {
    let whereClauses = ['d.deleted_at IS NULL'];
    let values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`d.organization_id = $${idx++}`);
      values.push(organization_id);
    }

    if (search) {
      whereClauses.push(`(d.name ILIKE $${idx} OR d.code ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const sql = `
      SELECT COUNT(d.id) AS count
      FROM departments d
      WHERE ${whereClauses.join(' AND ')};
    `;

    const res = await query(sql, values);
    return parseInt(res.rows[0].count, 10);
  },

  async getStaff(departmentId) {
    const sql = `
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.avatar_url, u.status,
        r.name AS role_name
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.department_id = $1 AND u.deleted_at IS NULL
      ORDER BY r.name, u.first_name;
    `;
    const res = await query(sql, [departmentId]);
    return res.rows;
  },
};

module.exports = DepartmentModel;
