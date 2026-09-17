import api from './api';

const unwrap = (response) => response.data?.data ?? response.data;

export const attendanceService = {
  getToday: async () => unwrap(await api.get('/attendance/today')),

  checkIn: async ({ latitude, longitude, accuracy_meters, source = 'manual' }) =>
    unwrap(await api.post('/attendance/check-in', {
      latitude,
      longitude,
      accuracy_meters,
      source,
      user_agent: navigator.userAgent,
    })),

  requestCorrection: async (payload) => unwrap(await api.post('/attendance/corrections', payload)),

  getHistory: async (params = {}) => unwrap(await api.get('/attendance/history', { params })),

  getSupervisorDashboard: async (params = {}) =>
    unwrap(await api.get('/attendance/supervisor/dashboard', { params })),

  getConfig: async () => unwrap(await api.get('/attendance/config')),

  saveOffice: async (payload) => unwrap(await api.post('/attendance/config/offices', payload)),

  savePolicy: async (payload) => unwrap(await api.post('/attendance/config/policies', payload)),

  createOverride: async (payload) => unwrap(await api.post('/attendance/config/overrides', payload)),

  addHoliday: async (payload) => unwrap(await api.post('/attendance/config/holidays', payload)),

  manualAttendance: async (payload) => unwrap(await api.post('/attendance/supervisor/manual', payload)),

  reviewCorrection: async (id, payload) =>
    unwrap(await api.patch(`/attendance/supervisor/corrections/${id}`, payload)),

  exportReport: async (params = {}) => {
    const response = await api.get('/attendance/supervisor/export', {
      params,
      responseType: 'blob',
    });
    return response;
  },
};
