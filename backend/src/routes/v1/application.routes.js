const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const {
  createApplicationSchema,
  reviewApplicationSchema,
  createInternAccountFromAppSchema,
} = require('../../utils/onboarding.validator');
const {
  createApplication,
  getApplication,
  listApplications,
  reviewApplication,
  createInternAccount,
} = require('../../controllers/application.controller');

const router = express.Router();

router.post('/', authenticate, validate({ body: createApplicationSchema }), createApplication);
router.get('/', authenticate, listApplications);
router.get('/:id', authenticate, getApplication);
router.patch('/:id/review', authenticate, requireRole('admin', 'hr', 'head'), validate({ body: reviewApplicationSchema }), reviewApplication);

router.patch('/:id/approve', authenticate, requireRole('admin', 'hr'), (req, res, next) => {
  req.body.status = 'approved';
  return reviewApplication(req, res, next);
});

router.patch('/:id/reject', authenticate, requireRole('admin', 'hr'), (req, res, next) => {
  req.body.status = 'rejected';
  return reviewApplication(req, res, next);
});

router.post('/:id/create-account', authenticate, requireRole('admin', 'hr'), validate({ body: createInternAccountFromAppSchema }), createInternAccount);

module.exports = router;
