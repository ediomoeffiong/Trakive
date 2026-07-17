/**
 * @file Tooltip.jsx
 * @description Hover tooltip that appears after a configurable delay.
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const POSITION_STYLES = {
  top: {
    bottom: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  bottom: {
    top: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  left: {
    right: 'calc(100% + 8px)',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  right: {
    left: 'calc(100% + 8px)',
    top: '50%',
    transform: 'translateY(-50%)',
  },
};

const ARROW_STYLES = {
  top: {
    bottom: '-4px',
    left: '50%',
    transform: 'translateX(-50%) rotate(45deg)',
  },
  bottom: {
    top: '-4px',
    left: '50%',
    transform: 'translateX(-50%) rotate(45deg)',
  },
  left: {
    right: '-4px',
    top: '50%',
    transform: 'translateY(-50%) rotate(45deg)',
  },
  right: {
    left: '-4px',
    top: '50%',
    transform: 'translateY(-50%) rotate(45deg)',
  },
};

/**
 * @param {object}                      props
 * @param {React.ReactNode}             props.content            Tooltip content text
 * @param {React.ReactNode}             props.children           Target element
 * @param {'top'|'bottom'|'left'|'right'} [props.position='top'] Tooltip placement
 * @param {number}                      [props.delay=300]        Hover delay in ms
 */
const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 300,
}) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      <AnimatePresence>
        {visible && (
          <motion.span
            key="tooltip"
            role="tooltip"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              ...POSITION_STYLES[position],
              background: 'var(--color-neutral-900)',
              color: '#fff',
              fontSize: '0.75rem',
              lineHeight: 1.5,
              padding: '0.375rem 0.625rem',
              borderRadius: '0.5rem',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          >
            {content}
            {/* Arrow caret */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: 8,
                height: 8,
                background: 'var(--color-neutral-900)',
                ...ARROW_STYLES[position],
              }}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

export default Tooltip;
