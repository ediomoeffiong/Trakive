const { query } = require('../config/db');

const ApplicationModel = {
  async findById(id) {
    const sql = `
      SELECT 
        ia.*,
        i.title AS internship_title, i.department_id, i.organization_id,
        u.first_name AS applicant_first_name, u.last_name AS applicant_last_name, u.email AS applicant_email, u.phone AS applicant_phone,
        rev.first_name AS reviewer_first_name, rev.last_name AS reviewer_last_name
      FROM internship_applications ia
      JOIN internships i ON i.id = ia.internship_id
      JOIN users u ON u.id = ia.applicant_id
      LEFT JOIN users rev ON rev.id = ia.reviewed_by
      WHERE ia.id = $1;
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  async findByApplicantAndInternship(applicantId, internshipId) {
    const sql = `SELECT * FROM internship_applications WHERE applicant_id = $1 AND internship_id = $2;`;
    const res = await query(sql, [applicantId, internshipId]);
    return res.rows[0] || null;
  },

  async create({ internship_id, applicant_id, status = 'applied', onboarding_data = {} }) {
    const sql = `
      INSERT INTO internship_applications (internship_id, applicant_id, status, onboarding_data)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const res = await query(sql, [internship_id, applicant_id, status, JSON.stringify(onboarding_data || {})]);
    return res.rows[0];
  },

  async updateStatus(id, { status, reviewed_by = null, onboarding_step = null, onboarding_data = null }) {
    const setClauses = ['status = $1'];
    const values = [status];
    let idx = 2;

    if (reviewed_by) {
      setClauses.push(`reviewed_by = $${idx++}`, `reviewed_at = NOW()`);
      values.push(reviewed_by);
    }

    if (onboarding_step !== null && onboarding_step !== undefined) {
      setClauses.push(`onboarding_step = $${idx++}`);
      values.push(onboarding_step);
    }

    if (onboarding_data !== null && onboarding_data !== undefined) {
      setClauses.push(`onboarding_data = $${idx++}`);
      values.push(JSON.stringify(onboarding_data));
    }

    setClauses.push('updated_at = NOW()');
    values.push(id);

    const sql = `
      UPDATE internship_applications
      SET ${setClauses.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;

    const res = await query(sql, values);
    return res.rows[0] || null;
  },

  async findPaginated({ organization_id = null, department_id = null, applicant_id = null, status = '', search = '', limit = 10, offset = 0 }) {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`i.organization_id = $${idx++}`);
      values.push(organization_id);
    }

    if (department_id) {
      whereClauses.push(`i.department_id = $${idx++}`);
      values.push(department_id);
    }

    if (applicant_id) {
      whereClauses.push(`ia.applicant_id = $${idx++}`);
      values.push(applicant_id);
    }

    if (status) {
      whereClauses.push(`ia.status = $${idx++}`);
      values.push(status);
    }

    if (search) {
      whereClauses.push(`(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR u.email ILIKE $${idx} OR i.title ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT 
        ia.*,
        i.title AS internship_title, i.department_id, i.organization_id,
        u.first_name AS applicant_first_name, u.last_name AS applicant_last_name, u.email AS applicant_email,
        d.name AS department_name
      FROM internship_applications ia
      JOIN internships i ON i.id = ia.internship_id
      JOIN users u ON u.id = ia.applicant_id
      LEFT JOIN departments d ON d.id = i.department_id
      ${whereStr}
      ORDER BY ia.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++};
    `;

    values.push(limit, offset);
    const res = await query(sql, values);
    return res.rows;
  },

  async count({ organization_id = null, department_id = null, applicant_id = null, status = '', search = '' }) {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`i.organization_id = $${idx++}`);
      values.push(organization_id);
    }

    if (department_id) {
      whereClauses.push(`i.department_id = $${idx++}`);
      values.push(department_id);
    }

    if (applicant_id) {
      whereClauses.push(`ia.applicant_id = $${idx++}`);
      values.push(applicant_id);
    }

    if (status) {
      whereClauses.push(`ia.status = $${idx++}`);
      values.push(status);
    }

    if (search) {
      whereClauses.push(`(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR u.email ILIKE $${idx} OR i.title ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT COUNT(ia.id) AS count
      FROM internship_applications ia
      JOIN internships i ON i.id = ia.internship_id
      JOIN users u ON u.id = ia.applicant_id
      ${whereStr};
    `;

    const res = await query(sql, values);
    return parseInt(res.rows[0].count, 10);
  },
};

module.exports = ApplicationModel;
