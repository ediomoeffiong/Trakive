/**
 * @file FAQSection.jsx
 * @description Animated FAQ accordion section for the landing page.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiAddLine } from 'react-icons/ri';
import { faqs } from '../../data/faqs';

const FAQSection = () => {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section
      id="faq"
      style={{
        background: '#ffffff',
        padding: 'clamp(3.5rem, 8vw, 5.5rem) 1.5rem',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h2 style={{
            fontSize: 'clamp(1.625rem, 4vw, 2.375rem)',
            fontWeight: 800,
            color: 'var(--color-neutral-900)',
            letterSpacing: '-0.02em',
            marginBottom: '0.75rem',
            margin: '0 0 0.75rem',
          }}>
            Frequently asked questions
          </h2>
          <p style={{
            fontSize: '1.0625rem',
            color: 'var(--color-neutral-600)',
            margin: 0,
            lineHeight: 1.7,
          }}>
            Still have questions? We have answers.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          id="faq-accordion"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        >
          {faqs.map((faq, idx) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                style={{
                  borderBottom: idx < faqs.length - 1 ? '1px solid var(--color-neutral-200)' : 'none',
                }}
              >
                <button
                  id={`faq-q-${faq.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${faq.id}`}
                  onClick={() => toggle(faq.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    padding: '1.375rem 0',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{
                    fontSize: '1.0625rem',
                    fontWeight: 600,
                    color: isOpen ? 'var(--color-primary-600)' : 'var(--color-neutral-900)',
                    lineHeight: 1.4,
                    transition: 'color 0.15s ease',
                  }}>
                    {faq.question}
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

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-a-${faq.id}`}
                      role="region"
                      aria-labelledby={`faq-q-${faq.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p style={{
                        fontSize: '0.9375rem',
                        color: 'var(--color-neutral-600)',
                        lineHeight: 1.75,
                        paddingBottom: '1.375rem',
                        margin: 0,
                      }}>
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
