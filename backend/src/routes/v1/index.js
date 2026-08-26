const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const departmentRoutes = require('./department.routes');
const internRoutes = require('./intern.routes');
const applicationRoutes = require('./application.routes');
const onboardingRoutes = require('./onboarding.routes');
const { authenticate, requireRole, requirePermission } = require('../../middleware/auth.middleware');
const { sendSuccess } = require('../../utils/apiResponse');

const taskRoutes = require('./task.routes');
const attendanceRoutes = require('./attendance.routes');
const leaveRoutes = require('./leave.routes');
const activityRoutes = require('./activity.routes');

// Day 7 Routes
const notificationRoutes = require('./notification.routes');
const documentRoutes = require('./document.routes');
const conversationRoutes = require('./conversation.routes');
const messageRoutes = require('./message.routes');

const router = express.Router();

// Health & Auth Routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Day 4 Routes
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/interns', internRoutes);
router.use('/applications', applicationRoutes);
router.use('/onboarding', onboardingRoutes);

// Day 5 Routes
router.use('/tasks', taskRoutes);

// Day 6 Routes
router.use('/attendance', attendanceRoutes);
router.use('/leave', leaveRoutes);
router.use('/activity', activityRoutes);

// Day 7 Routes
router.use('/notifications', notificationRoutes);
router.use('/documents', documentRoutes);
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);

// Protected Test Endpoints for Role & Permission Authorization Verification
router.get('/test/intern', authenticate, requireRole('intern'), (req, res) => {
  return sendSuccess(res, { message: 'Intern endpoint accessed successfully', data: { user: req.user } });
});

router.get('/test/supervisor', authenticate, requireRole('supervisor'), (req, res) => {
  return sendSuccess(res, { message: 'Supervisor endpoint accessed successfully', data: { user: req.user } });
});

router.get('/test/hr', authenticate, requireRole('hr'), (req, res) => {
  return sendSuccess(res, { message: 'HR endpoint accessed successfully', data: { user: req.user } });
});

router.get('/test/head', authenticate, requireRole('head'), (req, res) => {
  return sendSuccess(res, { message: 'Department Head endpoint accessed successfully', data: { user: req.user } });
});

router.get('/test/admin', authenticate, requireRole('admin'), (req, res) => {
  return sendSuccess(res, { message: 'Admin endpoint accessed successfully', data: { user: req.user } });
});

router.get('/test/permission-users-write', authenticate, requirePermission('users:write'), (req, res) => {
  return sendSuccess(res, { message: 'Users Write permission endpoint accessed successfully', data: { user: req.user } });
});

module.exports = router;
