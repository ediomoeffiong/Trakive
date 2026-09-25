/**
 * @file OnboardingBanner.jsx
 * @description Executive hero banner for the Supervisor Onboarding portal with metrics overview,
 * fast-action buttons, export summary, and guide trigger.
 */

import { motion } from 'framer-motion';
import {
  RiCheckboxMultipleLine,
  RiRefreshLine,
  RiFileDownloadLine,
  RiInformationLine,
  RiFlashlightLine,
  RiShieldCheckLine,
} from 'react-icons/ri';

export default function OnboardingBanner({
  pendingCount = 0,
  clearedCount = 0,
  totalInterns = 0,
  onRefresh,
  isRefreshing,
  onOpenGuide,
  onExportSummary,
  onSwitchToPendingTab,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        background: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
        borderRadius: '1.25rem',
        padding: '1.75rem 2rem',
        color: '#ffffff',
        boxShadow: '0 8px 32px rgba(0, 180, 216, 0.22)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background shapes */}
      <div
        style={{
          position: 'absolute',
          right: '-40px',
          top: '-40px',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '80px',
          bottom: '-60px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(4px)',
                padding: '0.25rem 0.75rem',
                borderRadius: '99px',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <RiCheckboxMultipleLine /> CWG PLC & FifthLab
            </span>

            {pendingCount > 0 && (
              <span
                onClick={onSwitchToPendingTab}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  background: '#fef08a',
                  color: '#854d0e',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '99px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                }}
              >
                <RiFlashlightLine /> {pendingCount} Pending Verification
              </span>
            )}
          </div>

          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.65rem', fontWeight: 900, lineHeight: 1.25, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Intern Onboarding & Verification Portal
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.92)', lineHeight: 1.55 }}>
            Review, verify, and validate required compliance dossiers — including resumes, institutional placement letters,
            and acceptance documents — for assigned cohorts.
          </p>

          {/* Quick stats mini ribbon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '1.125rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.9)' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>{totalInterns}</span> Total Interns
            </div>
            <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.3)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.9)' }}>
              <RiShieldCheckLine style={{ color: '#86efac' }} />
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#86efac' }}>{clearedCount}</span> Fully Cleared
            </div>
            <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.3)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.9)' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fef08a' }}>{pendingCount}</span> Awaiting Supervisor Action
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenGuide}
            title="Verification Guide & Compliance Criteria"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5625rem 0.875rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
          >
            <RiInformationLine style={{ fontSize: '1rem' }} /> Guide
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onExportSummary}
            title="Export CSV of Onboarding Statuses"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5625rem 0.875rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
          >
            <RiFileDownloadLine style={{ fontSize: '1rem' }} /> Export Report
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Onboarding Queue"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5625rem 1rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: '#ffffff',
              color: '#0077b6',
              fontSize: '0.8125rem',
              fontWeight: 800,
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            }}
          >
            <RiRefreshLine
              style={{
                fontSize: '1.05rem',
                animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
              }}
            />
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
