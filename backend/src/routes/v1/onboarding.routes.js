const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const {
  submitOnboardingInfoSchema,
  submitOnboardingDetailsSchema,
  submitDocumentSchema,
  reviewDocumentSchema,
  reviewOnboardingDetailsSchema,
  assignSupervisorOnboardingSchema,
  completeOnboardingSchema,
} = require('../../utils/onboarding.validator');
const {
  submitOnboardingInfo,
  submitOnboardingDetails,
  submitOnboardingDocument,
  getRequiredDocuments,
  reviewOnboardingDocument,
  reviewOnboardingDetails,
  getSupervisorQueue,
  assignSupervisorOnboarding,
  completeOnboarding,
} = require('../../controllers/onboarding.controller');

const router = express.Router();

router.post('/info', authenticate, validate({ body: submitOnboardingInfoSchema }), submitOnboardingInfo);
router.post('/details', authenticate, validate({ body: submitOnboardingDetailsSchema }), submitOnboardingDetails);
router.get('/documents', authenticate, getRequiredDocuments);
router.post('/documents', authenticate, validate({ body: submitDocumentSchema }), submitOnboardingDocument);
router.get('/supervisor/queue', authenticate, requireRole('supervisor', 'admin', 'hr', 'head'), getSupervisorQueue);
router.patch('/details/:internId/:section/review', authenticate, requireRole('supervisor', 'admin', 'hr', 'head'), validate({ body: reviewOnboardingDetailsSchema }), reviewOnboardingDetails);
router.patch('/documents/:documentId/review', authenticate, requireRole('supervisor', 'admin', 'hr', 'head'), validate({ body: reviewDocumentSchema }), reviewOnboardingDocument);
router.patch('/assign', authenticate, requireRole('admin', 'hr', 'head'), validate({ body: assignSupervisorOnboardingSchema }), assignSupervisorOnboarding);
router.post('/complete', authenticate, requireRole('admin', 'hr'), validate({ body: completeOnboardingSchema }), completeOnboarding);

module.exports = router;
