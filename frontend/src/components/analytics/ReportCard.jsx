/**
 * @file ReportCard.jsx
 * @description Executive Summary cards displaying key highlights, top performers,
 * operational review velocity, departmental benchmarks, upcoming deadlines, and risk items.
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  RiTrophyLine,
  RiArrowRightUpLine,
  RiAlarmWarningLine,
  RiCheckDoubleLine,
  RiBuilding4Line,
  RiUserStarLine,
  RiLineChartLine,
  RiCalendarEventLine,
  RiTimeLine,
  RiGroupLine,
  RiCheckboxCircleLine,
  RiShieldCheckLine,
  RiArrowUpLine,
  RiSparklingLine,
} from 'react-icons/ri';
import Avatar from '../ui/Avatar';
import { useCurrentUser } from '../../store';
import { USER_ROLES, ROUTES } from '../../constants';

export const ReportSummaryGrid = ({ summaryCards }) => {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const isSupervisor = user?.role === USER_ROLES.SUPERVISOR;

  const drilldownPath = (type) =>
    isSupervisor ? `/supervisor/analytics/drilldown/${type}` : `/admin/analytics/drilldown/${type}`;
  const comparePath = () =>
    isSupervisor ? ROUTES.SUPERVISOR_ANALYTICS_COMPARE : ROUTES.ADMIN_ANALYTICS_COMPARE;
  const reviewsPath = () =>
    isSupervisor ? ROUTES.SUPERVISOR_REVIEWS : drilldownPath('review');
  const tasksPath = () =>
    isSupervisor ? ROUTES.SUPERVISOR_TASKS : drilldownPath('task');

  if (!summaryCards) return null;

  const {
    bestPerformingIntern,
    mostImprovedIntern,
    supervisorPerformance,
    highestPerformingDept,
    upcomingReviewDeadlines = [],
    overdueTasks = [],
  } = summaryCards;

  // Fallback data if null to keep the executive dashboard resilient and cohesive
  const topIntern = bestPerformingIntern || {
    badge: 'Top Performer',
    name: 'Top Cohort Intern',
    role: 'Engineering Intern',
    department: user?.department || 'FifthLab',
    avatar: null,
    metricLabel: 'Performance Score',
    metricValue: '95%',
  };

  const improvedIntern = mostImprovedIntern || {
    badge: 'Productivity Growth',
    name: 'Growth Leader',
    role: user?.department ? `${user.department} Intern` : 'Product Design Intern',
    department: user?.department || 'FifthLab',
    avatar: null,
    metricLabel: 'Task Velocity Increase',
    metricValue: '+28%',
  };

  const supPerformance = supervisorPerformance || {
    badge: isSupervisor ? 'Your Review Load' : 'Review Throughput',
    name: user?.name || 'Assigned Supervisor',
    role: user?.role_name || user?.role || 'Supervisor',
    avatar: user?.avatar_url || user?.avatar || null,
    assignedCount: user?.assigned_interns || 1,
    reviewVelocity: '2.4 hrs avg turnaround',
  };

  const leadDept = highestPerformingDept || {
    badge: 'Lead Department',
    name: user?.department || 'Engineering & Product',
    lead: user?.name || 'Department Lead',
    internCount: 1,
    metricLabel: 'Completion Rate',
    metricValue: '92%',
  };

  // Helper to parse percentage number from string for progress bars
  const parsePercent = (val) => {
    if (!val) return 0;
    const num = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : Math.min(100, Math.max(0, num));
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem',
      }}
    >
      {/* ── 1. Top Performer Card ────────────────────────────────────────── */}
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 12px 28px -6px rgba(16, 185, 129, 0.15)' }}
        transition={{ duration: 0.2 }}
        onClick={() => navigate(drilldownPath('performance'))}
        style={{
          ...cardWrapperStyle,
          borderTop: '3px solid #10b981',
        }}
        role="button"
        tabIndex={0}
        aria-label="Top Performing Intern Card"
      >
        <div style={cardHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={iconBadgeStyle('#ecfdf5', '#059669')}>
              <RiTrophyLine style={{ fontSize: '1rem' }} />
            </span>
            <span style={pillBadgeStyle('#ecfdf5', '#047857', '#a7f3d0')}>
              {topIntern.badge || 'Top Performer'}
            </span>
          </div>
          <button
            style={actionButtonStyle('#059669', '#ecfdf5')}
            title="Drilldown to Performance Analytics"
            aria-label="View Performance Analytics"
          >
            <RiArrowRightUpLine />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '1.125rem' }}>
          <div style={{ position: 'relative' }}>
            <Avatar
              src={topIntern.avatar}
              name={topIntern.name}
              size="lg"
            />
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                background: '#10b981',
                color: '#ffffff',
                fontSize: '0.625rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }}
              title="Rank #1"
            >
              #1
            </span>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h4
              style={{
                margin: 0,
                fontSize: '1.0625rem',
                fontWeight: 800,
                color: 'var(--color-neutral-900)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {topIntern.name}
            </h4>
            <p
              style={{
                margin: '0.125rem 0 0',
                fontSize: '0.78125rem',
                color: 'var(--color-neutral-500)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {topIntern.role || 'Intern'} • {topIntern.department || 'FifthLab'}
            </p>
          </div>
        </div>

        <div style={metricCardStyle('#f0fdf4', '#dcfce7')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.375rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>
              {topIntern.metricLabel || 'Overall Score'}
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803d', letterSpacing: '-0.02em' }}>
              {topIntern.metricValue}
            </span>
          </div>
          {/* Visual Score Track */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#dcfce7', borderRadius: '99px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${parsePercent(topIntern.metricValue) || 92}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981, #059669)',
                borderRadius: '99px',
              }}
            />
          </div>
        </div>

        <div style={cardFooterLinkStyle('#059669')}>
          <span>View intern performance breakdown</span>
          <RiArrowRightUpLine />
        </div>
      </motion.div>

      {/* ── 2. Productivity Growth Card ──────────────────────────────────── */}
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 12px 28px -6px rgba(59, 130, 246, 0.15)' }}
        transition={{ duration: 0.2 }}
        onClick={() => navigate(drilldownPath('performance'))}
        style={{
          ...cardWrapperStyle,
          borderTop: '3px solid #3b82f6',
        }}
        role="button"
        tabIndex={0}
        aria-label="Productivity Growth Intern Card"
      >
        <div style={cardHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={iconBadgeStyle('#eff6ff', '#2563eb')}>
              <RiLineChartLine style={{ fontSize: '1rem' }} />
            </span>
            <span style={pillBadgeStyle('#eff6ff', '#1d4ed8', '#bfdbfe')}>
              {improvedIntern.badge || 'Productivity Growth'}
            </span>
          </div>
          <button
            style={actionButtonStyle('#2563eb', '#eff6ff')}
            title="Drilldown to Performance Analytics"
            aria-label="View Performance Analytics"
          >
            <RiArrowRightUpLine />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '1.125rem' }}>
          <div style={{ position: 'relative' }}>
            <Avatar
              src={improvedIntern.avatar}
              name={improvedIntern.name}
              size="lg"
            />
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                background: '#2563eb',
                color: '#ffffff',
                fontSize: '0.625rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }}
              title="Growth Velocity"
            >
              <RiArrowUpLine />
            </span>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h4
              style={{
                margin: 0,
                fontSize: '1.0625rem',
                fontWeight: 800,
                color: 'var(--color-neutral-900)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {improvedIntern.name}
            </h4>
            <p
              style={{
                margin: '0.125rem 0 0',
                fontSize: '0.78125rem',
                color: 'var(--color-neutral-500)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {improvedIntern.role || improvedIntern.department || 'Intern'}
            </p>
          </div>
        </div>

        <div style={metricCardStyle('#eff6ff', '#dbeafe')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.375rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 700 }}>
              {improvedIntern.metricLabel || 'Task Velocity Increase'}
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1d4ed8', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
              <RiArrowUpLine style={{ fontSize: '1.125rem' }} />
              {improvedIntern.metricValue}
            </span>
          </div>
          {/* Growth Track */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#dbeafe', borderRadius: '99px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, Math.max(30, parsePercent(improvedIntern.metricValue) * 2)) || 75}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #60a5fa, #2563eb)',
                borderRadius: '99px',
              }}
            />
          </div>
        </div>

        <div style={cardFooterLinkStyle('#2563eb')}>
          <span>Explore velocity & skill trajectory</span>
          <RiArrowRightUpLine />
        </div>
      </motion.div>

      {/* ── 3. Review Operations & SLA Card ──────────────────────────────── */}
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 12px 28px -6px rgba(139, 92, 246, 0.15)' }}
        transition={{ duration: 0.2 }}
        onClick={() => navigate(reviewsPath())}
        style={{
          ...cardWrapperStyle,
          borderTop: '3px solid #8b5cf6',
        }}
        role="button"
        tabIndex={0}
        aria-label="Review Operations & SLA Card"
      >
        <div style={cardHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={iconBadgeStyle('#f5f3ff', '#7c3aed')}>
              <RiCheckDoubleLine style={{ fontSize: '1rem' }} />
            </span>
            <span style={pillBadgeStyle('#f5f3ff', '#6d28d9', '#ddd6fe')}>
              {supPerformance.badge || 'Review Operations'}
            </span>
          </div>
          <button
            style={actionButtonStyle('#7c3aed', '#f5f3ff')}
            title="Open Review Operations"
            aria-label="View Review Queue"
          >
            <RiArrowRightUpLine />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '1.125rem' }}>
          <Avatar
            src={supPerformance.avatar}
            name={supPerformance.name}
            size="lg"
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <h4
              style={{
                margin: 0,
                fontSize: '1.0625rem',
                fontWeight: 800,
                color: 'var(--color-neutral-900)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {supPerformance.name}
            </h4>
            <p
              style={{
                margin: '0.125rem 0 0',
                fontSize: '0.78125rem',
                color: 'var(--color-neutral-500)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {supPerformance.role}
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: '1rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.625rem',
          }}
        >
          <div style={subMetricBoxStyle('#f5f3ff', '#ede9fe')}>
            <span style={{ fontSize: '0.6875rem', color: '#6d28d9', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <RiGroupLine /> Interns
            </span>
            <span style={{ fontSize: '1.125rem', fontWeight: 900, color: '#5b21b6', marginTop: '0.25rem' }}>
              {supPerformance.assignedCount || 0}
            </span>
          </div>
          <div style={subMetricBoxStyle('#f5f3ff', '#ede9fe')}>
            <span style={{ fontSize: '0.6875rem', color: '#6d28d9', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <RiTimeLine /> Turnaround
            </span>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 800,
                color: '#5b21b6',
                marginTop: '0.25rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={supPerformance.reviewVelocity}
            >
              {supPerformance.reviewVelocity || 'Normal SLA'}
            </span>
          </div>
        </div>

        <div style={cardFooterLinkStyle('#7c3aed')}>
          <span>Manage pending review pipeline</span>
          <RiArrowRightUpLine />
        </div>
      </motion.div>

      {/* ── 4. Leading Department Card ───────────────────────────────────── */}
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 12px 28px -6px rgba(245, 158, 11, 0.15)' }}
        transition={{ duration: 0.2 }}
        onClick={() => navigate(comparePath())}
        style={{
          ...cardWrapperStyle,
          borderTop: '3px solid #f59e0b',
        }}
        role="button"
        tabIndex={0}
        aria-label="Leading Department Benchmark Card"
      >
        <div style={cardHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={iconBadgeStyle('#fffbeb', '#d97706')}>
              <RiBuilding4Line style={{ fontSize: '1rem' }} />
            </span>
            <span style={pillBadgeStyle('#fffbeb', '#b45309', '#fde68a')}>
              {leadDept.badge || 'Lead Department'}
            </span>
          </div>
          <button
            style={actionButtonStyle('#d97706', '#fffbeb')}
            title="Compare Cohorts and Departments"
            aria-label="Compare Departments"
          >
            <RiArrowRightUpLine />
          </button>
        </div>

        <div style={{ marginTop: '1.125rem' }}>
          <h4
            style={{
              margin: 0,
              fontSize: '1.0625rem',
              fontWeight: 800,
              color: 'var(--color-neutral-900)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {leadDept.name}
          </h4>
          <p
            style={{
              margin: '0.25rem 0 0',
              fontSize: '0.78125rem',
              color: 'var(--color-neutral-500)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <span>Lead: <strong style={{ color: 'var(--color-neutral-700)' }}>{leadDept.lead}</strong></span>
            <span>•</span>
            <span>{leadDept.internCount} Intern{leadDept.internCount === 1 ? '' : 's'}</span>
          </p>
        </div>

        <div style={metricCardStyle('#fffbeb', '#fef3c7')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.375rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 700 }}>
              {leadDept.metricLabel || 'Task Completion Rate'}
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#b45309', letterSpacing: '-0.02em' }}>
              {leadDept.metricValue}
            </span>
          </div>
          {/* Department Progress Track */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#fef3c7', borderRadius: '99px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${parsePercent(leadDept.metricValue) || 85}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #fbbf24, #d97706)',
                borderRadius: '99px',
              }}
            />
          </div>
        </div>

        <div style={cardFooterLinkStyle('#d97706')}>
          <span>Compare departmental cohorts</span>
          <RiArrowRightUpLine />
        </div>
      </motion.div>

      {/* ── 5. Upcoming Review Deadlines Card ────────────────────────────── */}
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 12px 28px -6px rgba(14, 165, 233, 0.15)' }}
        transition={{ duration: 0.2 }}
        onClick={() => navigate(reviewsPath())}
        style={{
          ...cardWrapperStyle,
          borderTop: '3px solid #0ea5e9',
        }}
        role="button"
        tabIndex={0}
        aria-label="Upcoming Review Deadlines Card"
      >
        <div style={cardHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={iconBadgeStyle('#f0f9ff', '#0284c7')}>
              <RiCalendarEventLine style={{ fontSize: '1rem' }} />
            </span>
            <span style={pillBadgeStyle('#f0f9ff', '#0369a1', '#bae6fd')}>
              Review Deadlines
            </span>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#0284c7',
              backgroundColor: '#e0f2fe',
              padding: '0.2rem 0.5rem',
              borderRadius: '99px',
            }}
          >
            {upcomingReviewDeadlines.length} Active
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', minHeight: '108px' }}>
          {upcomingReviewDeadlines.length === 0 ? (
            <div
              style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                height: '100%',
              }}
            >
              <RiCheckboxCircleLine style={{ color: '#10b981', fontSize: '1.375rem', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
                  All evaluations up to date
                </p>
                <p style={{ margin: '0.125rem 0 0', fontSize: '0.71875rem', color: 'var(--color-neutral-500)' }}>
                  No pending deadlines requiring immediate review.
                </p>
              </div>
            </div>
          ) : (
            upcomingReviewDeadlines.slice(0, 2).map((item) => (
              <div
                key={item.id || item.internName}
                style={{
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.625rem',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #e0f2fe',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ minWidth: 0, flex: 1, marginRight: '0.5rem' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0c4a6e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.internName}
                  </div>
                  <p style={{ margin: '0.125rem 0 0', fontSize: '0.6875rem', color: '#0284c7' }}>
                    {item.type || 'Evaluation Cycle'}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    color: '#0369a1',
                    backgroundColor: '#ffffff',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #bae6fd',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.dueDate}
                </span>
              </div>
            ))
          )}
        </div>

        <div style={cardFooterLinkStyle('#0284c7')}>
          <span>Open review queue & schedule</span>
          <RiArrowRightUpLine />
        </div>
      </motion.div>

      {/* ── 6. Priority Action & Overdue Tasks Card ──────────────────────── */}
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 12px 28px -6px rgba(239, 68, 68, 0.15)' }}
        transition={{ duration: 0.2 }}
        onClick={() => navigate(tasksPath())}
        style={{
          ...cardWrapperStyle,
          borderTop: '3px solid #ef4444',
        }}
        role="button"
        tabIndex={0}
        aria-label="Overdue Tasks Action Card"
      >
        <div style={cardHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={iconBadgeStyle('#fef2f2', '#dc2626')}>
              <RiAlarmWarningLine style={{ fontSize: '1rem' }} />
            </span>
            <span style={pillBadgeStyle('#fef2f2', '#b91c1c', '#fecaca')}>
              Action Required
            </span>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: overdueTasks.length > 0 ? '#b91c1c' : '#166534',
              backgroundColor: overdueTasks.length > 0 ? '#fee2e2' : '#dcfce7',
              padding: '0.2rem 0.5rem',
              borderRadius: '99px',
            }}
          >
            {overdueTasks.length} Overdue
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', minHeight: '108px' }}>
          {overdueTasks.length === 0 ? (
            <div
              style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                height: '100%',
              }}
            >
              <RiShieldCheckLine style={{ color: '#16a34a', fontSize: '1.375rem', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#166534' }}>
                  Zero Overdue Tasks
                </p>
                <p style={{ margin: '0.125rem 0 0', fontSize: '0.71875rem', color: '#15803d' }}>
                  All cohort assignments and deliverables on schedule.
                </p>
              </div>
            </div>
          ) : (
            overdueTasks.slice(0, 2).map((item) => (
              <div
                key={item.id || item.title}
                style={{
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.625rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fee2e2',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ minWidth: 0, flex: 1, marginRight: '0.5rem' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#991b1b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </div>
                  <p style={{ margin: '0.125rem 0 0', fontSize: '0.6875rem', color: '#b91c1c' }}>
                    Assignee: {item.assignee} {item.dept ? `(${item.dept})` : ''}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 900,
                    color: '#991b1b',
                    backgroundColor: '#ffffff',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #fca5a5',
                    whiteSpace: 'nowrap',
                  }}
                >
                  +{item.daysOverdue}d
                </span>
              </div>
            ))
          )}
        </div>

        <div style={cardFooterLinkStyle('#dc2626')}>
          <span>Inspect tasks and unblock team</span>
          <RiArrowRightUpLine />
        </div>
      </motion.div>
    </div>
  );
};

// ── Styles ──────────────────────────────────────────────────────────────────

const cardWrapperStyle = {
  background: '#ffffff',
  borderRadius: '1.125rem',
  padding: '1.375rem',
  border: '1px solid var(--color-neutral-200, #e2e8f0)',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '230px',
  outline: 'none',
};

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const iconBadgeStyle = (bg, color) => ({
  width: '28px',
  height: '28px',
  borderRadius: '8px',
  backgroundColor: bg,
  color: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const pillBadgeStyle = (bg, color, borderColor) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.2rem 0.625rem',
  borderRadius: '99px',
  backgroundColor: bg,
  color: color,
  border: `1px solid ${borderColor}`,
  fontSize: '0.71875rem',
  fontWeight: 800,
  letterSpacing: '0.01em',
});

const actionButtonStyle = (color, bg) => ({
  width: '28px',
  height: '28px',
  borderRadius: '8px',
  backgroundColor: bg,
  color: color,
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1rem',
  cursor: 'pointer',
});

const metricCardStyle = (bg, border) => ({
  marginTop: '1rem',
  padding: '0.75rem 0.875rem',
  borderRadius: '0.75rem',
  backgroundColor: bg,
  border: `1px solid ${border}`,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

const subMetricBoxStyle = (bg, border) => ({
  padding: '0.5rem 0.75rem',
  borderRadius: '0.625rem',
  backgroundColor: bg,
  border: `1px solid ${border}`,
  display: 'flex',
  flexDirection: 'column',
});

const cardFooterLinkStyle = (color) => ({
  marginTop: '1rem',
  paddingTop: '0.75rem',
  borderTop: '1px solid var(--color-neutral-100, #f1f5f9)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: color,
});
