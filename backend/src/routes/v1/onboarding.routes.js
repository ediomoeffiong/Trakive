const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const {
  submitOnboardingInfoSchema,
  submitDocumentSchema,
  assignSupervisorOnboardingSchema,
  completeOnboardingSchema,
} = require('../../utils/onboarding.validator');
const {
  submitOnboardingInfo,
  submitOnboardingDocument,
  getRequiredDocuments,
  assignSupervisorOnboarding,
  completeOnboarding,
} = require('../../controllers/onboarding.controller');

const router = express.Router();

router.post('/info', authenticate, validate({ body: submitOnboardingInfoSchema }), submitOnboardingInfo);
router.get('/documents', authenticate, getRequiredDocuments);
router.post('/documents', authenticate, validate({ body: submitDocumentSchema }), submitOnboardingDocument);
router.patch('/assign', authenticate, requireRole('admin', 'hr', 'head'), validate({ body: assignSupervisorOnboardingSchema }), assignSupervisorOnboarding);
router.post('/complete', authenticate, requireRole('admin', 'hr'), validate({ body: completeOnboardingSchema }), completeOnboarding);

module.exports = router;
