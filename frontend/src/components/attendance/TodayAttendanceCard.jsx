import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  RiCalendarCheckLine,
  RiRefreshLine,
  RiTimeLine,
  RiErrorWarningLine,
  RiCheckDoubleLine,
  RiCompass3Line,
  RiLightbulbLine,
  RiSendPlaneLine,
  RiSettings3Line,
} from 'react-icons/ri';
import { Card, Button, Badge, Skeleton } from '../ui';
import { attendanceService } from '../../services/attendanceService';

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

const statusLabel = (value, date) => {
  if (value === 'remote') return 'Online';
  if (value === 'non_workday') {
    const day = date ? new Date(`${String(date).slice(0, 10)}T12:00:00`).getDay() : new Date().getDay();
    if (day >= 1 && day <= 5) return 'Online';
  }
  return value ? value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Pending';
};

const LOCATION_ERROR = {
  DENIED: 'LOCATION_DENIED',
  UNAVAILABLE: 'LOCATION_UNAVAILABLE',
  TIMEOUT: 'LOCATION_TIMEOUT',
  UNSUPPORTED: 'LOCATION_UNSUPPORTED',
};

function makeLocationError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

async function getLocationPermissionState() {
  if (!navigator.permissions?.query) return null;
  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state;
  } catch {
    return null;
  }
}

function requestPosition(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

function watchForPosition(options, waitMs) {
  return new Promise((resolve, reject) => {
    let watchId = null;
    const timer = setTimeout(() => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      const error = new Error('Location lookup timed out.');
      error.code = 3;
      reject(error);
    }, waitMs);

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        clearTimeout(timer);
        navigator.geolocation.clearWatch(watchId);
        resolve(position);
      },
      () => {
        // Windows can report a denial before the location provider returns a fix.
      },
      options,
    );
  });
}

function shouldRetryWithApproximateLocation(error, permissionState) {
  if (error.code === 2 || error.code === 3) return true;
  if (error.code === LOCATION_ERROR.UNAVAILABLE || error.code === LOCATION_ERROR.TIMEOUT) return true;
  // Site permission is already granted, but Windows denied the precise lookup.
  return error.code === 1 && permissionState === 'granted';
}

function openWindowsLocationSettings() {
  const anchor = document.createElement('a');
  anchor.href = 'ms-settings:privacy-location';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function canOpenWindowsLocationSettings() {
  return typeof navigator !== 'undefined' && /Windows/i.test(navigator.userAgent || '');
}

async function getLocation() {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    throw makeLocationError(
      LOCATION_ERROR.UNAVAILABLE,
      'Location check-in requires HTTPS or localhost. Open Trakive from a secure URL and try again.',
    );
  }
  if (!navigator.geolocation) {
    throw makeLocationError(LOCATION_ERROR.UNSUPPORTED, 'Geolocation is not available in this browser.');
  }

  // Start the lookup in this turn so a button click still counts as the user gesture
  // Windows needs before it will show the system location prompt.
  const preciseRequest = requestPosition({
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 0,
  });
  preciseRequest.catch(() => {});

  const permissionState = await getLocationPermissionState();
  if (permissionState === 'denied') {
    throw makeLocationError(
      LOCATION_ERROR.DENIED,
      'Location permission is blocked for Trakive. Enable location access in your browser site settings, then tap Check In again.',
    );
  }

  try {
    return await preciseRequest;
  } catch (error) {
    error.permissionState = permissionState;
    if (!shouldRetryWithApproximateLocation(error, permissionState)) throw error;

    try {
      return await requestPosition({
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 30000,
      });
    } catch (fallbackError) {
      if (fallbackError.code === 1 && permissionState === 'granted') {
        try {
          return await watchForPosition({
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 30000,
          }, 10000);
        } catch {
          fallbackError.permissionState = permissionState;
          throw fallbackError;
        }
      }
      fallbackError.permissionState = permissionState;
      throw fallbackError;
    }
  }
}

const getAttendanceErrorMessage = (err) => {
  const serverCode = err.response?.data?.errors?.code;
  if (serverCode === 'OUTSIDE_GEOFENCE') {
    const nearest = err.response?.data?.errors?.nearest_office;
    const distance = err.response?.data?.errors?.distance_meters;
    return nearest && distance
      ? `You are outside the allowed office range. Nearest office: ${nearest}, about ${distance}m away. Move within the configured geofence and try again.`
      : 'You are outside all configured office geofences. Move within an approved office location and try again.';
  }
  if (serverCode === 'LOCATION_INACCURATE') {
    return `Your GPS accuracy is too low for a reliable check-in. Move near a window or open area, turn on high-accuracy location, then retry.`;
  }

  if (err.code === LOCATION_ERROR.UNSUPPORTED) {
    return 'This browser does not support location check-in. Try another browser or submit a supervisor review request.';
  }
  if (err.code === 1 || err.code === LOCATION_ERROR.DENIED) {
    if (/HTTPS|secure URL/i.test(err.message || '')) return err.message;
    if (err.permissionState === 'granted') {
      return 'Trakive is allowed in the browser, but Windows blocked the location lookup. Turn on Location services, allow desktop apps to access location, then check in again.';
    }
    return 'Location permission is blocked for Trakive. Enable location access in your browser site settings, then tap Check In again.';
  }
  if (err.code === 2 || err.code === LOCATION_ERROR.UNAVAILABLE) {
    return 'Your device could not determine your location. Turn on device location/GPS and try again.';
  }
  if (err.code === 3 || err.code === LOCATION_ERROR.TIMEOUT) {
    return 'Location lookup timed out. Check your connection, move to an open area, and try again.';
  }

  const message = err.response?.data?.message || err.message || '';
  if (/outside/i.test(message) && /geofence|range|office/i.test(message)) {
    return 'You are outside the allowed office range. Move within an approved office geofence and try again.';
  }
  if (/expired/i.test(message) && /token/i.test(message)) {
    return 'Your session expired. Please refresh the page or sign in again.';
  }
  return message || 'Location check-in failed. Please try again or submit a supervisor review request.';
};

