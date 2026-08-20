/**
 * @file ReviewScheduleView.jsx
 * @description Upcoming and past review schedule list with card layout,
 * countdown, edit/cancel controls, and tabs.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiCalendarCheckLine,
  RiTimeLine,
  RiMapPinLine,
  RiLink,
  RiDeleteBinLine,
  RiAddCircleLine,
  RiVideoLine,
  RiPhoneLine,
  RiBuilding2Line,
  RiLoader4Line,
} from 'react-icons/ri';
import { ScheduleCardSkeleton } from './ReviewSkeletonLoaders';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const fmtTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : '';

const getCountdown = (iso) => {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = then - now;
  if (diff <= 0) return { label: 'Due', urgent: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days === 0) return { label: `${hours}h away`, urgent: hours < 2 };
  if (days === 1) return { label: 'Tomorrow', urgent: false };
  return { label: `${days} days`, urgent: false };
};

const getInitialsBg = (initials = 'XX') => {
  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#7c3aed', '#059669'];
  return colors[initials.charCodeAt(0) % colors.length];
};

const TYPE_CONFIG = {
  'formal-review': { label: 'Formal Review', bg: '#eef2ff', color: '#4338ca' },
  'one-on-one': { label: '1-on-1', bg: '#ecfdf5', color: '#065f46' },
  'skills-assessment': { label: 'Skills Assessment', bg: '#fffbeb', color: '#92400e' },
  'probation-review': { label: 'Probation', bg: '#fef2f2', color: '#991b1b' },
};

const LOCATION_ICONS = {
  'google-meet': RiVideoLine,
  zoom: RiVideoLine,
  'microsoft-teams': RiVideoLine,
  'in-person': RiBuilding2Line,
  phone: RiPhoneLine,
};

// ── Schedule Card ─────────────────────────────────────────────────────────────
const ScheduleCard = ({ review, onCancel, isLoading, isPast = false }) => {
  const countdown = isPast ? null : getCountdown(review.scheduledAt);
  const typeCfg = TYPE_CONFIG[review.type] || TYPE_CONFIG['one-on-one'];
  const LocationIcon = LOCATION_ICONS[review.location] || RiMapPinLine;
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff',
        borderRadius: '1rem',
        border: `1px solid ${isPast ? 'var(--color-neutral-100)' : 'var(--color-neutral-200)'}`,
        padding: '1.25rem',
        display: 'flex',
        gap: '1.25rem',
        alignItems: 'flex-start',
        opacity: isPast ? 0.7 : 1,
        boxShadow: isPast ? 'none' : '0 4px 16px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* Date block */}
      <div
        style={{
          flexShrink: 0,
          width: '56px',
          borderRadius: '0.875rem',
          background: isPast ? '#f1f5f9' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          color: isPast ? 'var(--color-neutral-500)' : '#fff',
          padding: '0.5rem 0',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isPast ? 'none' : '0 4px 12px rgba(79,70,229,0.25)',
        }}
      >
        <span style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1 }}>
          {new Date(review.scheduledAt).getDate()}
        </span>
        <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>
          {new Date(review.scheduledAt).toLocaleString('default', { month: 'short' })}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-900)', marginBottom: '0.25rem' }}>
              {review.title}
            </div>
            {/* Intern */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: getInitialsBg(review.internInitials), color: '#fff', fontSize: '0.625rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {review.internInitials}
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)', fontWeight: 600 }}>{review.internName}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>· {review.internDepartment}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: typeCfg.bg, color: typeCfg.color }}>
              {typeCfg.label}
            </span>
            {!isPast && countdown && (
              <span
                style={{
                  padding: '0.2rem 0.625rem',
                  borderRadius: '9999px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  background: countdown.urgent ? '#fef2f2' : '#f0fdf4',
                  color: countdown.urgent ? '#dc2626' : '#166534',
                }}
              >
                {countdown.label}
              </span>
            )}
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', fontSize: '0.8125rem', color: 'var(--color-neutral-500)', marginBottom: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <RiTimeLine style={{ fontSize: '0.9rem' }} />
            {fmtTime(review.scheduledAt)} · {review.durationMins} min
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <LocationIcon style={{ fontSize: '0.9rem' }} />
            {review.location.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
          {review.meetingLink && (
            <a href={review.meetingLink} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
              <RiLink style={{ fontSize: '0.9rem' }} /> Join Link
            </a>
          )}
        </div>

        {review.notes && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', fontStyle: 'italic', marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            "{review.notes}"
          </div>
        )}

        {/* Actions */}
        {!isPast && (
          <div>
            {!showCancelConfirm ? (
              <motion.button
                whileHover={{ scale: 1.03, color: '#dc2626' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCancelConfirm(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.625rem', border: '1px solid var(--color-neutral-200)', background: '#fff', color: 'var(--color-neutral-500)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                <RiDeleteBinLine /> Cancel Review
              </motion.button>
            ) : (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)', fontWeight: 600 }}>Cancel this review?</span>
                <button onClick={() => setShowCancelConfirm(false)} style={{ padding: '0.3rem 0.625rem', borderRadius: '0.5rem', border: '1px solid var(--color-neutral-200)', background: '#fff', color: 'var(--color-neutral-500)', fontSize: '0.75rem', cursor: 'pointer' }}>No, keep it</button>
                <button
                  onClick={() => { onCancel?.(review.id); setShowCancelConfirm(false); }}
                  disabled={isLoading}
                  style={{ padding: '0.3rem 0.625rem', borderRadius: '0.5rem', border: 'none', background: '#fef2f2', color: '#dc2626', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  {isLoading ? <RiLoader4Line style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                  Yes, cancel
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const ReviewScheduleView = ({
  upcoming = [],
  completed = [],
  isLoading = false,
  actionLoading = false,
  onScheduleNew,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState('upcoming');

  if (isLoading) return <ScheduleCardSkeleton count={4} />;

  const list = activeTab === 'upcoming' ? upcoming : completed;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0', background: '#f8fafc', borderRadius: '0.75rem', padding: '0.25rem', border: '1px solid var(--color-neutral-200)' }}>
          {[{ id: 'upcoming', label: `Upcoming (${upcoming.length})` }, { id: 'past', label: `Completed (${completed.length})` }].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{ padding: '0.5rem 1rem', borderRadius: '0.625rem', border: 'none', background: activeTab === id ? '#fff' : 'transparent', color: activeTab === id ? '#4f46e5' : 'var(--color-neutral-500)', fontWeight: activeTab === id ? 700 : 500, fontSize: '0.875rem', cursor: 'pointer', boxShadow: activeTab === id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
            >
              {label}
            </button>
          ))}
        </div>
        <motion.button
          whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(79,70,229,0.3)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onScheduleNew}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5625rem 1.125rem', borderRadius: '0.875rem', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(79,70,229,0.28)' }}
        >
          <RiAddCircleLine /> Schedule Review
        </motion.button>
      </div>

      {/* List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          {list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)' }}>
              <RiCalendarCheckLine style={{ fontSize: '3rem', color: 'var(--color-neutral-300)', marginBottom: '1rem' }} />
              <h3 style={{ margin: 0, color: 'var(--color-neutral-500)', fontWeight: 700 }}>
                {activeTab === 'upcoming' ? 'No upcoming reviews' : 'No completed reviews'}
              </h3>
              {activeTab === 'upcoming' && (
                <p style={{ margin: '0.5rem 0 0', color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>
                  Schedule a new review to get started.
                </p>
              )}
            </div>
          ) : (
            list.map((review) => (
              <ScheduleCard
                key={review.id}
                review={review}
                onCancel={onCancel}
                isLoading={actionLoading}
                isPast={activeTab === 'past'}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ReviewScheduleView;
