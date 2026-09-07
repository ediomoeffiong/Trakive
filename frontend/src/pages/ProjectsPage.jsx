/**
 * @file ProjectsPage.jsx
 * @description Intern's main Projects section showing all assigned and proposed projects.
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  RiFolderLine, RiAddLine, RiArrowRightLine, RiSearchLine,
  RiRefreshLine, RiTimeLine, RiCheckboxCircleLine, RiLoader2Line,
} from 'react-icons/ri';
import { Card, Button, EmptyState, Skeleton, ProgressBar } from '../components/ui';
import { ROUTES } from '../constants';
import { projectService } from '../services/projectService';
import { ProjectStatusBadge, ProjectPriorityBadge } from '../components/projects/ProjectStatusBadge';
import { ProposeProjectDrawer } from '../components/projects/ProposeProjectDrawer';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const STATUS_OPTIONS = [
  { value: '',                label: 'All Statuses'      },
  { value: 'active',         label: 'Active'            },
  { value: 'pending_approval',label: 'Pending Approval' },
  { value: 'on_hold',        label: 'On Hold'           },
  { value: 'completed',      label: 'Completed'         },
  { value: 'draft',          label: 'Draft'             },
  { value: 'cancelled',      label: 'Cancelled'         },
];

function ProjectCard({ project, onView }) {
  const members = Array.isArray(project.members) ? project.members : [];
  return (
    <Card style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {project.title}
          </h3>
          {project.description && (
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-neutral-500)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {project.description}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem', flexShrink: 0 }}>
          <ProjectStatusBadge status={project.status} />
          <ProjectPriorityBadge priority={project.priority} />
        </div>
      </div>

      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Progress</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{Math.round(project.progress || 0)}%</span>
        </div>
        <ProgressBar value={parseFloat(project.progress || 0)} max={100} />
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
        {project.supervisor_first_name && (
          <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
            Supervisor: <strong style={{ color: 'var(--color-neutral-700)' }}>{project.supervisor_first_name} {project.supervisor_last_name}</strong>
          </div>
        )}
        {project.due_date && (
          <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <RiTimeLine /> Due {formatDate(project.due_date)}
          </div>
        )}
      </div>

      {/* Supervisor feedback notice */}
      {project.supervisor_feedback && project.status === 'pending_approval' && (
        <div style={{ padding: '0.5rem 0.75rem', background: 'var(--color-warning-50)', border: '1px solid var(--color-warning-100)', borderRadius: '0.5rem', fontSize: '0.78rem', color: 'var(--color-warning-600)' }}>
          <strong>Feedback: </strong>{project.supervisor_feedback}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="sm" variant="ghost" onClick={() => onView(project.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
          View Details <RiArrowRightLine />
        </Button>
      </div>
    </Card>
  );
}

function CardSkeleton() {
  return (
    <Card style={{ padding: '1.25rem' }}>
      <Skeleton height="1rem" width="60%" style={{ marginBottom: '0.5rem' }} />
      <Skeleton height="0.75rem" width="90%" style={{ marginBottom: '0.25rem' }} />
      <Skeleton height="0.75rem" width="75%" style={{ marginBottom: '1rem' }} />
      <Skeleton height="0.5rem" width="100%" />
    </Card>
  );
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [proposing, setProposing] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectService.listProjects({ search, status: statusFilter, limit: 50 });
      setProjects(res.data || []);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchProjects();
    const handleUpdate = () => fetchProjects();
    window.addEventListener('trakive-projects-updated', handleUpdate);
    return () => window.removeEventListener('trakive-projects-updated', handleUpdate);
  }, [fetchProjects]);

  const stats = {
    active:  projects.filter((p) => p.status === 'active').length,
    pending: projects.filter((p) => p.status === 'pending_approval').length,
    done:    projects.filter((p) => p.status === 'completed').length,
  };

  const handleView = (id) => navigate(ROUTES.PROJECT_DETAILS.replace(':projectId', id));

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: '0 0 0.25rem' }}>My Projects</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-neutral-500)', margin: 0 }}>Track your assigned and proposed projects</p>
        </div>
        <Button onClick={() => setProposing(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RiAddLine /> Propose Project
        </Button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Active', value: stats.active, icon: <RiLoader2Line />, color: 'var(--color-success-600)', bg: 'var(--color-success-50)' },
          { label: 'Pending Approval', value: stats.pending, icon: <RiTimeLine />, color: '#d97706', bg: '#fef3c7' },
          { label: 'Completed', value: stats.done, icon: <RiCheckboxCircleLine />, color: 'var(--color-primary-600)', bg: 'var(--color-primary-50)' },
        ].map((s) => (
          <Card key={s.label} style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: s.color, background: s.bg, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{loading ? '—' : s.value}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <RiSearchLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)', fontSize: '0.9rem' }} />
          <input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', borderRadius: '0.5rem',
              border: '1px solid var(--color-neutral-200)', fontSize: '0.875rem',
              background: 'var(--color-neutral-0, #fff)', color: 'var(--color-neutral-900)',
              boxSizing: 'border-box', outline: 'none',
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-neutral-200)', fontSize: '0.875rem', background: 'var(--color-neutral-0, #fff)', color: 'var(--color-neutral-900)', outline: 'none' }}
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Button variant="ghost" onClick={fetchProjects} size="sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <RiRefreshLine /> Refresh
        </Button>
      </div>

      {/* Project grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<RiFolderLine style={{ fontSize: '2.5rem', color: 'var(--color-neutral-300)' }} />}
          title="No projects yet"
          description={search || statusFilter ? 'Try adjusting your filters' : 'Propose your first project to get started'}
          action={<Button onClick={() => setProposing(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RiAddLine /> Propose Project</Button>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {projects.map((p) => <ProjectCard key={p.id} project={p} onView={handleView} />)}
        </div>
      )}

      <ProposeProjectDrawer isOpen={proposing} onClose={() => setProposing(false)} onSuccess={fetchProjects} />
    </div>
  );
}
