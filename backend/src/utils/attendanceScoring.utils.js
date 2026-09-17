const CREDITED = new Set(['present', 'late', 'remote']);
const EXCLUDED = new Set([
  'excused',
  'public_holiday',
  'non_workday',
  'pending_review',
  'pending_correction',
  'half_day',
]);

function defaultSettings() {
  return {
    enabled: true,
    attendance_weight: 0.3,
    task_weight: 0.4,
    rating_weight: 0.3,
    present_points: 1,
    late_points: 0.75,
    remote_points: 1,
  };
}

function normalizeSettings(row) {
  const base = defaultSettings();
  if (!row) return base;
  return {
    enabled: row.enabled !== false,
    attendance_weight: Number(row.attendance_weight ?? base.attendance_weight),
    task_weight: Number(row.task_weight ?? base.task_weight),
    rating_weight: Number(row.rating_weight ?? base.rating_weight),
    present_points: Number(row.present_points ?? base.present_points),
    late_points: Number(row.late_points ?? base.late_points),
    remote_points: Number(row.remote_points ?? base.remote_points),
  };
}

function pointsForStatus(status, settings) {
  const s = normalizeSettings(settings);
  switch (status) {
    case 'present':
      return s.present_points;
    case 'late':
      return s.late_points;
    case 'remote':
      return s.remote_points;
    case 'absent':
      return 0;
    default:
      return null;
  }
}

function isRequiredRecord(row) {
  const status = row.status;
  const snapshot = row.schedule_snapshot || {};
  if (EXCLUDED.has(status)) return false;
  if (snapshot.required === false) return false;
  if (CREDITED.has(status) || status === 'absent') return true;
  return snapshot.required === true;
}

/**
 * Transparent attendance score for an internship instance.
 * Only persisted records with required snapshots count, so later schedule
 * edits do not rewrite history.
 */
function computeAttendanceMetrics(records = [], settingsInput) {
  const settings = normalizeSettings(settingsInput);
  let requiredDays = 0;
  let earned = 0;
  const counts = {
    present: 0,
    late: 0,
    absent: 0,
    excused: 0,
    remote: 0,
    public_holiday: 0,
    non_workday: 0,
    pending_review: 0,
    pending_correction: 0,
    half_day: 0,
  };

  for (const row of records) {
    const status = row.status;
    if (counts[status] !== undefined) counts[status] += 1;
    if (!isRequiredRecord(row)) continue;
    requiredDays += 1;
    const pts = pointsForStatus(status, settings);
    earned += pts === null ? 0 : pts;
  }

  const attendanceScore = requiredDays > 0
    ? Number(((earned / requiredDays) * 100).toFixed(2))
    : null;

  const presenceRate = requiredDays > 0
    ? Number(((((counts.present || 0) + (counts.late || 0) + (counts.remote || 0)) / requiredDays) * 100).toFixed(2))
    : null;

  return {
    required_days: requiredDays,
    earned_points: Number(earned.toFixed(2)),
    attendance_score: attendanceScore,
    attendance_rate: attendanceScore,
    presence_rate: presenceRate,
    counts,
    settings: {
      enabled: settings.enabled,
      present_points: settings.present_points,
      late_points: settings.late_points,
      remote_points: settings.remote_points,
    },
  };
}

/**
 * Combine task, rating and attendance. When attendance is disabled its weight
 * is redistributed so the remaining components are not penalised.
 */
function computeOverallScore({ taskCompletionRate = 0, ratingScore = 0, attendanceScore = 0, settings }) {
  const s = normalizeSettings(settings);
  let tw = Number(s.task_weight);
  let rw = Number(s.rating_weight);
  let aw = s.enabled ? Number(s.attendance_weight) : 0;
  const total = tw + rw + aw;
  if (total <= 0) {
    tw = 0.5;
    rw = 0.5;
    aw = 0;
  } else {
    tw /= total;
    rw /= total;
    aw /= total;
  }
  const att = s.enabled ? (attendanceScore || 0) : 0;
  const overall = Number(((taskCompletionRate * tw) + (ratingScore * rw) + (att * aw)).toFixed(2));
  return {
    overall_score: overall,
    weights: {
      task: Number(tw.toFixed(4)),
      rating: Number(rw.toFixed(4)),
      attendance: Number(aw.toFixed(4)),
      attendance_enabled: s.enabled,
    },
  };
}

module.exports = {
  defaultSettings,
  normalizeSettings,
  computeAttendanceMetrics,
  computeOverallScore,
  pointsForStatus,
  isRequiredRecord,
};
