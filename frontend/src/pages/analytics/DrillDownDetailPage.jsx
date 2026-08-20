/**
 * @file DrillDownDetailPage.jsx
 * @description Detailed drill-down view page for Task, Review, Onboarding, and Performance Analytics.
 */

import { useParams, useNavigate } from 'react';
import { motion } from 'framer-motion';
import {
  RiArrowLeftLine,
  RiTaskLine,
  RiStarLine,
  RiCheckboxMultipleLine,
  RiBarChartLine,
} from 'react-icons/ri';
import { useAnalyticsStore } from '../../store';
import {
  PerformanceLineChart,
  TaskCompletionBarChart,
  StatusDonutChart,
  SkillsRadarChart,
  ActivityHeatmap,
} from '../../components/analytics';

export default function DrillDownDetailPage() {
  const { type = 'performance' } = useParams();
  const navigate = useNavigate();
  const { chartData } = useAnalyticsStore();

  const detailsConfig = {
    task: {
      title: 'Detailed Task Analytics & Backlog Velocity',
      icon: RiTaskLine,
      subtitle: 'Individual task completion logs, throughput, and status distributions across engineering squads',
      chart: <TaskCompletionBarChart data={chartData?.deptTaskCompletion} title="Task Breakdown by Department" />,
      secondaryChart: <StatusDonutChart data={chartData?.taskStatus} title="Task Status Ratio" />,
    },
    review: {
      title: 'Detailed Performance Review & SLA Analytics',
      icon: RiStarLine,
      subtitle: 'Supervisor review response velocity, rubric score spreads, and evaluation compliance',
      chart: <StatusDonutChart data={chartData?.reviewStatus} title="Review Approval Pipeline" />,
      secondaryChart: <PerformanceLineChart data={chartData?.weeklyTrend} title="Supervisor Rating Velocity" />,
    },
    onboarding: {
      title: 'Detailed Onboarding Milestone Progression',
      icon: RiCheckboxMultipleLine,
      subtitle: 'Cohort pathway sign-offs, module completion rates, and setup milestone verification',
      chart: <StatusDonutChart data={chartData?.onboardingCompletion} title="Milestone Phase Progression" />,
      secondaryChart: <ActivityHeatmap data={chartData?.heatmapData} title="Onboarding Daily Activity Grid" />,
    },
    performance: {
      title: 'Detailed Intern Performance & Skill Matrix',
      icon: RiBarChartLine,
      subtitle: 'Deep dive into weekly rating growth curves, top performers, and 7-skill rubric radars',
      chart: <PerformanceLineChart data={chartData?.weeklyTrend} title="7-Week Rating Trend Curve" />,
      secondaryChart: <SkillsRadarChart data={chartData?.skillMatrix} title="7-Skill Rubric Benchmark" />,
    },
  };

  const currentConfig = detailsConfig[type] || detailsConfig.performance;
  const Icon = currentConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}
    >
      {/* Top Navigation */}
      <div>
        <button
          onClick={() => navigate(-1)}
          style={{
            border: 'none',
            background: 'transparent',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-primary-600)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginBottom: '0.5rem',
          }}
        >
          <RiArrowLeftLine /> Back to Analytics Overview
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
            }}
          >
            <Icon />
          </span>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
              {currentConfig.title}
            </h2>
            <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
              {currentConfig.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Grid displaying detail charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
        {currentConfig.chart}
        {currentConfig.secondaryChart}
      </div>
    </motion.div>
  );
}
