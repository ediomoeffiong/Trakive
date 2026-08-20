/**
 * @file UnsavedChangesBar.jsx
 * @description Sticky bottom bar that appears when there are unsaved settings changes.
 * Provides Save and Discard buttons. Animates in/out with Framer Motion.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { RiSaveLine, RiCloseLine } from 'react-icons/ri';

/**
 * @param {object}   props
 * @param {boolean}  props.isDirty   - Whether there are unsaved changes
 * @param {boolean}  props.saving    - Whether save is in progress
 * @param {function} props.onSave    - Save handler
 * @param {function} props.onDiscard - Discard handler
 */
const UnsavedChangesBar = ({ isDirty, saving, onSave, onDiscard }) => (
  <AnimatePresence>
    {isDirty && (
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0,  opacity: 1 }}
        exit={{    y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          position:     'fixed',
          bottom:       '1.5rem',
          left:         '50%',
          transform:    'translateX(-50%)',
          zIndex:       50,
          display:      'flex',
          alignItems:   'center',
          gap:          '0.75rem',
          background:   'var(--color-neutral-900)',
          color:        'var(--color-neutral-50)',
          borderRadius: '1rem',
          padding:      '0.75rem 1.25rem',
          boxShadow:    '0 8px 30px rgb(0 0 0 / 0.25)',
          backdropFilter: 'blur(8px)',
          whiteSpace:   'nowrap',
        }}
        role="status"
        aria-live="polite"
      >
        <span style={{ fontSize: '0.8125rem', fontWeight: 500, opacity: 0.8 }}>
          You have unsaved changes
        </span>

        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
          {/* Discard */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onDiscard}
            disabled={saving}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '0.375rem',
              padding:      '0.4375rem 0.875rem',
              borderRadius: '0.625rem',
              border:       '1.5px solid rgba(255,255,255,0.2)',
              background:   'transparent',
              color:        '#fff',
              fontSize:     '0.8125rem',
              fontWeight:   600,
              cursor:       saving ? 'not-allowed' : 'pointer',
              opacity:      saving ? 0.5 : 1,
            }}
          >
            <RiCloseLine style={{ fontSize: '1rem' }} />
            Discard
          </motion.button>

          {/* Save */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onSave}
            disabled={saving}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '0.375rem',
              padding:      '0.4375rem 0.875rem',
              borderRadius: '0.625rem',
              border:       'none',
              background:   'var(--color-primary-600)',
              color:        '#fff',
              fontSize:     '0.8125rem',
              fontWeight:   600,
              cursor:       saving ? 'not-allowed' : 'pointer',
              opacity:      saving ? 0.7 : 1,
              boxShadow:    '0 2px 8px rgb(37 99 235 / 0.4)',
            }}
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin"
                  width="14" height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <RiSaveLine style={{ fontSize: '1rem' }} />
                Save changes
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default UnsavedChangesBar;
