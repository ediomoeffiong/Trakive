const { query } = require('../config/db');

const RoleModel = {
  async findByName(name) {
    const res = await query('SELECT * FROM roles WHERE name = $1', [name]);
    return res.rows[0] || null;
  },

  async getRolePermissions(roleId) {
    const res = await query(
      `SELECT p.* FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       WHERE rp.role_id = $1`,
      [roleId]
    );
    return res.rows;
  },
};

module.exports = RoleModel;
