const { query } = require('../config/db');

const OnboardingModel = {
  async createDocument({
    organization_id,
    uploader_id,
    owner_id,
    title,
    file_name,
    file_path,
    file_size,
    mime_type,
    category = 'general',
    is_private = false,
  }) {
    const sql = `
      INSERT INTO documents (organization_id, uploader_id, owner_id, title, file_name, file_path, file_size, mime_type, category, is_private)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const res = await query(sql, [
      organization_id,
      uploader_id,
      owner_id,
      title,
      file_name,
      file_path,
      file_size,
      mime_type,
      category,
      is_private,
    ]);
    return res.rows[0];
  },

  async findDocumentsByOwner(ownerId, category = null) {
    let sql = `SELECT * FROM documents WHERE owner_id = $1 AND deleted_at IS NULL`;
    const params = [ownerId];

    if (category) {
      sql += ` AND category = $2`;
      params.push(category);
    }

    sql += ` ORDER BY created_at DESC;`;

    const res = await query(sql, params);
    return res.rows;
  },
};

module.exports = OnboardingModel;
