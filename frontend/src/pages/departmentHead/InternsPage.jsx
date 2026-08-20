/**
 * @file InternsPage.jsx
 * @description Department Head — Department Interns read-only overview.
 * Shows all interns across all supervisors with search, filtering by track/supervisor/status,
 * progress indicators, and a detail drawer — no management permissions.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiGroupLine, RiSearchLine, RiCloseLine, RiMailLine,
  RiGithubLine, RiLinkedinLine, RiCalendarLine,
  RiCheckboxCircleLine,
} from 'react-icons/ri';
import { useDepartmentStore } from '../../store/useDepartmentStore';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ── Intern Detail Drawer ───────────────────────────────────────────────────────
const InternDrawer = ({ intern, onClose }) => {
  if (!intern) return null;

  const statusVariant = {
    active: 'success', at_risk: 'danger', on_leave: 'warning', inactive: 'neutral',
  }[intern.status] ?? 'neutral';

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500, backdropFilter: 'blur(2px)' }} />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 460, background: '#fff', zIndex: 501, boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>Intern Profile</h3>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '0.375rem', border: 'none', background: 'var(--color-neutral-100)', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-neutral-500)' }}><RiCloseLine /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {/* Profile */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-neutral-100)' }}>
            <Avatar name={intern.name} src={intern.avatar} size="xl" online={intern.status === 'active'} />
            <h4 style={{ margin: '0.875rem 0 0.25rem', fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{intern.name}</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>{intern.track}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Badge variant={statusVariant} dot>{intern.status?.replace('_', ' ')}</Badge>
              <Badge variant="neutral">{intern.batchName}</Badge>
            </div>
          </div>

          {/* Supervisor */}
          <div style={{ background: 'var(--color-neutral-50)', borderRadius: '0.875rem', padding: '0.875rem 1rem', marginBottom: '1.25rem' }}>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.7rem', color: 'var(--color-neutral-400)', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Supervisor</p>
            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{intern.supervisorName}</p>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>Internship Progress</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-primary-600)' }}>{intern.progress}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--color-neutral-200)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${intern.progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} style={{ height: '100%', background: 'linear-gradient(90deg, #4f46e5, #818cf8)', borderRadius: 99 }} />
            </div>
          </div>

          {/* Scores */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-neutral-400)' }}>Performance</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'Avg Score', value: `${intern.averageScore}%`, color: '#4f46e5' },
                { label: 'Technical', value: `${intern.technicalScore}%`, color: '#0ea5e9' },
                { label: 'Soft Skills', value: `${intern.softSkillScore}%`, color: '#10b981' },
                { label: 'Attendance', value: `${intern.attendanceRate}%`, color: '#f59e0b' },
                { label: 'Tasks Done', value: intern.completedTasksCount, color: '#6366f1' },
                { label: 'Active Tasks', value: intern.activeTasksCount, color: '#ec4899' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'var(--color-neutral-50)', borderRadius: '0.75rem', padding: '0.75rem', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 900, color }}>{value}</p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          {intern.profileDetails?.milestones && (
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-neutral-400)' }}>Milestones</p>
              {intern.profileDetails.milestones.map((m) => (
                <div key={m.title} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-neutral-50)' }}>
                  <RiCheckboxCircleLine style={{ color: m.completed ? '#10b981' : 'var(--color-neutral-300)', fontSize: '1.125rem', flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: m.completed ? 'var(--color-neutral-800)' : 'var(--color-neutral-500)', textDecoration: m.completed ? 'none' : 'none' }}>{m.title}</p>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-neutral-400)' }}>{m.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Feedback */}
          {intern.profileDetails?.recentFeedback && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.875rem', padding: '0.875rem 1rem' }}>
              <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#059669' }}>Latest Supervisor Feedback</p>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-700)', lineHeight: 1.6, fontStyle: 'italic' }}>"{intern.profileDetails.recentFeedback}"</p>
            </div>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

// ── Intern Card ─────────────────────────────────────────────────────────────────
const InternCard = ({ intern, onView, index }) => {
  const statusConfig = {
    active:   { variant: 'success', label: 'Active' },
    at_risk:  { variant: 'danger',  label: 'At Risk' },
    on_leave: { variant: 'warning', label: 'On Leave' },
    inactive: { variant: 'neutral', label: 'Inactive' },
  }[intern.status] ?? { variant: 'neutral', label: intern.status };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      onClick={() => onView(intern)}
      style={{ background: '#fff', borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--color-neutral-200)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Avatar name={intern.name} src={intern.avatar} size="md" online={intern.status === 'active'} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{intern.name}</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{intern.track}</p>
        </div>
        <Badge variant={statusConfig.variant} dot>{statusConfig.label}</Badge>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Progress</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-600)' }}>{intern.progress}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--color-neutral-200)', borderRadius: 99, overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${intern.progress}%` }} transition={{ duration: 0.6, delay: index * 0.05 + 0.2 }} style={{ height: '100%', background: intern.progress >= 80 ? '#10b981' : intern.progress >= 60 ? '#6366f1' : '#f59e0b', borderRadius: 99 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
        {[
          { label: 'Score', value: `${intern.averageScore}%` },
          { label: 'Tasks', value: intern.completedTasksCount },
          { label: 'Attendance', value: `${intern.attendanceRate}%` },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: 'center', background: 'var(--color-neutral-50)', borderRadius: '0.625rem', padding: '0.5rem' }}>
            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{value}</p>
            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-neutral-400)' }}>{label}</p>
          </div>
        ))}
      </div>

      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
        Supervisor: <strong style={{ color: 'var(--color-neutral-700)' }}>{intern.supervisorName}</strong>
      </p>
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const InternsPage = () => {
  const { interns, supervisors, filters, loading, errors, fetchInterns, fetchSupervisors, setFilter, setSelectedIntern, selectedIntern } = useDepartmentStore();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('cards');

  useEffect(() => {
    fetchInterns();
    if (!supervisors.length) fetchSupervisors();
  }, [fetchInterns, fetchSupervisors]);

  const handleSearch = (value) => {
    setSearch(value);
    setFilter('internSearch', value);
    setTimeout(() => fetchInterns(), 0);
  };

  const handleFilter = (key, value) => {
    setFilter(key, value);
    setTimeout(() => fetchInterns(), 0);
  };

  const TRACKS = ['all', 'Frontend Engineering', 'Backend Systems', 'DevOps & Cloud', 'Data Engineering & AI', 'QA & Testing'];
  const STATUSES = [{ value: 'all', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'at_risk', label: 'At Risk' }, { value: 'on_leave', label: 'On Leave' }, { value: 'inactive', label: 'Inactive' }];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)', borderRadius: '1.25rem', padding: '1.75rem 2rem', color: '#fff', boxShadow: '0 8px 32px rgba(30,64,175,0.22)' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.15)', padding: '0.25rem 0.75rem', borderRadius: 99, display: 'inline-block', marginBottom: '0.625rem' }}>
          Department Oversight
        </span>
        <h2 style={{ margin: '0 0 0.375rem', fontSize: '1.625rem', fontWeight: 900 }}>Department Interns</h2>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#93c5fd' }}>
          Monitor intern progress across <strong style={{ color: '#fff' }}>{interns.length} active interns</strong> in your department. Click any card for full profile.
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total', value: interns.length, color: '#4f46e5' },
          { label: 'Active', value: interns.filter(i => i.status === 'active').length, color: '#10b981' },
          { label: 'At Risk', value: interns.filter(i => i.status === 'at_risk').length, color: '#dc2626' },
          { label: 'Avg Score', value: interns.length ? `${(interns.reduce((s, i) => s + i.averageScore, 0) / interns.length).toFixed(1)}%` : '—', color: '#f59e0b' },
          { label: 'Avg Progress', value: interns.length ? `${Math.round(interns.reduce((s, i) => s + i.progress, 0) / interns.length)}%` : '—', color: '#0ea5e9' },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ background: '#fff', borderRadius: '0.875rem', padding: '1rem', border: '1px solid var(--color-neutral-200)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color }}>{value}</p>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <RiSearchLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search interns, tracks, supervisors..." value={search} onChange={(e) => handleSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.25rem', height: '38px', width: '100%' }} />
        </div>
        <select value={filters.internTrack} onChange={(e) => handleFilter('internTrack', e.target.value)} className="input-field" style={{ height: 38, width: 'auto' }}>
          {TRACKS.map(t => <option key={t} value={t}>{t === 'all' ? 'All Tracks' : t}</option>)}
        </select>
        <select value={filters.internStatus} onChange={(e) => handleFilter('internStatus', e.target.value)} className="input-field" style={{ height: 38, width: 'auto' }}>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filters.internSupervisor} onChange={(e) => handleFilter('internSupervisor', e.target.value)} className="input-field" style={{ height: 38, width: 'auto' }}>
          <option value="all">All Supervisors</option>
          {supervisors.map(sv => <option key={sv.id} value={sv.id}>{sv.name}</option>)}
        </select>
      </div>

      {/* Intern Cards */}
      {loading.interns ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[...Array(6)].map((_, i) => <div key={i} style={{ height: 230, background: '#e2e8f0', borderRadius: '1rem', animation: 'pulse 1.5s ease infinite' }} />)}
        </div>
      ) : errors.interns ? (
        <EmptyState icon={<RiGroupLine />} title="Failed to load interns" description={errors.interns} />
      ) : interns.length === 0 ? (
        <EmptyState icon={<RiGroupLine />} title="No interns found" description="Try adjusting your search or filters." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {interns.map((intern, i) => (
            <InternCard key={intern.id} intern={intern} onView={setSelectedIntern} index={i} />
          ))}
        </div>
      )}

      <InternDrawer intern={selectedIntern} onClose={() => setSelectedIntern(null)} />
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </motion.div>
  );
};

export default InternsPage;
