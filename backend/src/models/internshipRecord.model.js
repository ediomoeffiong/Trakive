const { query } = require('../config/db');

const InternshipRecordModel = {
  async findByUserId(userId) {
    const sql = `
      SELECT 
        ir.*,
        d.name AS department_name,
        d.code AS department_code,
        sp.id AS supervisor_profile_id,
        sup_u.first_name AS supervisor_first_name,
        sup_u.last_name AS supervisor_last_name,
        sup_u.email AS supervisor_email
      FROM internship_records ir
      LEFT JOIN departments d ON d.id = ir.department_id
      LEFT JOIN supervisor_profiles sp ON sp.id = ir.supervisor_id
      LEFT JOIN users sup_u ON sup_u.id = sp.user_id
      WHERE ir.user_id = $1
      ORDER BY ir.internship_number ASC;
    `;
    const res = await query(sql, [userId]);
    return res.rows;
  },

  async findById(id) {
    const sql = `
      SELECT 
        ir.*,
        d.name AS department_name,
        d.code AS department_code,
        sp.id AS supervisor_profile_id,
        sup_u.first_name AS supervisor_first_name,
        sup_u.last_name AS supervisor_last_name,
        sup_u.email AS supervisor_email
      FROM internship_records ir
      LEFT JOIN departments d ON d.id = ir.department_id
      LEFT JOIN supervisor_profiles sp ON sp.id = ir.supervisor_id
      LEFT JOIN users sup_u ON sup_u.id = sp.user_id
      WHERE ir.id = $1;
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  async findActiveByUserId(userId) {
    const sql = `
      SELECT 
        ir.*,
        d.name AS department_name,
        d.code AS department_code,
        sp.id AS supervisor_profile_id,
        sup_u.first_name AS supervisor_first_name,
        sup_u.last_name AS supervisor_last_name,
        sup_u.email AS supervisor_email
      FROM internship_records ir
      LEFT JOIN departments d ON d.id = ir.department_id
      LEFT JOIN supervisor_profiles sp ON sp.id = ir.supervisor_id
      LEFT JOIN users sup_u ON sup_u.id = sp.user_id
      WHERE ir.user_id = $1 AND ir.status IN ('active', 'onboarding')
      ORDER BY ir.internship_number DESC
      LIMIT 1;
    `;
    const res = await query(sql, [userId]);
    return res.rows[0] || null;
  },

  async getNextInternshipNumber(userId) {
    const sql = `SELECT COALESCE(MAX(internship_number), 0) + 1 AS next_num FROM internship_records WHERE user_id = $1;`;
    const res = await query(sql, [userId]);
    return parseInt(res.rows[0].next_num, 10);
  },

  async create({
    user_id,
    organization_id = null,
    department_id = null,
    supervisor_id = null,
    start_date,
    end_date,
    status = 'active',
    work_location = null,
    work_hours = null,
    days_per_week = 5,
    title = null,
  }) {
    const nextNumber = await this.getNextInternshipNumber(user_id);
    const recordTitle = title || `Internship #${nextNumber}`;

    const sql = `
      INSERT INTO internship_records (
        user_id, internship_number, title, organization_id, department_id,
        supervisor_id, start_date, end_date, status, work_location, work_hours, days_per_week
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;

    const values = [
      user_id,
      nextNumber,
      recordTitle,
      organization_id,
      department_id,
      supervisor_id,
      start_date,
      end_date,
      status,
      work_location,
      work_hours,
      days_per_week,
    ];

    const res = await query(sql, values);
    return res.rows[0];
  },

  async update(id, updates) {
    const fields = [];
    const values = [];
    let idx = 1;

    const allowed = [
      'department_id',
      'supervisor_id',
      'start_date',
      'end_date',
      'status',
      'work_location',
      'work_hours',
      'days_per_week',
      'final_summary',
      'title',
    ];

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(key === 'final_summary' ? JSON.stringify(updates[key]) : updates[key]);
        idx++;
      }
    }

    if (fields.length === 0) return await this.findById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `UPDATE internship_records SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *;`;
    const res = await query(sql, values);
    return res.rows[0];
  },

  async getFinalPerformanceSummary(internshipRecordId) {
    const record = await this.findById(internshipRecordId);
    if (!record) return null;

    // Calculate performance stats tied to this internship record
    const tasksRes = await query(
      `SELECT 
         COUNT(*)::int AS total_tasks,
         COUNT(CASE WHEN status = 'completed' THEN 1 END)::int AS completed_tasks,
         COUNT(CASE WHEN status IN ('in_progress', 'todo', 'submitted', 'in_review') THEN 1 END)::int AS pending_tasks
       FROM tasks
       WHERE internship_record_id = $1 OR (assignee_id = $2 AND internship_record_id IS NULL)`,
      [internshipRecordId, record.user_id]
    );

    const reportsRes = await query(
      `SELECT 
         COALESCE(AVG(overall_score), 0)::numeric(5,2) AS avg_score,
         COUNT(*)::int AS total_reports
       FROM reports
       WHERE (internship_record_id = $1 OR (intern_id = $2 AND internship_record_id IS NULL)) AND status = 'published'`,
      [internshipRecordId, record.user_id]
    );

    const attendanceRes = await query(
      `SELECT 
         COUNT(*)::int AS total_days,
         COUNT(CASE WHEN status = 'present' THEN 1 END)::int AS present_days
       FROM attendance
       WHERE (internship_record_id = $1 OR (intern_id = $2 AND internship_record_id IS NULL))`,
      [internshipRecordId, record.user_id]
    );

    const taskStats = tasksRes.rows[0] || {};
    const reportStats = reportsRes.rows[0] || {};
    const attendanceStats = attendanceRes.rows[0] || {};

    const completionRate = taskStats.total_tasks > 0 
      ? Math.round((taskStats.completed_tasks / taskStats.total_tasks) * 100)
      : 0;

    const attendanceRate = attendanceStats.total_days > 0 
      ? Math.round((attendanceStats.present_days / attendanceStats.total_days) * 100)
      : 100;

    return {
      internship_id: record.id,
      internship_number: record.internship_number,
      title: record.title,
      status: record.status,
      start_date: record.start_date,
      end_date: record.end_date,
      overall_score: parseFloat(reportStats.avg_score || 0),
      total_tasks: taskStats.total_tasks,
      completed_tasks: taskStats.completed_tasks,
      task_completion_rate: completionRate,
      attendance_rate: attendanceRate,
      final_summary: record.final_summary || {},
    };
  },
};

module.exports = InternshipRecordModel;
