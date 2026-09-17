import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, EmptyState, Skeleton } from '../components/ui';
import TodayAttendanceCard from '../components/attendance/TodayAttendanceCard';
import { attendanceService } from '../services/attendanceService';
import { statusLabel, statusVariant } from '../utils/attendanceGeo';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AttendancePage = () => {
  const [history, setHistory] = useState(null);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    attendanceService.getHistory({ month })
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [month]);

  const firstWeekday = useMemo(() => {
    if (!history?.days?.length) return 0;
    const date = new Date(`${history.days[0].date}T12:00:00`);
    return (date.getDay() + 6) % 7;
  }, [history]);

  const metrics = history?.metrics;
  const monthMetrics = history?.month_metrics;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="attendance-page"
    >
      <TodayAttendanceCard compact />

      <div className="attendance-stats-grid">
        {[
          { label: 'Attendance score', value: metrics?.attendance_score != null ? `${metrics.attendance_score}%` : '—' },
          { label: 'Present', value: metrics?.counts?.present ?? 0 },
          { label: 'Late', value: metrics?.counts?.late ?? 0 },
          { label: 'Absent', value: metrics?.counts?.absent ?? 0 },
          { label: 'Excused', value: metrics?.counts?.excused ?? 0 },
          { label: 'Remote', value: metrics?.counts?.remote ?? 0 },
        ].map((item) => (
          <Card key={item.label} padding="sm">
            <p className="attendance-kicker">{item.label}</p>
            <strong className="attendance-stat-value">{item.value}</strong>
          </Card>
        ))}
      </div>

      <Card>
        <div className="attendance-month-head">
          <div>
            <h3 style={{ margin: 0 }}>Monthly calendar</h3>
            <p className="attendance-meta">
              {history?.internship?.title} · this month score{' '}
              {monthMetrics?.attendance_score != null ? `${monthMetrics.attendance_score}%` : '—'}
            </p>
          </div>
          <input
            type="month"
            className="input-field"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Select month"
          />
        </div>
        {loading ? (
          <Skeleton height="240px" />
        ) : (
          <div className="attendance-cal">
            {WEEKDAYS.map((d) => <span key={d} className="attendance-cal-dow">{d}</span>)}
            {Array.from({ length: firstWeekday }).map((_, i) => <span key={`e-${i}`} />)}
            {history?.days?.map((day) => (
              <div key={day.date} className={`attendance-cal-day is-${day.status || 'empty'}`}>
                <span>{Number(day.date.slice(-2))}</span>
                <small>{statusLabel(day.record?.status || day.status)}</small>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>History</h3>
        <div className="attendance-history-list">
          {(history?.records || []).slice().reverse().map((row) => (
            <div key={row.id} className="attendance-history-row">
              <div>
                <strong>{String(row.date).slice(0, 10)}</strong>
                <span>{row.office_name || row.source}</span>
              </div>
              <Badge variant={statusVariant(row.status)}>{statusLabel(row.status)}</Badge>
            </div>
          ))}
          {!history?.records?.length && !loading ? (
            <EmptyState title="No attendance records yet" description="Check-ins for this internship will appear here." />
          ) : null}
        </div>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Review requests</h3>
        {(history?.corrections || []).map((req) => (
          <div key={req.id} className="attendance-history-row">
            <div>
              <strong>{String(req.request_date).slice(0, 10)}</strong>
              <span>{req.reason}</span>
            </div>
            <Badge variant={statusVariant(req.status === 'approved' ? 'present' : req.status === 'rejected' ? 'absent' : 'pending_review')}>
              {req.status}
            </Badge>
          </div>
        ))}
        {!history?.corrections?.length ? (
          <p className="attendance-meta">No correction requests for this internship.</p>
        ) : null}
      </Card>
    </motion.div>
  );
};

export default AttendancePage;
