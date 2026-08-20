/**
 * @file AchievementsSection.jsx
 * @description Achievements and badges section with animated reveal effects.
 */

import { motion } from 'framer-motion';
import { useProfileStore } from '../../store/useProfileStore';
import ProfileEmptyState from './ProfileEmptyState';
import Skeleton from '../ui/Skeleton';

const formatDate = (str) => {
  if (!str) return '';
  try {
    return new Date(str).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return str;
  }
};

const AchievementCard = ({ achievement, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.07 }}
    style={{
      background: '#fff',
      border: '1px solid var(--color-neutral-200)',
      borderRadius: '1rem',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    }}
    whileHover={{ y: -2, boxShadow: 'var(--shadow-card-hover)' }}
  >
    {/* Rare badge */}
    {achievement.rare && (
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          color: '#fff',
          fontSize: '0.65rem',
          fontWeight: 800,
          padding: '0.15rem 0.5rem',
          borderRadius: 99,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
            Rare
      </div>
    )}

    {/* Icon */}
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: '0.875rem',
        background: achievement.bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.625rem',
        flexShrink: 0,
      }}
    >
      {achievement.icon}
    </div>

    {/* Info */}
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-800)', marginBottom: '0.25rem' }}>
        {achievement.title}
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', lineHeight: 1.55 }}>
        {achievement.description}
      </p>
    </div>

    {/* Footer */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span
        style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: achievement.color,
          background: achievement.bgColor,
          padding: '0.2rem 0.6rem',
          borderRadius: 99,
        }}
      >
        {achievement.category}
      </span>
      <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
        {formatDate(achievement.earnedAt)}
      </span>
    </div>

    {/* Decorative bottom bar */}
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: achievement.color, opacity: 0.6 }} />
  </motion.div>
);

const AchievementsSection = () => {
  const { achievements, loadingAchievements } = useProfileStore();

  if (loadingAchievements) {
    return (
      <div className="card p-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Skeleton width={36} height={36} borderRadius="0.625rem" />
          <div>
            <Skeleton width={160} height="1rem" className="mb-1" />
            <Skeleton width={100} height="0.75rem" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={180} borderRadius="1rem" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Achievements & Badges</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
              {achievements.length} achievement{achievements.length !== 1 ? 's' : ''} earned
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {achievements.length === 0 ? (
        <ProfileEmptyState
          icon=""
          title="No achievements yet"
          description="Complete tasks, submit reviews, and collaborate with your team to earn badges and achievements."
          compact
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          {achievements.map((a, i) => (
            <AchievementCard key={a.id} achievement={a} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementsSection;
