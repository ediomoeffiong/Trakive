/**
 * @file FeaturesSection.jsx
 * @description 8-feature grid showcasing Trakive's key capabilities.
 */

import { motion } from 'framer-motion';
import * as RiIcons from 'react-icons/ri';
import { features } from '../../data/features';
import { staggerContainer, staggerItem } from '../../animations/variants';

// ── Feature Card ──────────────────────────────────────────────────────────────
function FeatureCard({ feature }) {
  const Icon = RiIcons[feature.icon] || RiIcons.RiStarLine;

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '1.625rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
        transition: 'box-shadow 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)')}
    >
      {/* Icon */}
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        background: 'var(--color-primary-50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-primary-600)',
        fontSize: '1.375rem',
        flexShrink: 0,
      }}>
        <Icon aria-hidden />
      </div>

      <div>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--color-neutral-900)',
          marginBottom: '0.375rem',
          margin: '0 0 0.375rem',
        }}>
          {feature.title}
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--color-neutral-600)',
          lineHeight: 1.65,
          margin: 0,
        }}>
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
const FeaturesSection = () => {
  return (
    <section
      id="features"
      style={{
        background: 'var(--color-neutral-50)',
        padding: 'clamp(3.5rem, 8vw, 5.5rem) 1.5rem',
      }}
    >
      <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <p style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-primary-600)',
            marginBottom: '0.75rem',
          }}>
            Everything you need
          </p>
          <h2 style={{
            fontSize: 'clamp(1.625rem, 4vw, 2.375rem)',
            fontWeight: 800,
            color: 'var(--color-neutral-900)',
            letterSpacing: '-0.02em',
            marginBottom: '0.875rem',
            margin: '0 0 0.875rem',
          }}>
            Built for modern internship programmes
          </h2>
          <p style={{
            fontSize: '1.0625rem',
            color: 'var(--color-neutral-600)',
            maxWidth: '520px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            From onboarding to final review, every tool your team and interns need is right here.
          </p>
        </motion.div>

        {/* 8-feature grid */}
        <motion.div
          id="features-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
