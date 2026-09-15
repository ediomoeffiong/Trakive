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

  async findDocumentByOwnerAndCategory(ownerId, category) {
    const sql = `SELECT * FROM documents WHERE owner_id = $1 AND category = $2 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1;`;
    const res = await query(sql, [ownerId, category]);
    return res.rows[0] || null;
  },

  async addDocumentHistory({
    document_id,
    file_name,
    file_path,
    file_size,
    mime_type,
    review_status,
    reviewed_by = null,
    reviewed_at = null,
    review_notes = null,
  }) {
    const sql = `
      INSERT INTO document_history (document_id, file_name, file_path, file_size, mime_type, review_status, reviewed_by, reviewed_at, review_notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const res = await query(sql, [
      document_id,
      file_name,
      file_path,
      file_size,
      mime_type,
      review_status,
      reviewed_by,
      reviewed_at,
      review_notes,
    ]);
    return res.rows[0];
  },

  async getDocumentHistory(documentId) {
    const sql = `
      SELECT dh.*, u.first_name AS reviewer_first_name, u.last_name AS reviewer_last_name
      FROM document_history dh
      LEFT JOIN users u ON u.id = dh.reviewed_by
      WHERE dh.document_id = $1
      ORDER BY dh.created_at DESC;
    `;
    const res = await query(sql, [documentId]);
    return res.rows;
  },

  async replaceDocumentFile(id, { file_name, file_path, file_size, mime_type, title }) {
    const sql = `
      UPDATE documents
      SET file_name = $1,
          file_path = $2,
          file_size = $3,
          mime_type = $4,
          title = COALESCE($5, title),
          review_status = 'pending',
          reviewed_at = NULL,
          reviewer_id = NULL,
          review_notes = NULL,
          updated_at = NOW()
      WHERE id = $6
      RETURNING *;
    `;
    const res = await query(sql, [file_name, file_path, file_size, mime_type, title, id]);
    return res.rows[0];
  },

  async reviewDocument(id, { review_status, reviewer_id, review_notes }) {
    const sql = `
      UPDATE documents
      SET review_status = $1,
          reviewer_id = $2,
          review_notes = $3,
          reviewed_at = NOW(),
          updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `;
    const res = await query(sql, [review_status, reviewer_id, review_notes, id]);
    return res.rows[0];
  },
};

module.exports = OnboardingModel;
