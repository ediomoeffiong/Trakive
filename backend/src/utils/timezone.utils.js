const DEFAULT_TZ = 'Africa/Lagos';

function getPart(parts, type) {
  const found = parts.find((p) => p.type === type);
  return found ? found.value : null;
}

function zonedParts(date, timeZone) {
  const tz = timeZone || DEFAULT_TZ;
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    weekday: 'short',
  });
  return formatter.formatToParts(date);
}

/**
 * Calendar date (YYYY-MM-DD) in the organization timezone.
 */
function getZonedDateString(date = new Date(), timeZone = DEFAULT_TZ) {
  const parts = zonedParts(date, timeZone);
  const year = getPart(parts, 'year');
  const month = getPart(parts, 'month');
  const day = getPart(parts, 'day');
  return `${year}-${month}-${day}`;
}

function getZonedTime(date = new Date(), timeZone = DEFAULT_TZ) {
  const parts = zonedParts(date, timeZone);
  return {
    hour: Number(getPart(parts, 'hour')),
    minute: Number(getPart(parts, 'minute')),
    second: Number(getPart(parts, 'second')),
    dateString: getZonedDateString(date, timeZone),
  };
}

function parseTimeToMinutes(timeValue) {
  if (!timeValue) return 8 * 60;
  if (timeValue instanceof Date) {
    return timeValue.getUTCHours() * 60 + timeValue.getUTCMinutes();
  }
  const str = String(timeValue);
  const match = str.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 8 * 60;
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatMinutes(total) {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * ISO weekday 1 (Monday) … 7 (Sunday) for a YYYY-MM-DD in a given timezone.
 */
function getIsoWeekday(dateString, timeZone = DEFAULT_TZ) {
  const utcNoon = new Date(`${dateString}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  }).formatToParts(utcNoon);
  const map = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  return map[getPart(parts, 'weekday')] || 1;
}

function addDays(dateString, days) {
  const d = new Date(`${dateString}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function minutesNowInZone(date = new Date(), timeZone = DEFAULT_TZ) {
  const t = getZonedTime(date, timeZone);
  return t.hour * 60 + t.minute;
}

module.exports = {
  DEFAULT_TZ,
  getZonedDateString,
  getZonedTime,
  parseTimeToMinutes,
  formatMinutes,
  getIsoWeekday,
  addDays,
  minutesNowInZone,
};
