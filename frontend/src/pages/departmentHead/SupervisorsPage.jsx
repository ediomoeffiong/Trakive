/**
 * @file SupervisorsPage.jsx
 * @description Department Head — Supervisor Overview page.
 * Read-focused oversight of all department supervisors with search, filters,
 * sortable table, and a slide-out detail drawer.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiShieldUserLine, RiSearchLine, RiGroupLine, RiTaskLine,
  RiStarLine, RiCloseLine, RiMailLine, RiPhoneLine,
  RiCalendarLine, RiBarChartLine,
} from 'react-icons/ri';
import { useDepartmentStore } from '../../store/useDepartmentStore';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

// ── Supervisor Detail Drawer ────────────────────────────────────────────────────
const SupervisorDrawer = ({ supervisor, onClose }) => {
  if (!supervisor) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500, backdropFilter: 'blur(2px)' }}
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: 440,
          background: '#fff', zIndex: 501,
          boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>Supervisor Profile</h3>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '0.375rem', border: 'none', background: 'var(--color-neutral-100)', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-neutral-500)' }}>
            <RiCloseLine />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {/* Profile Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-neutral-100)' }}>
            <Avatar name={supervisor.name} src={supervisor.avatar} size="xl" online={supervisor.status === 'active'} />
            <h4 style={{ margin: '1rem 0 0.25rem', fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{supervisor.name}</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>{supervisor.title}</p>
            <Badge variant={supervisor.status === 'active' ? 'success' : 'neutral'} dot style={{ marginTop: '0.5rem' }}>
              {supervisor.status === 'active' ? 'Active' : supervisor.status}
            </Badge>
          </div>

          {/* Contact */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-neutral-400)' }}>Contact</p>
            {[
              { icon: RiMailLine, value: supervisor.email },
              { icon: RiPhoneLine, value: supervisor.phone },
              { icon: RiCalendarLine, value: `Joined ${supervisor.joinedDate}` },
            ].map(({ icon: Icon, value }) => (
              <div key={value} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0', fontSize: '0.875rem', color: 'var(--color-neutral-700)', borderBottom: '1px solid var(--color-neutral-50)' }}>
                <Icon style={{ color: 'var(--color-neutral-400)', flexShrink: 0 }} />
                {value}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-neutral-400)' }}>Performance Metrics</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'Track', value: supervisor.track },
                { label: 'Batches Done', value: supervisor.completedBatches },
                { label: 'Active Tasks', value: supervisor.activeTasksCount },
                { label: 'Pending Reviews', value: supervisor.pendingReviewsCount },
                { label: 'Performance', value: `${supervisor.performanceRating}/5.0` },
                { label: 'Workload', value: `${supervisor.workloadPercentage}%` },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--color-neutral-50)', borderRadius: '0.75rem', padding: '0.75rem' }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-neutral-400)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Interns */}
          {supervisor.assignedInternsList?.length > 0 && (
            <div>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-neutral-400)' }}>
                Assigned Interns ({supervisor.assignedInternsList.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {supervisor.assignedInternsList.map((intern) => (
                  <div key={intern.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.75rem', background: 'var(--color-neutral-50)', borderRadius: '0.625rem' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-900)' }}>{intern.name}</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-neutral-500)' }}>{intern.track}</p>
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: intern.score >= 90 ? '#059669' : intern.score >= 75 ? '#d97706' : '#dc2626' }}>
                      {intern.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

// ── Supervisor Row ─────────────────────────────────────────────────────────────
const SupervisorRow = ({ supervisor, onView }) => (
  <motion.tr
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    whileHover={{ backgroundColor: '#f8fafc' }}
    style={{ borderBottom: '1px solid var(--color-neutral-100)', cursor: 'pointer' }}
    onClick={() => onView(supervisor)}
  >
    <td style={{ padding: '0.875rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Avatar name={supervisor.name} src={supervisor.avatar} size="sm" online={supervisor.status === 'active'} />
        <div>
          <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-900)' }}>{supervisor.name}</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{supervisor.title}</p>
        </div>
      </div>
    </td>
    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--color-neutral-700)' }}>{supervisor.track}</td>
    <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
      <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{supervisor.assignedInternsCount}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>/{supervisor.maxCapacity}</span>
    </td>
    <td style={{ padding: '0.875rem 1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>{supervisor.activeTasksCount}</td>
    <td style={{ padding: '0.875rem 1rem', textAlign: 'center', fontSize: '0.875rem', color: supervisor.pendingReviewsCount > 3 ? '#dc2626' : 'var(--color-neutral-700)', fontWeight: supervisor.pendingReviewsCount > 3 ? 700 : 500 }}>{supervisor.pendingReviewsCount}</td>
    <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: supervisor.performanceRating >= 4.5 ? '#059669' : supervisor.performanceRating >= 4.0 ? '#d97706' : '#dc2626' }}>
        {supervisor.performanceRating}
      </span>
      <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>/5</span>
    </td>
    <td style={{ padding: '0.875rem 1rem' }}>
      <Badge variant={supervisor.status === 'active' ? 'success' : 'neutral'} dot>
        {supervisor.status === 'active' ? 'Active' : supervisor.status}
      </Badge>
    </td>
    <td style={{ padding: '0.875rem 1rem' }}>
      <button
        onClick={(e) => { e.stopPropagation(); onView(supervisor); }}
        style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600, border: '1px solid var(--color-primary-200)', borderRadius: '0.5rem', background: 'var(--color-primary-50)', color: 'var(--color-primary-700)', cursor: 'pointer' }}
      >
        View
      </button>
    </td>
  </motion.tr>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const SupervisorsPage = () => {
  const { supervisors, filters, loading, errors, fetchSupervisors, setFilter, setSelectedSupervisor, selectedSupervisor } = useDepartmentStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSupervisors();
  }, [fetchSupervisors]);

  const handleSearch = (value) => {
    setSearch(value);
    setFilter('supervisorSearch', value);
    setTimeout(() => fetchSupervisors(), 0);
  };

  const handleFilter = (key, value) => {
    setFilter(key, value);
    setTimeout(() => fetchSupervisors(), 0);
  };

  const TRACKS = ['all', 'Frontend Engineering', 'Backend Systems', 'DevOps & Cloud', 'Data Engineering & AI', 'QA & Testing'];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)', borderRadius: '1.25rem', padding: '1.75rem 2rem', color: '#fff', boxShadow: '0 8px 32px rgba(30,64,175,0.22)' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.15)', padding: '0.25rem 0.75rem', borderRadius: 99, display: 'inline-block', marginBottom: '0.625rem' }}>
          Department Oversight
        </span>
        <h2 style={{ margin: '0 0 0.375rem', fontSize: '1.625rem', fontWeight: 900 }}>Supervisor Overview</h2>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#93c5fd' }}>
          Monitor performance, workload, and review throughput across <strong style={{ color: '#fff' }}>{supervisors.length} supervisors</strong> in your department.
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Supervisors', value: supervisors.length, color: '#4f46e5' },
          { label: 'Active', value: supervisors.filter(s => s.status === 'active').length, color: '#10b981' },
          { label: 'Total Interns', value: supervisors.reduce((s, sv) => s + sv.assignedInternsCount, 0), color: '#0ea5e9' },
          { label: 'Avg Performance', value: supervisors.length ? (supervisors.reduce((s, sv) => s + sv.performanceRating, 0) / supervisors.length).toFixed(2) + '/5' : '—', color: '#f59e0b' },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ background: '#fff', borderRadius: '0.875rem', padding: '1rem 1.25rem', border: '1px solid var(--color-neutral-200)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color }}>{value}</p>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <RiSearchLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search supervisors, tracks..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.25rem', height: '38px', width: '100%' }}
          />
        </div>
        <select value={filters.supervisorTrack} onChange={(e) => handleFilter('supervisorTrack', e.target.value)} className="input-field" style={{ height: 38, width: 'auto', paddingRight: '2rem' }}>
          {TRACKS.map(t => <option key={t} value={t}>{t === 'all' ? 'All Tracks' : t}</option>)}
        </select>
        <select value={filters.supervisorStatus} onChange={(e) => handleFilter('supervisorStatus', e.target.value)} className="input-field" style={{ height: 38, width: 'auto', paddingRight: '2rem' }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {loading.supervisors ? (
          <div style={{ padding: '2rem' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 56, background: '#f1f5f9', borderRadius: '0.5rem', marginBottom: '0.75rem', animation: 'pulse 1.5s ease infinite' }} />
            ))}
          </div>
        ) : errors.supervisors ? (
          <EmptyState icon={<RiShieldUserLine />} title="Failed to load supervisors" description={errors.supervisors} />
        ) : supervisors.length === 0 ? (
          <EmptyState icon={<RiShieldUserLine />} title="No supervisors found" description="Try adjusting your search or filters." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-neutral-50)' }}>
                  {['Supervisor', 'Track', 'Interns', 'Active Tasks', 'Pending Reviews', 'Performance', 'Status', ''].map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: h === 'Interns' || h === 'Active Tasks' || h === 'Pending Reviews' || h === 'Performance' ? 'center' : 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {supervisors.map((sv) => (
                  <SupervisorRow key={sv.id} supervisor={sv} onView={setSelectedSupervisor} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Supervisor Drawer */}
      <SupervisorDrawer supervisor={selectedSupervisor} onClose={() => setSelectedSupervisor(null)} />

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </motion.div>
  );
};

export default SupervisorsPage;
