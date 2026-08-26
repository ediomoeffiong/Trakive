const { query } = require('../config/db');
const { resolveScope, buildInternIdSubquery } = require('./analytics.service');

const ReportService = {
  /**
   * 1. Intern Performance Report
   */
  async getInternPerformanceReport(user, queryParams = {}) {
    const scope = await resolveScope(user, queryParams);
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 10;
    const offset = (page - 1) * limit;

    const subquery = buildInternIdSubquery(scope, 1);
    let values = [...subquery.values];
    let idx = values.length + 1;

    let searchClause = '';
    if (queryParams.search) {
      searchClause = ` AND (u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR u.email ILIKE $${idx})`;
      values.push(`%${queryParams.search}%`);
      idx++;
    }

    const countSql = `
      SELECT COUNT(u.id)::int AS count
      FROM users u
      WHERE u.id IN (${subquery.sql}) ${searchClause};
    `;
    const countRes = await query(countSql, values);
    const totalItems = countRes.rows[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    const dataSql = `
      SELECT
        u.id AS intern_id,
        u.first_name,
        u.last_name,
        u.email,
        d.name AS department_name,
        sup_u.first_name AS supervisor_first_name,
        sup_u.last_name AS supervisor_last_name,
        ip.status AS intern_status,
        
        COUNT(DISTINCT t.id)::int AS total_tasks,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed')::int AS completed_tasks,
        
        COUNT(DISTINCT a.id)::int AS total_attendance,
        COUNT(DISTINCT a.id) FILTER (WHERE a.status IN ('present', 'late'))::int AS attended_days,
        
        ROUND(AVG(tr.rating)::numeric, 2) AS avg_rating
      FROM users u
      LEFT JOIN departments d ON d.id = u.department_id
      LEFT JOIN intern_profiles ip ON ip.user_id = u.id
      LEFT JOIN supervisor_profiles sp ON sp.id = ip.supervisor_id
      LEFT JOIN users sup_u ON sup_u.id = sp.user_id
      LEFT JOIN tasks t ON t.assignee_id = u.id AND t.deleted_at IS NULL
      LEFT JOIN attendance a ON a.intern_id = u.id
      LEFT JOIN task_reviews tr ON tr.task_id = t.id
      WHERE u.id IN (${subquery.sql}) ${searchClause}
      GROUP BY u.id, u.first_name, u.last_name, u.email, d.name, sup_u.first_name, sup_u.last_name, ip.status
      ORDER BY u.first_name ASC
      LIMIT $${idx} OFFSET $${idx + 1};
    `;

    values.push(limit, offset);
    const dataRes = await query(dataSql, values);

    const items = dataRes.rows.map((row) => {
      const taskCompletionRate = row.total_tasks > 0
        ? Number(((row.completed_tasks / row.total_tasks) * 100).toFixed(2))
        : 0;
      const attendanceRate = row.total_attendance > 0
        ? Number(((row.attended_days / row.total_attendance) * 100).toFixed(2))
        : 0;
      const avgRating = row.avg_rating ? Number(row.avg_rating) : null;
      const ratingScore = avgRating ? avgRating * 20 : taskCompletionRate;
      const overallScore = Number(((taskCompletionRate * 0.4) + (ratingScore * 0.3) + (attendanceRate * 0.3)).toFixed(2));

      return {
        intern_id: row.intern_id,
        intern_name: `${row.first_name} ${row.last_name}`,
        email: row.email,
        department_name: row.department_name,
        supervisor_name: row.supervisor_first_name ? `${row.supervisor_first_name} ${row.supervisor_last_name}` : null,
        status: row.intern_status || 'active',
        total_tasks: row.total_tasks,
        completed_tasks: row.completed_tasks,
        task_completion_rate: taskCompletionRate,
        attendance_rate: attendanceRate,
        average_rating: avgRating,
        overall_score: overallScore,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  },

  /**
   * 2. Task Performance Report
   */
  async getTaskPerformanceReport(user, queryParams = {}) {
    const scope = await resolveScope(user, queryParams);
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 10;
    const offset = (page - 1) * limit;

    const subquery = buildInternIdSubquery(scope, 1);
    let values = [...subquery.values];
    let idx = values.length + 1;

    let whereClauses = [`t.deleted_at IS NULL`, `t.assignee_id IN (${subquery.sql})` ];

    if (scope.startDate) {
      whereClauses.push(`t.created_at >= $${idx}`);
      values.push(scope.startDate);
      idx++;
    }
    if (scope.endDate) {
      whereClauses.push(`t.created_at <= $${idx}`);
      values.push(scope.endDate);
      idx++;
    }
    if (scope.status) {
      whereClauses.push(`t.status = $${idx}`);
      values.push(scope.status);
      idx++;
    }
    if (scope.priority) {
      whereClauses.push(`t.priority = $${idx}`);
      values.push(scope.priority);
      idx++;
    }
    if (queryParams.search) {
      whereClauses.push(`(t.title ILIKE $${idx} OR t.description ILIKE $${idx})`);
      values.push(`%${queryParams.search}%`);
      idx++;
    }

    const countSql = `
      SELECT COUNT(t.id)::int AS count
      FROM tasks t
      WHERE ${whereClauses.join(' AND ')};
    `;
    const countRes = await query(countSql, values);
    const totalItems = countRes.rows[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    const dataSql = `
      SELECT
        t.id AS task_id,
        t.title,
        t.priority,
        t.status,
        t.due_date,
        t.created_at,
        t.updated_at,
        d.name AS department_name,
        u_assignee.first_name AS assignee_first_name,
        u_assignee.last_name AS assignee_last_name,
        u_creator.first_name AS creator_first_name,
        u_creator.last_name AS creator_last_name,
        ROUND(AVG(tr.rating)::numeric, 2) AS average_rating,
        CASE 
          WHEN t.status = 'completed' THEN ROUND((EXTRACT(EPOCH FROM (t.updated_at - t.created_at)) / 3600)::numeric, 2)
          ELSE NULL 
        END AS completion_hours
      FROM tasks t
      LEFT JOIN departments d ON d.id = t.department_id
      LEFT JOIN users u_assignee ON u_assignee.id = t.assignee_id
      LEFT JOIN users u_creator ON u_creator.id = t.creator_id
      LEFT JOIN task_reviews tr ON tr.task_id = t.id
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY t.id, t.title, t.priority, t.status, t.due_date, t.created_at, t.updated_at, d.name, u_assignee.first_name, u_assignee.last_name, u_creator.first_name, u_creator.last_name
      ORDER BY t.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1};
    `;

    values.push(limit, offset);
    const dataRes = await query(dataSql, values);

    const items = dataRes.rows.map((r) => ({
      task_id: r.task_id,
      title: r.title,
      department_name: r.department_name,
      assignee_name: `${r.assignee_first_name} ${r.assignee_last_name}`,
      creator_name: r.creator_first_name ? `${r.creator_first_name} ${r.creator_last_name}` : null,
      priority: r.priority,
      status: r.status,
      due_date: r.due_date,
      created_at: r.created_at,
      completion_hours: r.completion_hours ? Number(r.completion_hours) : null,
      average_rating: r.average_rating ? Number(r.average_rating) : null,
    }));

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  },

  /**
   * 3. Attendance Report
   */
  async getAttendanceReport(user, queryParams = {}) {
    const scope = await resolveScope(user, queryParams);
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 10;
    const offset = (page - 1) * limit;

    const subquery = buildInternIdSubquery(scope, 1);
    let values = [...subquery.values];
    let idx = values.length + 1;

    let whereClauses = [`a.intern_id IN (${subquery.sql})` ];

    if (scope.startDate) {
      whereClauses.push(`a.date >= $${idx}`);
      values.push(scope.startDate);
      idx++;
    }
    if (scope.endDate) {
      whereClauses.push(`a.date <= $${idx}`);
      values.push(scope.endDate);
      idx++;
    }
    if (scope.status) {
      whereClauses.push(`a.status = $${idx}`);
      values.push(scope.status);
      idx++;
    }

    const countSql = `
      SELECT COUNT(a.id)::int AS count
      FROM attendance a
      WHERE ${whereClauses.join(' AND ')};
    `;
    const countRes = await query(countSql, values);
    const totalItems = countRes.rows[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    const dataSql = `
      SELECT
        a.id AS attendance_id,
        a.date,
        a.check_in,
        a.check_out,
        a.status,
        a.notes,
        u.first_name AS intern_first_name,
        u.last_name AS intern_last_name,
        u.email AS intern_email,
        d.name AS department_name,
        v.first_name AS verifier_first_name,
        v.last_name AS verifier_last_name,
        CASE 
          WHEN a.check_in IS NOT NULL AND a.check_out IS NOT NULL THEN
            ROUND((EXTRACT(EPOCH FROM (a.check_out - a.check_in)) / 3600)::numeric, 2)
          ELSE NULL
        END AS duration_hours
      FROM attendance a
      JOIN users u ON u.id = a.intern_id
      LEFT JOIN departments d ON d.id = u.department_id
      LEFT JOIN users v ON v.id = a.verified_by
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY a.date DESC, u.first_name ASC
      LIMIT $${idx} OFFSET $${idx + 1};
    `;

    values.push(limit, offset);
    const dataRes = await query(dataSql, values);

    const items = dataRes.rows.map((r) => ({
      attendance_id: r.attendance_id,
      intern_name: `${r.intern_first_name} ${r.intern_last_name}`,
      intern_email: r.intern_email,
      department_name: r.department_name,
      date: r.date,
      check_in: r.check_in,
      check_out: r.check_out,
      status: r.status,
      duration_hours: r.duration_hours ? Number(r.duration_hours) : null,
      notes: r.notes,
      verified_by: r.verifier_first_name ? `${r.verifier_first_name} ${r.verifier_last_name}` : null,
    }));

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  },

  /**
   * 4. Leave Report
   */
  async getLeaveReport(user, queryParams = {}) {
    const scope = await resolveScope(user, queryParams);
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 10;
    const offset = (page - 1) * limit;

    const subquery = buildInternIdSubquery(scope, 1);
    let values = [...subquery.values];
    let idx = values.length + 1;

    let whereClauses = [`lr.intern_id IN (${subquery.sql})` ];

    if (scope.startDate) {
      whereClauses.push(`lr.start_date >= $${idx}`);
      values.push(scope.startDate);
      idx++;
    }
    if (scope.endDate) {
      whereClauses.push(`lr.end_date <= $${idx}`);
      values.push(scope.endDate);
      idx++;
    }
    if (scope.status) {
      whereClauses.push(`lr.status = $${idx}`);
      values.push(scope.status);
      idx++;
    }

    const countSql = `
      SELECT COUNT(lr.id)::int AS count
      FROM leave_requests lr
      WHERE ${whereClauses.join(' AND ')};
    `;
    const countRes = await query(countSql, values);
    const totalItems = countRes.rows[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    const dataSql = `
      SELECT
        lr.id AS leave_id,
        lr.leave_type,
        lr.start_date,
        lr.end_date,
        (lr.end_date - lr.start_date + 1) AS duration_days,
        lr.reason,
        lr.status,
        lr.reviewer_comment,
        lr.reviewed_at,
        u.first_name AS intern_first_name,
        u.last_name AS intern_last_name,
        u.email AS intern_email,
        d.name AS department_name,
        rev.first_name AS reviewer_first_name,
        rev.last_name AS reviewer_last_name
      FROM leave_requests lr
      JOIN users u ON u.id = lr.intern_id
      LEFT JOIN departments d ON d.id = u.department_id
      LEFT JOIN users rev ON rev.id = lr.reviewer_id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY lr.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1};
    `;

    values.push(limit, offset);
    const dataRes = await query(dataSql, values);

    const items = dataRes.rows.map((r) => ({
      leave_id: r.leave_id,
      intern_name: `${r.intern_first_name} ${r.intern_last_name}`,
      intern_email: r.intern_email,
      department_name: r.department_name,
      leave_type: r.leave_type,
      start_date: r.start_date,
      end_date: r.end_date,
      duration_days: Number(r.duration_days),
      reason: r.reason,
      status: r.status,
      reviewer_name: r.reviewer_first_name ? `${r.reviewer_first_name} ${r.reviewer_last_name}` : null,
      reviewer_comment: r.reviewer_comment,
      reviewed_at: r.reviewed_at,
    }));

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  },

  /**
   * 5. Department Performance Report
   */
  async getDepartmentPerformanceReport(user, queryParams = {}) {
    const scope = await resolveScope(user, queryParams);
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClauses = ['d.deleted_at IS NULL'];
    let values = [];
    let idx = 1;

    if (scope.orgId) {
      whereClauses.push(`d.organization_id = $${idx}`);
      values.push(scope.orgId);
      idx++;
    }
    if (scope.departmentId) {
      whereClauses.push(`d.id = $${idx}`);
      values.push(scope.departmentId);
      idx++;
    }

    const countSql = `
      SELECT COUNT(d.id)::int AS count
      FROM departments d
      WHERE ${whereClauses.join(' AND ')};
    `;
    const countRes = await query(countSql, values);
    const totalItems = countRes.rows[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    const dataSql = `
      SELECT
        d.id AS department_id,
        d.name AS department_name,
        d.code AS department_code,
        head_u.first_name AS head_first_name,
        head_u.last_name AS head_last_name,
        
        COUNT(DISTINCT u.id) FILTER (WHERE r.name = 'intern')::int AS total_interns,
        COUNT(DISTINCT u.id) FILTER (WHERE r.name = 'intern' AND u.status = 'active')::int AS active_interns,
        
        COUNT(DISTINCT t.id)::int AS total_tasks,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed')::int AS completed_tasks,
        
        COUNT(DISTINCT a.id)::int AS total_attendance,
        COUNT(DISTINCT a.id) FILTER (WHERE a.status IN ('present', 'late'))::int AS attended_days
      FROM departments d
      LEFT JOIN users head_u ON head_u.id = d.head_user_id
      LEFT JOIN users u ON u.department_id = d.id AND u.deleted_at IS NULL
      LEFT JOIN roles r ON r.id = u.role_id
      LEFT JOIN tasks t ON t.department_id = d.id AND t.deleted_at IS NULL
      LEFT JOIN attendance a ON a.intern_id = u.id
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY d.id, d.name, d.code, head_u.first_name, head_u.last_name
      ORDER BY d.name ASC
      LIMIT $${idx} OFFSET $${idx + 1};
    `;

    values.push(limit, offset);
    const dataRes = await query(dataSql, values);

    const items = dataRes.rows.map((r) => {
      const completionRate = r.total_tasks > 0
        ? Number(((r.completed_tasks / r.total_tasks) * 100).toFixed(2))
        : 0;
      const attendanceRate = r.total_attendance > 0
        ? Number(((r.attended_days / r.total_attendance) * 100).toFixed(2))
        : 0;

      return {
        department_id: r.department_id,
        department_name: r.department_name,
        department_code: r.department_code,
        head_name: r.head_first_name ? `${r.head_first_name} ${r.head_last_name}` : null,
        total_interns: r.total_interns,
        active_interns: r.active_interns,
        total_tasks: r.total_tasks,
        completed_tasks: r.completed_tasks,
        task_completion_rate: completionRate,
        attendance_rate: attendanceRate,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  },

  /**
   * 6. Internship Progress Report
   */
  async getInternshipProgressReport(user, queryParams = {}) {
    const scope = await resolveScope(user, queryParams);
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 10;
    const offset = (page - 1) * limit;

    const subquery = buildInternIdSubquery(scope, 1);
    let values = [...subquery.values];
    let idx = values.length + 1;

    let searchClause = '';
    if (queryParams.search) {
      searchClause = ` AND (u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR u.email ILIKE $${idx})`;
      values.push(`%${queryParams.search}%`);
      idx++;
    }

    const countSql = `
      SELECT COUNT(u.id)::int AS count
      FROM users u
      WHERE u.id IN (${subquery.sql}) ${searchClause};
    `;
    const countRes = await query(countSql, values);
    const totalItems = countRes.rows[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    const dataSql = `
      SELECT
        u.id AS intern_id,
        u.first_name,
        u.last_name,
        u.email,
        d.name AS department_name,
        sup_u.first_name AS supervisor_first_name,
        sup_u.last_name AS supervisor_last_name,
        ip.status AS intern_status,
        i.title AS internship_title,
        i.start_date,
        i.end_date,
        COUNT(t.id)::int AS total_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'completed')::int AS completed_tasks
      FROM users u
      LEFT JOIN departments d ON d.id = u.department_id
      LEFT JOIN intern_profiles ip ON ip.user_id = u.id
      LEFT JOIN supervisor_profiles sp ON sp.id = ip.supervisor_id
      LEFT JOIN users sup_u ON sup_u.id = sp.user_id
      LEFT JOIN internships i ON i.id = (
        SELECT ia.internship_id 
        FROM internship_applications ia 
        WHERE ia.applicant_id = u.id 
        ORDER BY ia.created_at DESC LIMIT 1
      )
      LEFT JOIN tasks t ON t.assignee_id = u.id AND t.deleted_at IS NULL
      WHERE u.id IN (${subquery.sql}) ${searchClause}
      GROUP BY u.id, u.first_name, u.last_name, u.email, d.name, sup_u.first_name, sup_u.last_name, ip.status, i.title, i.start_date, i.end_date
      ORDER BY u.first_name ASC
      LIMIT $${idx} OFFSET $${idx + 1};
    `;

    values.push(limit, offset);
    const dataRes = await query(dataSql, values);

    const items = dataRes.rows.map((r) => {
      let timelinePct = 0;
      let daysElapsed = 0;
      let totalDays = 0;

      if (r.start_date && r.end_date) {
        const start = new Date(r.start_date).getTime();
        const end = new Date(r.end_date).getTime();
        const now = Date.now();
        totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        daysElapsed = Math.max(0, Math.min(totalDays, Math.ceil((now - start) / (1000 * 60 * 60 * 24))));
        timelinePct = Number(((daysElapsed / totalDays) * 100).toFixed(2));
      }

      const taskCompletionPct = r.total_tasks > 0
        ? Number(((r.completed_tasks / r.total_tasks) * 100).toFixed(2))
        : 0;

      return {
        intern_id: r.intern_id,
        intern_name: `${r.first_name} ${r.last_name}`,
        email: r.email,
        department_name: r.department_name,
        supervisor_name: r.supervisor_first_name ? `${r.supervisor_first_name} ${r.supervisor_last_name}` : null,
        internship_title: r.internship_title || 'General Internship',
        start_date: r.start_date,
        end_date: r.end_date,
        days_elapsed: daysElapsed,
        total_days: totalDays,
        timeline_progress_percentage: timelinePct,
        task_completion_percentage: taskCompletionPct,
        status: r.intern_status || 'active',
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  },
};

module.exports = ReportService;
