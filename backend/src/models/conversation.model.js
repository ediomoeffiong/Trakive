const { query } = require('../config/db');

const ConversationModel = {
  async findById(id) {
    const res = await query('SELECT * FROM conversations WHERE id = $1', [id]);
    return res.rows[0] || null;
  },
};

module.exports = ConversationModel;
