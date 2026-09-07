const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const WeeklyPlanController = require('../../controllers/weeklyPlan.controller');

const router = express.Router();

router.use(authenticate);

// Intern — get current/specific week plan
router.get('/mine', requireRole('intern'), WeeklyPlanController.getWeeklyPlan);

// Intern — get tasks for a specific week
router.get(
  '/tasks/:weekStart',
  WeeklyPlanController.getWeeklyTasks
);

// Intern — add a task to weekly plan
router.post(
  '/tasks/:weekStart',
  requireRole('intern'),
  WeeklyPlanController.addWeeklyTask
);

// Intern — update a task's weekly status/note
router.patch(
  '/tasks/:taskId/status',
  requireRole('intern'),
  WeeklyPlanController.updateWeeklyTaskStatus
);

// Intern — submit weekly report for review
router.post(
  '/:planId/submit',
  requireRole('intern'),
  WeeklyPlanController.submitWeeklyReport
);

// Supervisor — review a weekly report
router.post(
  '/:planId/review',
  requireRole('supervisor', 'admin', 'super_admin', 'hr'),
  WeeklyPlanController.reviewWeeklyReport
);

// Supervisor — view all interns' weekly plans
router.get(
  '/',
  requireRole('supervisor', 'admin', 'super_admin', 'hr'),
  WeeklyPlanController.supervisorWeeklyView
);

module.exports = router;
