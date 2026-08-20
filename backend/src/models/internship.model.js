const { query } = require('../config/db');

const InternshipModel = {
  async findById(id) {
    const res = await query('SELECT * FROM internships WHERE id = $1', [id]);
    return res.rows[0] || null;
  },
};

module.exports = InternshipModel;
