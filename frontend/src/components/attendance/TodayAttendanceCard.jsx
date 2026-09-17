import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiMapPinLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
} from 'react-icons/ri';
import { Card, Button, Badge, Skeleton } from '../ui';
import { attendanceService } from '../../services/attendanceService';
import {
  requestBrowserLocation,
  getGeolocationErrorState,
  attendanceErrorCode,
  attendanceErrorMessage,
  statusVariant,
  statusLabel,
} from '../../utils/attendanceGeo';
import { ROUTES } from '../../constants';
import CorrectionRequestModal from './CorrectionRequestModal';

const LOCATION_COPY = {
  denied: 'Location permission was declined. Use Check In when you are ready to allow access.',
  unavailable: 'Your location could not be determined. Try again in an open area or request a review.',
  inaccurate: 'GPS accuracy is too low to verify the office geofence.',
  outside: 'You are outside every configured office range.',
  offline: 'Check-in could not reach the server. Try again when you are online.',
};

const TodayAttendanceCard = ({ compact = false }) => {
  const navigate = useNavigate();
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [locationState, setLocationState] = useState(null);
  const [message, setMessage] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await attendanceService.getToday();
      setToday(data);
    } catch (err) {
      setMessage(attendanceErrorMessage(err, 'Unable to load attendance for today'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCheckIn = async () => {
    setBusy(true);
    setMessage('');
    try {
      const coords = await requestBrowserLocation();
      const record = await attendanceService.checkIn({ ...coords, manual: true });
      setToday((prev) => ({
        ...prev,
        already_checked_in: true,
        can_check_in: false,
        record,
        derived_status: record.status,
      }));
      setLocationState(null);
    } catch (err) {
      if (err.code) {
        const state = getGeolocationErrorState(err);
        setLocationState(state);
        setMessage(LOCATION_COPY[state]);
      } else if (!err.response) {
        setLocationState('offline');
        setMessage(LOCATION_COPY.offline);
      } else {
        const code = attendanceErrorCode(err);
        if (code === 'LOCATION_INACCURATE') setLocationState('inaccurate');
        else if (code === 'OUTSIDE_GEOFENCE') setLocationState('outside');
        else if (code === 'LOCATION_UNAVAILABLE') setLocationState('unavailable');
        else if (code === 'ALREADY_CHECKED_IN') {
          setLocationState(null);
          await load();
        }
        setMessage(attendanceErrorMessage(err));
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <Skeleton height="1.25rem" width="40%" />
        <Skeleton height="4rem" style={{ marginTop: '1rem' }} />
      </Card>
    );
  }

  const status = today?.record?.status || today?.derived_status;
  const checkInTime = today?.record?.check_in
    ? new Date(today.record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <Card className="attendance-today-card">
      <div className="attendance-today-head">
        <div>
          <p className="attendance-kicker">Today’s Attendance</p>
          <h3>{today?.required ? 'Attendance is required today' : today?.label || 'Not required today'}</h3>
          <p className="attendance-meta">
            {today?.date} · scheduled {today?.scheduled_arrival || '08:00'}
            {today?.grace_until ? ` · grace until ${String(today.grace_until).slice(0, 5)}` : ''}
          </p>
        </div>
        {status ? (
          <Badge variant={statusVariant(status)}>{statusLabel(status)}</Badge>
        ) : null}
      </div>

      <div className="attendance-today-grid">
        <div className="attendance-stat">
          <RiMapPinLine />
          <div>
            <span>Office verification</span>
            <strong>
              {today?.record?.office_name
                || (locationState ? LOCATION_COPY[locationState]?.split('.')[0] : 'Waiting for location')}
            </strong>
          </div>
        </div>
        <div className="attendance-stat">
          <RiTimeLine />
          <div>
            <span>Check-in</span>
            <strong>{checkInTime || 'Not checked in'}</strong>
          </div>
        </div>
        <div className="attendance-stat">
          <RiCheckboxCircleLine />
          <div>
            <span>Internship</span>
            <strong>{today?.internship_title || 'Current internship'}</strong>
          </div>
        </div>
      </div>

      {message ? (
        <p className="attendance-alert">
          <RiErrorWarningLine /> {message}
        </p>
      ) : null}

      <div className="attendance-today-actions">
        {today?.can_check_in ? (
          <Button onClick={handleCheckIn} loading={busy}>
            Check In
          </Button>
        ) : null}
        {(locationState || today?.can_check_in) && !today?.pending_correction ? (
          <Button variant="outline" onClick={() => setReviewOpen(true)}>
            Request review
          </Button>
        ) : null}
        {!compact ? (
          <Button variant="ghost" onClick={() => navigate(ROUTES.ATTENDANCE)}>
            View history
          </Button>
        ) : null}
      </div>

      <CorrectionRequestModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        date={today?.date}
        locationState={locationState}
        onSubmitted={load}
      />
    </Card>
  );
};

export default TodayAttendanceCard;
