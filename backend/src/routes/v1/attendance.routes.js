const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const {
  clockInSchema,
  clockOutSchema,
  listAttendanceQuerySchema,
} = require('../../utils/attendance.validator');
const {
  clockIn,
  clockOut,
  getMyAttendance,
  getAttendance,
} = require('../../controllers/attendance.controller');

const router = express.Router();

router.post('/clock-in', authenticate, validate({ body: clockInSchema }), clockIn);
router.post('/clock-out', authenticate, validate({ body: clockOutSchema }), clockOut);
router.get('/me', authenticate, validate({ query: listAttendanceQuerySchema }), getMyAttendance);
router.get('/', authenticate, validate({ query: listAttendanceQuerySchema }), getAttendance);

module.exports = router;
