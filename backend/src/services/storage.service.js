const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Storage Abstraction Layer for Trakive Document & Media Files
 */
const StorageService = {
  /**
   * Store a file or file content reference
   * @param {Object} params
   * @param {Buffer|string} [params.buffer]
   * @param {string} params.filename
   * @param {string} [params.mimeType='application/octet-stream']
   * @param {number} [params.size=0]
   * @returns {Promise<{ storageKey: string, filePath: string, fileSize: number, mimeType: string }>}
   */
  async uploadFile({ buffer, filename, mimeType = 'application/octet-stream', size = 0 }) {
    const ext = path.extname(filename) || '';
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const storageKey = `documents/${uniqueName}`;
    const destinationPath = path.join(UPLOAD_DIR, uniqueName);

    let fileSize = size;

    if (buffer) {
      const dataBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
      await fs.promises.writeFile(destinationPath, dataBuffer);
      fileSize = dataBuffer.length;
    } else {
      // Store placeholder file metadata if binary buffer is not directly passed
      const dummyContent = Buffer.from(`Document storage key: ${storageKey}`);
      await fs.promises.writeFile(destinationPath, dummyContent);
      if (!fileSize) fileSize = dummyContent.length;
    }

    return {
      storageKey,
      filePath: destinationPath,
      fileSize,
      mimeType,
    };
  },

  /**
   * Retrieve file content or metadata by storage key
   * @param {string} storageKey 
   */
  async getFile(storageKey) {
    const filename = path.basename(storageKey);
    const filePath = path.join(UPLOAD_DIR, filename);

    if (fs.existsSync(filePath)) {
      const buffer = await fs.promises.readFile(filePath);
      return { filePath, buffer, exists: true };
    }

    return { filePath, buffer: null, exists: false };
  },

  /**
   * Generate access/download URL for document
   * @param {string} documentId 
   * @returns {string}
   */
  getDownloadUrl(documentId) {
    return `/api/v1/documents/${documentId}/download`;
  },

  /**
   * Delete file from storage
   * @param {string} storageKey 
   */
  async deleteFile(storageKey) {
    const filename = path.basename(storageKey);
    const filePath = path.join(UPLOAD_DIR, filename);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath).catch(() => {});
      return true;
    }
    return false;
  },
};

module.exports = StorageService;
