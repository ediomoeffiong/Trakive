const { query } = require('../config/db');

const DocumentModel = {
  async create({
    organizationId,
    uploaderId,
    ownerId = null,
    title,
    fileName,
    filePath,
    fileSize,
    mimeType,
    category = 'general',
    isPrivate = false,
    entityType = null,
    entityId = null,
  }) {
    const res = await query(
      `INSERT INTO documents (
        organization_id, uploader_id, owner_id, title, file_name, file_path,
        file_size, mime_type, category, is_private, entity_type, entity_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        organizationId,
        uploaderId,
        ownerId || uploaderId,
        title,
        fileName,
        filePath,
        fileSize,
        mimeType,
        category,
        isPrivate,
        entityType,
        entityId,
      ]
    );
    return res.rows[0];
  },

  async findById(id) {
    const res = await query('SELECT * FROM documents WHERE id = $1 AND deleted_at IS NULL', [id]);
    return res.rows[0] || null;
  },

  async findDocuments({
    organizationId,
    uploaderId = null,
    ownerId = null,
    category = null,
    entityType = null,
    entityId = null,
    search = null,
    limit = 10,
    offset = 0,
  }) {
    let sql = 'SELECT * FROM documents WHERE organization_id = $1 AND deleted_at IS NULL';
    const params = [organizationId];
    let paramIdx = 2;

    if (uploaderId) {
      sql += ` AND uploader_id = $${paramIdx++}`;
      params.push(uploaderId);
    }

    if (ownerId) {
      sql += ` AND owner_id = $${paramIdx++}`;
      params.push(ownerId);
    }

    if (category) {
      sql += ` AND category = $${paramIdx++}`;
      params.push(category);
    }

    if (entityType) {
      sql += ` AND entity_type = $${paramIdx++}`;
      params.push(entityType);
    }

    if (entityId) {
      sql += ` AND entity_id = $${paramIdx++}`;
      params.push(entityId);
    }

    if (search) {
      sql += ` AND (title ILIKE $${paramIdx} OR file_name ILIKE $${paramIdx})`;
      paramIdx++;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    params.push(limit, offset);

    const res = await query(sql, params);
    return res.rows;
  },

  async countDocuments({
    organizationId,
    uploaderId = null,
    ownerId = null,
    category = null,
    entityType = null,
    entityId = null,
    search = null,
  }) {
    let sql = 'SELECT COUNT(*)::int AS count FROM documents WHERE organization_id = $1 AND deleted_at IS NULL';
    const params = [organizationId];
    let paramIdx = 2;

    if (uploaderId) {
      sql += ` AND uploader_id = $${paramIdx++}`;
      params.push(uploaderId);
    }

    if (ownerId) {
      sql += ` AND owner_id = $${paramIdx++}`;
      params.push(ownerId);
    }

    if (category) {
      sql += ` AND category = $${paramIdx++}`;
      params.push(category);
    }

    if (entityType) {
      sql += ` AND entity_type = $${paramIdx++}`;
      params.push(entityType);
    }

    if (entityId) {
      sql += ` AND entity_id = $${paramIdx++}`;
      params.push(entityId);
    }

    if (search) {
      sql += ` AND (title ILIKE $${paramIdx} OR file_name ILIKE $${paramIdx})`;
      paramIdx++;
      params.push(`%${search}%`);
    }

    const res = await query(sql, params);
    return parseInt(res.rows[0].count, 10);
  },

  async update(id, data) {
    const fields = [];
    const params = [];
    let paramIdx = 1;

    const allowed = ['title', 'category', 'is_private', 'owner_id', 'entity_type', 'entity_id'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIdx++}`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    const sql = `UPDATE documents SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIdx} AND deleted_at IS NULL RETURNING *`;
    const res = await query(sql, params);
    return res.rows[0] || null;
  },

  async softDelete(id) {
    const res = await query('UPDATE documents SET deleted_at = NOW() WHERE id = $1 RETURNING *', [id]);
    return res.rows[0] || null;
  },
};

module.exports = DocumentModel;
