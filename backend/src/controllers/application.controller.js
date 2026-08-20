const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const OnboardingService = require('../services/onboarding.service');

const createApplication = asyncHandler(async (req, res) => {
  const result = await OnboardingService.createApplication(req.body, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Internship application submitted successfully',
    data: result,
  });
});

const getApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await OnboardingService.getApplication(id, req.user);
  return sendSuccess(res, {
    message: 'Application details retrieved successfully',
    data: result,
  });
});

const listApplications = asyncHandler(async (req, res) => {
  const result = await OnboardingService.listApplications(req.query, req.user);
  return sendSuccess(res, {
    message: 'Applications retrieved successfully',
    data: result.items,
    meta: result.pagination,
  });
});

const reviewApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const result = await OnboardingService.reviewApplication(id, { status, notes }, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: `Application status updated to ${status} successfully`,
    data: result,
  });
});

const createInternAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await OnboardingService.createOrLinkInternAccount(id, req.body, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Intern account created/linked successfully',
    data: result,
  });
});

module.exports = {
  createApplication,
  getApplication,
  listApplications,
  reviewApplication,
  createInternAccount,
};
