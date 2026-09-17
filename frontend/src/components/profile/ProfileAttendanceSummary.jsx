import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attendanceService } from '../../services/attendanceService';
import { ROUTES } from '../../constants';

const ProfileAttendanceSummary = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    attendanceService.getSummary().then(setSummary).catch(() => setSummary(null));
  }, []);

  if (!summary) return null;

  return (
    <section className="card profile-overview-card">
      <div className="profile-overview-card-inner">
        <div className="profile-section-title-row">
          <h3>Attendance summary</h3>
          <Link to={ROUTES.ATTENDANCE} className="profile-card-action">View details</Link>
        </div>
        <p className="attendance-meta" style={{ marginTop: 0 }}>{summary.internship_title}</p>
        <div className="attendance-summary-grid">
          <div>
            <span>Score</span>
            <strong>{summary.attendance_score != null ? `${summary.attendance_score}%` : '—'}</strong>
          </div>
          <div>
            <span>Required days</span>
            <strong>{summary.required_days ?? 0}</strong>
          </div>
          <div>
            <span>Present / Late</span>
            <strong>{summary.counts?.present || 0} / {summary.counts?.late || 0}</strong>
          </div>
          <div>
            <span>Absent</span>
            <strong>{summary.counts?.absent || 0}</strong>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileAttendanceSummary;
