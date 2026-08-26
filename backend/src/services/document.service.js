const ApiError = require('../utils/apiError');
const DocumentModel = require('../models/document.model');
const UserModel = require('../models/user.model');
const ProfileModel = require('../models/profile.model');
const AuditLogModel = require('../models/auditLog.model');
const StorageService = require('./storage.service');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

const DocumentService = {
  async getEffectiveOrgId(requestingUser) {
    if (requestingUser.organization_id) return requestingUser.organization_id;
    const defaultOrgId = await ProfileModel.getOrCreateDefaultOrganization();
    await UserModel.update(requestingUser.id, { organization_id: defaultOrgId });
    return defaultOrgId;
  },

  async checkAccessPermission(document, requestingUser) {
    const role = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';

    if (['admin', 'super_admin', 'org_admin'].includes(role)) {
      return true;
    }

    if (document.uploader_id === requestingUser.id || document.owner_id === requestingUser.id) {
      return true;
    }

    if (role === 'hr') {
      return true;
    }

    if (role === 'supervisor') {
      const supProfile = await ProfileModel.findSupervisorProfileByUserId(requestingUser.id);
      if (supProfile && document.owner_id) {
        const internProfile = await ProfileModel.getCompleteInternProfile(document.owner_id);
        if (internProfile && (internProfile.supervisor_id === supProfile.id || !internProfile.supervisor_id)) {
          return true;
        }
      }
      if (!document.is_private) {
        return true;
      }
      return true;
    }

    if (role === 'head' || role === 'department_head') {
      if (!document.is_private) return true;
    }

    throw ApiError.forbidden('Access denied: You do not have permission to access this document');
  },

  async createDocument(data, requestingUser, ipAddress = null, userAgent = null) {
    const orgId = await this.getEffectiveOrgId(requestingUser);

    if (!data.title) {
      throw ApiError.badRequest('Document title is required');
    }

    let storageKey = data.file_path || data.storage_key || null;
    let fileSize = parseInt(data.file_size, 10) || 0;
    let mimeType = data.mime_type || 'application/octet-stream';
    let fileName = data.file_name || data.filename || `${data.title.toLowerCase().replace(/\s+/g, '_')}.dat`;

    if (!storageKey) {
      const uploaded = await StorageService.uploadFile({
        buffer: data.buffer || null,
        filename: fileName,
        mimeType,
        size: fileSize,
      });
      storageKey = uploaded.storageKey;
      fileSize = uploaded.fileSize;
      mimeType = uploaded.mimeType;
    }

    const document = await DocumentModel.create({
      organizationId: orgId,
      uploaderId: requestingUser.id,
      ownerId: data.owner_id || requestingUser.id,
      title: data.title,
      fileName,
      filePath: storageKey,
      fileSize,
      mimeType,
      category: data.category || 'general',
      isPrivate: data.is_private === true || data.is_private === 'true',
      entityType: data.entity_type || null,
      entityId: data.entity_id || null,
    });

    await AuditLogModel.log({
      organizationId: orgId,
      userId: requestingUser.id,
      action: 'DOCUMENT_UPLOAD',
      entityType: 'documents',
      entityId: document.id,
      details: { title: document.title, category: document.category },
      ipAddress,
      userAgent,
    });

    return document;
  },

  async listDocuments(query, requestingUser) {
    const { page, limit, offset } = getPaginationParams(query);
    const orgId = await this.getEffectiveOrgId(requestingUser);
    const role = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';

    const filter = {
      organizationId: orgId,
      category: query.category || null,
      entityType: query.entity_type || null,
      entityId: query.entity_id || null,
      search: query.search || query.query || null,
      limit,
      offset,
    };

    if (role === 'intern') {
      filter.ownerId = requestingUser.id;
    } else if (query.owner_id) {
      filter.ownerId = query.owner_id;
    }

    if (query.uploader_id) {
      filter.uploaderId = query.uploader_id;
    }

    const items = await DocumentModel.findDocuments(filter);
    const totalItems = await DocumentModel.countDocuments(filter);

    return formatPaginatedResponse(items, totalItems, page, limit);
  },

  async getDocument(id, requestingUser) {
    const document = await DocumentModel.findById(id);
    if (!document) {
      throw ApiError.notFound('Document not found');
    }

    await this.checkAccessPermission(document, requestingUser);

    return document;
  },

  async updateDocument(id, data, requestingUser) {
    const document = await DocumentModel.findById(id);
    if (!document) {
      throw ApiError.notFound('Document not found');
    }

    await this.checkAccessPermission(document, requestingUser);

    const updated = await DocumentModel.update(id, data);
    return updated;
  },

  async deleteDocument(id, requestingUser) {
    const document = await DocumentModel.findById(id);
    if (!document) {
      throw ApiError.notFound('Document not found');
    }

    await this.checkAccessPermission(document, requestingUser);

    await DocumentModel.softDelete(id);
    await StorageService.deleteFile(document.file_path);

    return { message: 'Document deleted successfully' };
  },

  async downloadDocument(id, requestingUser) {
    const document = await DocumentModel.findById(id);
    if (!document) {
      throw ApiError.notFound('Document not found');
    }

    await this.checkAccessPermission(document, requestingUser);

    const storageInfo = await StorageService.getFile(document.file_path);

    return {
      document,
      filePath: storageInfo.filePath,
      buffer: storageInfo.buffer,
      fileName: document.file_name,
      mimeType: document.mime_type,
    };
  },
};

module.exports = DocumentService;
