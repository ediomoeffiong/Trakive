const EARTH_RADIUS_M = 6371000;

function toRadians(degrees) {
  return (Number(degrees) * Math.PI) / 180;
}

/**
 * Haversine distance in metres between two WGS84 coordinates.
 */
function haversineDistanceM(lat1, lng1, lat2, lng2) {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(Number(lat2) - Number(lat1));
  const Δλ = toRadians(Number(lng2) - Number(lng1));

  const a = Math.sin(Δφ / 2) ** 2
    + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

function isValidCoordinate(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);
  return Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90
    && longitude >= -180 && longitude <= 180;
}

/**
 * Pick the nearest office whose geofence contains the point.
 * When multiple offices overlap, the closest centre wins.
 */
function matchOffice(lat, lng, offices = []) {
  if (!isValidCoordinate(lat, lng)) return null;

  let best = null;
  for (const office of offices) {
    if (!office || office.is_active === false) continue;
    if (!isValidCoordinate(office.latitude, office.longitude)) continue;
    const distance_m = haversineDistanceM(lat, lng, office.latitude, office.longitude);
    const radius_m = Number(office.radius_m) || 200;
    if (distance_m <= radius_m) {
      if (!best || distance_m < best.distance_m) {
        best = { office, distance_m, radius_m };
      }
    }
  }
  return best;
}

function nearestOffice(lat, lng, offices = []) {
  if (!isValidCoordinate(lat, lng)) return null;
  let best = null;
  for (const office of offices) {
    if (!office || office.is_active === false) continue;
    if (!isValidCoordinate(office.latitude, office.longitude)) continue;
    const distance_m = haversineDistanceM(lat, lng, office.latitude, office.longitude);
    if (!best || distance_m < best.distance_m) {
      best = { office, distance_m, radius_m: Number(office.radius_m) || 200 };
    }
  }
  return best;
}

/**
 * GPS accuracy that is larger than the geofence makes inside/outside unreliable.
 */
function isAccuracyReliable(accuracyM, radiusM, maxAccuracyM) {
  if (accuracyM === null || accuracyM === undefined || Number.isNaN(Number(accuracyM))) {
    return { reliable: false, reason: 'missing_accuracy' };
  }
  const accuracy = Number(accuracyM);
  const radius = Number(radiusM) || 200;
  const cap = Number(maxAccuracyM) || radius;
  if (accuracy < 0) return { reliable: false, reason: 'invalid_accuracy' };
  if (accuracy > cap) return { reliable: false, reason: 'accuracy_exceeds_policy' };
  if (accuracy > radius) return { reliable: false, reason: 'accuracy_exceeds_geofence' };
  return { reliable: true, reason: null };
}

module.exports = {
  haversineDistanceM,
  isValidCoordinate,
  matchOffice,
  nearestOffice,
  isAccuracyReliable,
};
