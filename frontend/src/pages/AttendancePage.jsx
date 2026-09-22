import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiPercentLine,
  RiCalendarCheckLine,
  RiTimeLine,
  RiCloudLine,
  RiSendPlaneLine,
  RiCalendarEventLine,
  RiListCheck2,
  RiCheckDoubleLine,
  RiCloseCircleLine,
  RiRefreshLine,
} from 'react-icons/ri';
import { Card, Badge, Skeleton, Button, EmptyState } from '../components/ui';
import {
  TodayAttendanceCard,
  InternAttendanceCalendar,
  InternAttendanceTable,
  InternCorrectionModal,
} from '../components/attendance';
import { attendanceService } from '../services/attendanceService';
import { useCurrentUser } from '../store';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const AttendancePage = () => {
  const user = useCurrentUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'table'
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [selectedCorrectionDate, setSelectedCorrectionDate] = useState(null);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await attendanceService.getHistory();
      setData(res);
    } catch (err) {
      console.error('Failed to load attendance history', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = data?.stats || {};
  const records = data?.records || [];
  const corrections = data?.corrections || [];

  // Punctuality rate
  const punctualityRate = useMemo(() => {
    const present = stats.present || 0;
    const late = stats.late || 0;
    const totalPhysical = present + late;
    if (totalPhysical === 0) return 100;
    return Math.round((present / totalPhysical) * 100);
  }, [stats.present, stats.late]);

  const handleOpenCorrection = (date = null) => {
    setSelectedCorrectionDate(date || new Date().toISOString().slice(0, 10));
    setIsCorrectionModalOpen(true);
  };

  const internFirstName = user?.name?.split(' ')[0] || 'Intern';
  const attendancePercentage = stats.attendance_percentage ?? 100;

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
      {/* ── 1. Hero Banner ────────────────────────────────────────────────── */}
      <section
        className="accent-banner"
        style={{
          background: '#00b4d8',
          borderRadius: '1.125rem',
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
              INTERN ATTENDANCE PORTAL
            </span>
          </div>

          <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            Here's your attendance, {internFirstName}
          </h2>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(255, 255, 255, 0.95)', lineHeight: 1.55 }}>
            Track your daily office check-ins, online task attendance, monthly standing, and review requests.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            size="sm"
            onClick={() => handleOpenCorrection()}
            style={{
              background: '#ffffff',
              color: '#00b4d8',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            }}
          >
            <RiSendPlaneLine style={{ marginRight: '0.35rem' }} />
            Request Attendance Review
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

      {/* ── 2. Today's Attendance Live Card ───────────────────────────────── */}
      <section>
        <TodayAttendanceCard onRequestCorrection={handleOpenCorrection} />
      </section>

      {/* ── 3. High-Impact KPI Metrics ────────────────────────────────────── */}
      <section>
        {loading ? (
          <div className="dashboard-kpi-grid">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} height="110px" borderRadius="14px" />)}
          </div>
        ) : (
          <div className="dashboard-kpi-grid">
            {/* KPI 1: Attendance Rate */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: 0, color: 'var(--color-neutral-500)', fontSize: '0.8rem', fontWeight: 500 }}>
                    Attendance Percentage
                  </p>
                  <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                    {attendancePercentage}%
                  </h3>
                  <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: attendancePercentage >= 85 ? 'var(--color-success-600)' : 'var(--color-danger-600)',
                    }}>
                      {attendancePercentage >= 85 ? '✓ On Track' : '⚠ Below 85% Target'}
                    </span>
                  </div>
                </div>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'var(--color-primary-50)',
                  color: 'var(--color-primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                }}>
                  <RiPercentLine />
                </div>
              </div>
            </Card>

            {/* KPI 2: Credited Days */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: 0, color: 'var(--color-neutral-500)', fontSize: '0.8rem', fontWeight: 500 }}>
                    Credited Workdays
                  </p>
                  <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                    {stats.credited_days ?? 0}
                    <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-neutral-400)' }}>
                      /{stats.required_days ?? 0}
                    </span>
                  </h3>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                    Required active days
                  </p>
                </div>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'var(--color-success-50)',
                  color: 'var(--color-success-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                }}>
                  <RiCalendarCheckLine />
                </div>
              </div>
            </Card>

            {/* KPI 3: Punctuality */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: 0, color: 'var(--color-neutral-500)', fontSize: '0.8rem', fontWeight: 500 }}>
                    On-Time Punctuality
                  </p>
                  <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                    {punctualityRate}%
                  </h3>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                    {stats.late || 0} late check-in{stats.late === 1 ? '' : 's'} recorded
                  </p>
                </div>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'var(--color-warning-50)',
                  color: 'var(--color-warning-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                }}>
                  <RiTimeLine />
                </div>
              </div>
            </Card>

            {/* KPI 4: Online / Remote Days */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: 0, color: 'var(--color-neutral-500)', fontSize: '0.8rem', fontWeight: 500 }}>
                    Online Work Days
                  </p>
                  <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                    {stats.remote ?? 0}
                  </h3>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                    Credited via completed tasks
                  </p>
                </div>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'var(--color-primary-50)',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                }}>
                  <RiCloudLine />
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* ── 4. Main History & Calendar View Switcher ──────────────────────── */}
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
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  Attendance History & Log
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
                  Switch between interactive monthly calendar view or searchable detail table.
                </p>
              </div>

              {/* View Toggle Tabs */}
              <div style={{
                display: 'inline-flex',
                background: 'var(--color-neutral-100)',
                padding: '0.25rem',
                borderRadius: '0.625rem',
                border: '1px solid var(--color-neutral-200)',
              }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('calendar')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background: activeTab === 'calendar' ? '#ffffff' : 'transparent',
                    color: activeTab === 'calendar' ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                    boxShadow: activeTab === 'calendar' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <RiCalendarEventLine /> Monthly Calendar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('table')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background: activeTab === 'table' ? '#ffffff' : 'transparent',
                    color: activeTab === 'table' ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                    boxShadow: activeTab === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <RiListCheck2 /> Detailed Table
                </button>
              </div>
            </div>
          }
        >
          {loading ? (
            <Skeleton height="320px" borderRadius="12px" />
          ) : activeTab === 'calendar' ? (
            <InternAttendanceCalendar
              records={records}
              onRequestCorrection={handleOpenCorrection}
            />
          ) : (
            <InternAttendanceTable
              records={records}
              onRequestCorrection={handleOpenCorrection}
            />
          )}
        </Card>
      </section>

      {/* ── 5. Correction Requests Tracking ───────────────────────────────── */}
      <section>
        <Card
          header={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  Correction & Review Requests
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
                  Status of requests submitted to your supervisor for review.
                </p>
              </div>
              <Button size="xs" variant="outline" onClick={() => handleOpenCorrection()}>
                <RiSendPlaneLine style={{ marginRight: '0.25rem' }} /> New Request
              </Button>
            </div>
          }
        >
          {loading ? (
            <Skeleton height="140px" borderRadius="10px" />
          ) : corrections.length === 0 ? (
            <EmptyState
              title="No correction requests submitted"
              description="If you ever encounter GPS issues or missed check-in on an in-office day, you can submit a review request here."
              action={
                <Button size="sm" variant="outline" onClick={() => handleOpenCorrection()}>
                  Submit Review Request
                </Button>
              }
            />
          ) : (
            <div style={{ display: 'grid', gap: '0.875rem' }}>
              {corrections.map((req) => {
                const isPending = req.status === 'pending';
                const isApproved = req.status === 'approved';
                const isRejected = req.status === 'rejected';

                return (
                  <div
                    key={req.id}
                    style={{
                      border: `1px solid ${isApproved ? '#bbf7d0' : isRejected ? '#fecaca' : 'var(--color-neutral-200)'}`,
                      borderRadius: '0.75rem',
                      padding: '1rem 1.25rem',
                      background: isApproved ? '#f0fdf4' : isRejected ? '#fef2f2' : '#ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isApproved ? (
                          <RiCheckDoubleLine style={{ color: '#16a34a', fontSize: '1.25rem' }} />
                        ) : isRejected ? (
                          <RiCloseCircleLine style={{ color: '#dc2626', fontSize: '1.25rem' }} />
                        ) : (
                          <RiTimeLine style={{ color: '#f59e0b', fontSize: '1.25rem' }} />
                        )}
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--color-neutral-900)' }}>
                          {new Date(req.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-neutral-500)' }}>
                          (Requested: <strong style={{ textTransform: 'capitalize' }}>{req.requested_status}</strong>)
                        </span>
                      </div>

                      <Badge variant={isApproved ? 'success' : isRejected ? 'danger' : 'warning'}>
                        {isPending ? '⏳ Under Review' : isApproved ? '✓ Approved' : '✕ Rejected'}
                      </Badge>
                    </div>

                    <p style={{ margin: '0.625rem 0 0', fontSize: '0.875rem', color: 'var(--color-neutral-700)', lineHeight: 1.5 }}>
                      <strong>Your Note:</strong> {req.reason}
                    </p>

                    {req.reviewer_reason && (
                      <div style={{
                        marginTop: '0.625rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        fontSize: '0.8125rem',
                        color: 'var(--color-neutral-800)',
                      }}>
                        <strong>Supervisor Remark:</strong> {req.reviewer_reason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </section>

      {/* ── 6. Correction Modal ───────────────────────────────────────────── */}
      <InternCorrectionModal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        onSuccess={() => loadData(true)}
        defaultDate={selectedCorrectionDate}
      />
    </motion.div>
  );
};

export default AttendancePage;
