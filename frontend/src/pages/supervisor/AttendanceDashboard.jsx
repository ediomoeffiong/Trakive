import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { RiDownload2Line, RiFilePdf2Line, RiMapPinLine, RiRefreshLine } from 'react-icons/ri';
import { Card, Button, Badge, Skeleton, EmptyState } from '../../components/ui';
import { attendanceService } from '../../services/attendanceService';

const label = (value) => (value || 'pending').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const todayIso = () => new Date().toISOString().slice(0, 10);

const statusVariant = {
  present: 'success',
  late: 'warning',
  absent: 'danger',
  remote: 'primary',
  excused: 'neutral',
  pending: 'warning',
};

function Field({ label: title, children }) {
  return (
    <label style={{ display: 'grid', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-neutral-500)', fontWeight: 600 }}>
      {title}
      {children}
    </label>
  );
}

const inputStyle = {
  width: '100%',
  border: '1px solid var(--color-neutral-200)',
  borderRadius: 8,
  padding: '0.65rem 0.75rem',
  font: 'inherit',
  color: 'var(--color-neutral-800)',
  background: '#fff',
};

const emptyOffice = () => ({ id: null, name: '', latitude: '', longitude: '', radius_meters: 200, address: '', is_active: true });

const mapOfficeToForm = (item) => ({
  id: item?.id || null,
  name: item?.name || '',
  latitude: item?.latitude ?? '',
  longitude: item?.longitude ?? '',
  radius_meters: item?.radius_meters ?? 200,
  address: item?.address || '',
  is_active: item?.is_active ?? true,
});

const AttendanceDashboard = () => {
  const [date, setDate] = useState(todayIso());
  const [dashboard, setDashboard] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [office, setOffice] = useState(() => emptyOffice());
  const [policy, setPolicy] = useState({ required_weekdays: [2, 3, 4], grace_minutes: 60, timezone: 'Africa/Lagos', attendance_score_enabled: true, attendance_score_weight: 30 });
  const [override, setOverride] = useState({ start_date: todayIso(), end_date: todayIso(), status: 'remote', reason: '' });
  const [holiday, setHoliday] = useState({ date: todayIso(), name: '' });
  const [manual, setManual] = useState({ intern_id: '', date: todayIso(), status: 'present', reason: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, conf] = await Promise.all([
        attendanceService.getSupervisorDashboard({ date }),
        attendanceService.getConfig(),
      ]);
      setDashboard(dash);
      setConfig(conf);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to load attendance dashboard.');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const offices = config?.offices || [];
    if (offices.length === 0) return;

    setOffice((current) => {
      const selected = offices.find((item) => item.id === current.id) || offices[0];
      const hasUnsavedOffice =
        !current.id &&
        (String(current.name).trim() ||
          String(current.latitude).trim() ||
          String(current.longitude).trim() ||
          String(current.address).trim());
      return hasUnsavedOffice ? current : mapOfficeToForm(selected);
    });
  }, [config?.offices]);

  const exportParams = useMemo(() => ({ date }), [date]);

  const submit = async (kind) => {
    try {
      if (kind === 'office') {
        const latitude = Number(office.latitude);
        const longitude = Number(office.longitude);
        const radius = Number(office.radius_meters || 200);
        if (!office.name.trim() || !Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(radius)) {
          toast.error('Add a valid office name, latitude, longitude, and radius.');
          return;
        }

        const payload = {
          name: office.name.trim(),
          address: office.address?.trim() || null,
          latitude,
          longitude,
          radius_meters: radius,
          is_active: office.is_active,
        };
        if (office.id) payload.id = office.id;

        const savedOffice = await attendanceService.saveOffice(payload);
        setOffice(mapOfficeToForm(savedOffice));
      }
      if (kind === 'policy') await attendanceService.savePolicy(policy);
      if (kind === 'override') await attendanceService.createOverride(override);
      if (kind === 'holiday') {
        await attendanceService.addHoliday(holiday);
        setHoliday({ date: todayIso(), name: '' });
      }
      if (kind === 'manual') await attendanceService.manualAttendance(manual);
      toast.success('Attendance change saved.');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save attendance change.');
    }
  };

  const review = async (id, status) => {
    try {
      await attendanceService.reviewCorrection(id, { status, reason: status === 'approved' ? 'Approved by supervisor' : 'Rejected by supervisor' });
      toast.success(`Correction ${status}.`);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to review correction.');
    }
  };

  const download = async (format) => {
    try {
      const response = await attendanceService.exportReport({ ...exportParams, format });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      const disposition = response.headers?.['content-disposition'] || '';
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] || `attendance-${date}.${format}`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to export attendance report.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem', minWidth: 0 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--color-neutral-900)' }}>Attendance Dashboard</h1>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--color-neutral-500)' }}>Track expected interns, check-ins, corrections, schedules, offices, and report exports.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} style={inputStyle} />
          <Button variant="outline" onClick={load}><RiRefreshLine /> Refresh</Button>
          <Button variant="outline" onClick={() => download('csv')}><RiDownload2Line /> CSV</Button>
          <Button variant="outline" onClick={() => download('pdf')}><RiFilePdf2Line /> PDF</Button>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-kpi-grid">{[1, 2, 3, 4].map((i) => <Skeleton key={i} height="110px" />)}</div>
      ) : (
        <div className="dashboard-kpi-grid">
          {[
            ['Expected', dashboard?.counts?.expected],
            ['Present', dashboard?.counts?.present],
            ['Late', dashboard?.counts?.late],
            ['Pending', dashboard?.counts?.pending],
          ].map(([title, value]) => (
            <Card key={title}>
              <p style={{ margin: 0, color: 'var(--color-neutral-500)', fontSize: '0.8rem' }}>{title}</p>
              <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.8rem' }}>{value || 0}</h3>
            </Card>
          ))}
        </div>
      )}

      <Card header={<h3 style={{ margin: 0 }}>Today's Expected Interns</h3>}>
        {loading ? (
          <Skeleton height="260px" />
        ) : (dashboard?.expected || []).length === 0 ? (
          <EmptyState title="No interns match the selected filters" description="Try another date or filter." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 850, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--color-neutral-500)', fontSize: '0.78rem' }}>
                  <th style={{ padding: '0.75rem' }}>Intern</th>
                  <th style={{ padding: '0.75rem' }}>Department</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Check In</th>
                  <th style={{ padding: '0.75rem' }}>Office</th>
                  <th style={{ padding: '0.75rem' }}>Verification</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.expected.map((row) => (
                  <tr key={row.internship_record_id} style={{ borderTop: '1px solid var(--color-neutral-100)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <strong>{row.first_name} {row.last_name}</strong>
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{row.email}</p>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{row.department_name || '-'}</td>
                    <td style={{ padding: '0.75rem' }}><Badge variant={statusVariant[row.status || 'pending'] || 'neutral'}>{label(row.status)}</Badge></td>
                    <td style={{ padding: '0.75rem' }}>{row.check_in ? new Date(row.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td style={{ padding: '0.75rem' }}>{row.office_name || '-'}</td>
                    <td style={{ padding: '0.75rem' }}>{label(row.verification_status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid-responsive">
        <Card header={<h3 style={{ margin: 0 }}>Correction Queue</h3>}>
          {(dashboard?.correction_queue || []).length === 0 ? (
            <EmptyState title="No pending correction requests" description="Requests from interns will appear here." />
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {dashboard.correction_queue.map((request) => (
                <div key={request.id} style={{ border: '1px solid var(--color-neutral-200)', borderRadius: 8, padding: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <strong>{request.first_name} {request.last_name}</strong>
                    <Badge variant={request.status === 'pending' ? 'warning' : request.status === 'approved' ? 'success' : 'danger'}>{label(request.status)}</Badge>
                  </div>
                  <p style={{ margin: '0.4rem 0', color: 'var(--color-neutral-600)', fontSize: '0.85rem' }}>{request.reason}</p>
                  {request.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Button size="sm" onClick={() => review(request.id, 'approved')}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => review(request.id, 'rejected')}>Reject</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card header={<h3 style={{ margin: 0 }}>Manual Correction</h3>}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <Field label="Intern User ID"><input style={inputStyle} value={manual.intern_id} onChange={(e) => setManual({ ...manual, intern_id: e.target.value })} /></Field>
            <Field label="Date"><input type="date" style={inputStyle} value={manual.date} onChange={(e) => setManual({ ...manual, date: e.target.value })} /></Field>
            <Field label="Status">
              <select style={inputStyle} value={manual.status} onChange={(e) => setManual({ ...manual, status: e.target.value })}>
                {['present', 'late', 'absent', 'excused', 'remote', 'public_holiday', 'non_workday'].map((item) => <option key={item} value={item}>{label(item)}</option>)}
              </select>
            </Field>
            <Field label="Reason"><textarea rows={3} style={inputStyle} value={manual.reason} onChange={(e) => setManual({ ...manual, reason: e.target.value })} /></Field>
            <Button onClick={() => submit('manual')}>Save Correction</Button>
          </div>
        </Card>
      </div>

      <div className="grid-responsive">
        <Card header={<h3 style={{ margin: 0 }}>Office / Geofence</h3>}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <Field label="Office name"><input style={inputStyle} value={office.name} onChange={(e) => setOffice({ ...office, name: e.target.value })} /></Field>
            <Field label="Address"><input style={inputStyle} value={office.address} onChange={(e) => setOffice({ ...office, address: e.target.value })} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
              <Field label="Latitude"><input style={inputStyle} value={office.latitude} onChange={(e) => setOffice({ ...office, latitude: e.target.value })} /></Field>
              <Field label="Longitude"><input style={inputStyle} value={office.longitude} onChange={(e) => setOffice({ ...office, longitude: e.target.value })} /></Field>
              <Field label="Radius (m)"><input type="number" style={inputStyle} value={office.radius_meters} onChange={(e) => setOffice({ ...office, radius_meters: e.target.value })} /></Field>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={office.is_active} onChange={(e) => setOffice({ ...office, is_active: e.target.checked })} />
              Active geofence
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Button onClick={() => submit('office')}><RiMapPinLine /> {office.id ? 'Update Office' : 'Save Office'}</Button>
              <Button variant="outline" onClick={() => setOffice(emptyOffice())}>New Office</Button>
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {(config?.offices || []).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOffice(mapOfficeToForm(item))}
                  style={{
                    textAlign: 'left',
                    border: `1px solid ${office.id === item.id ? 'var(--color-primary-300)' : 'var(--color-neutral-200)'}`,
                    background: office.id === item.id ? 'var(--color-primary-50)' : '#fff',
                    borderRadius: 8,
                    padding: '0.65rem 0.75rem',
                    font: 'inherit',
                    color: 'var(--color-neutral-600)',
                    cursor: 'pointer',
                  }}
                >
                  <strong style={{ color: 'var(--color-neutral-800)' }}>{item.name}</strong> · {item.radius_meters}m
                  <span style={{ marginLeft: '0.4rem', color: item.is_active ? 'var(--color-success-600)' : 'var(--color-neutral-400)' }}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card header={<h3 style={{ margin: 0 }}>Department Policy</h3>}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <Field label="Required weekdays">
              <input style={inputStyle} value={policy.required_weekdays.join(',')} onChange={(e) => setPolicy({ ...policy, required_weekdays: e.target.value.split(',').map((n) => Number(n.trim())).filter((n) => Number.isFinite(n)) })} />
            </Field>
            <Field label="Grace minutes"><input type="number" style={inputStyle} value={policy.grace_minutes} onChange={(e) => setPolicy({ ...policy, grace_minutes: Number(e.target.value) })} /></Field>
            <Field label="Timezone"><input style={inputStyle} value={policy.timezone} onChange={(e) => setPolicy({ ...policy, timezone: e.target.value })} /></Field>
            <Field label="Attendance weight"><input type="number" style={inputStyle} value={policy.attendance_score_weight} onChange={(e) => setPolicy({ ...policy, attendance_score_weight: Number(e.target.value) })} /></Field>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={policy.attendance_score_enabled} onChange={(e) => setPolicy({ ...policy, attendance_score_enabled: e.target.checked })} />
              Include attendance in performance score
            </label>
            <Button onClick={() => submit('policy')}>Save Policy</Button>
          </div>
        </Card>
      </div>

      <div className="grid-responsive">
        <Card header={<h3 style={{ margin: 0 }}>Schedule Override</h3>}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <Field label="Start date"><input type="date" style={inputStyle} value={override.start_date} onChange={(e) => setOverride({ ...override, start_date: e.target.value })} /></Field>
            <Field label="End date"><input type="date" style={inputStyle} value={override.end_date} onChange={(e) => setOverride({ ...override, end_date: e.target.value })} /></Field>
            <Field label="Status">
              <select style={inputStyle} value={override.status} onChange={(e) => setOverride({ ...override, status: e.target.value })}>
                {['remote', 'excused', 'public_holiday', 'non_workday'].map((item) => <option key={item} value={item}>{label(item)}</option>)}
              </select>
            </Field>
            <Field label="Reason"><textarea rows={3} style={inputStyle} value={override.reason} onChange={(e) => setOverride({ ...override, reason: e.target.value })} /></Field>
            <Button onClick={() => submit('override')}>Create Override</Button>
          </div>
        </Card>

        <Card header={<h3 style={{ margin: 0 }}>Organization Holiday</h3>}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <Field label="Date"><input type="date" style={inputStyle} value={holiday.date} onChange={(e) => setHoliday({ ...holiday, date: e.target.value })} /></Field>
            <Field label="Name"><input style={inputStyle} value={holiday.name} onChange={(e) => setHoliday({ ...holiday, name: e.target.value })} /></Field>
            <Button onClick={() => submit('holiday')}>Add Holiday / Closure</Button>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {(config?.holidays || []).slice(0, 8).map((item) => (
                <div key={item.id} style={{ fontSize: '0.85rem', color: 'var(--color-neutral-600)' }}>
                  <strong>{new Date(item.date).toLocaleDateString()}</strong> · {item.name}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default AttendanceDashboard;
