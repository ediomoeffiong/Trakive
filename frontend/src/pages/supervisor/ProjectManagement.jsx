/**
 * @file ProjectManagement.jsx
 * @description Supervisor's project management page — create, assign, review, and manage projects.
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  RiAddLine, RiSearchLine, RiRefreshLine, RiFolderLine,
  RiTimeLine, RiGroupLine, RiArrowRightLine,
} from 'react-icons/ri';
import { Card, Button, EmptyState, Skeleton, ProgressBar } from '../../components/ui';
import { ROUTES } from '../../constants';
import { projectService } from '../../services/projectService';
import { ProjectStatusBadge, ProjectPriorityBadge } from '../../components/projects/ProjectStatusBadge';
import { CreateProjectDrawer } from '../../components/projects/CreateProjectDrawer';
import { ApprovalActionsModal } from '../../components/projects/ApprovalActionsModal';

const TAB_ITEMS = [
  { key: '',                  label: 'All Projects'      },
  { key: 'pending_approval',  label: 'Pending Approval'  },
  { key: 'active',            label: 'Active'            },
  { key: 'on_hold',           label: 'On Hold'           },
  { key: 'completed',         label: 'Completed'         },
];

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function MemberAvatars({ members = [] }) {
  if (!members.length) return <span style={{ fontSize: '0.78rem', color: 'var(--color-neutral-400)' }}>No interns</span>;
  const shown = members.slice(0, 4);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '-4px' }}>
      {shown.map((m, i) => (
        <div key={m.intern_id || i} style={{
          width: '26px', height: '26px', borderRadius: '50%', border: '2px solid #fff',
          background: 'var(--color-primary-200)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-primary-700)',
          marginLeft: i > 0 ? '-6px' : 0, zIndex: shown.length - i,
        }}>
          {(m.first_name || '?')[0].toUpperCase()}
        </div>
      ))}
      {members.length > 4 && (
        <span style={{ fontSize: '0.72rem', color: 'var(--color-neutral-500)', marginLeft: '6px' }}>+{members.length - 4}</span>
      )}
    </div>
  );
}

function ProjectRow({ project, onView, onReview }) {
  const members = Array.isArray(project.members) ? project.members : [];
  const isPending = project.status === 'pending_approval';
  return (
    <tr style={{ borderBottom: '1px solid var(--color-neutral-100)', cursor: 'pointer' }} onClick={() => onView(project.id)}>
      <td style={{ padding: '0.85rem 1rem', minWidth: '200px' }}>
        <p style={{ margin: '0 0 0.2rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-neutral-900)' }}>{project.title}</p>
        {project.creator_first_name && (
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
            By {project.creator_first_name} {project.creator_last_name}
          </p>
        )}
      </td>
      <td style={{ padding: '0.85rem 1rem' }}>
        <ProjectStatusBadge status={project.status} />
      </td>
      <td style={{ padding: '0.85rem 1rem' }}>
        <ProjectPriorityBadge priority={project.priority} />
      </td>
      <td style={{ padding: '0.85rem 1rem', minWidth: '120px' }}>
        <div style={{ width: '100%', maxWidth: '120px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-neutral-500)', marginBottom: '0.25rem' }}>
            <span>Progress</span><span>{Math.round(project.progress || 0)}%</span>
          </div>
          <ProgressBar value={parseFloat(project.progress || 0)} max={100} />
        </div>
      </td>
      <td style={{ padding: '0.85rem 1rem' }}>
        <MemberAvatars members={members} />
      </td>
      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--color-neutral-500)', whiteSpace: 'nowrap' }}>
        {formatDate(project.due_date)}
      </td>
      <td style={{ padding: '0.85rem 1rem' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {isPending && (
            <Button size="sm" onClick={() => onReview(project)} style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}>
              Review
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => onView(project.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem' }}>
            View <RiArrowRightLine />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function TableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <tr key={i} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
          {[...Array(7)].map((_, j) => (
            <td key={j} style={{ padding: '0.85rem 1rem' }}>
              <Skeleton height="0.9rem" width={j === 0 ? '80%' : '50%'} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function ProjectManagement() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [creating, setCreating] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectService.listProjects({ search, status: activeTab, limit: 100 });
      setProjects(res.data || []);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [search, activeTab]);

  useEffect(() => {
    fetchProjects();
    const handleUpdate = () => fetchProjects();
    window.addEventListener('trakive-projects-updated', handleUpdate);
    return () => window.removeEventListener('trakive-projects-updated', handleUpdate);
  }, [fetchProjects]);

  const handleView = (id) => navigate(ROUTES.SUPERVISOR_PROJECT_DETAILS.replace(':projectId', id));

  const stats = {
    total:   projects.length,
    active:  projects.filter((p) => p.status === 'active').length,
    pending: projects.filter((p) => p.status === 'pending_approval').length,
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: '0 0 0.2rem' }}>Projects</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-neutral-500)', margin: 0 }}>Manage intern projects and proposals</p>
        </div>
        <Button onClick={() => setCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RiAddLine /> Create Project
        </Button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Projects', value: stats.total,   color: 'var(--color-neutral-600)', bg: 'var(--color-neutral-50)'  },
          { label: 'Active',         value: stats.active,  color: 'var(--color-success-600)', bg: 'var(--color-success-50)'  },
          { label: 'Needs Review',   value: stats.pending, color: '#d97706',                  bg: '#fef3c7'                  },
        ].map((s) => (
          <Card key={s.label} style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{loading ? '—' : s.value}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--color-neutral-100)', marginBottom: '1rem' }}>
        {TAB_ITEMS.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: activeTab === t.key ? 700 : 500, fontSize: '0.85rem',
            color: activeTab === t.key ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
            borderBottom: activeTab === t.key ? '2px solid var(--color-primary-600)' : '2px solid transparent',
            marginBottom: '-2px', whiteSpace: 'nowrap',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <RiSearchLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)', fontSize: '0.9rem' }} />
          <input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', borderRadius: '0.5rem', border: '1px solid var(--color-neutral-200)', fontSize: '0.875rem', background: 'var(--color-neutral-0, #fff)', color: 'var(--color-neutral-900)', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>
        <Button variant="ghost" size="sm" onClick={fetchProjects} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <RiRefreshLine /> Refresh
        </Button>
      </div>

      {/* Table */}
      {projects.length === 0 && !loading ? (
        <EmptyState
          icon={<RiFolderLine style={{ fontSize: '2.5rem', color: 'var(--color-neutral-300)' }} />}
          title="No projects found"
          description={search ? 'Try adjusting your search' : 'Create your first project to get started'}
          action={<Button onClick={() => setCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RiAddLine /> Create Project</Button>}
        />
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-100)' }}>
                  {['Project', 'Status', 'Priority', 'Progress', 'Members', 'Due Date', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-neutral-600)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? <TableSkeleton /> : projects.map((p) => (
                  <ProjectRow key={p.id} project={p} onView={handleView} onReview={(proj) => setReviewTarget(proj)} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <CreateProjectDrawer isOpen={creating} onClose={() => setCreating(false)} onSuccess={fetchProjects} />
      <ApprovalActionsModal
        isOpen={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        project={reviewTarget}
        onActionComplete={() => { setReviewTarget(null); fetchProjects(); }}
      />
    </div>
  );
}
