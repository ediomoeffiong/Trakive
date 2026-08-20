const { query } = require('../config/db');

const OrganizationModel = {
  async findById(id) {
    const res = await query('SELECT * FROM organizations WHERE id = $1 AND deleted_at IS NULL', [id]);
    return res.rows[0] || null;
  },

  async findBySlug(slug) {
    const res = await query('SELECT * FROM organizations WHERE slug = $1 AND deleted_at IS NULL', [slug]);
    return res.rows[0] || null;
  },

  async create({ name, slug, domain, logoUrl, settings }) {
    const res = await query(
      `INSERT INTO organizations (name, slug, domain, logo_url, settings)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, slug, domain, logoUrl, JSON.stringify(settings || {})]
    );
    return res.rows[0];
  },
};

module.exports = OrganizationModel;
