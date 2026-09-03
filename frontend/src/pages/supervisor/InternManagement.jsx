/**
 * @file InternManagement.jsx
 * @description Supervisor Intern Management Dashboard page.
 * Displays KPI summary cards, advanced intern directory with filters, search,
 * sorting, bulk selection, and bulk action toolbar.
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInternManagementStore } from '../../store/useInternManagementStore';
import { useCurrentUser } from '../../store';
import {
  InternKPISummary,
  InternDirectory,
} from '../../components/supervisor/intern-management';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const InternManagementPage = () => {
  const user = useCurrentUser();

  const {
    internList,
    kpis,
    filters,
    search,
    activeFilterChips,
    selectedInterns,
    loading,
    loadInternList,
    setSearch,
    setFilter,
    clearFilter,
    clearAllFilters,
    toggleSelectIntern,
    selectAllInterns,
    clearSelection,
  } = useInternManagementStore();

  useEffect(() => {
    loadInternList();
  }, [loadInternList]);

  const supervisorName = user?.name?.split(' ')[0] ?? 'Supervisor';

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '5rem', minWidth: 0, width: '100%', maxWidth: '100%' }}
    >
      {/* ── Welcome Banner ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          background: '#00b4d8',
          borderRadius: '1.25rem',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          boxShadow: '0 8px 32px rgba(0, 180, 216, 0.22)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            top: '-40px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '60px',
            bottom: '-60px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: 'rgba(255,255,255,0.15)',
              padding: '0.25rem 0.75rem',
              borderRadius: '99px',
              marginBottom: '0.625rem',
              display: 'inline-block',
            }}
          >
            Intern Management
          </span>
          <h2 style={{ margin: '0.5rem 0 0.375rem 0', fontSize: '1.625rem', fontWeight: 800, lineHeight: 1.2 }}>
            Your Intern Cohort, {supervisorName}
          </h2>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#c7d2fe', maxWidth: '500px' }}>
            Track progress, manage profiles, assign tasks, and monitor performance across{' '}
            <strong style={{ color: '#fff' }}>{internList.length} interns</strong> in your team.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            position: 'relative',
            zIndex: 1,
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Active', value: internList.filter((i) => i.status === 'Active').length, color: '#6ee7b7' },
            { label: 'Need Help', value: internList.filter((i) => i.status === 'Needs Help').length, color: '#fca5a5' },
            { label: 'On Leave', value: internList.filter((i) => i.status === 'On Leave').length, color: '#fcd34d' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '0.75rem',
                padding: '0.625rem 1rem',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.12)',
                minWidth: '70px',
              }}
            >
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color }}>{value}</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#c7d2fe', fontWeight: 600 }}>{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── KPI Summary ────────────────────────────────────────────────── */}
      <section aria-label="Intern Management KPIs">
        <InternKPISummary kpis={kpis} isLoading={loading.list && kpis.length === 0} />
      </section>

      {/* ── Intern Directory ───────────────────────────────────────────── */}
      <section aria-label="Intern Directory">
        <InternDirectory
          interns={internList}
          isLoading={loading.list}
          filters={filters}
          search={search}
          activeFilterChips={activeFilterChips}
          selectedInterns={selectedInterns}
          onSearchChange={setSearch}
          onFilterChange={setFilter}
          onClearFilter={clearFilter}
          onClearAllFilters={clearAllFilters}
          onToggleSelect={toggleSelectIntern}
          onSelectAll={selectAllInterns}
          onClearSelection={clearSelection}
        />
      </section>
    </motion.div>
  );
};

export default InternManagementPage;
