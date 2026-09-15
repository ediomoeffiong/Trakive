const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const {
  submitOnboardingInfoSchema,
  submitDocumentSchema,
  reviewDocumentSchema,
  assignSupervisorOnboardingSchema,
  completeOnboardingSchema,
} = require('../../utils/onboarding.validator');
const {
  submitOnboardingInfo,
  submitOnboardingDocument,
  getRequiredDocuments,
  reviewOnboardingDocument,
  getSupervisorQueue,
  assignSupervisorOnboarding,
  completeOnboarding,
} = require('../../controllers/onboarding.controller');

const router = express.Router();

router.post('/info', authenticate, validate({ body: submitOnboardingInfoSchema }), submitOnboardingInfo);
router.get('/documents', authenticate, getRequiredDocuments);
router.post('/documents', authenticate, validate({ body: submitDocumentSchema }), submitOnboardingDocument);
router.get('/supervisor/queue', authenticate, requireRole('supervisor', 'admin', 'hr', 'head'), getSupervisorQueue);
router.patch('/documents/:documentId/review', authenticate, requireRole('supervisor', 'admin', 'hr', 'head'), validate({ body: reviewDocumentSchema }), reviewOnboardingDocument);
router.patch('/assign', authenticate, requireRole('admin', 'hr', 'head'), validate({ body: assignSupervisorOnboardingSchema }), assignSupervisorOnboarding);
router.post('/complete', authenticate, requireRole('admin', 'hr'), validate({ body: completeOnboardingSchema }), completeOnboarding);

module.exports = router;
