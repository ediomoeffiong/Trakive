/**
 * @file SavedReportsPage.jsx
 * @description Saved reports management list with actions (open, duplicate, rename, delete, share).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  RiAddLine,
  RiStarLine,
  RiStarFill,
  RiFileCopyLine,
  RiEditLine,
  RiDeleteBin6Line,
  RiShareLine,
  RiExternalLinkLine,
  RiSearchLine,
  RiCalendarLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useAnalyticsStore } from '../../store';
import { EmptyState } from '../../components/analytics';

export default function SavedReportsPage() {
  const navigate = useNavigate();
  const {
    savedReports,
    duplicateReport,
    renameReport,
    deleteReport,
    toggleFavoriteReport,
  } = useAnalyticsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredReports = savedReports.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const startRename = (report) => {
    setEditingId(report.id);
    setEditingTitle(report.title);
  };

  const saveRename = (reportId) => {
    if (editingTitle.trim()) {
      renameReport(reportId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleShare = (reportTitle) => {
    toast.success(`Shareable link copied for "${reportTitle}"`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            Saved Analytics Reports
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
            Access and manage pre-configured report templates and historical metrics exports
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard/reports/builder')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '0.625rem',
            border: 'none',
            backgroundColor: 'var(--color-primary-600)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
          }}
        >
          <RiAddLine /> Create New Report
        </button>
      </div>

      {/* Search & Filter bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
          border: '1px solid var(--color-neutral-200)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <RiSearchLine style={{ color: 'var(--color-neutral-400)', fontSize: '1.125rem' }} />
        <input
          type="text"
          placeholder="Search saved reports by title, tag, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            width: '100%',
            fontSize: '0.875rem',
            color: 'var(--color-neutral-800)',
          }}
        />
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <EmptyState
          type={searchQuery ? 'search' : 'saved'}
          onAction={() => navigate('/dashboard/reports/builder')}
          actionLabel="Build First Report"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredReports.map((report) => (
            <motion.div
              key={report.id}
              whileHover={{ y: -3 }}
              style={{
                background: '#ffffff',
                borderRadius: '1rem',
                padding: '1.25rem',
                border: '1px solid var(--color-neutral-200)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--color-primary-700)',
                      backgroundColor: 'var(--color-primary-50)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '99px',
                    }}
                  >
                    {report.reportType}
                  </span>
                  <button
                    onClick={() => toggleFavoriteReport(report.id)}
                    style={{ border: 'none', background: 'transparent', fontSize: '1.25rem', cursor: 'pointer', color: report.isFavorite ? '#f59e0b' : 'var(--color-neutral-400)' }}
                  >
                    {report.isFavorite ? <RiStarFill /> : <RiStarLine />}
                  </button>
                </div>

                {editingId === report.id ? (
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      style={{ flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.875rem', borderRadius: '0.375rem', border: '1px solid var(--color-primary-500)' }}
                    />
                    <button onClick={() => saveRename(report.id)} style={{ padding: '0.25rem 0.5rem', background: 'var(--color-primary-600)', color: '#fff', border: 'none', borderRadius: '0.375rem', fontSize: '0.75rem' }}>
                      Save
                    </button>
                  </div>
                ) : (
                  <h3 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                    {report.title}
                  </h3>
                )}

                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-500)', lineHeight: 1.4 }}>
                  {report.description}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.75rem' }}>
                  {report.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-neutral-600)', backgroundColor: 'var(--color-neutral-100)', padding: '0.125rem 0.5rem', borderRadius: '4px' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <RiCalendarLine /> {report.lastGenerated}
                </span>

                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button onClick={() => navigate('/dashboard/analytics')} title="Open Report" style={iconActionStyle}>
                    <RiExternalLinkLine />
                  </button>
                  <button onClick={() => duplicateReport(report.id)} title="Duplicate Report" style={iconActionStyle}>
                    <RiFileCopyLine />
                  </button>
                  <button onClick={() => startRename(report)} title="Rename Report" style={iconActionStyle}>
                    <RiEditLine />
                  </button>
                  <button onClick={() => handleShare(report.title)} title="Share Report" style={iconActionStyle}>
                    <RiShareLine />
                  </button>
                  <button onClick={() => deleteReport(report.id)} title="Delete Report" style={{ ...iconActionStyle, color: 'var(--color-danger-600)' }}>
                    <RiDeleteBin6Line />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

const iconActionStyle = {
  border: 'none',
  background: 'transparent',
  fontSize: '1.125rem',
  color: 'var(--color-neutral-600)',
  cursor: 'pointer',
  padding: '0.25rem',
  borderRadius: '0.25rem',
};
