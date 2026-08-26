const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { analyticsQuerySchema } = require('../../validators/analytics.validator');
const {
  getDashboardMetrics,
  getTaskAnalytics,
  getAttendanceAnalytics,
  getLeaveAnalytics,
  getPerformanceAnalytics,
  getInternshipProgressAnalytics,
} = require('../../controllers/analytics.controller');

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', validate({ query: analyticsQuerySchema }), getDashboardMetrics);
router.get('/tasks', validate({ query: analyticsQuerySchema }), getTaskAnalytics);
router.get('/attendance', validate({ query: analyticsQuerySchema }), getAttendanceAnalytics);
router.get('/leave', validate({ query: analyticsQuerySchema }), getLeaveAnalytics);
router.get('/performance', validate({ query: analyticsQuerySchema }), getPerformanceAnalytics);
router.get('/internship-progress', validate({ query: analyticsQuerySchema }), getInternshipProgressAnalytics);

module.exports = router;
