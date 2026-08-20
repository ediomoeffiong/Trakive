/**
 * @file AvatarUploadModal.jsx
 * @description Full-featured avatar upload modal with drag-and-drop, format validation,
 * simulated upload progress, preview, and remove actions.
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useProfileStore } from '../../store/useProfileStore';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const AvatarUploadModal = ({ onClose }) => {
  const { profile, uploadAvatar, removeAvatar, avatarProgress, uploadingAvatar } = useProfileStore();

  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(profile?.avatarUrl || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [removing, setRemoving] = useState(false);
  const inputRef = useRef(null);

  const validate = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only JPG, PNG, or WEBP images are supported.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'Image size must be 5 MB or less.';
    }
    return null;
  };

  const handleFile = (file) => {
    const error = validate(file);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError('');
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    []
  );

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await uploadAvatar(selectedFile);
      toast.success('Profile photo updated!');
      onClose();
    } catch {
      toast.error('Failed to upload photo. Please try again.');
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeAvatar();
      toast.success('Profile photo removed.');
      onClose();
    } catch {
      toast.error('Failed to remove photo.');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: '1.25rem',
          padding: '1.75rem',
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Update Profile Photo</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', marginTop: 2 }}>
              JPG, PNG, or WEBP · max 5 MB
            </p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <motion.div
            key={preview}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid var(--color-primary-200)',
              background: 'var(--color-neutral-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              position: 'relative',
            }}
          >
            {preview ? (
              <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              '👤'
            )}
          </motion.div>
        </div>

        {/* Drop Zone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Drop zone for profile photo upload"
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--color-primary-400)' : 'var(--color-neutral-300)'}`,
            borderRadius: '0.875rem',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'var(--color-primary-50)' : 'var(--color-neutral-50)',
            transition: 'all 0.2s ease',
            marginBottom: '0.75rem',
          }}
        >
          <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🖼️</div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
            Drag & drop your photo here
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)', marginTop: 2 }}>
            or click to browse files
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            style={{ display: 'none' }}
            onChange={handleInputChange}
          />
        </div>

        {/* Crop placeholder */}
        <div
          style={{
            background: 'var(--color-neutral-50)',
            border: '1px solid var(--color-neutral-200)',
            borderRadius: '0.625rem',
            padding: '0.625rem 0.875rem',
            fontSize: '0.8rem',
            color: 'var(--color-neutral-500)',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>✂️</span>
          <span>Image cropping tools will be available after upload.</span>
        </div>

        {/* Validation error */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'var(--color-danger-50)',
                border: '1px solid var(--color-danger-100)',
                borderRadius: '0.625rem',
                padding: '0.625rem 0.875rem',
                fontSize: '0.8125rem',
                color: 'var(--color-danger-700)',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              ⚠️ {validationError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Progress */}
        <AnimatePresence>
          {uploadingAvatar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ marginBottom: '0.75rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-600)' }}>Uploading…</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary-600)' }}>
                  {avatarProgress}%
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--color-neutral-200)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${avatarProgress}%` }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--color-primary-500), var(--color-primary-400))',
                    borderRadius: 99,
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          {profile?.avatarUrl && !uploadingAvatar && (
            <button
              className="btn btn-danger btn-sm"
              onClick={handleRemove}
              disabled={removing}
            >
              {removing ? 'Removing…' : '🗑 Remove'}
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={onClose} disabled={uploadingAvatar}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleUpload}
            disabled={!selectedFile || uploadingAvatar}
          >
            {uploadingAvatar ? `Uploading ${avatarProgress}%…` : 'Upload Photo'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AvatarUploadModal;
