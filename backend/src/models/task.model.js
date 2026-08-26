const { query } = require('../config/db');

const TaskModel = {
  async findById(id) {
    const sql = `
      SELECT 
        t.id, t.organization_id, t.department_id, t.internship_id,
        t.creator_id, t.assignee_id, t.title, t.description,
        t.priority, t.status, t.due_date, t.created_at, t.updated_at, t.deleted_at,
        c.first_name AS creator_first_name, c.last_name AS creator_last_name, c.email AS creator_email,
        a.first_name AS assignee_first_name, a.last_name AS assignee_last_name, a.email AS assignee_email,
        d.name AS department_name
      FROM tasks t
      JOIN users c ON c.id = t.creator_id
      JOIN users a ON a.id = t.assignee_id
      LEFT JOIN departments d ON d.id = t.department_id
      WHERE t.id = $1 AND t.deleted_at IS NULL;
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  async create({
    organization_id,
    department_id = null,
    internship_id = null,
    creator_id,
    assignee_id,
    title,
    description = null,
    priority = 'medium',
    status = 'assigned',
    due_date = null,
  }) {
    const sql = `
      INSERT INTO tasks (
        organization_id, department_id, internship_id, creator_id, assignee_id,
        title, description, priority, status, due_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      organization_id,
      department_id,
      internship_id,
      creator_id,
      assignee_id,
      title,
      description,
      priority,
      status,
      due_date,
    ];
    const res = await query(sql, values);
    return res.rows[0];
  },

  async update(id, updates = {}) {
    const allowedFields = [
      'title',
      'description',
      'assignee_id',
      'priority',
      'status',
      'due_date',
      'department_id',
      'internship_id',
    ];
    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
      UPDATE tasks
      SET ${setClauses.join(', ')}
      WHERE id = $${idx} AND deleted_at IS NULL
      RETURNING *;
    `;
    const res = await query(sql, values);
    return res.rows[0] || null;
  },

  async updateStatus(id, status) {
    const sql = `
      UPDATE tasks
      SET status = $1, updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *;
    `;
    const res = await query(sql, [status, id]);
    return res.rows[0] || null;
  },

  async softDelete(id) {
    const sql = `
      UPDATE tasks
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id, deleted_at;
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  async findPaginated({
    organization_id = null,
    creator_id = null,
    assignee_id = null,
    assignee_ids = [],
    department_id = null,
    status = '',
    priority = '',
    search = '',
    limit = 10,
    offset = 0,
    sort_by = 'created_at',
    order = 'DESC',
  }) {
    const whereClauses = ['t.deleted_at IS NULL'];
    const values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`t.organization_id = $${idx}`);
      values.push(organization_id);
      idx++;
    }

    if (creator_id) {
      whereClauses.push(`t.creator_id = $${idx}`);
      values.push(creator_id);
      idx++;
    }

    if (assignee_id) {
      whereClauses.push(`t.assignee_id = $${idx}`);
      values.push(assignee_id);
      idx++;
    } else if (Array.isArray(assignee_ids) && assignee_ids.length > 0) {
      whereClauses.push(`t.assignee_id = ANY($${idx})`);
      values.push(assignee_ids);
      idx++;
    }

    if (department_id) {
      whereClauses.push(`t.department_id = $${idx}`);
      values.push(department_id);
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

    if (search) {
      whereClauses.push(`(t.title ILIKE $${idx} OR t.description ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const safeSortBy = ['created_at', 'due_date', 'updated_at', 'priority', 'status', 'title'].includes(sort_by)
      ? sort_by
      : 'created_at';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const sql = `
      SELECT 
        t.id, t.organization_id, t.department_id, t.internship_id,
        t.creator_id, t.assignee_id, t.title, t.description,
        t.priority, t.status, t.due_date, t.created_at, t.updated_at,
        c.first_name AS creator_first_name, c.last_name AS creator_last_name,
        a.first_name AS assignee_first_name, a.last_name AS assignee_last_name,
        d.name AS department_name
      FROM tasks t
      JOIN users c ON c.id = t.creator_id
      JOIN users a ON a.id = t.assignee_id
      LEFT JOIN departments d ON d.id = t.department_id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY t.${safeSortBy} ${safeOrder}
      LIMIT $${idx} OFFSET $${idx + 1};
    `;

    values.push(limit, offset);
    const res = await query(sql, values);
    return res.rows;
  },

  async count({
    organization_id = null,
    creator_id = null,
    assignee_id = null,
    assignee_ids = [],
    department_id = null,
    status = '',
    priority = '',
    search = '',
  }) {
    const whereClauses = ['t.deleted_at IS NULL'];
    const values = [];
    let idx = 1;

    if (organization_id) {
      whereClauses.push(`t.organization_id = $${idx}`);
      values.push(organization_id);
      idx++;
    }

    if (creator_id) {
      whereClauses.push(`t.creator_id = $${idx}`);
      values.push(creator_id);
      idx++;
    }

    if (assignee_id) {
      whereClauses.push(`t.assignee_id = $${idx}`);
      values.push(assignee_id);
      idx++;
    } else if (Array.isArray(assignee_ids) && assignee_ids.length > 0) {
      whereClauses.push(`t.assignee_id = ANY($${idx})`);
      values.push(assignee_ids);
      idx++;
    }

    if (department_id) {
      whereClauses.push(`t.department_id = $${idx}`);
      values.push(department_id);
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

    if (search) {
      whereClauses.push(`(t.title ILIKE $${idx} OR t.description ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const sql = `
      SELECT COUNT(t.id) AS count
      FROM tasks t
      WHERE ${whereClauses.join(' AND ')};
    `;

    const res = await query(sql, values);
    return parseInt(res.rows[0].count, 10);
  },

  // SUBMISSIONS
  async createSubmission({ task_id, intern_id, submission_text = null, attachments = [], version = 1, status = 'pending_review' }) {
    const sql = `
      INSERT INTO task_submissions (task_id, intern_id, submission_text, attachments, version, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [task_id, intern_id, submission_text, JSON.stringify(attachments), version, status];
    const res = await query(sql, values);
    return res.rows[0];
  },

  async getLatestSubmission(task_id) {
    const sql = `
      SELECT *
      FROM task_submissions
      WHERE task_id = $1
      ORDER BY version DESC
      LIMIT 1;
    `;
    const res = await query(sql, [task_id]);
    return res.rows[0] || null;
  },

  async getSubmissionsByTaskId(task_id) {
    const sql = `
      SELECT 
        ts.*,
        u.first_name AS intern_first_name, u.last_name AS intern_last_name, u.email AS intern_email
      FROM task_submissions ts
      JOIN users u ON u.id = ts.intern_id
      WHERE ts.task_id = $1
      ORDER BY ts.version DESC;
    `;
    const res = await query(sql, [task_id]);
    return res.rows;
  },

  async updateSubmissionStatus(submission_id, status) {
    const sql = `
      UPDATE task_submissions
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;
    const res = await query(sql, [status, submission_id]);
    return res.rows[0] || null;
  },

  // REVIEWS
  async createReview({ task_id, submission_id = null, reviewer_id, rating = null, feedback = null, status }) {
    const sql = `
      INSERT INTO task_reviews (task_id, submission_id, reviewer_id, rating, feedback, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [task_id, submission_id, reviewer_id, rating, feedback, status];
    const res = await query(sql, values);
    return res.rows[0];
  },

  async getReviewsByTaskId(task_id) {
    const sql = `
      SELECT 
        tr.*,
        u.first_name AS reviewer_first_name, u.last_name AS reviewer_last_name, u.email AS reviewer_email
      FROM task_reviews tr
      JOIN users u ON u.id = tr.reviewer_id
      WHERE tr.task_id = $1
      ORDER BY tr.created_at DESC;
    `;
    const res = await query(sql, [task_id]);
    return res.rows;
  },

  // COMMENTS
  async createComment({ task_id, user_id, content }) {
    const sql = `
      INSERT INTO task_comments (task_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const res = await query(sql, [task_id, user_id, content]);
    return res.rows[0];
  },

  async getCommentsByTaskId(task_id) {
    const sql = `
      SELECT 
        tc.*,
        u.first_name AS user_first_name, u.last_name AS user_last_name, u.email AS user_email, u.avatar_url
      FROM task_comments tc
      JOIN users u ON u.id = tc.user_id
      WHERE tc.task_id = $1
      ORDER BY tc.created_at ASC;
    `;
    const res = await query(sql, [task_id]);
    return res.rows;
  },

  // ACTIVITIES
  async createActivity({ task_id, actor_id, action, details = {} }) {
    const sql = `
      INSERT INTO task_activities (task_id, actor_id, action, details)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const res = await query(sql, [task_id, actor_id, action, JSON.stringify(details)]);
    return res.rows[0];
  },

  async getActivitiesByTaskId(task_id) {
    const sql = `
      SELECT 
        ta.*,
        u.first_name AS actor_first_name, u.last_name AS actor_last_name, u.email AS actor_email
      FROM task_activities ta
      JOIN users u ON u.id = ta.actor_id
      WHERE ta.task_id = $1
      ORDER BY ta.created_at ASC;
    `;
    const res = await query(sql, [task_id]);
    return res.rows;
  },
};

module.exports = TaskModel;
