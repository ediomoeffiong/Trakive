/**
 * @file ReportCard.jsx
 * @description Summary cards displaying highlighted metrics with drill-down navigation support.
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  RiTrophyLine,
  RiArrowRightLine,
  RiAlarmWarningLine,
  RiCheckDoubleLine,
  RiBuildingLine,
  RiUserStarLine,
} from 'react-icons/ri';


export const ReportSummaryGrid = ({ summaryCards }) => {
  const navigate = useNavigate();

  if (!summaryCards) return null;

  const {
    bestPerformingIntern,
    mostImprovedIntern,
    supervisorPerformance,
    highestPerformingDept,
    upcomingReviewDeadlines = [],
    overdueTasks = [],
  } = summaryCards;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
      }}
    >
      {/* 1. Best Performing Intern */}
      {bestPerformingIntern && (
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => navigate('/dashboard/analytics/drilldown/performance')}
          style={cardWrapperStyle}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={badgeStyle('#ecfdf5', '#047857')}>
              <RiTrophyLine /> {bestPerformingIntern.badge}
            </span>
            <RiArrowRightLine style={{ color: 'var(--color-neutral-400)', fontSize: '1.25rem' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
            <img
              src={bestPerformingIntern.avatar}
              alt={bestPerformingIntern.name}
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                {bestPerformingIntern.name}
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                {bestPerformingIntern.role} • {bestPerformingIntern.department}
              </p>
            </div>
          </div>

          <div style={metricBoxStyle('#f0fdf4')}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-600)', fontWeight: 600 }}>
              {bestPerformingIntern.metricLabel}
            </span>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#15803d' }}>
              {bestPerformingIntern.metricValue}
            </span>
          </div>
        </motion.div>
      )}

      {/* 2. Most Improved Intern */}
      {mostImprovedIntern && (
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => navigate('/dashboard/analytics/drilldown/performance')}
          style={cardWrapperStyle}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={badgeStyle('#eff6ff', '#1d4ed8')}>
              <RiUserStarLine /> {mostImprovedIntern.badge}
            </span>
            <RiArrowRightLine style={{ color: 'var(--color-neutral-400)', fontSize: '1.25rem' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
            <img
              src={mostImprovedIntern.avatar}
              alt={mostImprovedIntern.name}
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                {mostImprovedIntern.name}
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                {mostImprovedIntern.role}
              </p>
            </div>
          </div>

          <div style={metricBoxStyle('#eff6ff')}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-600)', fontWeight: 600 }}>
              {mostImprovedIntern.metricLabel}
            </span>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1d4ed8' }}>
              {mostImprovedIntern.metricValue}
            </span>
          </div>
        </motion.div>
      )}

      {/* 3. Supervisor Performance */}
      {supervisorPerformance && (
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => navigate('/dashboard/analytics/drilldown/review')}
          style={cardWrapperStyle}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={badgeStyle('#f5f3ff', '#6d28d9')}>
              <RiCheckDoubleLine /> {supervisorPerformance.badge}
            </span>
            <RiArrowRightLine style={{ color: 'var(--color-neutral-400)', fontSize: '1.25rem' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
            <img
              src={supervisorPerformance.avatar}
              alt={supervisorPerformance.name}
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                {supervisorPerformance.name}
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                {supervisorPerformance.role} ({supervisorPerformance.assignedCount} interns)
              </p>
            </div>
          </div>

          <div style={metricBoxStyle('#f5f3ff')}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-600)', fontWeight: 600 }}>
              Turnaround SLA
            </span>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#6d28d9' }}>
              {supervisorPerformance.reviewVelocity}
            </span>
          </div>
        </motion.div>
      )}

      {/* 4. Highest Performing Department */}
      {highestPerformingDept && (
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => navigate('/dashboard/analytics/compare')}
          style={cardWrapperStyle}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={badgeStyle('#fffbe6', '#b45309')}>
              <RiBuildingLine /> {highestPerformingDept.badge}
            </span>
            <RiArrowRightLine style={{ color: 'var(--color-neutral-400)', fontSize: '1.25rem' }} />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              {highestPerformingDept.name}
            </h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
              Lead: {highestPerformingDept.lead} • {highestPerformingDept.internCount} Interns
            </p>
          </div>

          <div style={metricBoxStyle('#fffbe6')}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-600)', fontWeight: 600 }}>
              {highestPerformingDept.metricLabel}
            </span>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#b45309' }}>
              {highestPerformingDept.metricValue}
            </span>
          </div>
        </motion.div>
      )}

      {/* 5. Upcoming Review Deadlines */}
      <motion.div
        whileHover={{ y: -3 }}
        onClick={() => navigate('/dashboard/analytics/drilldown/review')}
        style={cardWrapperStyle}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Upcoming Deadlines
          </h4>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-600)' }}>
            View All ({upcomingReviewDeadlines.length})
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.75rem' }}>
          {upcomingReviewDeadlines.slice(0, 2).map((item) => (
            <div
              key={item.id}
              style={{
                padding: '0.5rem 0.625rem',
                borderRadius: '0.5rem',
                backgroundColor: 'var(--color-neutral-50)',
                border: '1px solid var(--color-neutral-200)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                <span>{item.internName}</span>
                <span style={{ color: 'var(--color-warning-600)', fontSize: '0.75rem' }}>{item.dueDate}</span>
              </div>
              <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                {item.type}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 6. Overdue Tasks */}
      <motion.div
        whileHover={{ y: -3 }}
        onClick={() => navigate('/dashboard/analytics/drilldown/task')}
        style={cardWrapperStyle}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-danger-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <RiAlarmWarningLine /> Overdue Tasks ({overdueTasks.length})
          </h4>
          <RiArrowRightLine style={{ color: 'var(--color-neutral-400)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.75rem' }}>
          {overdueTasks.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '0.5rem 0.625rem',
                borderRadius: '0.5rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, color: '#b91c1c' }}>
                <span>{item.title}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>+{item.daysOverdue}d</span>
              </div>
              <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.75rem', color: '#991b1b' }}>
                Assignee: {item.assignee} ({item.dept})
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const cardWrapperStyle = {
  background: '#ffffff',
  borderRadius: '1rem',
  padding: '1.25rem',
  border: '1px solid var(--color-neutral-200)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
  cursor: 'pointer',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
};

const badgeStyle = (bg, color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  padding: '0.25rem 0.625rem',
  borderRadius: '99px',
  backgroundColor: bg,
  color: color,
  fontSize: '0.75rem',
  fontWeight: 700,
});

const metricBoxStyle = (bg) => ({
  marginTop: '1rem',
  padding: '0.625rem 0.75rem',
  borderRadius: '0.625rem',
  backgroundColor: bg,
  display: 'flex',
  justify: 'space-between',
  alignItems: 'center',
});
