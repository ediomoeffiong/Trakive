const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { searchQuerySchema } = require('../../utils/search.validator');
const AttendanceController = require('../../controllers/attendance.controller');
const {
  checkInSchema,
  correctionRequestSchema,
  manualAttendanceSchema,
  reviewCorrectionSchema,
  officeSchema,
  officeUpdateSchema,
  policySchema,
  departmentScheduleSchema,
  overrideSchema,
  holidaySchema,
  performanceSchema,
  idParamSchema,
  departmentIdParamSchema,
} = require('../../utils/attendance.validator');

const router = express.Router();
const manageRoles = ['supervisor', 'head', 'admin'];

router.get('/me/today', authenticate, requireRole('intern'), AttendanceController.getToday);
router.post(
  '/check-in',
  authenticate,
  requireRole('intern'),
  validate({ body: checkInSchema }),
  AttendanceController.checkIn
);
router.post(
  '/corrections',
  authenticate,
  requireRole('intern'),
  validate({ body: correctionRequestSchema }),
  AttendanceController.requestCorrection
);
router.get('/me/history', authenticate, requireRole('intern'), AttendanceController.getMeHistory);
router.get('/me/summary', authenticate, requireRole('intern'), AttendanceController.getMeSummary);

router.get('/dashboard', authenticate, requireRole(...manageRoles), AttendanceController.supervisorDashboard);
router.get('/config', authenticate, requireRole(...manageRoles), AttendanceController.getConfig);
router.patch(
  '/config/policy',
  authenticate,
  requireRole(...manageRoles),
  validate({ body: policySchema }),
  AttendanceController.updatePolicy
);
router.patch(
  '/config/performance',
  authenticate,
  requireRole(...manageRoles),
  validate({ body: performanceSchema }),
  AttendanceController.updatePerformance
);
router.patch(
  '/config/departments/:departmentId/schedule',
  authenticate,
  requireRole(...manageRoles),
  validate({ params: departmentIdParamSchema, body: departmentScheduleSchema }),
  AttendanceController.updateDepartmentSchedule
);
router.post(
  '/overrides',
  authenticate,
  requireRole(...manageRoles),
  validate({ body: overrideSchema }),
  AttendanceController.createOverride
);
router.delete(
  '/overrides/:id',
  authenticate,
  requireRole(...manageRoles),
  validate({ params: idParamSchema }),
  AttendanceController.deleteOverride
);

router.get('/offices', authenticate, requireRole(...manageRoles), AttendanceController.listOffices);
router.post(
  '/offices',
  authenticate,
  requireRole(...manageRoles),
  validate({ body: officeSchema }),
  AttendanceController.createOffice
);
router.patch(
  '/offices/:id',
  authenticate,
  requireRole(...manageRoles),
  validate({ params: idParamSchema, body: officeUpdateSchema }),
  AttendanceController.updateOffice
);
router.delete(
  '/offices/:id',
  authenticate,
  requireRole(...manageRoles),
  validate({ params: idParamSchema }),
  AttendanceController.deleteOffice
);

router.post(
  '/holidays',
  authenticate,
  requireRole(...manageRoles),
  validate({ body: holidaySchema }),
  AttendanceController.createHoliday
);
router.delete(
  '/holidays/:id',
  authenticate,
  requireRole(...manageRoles),
  validate({ params: idParamSchema }),
  AttendanceController.deleteHoliday
);

router.get('/interns/:internId/history', authenticate, requireRole(...manageRoles), AttendanceController.internHistory);
router.get('/interns/:internId/summary', authenticate, requireRole(...manageRoles), AttendanceController.internSummary);

router.post(
  '/manual',
  authenticate,
  requireRole(...manageRoles),
  validate({ body: manualAttendanceSchema }),
  AttendanceController.manualUpsert
);
router.patch(
  '/corrections/:id',
  authenticate,
  requireRole(...manageRoles),
  validate({ params: idParamSchema, body: reviewCorrectionSchema }),
  AttendanceController.reviewCorrection
);

router.get('/export', authenticate, requireRole('intern', ...manageRoles), AttendanceController.exportRecords);

router.get('/', authenticate, validate({ query: searchQuerySchema }), AttendanceController.listRecords);

module.exports = router;
