const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  submitTaskSchema,
  reviewTaskSchema,
  createCommentSchema,
  listTasksQuerySchema,
} = require('../../utils/task.validator');
const {
  createTask,
  getTask,
  listTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
  submitTask,
  getTaskSubmissions,
  reviewTask,
  getTaskReviews,
  addComment,
  getTaskComments,
  getTaskActivity,
} = require('../../controllers/task.controller');

const router = express.Router();

// List and Create Tasks
router.get('/', authenticate, validate({ query: listTasksQuerySchema }), listTasks);
router.post('/', authenticate, requireRole('admin', 'hr', 'head', 'supervisor'), validate({ body: createTaskSchema }), createTask);

// Task Detail Operations
router.get('/:id', authenticate, getTask);
router.put('/:id', authenticate, requireRole('admin', 'hr', 'head', 'supervisor'), validate({ body: updateTaskSchema }), updateTask);
router.patch('/:id/status', authenticate, validate({ body: updateTaskStatusSchema }), updateTaskStatus);
router.delete('/:id', authenticate, requireRole('admin', 'hr', 'head', 'supervisor'), deleteTask);

// Submissions
router.post('/:id/submit', authenticate, requireRole('intern'), validate({ body: submitTaskSchema }), submitTask);
router.get('/:id/submissions', authenticate, getTaskSubmissions);

// Reviews & Feedback
router.post('/:id/review', authenticate, requireRole('admin', 'hr', 'head', 'supervisor'), validate({ body: reviewTaskSchema }), reviewTask);
router.get('/:id/reviews', authenticate, getTaskReviews);

// Comments
router.post('/:id/comments', authenticate, validate({ body: createCommentSchema }), addComment);
router.get('/:id/comments', authenticate, getTaskComments);

// Activity / History
router.get('/:id/activity', authenticate, getTaskActivity);
router.get('/:id/history', authenticate, getTaskActivity);

module.exports = router;
