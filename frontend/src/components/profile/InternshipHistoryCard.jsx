/**
 * @file InternshipHistoryCard.jsx
 * @description Renders internship history (Internship #1, #2, etc.), permits switching
 * between active and completed internship records, and displays detailed period info
 * and final performance summary for completed internships.
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar,
  FiCheckCircle,
  FiAward,
  FiClock,
  FiPlusCircle,
  FiBarChart2,
  FiUserCheck,
  FiFileText,
  FiDownload,
  FiAlertCircle,
  FiExternalLink,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { ROUTES } from '../../constants';

const formatDate = (str) => {
  if (!str) return '—';
  try {
    return new Date(str).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return str;
  }
};

const formatBytes = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const InternshipHistoryCard = ({
  internships = [],
  activeRecordId,
  onSelectRecord,
  onCreateNewRecord,
  isSupervisor = false,
}) => {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);

  const [extraRecords, setExtraRecords] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await api.get(`/interns/${user.id}/history`);
        const list = res?.data?.data?.internships || [];
        if (isMounted && Array.isArray(list) && list.length > 0) {
          setExtraRecords(list);
        }
      } catch {
        // Fallback to prop internships
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };
    fetchHistory();
    return () => { isMounted = false; };
  }, [user?.id]);

  // Combine prop internships and backend extraRecords
  const records = useMemo(() => {
    if (extraRecords.length > 0) {
      return extraRecords.map((r, idx) => ({
        ...r,
        id: r.id,
        internshipNumber: r.internship_number || idx + 1,
        title: r.title || `Internship #${r.internship_number || idx + 1}`,
        startDate: r.start_date || r.startDate,
        endDate: r.end_date || r.endDate,
        department: r.department_name || r.department,
        supervisorName: [r.supervisor_first_name, r.supervisor_last_name].filter(Boolean).join(' ') || r.supervisor,
        status: r.status,
      }));
    }
    return internships;
  }, [extraRecords, internships]);

  const [selectedId, setSelectedId] = useState(
    activeRecordId || records[records.length - 1]?.id || records[0]?.id
  );

  useEffect(() => {
    if (!selectedId && records.length > 0) {
      setSelectedId(records[records.length - 1]?.id || records[0]?.id);
    }
  }, [records, selectedId]);

  const [showModal, setShowModal] = useState(false);
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  const selectedRecord = records.find((r) => r.id === selectedId) || records[0] || null;

  // ── Onboarding documents & compliance for the selected internship record ──
  const [onboardingData, setOnboardingData] = useState({
    loading: false,
    status: null,
    approvedCount: 0,
    totalRequired: 3,
    checklist: [],
    documents: [],
    error: null,
  });
  const [downloadingDocId, setDownloadingDocId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOnboardingDocs = async () => {
      setOnboardingData((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const params = {};
        if (selectedRecord?.id && selectedRecord.id !== 'current') {
          params.internship_record_id = selectedRecord.id;
        }
        const res = await api.get('/onboarding/documents', { params });
        const data = res?.data?.data || res?.data || {};
        if (!isMounted) return;
        setOnboardingData({
          loading: false,
          status: data.status || 'not_started',
          approvedCount: data.approved_count ?? (data.checklist || []).filter((i) => i.review_status === 'approved').length,
          totalRequired: data.total_required || 3,
          checklist: data.checklist || [],
          documents: data.documents || [],
          error: null,
        });
      } catch (err) {
        if (!isMounted) return;
        setOnboardingData((prev) => ({
          ...prev,
          loading: false,
          error: err?.response?.data?.message || 'Failed to load onboarding documents.',
        }));
      }
    };

    fetchOnboardingDocs();
    return () => { isMounted = false; };
  }, [selectedRecord?.id]);

  const handleDownloadDocument = async (doc) => {
    if (!doc?.id) return;
    setDownloadingDocId(doc.id);
    try {
      const res = await api.get(`/documents/${doc.id}/download`);
      const downloadUrl = res?.data?.data?.downloadUrl;
      if (downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = doc.file_name || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success(`Opening ${doc.file_name}…`);
      } else {
        toast.error('Download URL unavailable.');
      }
    } catch (err) {
      toast.error('Could not download document.');
    } finally {
      setDownloadingDocId(null);
    }
  };

  const handleStartNewInternship = (e) => {
    e.preventDefault();
    const today = new Date();
    const start = new Date(newStart);
    const end = new Date(newEnd);

    if (start > today) {
      toast.error('Start date cannot be in the future');
      return;
    }
    if (end > today) {
      toast.error('End date cannot be in the future');
      return;
    }
    if (end < start) {
      toast.error('End date cannot be before start date');
      return;
    }

    if (onCreateNewRecord) {
      onCreateNewRecord({ startDate: newStart, endDate: newEnd });
    } else {
      toast.success(`Internship #${records.length + 1} started successfully!`);
    }
    setShowModal(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card p-6 mb-4"
      style={{
        background: '#ffffff',
        border: '1px solid var(--color-neutral-200)',
        borderRadius: '1rem',
      }}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--color-neutral-900)' }}>
              Internship History & Records
            </h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 99, background: '#e6faff', color: '#0077b6' }}>
              {records.length} Period{records.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)', margin: '0.2rem 0 0 0' }}>
            View details, performance, and summaries per internship period
          </p>
        </div>

        {!isSupervisor && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowModal(true)}
            style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem', borderRadius: '0.5rem', padding: '0.4rem 0.75rem' }}
          >
            <FiPlusCircle style={{ color: '#00b4d8' }} />
            Start New Internship
          </button>
        )}
      </div>

      {/* ── Chronological Internship Selector ──────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
        {records.length === 0 ? (
          <div style={{ width: '100%', padding: '1rem', border: '1px dashed var(--color-neutral-300)', borderRadius: '0.75rem', background: 'var(--color-neutral-50)', color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}>
            No internship records found yet.
          </div>
        ) : records.map((rec) => {
          const isSelected = rec.id === selectedId;
          const isActive = rec.status === 'active' || rec.status === 'onboarding';

          return (
            <button
              key={rec.id}
              type="button"
              onClick={() => {
                setSelectedId(rec.id);
                if (onSelectRecord) onSelectRecord(rec);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.875rem',
                borderRadius: '0.625rem',
                fontSize: '0.8125rem',
                fontWeight: isSelected ? 700 : 500,
                border: isSelected ? '2px solid #00b4d8' : '1px solid var(--color-neutral-200)',
                background: isSelected ? '#e6faff' : '#f9fafb',
                color: isSelected ? '#0077b6' : 'var(--color-neutral-700)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{rec.title || `Internship #${rec.internshipNumber}`}</span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.4rem',
                  borderRadius: 99,
                  background: isActive ? '#dcfce7' : '#f3f4f6',
                  color: isActive ? '#15803d' : '#4b5563',
                }}
              >
                {isActive ? 'Current' : 'Completed'}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Selected Internship Details ──────────────────────── */}
      <AnimatePresence mode="wait">
        {selectedRecord && <motion.div
          key={selectedRecord.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ background: 'var(--color-neutral-50)', padding: '0.75rem 1rem', borderRadius: '0.625rem', border: '1px solid var(--color-neutral-200)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-500)', fontWeight: 600, textTransform: 'uppercase' }}>Period</span>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                {formatDate(selectedRecord.startDate)} → {formatDate(selectedRecord.endDate)}
              </p>
            </div>

            <div style={{ background: 'var(--color-neutral-50)', padding: '0.75rem 1rem', borderRadius: '0.625rem', border: '1px solid var(--color-neutral-200)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-500)', fontWeight: 600, textTransform: 'uppercase' }}>Department</span>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                {selectedRecord.department || '—'}
              </p>
            </div>

            <div style={{ background: 'var(--color-neutral-50)', padding: '0.75rem 1rem', borderRadius: '0.625rem', border: '1px solid var(--color-neutral-200)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-500)', fontWeight: 600, textTransform: 'uppercase' }}>Supervisor</span>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                {selectedRecord.supervisorName || selectedRecord.supervisor || '—'}
              </p>
            </div>

            <div style={{ background: 'var(--color-neutral-50)', padding: '0.75rem 1rem', borderRadius: '0.625rem', border: '1px solid var(--color-neutral-200)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-500)', fontWeight: 600, textTransform: 'uppercase' }}>Status</span>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem', fontWeight: 700, color: selectedRecord.status === 'completed' ? '#15803d' : '#0284c7' }}>
                {selectedRecord.status === 'completed' ? 'Completed' : 'Active'}
              </p>
            </div>
          </div>

          {/* ── Final Performance Summary (For Completed Internships) ──────────────── */}
          {selectedRecord.finalSummary && (
            <div
              style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                border: '1px solid #a7f3d0',
                borderRadius: '0.875rem',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                <FiAward style={{ fontSize: '1.25rem', color: '#059669' }} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#065f46', margin: 0 }}>
                  Final Performance Summary ({selectedRecord.title || `Internship #${selectedRecord.internshipNumber}`})
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '0.875rem' }}>
                <div style={{ background: '#ffffff', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #a7f3d0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 600 }}>Overall Score</span>
                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#065f46' }}>
                    {selectedRecord.finalSummary.overallScore ?? '—'}%
                  </p>
                </div>

                <div style={{ background: '#ffffff', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #a7f3d0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 600 }}>Tasks Completed</span>
                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#065f46' }}>
                    {selectedRecord.finalSummary.tasksCompleted ?? '—'} / {selectedRecord.finalSummary.totalTasks ?? '—'}
                  </p>
                </div>

                <div style={{ background: '#ffffff', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #a7f3d0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 600 }}>Attendance Rate</span>
                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#065f46' }}>
                    {selectedRecord.finalSummary.attendanceRate ?? '—'}%
                  </p>
                </div>
              </div>

              {selectedRecord.finalSummary.feedback && (
                <div style={{ background: '#ffffff', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #a7f3d0' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>Supervisor Final Feedback</span>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: '#15803d', lineHeight: 1.5 }}>
                    "{selectedRecord.finalSummary.feedback}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Onboarding Documents & Records Section ──────────────── */}
          <div
            style={{
              marginTop: '1.25rem',
              background: '#f8fafc',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: '0.875rem',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '8px',
                  background: '#e0f2fe', color: '#0284c7', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
                }}>
                  <FiFileText />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, margin: 0, color: 'var(--color-neutral-900)' }}>
                    Onboarding Documents & Compliance
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: 0 }}>
                    Submitted requirements and compliance verification for {selectedRecord.title || `Internship #${selectedRecord.internshipNumber}`}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  background: onboardingData.status === 'completed' ? '#dcfce7'
                    : onboardingData.status === 'action_required' ? '#fee2e2'
                    : onboardingData.status === 'pending' ? '#fef3c7'
                    : '#f3f4f6',
                  color: onboardingData.status === 'completed' ? '#15803d'
                    : onboardingData.status === 'action_required' ? '#b91c1c'
                    : onboardingData.status === 'pending' ? '#b45309'
                    : '#4b5563',
                }}>
                  {onboardingData.status === 'completed' ? '✓ Completed & Approved'
                    : onboardingData.status === 'action_required' ? '⚠️ Action Required'
                    : onboardingData.status === 'pending' ? '⏳ Under Review'
                    : onboardingData.status === 'in_progress' ? 'In Progress'
                    : 'Not Started'}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-600)' }}>
                  {onboardingData.approvedCount} / {onboardingData.totalRequired} Approved
                </span>
              </div>
            </div>

            {onboardingData.loading ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-neutral-500)', fontSize: '0.8125rem' }}>
                Loading onboarding records for this period…
              </div>
            ) : onboardingData.checklist.length === 0 ? (
              <div style={{ padding: '1.25rem', textAlign: 'center', background: '#ffffff', borderRadius: '0.625rem', border: '1px dashed var(--color-neutral-300)', color: 'var(--color-neutral-500)', fontSize: '0.8125rem' }}>
                No onboarding checklist records found for this period.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {onboardingData.checklist.map((item) => {
                  const isApproved = item.review_status === 'approved';
                  const isRejected = item.review_status === 'rejected' || item.review_status === 'resubmission_required';
                  const isPending = item.review_status === 'pending';
                  const isSubmitted = item.submitted && item.document;

                  return (
                    <div
                      key={item.category}
                      style={{
                        background: '#ffffff',
                        border: isApproved ? '1px solid #bbf7d0' : isRejected ? '1px solid #fecaca' : '1px solid var(--color-neutral-200)',
                        borderRadius: '0.625rem',
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                          <span style={{ fontSize: '1.3rem' }}>📄</span>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
                              {item.title}
                            </p>
                            {isSubmitted ? (
                              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-neutral-500)' }}>
                                {item.document.file_name} • {formatBytes(item.document.file_size)} • Uploaded {formatDate(item.document.created_at || item.document.uploaded_at)}
                              </p>
                            ) : (
                              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-neutral-400)' }}>
                                No document uploaded for this period
                              </p>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            background: isApproved ? '#dcfce7' : isRejected ? '#fee2e2' : isPending ? '#fef3c7' : '#f1f5f9',
                            color: isApproved ? '#15803d' : isRejected ? '#dc2626' : isPending ? '#d97706' : '#64748b',
                            textTransform: 'uppercase',
                          }}>
                            {item.review_status ? item.review_status.replace(/_/g, ' ') : 'Not Submitted'}
                          </span>

                          {isSubmitted && item.document?.id && (
                            <button
                              type="button"
                              onClick={() => handleDownloadDocument(item.document)}
                              disabled={downloadingDocId === item.document.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                background: '#f8fafc',
                                border: '1px solid var(--color-neutral-300)',
                                borderRadius: '0.375rem',
                                padding: '0.25rem 0.6rem',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                color: 'var(--color-neutral-700)',
                              }}
                            >
                              <FiDownload />
                              {downloadingDocId === item.document.id ? 'Loading…' : 'View / Download'}
                            </button>
                          )}

                          {!isSubmitted && (selectedRecord.status === 'active' || selectedRecord.status === 'onboarding') && (
                            <button
                              type="button"
                              onClick={() => navigate(ROUTES.ONBOARDING)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                background: '#e0f2fe',
                                border: '1px solid #bae6fd',
                                borderRadius: '0.375rem',
                                padding: '0.25rem 0.6rem',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                color: '#0369a1',
                              }}
                            >
                              Upload in Onboarding →
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Supervisor notes if present */}
                      {item.document?.review_notes && (
                        <div style={{
                          background: isRejected ? '#fff1f2' : '#f8fafc',
                          borderLeft: `3px solid ${isRejected ? '#f43f5e' : '#0284c7'}`,
                          padding: '0.4rem 0.75rem',
                          borderRadius: '0 0.375rem 0.375rem 0',
                          fontSize: '0.75rem',
                          color: isRejected ? '#9f1239' : 'var(--color-neutral-700)',
                        }}>
                          <span style={{ fontWeight: 700 }}>Supervisor Review Note:</span> {item.document.review_notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>}
      </AnimatePresence>

      {/* ── Modal for Starting New Internship ──────────────── */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: '#ffffff',
              borderRadius: '1rem',
              maxWidth: '440px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 800 }}>
              Start New Internship Period (Internship #{records.length + 1})
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
              Enter start and end dates for your returning internship period.
            </p>

            <form onSubmit={handleStartNewInternship}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    max={todayStr}
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    max={todayStr}
                    min={newStart}
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  style={{ fontSize: '0.8125rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.8125rem' }}
                >
                  Create Internship #{records.length + 1}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default InternshipHistoryCard;
