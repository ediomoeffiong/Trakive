/**
 * @file InsightsPanel.jsx
 * @description Automated AI-style insight cards panel.
 */

import { motion } from 'framer-motion';
import {
  RiSparklingLine,
  RiArrowUpLine,
  RiAlertLine,
  RiLightbulbLine,
} from 'react-icons/ri';


export const InsightsPanel = ({ insights = [] }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        borderRadius: '1rem',
        padding: '1.25rem',
        color: '#ffffff',
        boxShadow: '0 8px 32px rgba(37, 99, 235, 0.15)',

        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RiSparklingLine style={{ fontSize: '1.125rem' }} />
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
              AI Automated System Insights
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
              Real-time pattern analysis generated from platform activity
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0.2rem 0.5rem',
            borderRadius: '99px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#c7d2fe',
          }}
        >
          Auto-Updating
        </span>
      </div>

      {/* Insights Cards List */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '0.875rem',
        }}
      >
        {insights.map((item, index) => {
          const isWarning = item.type === 'warning';
          const isPositive = item.type === 'positive';

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(10px)',
                borderRadius: '0.75rem',
                padding: '1rem',
                border: isWarning
                  ? '1px solid rgba(239, 68, 68, 0.3)'
                  : isPositive
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: isWarning ? '#fca5a5' : isPositive ? '#6ee7b7' : '#93c5fd',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  {isWarning ? (
                    <RiAlertLine />
                  ) : isPositive ? (
                    <RiArrowUpLine />
                  ) : (
                    <RiLightbulbLine />
                  )}
                  {item.category}
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>{item.timestamp}</span>
              </div>

              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff' }}>
                  {item.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.78125rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {item.description}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.375rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isPositive ? '#34d399' : '#f87171' }}>
                  Metric: {item.metric}
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{item.impact}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
