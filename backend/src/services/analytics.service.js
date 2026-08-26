const { query } = require('../config/db');

/**
 * Resolve data scoping based on user role and filters
 * Ensures strict RBAC:
 * - Intern: own data only
 * - Supervisor: assigned interns only
 * - Head: department data only
 * - HR/Admin: organization-wide data (or filtered by query params)
 */
async function resolveScope(user, filters = {}) {
  const roleName = (user.role_name || '').toLowerCase();
  const orgId = user.organization_id;

  let effectiveInternId = null;
  let effectiveSupervisorProfileId = null;
  let effectiveDepartmentId = null;

  if (roleName === 'intern') {
    effectiveInternId = user.id;
  } else if (roleName === 'supervisor') {
    const supRes = await query('SELECT id FROM supervisor_profiles WHERE user_id = $1', [user.id]);
    if (supRes.rows.length > 0) {
      effectiveSupervisorProfileId = supRes.rows[0].id;
    } else {
      effectiveSupervisorProfileId = '00000000-0000-0000-0000-000000000000';
    }
  } else if (roleName === 'head' || roleName === 'department_head') {
    effectiveDepartmentId = user.department_id || filters.departmentId || null;
  } else {
    // HR / Admin
    if (filters.departmentId) effectiveDepartmentId = filters.departmentId;
    if (filters.supervisorId) {
      const supRes = await query('SELECT id FROM supervisor_profiles WHERE id = $1 OR user_id = $1', [filters.supervisorId]);
      if (supRes.rows.length > 0) {
        effectiveSupervisorProfileId = supRes.rows[0].id;
      } else {
        effectiveSupervisorProfileId = filters.supervisorId;
      }
    }
    if (filters.internId) effectiveInternId = filters.internId;
  }

  return {
    orgId,
    roleName,
    internId: effectiveInternId,
    supervisorProfileId: effectiveSupervisorProfileId,
    departmentId: effectiveDepartmentId,
    startDate: filters.startDate || null,
    endDate: filters.endDate || null,
    status: filters.status || null,
    priority: filters.priority || null,
  };
}

/**
 * Build SQL subquery for intern IDs matching scope
 */
function buildInternIdSubquery(scope, paramIdxStart = 1) {
  let whereClauses = ['u.deleted_at IS NULL'];
  let values = [];
  let idx = paramIdxStart;

  if (scope.orgId) {
    whereClauses.push(`u.organization_id = $${idx}`);
    values.push(scope.orgId);
    idx++;
  }

  if (scope.internId) {
    whereClauses.push(`u.id = $${idx}`);
    values.push(scope.internId);
    idx++;
  }

  if (scope.departmentId) {
    whereClauses.push(`u.department_id = $${idx}`);
    values.push(scope.departmentId);
    idx++;
  }

  if (scope.supervisorProfileId) {
    whereClauses.push(`EXISTS (SELECT 1 FROM intern_profiles ip WHERE ip.user_id = u.id AND ip.supervisor_id = $${idx})`);
    values.push(scope.supervisorProfileId);
    idx++;
  }

  const sql = `SELECT u.id FROM users u WHERE ${whereClauses.join(' AND ')}`;
  return { sql, values, nextIdx: idx };
}

