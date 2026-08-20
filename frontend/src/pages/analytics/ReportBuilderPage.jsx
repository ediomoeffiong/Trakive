/**
 * @file ReportBuilderPage.jsx
 * @description Report Creation & Customization Builder interface with Live Preview.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  RiSaveLine,
  RiArrowLeftLine,
  RiEyeLine,
  RiCheckLine,
} from 'react-icons/ri';
import { useAnalyticsStore } from '../../store';
import { PerformanceLineChart } from '../../components/analytics';

export default function ReportBuilderPage() {
  const navigate = useNavigate();
  const { createSavedReport, chartData } = useAnalyticsStore();

  const [title, setTitle] = useState('Monthly Engineering Intern Assessment');
  const [description, setDescription] = useState('Detailed breakdown of intern task completion, code quality, and supervisor SLA velocity.');
  const [reportType, setReportType] = useState('Performance Analytics');
  const [period, setPeriod] = useState('This Month');
  const [dataSource, setDataSource] = useState('FifthLab Engineering');
  const [selectedMetrics, setSelectedMetrics] = useState(['Overall Rating', 'Task Speed', 'Onboarding Step Sign-offs']);


  const availableMetrics = [
    'Overall Rating',
    'Task Speed',
    'Onboarding Step Sign-offs',
    'Code Quality Index',
    'Attendance Score',
    'Review Response Velocity',
  ];

  const toggleMetric = (metric) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter((m) => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  const handleSave = async () => {
    await createSavedReport({
      title,
      description,
      reportType,
      period,
      metrics: selectedMetrics,
    });
    navigate('/dashboard/reports/saved');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}
    >
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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
              marginBottom: '0.25rem',
            }}
          >
            <RiArrowLeftLine /> Back to Analytics
          </button>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            Custom Report Builder
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/dashboard/reports/saved')}
            style={btnSecondaryStyle}
          >
            Cancel
          </button>
          <button onClick={handleSave} style={btnPrimaryStyle}>
            <RiSaveLine /> Save Report Template
          </button>
        </div>
      </div>

      {/* Grid: Form Controls Left, Live Preview Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Left: Configuration Form */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid var(--color-neutral-200)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            Report Specifications
          </h3>

          <div>
            <label style={labelStyle}>Report Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Report Category</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={inputStyle}>
                <option>Performance Analytics</option>
                <option>Task Analytics</option>
                <option>Onboarding Analytics</option>
                <option>Review Analytics</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Reporting Period</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value)} style={inputStyle}>
                <option>This Month</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Quarter to Date</option>
                <option>Year to Date</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Data Source Filter</label>
            <select value={dataSource} onChange={(e) => setDataSource(e.target.value)} style={inputStyle}>
              <option>FifthLab Engineering</option>
              <option>Human Resources</option>
              <option>UI/UX Design</option>
              <option>All Departments</option>
            </select>
          </div>

          {/* Included Metrics Selector */}
          <div>
            <label style={labelStyle}>Included Metrics ({selectedMetrics.length})</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.375rem' }}>
              {availableMetrics.map((metric) => {
                const active = selectedMetrics.includes(metric);
                return (
                  <button
                    key={metric}
                    type="button"
                    onClick={() => toggleMetric(metric)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '99px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: active ? '1px solid var(--color-primary-600)' : '1px solid var(--color-neutral-300)',
                      backgroundColor: active ? 'var(--color-primary-50)' : '#ffffff',
                      color: active ? 'var(--color-primary-700)' : 'var(--color-neutral-700)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    {active && <RiCheckLine />} {metric}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid var(--color-neutral-200)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <RiEyeLine style={{ color: 'var(--color-primary-600)' }} /> Live Data Preview
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success-600)', backgroundColor: '#ecfdf5', padding: '0.25rem 0.5rem', borderRadius: '99px' }}>
              Interactive Preview
            </span>
          </div>

          <div style={{ padding: '1rem', borderRadius: '0.75rem', backgroundColor: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{title}</h4>
            <p style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>{description}</p>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-600)' }}>
              <span>Category: {reportType}</span>
              <span>Period: {period}</span>
            </div>
          </div>

          {/* Chart Preview */}
          <PerformanceLineChart data={chartData?.weeklyTrend} title="Preview: Performance Curve" />
        </div>
      </div>
    </motion.div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 700,
  color: 'var(--color-neutral-700)',
  marginBottom: '0.375rem',
};

const inputStyle = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  fontSize: '0.875rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--color-neutral-300)',
  outline: 'none',
  backgroundColor: '#ffffff',
};

const btnPrimaryStyle = {
  padding: '0.625rem 1.25rem',
  borderRadius: '0.5rem',
  border: 'none',
  backgroundColor: 'var(--color-primary-600)',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '0.875rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
};

const btnSecondaryStyle = {
  padding: '0.625rem 1.25rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--color-neutral-300)',
  backgroundColor: '#ffffff',
  color: 'var(--color-neutral-700)',
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: 'pointer',
};
