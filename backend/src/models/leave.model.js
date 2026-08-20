const { query } = require('../config/db');

const LeaveModel = {
  async findById(id) {
    const res = await query('SELECT * FROM leave_requests WHERE id = $1', [id]);
    return res.rows[0] || null;
  },
};

module.exports = LeaveModel;
