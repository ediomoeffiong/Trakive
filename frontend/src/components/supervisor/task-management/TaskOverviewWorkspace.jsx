import { useMemo } from 'react';
import {
  RiArrowRightLine,
  RiCalendarEventLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiFileList3Line,
  RiFlashlightLine,
  RiHistoryLine,
  RiInbox2Line,
  RiMoreLine,
  RiTimeLine,
  RiUserLine,
} from 'react-icons/ri';

import './TaskOverviewWorkspace.css';

const STATUS_META = {
  assigned: { label: 'Assigned', tone: 'blue', weight: 3 },
  'in-progress': { label: 'In progress', tone: 'indigo', weight: 4 },
  'pending-review': { label: 'Ready to review', tone: 'amber', weight: 8 },
  'needs-revision': { label: 'Needs revision', tone: 'rose', weight: 7 },
  completed: { label: 'Completed', tone: 'green', weight: 0 },
  overdue: { label: 'Overdue', tone: 'red', weight: 10 },
  draft: { label: 'Draft', tone: 'slate', weight: 1 },
};

const ACTIVITY_META = {
  submission: { label: 'Submission', tone: 'blue' },
  revision: { label: 'Revision', tone: 'amber' },
  overdue: { label: 'Overdue', tone: 'red' },
  completed: { label: 'Completed', tone: 'green' },
  assigned: { label: 'Assigned', tone: 'indigo' },
};

const MIX_ORDER = ['overdue', 'pending-review', 'needs-revision', 'in-progress', 'assigned', 'completed'];

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDaysLeft = (value) => {
  const date = parseDate(value);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((date - today) / 86400000);
};

const formatDueLabel = (value) => {
  const days = getDaysLeft(value);
  if (days === null) return 'No due date';
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
};

const formatDateTile = (value) => {
  const date = parseDate(value);
  if (!date) return { month: 'TBD', day: '—' };
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: date.getDate(),
  };
};

const getInitials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'IN';

const TaskAvatars = ({ interns = [] }) => {
  const safeInterns = Array.isArray(interns) ? interns.filter(Boolean).slice(0, 3) : [];

  if (!safeInterns.length) {
    return (
      <span className="task-overview__unassigned">
        <RiUserLine aria-hidden="true" /> Unassigned
      </span>
    );
  }

  return (
    <span className="task-overview__assignees" aria-label={safeInterns.map((intern) => intern.name).join(', ')}>
      <span className="task-overview__avatar-stack" aria-hidden="true">
        {safeInterns.map((intern, index) => (
          <span className="task-overview__avatar" key={intern.id || `${intern.name}-${index}`}>
            {intern.avatar ? <img src={intern.avatar} alt="" /> : getInitials(intern.name)}
          </span>
        ))}
      </span>
      <span>{safeInterns[0]?.name || 'Assigned intern'}{interns.length > 1 ? ` +${interns.length - 1}` : ''}</span>
    </span>
  );
};

const OverviewSkeleton = () => (
  <div className="task-overview__skeleton" aria-label="Loading task workspace">
    <span />
    <span />
    <span />
  </div>
);

