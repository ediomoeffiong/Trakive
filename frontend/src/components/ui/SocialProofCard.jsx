/**
 * @file SocialProofCard.jsx
 * @description Testimonial & stats carousel card with smooth Framer Motion crossfade transitions.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    quote: "Trakive has completely streamlined our intern onboarding. We reduced setup time from days to minutes.",
    author: "Sarah Connor",
    role: "Engineering Supervisor",
    company: "Trakive Technologies",
    stat: "94% Onboarding Rate",
  },
  {
    quote: "The performance tracking dashboard is a game-changer. Interns know exactly what their goals are daily.",
    author: "Dr. Evelyn Foster",
    role: "Department Head",
    company: "Product Design Hub",
    stat: "40% Higher Productivity",
  },
  {
    quote: "From compliance to daily tasks, everything is transparent. We can't imagine running internships without it.",
    author: "Marcus Vance",
    role: "HR Lead",
    company: "People Operations Corp",
    stat: "15+ Hours Saved Weekly",
  },
];

const SocialProofCard = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = testimonials[index];

  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '1.25rem',
        padding: '2rem',
        color: '#ffffff',
        width: '100%',
        maxWidth: '460px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <div style={{ position: 'relative', minHeight: '120px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <p
              style={{
                fontSize: '1.125rem',
                fontWeight: 500,
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.95)',
                margin: 0,
                fontStyle: 'italic',
              }}
            >
              "{current.quote}"
            </p>
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                {current.author}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
                {current.role}, {current.company}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-300)' }}>
            {current.stat}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Proven efficiency
          </span>
        </div>

        {/* Carousel Indicators */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setIndex(idx)}
              style={{
                width: idx === index ? '24px' : '8px',
                height: '8px',
                borderRadius: '99px',
                backgroundColor: idx === index ? 'var(--color-primary-400)' : 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialProofCard;
