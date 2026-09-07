const { query } = require('../config/db');

const ProjectModel = {
  /**
   * Find a project by ID with full joins
   */
  async findById(id) {
    const sql = `
      SELECT
        p.*,
        u.first_name AS creator_first_name, u.last_name AS creator_last_name,
        u.email AS creator_email,
        sup_u.id AS supervisor_user_id,
        sup_u.first_name AS supervisor_first_name,
        sup_u.last_name AS supervisor_last_name,
        sup_u.email AS supervisor_email,
        d.name AS department_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'intern_id', pm.intern_id,
              'role', pm.role,
              'joined_at', pm.joined_at,
              'first_name', iu.first_name,
              'last_name', iu.last_name,
              'email', iu.email,
              'avatar_url', iu.avatar_url
            )
          ) FILTER (WHERE pm.intern_id IS NOT NULL),
          '[]'::json
        ) AS members
      FROM projects p
      LEFT JOIN users u ON u.id = p.creator_id
      LEFT JOIN supervisor_profiles sp ON sp.id = p.supervisor_id
      LEFT JOIN users sup_u ON sup_u.id = sp.user_id
      LEFT JOIN departments d ON d.id = p.department_id
      LEFT JOIN project_members pm ON pm.project_id = p.id
      LEFT JOIN users iu ON iu.id = pm.intern_id
      WHERE p.id = $1 AND p.deleted_at IS NULL
      GROUP BY p.id, u.id, sup_u.id, d.id;
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  /**
   * Paginated project listing with filters
   */
  async findPaginated({
    organization_id = null,
    search = '',
    status = '',
    priority = '',
    supervisor_id = null,
    intern_id = null,
    department_id = null,
    source = '',
    limit = 20,
    offset = 0,
    sort = 'created_at:desc',
  }) {
    let whereClauses = ['p.deleted_at IS NULL'];
    let values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`p.organization_id = $${idx++}`);
      values.push(organization_id);
    }
    if (search) {
      whereClauses.push(`(p.title ILIKE $${idx} OR p.description ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }
    if (status) {
      whereClauses.push(`p.status = $${idx++}`);
      values.push(status);
    }
    if (priority) {
      whereClauses.push(`p.priority = $${idx++}`);
      values.push(priority);
    }
    if (supervisor_id) {
      whereClauses.push(`p.supervisor_id = $${idx++}`);
      values.push(supervisor_id);
    }
    if (intern_id) {
      whereClauses.push(`EXISTS (SELECT 1 FROM project_members pm2 WHERE pm2.project_id = p.id AND pm2.intern_id = $${idx++})`);
      values.push(intern_id);
    }
    if (department_id) {
      whereClauses.push(`p.department_id = $${idx++}`);
      values.push(department_id);
    }
    if (source) {
      whereClauses.push(`p.source = $${idx++}`);
      values.push(source);
    }

    let orderBy = 'p.created_at DESC';
    if (sort) {
      const [col, dir] = sort.split(':');
      const allowedCols = ['created_at', 'due_date', 'priority', 'status', 'title', 'progress'];
      const orderDir = dir && dir.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      if (allowedCols.includes(col)) {
        orderBy = `p.${col} ${orderDir}`;
      }
    }

    const sql = `
      SELECT
        p.*,
        u.first_name AS creator_first_name, u.last_name AS creator_last_name,
        sup_u.first_name AS supervisor_first_name, sup_u.last_name AS supervisor_last_name,
        d.name AS department_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'intern_id', pm.intern_id,
              'first_name', iu.first_name,
              'last_name', iu.last_name,
              'avatar_url', iu.avatar_url
            )
          ) FILTER (WHERE pm.intern_id IS NOT NULL),
          '[]'::json
        ) AS members
      FROM projects p
      LEFT JOIN users u ON u.id = p.creator_id
      LEFT JOIN supervisor_profiles sp ON sp.id = p.supervisor_id
      LEFT JOIN users sup_u ON sup_u.id = sp.user_id
      LEFT JOIN departments d ON d.id = p.department_id
      LEFT JOIN project_members pm ON pm.project_id = p.id
      LEFT JOIN users iu ON iu.id = pm.intern_id
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY p.id, u.id, sup_u.id, d.id
      ORDER BY ${orderBy}
      LIMIT $${idx} OFFSET $${idx + 1};
    `;
    values.push(limit, offset);
    const res = await query(sql, values);
    return res.rows;
  },

  /**
   * Count matching projects
   */
  async count({
    organization_id = null,
    search = '',
    status = '',
    priority = '',
    supervisor_id = null,
    intern_id = null,
    department_id = null,
    source = '',
  }) {
    let whereClauses = ['p.deleted_at IS NULL'];
    let values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`p.organization_id = $${idx++}`);
      values.push(organization_id);
    }
    if (search) {
      whereClauses.push(`(p.title ILIKE $${idx} OR p.description ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }
    if (status) {
      whereClauses.push(`p.status = $${idx++}`);
      values.push(status);
    }
    if (priority) {
      whereClauses.push(`p.priority = $${idx++}`);
      values.push(priority);
    }
    if (supervisor_id) {
      whereClauses.push(`p.supervisor_id = $${idx++}`);
      values.push(supervisor_id);
    }
    if (intern_id) {
      whereClauses.push(`EXISTS (SELECT 1 FROM project_members pm2 WHERE pm2.project_id = p.id AND pm2.intern_id = $${idx++})`);
      values.push(intern_id);
    }
    if (department_id) {
      whereClauses.push(`p.department_id = $${idx++}`);
      values.push(department_id);
    }
    if (source) {
      whereClauses.push(`p.source = $${idx++}`);
      values.push(source);
    }

    const sql = `
      SELECT COUNT(DISTINCT p.id) AS count
      FROM projects p
      WHERE ${whereClauses.join(' AND ')};
    `;
    const res = await query(sql, values);
    return parseInt(res.rows[0].count, 10);
  },

  /**
   * Create a new project
   */
  async create({
    organization_id,
    department_id = null,
    title,
    description = null,
    creator_id,
    supervisor_id = null,
    source = 'supervisor_assigned',
    status = 'draft',
    priority = 'medium',
    start_date = null,
    due_date = null,
    proposed_objectives = null,
    expected_outcome = null,
    notes = null,
  }) {
    const sql = `
      INSERT INTO projects (
        organization_id, department_id, title, description, creator_id,
        supervisor_id, source, status, priority, start_date, due_date,
        proposed_objectives, expected_outcome, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `;
    const values = [
      organization_id, department_id, title, description, creator_id,
      supervisor_id, source, status, priority, start_date, due_date,
      proposed_objectives, expected_outcome, notes,
    ];
    const res = await query(sql, values);
    return res.rows[0];
  },

  /**
   * Update a project
   */
  async update(id, updates = {}) {
    const allowedFields = [
      'title', 'description', 'status', 'priority', 'start_date', 'due_date',
      'proposed_objectives', 'expected_outcome', 'notes', 'supervisor_id',
      'department_id', 'rejection_reason', 'supervisor_feedback', 'progress',
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
      UPDATE projects
      SET ${setClauses.join(', ')}
      WHERE id = $${idx} AND deleted_at IS NULL
      RETURNING *;
    `;
    const res = await query(sql, values);
    return res.rows[0] || null;
  },

  /**
   * Soft-delete a project
   */
  async softDelete(id) {
    const res = await query(
      `UPDATE projects SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [id]
    );
    return res.rows[0] || null;
  },

  /**
   * Add a member to a project
   */
  async addMember(project_id, intern_id, role = 'member') {
    const sql = `
      INSERT INTO project_members (project_id, intern_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (project_id, intern_id) DO UPDATE SET role = EXCLUDED.role
      RETURNING *;
    `;
    const res = await query(sql, [project_id, intern_id, role]);
    return res.rows[0];
  },

  /**
   * Remove a member from a project
   */
  async removeMember(project_id, intern_id) {
    await query(
      `DELETE FROM project_members WHERE project_id = $1 AND intern_id = $2`,
      [project_id, intern_id]
    );
  },

  /**
   * Get all members of a project with user data
   */
  async getMembers(project_id) {
    const sql = `
      SELECT pm.*, u.first_name, u.last_name, u.email, u.avatar_url
      FROM project_members pm
      JOIN users u ON u.id = pm.intern_id
      WHERE pm.project_id = $1
      ORDER BY pm.joined_at ASC;
    `;
    const res = await query(sql, [project_id]);
    return res.rows;
  },

  /**
   * Add an entry to project approval history
   */
  async addApprovalHistory(project_id, action, actor_id, feedback = null) {
    const sql = `
      INSERT INTO project_approval_history (project_id, action, actor_id, feedback)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const res = await query(sql, [project_id, action, actor_id, feedback]);
    return res.rows[0];
  },

  /**
   * Get full approval history for a project
   */
  async getApprovalHistory(project_id) {
    const sql = `
      SELECT pah.*, u.first_name AS actor_first_name, u.last_name AS actor_last_name, u.email AS actor_email
      FROM project_approval_history pah
      JOIN users u ON u.id = pah.actor_id
      WHERE pah.project_id = $1
      ORDER BY pah.created_at ASC;
    `;
    const res = await query(sql, [project_id]);
    return res.rows;
  },

  /**
   * Find projects by intern member ID
   */
  async findByInternId(intern_id, status = null) {
    let whereClauses = ['pm.intern_id = $1', 'p.deleted_at IS NULL'];
    const values = [intern_id];
    let idx = 2;

    if (status) {
      whereClauses.push(`p.status = $${idx++}`);
      values.push(status);
    }

    const sql = `
      SELECT p.*,
        sup_u.first_name AS supervisor_first_name, sup_u.last_name AS supervisor_last_name,
        d.name AS department_name
      FROM projects p
      JOIN project_members pm ON pm.project_id = p.id
      LEFT JOIN supervisor_profiles sp ON sp.id = p.supervisor_id
      LEFT JOIN users sup_u ON sup_u.id = sp.user_id
      LEFT JOIN departments d ON d.id = p.department_id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY p.created_at DESC;
    `;
    const res = await query(sql, values);
    return res.rows;
  },

  /**
   * Find projects supervised by a supervisor profile
   */
  async findBySupervisorProfileId(supervisor_profile_id, status = null) {
    let whereClauses = ['p.supervisor_id = $1', 'p.deleted_at IS NULL'];
    const values = [supervisor_profile_id];
    let idx = 2;

    if (status) {
      whereClauses.push(`p.status = $${idx++}`);
      values.push(status);
    }

    const sql = `
      SELECT p.*,
        u.first_name AS creator_first_name, u.last_name AS creator_last_name,
        d.name AS department_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('intern_id', pm.intern_id, 'first_name', iu.first_name, 'last_name', iu.last_name, 'avatar_url', iu.avatar_url)
          ) FILTER (WHERE pm.intern_id IS NOT NULL),
          '[]'::json
        ) AS members
      FROM projects p
      LEFT JOIN users u ON u.id = p.creator_id
      LEFT JOIN departments d ON d.id = p.department_id
      LEFT JOIN project_members pm ON pm.project_id = p.id
      LEFT JOIN users iu ON iu.id = pm.intern_id
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY p.id, u.id, d.id
      ORDER BY p.created_at DESC;
    `;
    const res = await query(sql, values);
    return res.rows;
  },

  /**
   * Recalculate project progress from task completion
   */
  async recalculateProgress(project_id) {
    const sql = `
      UPDATE projects SET
        progress = (
          SELECT CASE WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND((COUNT(*) FILTER (WHERE status = 'completed')::numeric / COUNT(*)) * 100, 2)
          END
          FROM tasks WHERE project_id = $1 AND deleted_at IS NULL
        ),
        updated_at = NOW()
      WHERE id = $1
      RETURNING progress;
    `;
    const res = await query(sql, [project_id]);
    return res.rows[0]?.progress ?? 0;
  },
};

module.exports = ProjectModel;
