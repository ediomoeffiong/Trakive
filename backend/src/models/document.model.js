const { query } = require('../config/db');

const DocumentModel = {
  async findById(id) {
    const res = await query('SELECT * FROM documents WHERE id = $1 AND deleted_at IS NULL', [id]);
    return res.rows[0] || null;
  },

  async findPaginated({
    organization_id = null,
    requesting_user_id = null,
    is_admin_or_hr = false,
    search = '',
    category = '',
    owner_id = null,
    uploader_id = null,
    is_private = null,
    start_date = null,
    end_date = null,
    limit = 10,
    offset = 0,
    sort = 'created_at:desc',
  }) {
    let whereClauses = ['d.deleted_at IS NULL'];
    let values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`d.organization_id = $${idx}`);
      values.push(organization_id);
      idx++;
    }

    if (!is_admin_or_hr && requesting_user_id) {
      whereClauses.push(`(d.is_private = false OR d.uploader_id = $${idx} OR d.owner_id = $${idx})`);
      values.push(requesting_user_id);
      idx++;
    }

    if (search) {
      whereClauses.push(`(d.title ILIKE $${idx} OR d.file_name ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (category) {
      whereClauses.push(`d.category = $${idx}`);
      values.push(category);
      idx++;
    }

    if (owner_id) {
      whereClauses.push(`d.owner_id = $${idx}`);
      values.push(owner_id);
      idx++;
    }

    if (uploader_id) {
      whereClauses.push(`d.uploader_id = $${idx}`);
      values.push(uploader_id);
      idx++;
    }

    if (is_private !== null && is_private !== undefined && is_private !== '') {
      whereClauses.push(`d.is_private = $${idx}`);
      values.push(is_private === 'true' || is_private === true);
      idx++;
    }

    if (start_date) {
      whereClauses.push(`d.created_at >= $${idx}`);
      values.push(start_date);
      idx++;
    }

    if (end_date) {
      whereClauses.push(`d.created_at <= $${idx}`);
      values.push(end_date);
      idx++;
    }

    let orderBy = 'd.created_at DESC';
    if (sort) {
      const [col, dir] = sort.split(':');
      const allowedCols = ['created_at', 'title', 'category', 'file_size'];
      const orderDir = dir && dir.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      if (allowedCols.includes(col)) {
        orderBy = `d.${col} ${orderDir}`;
      }
    }

    const sql = `
      SELECT 
        d.id, d.organization_id, d.uploader_id, d.owner_id, d.title, d.file_name,
        d.file_path, d.file_size, d.mime_type, d.category, d.is_private, d.created_at, d.updated_at,
        u.first_name AS uploader_first_name, u.last_name AS uploader_last_name
      FROM documents d
      JOIN users u ON u.id = d.uploader_id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT $${idx} OFFSET $${idx + 1};
    `;

    values.push(limit, offset);
    const res = await query(sql, values);
    return res.rows;
  },

  async count({
    organization_id = null,
    requesting_user_id = null,
    is_admin_or_hr = false,
    search = '',
    category = '',
    owner_id = null,
    uploader_id = null,
    is_private = null,
    start_date = null,
    end_date = null,
  }) {
    let whereClauses = ['d.deleted_at IS NULL'];
    let values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`d.organization_id = $${idx}`);
      values.push(organization_id);
      idx++;
    }

    if (!is_admin_or_hr && requesting_user_id) {
      whereClauses.push(`(d.is_private = false OR d.uploader_id = $${idx} OR d.owner_id = $${idx})`);
      values.push(requesting_user_id);
      idx++;
    }

    if (search) {
      whereClauses.push(`(d.title ILIKE $${idx} OR d.file_name ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (category) {
      whereClauses.push(`d.category = $${idx}`);
      values.push(category);
      idx++;
    }

    if (owner_id) {
      whereClauses.push(`d.owner_id = $${idx}`);
      values.push(owner_id);
      idx++;
    }

    if (uploader_id) {
      whereClauses.push(`d.uploader_id = $${idx}`);
      values.push(uploader_id);
      idx++;
    }

    if (is_private !== null && is_private !== undefined && is_private !== '') {
      whereClauses.push(`d.is_private = $${idx}`);
      values.push(is_private === 'true' || is_private === true);
      idx++;
    }

    if (start_date) {
      whereClauses.push(`d.created_at >= $${idx}`);
      values.push(start_date);
      idx++;
    }

    if (end_date) {
      whereClauses.push(`d.created_at <= $${idx}`);
      values.push(end_date);
      idx++;
    }

    const sql = `
      SELECT COUNT(d.id) as count
      FROM documents d
      WHERE ${whereClauses.join(' AND ')};
    `;

    const res = await query(sql, values);
    return parseInt(res.rows[0].count, 10);
  },

  async softDelete(id, userId) {
    const sql = `
      UPDATE documents
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *;
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },
};

module.exports = DocumentModel;
