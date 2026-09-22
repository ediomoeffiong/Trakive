import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  RiMapPinLine,
  RiSettings4Line,
  RiCalendarEventLine,
  RiCheckLine,
} from 'react-icons/ri';
import { Card, Button, Badge, Skeleton } from '../../../components/ui';
import { attendanceService } from '../../../services/attendanceService';

const todayIso = () => new Date().toISOString().slice(0, 10);

const WEEKDAYS = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
  { id: 0, label: 'Sun' },
];

const emptyOffice = () => ({
  id: null,
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  radius_meters: 200,
  is_active: true,
});

const SupervisorAttendanceSettings = ({ config, loading, onReload }) => {
  const [activeSubTab, setActiveSubTab] = useState('policy'); // 'policy' | 'geofence' | 'overrides'

  // Office state
  const [officeForm, setOfficeForm] = useState(() => emptyOffice());
  const [savingOffice, setSavingOffice] = useState(false);

  // Policy state
  const [policyForm, setPolicyForm] = useState({
    required_weekdays: [2, 3, 4],
    arrival_time: '08:00',
    grace_minutes: 60,
    timezone: 'Africa/Lagos',
    attendance_score_enabled: true,
    attendance_score_weight: 30,
  });
  const [savingPolicy, setSavingPolicy] = useState(false);

  // Override state
  const [overrideForm, setOverrideForm] = useState({
    start_date: todayIso(),
    end_date: todayIso(),
    status: 'remote',
    reason: '',
  });
  const [savingOverride, setSavingOverride] = useState(false);

  // Holiday state
  const [holidayForm, setHolidayForm] = useState({ date: todayIso(), name: '' });
  const [savingHoliday, setSavingHoliday] = useState(false);

  // Sync policy from config
  useEffect(() => {
    const policies = config?.policies || [];
    if (policies.length > 0) {
      const p = policies[0];
      setPolicyForm({
        required_weekdays: Array.isArray(p.required_weekdays) ? p.required_weekdays : [2, 3, 4],
        arrival_time: p.arrival_time ? String(p.arrival_time).slice(0, 5) : '08:00',
        grace_minutes: p.grace_minutes ?? 60,
        timezone: p.timezone || 'Africa/Lagos',
        attendance_score_enabled: p.attendance_score_enabled ?? true,
        attendance_score_weight: p.attendance_score_weight ?? 30,
      });
    }
  }, [config?.policies]);

  // Office handlers
  const handleSaveOffice = async (e) => {
    e?.preventDefault();
    const lat = Number(officeForm.latitude);
    const lon = Number(officeForm.longitude);
    const radius = Number(officeForm.radius_meters);

    if (!officeForm.name.trim() || !Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(radius)) {
      toast.error('Please enter valid office name, coordinates, and radius.');
      return;
    }

    setSavingOffice(true);
    try {
      const payload = {
        name: officeForm.name.trim(),
        address: officeForm.address?.trim() || null,
        latitude: lat,
        longitude: lon,
        radius_meters: radius,
        is_active: officeForm.is_active,
      };
      if (officeForm.id) payload.id = officeForm.id;

      await attendanceService.saveOffice(payload);
      toast.success(officeForm.id ? 'Office geofence updated.' : 'Office geofence created.');
      setOfficeForm(emptyOffice());
      onReload?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save office.');
    } finally {
      setSavingOffice(false);
    }
  };

  // Toggle day in policy
  const handleToggleWeekday = (dayId) => {
    setPolicyForm((prev) => {
      const current = prev.required_weekdays || [];
      const next = current.includes(dayId)
        ? current.filter((id) => id !== dayId)
        : [...current, dayId];
      return { ...prev, required_weekdays: next.sort() };
    });
  };

  const handleSavePolicy = async (e) => {
    e?.preventDefault();
    setSavingPolicy(true);
    try {
      await attendanceService.savePolicy({
        required_weekdays: policyForm.required_weekdays,
        arrival_time: policyForm.arrival_time || '08:00',
        grace_minutes: Number(policyForm.grace_minutes) || 60,
        timezone: policyForm.timezone || 'Africa/Lagos',
        attendance_score_enabled: policyForm.attendance_score_enabled,
        attendance_score_weight: Number(policyForm.attendance_score_weight) || 30,
      });
      toast.success('Attendance policy settings saved.');
      onReload?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save policy.');
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleSaveOverride = async (e) => {
    e?.preventDefault();
    if (!overrideForm.reason.trim() || overrideForm.reason.trim().length < 3) {
      toast.error('Add a clear reason for the schedule override (min 3 chars).');
      return;
    }
    setSavingOverride(true);
    try {
      await attendanceService.createOverride(overrideForm);
      toast.success('Schedule override recorded.');
      setOverrideForm({ start_date: todayIso(), end_date: todayIso(), status: 'remote', reason: '' });
      onReload?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to create override.');
    } finally {
      setSavingOverride(false);
    }
  };

  const handleSaveHoliday = async (e) => {
    e?.preventDefault();
    if (!holidayForm.name.trim() || holidayForm.name.trim().length < 2) {
      toast.error('Add a holiday name (min 2 chars).');
      return;
    }
    setSavingHoliday(true);
    try {
      await attendanceService.addHoliday(holidayForm);
      toast.success('Holiday closure added.');
      setHolidayForm({ date: todayIso(), name: '' });
      onReload?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to add holiday.');
    } finally {
      setSavingHoliday(false);
    }
  };

  if (loading) {
    return <Skeleton height="360px" borderRadius="14px" />;
  }

  const offices = config?.offices || [];
  const holidays = config?.holidays || [];
  const overrides = config?.overrides || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Sub-tab Navigation */}
      <div style={{
        display: 'inline-flex',
        background: 'var(--color-neutral-100)',
        padding: '0.25rem',
        borderRadius: '0.625rem',
        border: '1px solid var(--color-neutral-200)',
        alignSelf: 'flex-start',
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('policy')}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '0.5rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            background: activeSubTab === 'policy' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'policy' ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
            boxShadow: activeSubTab === 'policy' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <RiSettings4Line style={{ marginRight: '0.3rem', verticalAlign: '-1px' }} />
          Workday Policy
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('geofence')}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '0.5rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            background: activeSubTab === 'geofence' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'geofence' ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
            boxShadow: activeSubTab === 'geofence' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <RiMapPinLine style={{ marginRight: '0.3rem', verticalAlign: '-1px' }} />
          Office Geofences ({offices.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('overrides')}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '0.5rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            background: activeSubTab === 'overrides' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'overrides' ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
            boxShadow: activeSubTab === 'overrides' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <RiCalendarEventLine style={{ marginRight: '0.3rem', verticalAlign: '-1px' }} />
          Overrides & Holidays
        </button>
      </div>

      {/* ── Sub-Tab 1: Workday Policy ───────────────────────────────────── */}
      {activeSubTab === 'policy' && (
        <Card
          header={
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                Department Attendance Policy
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
                Configure which weekdays require physical office presence, arrival schedules, and scoring weight.
              </p>
            </div>
          }
        >
          <form onSubmit={handleSavePolicy} style={{ display: 'grid', gap: '1.25rem', maxWidth: '640px' }}>
            {/* Weekdays Toggle */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.5rem' }}>
                Required In-Office Days of the Week
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {WEEKDAYS.map((day) => {
                  const isSelected = (policyForm.required_weekdays || []).includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleToggleWeekday(day.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: isSelected ? '1.5px solid var(--color-primary-500)' : '1px solid var(--color-neutral-300)',
                        background: isSelected ? 'var(--color-primary-50)' : '#ffffff',
                        color: isSelected ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isSelected && <RiCheckLine />}
                      {day.label}
                    </button>
                  );
                })}
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                Selected days mandate GPS office check-in. Unselected weekdays default to Online Work Days (credited via completed tasks).
              </p>
            </div>

            {/* Arrival Time & Grace Minutes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                  Target Arrival Time
                </label>
                <input
                  type="time"
                  value={policyForm.arrival_time}
                  onChange={(e) => setPolicyForm({ ...policyForm, arrival_time: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--color-neutral-300)',
                    background: '#ffffff',
                    fontSize: '0.875rem',
                    color: 'var(--color-neutral-900)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                  Grace Period (Minutes)
                </label>
                <input
                  type="number"
                  min={0}
                  max={240}
                  value={policyForm.grace_minutes}
                  onChange={(e) => setPolicyForm({ ...policyForm, grace_minutes: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--color-neutral-300)',
                    background: '#ffffff',
                    fontSize: '0.875rem',
                    color: 'var(--color-neutral-900)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {/* Timezone & Score Weight */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                  Timezone
                </label>
                <input
                  type="text"
                  value={policyForm.timezone}
                  onChange={(e) => setPolicyForm({ ...policyForm, timezone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--color-neutral-300)',
                    background: '#ffffff',
                    fontSize: '0.875rem',
                    color: 'var(--color-neutral-900)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                  Score Weight: {policyForm.attendance_score_weight}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={policyForm.attendance_score_weight}
                  onChange={(e) => setPolicyForm({ ...policyForm, attendance_score_weight: Number(e.target.value) })}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <input
                type="checkbox"
                id="score_enabled"
                checked={policyForm.attendance_score_enabled}
                onChange={(e) => setPolicyForm({ ...policyForm, attendance_score_enabled: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="score_enabled" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-neutral-800)', cursor: 'pointer' }}>
                Factor attendance compliance into intern performance evaluations
              </label>
            </div>

            <div>
              <Button type="submit" disabled={savingPolicy}>
                {savingPolicy ? 'Saving Policy...' : 'Save Policy Settings'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── Sub-Tab 2: Office Geofences ─────────────────────────────────── */}
      {activeSubTab === 'geofence' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Office Form */}
          <Card
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  {officeForm.id ? 'Edit Office Geofence' : 'Add New Office Geofence'}
                </h3>
                {officeForm.id && (
                  <Button size="xs" variant="outline" onClick={() => setOfficeForm(emptyOffice())}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            }
          >
            <form onSubmit={handleSaveOffice} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                  Office Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lagos Tech HQ, Main Campus..."
                  value={officeForm.name}
                  onChange={(e) => setOfficeForm({ ...officeForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--color-neutral-300)',
                    background: '#ffffff',
                    fontSize: '0.875rem',
                    color: 'var(--color-neutral-900)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15 Innovation Way, Victoria Island..."
                  value={officeForm.address}
                  onChange={(e) => setOfficeForm({ ...officeForm, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--color-neutral-300)',
                    background: '#ffffff',
                    fontSize: '0.875rem',
                    color: 'var(--color-neutral-900)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 6.4281"
                    value={officeForm.latitude}
                    onChange={(e) => setOfficeForm({ ...officeForm, latitude: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--color-neutral-300)',
                      background: '#ffffff',
                      fontSize: '0.875rem',
                      color: 'var(--color-neutral-900)',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 3.4219"
                    value={officeForm.longitude}
                    onChange={(e) => setOfficeForm({ ...officeForm, longitude: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--color-neutral-300)',
                      background: '#ffffff',
                      fontSize: '0.875rem',
                      color: 'var(--color-neutral-900)',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                  Allowed Radius: {officeForm.radius_meters} meters
                </label>
                <input
                  type="range"
                  min={20}
                  max={2000}
                  step={10}
                  value={officeForm.radius_meters}
                  onChange={(e) => setOfficeForm({ ...officeForm, radius_meters: Number(e.target.value) })}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="is_active_office"
                  checked={officeForm.is_active}
                  onChange={(e) => setOfficeForm({ ...officeForm, is_active: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="is_active_office" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-neutral-800)', cursor: 'pointer' }}>
                  Enable Geofence Verification for this Office
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button type="submit" disabled={savingOffice}>
                  {savingOffice ? 'Saving...' : officeForm.id ? 'Update Office' : 'Save Geofence'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Configured Offices List */}
          <Card
            header={
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  Configured Office Locations
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
                  Click on an office to edit its geofence radius and coordinates.
                </p>
              </div>
            }
          >
            {offices.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-neutral-500)' }}>
                No offices configured yet.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {offices.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setOfficeForm({
                      id: item.id,
                      name: item.name || '',
                      address: item.address || '',
                      latitude: item.latitude ?? '',
                      longitude: item.longitude ?? '',
                      radius_meters: item.radius_meters ?? 200,
                      is_active: item.is_active ?? true,
                    })}
                    style={{
                      border: `1px solid ${officeForm.id === item.id ? 'var(--color-primary-400)' : 'var(--color-neutral-200)'}`,
                      borderRadius: '0.625rem',
                      padding: '0.875rem 1rem',
                      background: officeForm.id === item.id ? 'var(--color-primary-50)' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RiMapPinLine style={{ color: 'var(--color-primary-600)' }} />
                        <strong style={{ fontSize: '0.9rem', color: 'var(--color-neutral-900)' }}>
                          {item.name}
                        </strong>
                      </div>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--color-neutral-500)' }}>
                        {item.address || `${item.latitude}, ${item.longitude}`}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-600)', marginTop: '0.2rem', display: 'inline-block' }}>
                        Radius: <strong>{item.radius_meters}m</strong>
                      </span>
                    </div>

                    <Badge variant={item.is_active ? 'success' : 'neutral'}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── Sub-Tab 3: Overrides & Holidays ─────────────────────────────── */}
      {activeSubTab === 'overrides' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Schedule Override */}
          <Card
            header={
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  Create Schedule Override
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
                  Temporarily mark a range of dates as Remote, Excused, or Non-workday.
                </p>
              </div>
            }
          >
            <form onSubmit={handleSaveOverride} style={{ display: 'grid', gap: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={overrideForm.start_date}
                    onChange={(e) => setOverrideForm({ ...overrideForm, start_date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--color-neutral-300)',
                      background: '#ffffff',
                      fontSize: '0.875rem',
                      color: 'var(--color-neutral-900)',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={overrideForm.end_date}
                    onChange={(e) => setOverrideForm({ ...overrideForm, end_date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--color-neutral-300)',
                      background: '#ffffff',
                      fontSize: '0.875rem',
                      color: 'var(--color-neutral-900)',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                  Override Status
                </label>
                <select
                  value={overrideForm.status}
                  onChange={(e) => setOverrideForm({ ...overrideForm, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--color-neutral-300)',
                    background: '#ffffff',
                    fontSize: '0.875rem',
                    color: 'var(--color-neutral-900)',
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="remote">Remote / Online</option>
                  <option value="excused">Excused Absence</option>
                  <option value="public_holiday">Public Holiday</option>
                  <option value="non_workday">Non-Workday</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                  Reason (min 3 chars)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Company Retreat, Office Fumigation, Remote Friday..."
                  value={overrideForm.reason}
                  onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--color-neutral-300)',
                    background: '#ffffff',
                    fontSize: '0.875rem',
                    color: 'var(--color-neutral-900)',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <Button type="submit" disabled={savingOverride}>
                  {savingOverride ? 'Recording...' : 'Create Override'}
                </Button>
              </div>
            </form>

            {overrides.length > 0 && (
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--color-neutral-200)', paddingTop: '0.875rem' }}>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>
                  Active Overrides ({overrides.length})
                </p>
                <div style={{ display: 'grid', gap: '0.4rem', maxHeight: '140px', overflowY: 'auto' }}>
                  {overrides.slice(0, 10).map((o) => (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', padding: '0.35rem 0.5rem', background: 'var(--color-neutral-50)', borderRadius: '6px' }}>
                      <strong style={{ color: 'var(--color-neutral-800)', textTransform: 'capitalize' }}>{o.status || 'Override'}: {o.reason}</strong>
                      <span style={{ color: 'var(--color-neutral-500)' }}>{new Date(o.start_date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Company Holidays */}
          <Card
            header={
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  Add Organization Holiday
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
                  Add recognized public holidays and corporate closures.
                </p>
              </div>
            }
          >
            <form onSubmit={handleSaveHoliday} style={{ display: 'grid', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                  Holiday Date
                </label>
                <input
                  type="date"
                  required
                  value={holidayForm.date}
                  onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--color-neutral-300)',
                    background: '#ffffff',
                    fontSize: '0.875rem',
                    color: 'var(--color-neutral-900)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                  Holiday Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day, Eid-el-Fitr, Good Friday..."
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--color-neutral-300)',
                    background: '#ffffff',
                    fontSize: '0.875rem',
                    color: 'var(--color-neutral-900)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <Button type="submit" disabled={savingHoliday}>
                  {savingHoliday ? 'Saving...' : 'Add Holiday Closure'}
                </Button>
              </div>
            </form>

            {holidays.length > 0 && (
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--color-neutral-200)', paddingTop: '0.875rem' }}>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>
                  Upcoming Holidays ({holidays.length})
                </p>
                <div style={{ display: 'grid', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto' }}>
                  {holidays.slice(0, 10).map((h) => (
                    <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', padding: '0.35rem 0.5rem', background: 'var(--color-neutral-50)', borderRadius: '6px' }}>
                      <strong style={{ color: 'var(--color-neutral-800)' }}>{h.name}</strong>
                      <span style={{ color: 'var(--color-neutral-500)' }}>{new Date(h.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default SupervisorAttendanceSettings;
