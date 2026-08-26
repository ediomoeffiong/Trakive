const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { reportQuerySchema } = require('../../validators/analytics.validator');
const {
  getInternReport,
  getTaskReport,
  getAttendanceReport,
  getLeaveReport,
  getDepartmentReport,
  getInternshipProgressReport,
} = require('../../controllers/report.controller');

const router = express.Router();

router.use(authenticate);

router.get('/interns', validate({ query: reportQuerySchema }), getInternReport);
router.get('/tasks', validate({ query: reportQuerySchema }), getTaskReport);
router.get('/attendance', validate({ query: reportQuerySchema }), getAttendanceReport);
router.get('/leave', validate({ query: reportQuerySchema }), getLeaveReport);
router.get('/departments', validate({ query: reportQuerySchema }), getDepartmentReport);
router.get('/internship-progress', validate({ query: reportQuerySchema }), getInternshipProgressReport);

module.exports = router;
