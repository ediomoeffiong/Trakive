const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const AttendanceController = require('../../controllers/attendance.controller');
const {
  checkInSchema,
  correctionSchema,
  historyQuerySchema,
  dashboardQuerySchema,
  officeSchema,
  policySchema,
  overrideSchema,
  holidaySchema,
  manualAttendanceSchema,
  reviewCorrectionSchema,
  idParamSchema,
} = require('../../validators/attendance.validator');

const router = express.Router();

router.use(authenticate);

router.get('/today', AttendanceController.getToday);
router.post('/check-in', validate({ body: checkInSchema }), AttendanceController.checkIn);
router.post('/corrections', validate({ body: correctionSchema }), AttendanceController.requestCorrection);
router.get('/history', validate({ query: historyQuerySchema }), AttendanceController.getHistory);

router.get('/supervisor/dashboard', validate({ query: dashboardQuerySchema }), AttendanceController.getSupervisorDashboard);
router.get('/supervisor/export', validate({ query: dashboardQuerySchema }), AttendanceController.exportReport);
router.post('/supervisor/manual', validate({ body: manualAttendanceSchema }), AttendanceController.manualAttendance);
router.patch('/supervisor/corrections/:id', validate({ params: idParamSchema, body: reviewCorrectionSchema }), AttendanceController.reviewCorrection);

router.get('/config', AttendanceController.getConfiguration);
router.post('/config/offices', validate({ body: officeSchema }), AttendanceController.upsertOffice);
router.post('/config/policies', validate({ body: policySchema }), AttendanceController.upsertPolicy);
router.post('/config/overrides', validate({ body: overrideSchema }), AttendanceController.createOverride);
router.post('/config/holidays', validate({ body: holidaySchema }), AttendanceController.addHoliday);

module.exports = router;
