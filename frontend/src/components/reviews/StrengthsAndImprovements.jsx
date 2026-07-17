/**
 * @file StrengthsAndImprovements.jsx
 * @description Two-column summary cards highlighting identified strengths and improvement areas.
 */

import { motion } from 'framer-motion';
import { RiThumbUpLine, RiArrowUpLine } from 'react-icons/ri';

const ItemChip = ({ icon, text, type }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.625rem',
      padding: '0.625rem 0.875rem',
      borderRadius: '0.625rem',
      background: type === 'strength' ? 'var(--color-success-50)' : 'var(--color-warning-50)',
      border: `1px solid ${type === 'strength' ? 'var(--color-success-100)' : 'var(--color-warning-100)'}`,
    }}
  >
    <span style={{ fontSize: '1rem' }}>{icon}</span>
    <span
      style={{
        fontSize: '0.8125rem',
        fontWeight: 500,
        color: type === 'strength' ? 'var(--color-success-700)' : 'var(--color-warning-700)',
      }}
    >
      {text}
    </span>
  </div>
);

const SummaryCard = ({ title, icon: TitleIcon, accentColor, accentBg, items, itemType, emptyMessage, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    style={{
      flex: '1 1 280px',
      background: 'var(--color-surface)',
      borderRadius: '1rem',
      border: '1px solid var(--color-border)',
      padding: '1.5rem',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
      <div
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '0.5rem',
          background: accentBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accentColor,
          fontSize: '1rem',
        }}
      >
        <TitleIcon />
      </div>
      <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
        {title}
      </h3>
    </div>

    {items && items.length > 0 ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 + i * 0.05 }}
          >
            <ItemChip icon={itemType === 'strength' ? '✓' : '→'} text={item} type={itemType} />
          </motion.div>
        ))}
      </div>
    ) : (
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-400)', fontStyle: 'italic' }}>{emptyMessage}</p>
    )}
  </motion.div>
);

const StrengthsAndImprovements = ({ strengths = [], improvements = [] }) => (
  <section>
    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: '0 0 1rem 0' }}>
      🏆 Strengths & Growth Areas
    </h2>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      <SummaryCard
        title="Key Strengths"
        icon={RiThumbUpLine}
        accentColor="var(--color-success-600)"
        accentBg="var(--color-success-100)"
        items={strengths}
        itemType="strength"
        emptyMessage="No strengths identified yet."
        index={0}
      />
      <SummaryCard
        title="Areas for Improvement"
        icon={RiArrowUpLine}
        accentColor="var(--color-warning-600)"
        accentBg="var(--color-warning-100)"
        items={improvements}
        itemType="improvement"
        emptyMessage="No improvement areas noted."
        index={1}
      />
    </div>
  </section>
);

export default StrengthsAndImprovements;
