/**
 * @file AnnouncementCard.jsx
 * @description Displays an organization-wide announcement with expand/collapse.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiMegaphoneLine, RiCalendarLine, RiUser3Line,
  RiArrowDownSLine, RiArrowUpSLine, RiAlarmLine,
} from 'react-icons/ri';
import Avatar from '../ui/Avatar';

const PRIORITY_META = {
  important: {
    label: 'Important',
    bg: 'linear-gradient(135deg, #fff7ed, #fff)',
    border: '#fed7aa',
    badge: { bg: '#fff7ed', color: '#ea580c' },
    icon: <RiAlarmLine />,
  },
  general: {
    label: 'General',
    bg: '#fff',
    border: 'var(--color-neutral-200)',
    badge: { bg: 'var(--color-neutral-100)', color: 'var(--color-neutral-600)' },
    icon: <RiMegaphoneLine />,
  },
};

const TYPE_META = {
  event: { label: 'Event', bg: '#eff6ff', color: '#2563eb' },
  general: { label: 'General', bg: 'var(--color-neutral-100)', color: 'var(--color-neutral-600)' },
  reminder: { label: 'Reminder', bg: '#f0fdfa', color: '#0d9488' },
};

/**
 * @param {object} props
 * @param {object} props.announcement
 */
const AnnouncementCard = ({ announcement }) => {
  const [expanded, setExpanded] = useState(false);
  const {
    title, author, displayDate, priority, type, preview, body, tags,
  } = announcement;

  const pMeta = PRIORITY_META[priority] ?? PRIORITY_META.general;
  const tMeta = TYPE_META[type] ?? TYPE_META.general;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      style={{
        background: pMeta.bg,
        border: `1px solid ${pMeta.border}`,
        borderRadius: '0.875rem',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
      aria-label={`Announcement: ${title}`}
    >
      {/* Card header */}
      <div style={{ padding: '1.125rem 1.25rem' }}>
        {/* Author + meta row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.875rem',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Avatar name={author.name} size="sm" />
            <div>
              <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
                {author.name}
              </p>
              <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--color-neutral-500)' }}>
                {author.role}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Priority badge */}
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                background: pMeta.badge.bg,
                color: pMeta.badge.color,
              }}
            >
              {pMeta.icon}
              {pMeta.label}
            </span>

            {/* Type badge */}
            <span
              style={{
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                background: tMeta.bg,
                color: tMeta.color,
              }}
            >
              {tMeta.label}
            </span>

            {/* Date */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>
              <RiCalendarLine />
              {displayDate}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          style={{
            margin: '0 0 0.5rem',
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: 'var(--color-neutral-900)',
            lineHeight: 1.4,
          }}
        >
          {title}
        </h3>

        {/* Preview */}
        <p
          style={{
            margin: '0 0 0.875rem',
            fontSize: '0.8125rem',
            color: 'var(--color-neutral-600)',
            lineHeight: 1.65,
          }}
        >
          {preview}
        </p>

        {/* Tags */}
        {tags?.length > 0 && (
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  background: 'var(--color-neutral-100)',
                  color: 'var(--color-neutral-500)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Expand toggle */}
        {body && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="btn btn-ghost"
            aria-expanded={expanded}
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--color-primary-600)',
              gap: '0.3rem',
              padding: '0.25rem 0',
            }}
          >
            {expanded ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
            {expanded ? 'Read less' : 'Read full announcement'}
          </button>
        )}
      </div>

      {/* Expanded body */}
      <AnimatePresence>
        {expanded && body && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '1.25rem',
                borderTop: '1px solid var(--color-neutral-100)',
                background: 'rgba(255,255,255,0.7)',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: 'var(--color-neutral-700)',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-line',
                }}
              >
                {body}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default AnnouncementCard;
