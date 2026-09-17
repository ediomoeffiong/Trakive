const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const DocumentService = require('../services/document.service');

const uploadDocument = asyncHandler(async (req, res) => {
  const document = await DocumentService.uploadDocument(req.file, req.body, req.user);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Document uploaded successfully',
    data: document,
  });
});

const getDownloadUrl = asyncHandler(async (req, res) => {
  const result = await DocumentService.getSignedDownload(req.params.documentId, req.user);
  return sendSuccess(res, {
    message: 'Document download URL generated successfully',
    data: result,
  });
});

const deleteDocument = asyncHandler(async (req, res) => {
  const document = await DocumentService.deleteDocument(req.params.documentId, req.user);
  return sendSuccess(res, {
    message: 'Document deleted successfully',
    data: document,
  });
});

module.exports = {
  uploadDocument,
  getDownloadUrl,
  deleteDocument,
};
