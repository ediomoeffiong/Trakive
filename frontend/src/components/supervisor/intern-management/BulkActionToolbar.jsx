/**
 * @file BulkActionToolbar.jsx
 * @description Reusable bulk action toolbar that appears when one or more interns are selected.
 * Uses AnimatePresence for slide-up entry/exit animation, consistent with existing Trakive animations.
 */

import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  RiTaskLine,
  RiMegaphoneLine,
  RiDownloadLine,
  RiCalendarEventLine,
  RiCheckboxCircleLine,
  RiCloseLine,
} from 'react-icons/ri';
import { ROUTES } from '../../../constants';

const BulkActionToolbar = ({ selectedCount, onClear, selectedInterns }) => {
  const navigate = useNavigate();

  const handleAction = (action) => {
    switch (action) {
      case 'assign-task':
        toast.success(`Opening task assignment for ${selectedCount} intern(s)...`);
        navigate(`${ROUTES.SUPERVISOR_TASKS}?action=bulk-assign`);
        break;
      case 'announce':
        toast.success(`Opening announcement composer for ${selectedCount} intern(s)...`);
        navigate(`${ROUTES.SUPERVISOR_NOTIFICATIONS}?action=announce`);
        break;
      case 'export':
        toast.success(`Exporting data for ${selectedCount} intern(s)...`);
        break;
      case 'schedule-review':
        toast.success(`Scheduling reviews for ${selectedCount} intern(s)...`);
        navigate(`${ROUTES.SUPERVISOR_REVIEWS}?action=bulk-schedule`);
        break;
      case 'mark-active':
        toast.success(`Status updated to Active for ${selectedCount} intern(s).`);
        break;
      default:
        break;
    }
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
            background: 'linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)',
            borderRadius: '1rem',
            padding: '0.875rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 16px 48px rgba(30, 58, 138, 0.35)',
            flexWrap: 'wrap',
            maxWidth: '90vw',
          }}
          role="toolbar"
          aria-label="Bulk action toolbar"
        >
          {/* Selection count badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#c7d2fe',
              fontSize: '0.875rem',
              fontWeight: 700,
              paddingRight: '1rem',
              borderRight: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <span
              style={{
                background: '#4f46e5',
                color: '#fff',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
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
            selected
          </div>

          {/* Action buttons */}
          {[
            { id: 'assign-task', label: 'Assign Task', icon: RiTaskLine, color: '#a5b4fc' },
            { id: 'announce', label: 'Announce', icon: RiMegaphoneLine, color: '#fcd34d' },
            { id: 'schedule-review', label: 'Schedule Review', icon: RiCalendarEventLine, color: '#6ee7b7' },
            { id: 'mark-active', label: 'Mark Active', icon: RiCheckboxCircleLine, color: '#6ee7b7' },
            { id: 'export', label: 'Export', icon: RiDownloadLine, color: '#fca5a5' },
          ].map(({ id, label, icon: Icon, color }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAction(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.875rem',
                borderRadius: '0.625rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: color,
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              <Icon style={{ fontSize: '1rem' }} />
              {label}
            </motion.button>
          ))}

          {/* Clear selection */}
          <button
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
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkActionToolbar;
