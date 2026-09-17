import { useEffect, useRef } from 'react';
import { attendanceService } from '../../services/attendanceService';
import {
  geoPromptKey,
  requestBrowserLocation,
  getGeolocationErrorState,
} from '../../utils/attendanceGeo';
import { useCurrentUser } from '../../store';

/**
 * On intern session start: if today is required and not checked in,
 * request location once and auto check-in. Denied/failed permission is
 * not retried automatically.
 */
const AttendanceSessionBootstrap = () => {
  const user = useCurrentUser();
  const ran = useRef(false);

  useEffect(() => {
    if (!user?.id || ran.current) return;
    ran.current = true;

    let cancelled = false;

    (async () => {
      try {
        const today = await attendanceService.getToday();
        if (cancelled || !today?.can_check_in) return;
        const key = geoPromptKey(user.id, today.date);
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, 'prompted');
        try {
          const coords = await requestBrowserLocation();
          if (cancelled) return;
          await attendanceService.checkIn({ ...coords, auto: true });
        } catch (geoErr) {
          const state = getGeolocationErrorState(geoErr);
          sessionStorage.setItem(key, state);
        }
      } catch {
        // API unavailable — intern can still use Check In on the dashboard.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return null;
};

export default AttendanceSessionBootstrap;
