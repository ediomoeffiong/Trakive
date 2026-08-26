const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const DocumentController = require('../../controllers/document.controller');

const router = express.Router();

router.use(authenticate);

router.post('/', DocumentController.createDocument);
router.get('/', DocumentController.listDocuments);
router.get('/:id', DocumentController.getDocument);
router.put('/:id', DocumentController.updateDocument);
router.patch('/:id', DocumentController.updateDocument);
router.delete('/:id', DocumentController.deleteDocument);
router.get('/:id/download', DocumentController.downloadDocument);

module.exports = router;
