const { query } = require('../config/db');

const WeeklyPlanModel = {
  /**
   * Get or create a weekly plan for an intern
   */
  async findOrCreate({ intern_id, organization_id, week_start, week_end }) {
    // Try to find existing
    const existing = await this.findByInternAndWeek(intern_id, week_start);
    if (existing) return existing;

    // Create new
    const sql = `
      INSERT INTO weekly_plans (intern_id, organization_id, week_start, week_end)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (intern_id, week_start) DO UPDATE SET updated_at = NOW()
      RETURNING *;
    `;
    const res = await query(sql, [intern_id, organization_id, week_start, week_end]);
    return res.rows[0];
  },

  /**
   * Find a weekly plan by ID
   */
  async findById(id) {
    const sql = `
      SELECT wp.*,
        u.first_name AS intern_first_name, u.last_name AS intern_last_name, u.email AS intern_email,
        r.first_name AS reviewer_first_name, r.last_name AS reviewer_last_name
      FROM weekly_plans wp
      JOIN users u ON u.id = wp.intern_id
      LEFT JOIN users r ON r.id = wp.reviewer_id
      WHERE wp.id = $1;
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  /**
   * Find a plan by intern ID and week start date
   */
  async findByInternAndWeek(intern_id, week_start) {
    const sql = `
      SELECT wp.*,
        u.first_name AS intern_first_name, u.last_name AS intern_last_name
      FROM weekly_plans wp
      JOIN users u ON u.id = wp.intern_id
      WHERE wp.intern_id = $1 AND wp.week_start = $2;
    `;
    const res = await query(sql, [intern_id, week_start]);
    return res.rows[0] || null;
  },

  /**
   * Paginated list of plans for an intern
   */
  async findByIntern(intern_id, limit = 12, offset = 0) {
    const sql = `
      SELECT wp.*,
        r.first_name AS reviewer_first_name, r.last_name AS reviewer_last_name
      FROM weekly_plans wp
      LEFT JOIN users r ON r.id = wp.reviewer_id
      WHERE wp.intern_id = $1
      ORDER BY wp.week_start DESC
      LIMIT $2 OFFSET $3;
    `;
    const res = await query(sql, [intern_id, limit, offset]);
    return res.rows;
  },

  /**
   * Find all plans supervised by a given supervisor (via intern_profiles)
   */
  async findBySupervisor({ supervisor_profile_id, week_start = null, intern_id = null, status = null, limit = 50, offset = 0 }) {
    let whereClauses = ['ip.supervisor_id = $1'];
    const values = [supervisor_profile_id];
    let idx = 2;

    if (week_start) {
      whereClauses.push(`wp.week_start = $${idx++}`);
      values.push(week_start);
    }
    if (intern_id) {
      whereClauses.push(`wp.intern_id = $${idx++}`);
      values.push(intern_id);
    }
    if (status) {
      whereClauses.push(`wp.status = $${idx++}`);
      values.push(status);
    }

    const sql = `
      SELECT wp.*,
        u.first_name AS intern_first_name, u.last_name AS intern_last_name,
        u.email AS intern_email, u.avatar_url AS intern_avatar
      FROM weekly_plans wp
      JOIN intern_profiles ip ON ip.user_id = wp.intern_id
      JOIN users u ON u.id = wp.intern_id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY wp.week_start DESC, u.first_name ASC
      LIMIT $${idx} OFFSET $${idx + 1};
    `;
    values.push(limit, offset);
    const res = await query(sql, values);
    return res.rows;
  },

  /**
   * Update a weekly plan
   */
  async update(id, updates = {}) {
    const allowedFields = ['status', 'submitted_at', 'reviewed_at', 'reviewer_id', 'reviewer_feedback'];
    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (setClauses.length === 0) return this.findById(id);

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
      UPDATE weekly_plans
      SET ${setClauses.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;
    const res = await query(sql, values);
    return res.rows[0] || null;
  },

  /**
   * Add a submission history record
   */
  async addHistory(weekly_plan_id, action, actor_id, feedback = null) {
    const sql = `
      INSERT INTO weekly_submission_history (weekly_plan_id, action, actor_id, feedback)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const res = await query(sql, [weekly_plan_id, action, actor_id, feedback]);
    return res.rows[0];
  },

  /**
   * Get submission history for a weekly plan
   */
  async getHistory(weekly_plan_id) {
    const sql = `
      SELECT wsh.*, u.first_name AS actor_first_name, u.last_name AS actor_last_name
      FROM weekly_submission_history wsh
      JOIN users u ON u.id = wsh.actor_id
      WHERE wsh.weekly_plan_id = $1
      ORDER BY wsh.created_at ASC;
    `;
    const res = await query(sql, [weekly_plan_id]);
    return res.rows;
  },

  /**
   * Get all tasks for an intern in a specific week (with project/milestone context)
   */
  async getWeeklyTasks(intern_id, week_start) {
    const sql = `
      SELECT
        t.*,
        p.title AS project_title,
        p.id AS project_id_ref,
        pm_mile.title AS milestone_title,
        c.first_name AS creator_first_name, c.last_name AS creator_last_name
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN project_milestones pm_mile ON pm_mile.id = t.milestone_id
      LEFT JOIN users c ON c.id = t.creator_id
      WHERE t.assignee_id = $1
        AND t.week_start = $2
        AND t.deleted_at IS NULL
      ORDER BY t.due_date ASC NULLS LAST, t.created_at ASC;
    `;
    const res = await query(sql, [intern_id, week_start]);
    return res.rows;
  },

  /**
   * Count plans for supervisor view
   */
  async countBySupervisor({ supervisor_profile_id, week_start = null, intern_id = null, status = null }) {
    let whereClauses = ['ip.supervisor_id = $1'];
    const values = [supervisor_profile_id];
    let idx = 2;

    if (week_start) {
      whereClauses.push(`wp.week_start = $${idx++}`);
      values.push(week_start);
    }
    if (intern_id) {
      whereClauses.push(`wp.intern_id = $${idx++}`);
      values.push(intern_id);
    }
    if (status) {
      whereClauses.push(`wp.status = $${idx++}`);
      values.push(status);
    }

    const sql = `
      SELECT COUNT(wp.id) AS count
      FROM weekly_plans wp
      JOIN intern_profiles ip ON ip.user_id = wp.intern_id
      WHERE ${whereClauses.join(' AND ')};
    `;
    const res = await query(sql, values);
    return parseInt(res.rows[0].count, 10);
  },
};

module.exports = WeeklyPlanModel;
