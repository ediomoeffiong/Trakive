const { query } = require('../config/db');

const TaskModel = {
  async findById(id) {
    const sql = `
      SELECT t.*,
        p.title AS project_title,
        pm_mile.title AS milestone_title,
        c.first_name AS creator_first_name, c.last_name AS creator_last_name,
        a.first_name AS assignee_first_name, a.last_name AS assignee_last_name,
        d.name AS department_name
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN project_milestones pm_mile ON pm_mile.id = t.milestone_id
      LEFT JOIN users c ON c.id = t.creator_id
      LEFT JOIN users a ON a.id = t.assignee_id
      LEFT JOIN departments d ON d.id = t.department_id
      WHERE t.id = $1 AND t.deleted_at IS NULL;
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  async create({
    organization_id, department_id = null, internship_id = null,
    creator_id, assignee_id, title, description = null,
    priority = 'medium', status = 'todo', due_date = null,
    project_id = null, milestone_id = null,
    task_source = 'supervisor_assigned', week_start = null, weekly_note = null,
  }) {
    const sql = `
      INSERT INTO tasks (
        organization_id, department_id, internship_id, creator_id, assignee_id,
        title, description, priority, status, due_date,
        project_id, milestone_id, task_source, week_start, weekly_note
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *;
    `;
    const res = await query(sql, [
      organization_id, department_id, internship_id, creator_id, assignee_id,
      title, description, priority, status, due_date,
      project_id, milestone_id, task_source, week_start, weekly_note,
    ]);
    return res.rows[0];
  },

  async update(id, updates = {}) {
    const allowedFields = [
      'title', 'description', 'priority', 'status', 'due_date',
      'project_id', 'milestone_id', 'task_source', 'week_start', 'weekly_note', 'end_of_week_status',
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
    const sql = `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *;`;
    const res = await query(sql, values);
    return res.rows[0] || null;
  },

  async softDelete(id) {
    const res = await query(
      `UPDATE tasks SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [id]
    );
    return res.rows[0] || null;
  },

  async updateStatus(id, status) {
    const res = await query(
      `UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL RETURNING *`,
      [status, id]
    );
    return res.rows[0] || null;
  },

  async updateWeeklyStatus(id, { end_of_week_status, weekly_note }) {
    const res = await query(
      `UPDATE tasks SET end_of_week_status = $1, weekly_note = $2, updated_at = NOW()
       WHERE id = $3 AND deleted_at IS NULL RETURNING *`,
      [end_of_week_status ?? null, weekly_note ?? null, id]
    );
    return res.rows[0] || null;
  },

  async findByProjectId(project_id) {
    const sql = `
      SELECT t.*, pm_mile.title AS milestone_title,
        a.first_name AS assignee_first_name, a.last_name AS assignee_last_name, a.avatar_url AS assignee_avatar
      FROM tasks t
      LEFT JOIN project_milestones pm_mile ON pm_mile.id = t.milestone_id
      LEFT JOIN users a ON a.id = t.assignee_id
      WHERE t.project_id = $1 AND t.deleted_at IS NULL
      ORDER BY t.due_date ASC NULLS LAST, t.created_at ASC;
    `;
    const res = await query(sql, [project_id]);
    return res.rows;
  },

  async findByWeek(intern_id, week_start) {
    const sql = `
      SELECT t.*, p.title AS project_title, pm_mile.title AS milestone_title,
        c.first_name AS creator_first_name, c.last_name AS creator_last_name
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN project_milestones pm_mile ON pm_mile.id = t.milestone_id
      LEFT JOIN users c ON c.id = t.creator_id
      WHERE t.assignee_id = $1 AND t.week_start = $2 AND t.deleted_at IS NULL
      ORDER BY t.due_date ASC NULLS LAST, t.created_at ASC;
    `;
    const res = await query(sql, [intern_id, week_start]);
    return res.rows;
  },

  async findPaginated({
    organization_id = null,
    search = '',
    status = '',
    priority = '',
    department_id = null,
    supervisor_id = null,
    intern_id = null,
    start_date = null,
    end_date = null,
    project_id = null,
    milestone_id = null,
    week_start = null,
    limit = 10,
    offset = 0,
    sort = 'created_at:desc',
  }) {
    let whereClauses = ['t.deleted_at IS NULL'];
    let values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`t.organization_id = $${idx}`);
      values.push(organization_id);
      idx++;
    }

    if (search) {
      whereClauses.push(`(t.title ILIKE $${idx} OR t.description ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (status) {
      whereClauses.push(`t.status = $${idx}`);
      values.push(status);
      idx++;
    }

    if (priority) {
      whereClauses.push(`t.priority = $${idx}`);
      values.push(priority);
      idx++;
    }

    if (department_id) {
      whereClauses.push(`t.department_id = $${idx}`);
      values.push(department_id);
      idx++;
    }

    if (supervisor_id) {
      whereClauses.push(`t.creator_id = $${idx}`);
      values.push(supervisor_id);
      idx++;
    }

    if (intern_id) {
      whereClauses.push(`t.assignee_id = $${idx}`);
      values.push(intern_id);
      idx++;
    }

    if (start_date) {
      whereClauses.push(`t.due_date >= $${idx}`);
      values.push(start_date);
      idx++;
    }

    if (end_date) {
      whereClauses.push(`t.due_date <= $${idx}`);
      values.push(end_date);
      idx++;
    }

    if (project_id) {
      whereClauses.push(`t.project_id = $${idx}`);
      values.push(project_id);
      idx++;
    }

    if (milestone_id) {
      whereClauses.push(`t.milestone_id = $${idx}`);
      values.push(milestone_id);
      idx++;
    }

    if (week_start) {
      whereClauses.push(`t.week_start = $${idx}`);
      values.push(week_start);
      idx++;
    }

    let orderBy = 't.created_at DESC';
    if (sort) {
      const [col, dir] = sort.split(':');
      const allowedCols = ['created_at', 'due_date', 'priority', 'status', 'title'];
      const orderDir = dir && dir.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      if (allowedCols.includes(col)) {
        orderBy = `t.${col} ${orderDir}`;
      }
    }

    const sql = `
      SELECT 
        t.id, t.organization_id, t.department_id, t.creator_id, t.assignee_id,
        t.title, t.description, t.priority, t.status, t.due_date, t.created_at, t.updated_at,
        c.first_name AS creator_first_name, c.last_name AS creator_last_name,
        a.first_name AS assignee_first_name, a.last_name AS assignee_last_name,
        d.name AS department_name
      FROM tasks t
      LEFT JOIN users c ON c.id = t.creator_id
      LEFT JOIN users a ON a.id = t.assignee_id
      LEFT JOIN departments d ON d.id = t.department_id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT $${idx} OFFSET $${idx + 1};
    `;

    values.push(limit, offset);
    const res = await query(sql, values);
    return res.rows;
  },

  async count({
    organization_id = null,
    search = '',
    status = '',
    priority = '',
    department_id = null,
    supervisor_id = null,
    intern_id = null,
    start_date = null,
    end_date = null,
  }) {
    let whereClauses = ['t.deleted_at IS NULL'];
    let values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`t.organization_id = $${idx}`);
      values.push(organization_id);
      idx++;
    }

    if (search) {
      whereClauses.push(`(t.title ILIKE $${idx} OR t.description ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (status) {
      whereClauses.push(`t.status = $${idx}`);
      values.push(status);
      idx++;
    }

    if (priority) {
      whereClauses.push(`t.priority = $${idx}`);
      values.push(priority);
      idx++;
    }

    if (department_id) {
      whereClauses.push(`t.department_id = $${idx}`);
      values.push(department_id);
      idx++;
    }

    if (supervisor_id) {
      whereClauses.push(`t.creator_id = $${idx}`);
      values.push(supervisor_id);
      idx++;
    }

    if (intern_id) {
      whereClauses.push(`t.assignee_id = $${idx}`);
      values.push(intern_id);
      idx++;
    }

    if (start_date) {
      whereClauses.push(`t.due_date >= $${idx}`);
      values.push(start_date);
      idx++;
    }

    if (end_date) {
      whereClauses.push(`t.due_date <= $${idx}`);
      values.push(end_date);
      idx++;
    }

    const sql = `
      SELECT COUNT(t.id) as count
      FROM tasks t
      WHERE ${whereClauses.join(' AND ')};
    `;

    const res = await query(sql, values);
    return parseInt(res.rows[0].count, 10);
  },

  async findApproachingDeadline(hoursWindow = 24) {
    const sql = `
      SELECT t.*, u.email as assignee_email
      FROM tasks t
      JOIN users u ON u.id = t.assignee_id
      WHERE t.deleted_at IS NULL
        AND t.status NOT IN ('completed')
        AND t.due_date IS NOT NULL
        AND t.due_date > NOW()
        AND t.due_date <= (NOW() + ($1 || ' hours')::INTERVAL);
    `;
    const res = await query(sql, [hoursWindow]);
    return res.rows;
  },

  async findOverdue() {
    const sql = `
      SELECT t.*, u.email as assignee_email
      FROM tasks t
      JOIN users u ON u.id = t.assignee_id
      WHERE t.deleted_at IS NULL
        AND t.status NOT IN ('completed')
        AND t.due_date IS NOT NULL
        AND t.due_date < NOW();
    `;
    const res = await query(sql);
    return res.rows;
  },
};

module.exports = TaskModel;
