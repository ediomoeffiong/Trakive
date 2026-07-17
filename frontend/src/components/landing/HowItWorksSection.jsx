/**
 * @file HowItWorksSection.jsx
 * @description 4-step internship journey explanation.
 */

import { motion } from 'framer-motion';
import * as RiIcons from 'react-icons/ri';
import { steps } from '../../data/howItWorks';
import { staggerContainer, staggerItem } from '../../animations/variants';

function StepCard({ step, index, total }) {
  const Icon = RiIcons[step.icon] || RiIcons.RiArrowRightLine;

  return (
    <motion.div
      variants={staggerItem}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '1rem',
        flex: 1,
        minWidth: '200px',
      }}
    >
      {/* Connector line (desktop) */}
      {index < total - 1 && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '24px',
            left: 'calc(48px + 1rem)',
            right: '-1rem',
            height: '1px',
            background: 'var(--color-neutral-200)',
            borderTop: '1.5px dashed var(--color-neutral-200)',
            zIndex: 0,
          }}
          className="step-connector"
        />
      )}

      {/* Step number */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'var(--color-primary-50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary-600)',
          fontSize: '1.375rem',
          flexShrink: 0,
          border: '2px solid var(--color-primary-100)',
        }}>
          <Icon aria-hidden />
        </div>
        <span style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--color-primary-100)',
          lineHeight: 1,
          letterSpacing: '-0.03em',
          userSelect: 'none',
        }}>
          {String(step.step).padStart(2, '0')}
        </span>
      </div>

      <div>
        <h3 style={{
          fontSize: '1.0625rem',
          fontWeight: 700,
          color: 'var(--color-neutral-900)',
          marginBottom: '0.375rem',
          margin: '0 0 0.375rem',
        }}>
          {step.title}
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--color-neutral-600)',
          lineHeight: 1.65,
          margin: 0,
        }}>
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}

const HowItWorksSection = () => {
  return (
    <section
      id="how-it-works"
      style={{
        background: '#ffffff',
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
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
        >
          <p style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-primary-600)',
            marginBottom: '0.75rem',
          }}>
            Simple by design
          </p>
          <h2 style={{
            fontSize: 'clamp(1.625rem, 4vw, 2.375rem)',
            fontWeight: 800,
            color: 'var(--color-neutral-900)',
            letterSpacing: '-0.02em',
            marginBottom: '0.875rem',
            margin: '0 0 0.875rem',
          }}>
            From day one to final review
          </h2>
          <p style={{
            fontSize: '1.0625rem',
            color: 'var(--color-neutral-600)',
            maxWidth: '480px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Four straightforward steps that take you from registration to a verified performance summary.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          id="how-it-works-steps"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          style={{
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}
        >
          {steps.map((step, i) => (
            <StepCard key={step.id} step={step} index={i} total={steps.length} />
          ))}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .step-connector { display: none !important; }
        }
      `}</style>
    </section>
  );
};

export default HowItWorksSection;
