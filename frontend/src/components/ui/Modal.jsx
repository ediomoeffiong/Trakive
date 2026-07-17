/**
 * @file Modal.jsx
 * @description Accessible modal dialog with portal, backdrop blur, and scale animation.
 */

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine } from 'react-icons/ri';

const SIZE_MAP = {
  sm: '400px',
  md: '560px',
  lg: '720px',
  xl: '900px',
  full: '95vw',
};

/**
 * @param {object}        props
 * @param {boolean}       props.isOpen          Controls visibility
 * @param {function}      props.onClose         Called when modal should close
 * @param {string}        [props.title]         Dialog title
 * @param {React.ReactNode} props.children      Modal body content
 * @param {'sm'|'md'|'lg'|'xl'|'full'} [props.size='md']  Max width preset
 * @param {boolean}       [props.hideCloseBtn]  Hides the X button
 * @param {React.ReactNode} [props.footer]      Footer slot
 * @param {string}        [props.className]     Extra class for dialog panel
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  hideCloseBtn = false,
  footer,
  className = '',
}) => {
  const titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`;

  // Escape key closes modal
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const maxWidth = SIZE_MAP[size] ?? SIZE_MAP.md;

  const portal = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 1000,
            }}
          />

          {/* Dialog panel */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={className}
              style={{
                pointerEvents: 'auto',
                background: '#fff',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card-hover)',
                width: '100%',
                maxWidth,
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              {(title || !hideCloseBtn) && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--color-neutral-100)',
                    flexShrink: 0,
                  }}
                >
                  {title && (
                    <h2
                      id={titleId}
                      style={{
                        margin: 0,
                        fontSize: '1.0625rem',
                        fontWeight: 600,
                        color: 'var(--color-neutral-800)',
                      }}
                    >
                      {title}
                    </h2>
                  )}
                  {!hideCloseBtn && (
                    <button
                      onClick={onClose}
                      aria-label="Close dialog"
                      style={{
                        marginLeft: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '0.375rem',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--color-neutral-500)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'var(--color-neutral-100)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = 'transparent')
                      }
                    >
                      <RiCloseLine size={20} />
                    </button>
                  )}
                </div>
              )}

              {/* Body */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.5rem',
                }}
              >
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div
                  style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--color-neutral-100)',
                    flexShrink: 0,
                  }}
                >
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(portal, document.body);
};

export default Modal;
