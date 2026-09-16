const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const ReviewController = require('../../controllers/review.controller');

const router = express.Router();

router.get('/', authenticate, requireRole('intern'), ReviewController.listReviews);
router.get('/performance-trends', authenticate, requireRole('intern'), ReviewController.getPerformanceTrends);
router.get('/development-goals', authenticate, requireRole('intern'), ReviewController.getDevelopmentGoals);
router.get('/:reviewId', authenticate, requireRole('intern'), ReviewController.getReviewById);
router.post('/:reviewId/self-assessment', authenticate, requireRole('intern'), ReviewController.submitSelfAssessment);

module.exports = router;
