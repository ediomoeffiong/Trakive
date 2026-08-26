const { query } = require('../config/db');
const TaskModel = require('../models/task.model');
const LeaveModel = require('../models/leave.model');
const AttendanceModel = require('../models/attendance.model');
const NotificationModel = require('../models/notification.model');
const AuditLogModel = require('../models/auditLog.model');

const AutomationService = {
  /**
   * 1. Task Reminders: Notify assignees of tasks due in <= 24 hours
   */
  async runTaskReminders() {
    const approachingTasks = await TaskModel.findApproachingDeadline(24);
    let notificationsSent = 0;

    for (const task of approachingTasks) {
      const linkUrl = `/tasks/${task.id}`;
      const alreadyNotified = await NotificationModel.existsSimilar({
        userId: task.assignee_id,
        type: 'task',
        linkUrl,
        createdWithinHours: 24,
      });

      if (!alreadyNotified) {
        await NotificationModel.create({
          userId: task.assignee_id,
          title: 'Task Deadline Approaching',
          message: `Reminder: Task "${task.title}" is due soon.`,
          type: 'task',
          linkUrl,
        });
        notificationsSent++;

        await AuditLogModel.log({
          organizationId: task.organization_id,
          userId: task.creator_id,
          action: 'AUTOMATION_TASK_REMINDER',
          entityType: 'tasks',
          entityId: task.id,
          details: { assignee_id: task.assignee_id, due_date: task.due_date },
        });
      }
    }

    return { processed: approachingTasks.length, notificationsSent };
  },

  /**
   * 2. Overdue Tasks: Flag tasks past due date and notify assignees
   */
  async runOverdueTasks() {
    const overdueTasks = await TaskModel.findOverdue();
    let notificationsSent = 0;

    for (const task of overdueTasks) {
      const linkUrl = `/tasks/${task.id}/overdue`;
      const alreadyNotified = await NotificationModel.existsSimilar({
        userId: task.assignee_id,
        type: 'task',
        linkUrl,
        createdWithinHours: 48,
      });

      if (!alreadyNotified) {
        await NotificationModel.create({
          userId: task.assignee_id,
          title: 'Task Overdue',
          message: `Task "${task.title}" has passed its deadline and is flagged as overdue.`,
          type: 'task',
          linkUrl,
        });
        notificationsSent++;

        await AuditLogModel.log({
          organizationId: task.organization_id,
          userId: task.creator_id,
          action: 'AUTOMATION_TASK_OVERDUE_FLAGGED',
          entityType: 'tasks',
          entityId: task.id,
          details: { assignee_id: task.assignee_id, due_date: task.due_date },
        });
      }
    }

    return { processed: overdueTasks.length, notificationsSent };
  },

  /**
   * 3. Internship Expiry: Handle internships & profiles reaching or passing end_date
   */
  async runInternshipExpiry() {
    // A. Pass end_date -> update status to completed
    const expiredRes = await query(`
      SELECT i.* 
      FROM internships i
      WHERE i.status = 'ongoing' AND i.end_date <= CURRENT_DATE
    `);
    const expiredInternships = expiredRes.rows;
    let completedCount = 0;

    for (const internship of expiredInternships) {
      await query(`UPDATE internships SET status = 'completed', updated_at = NOW() WHERE id = $1`, [internship.id]);
      completedCount++;

      await AuditLogModel.log({
        organizationId: internship.organization_id,
        userId: null,
        action: 'AUTOMATION_INTERNSHIP_COMPLETED',
        entityType: 'internships',
        entityId: internship.id,
        details: { end_date: internship.end_date },
      });
    }

    // B. Approaching end date -> notify intern profiles
    const approachingRes = await query(`
      SELECT ip.id, ip.user_id, ip.organization_id, u.email, i.end_date, i.title as internship_title
      FROM intern_profiles ip
      JOIN users u ON u.id = ip.user_id
      LEFT JOIN internship_applications ia ON ia.applicant_id = u.id AND ia.status = 'onboarding_completed'
      LEFT JOIN internships i ON i.id = ia.internship_id
      WHERE ip.status = 'active' 
        AND i.end_date IS NOT NULL
        AND i.end_date >= CURRENT_DATE
        AND i.end_date <= (CURRENT_DATE + INTERVAL '7 days')
    `);
    const approachingInterns = approachingRes.rows;
    let notificationsSent = 0;

    for (const record of approachingInterns) {
      const linkUrl = `/internships/expiry/${record.id}`;
      const alreadyNotified = await NotificationModel.existsSimilar({
        userId: record.user_id,
        type: 'system',
        linkUrl,
        createdWithinHours: 72,
      });

      if (!alreadyNotified) {
        await NotificationModel.create({
          userId: record.user_id,
          title: 'Internship Ending Soon',
          message: `Your internship "${record.internship_title || 'Program'}" will end on ${record.end_date}.`,
          type: 'system',
          linkUrl,
        });
        notificationsSent++;
      }
    }

    return { completedInternships: completedCount, expiryNotificationsSent: notificationsSent };
  },

  /**
   * 4. Leave / Attendance Consistency: Reconcile approved leave requests into attendance records
   */
  async runLeaveAttendanceConsistency() {
    const approvedLeaves = await LeaveModel.findApprovedLeaveRequests();
    let reconciledDays = 0;

    for (const leave of approvedLeaves) {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);

      for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        const dateStr = dt.toISOString().split('T')[0];
        await AttendanceModel.upsertExcusedAttendance(
          leave.organization_id,
          leave.intern_id,
          dateStr,
          `On Approved ${leave.leave_type.toUpperCase()} Leave`
        );
        reconciledDays++;
      }
    }

    return { totalLeavesProcessed: approvedLeaves.length, reconciledDays };
  },

  /**
   * Run all automations sequentially in a single idempotent batch
   */
  async runAllAutomations() {
    const reminders = await this.runTaskReminders();
    const overdue = await this.runOverdueTasks();
    const expiry = await this.runInternshipExpiry();
    const leaveConsistency = await this.runLeaveAttendanceConsistency();

    return {
      reminders,
      overdue,
      expiry,
      leaveConsistency,
      executedAt: new Date().toISOString(),
    };
  },
};

module.exports = AutomationService;