const TodayAttendanceCard = ({ compact = false, onRequestCorrection }) => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState('');
  const [osLocationBlocked, setOsLocationBlocked] = useState(false);
  const [reason, setReason] = useState('');
  const [submittingCorrection, setSubmittingCorrection] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Live clock updating every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getToday();
      setState(data);
      setError('');
      setOsLocationBlocked(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load attendance.');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitCheckIn = useCallback(async (source = 'manual') => {
    setCheckingIn(true);
    setError('');
    setOsLocationBlocked(false);
    try {
      const position = await getLocation();
      await attendanceService.checkIn({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy_meters: position.coords.accuracy,
        source,
      });
      toast.success('Attendance check-in recorded successfully!');
      await load();
    } catch (err) {
      const message = getAttendanceErrorMessage(err);
      setError(message);
      setOsLocationBlocked(
        (err.code === 1 || err.code === LOCATION_ERROR.DENIED) && err.permissionState === 'granted',
      );
      toast.error(message);
    } finally {
      setCheckingIn(false);
    }
  }, [load]);

  const submitCorrection = async () => {
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error('Add a clear reason for supervisor review (minimum 5 characters).');
      return;
    }
    setSubmittingCorrection(true);
    try {
      await attendanceService.requestCorrection({
        date: state?.date,
        requested_status: 'present',
        reason: reason.trim(),
        location_payload: { last_error: error },
      });
      setReason('');
      toast.success('Correction request sent for supervisor review.');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to submit correction request.');
    } finally {
      setSubmittingCorrection(false);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton height="1.25rem" width="40%" />
          <Skeleton height="1.5rem" width="80px" borderRadius="999px" />
        </div>
        <Skeleton height="3rem" width="100%" style={{ marginTop: '1rem' }} />
        <Skeleton height="2.5rem" width="100%" style={{ marginTop: '0.75rem' }} />
      </Card>
    );
  }

  const record = state?.record;
  const required = Boolean(state?.required);
  const status = record?.status || state?.derived_status || (required ? 'pending' : 'non_workday');
  const isOnlineDay = state?.is_online_day || (!required && statusLabel(status, state?.date) === 'Online');

  return (
    <Card
      header={
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{
              width: 40,
              height: 40,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '0.625rem',
              background: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              fontSize: '1.25rem',
            }}>
              <RiCalendarCheckLine />
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  Today's Attendance
                </h3>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-neutral-500)',
                  background: 'var(--color-neutral-100)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                }}>
                  {state?.date}
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <RiTimeLine /> Live Time: <strong style={{ color: 'var(--color-neutral-800)' }}>{currentTime.toLocaleTimeString()}</strong>
              </p>
            </div>
          </div>
          <Badge variant={statusVariant[status] || 'warning'}>
            {statusLabel(status, state?.date)}
          </Badge>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: '1rem' }}>
        {/* Metric summary boxes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: compact ? 'repeat(auto-fit, minmax(130px, 1fr))' : 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
        }}>
          <div style={{
            background: 'var(--color-neutral-50)',
            border: '1px solid var(--color-neutral-200)',
            borderRadius: '0.625rem',
            padding: '0.75rem 0.875rem',
          }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>Work Mode</p>
            <p style={{ margin: '0.25rem 0 0', fontWeight: 700, fontSize: '0.925rem', color: 'var(--color-neutral-900)' }}>
              {required ? 'In-Office Required' : (isOnlineDay ? 'Online Work Day' : 'Non-Work Day')}
            </p>
          </div>

          <div style={{
            background: 'var(--color-neutral-50)',
            border: '1px solid var(--color-neutral-200)',
            borderRadius: '0.625rem',
            padding: '0.75rem 0.875rem',
          }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>Daily Schedule</p>
            <p style={{ margin: '0.25rem 0 0', fontWeight: 700, fontSize: '0.925rem', color: 'var(--color-neutral-900)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <RiTimeLine style={{ color: 'var(--color-primary-500)' }} />
              {String(state?.schedule?.arrival_time || '08:00').slice(0, 5)}
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-neutral-500)' }}>
                (+{state?.schedule?.grace_minutes ?? 60}m grace)
              </span>
            </p>
          </div>

          <div style={{
            background: 'var(--color-neutral-50)',
            border: '1px solid var(--color-neutral-200)',
            borderRadius: '0.625rem',
            padding: '0.75rem 0.875rem',
          }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>Verification</p>
            <p style={{ margin: '0.25rem 0 0', fontWeight: 700, fontSize: '0.925rem', color: 'var(--color-neutral-900)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <RiCompass3Line style={{ color: 'var(--color-primary-500)' }} />
              {statusLabel(record?.verification_status || (required ? 'pending' : 'not_required'))}
            </p>
          </div>
        </div>

        {/* Checked In Confirmation Banner */}
        {record?.check_in && (
          <div style={{
            padding: '0.875rem 1rem',
            border: '1px solid #bbf7d0',
            borderRadius: '0.625rem',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RiCheckDoubleLine style={{ color: '#16a34a', fontSize: '1.25rem' }} />
              <div>
                <strong style={{ color: '#15803d', fontSize: '0.875rem' }}>Check-In Confirmed</strong>
                <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: '#166534' }}>
                  Recorded at {new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  {record.office_name ? ` • ${record.office_name}` : ''}
                </p>
              </div>
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              background: '#22c55e',
              color: '#ffffff',
            }}>
              {record.status === 'late' ? 'Late Arrival' : 'On-Time'}
            </span>
          </div>
        )}

        {/* Reason / Holiday banner if applicable */}
        {state?.reason && !required && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.625rem',
            background: 'var(--color-neutral-100)',
            color: 'var(--color-neutral-700)',
            fontSize: '0.85rem',
          }}>
            {state.reason}
          </div>
        )}

        {/* Online Work Day Notice */}
        {isOnlineDay && (
          <div style={{
            padding: '0.875rem 1.125rem',
            borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #e0f7fc 0%, #cffafe 100%)',
            border: '1px solid #a5f3fc',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}>
            <RiLightbulbLine style={{ color: '#007791', fontSize: '1.35rem', marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#007791' }}>
                Online Work Day — Task Attendance Active
              </p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#0e7490', lineHeight: 1.5 }}>
                Physical office check-in is not required today. Completing any assigned weekly task will automatically credit your attendance.
              </p>
            </div>
          </div>
        )}

        {/* Location / Geofence Error Notice */}
        {error && (
          <div style={{
            display: 'flex',
            gap: '0.625rem',
            alignItems: 'flex-start',
            color: 'var(--color-danger-700)',
            background: 'var(--color-danger-50)',
            border: '1px solid var(--color-danger-200)',
            padding: '0.75rem 1rem',
            borderRadius: '0.625rem',
            fontSize: '0.85rem',
          }}>
            <RiErrorWarningLine style={{ marginTop: 2, flexShrink: 0, fontSize: '1.1rem' }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Check-In Issue</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', lineHeight: 1.45 }}>{error}</p>
              {osLocationBlocked && canOpenWindowsLocationSettings() && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openWindowsLocationSettings}
                  style={{ marginTop: '0.65rem' }}
                >
                  <RiSettings3Line style={{ marginRight: '0.3rem' }} />
                  Open Windows location settings
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Check In Action Button */}
        {state?.can_check_in && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Button
              onClick={() => submitCheckIn('manual')}
              disabled={checkingIn}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9375rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0, 180, 216, 0.25)',
              }}
            >
              <RiRefreshLine style={{ animation: checkingIn ? 'spin 1s linear infinite' : 'none', marginRight: '0.35rem' }} />
              {checkingIn ? 'Verifying Device GPS Location...' : 'Check In at Office Now'}
            </Button>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)', textAlign: 'center', lineHeight: 1.45 }}>
              Check-in uses your device location and is securely verified against configured office geofences.
            </p>
          </div>
        )}

        {/* Correction Request Inline Option (if required and missed check in) */}
        {required && !record?.check_in && (
          <div style={{
            borderTop: '1px solid var(--color-neutral-200)',
            paddingTop: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
                Missed Check-in or GPS Issue?
              </span>
              {onRequestCorrection ? (
                <Button size="xs" variant="outline" onClick={() => onRequestCorrection(state?.date)}>
                  <RiSendPlaneLine style={{ marginRight: '0.25rem' }} />
                  Request Review
                </Button>
              ) : null}
            </div>

            {!onRequestCorrection && (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Explain why you could not check in (e.g. Geolocation error, verified arrival with team)..."
                  rows={2}
                  style={{
                    width: '100%',
                    resize: 'vertical',
                    border: '1px solid var(--color-neutral-300)',
                    borderRadius: '0.5rem',
                    padding: '0.65rem 0.75rem',
                    fontFamily: 'inherit',
                    fontSize: '0.8125rem',
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={submitCorrection}
                  disabled={submittingCorrection || reason.trim().length < 5}
                >
                  {submittingCorrection ? 'Submitting...' : 'Submit Correction Request'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TodayAttendanceCard;
