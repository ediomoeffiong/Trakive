/**
 * @file OnboardingGuideModal.jsx
 * @description Guidance and compliance standards modal for CWG PLC & FifthLab intern onboarding.
 */

import { motion } from 'framer-motion';
import {
  RiCloseLine,
  RiInformationLine,
} from 'react-icons/ri';

export default function OnboardingGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          width: '100%',
          maxWidth: '620px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '0.625rem',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              <RiInformationLine />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 900, color: '#0f172a' }}>
                Onboarding Verification Guidelines
              </h3>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                CWG PLC & FifthLab institutional compliance criteria
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#94a3b8', cursor: 'pointer' }}
          >
            <RiCloseLine />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Guide Item 1 */}
          <div style={{ display: 'flex', gap: '0.875rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 900 }}>
              1
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a' }}>
                Placement / SIWES Letter Verification
              </h4>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
                Ensure the document is printed on official University / Polytechnic letterhead. It must contain the official red or blue ink stamp of the SIWES unit or Department, plus an authorized signature. If the stamp is omitted, request resubmission.
              </p>
            </div>
          </div>

          {/* Guide Item 2 */}
          <div style={{ display: 'flex', gap: '0.875rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 900 }}>
              2
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a' }}>
                Signed Acceptance Letter
              </h4>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
                The intern must have counter-signed the formal internship offer letter issued by CWG PLC or FifthLab, acknowledging policies, work hours, and remuneration terms.
              </p>
            </div>
          </div>

          {/* Guide Item 3 */}
          <div style={{ display: 'flex', gap: '0.875rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 900 }}>
              3
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a' }}>
                IT & Workstation Provisioning
              </h4>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
                Verify the intern’s GitHub handle, Slack workspace membership, and machine specs in the IT Setup section. Once approved, the IT Department automatically grants access to repository organizations.
              </p>
            </div>
          </div>

          {/* Guide Item 4 */}
          <div style={{ display: 'flex', gap: '0.875rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 900 }}>
              4
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a' }}>
                Feedback on Resubmissions
              </h4>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
                Always provide explicit, friendly feedback when requesting a resubmission. Use the preset feedback chips to clearly indicate what must be corrected so the intern can remedy it quickly.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5625rem 1.25rem',
              borderRadius: '0.625rem',
              border: 'none',
              background: '#00b4d8',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Got it, thanks
          </button>
        </div>
      </motion.div>
    </div>
  );
}
