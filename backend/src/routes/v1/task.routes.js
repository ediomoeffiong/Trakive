const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { searchQuerySchema } = require('../../utils/search.validator');
const TaskController = require('../../controllers/task.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', validate({ query: searchQuerySchema }), TaskController.getTasks);
router.get('/:id', TaskController.getTaskById);
router.post('/', TaskController.createTask);
router.patch('/:id/status', TaskController.updateTaskStatus);
router.patch('/:id', TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

module.exports = router;
