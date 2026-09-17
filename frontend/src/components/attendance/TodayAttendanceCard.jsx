import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  RiCalendarCheckLine,
  RiMapPinLine,
  RiRefreshLine,
  RiTimeLine,
  RiErrorWarningLine,
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

const statusLabel = (value) => (value ? value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Pending');

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

async function getLocation() {
  const permissionState = await getLocationPermissionState();
  if (permissionState === 'denied') {
    throw makeLocationError(
      LOCATION_ERROR.DENIED,
      'Location permission is blocked for Trakive. Enable location access in your browser site settings, then tap Check In again.',
    );
  }

  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      reject(makeLocationError(
        LOCATION_ERROR.UNAVAILABLE,
        'Location check-in requires HTTPS or localhost. Open Trakive from a secure URL and try again.',
      ));
      return;
    }
    if (!navigator.geolocation) {
      reject(makeLocationError(LOCATION_ERROR.UNSUPPORTED, 'Geolocation is not available in this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, (error) => {
      error.permissionState = permissionState;
      reject(error);
    }, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
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
      return 'Trakive has browser location access, but your device or operating system still denied the location lookup. Turn on device location services for this browser, then try again.';
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

const TodayAttendanceCard = ({ compact = false }) => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [submittingCorrection, setSubmittingCorrection] = useState(false);

  const autoKey = useMemo(() => `trakive_attendance_auto_${state?.date || 'today'}`, [state?.date]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getToday();
      setState(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load attendance.');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitCheckIn = useCallback(async (source = 'manual') => {
    setCheckingIn(true);
    setError('');
    try {
      const position = await getLocation();
      await attendanceService.checkIn({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy_meters: position.coords.accuracy,
        source,
      });
      toast.success('Attendance check-in recorded.');
      await load();
    } catch (err) {
      const message = getAttendanceErrorMessage(err);
      setError(message);
      if (source !== 'auto') toast.error(message);
    } finally {
      setCheckingIn(false);
    }
  }, [load]);

  const submitCorrection = async () => {
    if (!reason.trim()) {
      toast.error('Add a short reason for supervisor review.');
      return;
    }
    setSubmittingCorrection(true);
    try {
      await attendanceService.requestCorrection({
        date: state?.date,
        requested_status: 'present',
        reason,
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

  useEffect(() => {
    if (!state?.can_check_in || checkingIn) return;
    if (sessionStorage.getItem(autoKey)) return;
    sessionStorage.setItem(autoKey, '1');
    submitCheckIn('auto');
  }, [state?.can_check_in, autoKey, checkingIn, submitCheckIn]);

  if (loading) {
    return (
      <Card>
        <Skeleton height="1rem" width="45%" />
        <Skeleton height="2rem" width="70%" style={{ marginTop: '0.75rem' }} />
        <Skeleton height="2.5rem" width="100%" style={{ marginTop: '1rem' }} />
      </Card>
    );
  }

  const record = state?.record;
  const required = Boolean(state?.required);
  const status = record?.status || state?.derived_status || (required ? 'pending' : 'non_workday');

  return (
    <Card
      header={
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 8, background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
              <RiCalendarCheckLine />
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-neutral-900)' }}>Today's Attendance</h3>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: 'var(--color-neutral-500)' }}>{state?.date}</p>
            </div>
          </div>
          <Badge variant={statusVariant[status] || 'warning'}>{statusLabel(status)}</Badge>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: '0.875rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Required</p>
            <p style={{ margin: '0.2rem 0 0', fontWeight: 700 }}>{required ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Schedule</p>
            <p style={{ margin: '0.2rem 0 0', fontWeight: 700 }}>
              <RiTimeLine style={{ verticalAlign: '-2px' }} /> {String(state?.schedule?.arrival_time || '08:00').slice(0, 5)}
              {' '}+ {state?.schedule?.grace_minutes ?? 60}m
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Office Verification</p>
            <p style={{ margin: '0.2rem 0 0', fontWeight: 700 }}>
              <RiMapPinLine style={{ verticalAlign: '-2px' }} /> {statusLabel(record?.verification_status || (required ? 'pending' : 'not_required'))}
            </p>
          </div>
        </div>

        {record?.check_in && (
          <div style={{ padding: '0.75rem', border: '1px solid var(--color-neutral-200)', borderRadius: 8, background: 'var(--color-neutral-50)' }}>
            <strong>Checked in:</strong> {new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {record.office_name ? ` at ${record.office_name}` : ''}
          </div>
        )}

        {state?.reason && !required && (
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>{state.reason}</p>
        )}

        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: 'var(--color-danger-600)', fontSize: '0.85rem' }}>
            <RiErrorWarningLine style={{ marginTop: 2, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {state?.can_check_in && (
          <Button onClick={() => submitCheckIn('manual')} disabled={checkingIn} style={{ width: '100%' }}>
            <RiRefreshLine /> {checkingIn ? 'Checking location...' : 'Check In'}
          </Button>
        )}

        {state?.can_check_in && (
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)', lineHeight: 1.5 }}>
            Check-in uses your current device location and is verified on the server against the configured office geofence.
          </p>
        )}

        {required && !record?.check_in && (
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Request supervisor review if legitimate attendance could not be verified"
              rows={3}
              style={{ width: '100%', resize: 'vertical', border: '1px solid var(--color-neutral-200)', borderRadius: 8, padding: '0.75rem', font: 'inherit' }}
            />
            <Button variant="outline" onClick={submitCorrection} disabled={submittingCorrection}>
              {submittingCorrection ? 'Sending...' : 'Submit Correction Request'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TodayAttendanceCard;
