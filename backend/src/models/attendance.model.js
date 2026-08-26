const { query } = require('../config/db');

const AttendanceModel = {
  async findByInternAndDate(internId, date) {
    const res = await query('SELECT * FROM attendance WHERE intern_id = $1 AND date = $2', [internId, date]);
    return res.rows[0] || null;
  },
};

module.exports = AttendanceModel;
