/**
 * @file Widgets.jsx
 * @description Modular Supervisor Widgets component.
 * Includes: Pending Approvals, Review Reminders, Recently Assigned Interns, Org Announcements, Team Performance Summary.
 */

import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiCheckboxCircleLine,
  RiTimeLine,
  RiUserAddLine,
  RiMegaphoneLine,
  RiTrophyLine,
  RiArrowRightSLine,
} from 'react-icons/ri';
import Avatar from '../ui/Avatar';

export const PendingApprovalsWidget = ({ approvals = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '1.25rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RiCheckboxCircleLine style={{ color: '#4f46e5', fontSize: '1.2rem' }} />
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Pending Approvals
          </h4>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '99px', background: '#eef2ff', color: '#4338ca' }}>
          {approvals.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {approvals.map((appr) => (
          <div
            key={appr.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.625rem 0.75rem',
              borderRadius: '0.5rem',
              background: 'var(--color-neutral-50)',
              border: '1px solid var(--color-neutral-200)',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                {appr.intern}
              </p>
              <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                {appr.type}
              </p>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => toast.success(`Approved ${appr.type} for ${appr.intern}`)}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              Approve
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const ReviewRemindersWidget = ({ reminders = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '1.25rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RiTimeLine style={{ color: '#7c3aed', fontSize: '1.2rem' }} />
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Review Reminders
          </h4>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {reminders.map((rem) => (
          <div
            key={rem.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.625rem 0.75rem',
              borderRadius: '0.5rem',
              background: '#faf5ff',
              border: '1px solid #e9d5ff',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#581c87' }}>
                {rem.intern}
              </p>
              <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: '#7e22ce' }}>
                {rem.reviewType}
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b21a8' }}>
              {rem.dueDate}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const RecentlyAssignedWidget = ({ interns = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '1.25rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RiUserAddLine style={{ color: '#059669', fontSize: '1.2rem' }} />
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Recently Assigned Interns
          </h4>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {interns.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Avatar name={item.name} src={item.avatar} size="md" />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                {item.name}
              </p>
              <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                {item.department} • Assigned {item.assignedDate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const OrgAnnouncementsWidget = ({ announcements = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.15 }}
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '1.25rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RiMegaphoneLine style={{ color: '#d97706', fontSize: '1.2rem' }} />
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Organization Announcements
          </h4>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {announcements.map((ann) => (
          <div
            key={ann.id}
            style={{
              padding: '0.625rem 0.75rem',
              borderRadius: '0.5rem',
              background: '#fffbeb',
              border: '1px solid #fde68a',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#92400e' }}>
              {ann.title}
            </p>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#b45309' }}>
              {ann.author} • {ann.date}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const TeamPerformanceSummaryWidget = ({ summary = {} }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.2 }}
      style={{
        background: '#00b4d8',
        borderRadius: '1rem',
        padding: '1.25rem',
        color: '#ffffff',
        boxShadow: '0 8px 24px rgba(49, 46, 129, 0.25)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <RiTrophyLine style={{ color: '#fbbf24', fontSize: '1.25rem' }} />
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
          Team Performance Summary
        </h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem', padding: '0.625rem' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#c7d2fe' }}>Task Completion</p>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '1.25rem', fontWeight: 800 }}>{summary.completionRate || '92%'}</p>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem', padding: '0.625rem' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#c7d2fe' }}>On-Time Rate</p>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '1.25rem', fontWeight: 800 }}>{summary.onTimeRate || '88%'}</p>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem', padding: '0.625rem' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#c7d2fe' }}>Satisfaction</p>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '1.25rem', fontWeight: 800 }}>{summary.satisfactionScore || '4.7/5'}</p>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem', padding: '0.625rem' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#c7d2fe' }}>Top Performing</p>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8125rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary.topPerformingDept || 'UI/UX Design'}</p>
        </div>
      </div>
    </motion.div>
  );
};
