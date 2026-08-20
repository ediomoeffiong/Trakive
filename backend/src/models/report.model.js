const { query } = require('../config/db');

const ReportModel = {
  async findById(id) {
    const res = await query('SELECT * FROM reports WHERE id = $1', [id]);
    return res.rows[0] || null;
  },
};

module.exports = ReportModel;
