export function getGeolocationErrorState(error) {
  if (!error) return 'unavailable';
  if (error.code === 1) return 'denied';
  if (error.code === 2) return 'unavailable';
  if (error.code === 3) return 'unavailable';
  return 'unavailable';
}

export function requestBrowserLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const err = new Error('Geolocation is not supported in this browser');
      err.code = 2;
      reject(err);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      reject,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
        ...options,
      }
    );
  });
}

export function geoPromptKey(userId, date) {
  return `trakive_geo_prompted_${userId || 'anon'}_${date || 'today'}`;
}

export function attendanceErrorCode(err) {
  return err?.response?.data?.errors?.code || err?.response?.data?.errors?.[0]?.message || null;
}

export function attendanceErrorMessage(err, fallback = 'Something went wrong') {
  return err?.response?.data?.message || err?.message || fallback;
}

export function statusVariant(status) {
  switch (status) {
    case 'present':
    case 'remote':
      return 'success';
    case 'late':
    case 'pending_review':
    case 'pending_correction':
    case 'awaiting':
      return 'warning';
    case 'absent':
      return 'danger';
    case 'excused':
    case 'public_holiday':
    case 'non_workday':
      return 'neutral';
    default:
      return 'primary';
  }
}

export function statusLabel(status) {
  const map = {
    present: 'Present',
    late: 'Late',
    absent: 'Absent',
    excused: 'Excused',
    remote: 'Remote',
    public_holiday: 'Public Holiday',
    non_workday: 'Non-Workday',
    pending_review: 'Pending Review',
    pending_correction: 'Needs Correction',
    awaiting: 'Awaiting check-in',
    upcoming: 'Upcoming',
    absent_pending: 'Absent (pending close)',
  };
  return map[status] || status || '—';
}
