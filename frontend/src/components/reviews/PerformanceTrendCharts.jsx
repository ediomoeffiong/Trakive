/**
 * @file PerformanceTrendCharts.jsx
 * @description Tabbed chart component: Line (trend), Radar (category breakdown), Bar (averages).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

// ── Shared chart style tokens ──────────────────────────────────────────────────

const COLORS = {
  overall:       '#6366f1',
  productivity:  '#22c55e',
  quality:       '#3b82f6',
  communication: '#f59e0b',
  initiative:    '#a855f7',
  teamwork:      '#ec4899',
};

const BAR_COLORS = ['#6366f1', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899'];

const tooltipStyle = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '0.625rem',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  padding: '0.75rem 1rem',
  fontSize: '0.8125rem',
};

// ── Tab config ──────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'line',  label: '📈 Trend' },
  { key: 'radar', label: '🕸️ Breakdown' },
  { key: 'bar',   label: '📊 Averages' },
];

// ── Chart sub-components ───────────────────────────────────────────────────────

const TrendLineChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={280}>
    <LineChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
      <XAxis dataKey="period" tick={{ fontSize: 12, fill: 'var(--color-neutral-500)' }} axisLine={false} tickLine={false} />
      <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: 'var(--color-neutral-500)' }} axisLine={false} tickLine={false} />
      <ChartTooltip contentStyle={tooltipStyle} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.75rem' }} />
      <Line type="monotone" dataKey="overall"       stroke={COLORS.overall}       strokeWidth={2.5} dot={{ r: 4 }} name="Overall" />
      <Line type="monotone" dataKey="productivity"  stroke={COLORS.productivity}  strokeWidth={1.5} dot={{ r: 3 }} name="Productivity" strokeDasharray="4 2" />
      <Line type="monotone" dataKey="quality"       stroke={COLORS.quality}       strokeWidth={1.5} dot={{ r: 3 }} name="Quality" strokeDasharray="4 2" />
      <Line type="monotone" dataKey="communication" stroke={COLORS.communication} strokeWidth={1.5} dot={{ r: 3 }} name="Communication" strokeDasharray="4 2" />
      <Line type="monotone" dataKey="initiative"    stroke={COLORS.initiative}    strokeWidth={1.5} dot={{ r: 3 }} name="Initiative" strokeDasharray="4 2" />
      <Line type="monotone" dataKey="teamwork"      stroke={COLORS.teamwork}      strokeWidth={1.5} dot={{ r: 3 }} name="Teamwork" strokeDasharray="4 2" />
    </LineChart>
  </ResponsiveContainer>
);

const CategoryRadarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RadarChart data={data} margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
      <PolarGrid stroke="var(--color-border)" />
      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: 'var(--color-neutral-600)' }} />
      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--color-neutral-400)' }} />
      <Radar
        name="Score"
        dataKey="score"
        stroke={COLORS.overall}
        fill={COLORS.overall}
        fillOpacity={0.2}
        strokeWidth={2}
        dot={{ r: 4, fill: COLORS.overall }}
      />
      <ChartTooltip contentStyle={tooltipStyle} />
    </RadarChart>
  </ResponsiveContainer>
);

const CategoryBarChart = ({ data }) => {
  // Compute per-category averages across all periods
  const categories = ['productivity', 'quality', 'communication', 'initiative', 'teamwork'];
  const avgData = categories.map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    avg: Math.round(data.reduce((sum, d) => sum + (d[cat] ?? 0), 0) / (data.length || 1)),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={avgData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-neutral-500)' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--color-neutral-500)' }} axisLine={false} tickLine={false} />
        <ChartTooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--color-neutral-50)' }} />
        <Bar dataKey="avg" name="Average Score" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {avgData.map((_, i) => (
            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const PerformanceTrendCharts = ({ trends = [], radarData = [] }) => {
  const [activeTab, setActiveTab] = useState('line');

  return (
    <section
      style={{
        background: 'var(--color-surface)',
        borderRadius: '1rem',
        border: '1px solid var(--color-border)',
        padding: '1.75rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
          📈 Performance Trends
        </h2>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            gap: '0.25rem',
            background: 'var(--color-neutral-100)',
            borderRadius: '0.625rem',
            padding: '0.25rem',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: '0.4rem',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                background: activeTab === tab.key ? 'var(--color-surface)' : 'transparent',
                color: activeTab === tab.key ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
                boxShadow: activeTab === tab.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'line'  && <TrendLineChart  data={trends} />}
          {activeTab === 'radar' && <CategoryRadarChart data={radarData} />}
          {activeTab === 'bar'   && <CategoryBarChart data={trends} />}
        </motion.div>
      </AnimatePresence>

      {/* Caption */}
      <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', textAlign: 'center', margin: '1rem 0 0' }}>
        {activeTab === 'line'  && 'Performance scores across all published review periods'}
        {activeTab === 'radar' && 'Current period score breakdown across all evaluation categories'}
        {activeTab === 'bar'   && 'Average category scores across all review periods'}
      </p>
    </section>
  );
};

export default PerformanceTrendCharts;
