/**
 * @file OnboardingFilterBar.jsx
 * @description Advanced filter, search, view-switcher, and sorting bar for the Onboarding portal.
 */

import {
  RiSearchLine,
  RiCloseCircleFill,
  RiFilter3Line,
  RiLayoutGridLine,
  RiListCheck2,
  RiCheckDoubleLine,
} from 'react-icons/ri';

const FILTER_PILLS = [
  { id: 'all', label: 'All Interns' },
  { id: 'pending', label: 'Pending Review' },
  { id: 'resubmission_required', label: 'Needs Revision' },
  { id: 'approved', label: 'Fully Cleared' },
  { id: 'incomplete', label: 'Incomplete' },
];

export default function OnboardingFilterBar({
  search = '',
  onSearchChange,
  statusFilter = 'all',
  onStatusFilterChange,
  departmentFilter = 'all',
  onDepartmentFilterChange,
  departments = [],
  sortBy = 'recent',
  onSortByChange,
  viewMode = 'grid',
  onViewModeChange,
  pendingCount = 0,
  onOpenBatchApprove,
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '1rem 1.25rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
      }}
    >
      {/* Top row: Search input + Department select + Sort select + View mode */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            position: 'relative',
            flex: '1 1 260px',
            minWidth: '220px',
          }}
        >
          <RiSearchLine
            style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: '1rem',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by intern name, institution, or email…"
            style={{
              width: '100%',
              padding: '0.625rem 2.25rem 0.625rem 2.375rem',
              borderRadius: '0.75rem',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
              color: '#0f172a',
              transition: 'border-color 0.2s, background-color 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#00b4d8';
              e.target.style.backgroundColor = '#ffffff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.backgroundColor = '#f8fafc';
            }}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
            >
              <RiCloseCircleFill />
            </button>
          )}
        </div>

        {/* Dropdowns & View Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          {/* Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <RiFilter3Line style={{ color: '#64748b', fontSize: '0.9rem' }} />
            <select
              value={departmentFilter}
              onChange={(e) => onDepartmentFilterChange(e.target.value)}
              style={{
                padding: '0.5625rem 0.875rem',
                borderRadius: '0.75rem',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.8125rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            style={{
              padding: '0.5625rem 0.875rem',
              borderRadius: '0.75rem',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '0.8125rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="recent">Sort: Newest Uploads</option>
            <option value="needs_attention">Sort: Needs Attention First</option>
            <option value="progress_asc">Sort: Lowest Progress First</option>
            <option value="progress_desc">Sort: Highest Progress First</option>
            <option value="name_asc">Sort: Name (A → Z)</option>
          </select>

          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: '0.625rem',
              padding: '0.2rem',
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              onClick={() => onViewModeChange('grid')}
              title="Card Grid View"
              style={{
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.35rem 0.55rem',
                color: viewMode === 'grid' ? '#0077b6' : '#64748b',
                boxShadow: viewMode === 'grid' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                fontSize: '1rem',
              }}
            >
              <RiLayoutGridLine />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              title="Detailed Table View"
              style={{
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.35rem 0.55rem',
                color: viewMode === 'table' ? '#0077b6' : '#64748b',
                boxShadow: viewMode === 'table' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                fontSize: '1rem',
              }}
            >
              <RiListCheck2 />
            </button>
          </div>

          {/* Quick Batch Approve Button */}
          {pendingCount > 0 && onOpenBatchApprove && (
            <button
              onClick={onOpenBatchApprove}
              title="Fast-Track Batch Review"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.5625rem 0.875rem',
                borderRadius: '0.75rem',
                border: '1px solid #10b981',
                background: '#ecfdf5',
                color: '#065f46',
                fontSize: '0.8125rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <RiCheckDoubleLine style={{ fontSize: '1rem' }} /> Batch Actions
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Filter Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '0.75rem',
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginRight: '0.25rem' }}>
          Status:
        </span>
        {FILTER_PILLS.map((pill) => {
          const isActive = statusFilter === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => onStatusFilterChange(pill.id)}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '99px',
                border: isActive ? '1px solid #00b4d8' : '1px solid #e2e8f0',
                background: isActive ? '#e0f2fe' : '#ffffff',
                color: isActive ? '#0369a1' : '#475569',
                fontSize: '0.78rem',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {pill.label}
            </button>
          );
        })}

        {(statusFilter !== 'all' || departmentFilter !== 'all' || search) && (
          <button
            onClick={() => {
              onStatusFilterChange('all');
              onDepartmentFilterChange('all');
              onSearchChange('');
            }}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#ef4444',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '0.2rem 0.5rem',
            }}
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
