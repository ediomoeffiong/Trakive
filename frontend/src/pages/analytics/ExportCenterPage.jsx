/**
 * @file ExportCenterPage.jsx
 * @description Export center interface supporting PDF, Excel, and CSV simulated exports.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiFilePdfLine,
  RiFileExcelLine,
  RiFileTextLine,
  RiDownload2Line,
  RiHistoryLine,
  RiCheckboxCircleLine,
} from 'react-icons/ri';

import { useAnalyticsStore } from '../../store';
import { ExportProgressModal } from '../../components/analytics';

export default function ExportCenterPage() {
  const { runExport, isExporting, exportProgress, exportHistory } = useAnalyticsStore();

  const [fileName, setFileName] = useState('Trakive_Performance_Report_Q2_2026');
  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [orientation, setOrientation] = useState('Landscape');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [includeCharts, setIncludeCharts] = useState(true);

  const handleTriggerExport = () => {
    runExport({
      fileName: `${fileName}.${selectedFormat.toLowerCase()}`,
      format: selectedFormat,
      orientation,
      dateRange,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}
    >
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
          Export & Download Center
        </h2>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
          Generate presentation-ready PDF reports, Excel spreadsheets, or CSV data exports
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Export Form */}
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
            Export Configuration
          </h3>

          {/* Format Selector Cards */}
          <div>
            <label style={labelStyle}>Select File Format</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <FormatCard
                icon={RiFilePdfLine}
                label="PDF Document"
                active={selectedFormat === 'PDF'}
                onClick={() => setSelectedFormat('PDF')}
              />
              <FormatCard
                icon={RiFileExcelLine}
                label="Excel Sheet"
                active={selectedFormat === 'Excel'}
                onClick={() => setSelectedFormat('Excel')}
              />
              <FormatCard
                icon={RiFileTextLine}
                label="CSV Raw Data"
                active={selectedFormat === 'CSV'}
                onClick={() => setSelectedFormat('CSV')}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>File Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Page Orientation</label>
              <select value={orientation} onChange={(e) => setOrientation(e.target.value)} style={inputStyle}>
                <option>Landscape (Recommended)</option>
                <option>Portrait</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Date Range</label>
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={inputStyle}>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Year to Date</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="chartsCheck"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e.target.checked)}
            />
            <label htmlFor="chartsCheck" style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-700)', fontWeight: 600 }}>
              Include Recharts high-resolution graph graphics
            </label>
          </div>

          <button
            onClick={handleTriggerExport}
            disabled={isExporting}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.625rem',
              border: 'none',
              backgroundColor: 'var(--color-primary-600)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
            }}
          >
            <RiDownload2Line /> Start Report Export
          </button>
        </div>

        {/* History Log */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid var(--color-neutral-200)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <RiHistoryLine /> Export History Log
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {exportHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.75rem',
                  backgroundColor: 'var(--color-neutral-50)',
                  border: '1px solid var(--color-neutral-200)',
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                    {item.fileName}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                    {item.date} • {item.size}
                  </span>
                </div>

                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success-600)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <RiCheckboxCircleLine /> {item.status}
                </span>

              </div>
            ))}
          </div>
        </div>
      </div>

      <ExportProgressModal
        isOpen={isExporting}
        progress={exportProgress}
        format={selectedFormat}
        fileName={`${fileName}.${selectedFormat.toLowerCase()}`}
      />
    </motion.div>
  );
}

function FormatCard({ icon: Icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '0.875rem 0.5rem',
        borderRadius: '0.625rem',
        border: active ? '2px solid var(--color-primary-600)' : '1px solid var(--color-neutral-200)',
        backgroundColor: active ? 'var(--color-primary-50)' : '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.375rem',
        cursor: 'pointer',
      }}
    >
      <Icon style={{ fontSize: '1.5rem', color: active ? 'var(--color-primary-600)' : 'var(--color-neutral-500)' }} />
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: active ? 'var(--color-primary-700)' : 'var(--color-neutral-700)' }}>
        {label}
      </span>
    </div>
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
