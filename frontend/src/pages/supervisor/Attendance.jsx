import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Card, Badge, Button, Input, Modal, EmptyState, Skeleton } from '../../components/ui';
import { attendanceService } from '../../services/attendanceService';
import { attendanceErrorMessage, statusLabel, statusVariant } from '../../utils/attendanceGeo';

const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'history', label: 'History' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'config', label: 'Configuration' },
];

const WEEKDAY_OPTS = [
  { v: 1, l: 'Mon' }, { v: 2, l: 'Tue' }, { v: 3, l: 'Wed' },
  { v: 4, l: 'Thu' }, { v: 5, l: 'Fri' }, { v: 6, l: 'Sat' }, { v: 7, l: 'Sun' },
];

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const SupervisorAttendancePage = () => {
  const [tab, setTab] = useState('today');
  const [filters, setFilters] = useState({ date: new Date().toISOString().slice(0, 10), search: '' });
  const [dash, setDash] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manual, setManual] = useState({ open: false, intern_id: '', date: '', status: 'present', reason: '' });
  const [officeForm, setOfficeForm] = useState({ name: '', latitude: '', longitude: '', radius_m: 200, address: '' });
  const [holidayForm, setHolidayForm] = useState({ holiday_date: '', name: '', kind: 'org_holiday' });
  const [overrideForm, setOverrideForm] = useState({
    scope_type: 'department', kind: 'remote', start_date: '', end_date: '', reason: '', intern_id: '', department_id: '',
  });

  const loadDash = useCallback(async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getDashboard(filters);
      setDash(data);
    } catch (err) {
      toast.error(attendanceErrorMessage(err, 'Unable to load attendance dashboard'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadConfig = useCallback(async () => {
    try {
      setConfig(await attendanceService.getConfig());
    } catch (err) {
      toast.error(attendanceErrorMessage(err, 'Unable to load attendance settings'));
    }
  }, []);

  useEffect(() => {
    loadDash();
  }, [loadDash]);

  useEffect(() => {
    if (tab === 'config') loadConfig();
  }, [tab, loadConfig]);

  const counts = dash?.counts || {};

  const exportFile = async (format) => {
    try {
      const blob = await attendanceService.export({
        format,
        date: filters.date,
        start_date: filters.start_date || filters.date,
        end_date: filters.end_date || filters.date,
        intern_id: filters.intern_id || undefined,
        department_id: filters.department_id || undefined,
        internship_record_id: filters.internship_record_id || undefined,
        office_id: filters.office_id || undefined,
        status: filters.status || undefined,
        month: filters.month || undefined,
      });
      downloadBlob(blob, `attendance.${format}`);
    } catch (err) {
      toast.error(attendanceErrorMessage(err, 'Export failed'));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="attendance-page">
      <div className="attendance-welcome">
        <div>
          <h2>Attendance dashboard</h2>
          <p>Track today’s expected interns, reviews, offices and schedules.</p>
        </div>
        <div className="attendance-today-actions">
          <Button variant="outline" onClick={() => exportFile('csv')}>CSV</Button>
          <Button variant="outline" onClick={() => exportFile('pdf')}>PDF</Button>
        </div>
      </div>

      <div className="attendance-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'is-active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="attendance-filters">
        <Input type="date" value={filters.date || ''} onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))} />
        <Input placeholder="Search intern" value={filters.search || ''} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
        <Input placeholder="Department ID" value={filters.department_id || ''} onChange={(e) => setFilters((f) => ({ ...f, department_id: e.target.value }))} />
        <Input placeholder="Intern ID" value={filters.intern_id || ''} onChange={(e) => setFilters((f) => ({ ...f, intern_id: e.target.value }))} />
        <Input placeholder="Internship ID" value={filters.internship_record_id || ''} onChange={(e) => setFilters((f) => ({ ...f, internship_record_id: e.target.value }))} />
        <Input type="month" value={filters.month || ''} onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))} />
      </div>

      {tab === 'today' && (
        <>
          <div className="attendance-stats-grid">
            {[
              ['Expected', counts.expected],
              ['Present', counts.present],
              ['Late', counts.late],
              ['Absent', counts.absent],
              ['Remote', counts.remote],
              ['Excused', counts.excused],
            ].map(([label, value]) => (
              <Card key={label} padding="sm">
                <p className="attendance-kicker">{label}</p>
                <strong className="attendance-stat-value">{value ?? 0}</strong>
              </Card>
            ))}
          </div>
          {loading ? <Skeleton height="200px" /> : (
            <div className="attendance-intern-cards">
              {(dash?.expected_interns || []).filter((i) => {
                if (!filters.search) return true;
                const q = filters.search.toLowerCase();
                return i.name.toLowerCase().includes(q) || i.email?.toLowerCase().includes(q);
              }).map((intern) => (
                <Card key={intern.intern_id} padding="sm" className="attendance-intern-card">
                  <div className="attendance-today-head">
                    <div>
                      <strong>{intern.name}</strong>
                      <p className="attendance-meta">{intern.department_name} · {intern.internship_title || 'Internship'}</p>
                    </div>
                    <Badge variant={statusVariant(intern.status)}>{statusLabel(intern.status)}</Badge>
                  </div>
                  <p className="attendance-meta">
                    Check-in {intern.check_in ? new Date(intern.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    {intern.is_suspicious ? ' · flagged' : ''}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setManual({
                      open: true,
                      intern_id: intern.intern_id,
                      date: dash.date,
                      status: intern.status === 'awaiting' ? 'present' : intern.status,
                      reason: '',
                    })}
                  >
                    Correct
                  </Button>
                </Card>
              ))}
              {!dash?.expected_interns?.length ? (
                <EmptyState title="No expected interns" description="Nobody is scheduled for attendance on this date." />
              ) : null}
            </div>
          )}
        </>
      )}

      {tab === 'history' && (
        <div className="attendance-history-list">
          {(dash?.records || []).map((row) => (
            <div key={row.id} className="attendance-history-row">
              <div>
                <strong>{row.intern_first_name} {row.intern_last_name}</strong>
                <span>{String(row.date).slice(0, 10)} · {row.office_name || row.source} · {row.internship_title}</span>
              </div>
              <Badge variant={statusVariant(row.status)}>{statusLabel(row.status)}</Badge>
            </div>
          ))}
          {(dash?.suspicious || []).length ? (
            <Card>
              <h3>Suspicious / failed verification</h3>
              {dash.suspicious.map((row) => (
                <div key={row.id} className="attendance-history-row">
                  <div>
                    <strong>{row.intern_first_name} {row.intern_last_name}</strong>
                    <span>{JSON.stringify(row.verification_flags || [])}</span>
                  </div>
                  <Badge variant="warning">Flagged</Badge>
                </div>
              ))}
            </Card>
          ) : null}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="attendance-intern-cards">
          {(dash?.corrections || []).map((req) => (
            <Card key={req.id}>
              <strong>{req.intern_first_name} {req.intern_last_name}</strong>
              <p className="attendance-meta">{String(req.request_date).slice(0, 10)} · {req.reason}</p>
              <div className="attendance-today-actions">
                <Button size="sm" onClick={async () => {
                  await attendanceService.reviewCorrection(req.id, { status: 'approved', attendance_status: 'excused' });
                  toast.success('Approved');
                  loadDash();
                }}>Approve as excused</Button>
                <Button size="sm" variant="outline" onClick={async () => {
                  await attendanceService.reviewCorrection(req.id, { status: 'rejected', reviewer_notes: 'Insufficient evidence' });
                  toast.success('Rejected');
                  loadDash();
                }}>Reject</Button>
              </div>
            </Card>
          ))}
          {!dash?.corrections?.length ? <EmptyState title="Review queue empty" description="No pending correction requests." /> : null}
        </div>
      )}

      {tab === 'config' && config && (
        <div className="attendance-config-stack">
          <Card>
            <h3>Policy</h3>
            <p className="attendance-meta">Arrival {String(config.policy.required_arrival_time).slice(0, 5)} · grace {config.policy.grace_minutes} min · {config.policy.timezone}</p>
            <div className="attendance-filters">
              <Input
                type="number"
                label="Grace minutes"
                value={config.policy.grace_minutes}
                onChange={(e) => setConfig((c) => ({ ...c, policy: { ...c.policy, grace_minutes: Number(e.target.value) } }))}
              />
              <Button onClick={async () => {
                await attendanceService.updatePolicy({ grace_minutes: config.policy.grace_minutes });
                toast.success('Policy saved');
              }}>Save grace period</Button>
            </div>
          </Card>

          <Card>
            <h3>Performance component</h3>
            <label className="attendance-check">
              <input
                type="checkbox"
                checked={config.settings.enabled}
                onChange={async (e) => {
                  const settings = await attendanceService.updatePerformance({ enabled: e.target.checked });
                  setConfig((c) => ({ ...c, settings }));
                }}
              />
              Include attendance in intern performance scores
            </label>
            <div className="attendance-filters">
              <Input type="number" step="0.05" label="Attendance weight" value={config.settings.attendance_weight}
                onChange={(e) => setConfig((c) => ({ ...c, settings: { ...c.settings, attendance_weight: Number(e.target.value) } }))} />
              <Button onClick={async () => {
                await attendanceService.updatePerformance({
                  attendance_weight: config.settings.attendance_weight,
                  enabled: config.settings.enabled,
                });
                toast.success('Scoring saved');
              }}>Save weight</Button>
            </div>
          </Card>

          <Card>
            <h3>Department schedules</h3>
            {(config.schedules || []).map((s) => (
              <div key={s.id} className="attendance-schedule-row">
                <strong>{s.department_name}</strong>
                <div className="attendance-weekday-pills">
                  {WEEKDAY_OPTS.map((d) => {
                    const on = (s.weekdays || []).map(Number).includes(d.v);
                    return (
                      <button
                        type="button"
                        key={d.v}
                        className={on ? 'is-on' : ''}
                        onClick={async () => {
                          const next = on
                            ? (s.weekdays || []).filter((w) => Number(w) !== d.v)
                            : [...(s.weekdays || []), d.v];
                          const updated = await attendanceService.updateDepartmentSchedule(s.department_id, next);
                          setConfig((c) => ({
                            ...c,
                            schedules: c.schedules.map((row) => row.id === s.id ? { ...row, weekdays: updated.weekdays } : row),
                          }));
                        }}
                      >
                        {d.l}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </Card>

          <Card>
            <h3>Offices / geofences</h3>
            {(config.offices || []).map((o) => (
              <div key={o.id} className="attendance-history-row">
                <div>
                  <strong>{o.name}</strong>
                  <span>{o.latitude}, {o.longitude} · {o.radius_m}m {o.is_active ? '' : '(inactive)'}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={async () => {
                  await attendanceService.deleteOffice(o.id);
                  loadConfig();
                }}>Remove</Button>
              </div>
            ))}
            <div className="attendance-filters">
              <Input placeholder="Name" value={officeForm.name} onChange={(e) => setOfficeForm((f) => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Latitude" value={officeForm.latitude} onChange={(e) => setOfficeForm((f) => ({ ...f, latitude: e.target.value }))} />
              <Input placeholder="Longitude" value={officeForm.longitude} onChange={(e) => setOfficeForm((f) => ({ ...f, longitude: e.target.value }))} />
              <Input placeholder="Radius m" value={officeForm.radius_m} onChange={(e) => setOfficeForm((f) => ({ ...f, radius_m: e.target.value }))} />
            </div>
            <Button onClick={async () => {
              await attendanceService.createOffice({
                ...officeForm,
                latitude: Number(officeForm.latitude),
                longitude: Number(officeForm.longitude),
                radius_m: Number(officeForm.radius_m) || 200,
              });
              toast.success('Office added');
              setOfficeForm({ name: '', latitude: '', longitude: '', radius_m: 200, address: '' });
              loadConfig();
            }}>Add office</Button>
          </Card>

          <Card>
            <h3>Holidays & closures</h3>
            <p className="attendance-meta">Nigerian public holidays are cached automatically. Add organisation-specific days below.</p>
            {(config.holidays?.orgHolidays || []).map((h) => (
              <div key={h.id} className="attendance-history-row">
                <div>
                  <strong>{h.name}</strong>
                  <span>{String(h.holiday_date).slice(0, 10)} · {h.kind}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={async () => { await attendanceService.deleteHoliday(h.id); loadConfig(); }}>Remove</Button>
              </div>
            ))}
            <div className="attendance-filters">
              <Input type="date" value={holidayForm.holiday_date} onChange={(e) => setHolidayForm((f) => ({ ...f, holiday_date: e.target.value }))} />
              <Input placeholder="Name" value={holidayForm.name} onChange={(e) => setHolidayForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <Button onClick={async () => {
              await attendanceService.createHoliday(holidayForm);
              toast.success('Holiday added');
              loadConfig();
            }}>Add holiday</Button>
          </Card>

          <Card>
            <h3>Overrides</h3>
            {(config.overrides || []).slice(0, 20).map((o) => (
              <div key={o.id} className="attendance-history-row">
                <div>
                  <strong>{o.kind} · {o.scope_type}</strong>
                  <span>{String(o.start_date).slice(0, 10)} – {String(o.end_date).slice(0, 10)} · {o.reason}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={async () => { await attendanceService.deleteOverride(o.id); loadConfig(); }}>Remove</Button>
              </div>
            ))}
            <div className="attendance-filters">
              <select className="input-field" value={overrideForm.kind} onChange={(e) => setOverrideForm((f) => ({ ...f, kind: e.target.value }))}>
                {['remote', 'office_closed', 'company_event', 'training', 'excused', 'schedule'].map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <Input type="date" value={overrideForm.start_date} onChange={(e) => setOverrideForm((f) => ({ ...f, start_date: e.target.value, end_date: e.target.value }))} />
              <Input placeholder="Reason" value={overrideForm.reason} onChange={(e) => setOverrideForm((f) => ({ ...f, reason: e.target.value }))} />
              <Input placeholder="Department ID" value={overrideForm.department_id} onChange={(e) => setOverrideForm((f) => ({ ...f, department_id: e.target.value, intern_id: '' }))} />
              <Input placeholder="Intern ID (optional)" value={overrideForm.intern_id} onChange={(e) => setOverrideForm((f) => ({ ...f, intern_id: e.target.value, scope_type: e.target.value ? 'intern' : 'department' }))} />
            </div>
            <Button onClick={async () => {
              await attendanceService.createOverride({
                ...overrideForm,
                scope_type: overrideForm.intern_id ? 'intern' : 'department',
                end_date: overrideForm.end_date || overrideForm.start_date,
              });
              toast.success('Override created');
              loadConfig();
            }}>Create override</Button>
          </Card>
        </div>
      )}

      <Modal
        isOpen={manual.open}
        onClose={() => setManual((m) => ({ ...m, open: false }))}
        title="Manual attendance correction"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setManual((m) => ({ ...m, open: false }))}>Cancel</Button>
            <Button onClick={async () => {
              await attendanceService.manualUpsert(manual);
              toast.success('Attendance updated');
              setManual((m) => ({ ...m, open: false }));
              loadDash();
            }}>Save</Button>
          </>
        )}
      >
        <select className="input-field" value={manual.status} onChange={(e) => setManual((m) => ({ ...m, status: e.target.value }))}>
          {['present', 'late', 'absent', 'excused', 'remote', 'public_holiday', 'non_workday'].map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
        <textarea
          className="input-field"
          rows={3}
          placeholder="Mandatory reason"
          value={manual.reason}
          onChange={(e) => setManual((m) => ({ ...m, reason: e.target.value }))}
          style={{ width: '100%', marginTop: '0.75rem' }}
        />
      </Modal>
    </motion.div>
  );
};

export default SupervisorAttendancePage;
