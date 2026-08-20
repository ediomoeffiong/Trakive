const { query } = require('../config/db');

const PermissionModel = {
  async findAll() {
    const res = await query('SELECT * FROM permissions ORDER BY module, name');
    return res.rows;
  },
};

module.exports = PermissionModel;
