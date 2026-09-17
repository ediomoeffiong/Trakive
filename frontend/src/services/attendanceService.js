import api from './api';

const unwrap = (res) => res?.data?.data ?? res?.data;

export const attendanceService = {
  getToday(params) {
    return api.get('/attendance/me/today', { params }).then(unwrap);
  },
  checkIn(payload) {
    return api.post('/attendance/check-in', payload).then(unwrap);
  },
  requestCorrection(payload) {
    return api.post('/attendance/corrections', payload).then(unwrap);
  },
  getHistory(params) {
    return api.get('/attendance/me/history', { params }).then(unwrap);
  },
  getSummary(params) {
    return api.get('/attendance/me/summary', { params }).then(unwrap);
  },
  getDashboard(params) {
    return api.get('/attendance/dashboard', { params }).then(unwrap);
  },
  getConfig() {
    return api.get('/attendance/config').then(unwrap);
  },
  updatePolicy(payload) {
    return api.patch('/attendance/config/policy', payload).then(unwrap);
  },
  updatePerformance(payload) {
    return api.patch('/attendance/config/performance', payload).then(unwrap);
  },
  updateDepartmentSchedule(departmentId, weekdays) {
    return api.patch(`/attendance/config/departments/${departmentId}/schedule`, { weekdays }).then(unwrap);
  },
  createOverride(payload) {
    return api.post('/attendance/overrides', payload).then(unwrap);
  },
  deleteOverride(id) {
    return api.delete(`/attendance/overrides/${id}`).then(unwrap);
  },
  listOffices() {
    return api.get('/attendance/offices').then(unwrap);
  },
  createOffice(payload) {
    return api.post('/attendance/offices', payload).then(unwrap);
  },
  updateOffice(id, payload) {
    return api.patch(`/attendance/offices/${id}`, payload).then(unwrap);
  },
  deleteOffice(id) {
    return api.delete(`/attendance/offices/${id}`).then(unwrap);
  },
  createHoliday(payload) {
    return api.post('/attendance/holidays', payload).then(unwrap);
  },
  deleteHoliday(id) {
    return api.delete(`/attendance/holidays/${id}`).then(unwrap);
  },
  internHistory(internId, params) {
    return api.get(`/attendance/interns/${internId}/history`, { params }).then(unwrap);
  },
  internSummary(internId, params) {
    return api.get(`/attendance/interns/${internId}/summary`, { params }).then(unwrap);
  },
  manualUpsert(payload) {
    return api.post('/attendance/manual', payload).then(unwrap);
  },
  reviewCorrection(id, payload) {
    return api.patch(`/attendance/corrections/${id}`, payload).then(unwrap);
  },
  async export(params) {
    const res = await api.get('/attendance/export', { params, responseType: 'blob' });
    return res.data;
  },
};

export default attendanceService;
