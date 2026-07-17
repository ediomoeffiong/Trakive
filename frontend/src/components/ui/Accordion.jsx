/**
 * @file Accordion.jsx
 * @description Animated accordion component used for FAQ and collapsible content.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiAddLine, RiSubtractLine } from 'react-icons/ri';

/**
 * @param {object}  props
 * @param {Array<{id: string|number, question: string, answer: string}>} props.items
 * @param {boolean} [props.allowMultiple=false]  Allow multiple items open simultaneously
 * @param {string}  [props.className]
 */
const Accordion = ({ items = [], allowMultiple = false, className = '' }) => {
  const [openIds, setOpenIds] = useState([]);

  const toggle = (id) => {
    setOpenIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return allowMultiple ? [...prev, id] : [id];
    });
  };

  return (
    <div
      className={className}
      style={{ width: '100%' }}
      role="list"
    >
      {items.map((item, idx) => {
        const isOpen = openIds.includes(item.id);
        const headingId = `accordion-heading-${item.id}`;
        const panelId   = `accordion-panel-${item.id}`;

        return (
          <div
            key={item.id}
            role="listitem"
            style={{
              borderBottom: idx < items.length - 1 ? '1px solid var(--color-neutral-200)' : 'none',
            }}
          >
            {/* Header button */}
            <button
              id={headingId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '1.25rem 0',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: isOpen ? 'var(--color-primary-600)' : 'var(--color-neutral-900)',
                  lineHeight: 1.4,
                  transition: 'color 0.15s ease',
                }}
              >
                {item.question}
              </span>

              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  flexShrink: 0,
                  color: isOpen ? 'var(--color-primary-600)' : 'var(--color-neutral-400)',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <RiAddLine aria-hidden />
              </motion.span>
            </button>

            {/* Collapsible body */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={headingId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      color: 'var(--color-neutral-600)',
                      lineHeight: 1.7,
                      paddingBottom: '1.25rem',
                      margin: 0,
                    }}
                  >
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