const AnalyticsService = {
  /**
   * 1. Role-based Dashboard Metrics
   */
  async getDashboardMetrics(user, filters = {}) {
    const scope = await resolveScope(user, filters);
    const role = scope.roleName;

    if (role === 'intern') {
      // Intern metrics
      const taskSql = `
        SELECT
          COUNT(1)::int AS total_assigned,
          COUNT(1) FILTER (WHERE status = 'completed')::int AS completed,
          COUNT(1) FILTER (WHERE status IN ('todo', 'in_progress', 'submitted', 'in_review', 'revision_requested'))::int AS pending_in_progress,
          COUNT(1) FILTER (WHERE due_date < NOW() AND status != 'completed')::int AS overdue
        FROM tasks
        WHERE assignee_id = $1 AND deleted_at IS NULL;
      `;
      const taskRes = await query(taskSql, [user.id]);
      const taskStats = taskRes.rows[0];
      const completionRate = taskStats.total_assigned > 0
        ? Number(((taskStats.completed / taskStats.total_assigned) * 100).toFixed(2))
        : 0;

      const attSql = `
        SELECT
          COUNT(1)::int AS total_logged,
          COUNT(1) FILTER (WHERE status = 'present')::int AS present,
          COUNT(1) FILTER (WHERE status = 'late')::int AS late,
          COUNT(1) FILTER (WHERE status = 'absent')::int AS absent,
          COUNT(1) FILTER (WHERE status IN ('half_day', 'excused'))::int AS excused
        FROM attendance
        WHERE intern_id = $1;
      `;
      const attRes = await query(attSql, [user.id]);
      const attStats = attRes.rows[0];
      const attendanceRate = attStats.total_logged > 0
        ? Number((((attStats.present + attStats.late) / attStats.total_logged) * 100).toFixed(2))
        : 0;

      const leaveSql = `
        SELECT
          COUNT(1)::int AS total_requests,
          COUNT(1) FILTER (WHERE status = 'pending')::int AS pending,
          COUNT(1) FILTER (WHERE status = 'approved')::int AS approved,
          COUNT(1) FILTER (WHERE status = 'rejected')::int AS rejected
        FROM leave_requests
        WHERE intern_id = $1;
      `;
      const leaveRes = await query(leaveSql, [user.id]);

      const profSql = `
        SELECT ip.status AS intern_status, ip.institution, ip.field_of_study, ip.created_at AS started_at
        FROM intern_profiles ip
        WHERE ip.user_id = $1;
      `;
      const profRes = await query(profSql, [user.id]);

      return {
        role: 'intern',
        tasks: {
          assigned: taskStats.total_assigned,
          completed: taskStats.completed,
          pending_in_progress: taskStats.pending_in_progress,
          overdue: taskStats.overdue,
          completion_rate: completionRate,
        },
        attendance: {
          total_logged: attStats.total_logged,
          present: attStats.present,
          late: attStats.late,
          absent: attStats.absent,
          excused: attStats.excused,
          attendance_rate: attendanceRate,
        },
        leave: leaveRes.rows[0],
        internship_progress: {
          profile_status: profRes.rows[0]?.intern_status || 'onboarding',
          institution: profRes.rows[0]?.institution || null,
          field_of_study: profRes.rows[0]?.field_of_study || null,
          started_at: profRes.rows[0]?.started_at || null,
        },
      };
    }

    if (role === 'supervisor') {
      // Supervisor metrics
      const internCountRes = await query(
        'SELECT COUNT(1)::int AS count FROM intern_profiles WHERE supervisor_id = $1',
        [scope.supervisorProfileId]
      );
      const assignedInternsCount = internCountRes.rows[0].count;

      const taskSql = `
        SELECT
          COUNT(t.id)::int AS total_tasks,
          COUNT(t.id) FILTER (WHERE t.status = 'completed')::int AS completed,
          COUNT(t.id) FILTER (WHERE t.status IN ('todo', 'in_progress', 'submitted', 'in_review', 'revision_requested'))::int AS pending,
          COUNT(t.id) FILTER (WHERE t.due_date < NOW() AND t.status != 'completed')::int AS overdue
        FROM tasks t
        JOIN intern_profiles ip ON ip.user_id = t.assignee_id
        WHERE ip.supervisor_id = $1 AND t.deleted_at IS NULL;
      `;
      const taskRes = await query(taskSql, [scope.supervisorProfileId]);
      const taskStats = taskRes.rows[0];
      const completionRate = taskStats.total_tasks > 0
        ? Number(((taskStats.completed / taskStats.total_tasks) * 100).toFixed(2))
        : 0;

      const attSql = `
        SELECT
          COUNT(a.id)::int AS total_logged,
          COUNT(a.id) FILTER (WHERE a.status = 'present')::int AS present,
          COUNT(a.id) FILTER (WHERE a.status = 'late')::int AS late,
          COUNT(a.id) FILTER (WHERE a.status = 'absent')::int AS absent,
          COUNT(a.id) FILTER (WHERE a.status IN ('half_day', 'excused'))::int AS excused
        FROM attendance a
        JOIN intern_profiles ip ON ip.user_id = a.intern_id
        WHERE ip.supervisor_id = $1;
      `;
      const attRes = await query(attSql, [scope.supervisorProfileId]);
      const attStats = attRes.rows[0];
      const teamAttendanceRate = attStats.total_logged > 0
        ? Number((((attStats.present + attStats.late) / attStats.total_logged) * 100).toFixed(2))
        : 0;

      const leaveSql = `
        SELECT
          COUNT(lr.id)::int AS total_requests,
          COUNT(lr.id) FILTER (WHERE lr.status = 'pending')::int AS pending,
          COUNT(lr.id) FILTER (WHERE lr.status = 'approved')::int AS approved,
          COUNT(lr.id) FILTER (WHERE lr.status = 'rejected')::int AS rejected
        FROM leave_requests lr
        JOIN intern_profiles ip ON ip.user_id = lr.intern_id
        WHERE ip.supervisor_id = $1;
      `;
      const leaveRes = await query(leaveSql, [scope.supervisorProfileId]);

      const ratingSql = `
        SELECT ROUND(AVG(tr.rating)::numeric, 2) AS avg_rating
        FROM task_reviews tr
        JOIN tasks t ON t.id = tr.task_id
        JOIN intern_profiles ip ON ip.user_id = t.assignee_id
        WHERE ip.supervisor_id = $1;
      `;
      const ratingRes = await query(ratingSql, [scope.supervisorProfileId]);
      const avgRating = ratingRes.rows[0]?.avg_rating ? Number(ratingRes.rows[0].avg_rating) : null;

      return {
        role: 'supervisor',
        assigned_interns: assignedInternsCount,
        tasks: {
          total: taskStats.total_tasks,
          completed: taskStats.completed,
          pending: taskStats.pending,
          overdue: taskStats.overdue,
          completion_rate: completionRate,
        },
        team_attendance: {
          total_logged: attStats.total_logged,
          present: attStats.present,
          late: attStats.late,
          absent: attStats.absent,
          excused: attStats.excused,
          attendance_rate: teamAttendanceRate,
        },
        leave: leaveRes.rows[0],
        performance_overview: {
          task_completion_rate: completionRate,
          team_attendance_rate: teamAttendanceRate,
          average_task_rating: avgRating,
        },
      };
    }

    // HR / Head / Admin Dashboard Metrics
    const subquery = buildInternIdSubquery(scope, 1);
    const internIdsSql = subquery.sql;
    const values = subquery.values;

    const userStatsSql = `
      SELECT
        COUNT(u.id)::int AS total_users,
        COUNT(u.id) FILTER (WHERE r.name = 'intern')::int AS total_interns,
        COUNT(u.id) FILTER (WHERE r.name = 'intern' AND u.status = 'active')::int AS active_interns,
        COUNT(u.id) FILTER (WHERE r.name = 'intern' AND u.status != 'active')::int AS inactive_interns
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.deleted_at IS NULL
        ${scope.orgId ? `AND u.organization_id = '${scope.orgId}'` : ''}
        ${scope.departmentId ? `AND u.department_id = '${scope.departmentId}'` : ''};
    `;
    const userStatsRes = await query(userStatsSql);

    const taskSql = `
      SELECT
        COUNT(t.id)::int AS total_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'completed')::int AS completed,
        COUNT(t.id) FILTER (WHERE t.status = 'in_progress')::int AS in_progress,
        COUNT(t.id) FILTER (WHERE t.status = 'todo')::int AS pending,
        COUNT(t.id) FILTER (WHERE t.due_date < NOW() AND t.status != 'completed')::int AS overdue
      FROM tasks t
      WHERE t.deleted_at IS NULL AND t.assignee_id IN (${internIdsSql});
    `;
    const taskRes = await query(taskSql, values);
    const taskStats = taskRes.rows[0];
    const taskCompletionRate = taskStats.total_tasks > 0
      ? Number(((taskStats.completed / taskStats.total_tasks) * 100).toFixed(2))
      : 0;

    const attSql = `
      SELECT
        COUNT(a.id)::int AS total_logged,
        COUNT(a.id) FILTER (WHERE a.status = 'present')::int AS present,
        COUNT(a.id) FILTER (WHERE a.status = 'late')::int AS late,
        COUNT(a.id) FILTER (WHERE a.status = 'absent')::int AS absent,
        COUNT(a.id) FILTER (WHERE a.status IN ('half_day', 'excused'))::int AS excused
      FROM attendance a
      WHERE a.intern_id IN (${internIdsSql});
    `;
    const attRes = await query(attSql, values);
    const attStats = attRes.rows[0];
    const attendanceRate = attStats.total_logged > 0
      ? Number((((attStats.present + attStats.late) / attStats.total_logged) * 100).toFixed(2))
      : 0;

    const leaveSql = `
      SELECT
        COUNT(lr.id)::int AS total_requests,
        COUNT(lr.id) FILTER (WHERE lr.status = 'pending')::int AS pending,
        COUNT(lr.id) FILTER (WHERE lr.status = 'approved')::int AS approved,
        COUNT(lr.id) FILTER (WHERE lr.status = 'rejected')::int AS rejected
      FROM leave_requests lr
      WHERE lr.intern_id IN (${internIdsSql});
    `;
    const leaveRes = await query(leaveSql, values);

    const deptStatsSql = `
      SELECT
        d.id AS department_id,
        d.name AS department_name,
        COUNT(DISTINCT u.id)::int AS intern_count,
        COUNT(DISTINCT t.id)::int AS task_count
      FROM departments d
      LEFT JOIN users u ON u.department_id = d.id AND u.deleted_at IS NULL
      LEFT JOIN tasks t ON t.department_id = d.id AND t.deleted_at IS NULL
      WHERE d.deleted_at IS NULL ${scope.orgId ? `AND d.organization_id = '${scope.orgId}'` : ''}
      GROUP BY d.id, d.name
      ORDER BY d.name ASC;
    `;
    const deptStatsRes = await query(deptStatsSql);

    return {
      role: role,
      users: userStatsRes.rows[0],
      tasks: {
        ...taskStats,
        completion_rate: taskCompletionRate,
      },
      attendance: {
        ...attStats,
        attendance_rate: attendanceRate,
      },
      leave: leaveRes.rows[0],
      department_statistics: deptStatsRes.rows,
    };
  },

  /**
   * 2. Task Analytics
   */
  async getTaskAnalytics(user, filters = {}) {
    const scope = await resolveScope(user, filters);
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

    const mainSql = `
      SELECT
        COUNT(t.id)::int AS total_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'completed')::int AS completed,
        COUNT(t.id) FILTER (WHERE t.status = 'todo')::int AS pending,
        COUNT(t.id) FILTER (WHERE t.status = 'in_progress')::int AS in_progress,
        COUNT(t.id) FILTER (WHERE t.status IN ('submitted', 'in_review'))::int AS submitted,
        COUNT(t.id) FILTER (WHERE EXISTS (
          SELECT 1 FROM task_reviews tr WHERE tr.task_id = t.id AND tr.status = 'approved'
        ) OR t.status = 'completed')::int AS approved,
        COUNT(t.id) FILTER (WHERE EXISTS (
          SELECT 1 FROM task_reviews tr WHERE tr.task_id = t.id AND tr.status = 'rejected'
        ) OR t.status = 'revision_requested')::int AS rejected,
        COUNT(t.id) FILTER (WHERE t.due_date < NOW() AND t.status != 'completed')::int AS overdue,
        ROUND(AVG(
          CASE 
            WHEN t.status = 'completed' THEN EXTRACT(EPOCH FROM (t.updated_at - t.created_at)) / 3600 
            ELSE NULL 
          END
        )::numeric, 2) AS avg_completion_time_hours
      FROM tasks t
      WHERE ${whereClauses.join(' AND ')};
    `;

    const mainRes = await query(mainSql, values);
    const row = mainRes.rows[0];
    const total = row.total_tasks || 0;
    const completionPct = total > 0 ? Number(((row.completed / total) * 100).toFixed(2)) : 0;

    // Breakdown by priority
    const prioritySql = `
      SELECT t.priority, COUNT(t.id)::int AS count
      FROM tasks t
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY t.priority;
    `;
    const priorityRes = await query(prioritySql, values);
    const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
    priorityRes.rows.forEach((r) => {
      byPriority[r.priority] = r.count;
    });

    // Breakdown by status
    const statusSql = `
      SELECT t.status, COUNT(t.id)::int AS count
      FROM tasks t
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY t.status;
    `;
    const statusRes = await query(statusSql, values);
    const byStatus = {};
    statusRes.rows.forEach((r) => {
      byStatus[r.status] = r.count;
    });

    return {
      total_tasks: total,
      completed: row.completed,
      pending: row.pending,
      in_progress: row.in_progress,
      submitted: row.submitted,
      approved: row.approved,
      rejected: row.rejected,
      overdue: row.overdue,
      completion_percentage: completionPct,
      average_completion_time_hours: row.avg_completion_time_hours ? Number(row.avg_completion_time_hours) : 0,
      by_priority: byPriority,
      by_status: byStatus,
    };
  },

  /**
   * 3. Attendance Analytics
   */
  async getAttendanceAnalytics(user, filters = {}) {
    const scope = await resolveScope(user, filters);
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

    const mainSql = `
      SELECT
        COUNT(a.id)::int AS total_records,
        COUNT(a.id) FILTER (WHERE a.status = 'present')::int AS present_count,
        COUNT(a.id) FILTER (WHERE a.status = 'late')::int AS late_count,
        COUNT(a.id) FILTER (WHERE a.status = 'absent')::int AS absent_count,
        COUNT(a.id) FILTER (WHERE a.status IN ('half_day', 'excused'))::int AS leave_count,
        ROUND(AVG(
          CASE 
            WHEN a.check_in IS NOT NULL AND a.check_out IS NOT NULL THEN 
              EXTRACT(EPOCH FROM (a.check_out - a.check_in)) / 3600
            ELSE NULL 
          END
        )::numeric, 2) AS avg_work_duration_hours
      FROM attendance a
      WHERE ${whereClauses.join(' AND ')};
    `;

    const mainRes = await query(mainSql, values);
    const row = mainRes.rows[0];
    const total = row.total_records || 0;
    const attendanceRate = total > 0
      ? Number((((row.present_count + row.late_count) / total) * 100).toFixed(2))
      : 0;

    // Time series grouping
    const groupBy = filters.groupBy === 'month' ? 'month' : filters.groupBy === 'week' ? 'week' : 'day';
    const timeSeriesSql = `
      SELECT
        DATE_TRUNC('${groupBy}', a.date)::date AS period,
        COUNT(a.id)::int AS total,
        COUNT(a.id) FILTER (WHERE a.status = 'present')::int AS present,
        COUNT(a.id) FILTER (WHERE a.status = 'late')::int AS late,
        COUNT(a.id) FILTER (WHERE a.status = 'absent')::int AS absent,
        COUNT(a.id) FILTER (WHERE a.status IN ('half_day', 'excused'))::int AS leave
      FROM attendance a
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY period
      ORDER BY period ASC;
    `;
    const timeSeriesRes = await query(timeSeriesSql, values);

    return {
      total_records: total,
      present_count: row.present_count,
      late_count: row.late_count,
      absent_count: row.absent_count,
      leave_count: row.leave_count,
      attendance_rate: attendanceRate,
      average_work_duration_hours: row.avg_work_duration_hours ? Number(row.avg_work_duration_hours) : 0,
      summaries: timeSeriesRes.rows,
    };
  },

  /**
   * 4. Leave Analytics
   */
  async getLeaveAnalytics(user, filters = {}) {
    const scope = await resolveScope(user, filters);
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

    const mainSql = `
      SELECT
        COUNT(lr.id)::int AS total_requests,
        COUNT(lr.id) FILTER (WHERE lr.status = 'pending')::int AS pending,
        COUNT(lr.id) FILTER (WHERE lr.status = 'approved')::int AS approved,
        COUNT(lr.id) FILTER (WHERE lr.status = 'rejected')::int AS rejected,
        COUNT(lr.id) FILTER (WHERE lr.status = 'cancelled')::int AS cancelled
      FROM leave_requests lr
      WHERE ${whereClauses.join(' AND ')};
    `;

    const mainRes = await query(mainSql, values);
    const row = mainRes.rows[0];

    // By leave type
    const typeSql = `
      SELECT lr.leave_type, COUNT(lr.id)::int AS count
      FROM leave_requests lr
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY lr.leave_type;
    `;
    const typeRes = await query(typeSql, values);
    const byType = {};
    typeRes.rows.forEach((r) => {
      byType[r.leave_type] = r.count;
    });

    // By department breakdown
    const deptSql = `
      SELECT d.id AS department_id, d.name AS department_name, COUNT(lr.id)::int AS total_requests
      FROM leave_requests lr
      JOIN users u ON u.id = lr.intern_id
      JOIN departments d ON d.id = u.department_id
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY d.id, d.name;
    `;
    const deptRes = await query(deptSql, values);

    return {
      total_requests: row.total_requests,
      pending: row.pending,
      approved: row.approved,
      rejected: row.rejected,
      cancelled: row.cancelled,
      by_leave_type: byType,
      department_breakdown: deptRes.rows,
    };
  },

  /**
   * 5. Performance Analytics
   */
  async getPerformanceAnalytics(user, filters = {}) {
    const scope = await resolveScope(user, filters);
    const subquery = buildInternIdSubquery(scope, 1);
    const values = subquery.values;

    const perfSql = `
      SELECT
        u.id AS intern_id,
        u.first_name,
        u.last_name,
        u.email,
        d.name AS department_name,
        
        -- Task metrics
        COUNT(t.id)::int AS total_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'completed')::int AS completed_tasks,
        
        -- Attendance metrics
        COUNT(a.id)::int AS total_attendance,
        COUNT(a.id) FILTER (WHERE a.status IN ('present', 'late'))::int AS attended_days,
        
        -- Reviews rating
        ROUND(AVG(tr.rating)::numeric, 2) AS avg_review_rating
      FROM users u
      LEFT JOIN departments d ON d.id = u.department_id
      LEFT JOIN tasks t ON t.assignee_id = u.id AND t.deleted_at IS NULL
      LEFT JOIN attendance a ON a.intern_id = u.id
      LEFT JOIN task_reviews tr ON tr.task_id = t.id
      WHERE u.id IN (${subquery.sql})
      GROUP BY u.id, u.first_name, u.last_name, u.email, d.name;
    `;

    const res = await query(perfSql, values);

    const internPerformances = res.rows.map((row) => {
      const taskCompletionRate = row.total_tasks > 0
        ? Number(((row.completed_tasks / row.total_tasks) * 100).toFixed(2))
        : 0;
      const attendanceRate = row.total_attendance > 0
        ? Number(((row.attended_days / row.total_attendance) * 100).toFixed(2))
        : 0;
      const avgRating = row.avg_review_rating ? Number(row.avg_review_rating) : null;
      const ratingScore = avgRating ? avgRating * 20 : taskCompletionRate;

      // Weighted score: 40% task completion, 30% rating, 30% attendance
      const overallScore = Number(((taskCompletionRate * 0.4) + (ratingScore * 0.3) + (attendanceRate * 0.3)).toFixed(2));

      return {
        intern_id: row.intern_id,
        name: `${row.first_name} ${row.last_name}`,
        email: row.email,
        department_name: row.department_name,
        total_tasks: row.total_tasks,
        completed_tasks: row.completed_tasks,
        task_completion_rate: taskCompletionRate,
        attendance_rate: attendanceRate,
        average_task_rating: avgRating,
        overall_score: overallScore,
      };
    });

    const avgOverallScore = internPerformances.length > 0
      ? Number((internPerformances.reduce((acc, curr) => acc + curr.overall_score, 0) / internPerformances.length).toFixed(2))
      : 0;

    return {
      overall_team_performance_score: avgOverallScore,
      total_interns_evaluated: internPerformances.length,
      interns: internPerformances,
    };
  },

  /**
   * 6. Internship Progress Analytics
   */
  async getInternshipProgressAnalytics(user, filters = {}) {
    const scope = await resolveScope(user, filters);
    const subquery = buildInternIdSubquery(scope, 1);
    const values = subquery.values;

    const progressSql = `
      SELECT
        u.id AS intern_id,
        u.first_name,
        u.last_name,
        ip.status AS intern_status,
        ip.institution,
        ip.field_of_study,
        i.title AS internship_title,
        i.start_date,
        i.end_date,
        COUNT(t.id)::int AS total_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'completed')::int AS completed_tasks
      FROM users u
      JOIN intern_profiles ip ON ip.user_id = u.id
      LEFT JOIN internships i ON i.id = (
        SELECT ia.internship_id 
        FROM internship_applications ia 
        WHERE ia.applicant_id = u.id 
        ORDER BY ia.created_at DESC LIMIT 1
      )
      LEFT JOIN tasks t ON t.assignee_id = u.id AND t.deleted_at IS NULL
      WHERE u.id IN (${subquery.sql})
      GROUP BY u.id, u.first_name, u.last_name, ip.status, ip.institution, ip.field_of_study, i.title, i.start_date, i.end_date;
    `;

    const res = await query(progressSql, values);

    const items = res.rows.map((r) => {
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
        name: `${r.first_name} ${r.last_name}`,
        status: r.intern_status,
        institution: r.institution,
        field_of_study: r.field_of_study,
        internship_title: r.internship_title || 'General Internship',
        start_date: r.start_date,
        end_date: r.end_date,
        days_elapsed: daysElapsed,
        total_days: totalDays,
        timeline_progress_percentage: timelinePct,
        task_completion_percentage: taskCompletionPct,
      };
    });

    return {
      total_interns: items.length,
      onboarding_count: items.filter((i) => i.status === 'onboarding').length,
      active_count: items.filter((i) => i.status === 'active').length,
      completed_count: items.filter((i) => i.status === 'completed').length,
      terminated_count: items.filter((i) => i.status === 'terminated').length,
      items,
    };
  },
};

module.exports = {
  resolveScope,
  buildInternIdSubquery,
  AnalyticsService,
};
