/**
 * @file Alert.jsx
 * @description Inline status alert component for Trakive.
 * Variants: info | success | warning | error
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiInformationLine, RiCheckboxCircleLine, RiErrorWarningLine, RiCloseCircleLine, RiCloseLine } from 'react-icons/ri';

const VARIANT_STYLES = {
  info: {
    bg: 'var(--color-primary-50)',
    border: 'var(--color-primary-200)',
    strip: 'var(--color-primary-600)',
    icon: RiInformationLine,
    iconColor: 'var(--color-primary-600)',
    titleColor: 'var(--color-primary-800)',
    textColor: 'var(--color-primary-700)',
  },
  success: {
    bg: 'var(--color-success-50)',
    border: 'var(--color-success-100)',
    strip: 'var(--color-success-500)',
    icon: RiCheckboxCircleLine,
    iconColor: 'var(--color-success-600)',
    titleColor: 'var(--color-success-700)',
    textColor: 'var(--color-success-600)',
  },
  warning: {
    bg: 'var(--color-warning-50)',
    border: 'var(--color-warning-100)',
    strip: 'var(--color-warning-500)',
    icon: RiErrorWarningLine,
    iconColor: 'var(--color-warning-600)',
    titleColor: 'var(--color-warning-700)',
    textColor: 'var(--color-warning-600)',
  },
  error: {
    bg: 'var(--color-danger-50)',
    border: 'var(--color-danger-100)',
    strip: 'var(--color-danger-500)',
    icon: RiCloseCircleLine,
    iconColor: 'var(--color-danger-600)',
    titleColor: 'var(--color-danger-700)',
    textColor: 'var(--color-danger-600)',
  },
};

/**
 * @param {object} props
 * @param {'info'|'success'|'warning'|'error'} [props.variant='info']
 * @param {string}  [props.title]
 * @param {Function} [props.onClose]  If provided, renders a dismiss button
 * @param {React.ReactNode} [props.icon]  Override the default icon
 * @param {string}  [props.className]
 * @param {React.ReactNode} props.children  Alert message body
 */
const Alert = ({ variant = 'info', title, children, onClose, icon, className = '' }) => {
  const [visible, setVisible] = useState(true);
  const s = VARIANT_STYLES[variant] ?? VARIANT_STYLES.info;
  const Icon = icon ? null : s.icon;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.2 }}
          role="alert"
          className={className}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            background: s.bg,
            border: `1px solid ${s.border}`,
            borderLeft: `4px solid ${s.strip}`,
            borderRadius: '0.75rem',
            padding: '0.875rem 1rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Icon */}
          <span style={{ color: s.iconColor, fontSize: '1.125rem', flexShrink: 0, marginTop: '1px' }}>
            {icon || (Icon && <Icon aria-hidden />)}
          </span>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: s.titleColor, marginBottom: children ? '0.25rem' : 0 }}>
                {title}
              </p>
            )}
            {children && (
              <p style={{ fontSize: '0.875rem', color: s.textColor, margin: 0, lineHeight: 1.5 }}>
                {children}
              </p>
            )}
          </div>

          {/* Dismiss */}
          {onClose && (
            <button
              onClick={handleClose}
              aria-label="Dismiss alert"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: s.iconColor,
                fontSize: '1rem',
                padding: '0.125rem',
                borderRadius: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <RiCloseLine />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;
