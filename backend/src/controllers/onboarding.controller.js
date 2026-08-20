const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const OnboardingService = require('../services/onboarding.service');

const submitOnboardingInfo = asyncHandler(async (req, res) => {
  const result = await OnboardingService.submitOnboardingInfo(req.body, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: 'Onboarding information submitted successfully',
    data: result,
  });
});

const submitOnboardingDocument = asyncHandler(async (req, res) => {
  const result = await OnboardingService.submitOnboardingDocument(req.body, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Onboarding document submitted successfully',
    data: result,
  });
});

const getRequiredDocuments = asyncHandler(async (req, res) => {
  const ownerId = req.query.owner_id || req.user.id;
  const result = await OnboardingService.trackDocuments(ownerId, req.user);
  return sendSuccess(res, {
    message: 'Onboarding document tracking checklist retrieved',
    data: result,
  });
});

const assignSupervisorOnboarding = asyncHandler(async (req, res) => {
  const result = await OnboardingService.assignSupervisorAndDepartment(req.body, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: 'Supervisor and department assigned for onboarding successfully',
    data: result,
  });
});

const completeOnboarding = asyncHandler(async (req, res) => {
  const result = await OnboardingService.completeOnboarding(req.body, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: 'Onboarding completed and intern activated successfully',
    data: result,
  });
});

module.exports = {
  submitOnboardingInfo,
  submitOnboardingDocument,
  getRequiredDocuments,
  assignSupervisorOnboarding,
  completeOnboarding,
};
