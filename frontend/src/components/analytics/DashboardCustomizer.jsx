/**
 * @file DashboardCustomizer.jsx
 * @description Slide-over panel to rearrange and show/hide widgets on the analytics dashboard.
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  RiCloseLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiEyeLine,
  RiEyeOffLine,
  RiRestartLine,
  RiCheckLine,
  RiDragMove2Line,
} from 'react-icons/ri';
import { useAnalyticsStore } from '../../store';

export const DashboardCustomizer = ({ isOpen, onClose }) => {
  const { dashboardLayout, toggleWidgetVisibility, moveWidget, resetDashboardLayout } =
    useAnalyticsStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(3px)',
          }}
        />

        {/* Panel Container */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '420px',
            height: '100%',
            backgroundColor: '#ffffff',
            boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 101,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.25rem',
              borderBottom: '1px solid var(--color-neutral-200)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                Customize Dashboard Layout
              </h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                Show, hide, or reorder analytics widgets
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '1.25rem',
                color: 'var(--color-neutral-500)',
                cursor: 'pointer',
              }}
            >
              <RiCloseLine />
            </button>
          </div>

          {/* Widgets List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {dashboardLayout.map((widget, idx) => (
              <div
                key={widget.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--color-neutral-200)',
                  backgroundColor: widget.visible ? 'var(--color-neutral-50)' : '#f8fafc',
                  opacity: widget.visible ? 1 : 0.6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <RiDragMove2Line style={{ color: 'var(--color-neutral-400)', cursor: 'grab' }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                      {widget.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                      Position: #{idx + 1}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  {/* Move Up */}
                  <button
                    disabled={idx === 0}
                    onClick={() => moveWidget(widget.id, 'up')}
                    style={iconBtnStyle}
                    title="Move up"
                  >
                    <RiArrowUpLine />
                  </button>

                  {/* Move Down */}
                  <button
                    disabled={idx === dashboardLayout.length - 1}
                    onClick={() => moveWidget(widget.id, 'down')}
                    style={iconBtnStyle}
                    title="Move down"
                  >
                    <RiArrowDownLine />
                  </button>

                  {/* Show/Hide */}
                  <button
                    onClick={() => toggleWidgetVisibility(widget.id)}
                    style={{
                      ...iconBtnStyle,
                      color: widget.visible ? 'var(--color-primary-600)' : 'var(--color-neutral-400)',
                      backgroundColor: widget.visible ? 'var(--color-primary-50)' : 'transparent',
                    }}
                    title={widget.visible ? 'Hide widget' : 'Show widget'}
                  >
                    {widget.visible ? <RiEyeLine /> : <RiEyeOffLine />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '1.25rem',
              borderTop: '1px solid var(--color-neutral-200)',
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            <button
              onClick={resetDashboardLayout}
              style={{
                flex: 1,
                padding: '0.625rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-neutral-300)',
                backgroundColor: '#ffffff',
                color: 'var(--color-neutral-700)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
              }}
            >
              <RiRestartLine /> Reset Layout
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.625rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: 'var(--color-primary-600)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
              }}
            >
              <RiCheckLine /> Apply Layout
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const iconBtnStyle = {
  border: 'none',
  background: 'transparent',
  fontSize: '1.125rem',
  color: 'var(--color-neutral-600)',
  cursor: 'pointer',
  padding: '0.25rem 0.375rem',
  borderRadius: '0.375rem',
};
