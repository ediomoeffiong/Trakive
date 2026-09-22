import { useState, useMemo } from 'react';
import {
  RiSearchLine,
  RiTimeLine,
  RiMapPinLine,
  RiShieldCheckLine,
} from 'react-icons/ri';
import { Badge, EmptyState, Button } from '../ui';

const STATUS_VARIANTS = {
  present: 'success',
  late: 'warning',
  remote: 'primary',
  excused: 'neutral',
  absent: 'danger',
  public_holiday: 'neutral',
  non_workday: 'neutral',
};

const formatStatusLabel = (status) => {
  if (status === 'remote') return 'Online';
  if (status === 'non_workday') return 'Off Day';
  if (!status) return 'Pending';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const InternAttendanceTable = ({ records = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRecords = useMemo(() => {
    return (records || []).filter((r) => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'online' && r.status !== 'remote') return false;
        if (statusFilter !== 'online' && r.status !== statusFilter) return false;
      }
      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const office = (r.office_name || '').toLowerCase();
        const notes = (r.notes || '').toLowerCase();
        const dateStr = String(r.date || '');
        if (!office.includes(query) && !notes.includes(query) && !dateStr.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [records, statusFilter, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Search & Filter Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#fff',
          border: '1px solid var(--color-neutral-300)',
          borderRadius: '0.5rem',
          padding: '0.45rem 0.75rem',
          width: '280px',
          maxWidth: '100%',
        }}>
          <RiSearchLine style={{ color: 'var(--color-neutral-400)', fontSize: '1rem' }} />
          <input
            type="text"
            placeholder="Search office or notes..."
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

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Records' },
            { id: 'present', label: 'Present' },
            { id: 'late', label: 'Late' },
            { id: 'online', label: 'Online' },
            { id: 'excused', label: 'Excused' },
            { id: 'absent', label: 'Absent' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: statusFilter === tab.id
                  ? '1px solid var(--color-primary-500)'
                  : '1px solid var(--color-neutral-200)',
                background: statusFilter === tab.id ? 'var(--color-primary-50)' : '#ffffff',
                color: statusFilter === tab.id ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          title="No attendance records found"
          description={searchTerm || statusFilter !== 'all' ? 'Try adjusting your search query or filter.' : 'Your check-ins and attendance updates will appear here.'}
          action={searchTerm || statusFilter !== 'all' ? (
            <Button size="sm" variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
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
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
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
                <th style={{ padding: '0.875rem 1rem' }}>Date</th>
                <th style={{ padding: '0.875rem 1rem' }}>Status</th>
                <th style={{ padding: '0.875rem 1rem' }}>Check In</th>
                <th style={{ padding: '0.875rem 1rem' }}>Office Location</th>
                <th style={{ padding: '0.875rem 1rem' }}>Verification</th>
                <th style={{ padding: '0.875rem 1rem' }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => {
                const dateObj = new Date(record.date);
                const isEven = index % 2 === 1;
                return (
                  <tr
                    key={record.id || `${record.date}-${index}`}
                    style={{
                      borderBottom: '1px solid var(--color-neutral-100)',
                      backgroundColor: isEven ? 'rgba(248, 250, 252, 0.5)' : '#ffffff',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      <strong style={{ color: 'var(--color-neutral-900)' }}>
                        {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </strong>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-neutral-400)' }}>
                        {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </td>

                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      <Badge variant={STATUS_VARIANTS[record.status] || 'neutral'}>
                        {formatStatusLabel(record.status)}
                      </Badge>
                    </td>

                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      {record.check_in ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-neutral-800)', fontWeight: 600 }}>
                          <RiTimeLine style={{ color: 'var(--color-neutral-400)' }} />
                          {new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-neutral-400)' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      {record.office_name ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-neutral-800)' }}>
                          <RiMapPinLine style={{ color: 'var(--color-primary-500)' }} />
                          {record.office_name}
                        </span>
                      ) : record.status === 'remote' ? (
                        <span style={{ color: 'var(--color-primary-600)', fontSize: '0.8rem', fontWeight: 500 }}>
                          Remote / Online
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-neutral-400)' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-neutral-600)',
                      }}>
                        <RiShieldCheckLine style={{ color: 'var(--color-success-500)' }} />
                        {record.verification_status ? formatStatusLabel(record.verification_status) : 'Verified'}
                      </span>
                    </td>

                    <td style={{ padding: '0.875rem 1rem', maxWidth: '240px' }}>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-neutral-600)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={record.notes || ''}>
                        {record.notes || '—'}
                      </p>
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

export default InternAttendanceTable;
