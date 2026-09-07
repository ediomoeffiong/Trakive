const { query } = require('../config/db');

const MilestoneModel = {
  /**
   * Find all milestones for a project, with linked task stats
   */
  async findByProjectId(project_id) {
    const sql = `
      SELECT
        pm.*,
        COUNT(t.id) AS total_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'completed') AS completed_tasks
      FROM project_milestones pm
      LEFT JOIN tasks t ON t.milestone_id = pm.id AND t.deleted_at IS NULL
      WHERE pm.project_id = $1
      GROUP BY pm.id
      ORDER BY pm.order_index ASC, pm.created_at ASC;
    `;
    const res = await query(sql, [project_id]);
    return res.rows;
  },

  /**
   * Find a single milestone by ID
   */
  async findById(id) {
    const sql = `
      SELECT
        pm.*,
        COUNT(t.id) AS total_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'completed') AS completed_tasks
      FROM project_milestones pm
      LEFT JOIN tasks t ON t.milestone_id = pm.id AND t.deleted_at IS NULL
      WHERE pm.id = $1
      GROUP BY pm.id;
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  /**
   * Create a milestone
   */
  async create({ project_id, title, description = null, start_date = null, due_date = null, order_index = 0 }) {
    const sql = `
      INSERT INTO project_milestones (project_id, title, description, start_date, due_date, order_index)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const res = await query(sql, [project_id, title, description, start_date, due_date, order_index]);
    return res.rows[0];
  },

  /**
   * Update a milestone
   */
  async update(id, updates = {}) {
    const allowedFields = [
      'title', 'description', 'start_date', 'due_date', 'status',
      'completion_date', 'order_index', 'progress',
    ];
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
      UPDATE project_milestones
      SET ${setClauses.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;
    const res = await query(sql, values);
    return res.rows[0] || null;
  },

  /**
   * Delete a milestone
   */
  async delete(id) {
    const res = await query(
      `DELETE FROM project_milestones WHERE id = $1 RETURNING id`,
      [id]
    );
    return res.rows[0] || null;
  },

  /**
   * Reorder milestones for a project
   * @param {string} project_id
   * @param {string[]} orderedIds - milestone IDs in desired order
   */
  async reorder(project_id, orderedIds) {
    for (let i = 0; i < orderedIds.length; i++) {
      await query(
        `UPDATE project_milestones SET order_index = $1, updated_at = NOW() WHERE id = $2 AND project_id = $3`,
        [i, orderedIds[i], project_id]
      );
    }
  },

  /**
   * Recalculate milestone progress from its linked tasks
   */
  async recalculateProgress(milestone_id) {
    const sql = `
      UPDATE project_milestones SET
        progress = (
          SELECT CASE WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND((COUNT(*) FILTER (WHERE status = 'completed')::numeric / COUNT(*)) * 100, 2)
          END
          FROM tasks WHERE milestone_id = $1 AND deleted_at IS NULL
        ),
        updated_at = NOW()
      WHERE id = $1
      RETURNING progress;
    `;
    const res = await query(sql, [milestone_id]);
    return res.rows[0]?.progress ?? 0;
  },
};

module.exports = MilestoneModel;
