/**
 * @file BenefitsSection.jsx
 * @description Two-column benefits: Interns (light) vs Organisations (dark).
 */

import { motion } from 'framer-motion';
import * as RiIcons from 'react-icons/ri';
import { internBenefits, orgBenefits } from '../../data/benefits';
import { staggerContainer, staggerItem } from '../../animations/variants';

function BenefitItem({ item, dark = false }) {
  const Icon = RiIcons[item.icon] || RiIcons.RiCheckLine;

  return (
    <motion.div
      variants={staggerItem}
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start',
      }}
    >
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        background: dark ? 'rgba(255,255,255,0.1)' : 'var(--color-primary-50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: dark ? 'var(--color-primary-300)' : 'var(--color-primary-600)',
        fontSize: '1.125rem',
        flexShrink: 0,
      }}>
        <Icon aria-hidden />
      </div>
      <div>
        <h4 style={{
          fontSize: '0.9375rem',
          fontWeight: 600,
          color: dark ? '#ffffff' : 'var(--color-neutral-900)',
          marginBottom: '0.25rem',
          margin: '0 0 0.25rem',
        }}>
          {item.title}
        </h4>
        <p style={{
          fontSize: '0.875rem',
          color: dark ? 'var(--color-neutral-400)' : 'var(--color-neutral-600)',
          lineHeight: 1.6,
          margin: 0,
        }}>
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}

const BenefitsSection = () => {
  return (
    <section
      id="benefits"
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
          <h2 style={{
            fontSize: 'clamp(1.625rem, 4vw, 2.375rem)',
            fontWeight: 800,
            color: 'var(--color-neutral-900)',
            letterSpacing: '-0.02em',
            marginBottom: '0.875rem',
            margin: '0 0 0.875rem',
          }}>
            Designed for everyone involved
          </h2>
          <p style={{
            fontSize: '1.0625rem',
            color: 'var(--color-neutral-600)',
            maxWidth: '480px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Whether you're the intern or the organisation, Trakive is built to make the experience better for both.
          </p>
        </motion.div>

        {/* Two columns */}
        <div
          id="benefits-columns"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {/* For Interns */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45 }}
            style={{
              background: 'var(--color-primary-50)',
              borderRadius: '1.25rem',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              border: '1px solid var(--color-primary-100)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: '#ffffff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--color-primary-600)', fontSize: '1.25rem',
              }}>
                <RiIcons.RiUserLine aria-hidden />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
                For Interns
              </h3>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {internBenefits.map((b) => <BenefitItem key={b.id} item={b} dark={false} />)}
            </motion.div>
          </motion.div>

          {/* For Organisations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            style={{
              background: 'var(--color-neutral-900)',
              borderRadius: '1.25rem',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--color-primary-300)', fontSize: '1.25rem',
              }}>
                <RiIcons.RiBuilding2Line aria-hidden />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                For Organisations
              </h3>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {orgBenefits.map((b) => <BenefitItem key={b.id} item={b} dark={true} />)}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
