/**
 * @file ComparisonDashboardPage.jsx
 * @description Comparison views comparing Departments, Supervisors, Cohorts, and Time periods.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiBuilding4Line,
  RiUserStarLine,
  RiGroupLine,
  RiCalendarLine,
} from 'react-icons/ri';

import { useAnalyticsStore } from '../../store';
import { TaskCompletionBarChart, PerformanceLineChart } from '../../components/analytics';
import { mockPerformanceComparison } from '../../data';

export default function ComparisonDashboardPage() {
  const { chartData } = useAnalyticsStore();
  const [comparisonMode, setComparisonMode] = useState('department'); // department, supervisor, cohort, month

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            Comparative Performance Analytics
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
            Side-by-side benchmarking across departments, supervisors, cohorts, and timelines
          </p>
        </div>

        {/* Mode Switcher Pills */}
        <div
          style={{
            display: 'flex',
            gap: '0.375rem',
            backgroundColor: 'var(--color-neutral-200)',
            padding: '0.25rem',
            borderRadius: '0.625rem',
          }}
        >
          <ModePill
            icon={RiBuilding4Line}
            label="Dept vs Dept"
            active={comparisonMode === 'department'}
            onClick={() => setComparisonMode('department')}
          />
          <ModePill
            icon={RiUserStarLine}
            label="Supervisor vs Supervisor"
            active={comparisonMode === 'supervisor'}
            onClick={() => setComparisonMode('supervisor')}
          />
          <ModePill
            icon={RiGroupLine}
            label="Cohort vs Cohort"
            active={comparisonMode === 'cohort'}
            onClick={() => setComparisonMode('cohort')}
          />
          <ModePill
            icon={RiCalendarLine}
            label="Month vs Month"
            active={comparisonMode === 'month'}
            onClick={() => setComparisonMode('month')}
          />
        </div>
      </div>

      {/* Synchronized Comparison Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {mockPerformanceComparison.map((item) => (
          <div
            key={item.entity}
            style={{
              background: '#ffffff',
              borderRadius: '1rem',
              padding: '1.25rem',
              border: '1px solid var(--color-neutral-200)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase' }}>
              Benchmarked Entity
            </span>
            <h3 style={{ margin: '0.375rem 0 0.75rem 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
              {item.entity}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>Avg Score:</span>
                <strong style={{ color: 'var(--color-neutral-900)' }}>{item.score} / 5.0</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>Velocity Index:</span>
                <strong style={{ color: '#10b981' }}>{item.taskSpeed}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>Review SLA:</span>
                <strong style={{ color: '#3b82f6' }}>{item.reviewQuality}% On-Time</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Side-by-side Comparative Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
        <TaskCompletionBarChart
          data={chartData?.deptTaskCompletion}
          title={`Task Completion Benchmark: ${comparisonMode.toUpperCase()}`}
        />
        <PerformanceLineChart
          data={chartData?.weeklyTrend}
          title={`Performance Curves: ${comparisonMode.toUpperCase()}`}
        />
      </div>
    </motion.div>
  );
}

function ModePill({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: 'none',
        background: active ? '#ffffff' : 'transparent',
        color: active ? 'var(--color-neutral-900)' : 'var(--color-neutral-600)',
        boxShadow: active ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
        fontWeight: 700,
        fontSize: '0.75rem',
        padding: '0.375rem 0.75rem',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
      }}
    >
      <Icon /> {label}
    </button>
  );
}
