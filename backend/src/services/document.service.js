const ApiError = require('../utils/apiError');
const DocumentModel = require('../models/document.model');
const ProfileModel = require('../models/profile.model');
const StorageService = require('./storage.service');

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

const TYPE_TO_CATEGORY = {
  'CV/Resume': 'resume',
  'ID Card': 'id_proof',
  'Offer Letter': 'agreement',
  'Training Certificate': 'general',
  'Academic Transcript': 'general',
  'Reference Letter': 'general',
  Other: 'general',
};

function normalizeRole(user) {
  return (user.role_name || '').toLowerCase();
}

function statusColor(status) {
  if (status === 'approved' || status === 'Verified' || status === 'Stored') return '#22c55e';
  if (status === 'rejected' || status === 'resubmission_required') return '#ef4444';
  return '#f59e0b';
}

function mapDocument(doc) {
  if (!doc) return null;
  const status = doc.review_status || 'pending';
  return {
    id: doc.id,
    name: doc.file_name,
    displayName: doc.title || doc.file_name,
    type: doc.category,
    category: doc.category,
    size: Number(doc.file_size || 0),
    mimeType: doc.mime_type,
    uploadedAt: doc.created_at,
    updatedAt: doc.updated_at,
    status: status === 'approved' ? 'Verified' : status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    statusColor: statusColor(status),
    filePath: doc.file_path,
    isPrivate: doc.is_private,
    ownerId: doc.owner_id,
  };
}

async function canAccessDocument(user, doc) {
  if (!doc) return false;
  const role = normalizeRole(user);
  if (doc.uploader_id === user.id || doc.owner_id === user.id) return true;
  if (['admin', 'super_admin', 'hr', 'head', 'department_head'].includes(role)) {
    return !user.organization_id || user.organization_id === doc.organization_id;
  }
  if (role === 'supervisor' && doc.owner_id) {
    const supProfile = await ProfileModel.findSupervisorProfileByUserId(user.id);
    const internProfile = await ProfileModel.findInternProfileByUserId(doc.owner_id);
    if (!supProfile || !internProfile) return false;
    if (internProfile.supervisor_id === supProfile.id) return true;
    return Boolean(
      !internProfile.supervisor_id &&
      (!internProfile.department_id || internProfile.department_id === supProfile.department_id)
    );
  }
  return false;
}

const DocumentService = {
  mapDocument,

  async uploadDocument(file, body, requestingUser) {
    if (!file) throw ApiError.badRequest('A file is required');
    if (file.size > MAX_FILE_SIZE) throw ApiError.badRequest('File size must not exceed 10 MB');
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw ApiError.badRequest('Only PDF, JPG, and PNG files are allowed');
    }
    if (!requestingUser.organization_id) {
      throw ApiError.badRequest('User must belong to an organization before uploading documents');
    }

    const ownerId = body.owner_id || requestingUser.id;
    if (ownerId !== requestingUser.id) {
      const role = normalizeRole(requestingUser);
      if (!['admin', 'super_admin', 'hr', 'head', 'department_head', 'supervisor'].includes(role)) {
        throw ApiError.forbidden('You cannot upload documents for another user');
      }
    }

    const docType = body.type || body.title || 'Other';
    const category = body.category || TYPE_TO_CATEGORY[docType] || 'general';
    const title = body.title || docType || file.originalname;
    const objectPath = StorageService.buildObjectPath({
      organizationId: requestingUser.organization_id,
      ownerId,
      category,
      originalName: file.originalname,
    });

    await StorageService.uploadBuffer({
      buffer: file.buffer,
      mimeType: file.mimetype,
      objectPath,
    });

    const doc = await DocumentModel.create({
      organization_id: requestingUser.organization_id,
      uploader_id: requestingUser.id,
      owner_id: ownerId,
      title,
      file_name: file.originalname,
      file_path: objectPath,
      file_size: file.size,
      mime_type: file.mimetype,
      category,
      is_private: body.is_private === 'false' ? false : true,
    });

    return mapDocument(doc);
  },

  async getSignedDownload(documentId, requestingUser) {
    const doc = await DocumentModel.findById(documentId);
    if (!doc) throw ApiError.notFound('Document not found');
    if (!(await canAccessDocument(requestingUser, doc))) {
      throw ApiError.forbidden('You do not have access to this document');
    }
    const url = await StorageService.createSignedUrl(doc.file_path);
    return {
      url,
      fileName: doc.file_name,
      mimeType: doc.mime_type,
      expiresIn: Number(process.env.SUPABASE_SIGNED_URL_EXPIRES_IN || 300),
    };
  },

  async deleteDocument(documentId, requestingUser) {
    const doc = await DocumentModel.findById(documentId);
    if (!doc) throw ApiError.notFound('Document not found');
    if (!(await canAccessDocument(requestingUser, doc))) {
      throw ApiError.forbidden('You do not have access to delete this document');
    }

    const deleted = await DocumentModel.softDelete(documentId, requestingUser.id);
    await StorageService.removeObject(doc.file_path);
    return mapDocument(deleted);
  },
};

module.exports = DocumentService;
