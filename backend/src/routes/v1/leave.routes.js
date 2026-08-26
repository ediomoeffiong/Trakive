const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const {
  submitLeaveSchema,
  reviewLeaveSchema,
  listLeaveQuerySchema,
} = require('../../utils/leave.validator');
const {
  submitLeave,
  getMyLeaveRequests,
  getLeaveRequests,
  getLeaveById,
  approveLeave,
  rejectLeave,
} = require('../../controllers/leave.controller');

const router = express.Router();

// Submit & List
router.post('/', authenticate, validate({ body: submitLeaveSchema }), submitLeave);
router.get('/me', authenticate, validate({ query: listLeaveQuerySchema }), getMyLeaveRequests);
router.get('/', authenticate, validate({ query: listLeaveQuerySchema }), getLeaveRequests);

// Detail & Reviews
router.get('/:id', authenticate, getLeaveById);

const allowedReviewers = ['admin', 'super_admin', 'org_admin', 'hr', 'head', 'department_head', 'supervisor'];

router.post('/:id/approve', authenticate, requireRole(...allowedReviewers), validate({ body: reviewLeaveSchema }), approveLeave);
router.patch('/:id/approve', authenticate, requireRole(...allowedReviewers), validate({ body: reviewLeaveSchema }), approveLeave);

router.post('/:id/reject', authenticate, requireRole(...allowedReviewers), validate({ body: reviewLeaveSchema }), rejectLeave);
router.patch('/:id/reject', authenticate, requireRole(...allowedReviewers), validate({ body: reviewLeaveSchema }), rejectLeave);

module.exports = router;
