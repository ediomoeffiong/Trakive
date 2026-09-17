const express = require('express');
const multer = require('multer');
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
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/info', authenticate, validate({ body: submitOnboardingInfoSchema }), submitOnboardingInfo);
router.post('/details', authenticate, validate({ body: submitOnboardingDetailsSchema }), submitOnboardingDetails);
router.get('/documents', authenticate, getRequiredDocuments);
router.post('/documents', authenticate, upload.single('file'), (req, res, next) => {
  if (req.file) return submitOnboardingDocument(req, res, next);
  return validate({ body: submitDocumentSchema })(req, res, (err) => {
    if (err) return next(err);
    return submitOnboardingDocument(req, res, next);
  });
});
router.get('/supervisor/queue', authenticate, requireRole('supervisor', 'admin', 'hr', 'head'), getSupervisorQueue);
router.patch('/details/:internId/:section/review', authenticate, requireRole('supervisor', 'admin', 'hr', 'head'), validate({ body: reviewOnboardingDetailsSchema }), reviewOnboardingDetails);
router.patch('/documents/:documentId/review', authenticate, requireRole('supervisor', 'admin', 'hr', 'head'), validate({ body: reviewDocumentSchema }), reviewOnboardingDocument);
router.patch('/assign', authenticate, requireRole('admin', 'hr', 'head'), validate({ body: assignSupervisorOnboardingSchema }), assignSupervisorOnboarding);
router.post('/complete', authenticate, requireRole('admin', 'hr'), validate({ body: completeOnboardingSchema }), completeOnboarding);

module.exports = router;
