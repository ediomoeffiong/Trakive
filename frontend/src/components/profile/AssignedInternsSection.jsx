/**
 * @file AssignedInternsSection.jsx
 * @description Supervisor-specific profile tab showing assigned intern metrics,
 * KPIs, attention alerts, and direct links to Intern Management module.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiTeamLine, RiUserFollowLine, RiAlertLine,
  RiStarLine, RiArrowRightLine, RiCheckLine,
} from 'react-icons/ri';
import Avatar from '../ui/Avatar';
import { useProfileStore } from '../../store/useProfileStore';
import { ROUTES } from '../../constants';

const AssignedInternsSection = () => {
  const navigate = useNavigate();
  const { assignedInterns, loadingAssignedInterns } = useProfileStore();

  const stats = assignedInterns?.stats || {
    totalAssigned: 8,
    activeInterns: 6,
    requiringAttention: 2,
    pendingReviews: 3,
  };

  const interns = assignedInterns?.interns || [];

  const kpis = [
    {
      label: 'Total Assigned Interns',
      value: stats.totalAssigned,
      icon: RiTeamLine,
      color: '#3b82f6',
      bg: '#eff6ff',
      border: '#bfdbfe',
      subtitle: 'Managed across 2 engineering cohorts',
    },
    {
      label: 'Active Interns',
      value: stats.activeInterns,
      icon: RiUserFollowLine,
      color: '#10b981',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      subtitle: 'Currently working on active tasks',
    },
    {
      label: 'Requiring Attention',
      value: stats.requiringAttention,
      icon: RiAlertLine,
      color: '#ef4444',
      bg: '#fef2f2',
      border: '#fecaca',
      subtitle: 'Due reviews or overdue tasks',
    },
    {
      label: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: RiStarLine,
      color: '#f59e0b',
      bg: '#fffbeb',
      border: '#fde68a',
      subtitle: 'Submissions waiting for evaluation',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── KPI Cards Grid ───────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
            style={{
              background: '#fff',
              border: `1px solid ${kpi.border}`,
              borderRadius: '1rem',
              padding: '1.25rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-600)' }}>
                {kpi.label}
              </span>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '0.625rem',
                  background: kpi.bg,
                  color: kpi.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                }}
              >
                <kpi.icon />
              </div>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                {kpi.value}
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                {kpi.subtitle}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Assigned Intern Roster ─────────────────────────────────────────── */}
      <div className="card p-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              Assigned Intern Roster
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
              Detailed progress and review statuses for interns assigned to your supervision
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTES.SUPERVISOR_INTERNS)}
            className="btn btn-outline btn-sm"
            style={{ gap: '0.375rem', fontSize: '0.8125rem' }}
            id="go-to-intern-management-btn"
          >
            Intern Management Module
            <RiArrowRightLine />
          </button>
        </div>

        {loadingAssignedInterns ? (
          <p style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--color-neutral-400)' }}>
            Loading assigned interns…
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {interns.map((intern) => (
              <div
                key={intern.id}
                style={{
                  background: 'var(--color-neutral-50)',
                  border: '1px solid var(--color-neutral-200)',
                  borderRadius: '0.875rem',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Avatar name={intern.name} src={intern.avatar} size="md" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {intern.name}
                      </p>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: `${intern.statusColor}15`,
                          color: intern.statusColor,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {intern.status}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {intern.role}
                    </p>
                  </div>
                </div>

                {/* Attention warning banner if required */}
                {intern.attentionRequired && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#991b1b',
                      fontWeight: 600,
                    }}
                  >
                    <RiAlertLine style={{ flexShrink: 0, fontSize: '0.9rem' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {intern.attentionReason}
                    </span>
                  </div>
                )}

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-600)' }}>
                      Overall Deliverables
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                      {intern.completionRate}%
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--color-neutral-200)', borderRadius: 99, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${intern.completionRate}%`,
                        height: '100%',
                        background: intern.completionRate >= 80 ? '#10b981' : intern.completionRate >= 50 ? '#3b82f6' : '#f59e0b',
                        borderRadius: 99,
                      }}
                    />
                  </div>
                </div>

                {/* Metrics row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-neutral-500)', paddingTop: '0.25rem', borderTop: '1px solid var(--color-neutral-200)' }}>
                  <span>Tasks: {intern.tasksCompleted}/{intern.tasksTotal}</span>
                  <span>Pending Rev: {intern.pendingReviewsCount}</span>
                  <button
                    onClick={() => navigate(`/supervisor/interns/${intern.id}`)}
                    className="btn btn-ghost"
                    style={{ padding: 0, fontSize: '0.75rem', color: 'var(--color-primary-600)', fontWeight: 700 }}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedInternsSection;
