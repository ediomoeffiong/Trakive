import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  RiDownload2Line,
  RiFilePdf2Line,
  RiRefreshLine,
  RiAddCircleLine,
  RiListCheck,
  RiFeedbackLine,
  RiBarChartBoxLine,
  RiSettings4Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from 'react-icons/ri';
import { Card, Button } from '../../components/ui';
import {
  SupervisorAttendanceKPIs,
  SupervisorRosterTable,
  SupervisorCorrectionQueue,
  SupervisorAttendanceCharts,
  SupervisorAttendanceSettings,
  ManualAttendanceModal,
  ReviewCorrectionModal,
} from '../../components/supervisor/attendance';
import { attendanceService } from '../../services/attendanceService';
import { useCurrentUser } from '../../store';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const TABS = [
  { id: 'roster', label: 'Intern Roster', icon: RiListCheck },
  { id: 'corrections', label: 'Correction Requests', icon: RiFeedbackLine, showBadge: true },
  { id: 'analytics', label: 'Analytics & Trends', icon: RiBarChartBoxLine },
  { id: 'settings', label: 'Policies & Geofencing', icon: RiSettings4Line },
];

const AttendanceDashboard = () => {
  const user = useCurrentUser();
  const [date, setDate] = useState(todayIso());
  const [dashboard, setDashboard] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('roster');

  // Modal states
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedInternForManual, setSelectedInternForManual] = useState(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedCorrectionForReview, setSelectedCorrectionForReview] = useState(null);
  const [reviewAction, setReviewAction] = useState('approved');

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const [dash, conf] = await Promise.all([
        attendanceService.getSupervisorDashboard({ date }),
        attendanceService.getConfig(),
      ]);
      setDashboard(dash);
      setConfig(conf);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to load supervisor attendance dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Date jumper helpers
  const handleStepDay = (delta) => {
    const current = new Date(`${date}T12:00:00Z`);
    current.setUTCDate(current.getUTCDate() + delta);
    setDate(current.toISOString().slice(0, 10));
  };

  const handleSetToday = () => {
    setDate(todayIso());
  };

  // Export handler
  const handleExport = async (format) => {
    setExporting(true);
    try {
      const response = await attendanceService.exportReport({ date, format });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      const disposition = response.headers?.['content-disposition'] || '';
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] || `attendance-${date}.${format}`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported attendance as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to export attendance report.');
    } finally {
      setExporting(false);
    }
  };

  // Manual Adjust trigger
  const handleOpenManual = (intern = null) => {
    setSelectedInternForManual(intern);
    setIsManualModalOpen(true);
  };

  // Review Correction trigger
  const handleOpenReview = (request, action) => {
    setSelectedCorrectionForReview(request);
    setReviewAction(action);
    setIsReviewModalOpen(true);
  };

  const supervisorName = user?.name?.split(' ')[0] || 'Supervisor';
  const pendingCorrectionsCount = (dashboard?.correction_queue || []).length;
  const isPhysicalDay = Boolean(dashboard?.required);
  const dayType = dashboard?.day_type;

  const dateObject = new Date(`${date}T12:00:00`);
  const formattedDateTitle = dateObject.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        paddingBottom: '3.5rem',
        minWidth: 0,
        maxWidth: '100%',
      }}
    >
      {/* ── 1. Hero Overview Banner ────────────────────────────────────────── */}
      <section
        className="accent-banner"
        style={{
          background: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
          borderRadius: '1.25rem',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          boxShadow: '0 8px 32px rgba(0, 180, 216, 0.22)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              color: '#ffffff',
            }}>
              SUPERVISOR ATTENDANCE HUB
            </span>

            {/* Day Type Badge */}
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: isPhysicalDay ? 'rgba(34, 197, 94, 0.35)' : dayType === 'online' ? 'rgba(14, 165, 233, 0.35)' : 'rgba(255, 255, 255, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              color: '#ffffff',
            }}>
              {isPhysicalDay ? '📍 Physical Office Workday' : dayType === 'online' ? '💻 Online Work Day' : '🎉 Holiday / Closure'}
            </span>
          </div>

          <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            Attendance Oversight, {supervisorName} 👋
          </h2>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(255, 255, 255, 0.95)', lineHeight: 1.55 }}>
            {isPhysicalDay
              ? 'Physical office presence is required today. Live GPS verification is active.'
              : (dayType === 'online'
                ? 'Online Work Day — Interns automatically receive attendance credit upon completing weekly tasks.'
                : 'No mandatory office check-in scheduled for this date.')}
          </p>
        </div>

        {/* Action Controls in Hero */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <Button
            size="sm"
            onClick={() => handleOpenManual()}
            style={{
              background: '#ffffff',
              color: '#0077b6',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            }}
          >
            <RiAddCircleLine style={{ marginRight: '0.35rem' }} />
            Manual Attendance
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExport('csv')}
            disabled={exporting}
            style={{
              borderColor: 'rgba(255, 255, 255, 0.4)',
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <RiDownload2Line style={{ marginRight: '0.25rem' }} /> CSV
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            style={{
              borderColor: 'rgba(255, 255, 255, 0.4)',
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <RiFilePdf2Line style={{ marginRight: '0.25rem' }} /> PDF
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => loadData(true)}
            style={{
              borderColor: 'rgba(255, 255, 255, 0.4)',
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <RiRefreshLine style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none', marginRight: '0.25rem' }} />
            {refreshing ? 'Syncing...' : 'Refresh'}
          </Button>
        </div>
      </section>

      {/* ── 2. Interactive Date Navigation Bar ─────────────────────────────── */}
      <section style={{
        background: '#ffffff',
        border: '1px solid var(--color-neutral-200)',
        borderRadius: '0.875rem',
        padding: '0.875rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {/* Left: Day stepping */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => handleStepDay(-1)}
            aria-label="Previous Day"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              border: '1px solid var(--color-neutral-200)',
              background: '#ffffff',
              cursor: 'pointer',
              color: 'var(--color-neutral-700)',
              transition: 'background-color 0.15s ease',
            }}
          >
            <RiArrowLeftSLine fontSize="1.2rem" />
          </button>

          <button
            type="button"
            onClick={() => handleStepDay(1)}
            aria-label="Next Day"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              border: '1px solid var(--color-neutral-200)',
              background: '#ffffff',
              cursor: 'pointer',
              color: 'var(--color-neutral-700)',
              transition: 'background-color 0.15s ease',
            }}
          >
            <RiArrowRightSLine fontSize="1.2rem" />
          </button>

          <Button size="xs" variant="outline" onClick={handleSetToday}>
            Today
          </Button>

          <strong style={{ marginLeft: '0.5rem', fontSize: '1rem', color: 'var(--color-neutral-900)' }}>
            {formattedDateTitle}
          </strong>
        </div>

        {/* Right: Date Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>
            Select Date:
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              border: '1px solid var(--color-neutral-300)',
              borderRadius: '0.5rem',
              padding: '0.45rem 0.75rem',
              fontFamily: 'inherit',
              fontSize: '0.85rem',
              color: 'var(--color-neutral-800)',
              background: '#ffffff',
            }}
          />
        </div>
      </section>

      {/* ── 3. KPI Summary Metrics ─────────────────────────────────────────── */}
      <section>
        <SupervisorAttendanceKPIs
          dashboard={dashboard}
          loading={loading}
          onSelectTab={setActiveTab}
        />
      </section>

      {/* ── 4. Main Tabbed Workspaces ──────────────────────────────────────── */}
      <section>
        <Card
          header={
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              {/* Tab Navigation buttons */}
              <div style={{
                display: 'inline-flex',
                background: 'var(--color-neutral-100)',
                padding: '0.25rem',
                borderRadius: '0.625rem',
                border: '1px solid var(--color-neutral-200)',
                flexWrap: 'wrap',
                gap: '2px',
              }}>
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const isCorrections = tab.id === 'corrections';

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: 'none',
                        background: isActive ? '#ffffff' : 'transparent',
                        color: isActive ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                        boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon />
                      <span>{tab.label}</span>
                      {isCorrections && pendingCorrectionsCount > 0 && (
                        <span style={{
                          padding: '0.1rem 0.45rem',
                          borderRadius: '999px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          background: '#f59e0b',
                          color: '#ffffff',
                          lineHeight: 1.2,
                        }}>
                          {pendingCorrectionsCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Contextual Status or Quick Action */}
              {activeTab === 'roster' && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                  Total Interns: <strong>{(dashboard?.expected || []).length}</strong>
                </span>
              )}
            </div>
          }
        >
          {/* Tab 1: Intern Roster */}
          {activeTab === 'roster' && (
            <SupervisorRosterTable
              expected={dashboard?.expected || []}
              loading={loading}
              onManualAdjust={handleOpenManual}
              dayType={dayType}
              required={isPhysicalDay}
            />
          )}

          {/* Tab 2: Correction Queue */}
          {activeTab === 'corrections' && (
            <SupervisorCorrectionQueue
              queue={dashboard?.correction_queue || []}
              loading={loading}
              onReview={handleOpenReview}
            />
          )}

          {/* Tab 3: Analytics & Trends */}
          {activeTab === 'analytics' && (
            <SupervisorAttendanceCharts
              dashboard={dashboard}
              loading={loading}
            />
          )}

          {/* Tab 4: Policies & Geofencing */}
          {activeTab === 'settings' && (
            <SupervisorAttendanceSettings
              config={config}
              loading={loading}
              onReload={() => loadData(true)}
            />
          )}
        </Card>
      </section>

      {/* ── 5. Modals Integration ─────────────────────────────────────────── */}
      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={() => loadData(true)}
        interns={dashboard?.expected || []}
        selectedIntern={selectedInternForManual}
        defaultDate={date}
      />

      <ReviewCorrectionModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => loadData(true)}
        request={selectedCorrectionForReview}
        action={reviewAction}
      />
    </motion.div>
  );
};

export default AttendanceDashboard;
