/**
 * @file ProjectDetailsPage.jsx
 * @description Full project detail view with Overview, Milestones, Tasks, Activity, Notes tabs.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  RiArrowLeftLine, RiCheckboxCircleLine, RiTimeLine, RiUserLine,
  RiCalendarLine, RiGroupLine, RiFlagLine, RiHistoryLine,
  RiFileTextLine, RiTaskLine, RiFolderLine,
} from 'react-icons/ri';
import { Card, Button, ProgressBar, Skeleton, EmptyState } from '../components/ui';
import { ROUTES } from '../constants';
import { projectService } from '../services/projectService';
import { ProjectStatusBadge, ProjectPriorityBadge } from '../components/projects/ProjectStatusBadge';
import { MilestoneCard } from '../components/projects/MilestoneCard';
import { ApprovalActionsModal } from '../components/projects/ApprovalActionsModal';
import { useCurrentUser } from '../store/useAppStore';

const TABS = ['Overview', 'Milestones', 'Tasks', 'Activity', 'Notes'];

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const ACTION_LABELS = {
  submitted:         { label: 'Proposal Submitted',        color: 'var(--color-primary-600)',   bg: 'var(--color-primary-50)'  },
  approved:          { label: 'Approved',                  color: 'var(--color-success-600)',   bg: 'var(--color-success-50)'  },
  rejected:          { label: 'Rejected',                  color: 'var(--color-danger-600)',    bg: 'var(--color-danger-50)'   },
  changes_requested: { label: 'Changes Requested',         color: '#d97706',                   bg: '#fef3c7'                  },
  resubmitted:       { label: 'Resubmitted',               color: 'var(--color-primary-600)',   bg: 'var(--color-primary-50)'  },
};

const TASK_STATUS_COLORS = {
  todo:               { color: 'var(--color-neutral-500)', bg: 'var(--color-neutral-100)' },
  in_progress:        { color: '#d97706',                  bg: '#fef3c7'                  },
  submitted:          { color: 'var(--color-primary-600)', bg: 'var(--color-primary-50)'  },
  in_review:          { color: 'var(--color-primary-600)', bg: 'var(--color-primary-50)'  },
  completed:          { color: 'var(--color-success-600)', bg: 'var(--color-success-50)'  },
  revision_requested: { color: 'var(--color-danger-600)',  bg: 'var(--color-danger-50)'   },
};

function TabBar({ active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--color-neutral-100)', marginBottom: '1.5rem' }}>
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            padding: '0.65rem 1.1rem', background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: active === tab ? 700 : 500, fontSize: '0.88rem',
            color: active === tab ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
            borderBottom: active === tab ? '2px solid var(--color-primary-600)' : '2px solid transparent',
            marginBottom: '-2px', transition: 'all 0.15s ease', whiteSpace: 'nowrap',
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const role = (user?.role_name || '').toLowerCase();
  const isSupervisor = role === 'supervisor' || role === 'admin' || role === 'super_admin';

  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');
  const [approvalModal, setApprovalModal] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectService.getProject(projectId);
      setProject(res.data);
    } catch {
      toast.error('Failed to load project');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchMilestones = useCallback(async () => {
    try {
      const res = await projectService.getMilestones(projectId);
      setMilestones(res.data || []);
    } catch {}
  }, [projectId]);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await projectService.getProjectTasks(projectId);
      setTasks(res.data || []);
    } catch {}
  }, [projectId]);

  useEffect(() => { fetchProject(); fetchMilestones(); fetchTasks(); }, [fetchProject, fetchMilestones, fetchTasks]);

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Skeleton height="2rem" width="40%" style={{ marginBottom: '1rem' }} />
        <Skeleton height="1rem" width="80%" style={{ marginBottom: '2rem' }} />
        <Skeleton height="300px" borderRadius="0.75rem" />
      </div>
    );
  }

  if (!project) return null;

  const members = Array.isArray(project.members) ? project.members : [];
  const history = Array.isArray(project.approval_history) ? project.approval_history : [];
  const backRoute = isSupervisor ? ROUTES.SUPERVISOR_PROJECTS : ROUTES.PROJECTS;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Back nav */}
      <button
        onClick={() => navigate(backRoute)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-neutral-500)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1rem', padding: 0 }}
      >
        <RiArrowLeftLine /> Back to Projects
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: '0 0 0.4rem' }}>
            {project.title}
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <ProjectStatusBadge status={project.status} size="md" />
            <ProjectPriorityBadge priority={project.priority} size="md" />
            {project.source === 'intern_proposed' && (
              <span style={{ display: 'inline-flex', padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary-600)', background: 'var(--color-primary-50)' }}>
                Intern Proposed
              </span>
            )}
          </div>
        </div>
        {isSupervisor && project.status === 'pending_approval' && (
          <Button onClick={() => setApprovalModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Review Proposal
          </Button>
        )}
      </div>

      {/* Tabs */}
      <TabBar active={tab} onChange={setTab} />

      {/* OVERVIEW */}
      {tab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {project.description && (
              <Card>
                <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>Description</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: 1.6 }}>{project.description}</p>
              </Card>
            )}
            {(project.proposed_objectives || project.expected_outcome) && (
              <Card>
                {project.proposed_objectives && (
                  <>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>Objectives</h3>
                    <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: 1.6 }}>{project.proposed_objectives}</p>
                  </>
                )}
                {project.expected_outcome && (
                  <>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>Expected Outcome</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: 1.6 }}>{project.expected_outcome}</p>
                  </>
                )}
              </Card>
            )}
            {/* Progress */}
            <Card>
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>Progress</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>{tasks.filter((t) => t.status === 'completed').length}/{tasks.length} tasks completed</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{Math.round(project.progress || 0)}%</span>
              </div>
              <ProgressBar value={parseFloat(project.progress || 0)} max={100} />
            </Card>
          </div>

          {/* Sidebar info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Card style={{ padding: '1rem' }}>
              {[
                { label: 'Supervisor', value: project.supervisor_first_name ? `${project.supervisor_first_name} ${project.supervisor_last_name}` : '—', icon: <RiUserLine /> },
                { label: 'Department', value: project.department_name || '—', icon: <RiGroupLine /> },
                { label: 'Start Date', value: formatDate(project.start_date), icon: <RiCalendarLine /> },
                { label: 'Due Date', value: formatDate(project.due_date), icon: <RiTimeLine /> },
                { label: 'Created', value: formatDate(project.created_at), icon: <RiHistoryLine /> },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-neutral-100)' }}>
                  <span style={{ color: 'var(--color-neutral-400)', fontSize: '0.9rem', flexShrink: 0 }}>{icon}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-neutral-400)' }}>{label}</p>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>{value}</p>
                  </div>
                </div>
              ))}
            </Card>

            {/* Members */}
            <Card style={{ padding: '1rem' }}>
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>Team Members</h3>
              {members.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-400)', margin: 0 }}>No members assigned</p>
              ) : members.map((m) => (
                <div key={m.intern_id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary-700)', flexShrink: 0 }}>
                    {(m.first_name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600 }}>{m.first_name} {m.last_name}</p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-neutral-400)', textTransform: 'capitalize' }}>{m.role}</p>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* MILESTONES */}
      {tab === 'Milestones' && (
        <div>
          {milestones.length === 0 ? (
            <EmptyState icon={<RiFlagLine style={{ fontSize: '2rem', color: 'var(--color-neutral-300)' }} />} title="No milestones" description="No milestones have been added yet" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {milestones.map((m) => <MilestoneCard key={m.id} milestone={m} />)}
            </div>
          )}
        </div>
      )}

      {/* TASKS */}
      {tab === 'Tasks' && (
        <div>
          {tasks.length === 0 ? (
            <EmptyState icon={<RiTaskLine style={{ fontSize: '2rem', color: 'var(--color-neutral-300)' }} />} title="No tasks" description="No tasks have been added to this project" />
          ) : (
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-100)' }}>
                    {['Task', 'Milestone', 'Assignee', 'Priority', 'Due Date', 'Status'].map((h) => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-neutral-600)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t, i) => {
                    const sc = TASK_STATUS_COLORS[t.status] || TASK_STATUS_COLORS.todo;
                    return (
                      <tr key={t.id} style={{ borderBottom: i < tasks.length - 1 ? '1px solid var(--color-neutral-100)' : 'none' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-neutral-900)', maxWidth: '200px' }}>
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-neutral-500)', fontSize: '0.8rem' }}>{t.milestone_title || '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-neutral-500)', fontSize: '0.8rem' }}>
                          {t.assignee_first_name ? `${t.assignee_first_name} ${t.assignee_last_name}` : '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <ProjectPriorityBadge priority={t.priority} />
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-neutral-500)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatDate(t.due_date)}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ display: 'inline-flex', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, color: sc.color, background: sc.bg, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}

      {/* ACTIVITY */}
      {tab === 'Activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {history.length === 0 ? (
            <EmptyState icon={<RiHistoryLine style={{ fontSize: '2rem', color: 'var(--color-neutral-300)' }} />} title="No activity" description="No approval actions have been recorded yet" />
          ) : history.map((h) => {
            const cfg = ACTION_LABELS[h.action] || { label: h.action, color: 'var(--color-neutral-500)', bg: 'var(--color-neutral-100)' };
            return (
              <div key={h.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: cfg.color }}>{(h.actor_first_name || '?')[0]}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.85rem' }}>{h.actor_first_name} {h.actor_last_name}</strong>
                    <span style={{ display: 'inline-flex', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{formatDate(h.created_at)}</span>
                  </div>
                  {h.feedback && <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--color-neutral-500)', lineHeight: 1.5 }}>{h.feedback}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NOTES */}
      {tab === 'Notes' && (
        <Card>
          {project.notes ? (
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-700)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{project.notes}</p>
          ) : (
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-400)', fontStyle: 'italic' }}>No notes have been added to this project.</p>
          )}
        </Card>
      )}

      {/* Approval modal (supervisor) */}
      <ApprovalActionsModal
        isOpen={approvalModal}
        onClose={() => setApprovalModal(false)}
        project={project}
        onActionComplete={() => { setApprovalModal(false); fetchProject(); }}
      />
    </div>
  );
}
