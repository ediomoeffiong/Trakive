const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const DocumentService = require('../services/document.service');

const DocumentController = {
  createDocument: asyncHandler(async (req, res) => {
    const document = await DocumentService.createDocument(req.body, req.user, req.ip, req.get('user-agent'));
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Document registered successfully',
      data: document,
    });
  }),

  listDocuments: asyncHandler(async (req, res) => {
    const result = await DocumentService.listDocuments(req.query, req.user);
    return sendSuccess(res, {
      message: 'Documents fetched successfully',
      data: result.items,
      meta: result.pagination,
    });
  }),

  getDocument: asyncHandler(async (req, res) => {
    const document = await DocumentService.getDocument(req.params.id, req.user);
    return sendSuccess(res, {
      message: 'Document details fetched successfully',
      data: document,
    });
  }),

  updateDocument: asyncHandler(async (req, res) => {
    const document = await DocumentService.updateDocument(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      message: 'Document metadata updated successfully',
      data: document,
    });
  }),

  deleteDocument: asyncHandler(async (req, res) => {
    const result = await DocumentService.deleteDocument(req.params.id, req.user);
    return sendSuccess(res, {
      message: result.message,
    });
  }),

  downloadDocument: asyncHandler(async (req, res) => {
    const { document, buffer, fileName, mimeType } = await DocumentService.downloadDocument(req.params.id, req.user);
    
    res.setHeader('Content-Type', mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    if (buffer) {
      return res.send(buffer);
    }

    return sendSuccess(res, {
      message: 'Document metadata reference ready for download',
      data: {
        id: document.id,
        file_name: document.file_name,
        file_path: document.file_path,
        mime_type: document.mime_type,
        file_size: document.file_size,
      },
    });
  }),
};

module.exports = DocumentController;
