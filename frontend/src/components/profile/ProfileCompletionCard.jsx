/**
 * @file ProfileCompletionCard.jsx
 * @description Profile completion tracking engine.
 */

import { motion } from 'framer-motion';

const ProfileCompletionCard = ({ completion, onActionClick }) => {
  const { percentage, missingItems, items } = completion;

  const getColor = () => {
    if (percentage >= 80) return { ring: '#22c55e', text: '#16a34a' };
    if (percentage >= 50) return { ring: '#f59e0b', text: '#d97706' };
    return { ring: '#ef4444', text: '#dc2626' };
  };

  const colors = getColor();
  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference - (circumference * percentage) / 100;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
            Profile Completion
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-neutral-500)' }}>
            {missingItems.length === 0
              ? 'Your profile is complete.'
              : `${missingItems.length} item${missingItems.length > 1 ? 's' : ''} remaining`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-5">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={88} height={88} viewBox="0 0 88 88">
            <circle cx={44} cy={44} r={36} fill="none" stroke="var(--color-neutral-100)" strokeWidth={8} />
            <motion.circle
              cx={44}
              cy={44}
              r={36}
              fill="none"
              stroke={colors.ring}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              style={{ transformOrigin: '44px 44px', transform: 'rotate(-90deg)' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: colors.text }}>
              {percentage}%
            </span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {items.map((item) => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8125rem',
                  color: item.done ? 'var(--color-neutral-500)' : 'var(--color-neutral-700)',
                }}
              >
                <span style={{ width: 44, fontSize: '0.7rem', fontWeight: 800, color: item.done ? '#16a34a' : 'var(--color-neutral-400)' }}>
                  {item.done ? 'Done' : 'Todo'}
                </span>
                <span style={{ textDecoration: item.done ? 'line-through' : 'none' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {missingItems.length > 0 && (
        <div
          style={{
            background: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-100)',
            borderRadius: '0.625rem',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-primary-700)' }}>
              Suggested next step
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-primary-600)' }}>
              {missingItems[0]?.label}
            </p>
          </div>
          <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={() => onActionClick?.(missingItems[0]?.key)}>
            Go
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionCard;
