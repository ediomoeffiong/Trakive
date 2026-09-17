const express = require('express');
const multer = require('multer');
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { searchQuerySchema } = require('../../utils/search.validator');
const SearchController = require('../../controllers/search.controller');
const DocumentController = require('../../controllers/document.controller');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/upload', authenticate, upload.single('file'), DocumentController.uploadDocument);
router.get('/:documentId/download', authenticate, DocumentController.getDownloadUrl);
router.delete('/:documentId', authenticate, DocumentController.deleteDocument);
router.get('/', authenticate, validate({ query: searchQuerySchema }), SearchController.searchDocuments);

module.exports = router;
