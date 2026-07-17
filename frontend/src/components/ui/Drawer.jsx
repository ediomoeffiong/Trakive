/**
 * @file Drawer.jsx
 * @description Slide-in drawer panel from left or right with animated backdrop.
 */

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine } from 'react-icons/ri';

/**
 * @param {object}          props
 * @param {boolean}         props.isOpen         Controls visibility
 * @param {function}        props.onClose        Called when drawer should close
 * @param {string}          [props.title]        Drawer header title
 * @param {React.ReactNode} props.children       Drawer body content
 * @param {'left'|'right'}  [props.side='right'] Which edge to slide from
 * @param {string|number}   [props.width='400px'] Panel width
 * @param {React.ReactNode} [props.footer]       Footer slot
 * @param {string}          [props.className]    Extra class for panel
 */
const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  width = '400px',
  footer,
  className = '',
}) => {
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

  const initialX = side === 'right' ? '100%' : '-100%';

  const portal = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
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

          {/* Drawer panel */}
          <motion.div
            key="drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: initialX }}
            animate={{ x: 0 }}
            exit={{ x: initialX }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className={className}
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              [side]: 0,
              width,
              maxWidth: '100vw',
              background: '#fff',
              boxShadow: 'var(--shadow-card-hover)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
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
              <button
                onClick={onClose}
                aria-label="Close drawer"
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
            </div>

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
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(portal, document.body);
};

export default Drawer;
