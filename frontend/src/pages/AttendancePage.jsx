import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RiCalendar2Line, RiPercentLine, RiShieldCheckLine } from 'react-icons/ri';
import { Card, Badge, Skeleton, EmptyState } from '../components/ui';
import { TodayAttendanceCard } from '../components/attendance';
import { attendanceService } from '../services/attendanceService';

const statusVariant = {
  present: 'success',
  late: 'warning',
  absent: 'danger',
  excused: 'neutral',
  remote: 'primary',
  public_holiday: 'neutral',
  non_workday: 'neutral',
  pending_review: 'warning',
};

const label = (value) => (value || 'pending').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const Stat = ({ icon: Icon, label: title, value, sub }) => (
  <Card>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
      <div>
        <p style={{ margin: 0, color: 'var(--color-neutral-500)', fontSize: '0.8rem' }}>{title}</p>
        <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.75rem', color: 'var(--color-neutral-900)' }}>{value}</h3>
        {sub && <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{sub}</p>}
      </div>
      <span style={{ width: 40, height: 40, borderRadius: 8, display: 'grid', placeItems: 'center', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
        <Icon />
      </span>
    </div>
  </Card>
);

const AttendancePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceService.getHistory()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const calendar = useMemo(() => {
    const records = data?.records || [];
    return records.slice(0, 35).reverse();
  }, [data]);

  const stats = data?.stats || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem', minWidth: 0 }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--color-neutral-900)' }}>Attendance</h1>
        <p style={{ margin: '0.35rem 0 0', color: 'var(--color-neutral-500)' }}>
          Your current internship attendance history, verification state, and review requests.
        </p>
      </div>

      <TodayAttendanceCard />

      {loading ? (
        <div className="dashboard-kpi-grid">
          {[1, 2, 3].map((item) => <Skeleton key={item} height="112px" />)}
        </div>
      ) : (
        <div className="dashboard-kpi-grid">
          <Stat icon={RiPercentLine} label="Attendance Percentage" value={`${stats.attendance_percentage ?? 100}%`} sub={`${stats.credited_days ?? 0}/${stats.required_days ?? 0} credited days`} />
          <Stat icon={RiCalendar2Line} label="Required Days" value={stats.required_days ?? 0} sub="Excludes holidays and non-workdays" />
          <Stat icon={RiShieldCheckLine} label="Verified / Remote / Excused" value={(stats.present || 0) + (stats.late || 0) + (stats.remote || 0) + (stats.excused || 0)} sub={`${stats.late || 0} late days`} />
        </div>
      )}

      <Card header={<h3 style={{ margin: 0 }}>Calendar & History</h3>}>
        {loading ? (
          <Skeleton height="280px" />
        ) : calendar.length === 0 ? (
          <EmptyState title="No attendance records yet" description="Records will appear after check-in or supervisor updates." />
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: '0.5rem' }}>
              {calendar.map((record) => (
                <div key={record.id} style={{ border: '1px solid var(--color-neutral-200)', borderRadius: 8, padding: '0.65rem', minHeight: 78 }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{new Date(record.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                  <Badge variant={statusVariant[record.status] || 'neutral'}>{label(record.status)}</Badge>
                  {record.check_in && <p style={{ margin: '0.35rem 0 0', fontSize: '0.72rem', color: 'var(--color-neutral-500)' }}>{new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                </div>
              ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--color-neutral-500)', fontSize: '0.78rem' }}>
                    <th style={{ padding: '0.75rem' }}>Date</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem' }}>Check In</th>
                    <th style={{ padding: '0.75rem' }}>Office</th>
                    <th style={{ padding: '0.75rem' }}>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.records || []).map((record) => (
                    <tr key={record.id} style={{ borderTop: '1px solid var(--color-neutral-100)' }}>
                      <td style={{ padding: '0.75rem' }}>{new Date(record.date).toLocaleDateString()}</td>
                      <td style={{ padding: '0.75rem' }}><Badge variant={statusVariant[record.status] || 'neutral'}>{label(record.status)}</Badge></td>
                      <td style={{ padding: '0.75rem' }}>{record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td style={{ padding: '0.75rem' }}>{record.office_name || '-'}</td>
                      <td style={{ padding: '0.75rem' }}>{label(record.verification_status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      <Card header={<h3 style={{ margin: 0 }}>Correction Requests</h3>}>
        {(data?.corrections || []).length === 0 ? (
          <EmptyState title="No correction requests" description="Submitted review requests will appear here." />
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {data.corrections.map((request) => (
              <div key={request.id} style={{ border: '1px solid var(--color-neutral-200)', borderRadius: 8, padding: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <strong>{new Date(request.date).toLocaleDateString()}</strong>
                  <Badge variant={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'danger' : 'warning'}>{label(request.status)}</Badge>
                </div>
                <p style={{ margin: '0.5rem 0 0', color: 'var(--color-neutral-600)', fontSize: '0.875rem' }}>{request.reason}</p>
                {request.reviewer_reason && (
                  <p style={{ margin: '0.35rem 0 0', color: 'var(--color-neutral-500)', fontSize: '0.8rem' }}>
                    {request.reviewer_reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default AttendancePage;
