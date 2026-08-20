const { query } = require('../config/db');

const UserModel = {
  sanitizeUser(user) {
    if (!user) return null;
    const { password_hash, ...sanitized } = user;
    return sanitized;
  },

  async findById(id) {
    const res = await query(
      'SELECT id, organization_id, department_id, role_id, email, first_name, last_name, phone, avatar_url, status, is_email_verified, email_verified_at, last_login_at, created_at, updated_at FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return res.rows[0] || null;
  },

  async findByIdWithRoleAndPermissions(id) {
    const sql = `
      SELECT 
        u.id, u.organization_id, u.department_id, u.role_id, u.email,
        u.first_name, u.last_name, u.phone, u.avatar_url, u.status,
        u.is_email_verified, u.email_verified_at, u.last_login_at,
        u.created_at, u.updated_at,
        r.name AS role_name, r.description AS role_description,
        COALESCE(
          json_agg(p.name) FILTER (WHERE p.name IS NOT NULL),
          '[]'::json
        ) AS permissions
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions p ON p.id = rp.permission_id
      WHERE u.id = $1 AND u.deleted_at IS NULL
      GROUP BY u.id, r.id;
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  async findByEmail(email) {
    const res = await query(
      'SELECT id, organization_id, department_id, role_id, email, first_name, last_name, phone, avatar_url, status, is_email_verified, email_verified_at, last_login_at, created_at, updated_at FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email.toLowerCase()]
    );
    return res.rows[0] || null;
  },

  async findByEmailWithPassword(email) {
    const sql = `
      SELECT 
        u.*,
        r.name AS role_name
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE LOWER(u.email) = $1 AND u.deleted_at IS NULL;
    `;
    const res = await query(sql, [email.toLowerCase()]);
    return res.rows[0] || null;
  },

  async create({
    organization_id = null,
    department_id = null,
    role_id,
    email,
    password_hash,
    first_name,
    last_name,
    phone = null,
    avatar_url = null,
    status = 'active',
    is_email_verified = false,
  }) {
    const sql = `
      INSERT INTO users (
        organization_id, department_id, role_id, email, password_hash,
        first_name, last_name, phone, avatar_url, status, is_email_verified
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, organization_id, department_id, role_id, email, first_name, last_name, phone, avatar_url, status, is_email_verified, email_verified_at, created_at, updated_at;
    `;
    const values = [
      organization_id,
      department_id,
      role_id,
      email.toLowerCase(),
      password_hash,
      first_name,
      last_name,
      phone,
      avatar_url,
      status,
      is_email_verified,
    ];
    const res = await query(sql, values);
    return res.rows[0];
  },

  async update(id, updates = {}) {
    const allowedFields = ['first_name', 'last_name', 'phone', 'department_id'];
    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
      UPDATE users
      SET ${setClauses.join(', ')}
      WHERE id = $${idx} AND deleted_at IS NULL
      RETURNING id, organization_id, department_id, role_id, email, first_name, last_name, phone, avatar_url, status, is_email_verified, email_verified_at, updated_at;
    `;
    const res = await query(sql, values);
    return res.rows[0] || null;
  },

  async updateAvatar(id, avatar_url) {
    const res = await query(
      'UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL RETURNING id, avatar_url, updated_at',
      [avatar_url, id]
    );
    return res.rows[0] || null;
  },

  async updateStatus(id, status) {
    const res = await query(
      'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL RETURNING id, status, updated_at',
      [status, id]
    );
    return res.rows[0] || null;
  },

  async updatePassword(id, passwordHash) {
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, id]
    );
  },

  async updateLastLogin(id) {
    await query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [id]
    );
  },

  async setEmailVerified(id) {
    await query(
      'UPDATE users SET is_email_verified = true, email_verified_at = NOW(), updated_at = NOW() WHERE id = $1',
      [id]
    );
  },

  async findPaginated({ organization_id = null, search = '', role = '', department_id = null, status = '', limit = 10, offset = 0 }) {
    let whereClauses = ['u.deleted_at IS NULL'];
    let values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`u.organization_id = $${idx}`);
      values.push(organization_id);
      idx++;
    }

    if (search) {
      whereClauses.push(`(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR u.email ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (role) {
      whereClauses.push(`r.name = $${idx}`);
      values.push(role.toLowerCase());
      idx++;
    }

    if (department_id) {
      whereClauses.push(`u.department_id = $${idx}`);
      values.push(department_id);
      idx++;
    }

    if (status) {
      whereClauses.push(`u.status = $${idx}`);
      values.push(status);
      idx++;
    }

    const sql = `
      SELECT 
        u.id, u.organization_id, u.department_id, u.role_id, u.email,
        u.first_name, u.last_name, u.phone, u.avatar_url, u.status,
        u.is_email_verified, u.created_at, u.updated_at,
        r.name AS role_name,
        d.name AS department_name
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN departments d ON d.id = u.department_id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY u.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1};
    `;

    values.push(limit, offset);
    const res = await query(sql, values);
    return res.rows;
  },

  async count({ organization_id = null, search = '', role = '', department_id = null, status = '' }) {
    let whereClauses = ['u.deleted_at IS NULL'];
    let values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`u.organization_id = $${idx}`);
      values.push(organization_id);
      idx++;
    }

    if (search) {
      whereClauses.push(`(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR u.email ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (role) {
      whereClauses.push(`r.name = $${idx}`);
      values.push(role.toLowerCase());
      idx++;
    }

    if (department_id) {
      whereClauses.push(`u.department_id = $${idx}`);
      values.push(department_id);
      idx++;
    }

    if (status) {
      whereClauses.push(`u.status = $${idx}`);
      values.push(status);
      idx++;
    }

    const sql = `
      SELECT COUNT(u.id) as count
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE ${whereClauses.join(' AND ')};
    `;

    const res = await query(sql, values);
    return parseInt(res.rows[0].count, 10);
  },
};

module.exports = UserModel;
