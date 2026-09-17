const path = require('path');
const config = require('../config/env');
const ApiError = require('../utils/apiError');

const SAFE_SEGMENT = /[^a-zA-Z0-9._-]+/g;

function assertConfigured() {
  if (!config.supabase.url || !config.supabase.serviceRoleKey) {
    throw ApiError.internal('Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
}

function storageBaseUrl() {
  return `${config.supabase.url.replace(/\/$/, '')}/storage/v1`;
}

function storageHeaders(extra = {}) {
  return {
    apikey: config.supabase.serviceRoleKey,
    Authorization: `Bearer ${config.supabase.serviceRoleKey}`,
    ...extra,
  };
}

function sanitizeSegment(value, fallback = 'file') {
  const cleaned = String(value || fallback).trim().replace(SAFE_SEGMENT, '-').replace(/^-+|-+$/g, '');
  return cleaned || fallback;
}

function buildObjectPath({ organizationId, ownerId, category, originalName }) {
  const parsed = path.parse(originalName || 'document');
  const ext = sanitizeSegment(parsed.ext || '', '').toLowerCase();
  const base = sanitizeSegment(parsed.name || 'document');
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return [
    sanitizeSegment(organizationId, 'org'),
    sanitizeSegment(ownerId, 'owner'),
    sanitizeSegment(category, 'general'),
    `${stamp}-${base}${ext}`,
  ].join('/');
}

const StorageService = {
  buildObjectPath,

  async uploadBuffer({ buffer, mimeType, objectPath, upsert = false }) {
    assertConfigured();
    const response = await fetch(
      `${storageBaseUrl()}/object/${encodeURIComponent(config.supabase.storageBucket)}/${objectPath}`,
      {
        method: 'POST',
        headers: storageHeaders({
          'Content-Type': mimeType || 'application/octet-stream',
          'x-upsert': upsert ? 'true' : 'false',
        }),
        body: buffer,
      }
    );

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw ApiError.internal(`Supabase Storage upload failed: ${text || response.statusText}`);
    }

    return {
      bucket: config.supabase.storageBucket,
      path: objectPath,
    };
  },

  async createSignedUrl(objectPath, expiresIn = config.supabase.signedUrlExpiresIn) {
    assertConfigured();
    const response = await fetch(
      `${storageBaseUrl()}/object/sign/${encodeURIComponent(config.supabase.storageBucket)}/${objectPath}`,
      {
        method: 'POST',
        headers: storageHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ expiresIn }),
      }
    );

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw ApiError.internal(`Supabase Storage signed URL failed: ${text || response.statusText}`);
    }

    const payload = await response.json();
    const signedPath = payload.signedURL || payload.signedUrl || payload.url;
    if (!signedPath) throw ApiError.internal('Supabase Storage did not return a signed URL');

    return signedPath.startsWith('http')
      ? signedPath
      : `${storageBaseUrl()}${signedPath}`;
  },

  async removeObject(objectPath) {
    if (!objectPath) return;
    assertConfigured();
    const response = await fetch(
      `${storageBaseUrl()}/object/${encodeURIComponent(config.supabase.storageBucket)}`,
      {
        method: 'DELETE',
        headers: storageHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ prefixes: [objectPath] }),
      }
    );

    if (!response.ok && response.status !== 404) {
      const text = await response.text().catch(() => '');
      throw ApiError.internal(`Supabase Storage delete failed: ${text || response.statusText}`);
    }
  },
};

module.exports = StorageService;
