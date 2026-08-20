/**
 * @file AnalyticsCharts.jsx
 * @description Generic Recharts visualization wrappers and GitHub-style contribution Heatmap grid.
 */

import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const cardStyle = {
  background: '#ffffff',
  borderRadius: '1rem',
  padding: '1.25rem',
  border: '1px solid var(--color-neutral-200)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

const tooltipStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '0.625rem',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  fontSize: '0.8125rem',
  padding: '0.5rem 0.75rem',
};

// 1. Line Chart: Weekly / Monthly Performance Trend
export const PerformanceLineChart = ({ data = [], title = 'Weekly Performance', description = 'Average intern ratings vs benchmark target score' }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          {title}
        </h3>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
          {description}
        </p>
      </div>
      <div style={{ width: '100%', height: 260, minHeight: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={data[0]?.period ? 'period' : 'month'} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis domain={[3.0, 5.0]} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
            <Line
              type="monotone"
              dataKey="avgScore"
              name="Average Rating"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4, fill: '#2563eb' }}
              activeDot={{ r: 6 }}
            />
            {data[0]?.targetScore && (
              <Line
                type="monotone"
                dataKey="targetScore"
                name="Benchmark Target"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
              />
            )}
            {data[0]?.topPerformerScore && (
              <Line
                type="monotone"
                dataKey="topPerformerScore"
                name="Top Performer"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3, fill: '#10b981' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// 2. Bar Chart: Task Completion by Department
export const TaskCompletionBarChart = ({ data = [], title = 'Task Completion by Department', description = 'Breakdown of tasks completed, active, and in review' }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={cardStyle}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          {title}
        </h3>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
          {description}
        </p>
      </div>
      <div style={{ width: '100%', height: 260, minHeight: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
            <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="inProgress" name="In Progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pendingReview" name="Pending Review" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// 3. Donut / Pie Chart: Status Distribution
export const StatusDonutChart = ({ data = [], title = 'Task Status Distribution', description = 'Current state breakdown of assigned tasks' }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={cardStyle}>
      <div style={{ marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          {title}
        </h3>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
          {description}
        </p>
      </div>
      <div style={{ width: '100%', height: 260, minHeight: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// 4. Area Chart: Productivity Growth Over Time
export const ProductivityAreaChart = ({ data = [], title = 'Productivity Growth', description = 'Monthly task completion throughput and commit volume' }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={cardStyle}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          {title}
        </h3>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
          {description}
        </p>
      </div>
      <div style={{ width: '100%', height: 260, minHeight: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
            <Area
              type="monotone"
              dataKey="velocity"
              name="Productivity Index"
              stroke="#2563eb"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorVelocity)"
            />
            <Area
              type="monotone"
              dataKey="velocityBenchmark"
              name="Baseline Standard"
              stroke="#94a3b8"
              strokeDasharray="3 3"
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// 5. Radar Chart: 7-Skill Dimension Comparison Matrix
export const SkillsRadarChart = ({ data = [], title = 'Skill Evaluation', description = 'Competency rating breakdown across core engineering rubrics' }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={cardStyle}>
      <div style={{ marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          {title}
        </h3>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
          {description}
        </p>
      </div>
      <div style={{ width: '100%', height: 260, minHeight: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius={80} data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#475569' }} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }} />
            <Radar
              name="Intern Score"
              dataKey="internScore"
              stroke="#4f46e5"
              fill="#6366f1"
              fillOpacity={0.5}
            />
            <Radar
              name="Dept Average"
              dataKey="deptAverage"
              stroke="#94a3b8"
              fill="#cbd5e1"
              fillOpacity={0.3}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// 6. GitHub-style Contribution Heatmap UI Mock
export const ActivityHeatmap = ({ data = [], title = 'Internship Contribution & Activity Heatmap', description = 'Daily activity logs over the past 26 weeks' }) => {
  // Color palette level mapping
  const levelColors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={cardStyle}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            {title}
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
            {description}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
          <span>Less</span>
          {levelColors.map((color, i) => (
            <span key={i} style={{ width: 10, height: 10, backgroundColor: color, borderRadius: 2, display: 'inline-block' }} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '3px', minWidth: '650px' }}>
          {Array.from({ length: Math.ceil(data.length / 7) }).map((_, weekIdx) => (
            <div key={weekIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {data.slice(weekIdx * 7, weekIdx * 7 + 7).map((item, dayIdx) => (
                <div
                  key={dayIdx}
                  title={`${item.date}: ${item.count} activity submissions`}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    backgroundColor: levelColors[item.level] || levelColors[0],
                    transition: 'transform 0.15s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.3)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
