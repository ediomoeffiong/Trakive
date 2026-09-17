/**
 * Location-attendance unit checks (no database required).
 */
const assert = require('assert');
const { haversineDistanceM, matchOffice, isAccuracyReliable, isValidCoordinate } = require('../utils/geo.utils');
const { computeAttendanceMetrics, computeOverallScore } = require('../utils/attendanceScoring.utils');
const { getIsoWeekday, getZonedDateString, parseTimeToMinutes } = require('../utils/timezone.utils');

function approx(actual, expected, delta = 5) {
  assert.ok(Math.abs(actual - expected) <= delta, `expected ${actual} ≈ ${expected}`);
}

const lagos = { latitude: 6.5244, longitude: 3.3792, radius_m: 200, name: 'HQ', is_active: true };
const second = { latitude: 6.5258, longitude: 3.3792, radius_m: 200, name: 'Annex', is_active: true };

approx(haversineDistanceM(6.5244, 3.3792, 6.5244, 3.3792), 0, 0.1);
assert.ok(haversineDistanceM(6.5244, 3.3792, 6.5262, 3.3792) > 200);
assert.equal(isValidCoordinate(91, 0), false);

const inside = matchOffice(6.5244, 3.3792, [lagos, second]);
assert.equal(inside.office.name, 'HQ');

const overlapLat = 6.5251;
const overlapped = matchOffice(overlapLat, 3.3792, [lagos, second]);
assert.ok(overlapped.office.name);

assert.equal(isAccuracyReliable(250, 200, 200).reliable, false);
assert.equal(isAccuracyReliable(30, 200, 200).reliable, true);

const records = [
  { status: 'present', schedule_snapshot: { required: true } },
  { status: 'late', schedule_snapshot: { required: true } },
  { status: 'absent', schedule_snapshot: { required: true } },
  { status: 'excused', schedule_snapshot: { required: false } },
  { status: 'public_holiday', schedule_snapshot: { required: false } },
  { status: 'remote', schedule_snapshot: { required: true } },
];
const metrics = computeAttendanceMetrics(records);
assert.equal(metrics.required_days, 4);
assert.equal(metrics.counts.excused, 1);
assert.ok(metrics.attendance_score > 60 && metrics.attendance_score < 80);

const disabled = computeOverallScore({
  taskCompletionRate: 80,
  ratingScore: 80,
  attendanceScore: 0,
  settings: { enabled: false, task_weight: 0.4, rating_weight: 0.3, attendance_weight: 0.3 },
});
assert.equal(disabled.weights.attendance, 0);
assert.equal(disabled.overall_score, 80);

const enabled = computeOverallScore({
  taskCompletionRate: 100,
  ratingScore: 100,
  attendanceScore: 0,
  settings: { enabled: true, task_weight: 0.4, rating_weight: 0.3, attendance_weight: 0.3 },
});
assert.ok(enabled.overall_score < 100);

assert.equal(getIsoWeekday('2026-09-17', 'Africa/Lagos'), 4);
assert.equal(parseTimeToMinutes('08:00'), 480);
assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(getZonedDateString(new Date('2026-09-17T00:30:00Z'), 'Africa/Lagos')));

console.log('verify_location_attendance: all unit checks passed');
