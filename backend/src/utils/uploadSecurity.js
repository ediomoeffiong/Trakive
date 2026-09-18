const path = require('path');
const ApiError = require('./apiError');

const DOCUMENT_FILE_SIZE_LIMIT = 10 * 1024 * 1024;

const DOCUMENT_UPLOAD_TYPES = Object.freeze({
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
});

const PDF_UPLOAD_TYPES = Object.freeze({
  'application/pdf': ['.pdf'],
});

function getExtension(fileName = '') {
  return path.extname(String(fileName)).toLowerCase();
}

function isAllowedUpload(file, allowedTypes = DOCUMENT_UPLOAD_TYPES) {
  if (!file) return false;
  const allowedExtensions = allowedTypes[file.mimetype];
  return Boolean(allowedExtensions && allowedExtensions.includes(getExtension(file.originalname)));
}

function createUploadFileFilter(allowedTypes = DOCUMENT_UPLOAD_TYPES) {
  return (req, file, cb) => {
    if (isAllowedUpload(file, allowedTypes)) {
      cb(null, true);
      return;
    }

    cb(ApiError.badRequest(formatAllowedUploadMessage(allowedTypes)));
  };
}

function formatAllowedUploadMessage(allowedTypes) {
  const allowedLabels = [...new Set(Object.values(allowedTypes).flat())]
    .map((ext) => ext.replace('.', '').toUpperCase())
    .join(', ');
  return `Unsupported file type. Upload ${allowedLabels} files only.`;
}

function hasAllowedSignature(file) {
  if (!file?.buffer || file.buffer.length < 4) return false;

  if (file.mimetype === 'application/pdf') {
    return file.buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  }

  if (file.mimetype === 'image/png') {
    return file.buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (file.mimetype === 'image/jpeg') {
    return file.buffer[0] === 0xff && file.buffer[1] === 0xd8 && file.buffer[2] === 0xff;
  }

  return false;
}

function assertSafeUpload(file, allowedTypes = DOCUMENT_UPLOAD_TYPES) {
  if (!file) throw ApiError.badRequest('A file is required');
  if (file.size > DOCUMENT_FILE_SIZE_LIMIT) throw ApiError.badRequest('File size must not exceed 10 MB');
  if (!isAllowedUpload(file, allowedTypes)) {
    throw ApiError.badRequest(formatAllowedUploadMessage(allowedTypes));
  }
  if (!hasAllowedSignature(file)) {
    throw ApiError.badRequest('Uploaded file content does not match its file type.');
  }
}

module.exports = {
  DOCUMENT_FILE_SIZE_LIMIT,
  DOCUMENT_UPLOAD_TYPES,
  PDF_UPLOAD_TYPES,
  createUploadFileFilter,
  assertSafeUpload,
};
