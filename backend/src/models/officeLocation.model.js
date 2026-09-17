const { query } = require('../config/db');

const OfficeLocationModel = {
  async listByOrganization(organizationId, { includeInactive = false } = {}) {
    const sql = `
      SELECT * FROM office_locations
      WHERE organization_id = $1 AND deleted_at IS NULL
      ${includeInactive ? '' : 'AND is_active = TRUE'}
      ORDER BY name ASC
    `;
    const res = await query(sql, [organizationId]);
    return res.rows;
  },

  async findById(id) {
    const res = await query(
      'SELECT * FROM office_locations WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return res.rows[0] || null;
  },

  async create(data) {
    const sql = `
      INSERT INTO office_locations (
        organization_id, name, code, address, latitude, longitude, radius_m, is_active, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `;
    const res = await query(sql, [
      data.organization_id,
      data.name,
      data.code || null,
      data.address || null,
      data.latitude,
      data.longitude,
      data.radius_m || 200,
      data.is_active !== false,
      data.created_by || null,
    ]);
    return res.rows[0];
  },

  async update(id, updates) {
    const allowed = ['name', 'code', 'address', 'latitude', 'longitude', 'radius_m', 'is_active'];
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(updates[key]);
        idx += 1;
      }
    }
    if (!fields.length) return this.findById(id);
    fields.push('updated_at = NOW()');
    values.push(id);
    const res = await query(
      `UPDATE office_locations SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
      values
    );
    return res.rows[0] || null;
  },

  async softDelete(id) {
    const res = await query(
      `UPDATE office_locations SET deleted_at = NOW(), is_active = FALSE, updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
      [id]
    );
    return res.rows[0] || null;
  },
};

module.exports = OfficeLocationModel;
