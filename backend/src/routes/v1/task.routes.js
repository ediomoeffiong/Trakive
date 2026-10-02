const express = require('express');
const multer = require('multer');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { searchQuerySchema } = require('../../utils/search.validator');
const TaskController = require('../../controllers/task.controller');
const {
  DOCUMENT_FILE_SIZE_LIMIT,
  TASK_DELIVERABLE_UPLOAD_TYPES,
  createUploadFileFilter,
} = require('../../utils/uploadSecurity');

const router = express.Router();
const deliverableUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: DOCUMENT_FILE_SIZE_LIMIT, files: 1 },
  fileFilter: createUploadFileFilter(TASK_DELIVERABLE_UPLOAD_TYPES),
});

router.use(authenticate);

router.get('/', validate({ query: searchQuerySchema }), TaskController.getTasks);
router.post('/:id/deliverables', deliverableUpload.single('file'), TaskController.submitDeliverable);
router.get('/:id', TaskController.getTaskById);
router.post('/', TaskController.createTask);
router.patch('/:id/status', TaskController.updateTaskStatus);
router.patch('/:id', TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

module.exports = router;
