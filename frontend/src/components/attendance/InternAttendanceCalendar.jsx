import { useState, useMemo } from 'react';
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCalendarEventLine,
  RiTimeLine,
  RiMapPinLine,
  RiShieldCheckLine,
  RiCloseLine,
} from 'react-icons/ri';
import { Button } from '../ui';

const STATUS_CONFIG = {
  present: { label: 'Present', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e' },
  late: { label: 'Late', color: '#d97706', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' },
  remote: { label: 'Online', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', dot: '#0ea5e9' },
  excused: { label: 'Excused', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', dot: '#8b5cf6' },
  absent: { label: 'Absent', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', dot: '#ef4444' },
  public_holiday: { label: 'Holiday', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', dot: '#94a3b8' },
  non_workday: { label: 'Weekend / Off', color: '#94a3b8', bg: '#f8fafc', border: '#f1f5f9', dot: '#cbd5e1' },
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatMonthYear(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const InternAttendanceCalendar = ({ records = [], onRequestCorrection }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  // Map records by YYYY-MM-DD
  const recordMap = useMemo(() => {
    const map = new Map();
    (records || []).forEach((r) => {
      const key = String(r.date).slice(0, 10);
      map.set(key, r);
    });
    return map;
  }, [records]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  // Build calendar matrix
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Day of week: 0 = Sun, 1 = Mon ... adjust to Mon=0, Sun=6
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];
    // Previous month padding
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const pDate = new Date(year, month - 1, prevMonthLastDate - i);
      const iso = pDate.toISOString().slice(0, 10);
      days.push({
        date: pDate,
        iso,
        dayNumber: pDate.getDate(),
        isCurrentMonth: false,
        isWeekend: pDate.getDay() === 0 || pDate.getDay() === 6,
      });
    }

    // Current month days
    const totalDays = lastDayOfMonth.getDate();
    const todayIso = new Date().toISOString().slice(0, 10);
    for (let d = 1; d <= totalDays; d++) {
      const cDate = new Date(year, month, d);
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        date: cDate,
        iso,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: iso === todayIso,
        isWeekend: cDate.getDay() === 0 || cDate.getDay() === 6,
        record: recordMap.get(iso),
      });
    }

    // Next month padding to fill grid to 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const nDate = new Date(year, month + 1, n);
      const iso = nDate.toISOString().slice(0, 10);
      days.push({
        date: nDate,
        iso,
        dayNumber: n,
        isCurrentMonth: false,
        isWeekend: nDate.getDay() === 0 || nDate.getDay() === 6,
      });
    }

    return days;
  }, [year, month, recordMap]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Calendar Header / Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--color-neutral-200)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            {formatMonthYear(currentDate)}
          </h3>
          <Button size="xs" variant="outline" onClick={handleToday}>
            Today
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous Month"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid var(--color-neutral-200)',
              background: '#fff',
              cursor: 'pointer',
              color: 'var(--color-neutral-700)',
            }}
          >
            <RiArrowLeftSLine fontSize="1.1rem" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next Month"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid var(--color-neutral-200)',
              background: '#fff',
              cursor: 'pointer',
              color: 'var(--color-neutral-700)',
            }}
          >
            <RiArrowRightSLine fontSize="1.1rem" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--color-neutral-600)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} /> Present
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} /> Late
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9' }} /> Online Work Day
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} /> Excused
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> Absent
        </span>
      </div>

      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: '4px',
        background: 'var(--color-neutral-200)',
        border: '1px solid var(--color-neutral-200)',
        borderRadius: '10px',
        overflow: 'hidden',
      }}>
        {/* Day Headers */}
        {WEEKDAYS.map((wd, index) => (
          <div
            key={wd}
            style={{
              padding: '0.625rem 0.25rem',
              textAlign: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: index >= 5 ? 'var(--color-neutral-100)' : '#fff',
              color: index >= 5 ? 'var(--color-neutral-400)' : 'var(--color-neutral-700)',
            }}
          >
            {wd}
          </div>
        ))}

        {/* Day Cells */}
        {calendarDays.map((cell) => {
          const rec = cell.record;
          const statusKey = rec?.status || (cell.isWeekend ? 'non_workday' : null);
          const config = STATUS_CONFIG[statusKey] || (cell.isWeekend ? STATUS_CONFIG.non_workday : null);
          const isSelected = selectedDay?.iso === cell.iso;

          return (
            <div
              key={cell.iso}
              onClick={() => cell.isCurrentMonth && setSelectedDay(cell)}
              role="button"
              tabIndex={cell.isCurrentMonth ? 0 : -1}
              style={{
                minHeight: '76px',
                padding: '0.45rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: isSelected
                  ? 'var(--color-primary-50)'
                  : !cell.isCurrentMonth
                    ? 'var(--color-neutral-50)'
                    : cell.isWeekend
                      ? '#fafafa'
                      : '#ffffff',
                opacity: cell.isCurrentMonth ? 1 : 0.45,
                cursor: cell.isCurrentMonth ? 'pointer' : 'default',
                outline: isSelected ? '2px solid var(--color-primary-500)' : 'none',
                position: 'relative',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: cell.isToday ? 800 : 600,
                    color: cell.isToday
                      ? '#ffffff'
                      : cell.isWeekend
                        ? 'var(--color-neutral-400)'
                        : 'var(--color-neutral-800)',
                    width: cell.isToday ? '22px' : 'auto',
                    height: cell.isToday ? '22px' : 'auto',
                    borderRadius: cell.isToday ? '50%' : '0',
                    background: cell.isToday ? 'var(--color-primary-600)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cell.dayNumber}
                </span>

                {config && (
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: config.dot,
                    }}
                    title={config.label}
                  />
                )}
              </div>

              {rec && (
                <div
                  style={{
                    marginTop: '0.25rem',
                    padding: '0.15rem 0.35rem',
                    borderRadius: '4px',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    background: config?.bg || '#f1f5f9',
                    color: config?.color || '#334155',
                    border: `1px solid ${config?.border || '#e2e8f0'}`,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {config?.label || rec.status}
                </div>
              )}

              {rec?.check_in && (
                <span style={{ fontSize: '0.625rem', color: 'var(--color-neutral-400)', marginTop: '0.1rem' }}>
                  {new Date(rec.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Details Panel */}
      {selectedDay && (
        <div style={{
          marginTop: '0.5rem',
          padding: '1rem 1.25rem',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: '0.75rem',
          position: 'relative',
        }}>
          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-neutral-400)',
              fontSize: '1.25rem',
            }}
          >
            <RiCloseLine />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <RiCalendarEventLine style={{ color: 'var(--color-primary-600)', fontSize: '1.1rem' }} />
            <strong style={{ fontSize: '0.9375rem', color: 'var(--color-neutral-900)' }}>
              {selectedDay.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </strong>
          </div>

          {selectedDay.record ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', display: 'block' }}>Status</span>
                <span style={{
                  display: 'inline-block',
                  marginTop: '0.2rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: STATUS_CONFIG[selectedDay.record.status]?.bg || '#f1f5f9',
                  color: STATUS_CONFIG[selectedDay.record.status]?.color || '#334155',
                  border: `1px solid ${STATUS_CONFIG[selectedDay.record.status]?.border || '#cbd5e1'}`,
                }}>
                  {STATUS_CONFIG[selectedDay.record.status]?.label || selectedDay.record.status}
                </span>
              </div>

              {selectedDay.record.check_in && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', display: 'block' }}>Check-In Time</span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-neutral-800)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                    <RiTimeLine /> {new Date(selectedDay.record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </strong>
                </div>
              )}

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', display: 'block' }}>Office / Location</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--color-neutral-800)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                  <RiMapPinLine /> {selectedDay.record.office_name || (selectedDay.record.status === 'remote' ? 'Remote / Online' : 'Office')}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', display: 'block' }}>Verification</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--color-neutral-800)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                  <RiShieldCheckLine /> {selectedDay.record.verification_status || 'Verified'}
                </strong>
              </div>

              {selectedDay.record.notes && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', display: 'block' }}>Remarks</span>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-700)' }}>
                    {selectedDay.record.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-neutral-600)' }}>
                {selectedDay.isWeekend ? 'Weekend — no scheduled attendance' : 'No attendance record logged for this day.'}
              </p>
              {!selectedDay.isWeekend && onRequestCorrection && (
                <Button size="xs" variant="outline" onClick={() => onRequestCorrection(selectedDay.iso)}>
                  Request Review for this Date
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InternAttendanceCalendar;
