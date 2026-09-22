import { useState, useMemo } from 'react';
import {
  RiSearchLine,
  RiTimeLine,
  RiMapPinLine,
  RiShieldCheckLine,
  RiEditLine,
} from 'react-icons/ri';
import { Badge, Button, EmptyState, Skeleton } from '../../../components/ui';

const STATUS_VARIANTS = {
  present: 'success',
  late: 'warning',
  remote: 'primary',
  excused: 'neutral',
  absent: 'danger',
  pending: 'warning',
  not_required: 'neutral',
  public_holiday: 'neutral',
  non_workday: 'neutral',
};

const formatStatusLabel = (status) => {
  if (status === 'remote') return 'Online';
  if (status === 'not_required') return 'Not Expected';
  if (!status) return 'Pending';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const getInitials = (firstName = '', lastName = '') => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'IN';
};

const AVATAR_COLORS = [
  { bg: '#e0f2fe', color: '#0369a1' },
  { bg: '#fef3c7', color: '#b45309' },
  { bg: '#dcfce7', color: '#15803d' },
  { bg: '#f3e8ff', color: '#7e22ce' },
  { bg: '#fee2e2', color: '#b91c1c' },
];

const getAvatarStyle = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const SupervisorRosterTable = ({ expected = [], loading, onManualAdjust, dayType, required }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Collect unique departments
  const departments = useMemo(() => {
    const set = new Set();
    (expected || []).forEach((row) => {
      if (row.department_name) set.add(row.department_name);
    });
    return Array.from(set).sort();
  }, [expected]);

  const filteredRoster = useMemo(() => {
    return (expected || []).filter((row) => {
      // Department filter
      if (departmentFilter !== 'all' && row.department_name !== departmentFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const rowStatus = row.status || (required ? 'pending' : (dayType === 'online' ? 'not_required' : 'pending'));
        if (statusFilter === 'online' && rowStatus !== 'remote') return false;
        if (statusFilter !== 'online' && rowStatus !== statusFilter) return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const fullName = `${row.first_name || ''} ${row.last_name || ''}`.toLowerCase();
        const email = (row.email || '').toLowerCase();
        const dept = (row.department_name || '').toLowerCase();
        const office = (row.office_name || '').toLowerCase();
        if (!fullName.includes(query) && !email.includes(query) && !dept.includes(query) && !office.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [expected, departmentFilter, statusFilter, searchTerm, required, dayType]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Skeleton height="42px" borderRadius="8px" />
        <Skeleton height="240px" borderRadius="10px" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Filters Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        {/* Search & Department selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#ffffff',
            border: '1px solid var(--color-neutral-300)',
            borderRadius: '0.5rem',
            padding: '0.45rem 0.75rem',
            width: '280px',
            maxWidth: '100%',
          }}>
            <RiSearchLine style={{ color: 'var(--color-neutral-400)', fontSize: '1rem' }} />
            <input
              type="text"
              placeholder="Search intern name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.8125rem',
                color: 'var(--color-neutral-800)',
                width: '100%',
                fontFamily: 'inherit',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}
              >
                ✕
              </button>
            )}
          </div>

          {departments.length > 0 && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-neutral-300)',
                background: '#ffffff',
                fontSize: '0.8125rem',
                color: 'var(--color-neutral-700)',
                fontFamily: 'inherit',
              }}
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All (${expected.length})` },
            { id: 'present', label: 'Present' },
            { id: 'late', label: 'Late' },
            { id: 'pending', label: 'Pending' },
            { id: 'online', label: 'Online' },
            { id: 'absent', label: 'Absent' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setStatusFilter(pill.id)}
              style={{
                padding: '0.35rem 0.7rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: statusFilter === pill.id
                  ? '1px solid var(--color-primary-500)'
                  : '1px solid var(--color-neutral-200)',
                background: statusFilter === pill.id ? 'var(--color-primary-50)' : '#ffffff',
                color: statusFilter === pill.id ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                transition: 'all 0.15s ease',
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table */}
      {filteredRoster.length === 0 ? (
        <EmptyState
          title="No interns match the criteria"
          description={searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
            ? 'Try adjusting your filters or search keywords.'
            : 'No active intern records found for this date.'}
          action={searchTerm || statusFilter !== 'all' || departmentFilter !== 'all' ? (
            <Button size="sm" variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setDepartmentFilter('all'); }}>
              Reset Filters
            </Button>
          ) : null}
        />
      ) : (
        <div style={{
          overflowX: 'auto',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: '0.75rem',
          background: '#ffffff',
        }}>
          <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{
                textAlign: 'left',
                borderBottom: '1px solid var(--color-neutral-200)',
                background: 'var(--color-neutral-50)',
                color: 'var(--color-neutral-600)',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                <th style={{ padding: '0.875rem 1rem' }}>Intern</th>
                <th style={{ padding: '0.875rem 1rem' }}>Department</th>
                <th style={{ padding: '0.875rem 1rem' }}>Status</th>
                <th style={{ padding: '0.875rem 1rem' }}>Check In</th>
                <th style={{ padding: '0.875rem 1rem' }}>Office Location</th>
                <th style={{ padding: '0.875rem 1rem' }}>Verification</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoster.map((row, index) => {
                const avatarStyle = getAvatarStyle(`${row.first_name} ${row.last_name}`);
                const status = row.status || (required ? 'pending' : (dayType === 'online' ? 'not_required' : 'pending'));
                const isEven = index % 2 === 1;

                return (
                  <tr
                    key={row.internship_record_id || row.intern_id || index}
                    style={{
                      borderBottom: '1px solid var(--color-neutral-100)',
                      backgroundColor: isEven ? 'rgba(248, 250, 252, 0.5)' : '#ffffff',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Intern Column */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: avatarStyle.bg,
                          color: avatarStyle.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          {getInitials(row.first_name, row.last_name)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ color: 'var(--color-neutral-900)', display: 'block', fontSize: '0.875rem' }}>
                            {row.first_name} {row.last_name}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                            {row.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      {row.department_name ? (
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--color-neutral-700)',
                          background: 'var(--color-neutral-100)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                        }}>
                          {row.department_name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-neutral-400)' }}>General</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      <Badge variant={STATUS_VARIANTS[status] || 'neutral'}>
                        {formatStatusLabel(status)}
                      </Badge>
                    </td>

                    {/* Check In Time */}
                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      {row.check_in ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-neutral-800)', fontWeight: 600 }}>
                          <RiTimeLine style={{ color: 'var(--color-neutral-400)' }} />
                          {new Date(row.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-neutral-400)' }}>—</span>
                      )}
                    </td>

                    {/* Office */}
                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      {row.office_name ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-neutral-800)' }}>
                          <RiMapPinLine style={{ color: 'var(--color-primary-500)' }} />
                          {row.office_name}
                        </span>
                      ) : status === 'remote' ? (
                        <span style={{ color: 'var(--color-primary-600)', fontSize: '0.8rem' }}>Online Task</span>
                      ) : (
                        <span style={{ color: 'var(--color-neutral-400)' }}>—</span>
                      )}
                    </td>

                    {/* Verification */}
                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        color: row.verification_status === 'rejected' ? 'var(--color-danger-600)' : 'var(--color-neutral-600)',
                      }}>
                        <RiShieldCheckLine style={{ color: row.verification_status === 'rejected' ? 'var(--color-danger-500)' : 'var(--color-success-500)' }} />
                        {row.verification_status ? formatStatusLabel(row.verification_status) : (required ? 'Pending' : 'Not Required')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => onManualAdjust?.(row)}
                        title="Manually adjust or override attendance"
                      >
                        <RiEditLine style={{ marginRight: '0.2rem' }} /> Adjust
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SupervisorRosterTable;