const TaskOverviewWorkspace = ({
  tasks = [],
  recentActivity = [],
  upcomingDeadlines = [],
  isLoading = false,
  activeFilterLabel = '',
  onClearFilter,
  onViewTask,
  onViewBoard,
  onViewCalendar,
  onCreateTask,
}) => {
  const safeTasks = useMemo(() => (Array.isArray(tasks) ? tasks.filter(Boolean) : []), [tasks]);
  const activeTasks = useMemo(
    () => safeTasks.filter((task) => !['archived', 'draft', 'completed'].includes(task.status)),
    [safeTasks]
  );

  const priorityQueue = useMemo(() => (
    [...activeTasks]
      .sort((a, b) => {
        const aMeta = STATUS_META[a.status] || STATUS_META.assigned;
        const bMeta = STATUS_META[b.status] || STATUS_META.assigned;
        if (aMeta.weight !== bMeta.weight) return bMeta.weight - aMeta.weight;
        const aDue = parseDate(a.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bDue = parseDate(b.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return aDue - bDue;
      })
      .slice(0, 5)
  ), [activeTasks]);

  const deadlineItems = useMemo(() => {
    const source = Array.isArray(upcomingDeadlines) ? upcomingDeadlines.filter(Boolean) : [];
    return source.slice(0, 4).map((deadline) => ({
      ...deadline,
      task: safeTasks.find((task) => String(task.id) === String(deadline.id)),
    }));
  }, [safeTasks, upcomingDeadlines]);

  const dueSoonCount = deadlineItems.filter((item) => Number(item.daysLeft) >= 0 && Number(item.daysLeft) <= 7).length;
  const attentionCount = activeTasks.filter((task) => ['overdue', 'pending-review', 'needs-revision'].includes(task.status)).length;

  const taskMix = useMemo(() => MIX_ORDER.map((status) => ({
    status,
    count: safeTasks.filter((task) => task.status === status).length,
    ...STATUS_META[status],
  })).filter((item) => item.count > 0), [safeTasks]);

  const mixTotal = taskMix.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="task-overview" aria-labelledby="task-workspace-title">
      <div className="task-overview__intro">
        <div>
          <span className="task-overview__eyebrow"><RiFlashlightLine aria-hidden="true" /> Live workspace</span>
          <h2 id="task-workspace-title">Stay ahead of the work</h2>
          <p>Review what needs attention, spot approaching deadlines, and keep every assignment moving.</p>
        </div>
        <div className="task-overview__intro-stats" aria-label="Workspace summary">
          <span><strong>{attentionCount}</strong> need attention</span>
          <i aria-hidden="true" />
          <span><strong>{dueSoonCount}</strong> due this week</span>
        </div>
      </div>

      <div className="task-overview__primary-grid">
        <article className="task-overview__panel task-overview__queue-panel">
          <header className="task-overview__panel-header">
            <div>
              <span className="task-overview__panel-kicker">YOUR NEXT MOVES</span>
              <h3>Priority queue <span>{activeTasks.length}</span></h3>
            </div>
            <button type="button" className="task-overview__text-button" onClick={onViewBoard}>
              Open board <RiArrowRightLine aria-hidden="true" />
            </button>
          </header>

          {activeFilterLabel && (
            <div className="task-overview__filter-notice">
              <span>Showing {activeFilterLabel.toLowerCase()}</span>
              <button type="button" onClick={onClearFilter}>Clear filter</button>
            </div>
          )}

          {isLoading ? <OverviewSkeleton /> : priorityQueue.length ? (
            <div className="task-overview__queue-list">
              {priorityQueue.map((task, index) => {
                const status = STATUS_META[task.status] || STATUS_META.assigned;
                const actionLabel = task.status === 'pending-review' ? 'Review' : task.status === 'overdue' ? 'Follow up' : 'Open';
                const progress = Math.max(0, Math.min(100, Number(task.completionPercentage) || 0));
                return (
                  <button
                    type="button"
                    className="task-overview__task-row"
                    key={task.id}
                    onClick={() => onViewTask?.(task)}
                    aria-label={`${actionLabel} ${task.title}`}
                  >
                    <span className={`task-overview__rank task-overview__rank--${status.tone}`}>{String(index + 1).padStart(2, '0')}</span>
                    <span className="task-overview__task-main">
                      <span className="task-overview__task-topline">
                        <span className={`task-overview__status task-overview__status--${status.tone}`}>{status.label}</span>
                        <span className="task-overview__category">{task.category || 'General'}</span>
                      </span>
                      <strong>{task.title || 'Untitled task'}</strong>
                      <span className="task-overview__task-meta">
                        <TaskAvatars interns={task.assignedInterns} />
                        <span className="task-overview__meta-divider" aria-hidden="true" />
                        <span className={getDaysLeft(task.dueDate) < 0 ? 'is-overdue' : ''}>
                          <RiTimeLine aria-hidden="true" /> {formatDueLabel(task.dueDate)}
                        </span>
                      </span>
                    </span>
                    <span className="task-overview__progress-wrap" aria-label={`${progress}% complete`}>
                      <span><span>Progress</span><strong>{progress}%</strong></span>
                      <span className="task-overview__progress"><i style={{ width: `${progress}%` }} /></span>
                    </span>
                    <span className="task-overview__row-action">{actionLabel} <RiArrowRightLine aria-hidden="true" /></span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="task-overview__empty task-overview__empty--queue">
              <span><RiCheckboxCircleLine aria-hidden="true" /></span>
              <h4>{activeFilterLabel ? 'Nothing matches this view' : 'Your queue is clear'}</h4>
              <p>{activeFilterLabel ? 'Try clearing the KPI filter to see all active assignments.' : 'Create a task when you are ready to assign the next piece of work.'}</p>
              <button type="button" onClick={activeFilterLabel ? onClearFilter : onCreateTask}>
                {activeFilterLabel ? 'Show all tasks' : 'Create a task'}
              </button>
            </div>
          )}
        </article>

        <aside className="task-overview__panel task-overview__deadline-panel">
          <header className="task-overview__panel-header">
            <div>
              <span className="task-overview__panel-kicker">TIME SENSITIVE</span>
              <h3>Deadline pulse</h3>
            </div>
            <span className="task-overview__header-icon"><RiCalendarEventLine aria-hidden="true" /></span>
          </header>

          <div className="task-overview__deadline-summary">
            <span>{dueSoonCount}</span>
            <div><strong>Due in 7 days</strong><small>Across all active tasks</small></div>
          </div>

          {isLoading ? <OverviewSkeleton /> : deadlineItems.length ? (
            <div className="task-overview__deadline-list">
              {deadlineItems.map((item) => {
                const date = formatDateTile(item.dueDate);
                const isUrgent = Number(item.daysLeft) <= 1;
                return (
                  <button
                    type="button"
                    className="task-overview__deadline-row"
                    key={item.id}
                    onClick={() => item.task && onViewTask?.(item.task)}
                    disabled={!item.task}
                  >
                    <span className={`task-overview__date-tile${isUrgent ? ' is-urgent' : ''}`}>
                      <small>{date.month}</small><strong>{date.day}</strong>
                    </span>
                    <span>
                      <strong>{item.taskTitle || item.task?.title || 'Untitled task'}</strong>
                      <small>{item.assignedCount || item.task?.assignedInterns?.length || 0} assigned</small>
                    </span>
                    <span className={isUrgent ? 'is-urgent' : ''}>
                      {Number(item.daysLeft) < 0 ? `${Math.abs(item.daysLeft)}d late` : Number(item.daysLeft) === 0 ? 'Today' : `${item.daysLeft}d`}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="task-overview__empty task-overview__empty--compact">
              <span><RiCalendarEventLine aria-hidden="true" /></span>
              <h4>No deadlines ahead</h4>
              <p>Upcoming due dates will collect here.</p>
            </div>
          )}

          <button type="button" className="task-overview__wide-button" onClick={onViewCalendar}>
            View task calendar <RiArrowRightLine aria-hidden="true" />
          </button>
        </aside>
      </div>

      <div className="task-overview__secondary-grid">
        <article className="task-overview__panel task-overview__activity-panel">
          <header className="task-overview__panel-header">
            <div>
              <span className="task-overview__panel-kicker">LATEST UPDATES</span>
              <h3>Recent activity</h3>
            </div>
            <span className="task-overview__header-icon task-overview__header-icon--plain"><RiHistoryLine aria-hidden="true" /></span>
          </header>

          {Array.isArray(recentActivity) && recentActivity.length ? (
            <div className="task-overview__activity-list">
              {recentActivity.slice(0, 4).map((item, index) => {
                const meta = ACTIVITY_META[item.type] || ACTIVITY_META.assigned;
                return (
                  <div className="task-overview__activity-row" key={item.id || index}>
                    <span className={`task-overview__activity-marker task-overview__activity-marker--${meta.tone}`}>
                      {item.internInitials || <RiMoreLine aria-hidden="true" />}
                    </span>
                    <span>
                      <strong>{item.message || 'Task updated'}</strong>
                      <small>{item.timeAgo || 'Recently'}</small>
                    </span>
                    <em className={`task-overview__activity-type task-overview__activity-type--${meta.tone}`}>{meta.label}</em>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="task-overview__empty task-overview__empty--compact">
              <span><RiInbox2Line aria-hidden="true" /></span>
              <h4>No activity yet</h4>
              <p>Updates from assignments and submissions will appear here.</p>
            </div>
          )}
        </article>

        <article className="task-overview__panel task-overview__mix-panel">
          <header className="task-overview__panel-header">
            <div>
              <span className="task-overview__panel-kicker">WORKLOAD HEALTH</span>
              <h3>Task mix</h3>
            </div>
            <span className="task-overview__header-icon task-overview__header-icon--plain"><RiFileList3Line aria-hidden="true" /></span>
          </header>

          {mixTotal ? (
            <>
              <div className="task-overview__mix-bar" aria-label={`${mixTotal} tasks by status`}>
                {taskMix.map((item) => (
                  <span
                    key={item.status}
                    className={`task-overview__mix-segment task-overview__mix-segment--${item.tone}`}
                    style={{ width: `${(item.count / mixTotal) * 100}%` }}
                  />
                ))}
              </div>
              <div className="task-overview__mix-list">
                {taskMix.map((item) => (
                  <div key={item.status}>
                    <span className={`task-overview__mix-dot task-overview__mix-dot--${item.tone}`} />
                    <span>{item.label}</span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
              {attentionCount > 0 && (
                <div className="task-overview__mix-insight">
                  <RiErrorWarningLine aria-hidden="true" />
                  <span><strong>{attentionCount} task{attentionCount === 1 ? '' : 's'} need a decision.</strong> Open the board to resolve blockers and reviews.</span>
                </div>
              )}
            </>
          ) : (
            <div className="task-overview__empty task-overview__empty--compact">
              <span><RiFileList3Line aria-hidden="true" /></span>
              <h4>No task data yet</h4>
              <p>Your workload breakdown will appear here.</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
};

export default TaskOverviewWorkspace;
