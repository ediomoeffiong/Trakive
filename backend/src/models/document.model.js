const { query } = require('../config/db');

const DocumentModel = {
  async findById(id) {
    const res = await query('SELECT * FROM documents WHERE id = $1 AND deleted_at IS NULL', [id]);
    return res.rows[0] || null;
  },
};

module.exports = DocumentModel;
