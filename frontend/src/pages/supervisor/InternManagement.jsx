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
        className="accent-banner"
        style={{
          background: '#00b4d8',
          borderRadius: '1.25rem',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          boxShadow: '0 8px 32px rgba(0, 180, 216, 0.22)',
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

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: 'rgba(255,255,255,0.15)',
              padding: '0.25rem 0.75rem',
              borderRadius: '99px',
              color: '#ffffff',
              marginBottom: '0.625rem',
              display: 'inline-block',
            }}
          >
            Intern Management
          </span>
          <h2 style={{ margin: '0.5rem 0 0.375rem 0', fontSize: '1.625rem', fontWeight: 800, lineHeight: 1.2, color: '#ffffff' }}>
            Your Intern Cohort, {supervisorName}
          </h2>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#ffffff', maxWidth: '520px', lineHeight: 1.55 }}>
            Track progress, manage profiles, assign tasks, and monitor performance across your team.
          </p>
        </div>
      </motion.div>

      {/* ── KPI Summary ────────────────────────────────────────────────── */}
      <InternKPISummary kpis={kpis} isLoading={loading.list && kpis.length === 0} />

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
