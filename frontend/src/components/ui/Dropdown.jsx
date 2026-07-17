/**
 * @file Dropdown.jsx
 * @description Click-triggered dropdown menu with click-outside detection.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Divider from './Divider';

/**
 * @param {object}   props
 * @param {React.ReactNode} props.trigger                    Clickable element
 * @param {Array<{id: string|number, label: string, icon?: React.ReactNode, onClick?: function, divider?: boolean}>} props.items
 * @param {'left'|'right'} [props.align='left']             Panel alignment
 * @param {string}   [props.className]                       Extra class names
 */
const Dropdown = ({
  trigger,
  items = [],
  align = 'left',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: 'relative', display: 'inline-flex' }}
    >
      {/* Trigger */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{ cursor: 'pointer', display: 'inline-flex' }}
      >
        {trigger}
      </div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown-panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              [align === 'right' ? 'right' : 'left']: 0,
              minWidth: 180,
              background: '#fff',
              borderRadius: '0.75rem',
              boxShadow: 'var(--shadow-card-hover)',
              border: '1px solid var(--color-neutral-100)',
              zIndex: 2000,
              overflow: 'hidden',
              padding: '0.375rem 0',
            }}
            role="menu"
          >
            {items.map((item, idx) => {
              if (item.divider) {
                return (
                  <div key={`div-${idx}`} style={{ padding: '0.375rem 0' }}>
                    <Divider />
                  </div>
                );
              }

              return (
                <button
                  key={item.id ?? idx}
                  role="menuitem"
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    width: '100%',
                    padding: '0.5625rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: 'var(--color-neutral-700)',
                    textAlign: 'left',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = 'var(--color-neutral-50)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  {item.icon && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--color-neutral-500)',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
