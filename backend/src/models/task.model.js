const { query } = require('../config/db');

const TaskModel = {
  async findById(id) {
    const res = await query('SELECT * FROM tasks WHERE id = $1 AND deleted_at IS NULL', [id]);
    return res.rows[0] || null;
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
