/**
 * @file TaskBulkActionToolbar.jsx
 * @description Contextual floating bulk action toolbar that appears when tasks are selected.
 * Uses AnimatePresence for slide-up entry/exit animation consistent with existing Trakive animations.
 */

import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiUserAddLine,
  RiExchangeLine,
  RiFileCopyLine,
  RiArchiveLine,
  RiDeleteBin6Line,
  RiDownloadLine,
  RiCloseLine,
} from 'react-icons/ri';

const BULK_ACTIONS = [
  { id: 'assign',         label: 'Assign',         icon: RiUserAddLine,    color: '#a5b4fc' },
  { id: 'status',         label: 'Change Status',  icon: RiExchangeLine,   color: '#6ee7b7' },
  { id: 'duplicate',      label: 'Duplicate',      icon: RiFileCopyLine,   color: '#fcd34d' },
  { id: 'archive',        label: 'Archive',        icon: RiArchiveLine,    color: '#94a3b8' },
  { id: 'delete',         label: 'Delete',         icon: RiDeleteBin6Line, color: '#fca5a5' },
  { id: 'export',         label: 'Export',         icon: RiDownloadLine,   color: '#c4b5fd' },
];

const TaskBulkActionToolbar = ({
  selectedCount = 0,
  onClear,
  onAction,
}) => {
  const handleAction = (actionId) => {
    if (!onAction) {
      toast.success(`${actionId} action triggered for ${selectedCount} task(s)`);
      return;
    }
    onAction(actionId);
  };

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 48 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            background: 'linear-gradient(135deg, #1e293b 0%, #1e1b4b 100%)',
            borderRadius: '1rem',
            padding: '0.875rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 16px 48px rgba(30, 27, 75, 0.4)',
            flexWrap: 'wrap',
            maxWidth: '90vw',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          }}
          role="toolbar"
          aria-label="Bulk action toolbar"
        >
          {/* Count badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#c7d2fe',
              fontSize: '0.875rem',
              fontWeight: 700,
              paddingRight: '0.875rem',
              borderRight: '1px solid rgba(255,255,255,0.12)',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#fff',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {selectedCount}
            </span>
            <span>selected</span>
          </div>

          {/* Action buttons */}
          {BULK_ACTIONS.map(({ id, label, icon: Icon, color }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.14)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAction(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.875rem',
                borderRadius: '0.625rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color,
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon style={{ fontSize: '0.9375rem', flexShrink: 0 }} />
              <span className="hide-xs">{label}</span>
            </motion.button>
          ))}

          {/* Clear */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClear}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '0.5rem',
              width: '32px',
              height: '32px',
              color: '#94a3b8',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title="Clear selection"
            aria-label="Clear selection"
          >
            <RiCloseLine style={{ fontSize: '1rem' }} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskBulkActionToolbar;
