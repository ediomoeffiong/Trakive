const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const ReviewService = require('../services/review.service');

const listReviews = asyncHandler(async (req, res) => {
  const result = await ReviewService.listInternReviews(req.user);
  return sendSuccess(res, {
    message: 'Reviews retrieved successfully',
    data: result,
  });
});

const listSupervisorReviewHistory = asyncHandler(async (req, res) => {
  const result = await ReviewService.listSupervisorReviewHistory(req.user);
  return sendSuccess(res, {
    message: 'Supervisor review history retrieved successfully',
    data: result,
  });
});

const getReviewById = asyncHandler(async (req, res) => {
  const result = await ReviewService.getInternReviewById(req.params.reviewId, req.user);
  return sendSuccess(res, {
    message: 'Review details retrieved successfully',
    data: result,
  });
});

const getPerformanceTrends = asyncHandler(async (req, res) => {
  const result = await ReviewService.getPerformanceTrends(req.user);
  return sendSuccess(res, {
    message: 'Performance trends retrieved successfully',
    data: result,
  });
});

const getDevelopmentGoals = asyncHandler(async (req, res) => {
  const result = await ReviewService.getDevelopmentGoals(req.user);
  return sendSuccess(res, {
    message: 'Development goals retrieved successfully',
    data: result,
  });
});

const submitSelfAssessment = asyncHandler(async (req, res) => {
  const result = await ReviewService.submitSelfAssessment(req.params.reviewId, req.body, req.user);
  return sendSuccess(res, {
    message: 'Self assessment submitted successfully',
    data: result,
  });
});

module.exports = {
  listReviews,
  listSupervisorReviewHistory,
  getReviewById,
  getPerformanceTrends,
  getDevelopmentGoals,
  submitSelfAssessment,
};
