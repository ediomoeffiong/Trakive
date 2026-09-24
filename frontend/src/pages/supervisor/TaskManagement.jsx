/**
 * @file TaskManagement.jsx
 * @description Supervisor Task & Assignment Management — main page.
 * Orchestrates all sub-views: Dashboard, Directory, Submissions, Calendar, Templates.
 * Consumes useSupervisorTaskStore exclusively for state and async operations.
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiAddCircleLine,
  RiLayoutGridLine,
  RiListCheck,
  RiFileUploadLine,
  RiCalendarEventLine,
  RiDashboardLine,
  RiRefreshLine,
  RiCalendarCheckLine,
  RiArchiveLine,
  RiDraftLine,
} from 'react-icons/ri';

import { useSupervisorTaskStore } from '../../store/useSupervisorTaskStore';
import WeeklyReview from './WeeklyReview';

import {
  TaskKPISummary,
  TaskManagementFilters,
  TaskDirectoryTable,
  TaskDetailsDrawer,
  CreateTaskModal,
  CreateTemplateModal,
  TaskAssignmentModal,
  TaskTemplatesModal,
  SubmissionMonitoringView,
  TaskCalendarView,
  TaskBulkActionToolbar,
} from '../../components/supervisor/task-management';

// ── Page transition ──────────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.2 } },
};

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard',   label: 'Overview',  icon: RiDashboardLine },
  { id: 'directory',   label: 'Board',     icon: RiListCheck },
  { id: 'drafts',      label: 'Drafts',    icon: RiDraftLine },
  { id: 'submissions', label: 'Submitted', icon: RiFileUploadLine },
  { id: 'weekly',      label: 'Weekly',    icon: RiCalendarCheckLine },
  { id: 'calendar',    label: 'Calendar',  icon: RiCalendarEventLine },
  { id: 'archived',    label: 'Archived',  icon: RiArchiveLine },
  { id: 'templates',   label: 'Templates', icon: RiLayoutGridLine },
];

// ── Recent Activity mini-feed (for dashboard tab) ─────────────────────────────
const ActivityFeed = ({ items = [] }) => {
  const safeItems = Array.isArray(items) ? items : [];
  const TYPE_STYLES = {
    submission: { bg: '#f0f9ff', color: '#1e40af', dot: '#3b82f6' },
    revision:   { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
    overdue:    { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
    completed:  { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
    assigned:   { bg: '#e0e7ff', color: '#3730a3', dot: '#4f46e5' },
  };

  return (
    <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', padding: '1.25rem' }}>
      <h3 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-800)' }}>
        Recent Activity
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {safeItems.length === 0 ? (
          <div style={{ padding: '1.25rem 0.5rem', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>No recent activity</p>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)', lineHeight: 1.45 }}>
              Intern submissions, assignments, and completed tasks will appear here.
            </p>
          </div>
        ) : safeItems.map((item) => {
          const style = TYPE_STYLES[item.type] || TYPE_STYLES.assigned;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}
            >
              {/* Avatar / dot */}
              {item.internInitials ? (
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: style.dot, color: '#fff', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.internInitials}
                </div>
              ) : (
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: style.dot }} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-700)', lineHeight: 1.5 }}>{item.message}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{item.timeAgo}</span>
              </div>
              <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.625rem', fontWeight: 700, background: style.bg, color: style.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {item.type}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ── Upcoming Deadlines widget ─────────────────────────────────────────────────
const UpcomingDeadlines = ({ deadlines = [] }) => {
  const safeDeadlines = Array.isArray(deadlines) ? deadlines : [];
  const urgencyColor = (daysLeft) => {
    if (typeof daysLeft !== 'number' || Number.isNaN(daysLeft)) return '#4f46e5';
    if (daysLeft <= 1) return '#ef4444';
    if (daysLeft <= 4) return '#f59e0b';
    return '#4f46e5';
  };

  return (
    <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', padding: '1.25rem' }}>
      <h3 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-800)' }}>
        Upcoming Deadlines
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {safeDeadlines.length === 0 ? (
          <div style={{ padding: '1.25rem 0.5rem', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>No upcoming deadlines</p>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)', lineHeight: 1.45 }}>
              Tasks with due dates will show here so you can follow up before they become overdue.
            </p>
          </div>
        ) : safeDeadlines.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              background: 'var(--color-neutral-50)',
              borderRadius: '0.75rem',
              border: '1px solid var(--color-neutral-100)',
              borderLeft: `3px solid ${urgencyColor(item.daysLeft)}`,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.taskTitle}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                {item.assignedCount} intern(s) · Due {item.dueDate}
              </p>
            </div>
            <span
              style={{
                padding: '0.2rem 0.5rem',
                borderRadius: '9999px',
                fontSize: '0.6875rem',
                fontWeight: 800,
                background: `${urgencyColor(item.daysLeft)}18`,
                color: urgencyColor(item.daysLeft),
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {item.daysLeft <= 0 ? 'OVERDUE' : item.daysLeft === 1 ? '1 day left' : `${item.daysLeft} days`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const TaskManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);
  const queryString = searchParams.toString();
  const {
    // State
    activeTab,
    tasks,
    allTasks,
    totalTasks,
    totalPages,
    currentPage,
    pageSize,
    selectedTask,
    selectedTaskIds,
    filters,
    activeFilterChips,
    activeSort,
    kpis,
    recentActivity,
    upcomingDeadlines,
    templates,
    submissions,
    taskSubmissions,
    taskTimeline,
    isCreateModalOpen,
    isDetailsDrawerOpen,
    isAssignModalOpen,
    isTemplatesModalOpen,
    editingTask,
    loading,

    // Actions
    setActiveTab,
    setSearch,
    setFilter,
    removeFilterChip,
    clearAllFilters,
    setSort,
    setPage,
    toggleSelectTask,
    selectAllTasks,
    clearSelection,
    openCreateModal,
    closeCreateModal,
    openDetailsDrawer,
    closeDetailsDrawer,
    openAssignModal,
    closeAssignModal,
    openTemplatesModal,
    closeTemplatesModal,
    bulkAction,

    // Async
    loadDashboard,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    duplicateTask,
    fetchTemplates,
    createTemplate,
    deleteTemplate,
    assignTask,
    fetchSubmissions,
  } = useSupervisorTaskStore();

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    loadDashboard();
    fetchTasks();
    fetchSubmissions();
  }, []);

  useEffect(() => {
    const action = searchParams.get('action');
    const tab = searchParams.get('tab');
    const internId = searchParams.get('intern');

    if (tab === 'weekly') {
      setActiveTab('weekly');
    } else if (internId) {
      setActiveTab('directory');
      setFilter('internId', internId);
    }

    if (action === 'new') {
      openCreateModal(
        internId
          ? {
              assignedInterns: [{ id: internId, name: searchParams.get('internName') || 'Selected Intern', initials: 'SI' }],
              department: 'FifthLab',
              status: 'assigned',
            }
          : null
      );
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('action');
      setSearchParams(nextParams, { replace: true });
    }
  }, [queryString]);

  useEffect(() => {
    if (activeTab === 'directory' || activeTab === 'calendar' || activeTab === 'archived' || activeTab === 'drafts') fetchTasks();
    if (activeTab === 'submissions') fetchSubmissions();
    if (activeTab === 'templates') fetchTemplates();
  }, [activeTab]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleViewTask = (task) => {
    openDetailsDrawer(task);
  };

  const handleEditTask = (task) => {
    openCreateModal(task);
  };

  const handleDuplicateTask = async (task) => {
    try {
      await duplicateTask(task.id);
      toast.success(`"${task.title}" duplicated successfully.`);
    } catch {
      toast.error('Failed to duplicate task.');
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"? This action cannot be undone.`)) return;
    try {
      await deleteTask(task.id);
      toast.success(`"${task.title}" deleted.`);
    } catch {
      toast.error('Failed to delete task.');
    }
  };

  const handleArchiveTask = async (task) => {
    try {
      await updateTask(task.id, { status: 'archived' });
      toast.success(`"${task.title}" archived.`);
    } catch {
      toast.error('Failed to archive task.');
    }
  };

  const handleAssignTask = (task) => {
    openAssignModal(task);
  };

  const handleWeeklyTaskClick = (weeklyTask, plan) => {
    const catalog = Array.isArray(allTasks) && allTasks.length ? allTasks : (Array.isArray(tasks) ? tasks : []);
    const match = catalog.find((task) =>
      String(task.id) === String(weeklyTask.id) ||
      String(task.raw?.id) === String(weeklyTask.id) ||
      (weeklyTask.title && task.title === weeklyTask.title)
    );
    const internName = `${plan?.intern_first_name || ''} ${plan?.intern_last_name || ''}`.trim();
    handleViewTask(match || {
      id: weeklyTask.id,
      title: weeklyTask.title || 'Weekly task',
      description: weeklyTask.description || weeklyTask.weekly_note || '',
      status: weeklyTask.status || 'assigned',
      priority: weeklyTask.priority || 'medium',
      dueDate: weeklyTask.due_date || weeklyTask.dueDate,
      estimatedHours: weeklyTask.estimatedHours || 4,
      submissionCount: 0,
      assignedInterns: internName
        ? [{
            id: plan?.intern_id,
            name: internName,
            initials: internName.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'IN',
            avatar: plan?.intern_avatar || plan?.internAvatar,
          }]
        : [],
    });
  };

  const taskCatalog = Array.isArray(allTasks) && allTasks.length ? allTasks : (Array.isArray(tasks) ? tasks : []);
  const archivedTasks = taskCatalog.filter((task) => task?.status === 'archived');
  const draftTasks = taskCatalog.filter((task) => task?.status === 'draft');

  const handleBulkAction = async (action) => {
    if (action === 'export') {
      toast.success(`Exporting ${selectedTaskIds.length} task(s)...`);
      clearSelection();
      return;
    }
    try {
      await bulkAction(action);
      const labels = { delete: 'Deleted', archive: 'Archived', status: 'Updated' };
      toast.success(`${labels[action] || 'Updated'} ${selectedTaskIds.length} task(s).`);
    } catch {
      toast.error('Bulk action failed. Please try again.');
    }
  };

  const handleKPIClick = (kpi) => {
    if (kpi.filterKey && kpi.filterKey !== 'all') {
      setActiveTab('directory');
      setFilter('status', kpi.filterKey === 'overdue' ? 'overdue' : kpi.filterKey === 'pending-review' ? 'pending-review' : kpi.filterKey === 'draft' ? 'draft' : kpi.filterKey);
    } else {
      setActiveTab('directory');
      clearAllFilters();
    }
  };

  const handleUseTemplate = (template) => {
    openCreateModal({
      title: template.name,
      description: template.description || template.defaultInstructions,
      category: template.category,
      department: template.department,
      priority: template.defaultPriority,
      objectives: template.learningObjectives || template.objectives || [],
      submissionRequirements: template.submissionRequirements,
      status: 'assigned',
    });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        paddingBottom: '3rem',
        minWidth: 0,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '0.875rem',
                background: '#00b4d8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.25rem',
                boxShadow: '0 4px 16px rgba(0, 180, 216, 0.3)',
              }}
            >
              <RiListCheck />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 900, color: 'var(--color-neutral-900)', lineHeight: 1.2 }}>
                Task Management
              </h1>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
                Create, assign, track and review intern tasks
              </p>
            </div>
          </div>
        </div>

        {/* Header actions */}
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fetchTasks()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5625rem 0.875rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--color-neutral-200)',
              background: '#fff',
              color: 'var(--color-neutral-600)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Refresh tasks"
          >
            <RiRefreshLine style={{ fontSize: '1rem' }} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openTemplatesModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5625rem 1rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--color-neutral-200)',
              background: '#fff',
              color: 'var(--color-neutral-700)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RiLayoutGridLine /> Templates
          </motion.button>

          <motion.button
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0, 180, 216, 0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => openCreateModal()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5625rem 1.125rem',
              borderRadius: '0.875rem',
              border: 'none',
              background: '#00b4d8',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,180,216,0.28)',
            }}
            id="create-task-btn"
          >
            <RiAddCircleLine style={{ fontSize: '1.0625rem' }} />
            Create Task
          </motion.button>
        </div>
      </div>

      {/* ── Tab Navigation ──────────────────────────────────────────────────── */}
      <div
        className="page-tab-bar"
        style={{
          display: 'flex',
          gap: 0,
          background: '#fff',
          borderRadius: '0.875rem',
          border: '1px solid var(--color-neutral-200)',
          padding: '0.3rem',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          boxShadow: '0 2px 8px rgba(24, 18, 18, 0.04)',
        }}
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderRadius: '0.625rem',
                border: 'none',
                background: isActive ? '#00b4d8' : 'transparent',
                color: isActive ? '#fff' : 'var(--color-neutral-500)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.18s ease',
                flex: '0 0 auto',
                boxShadow: isActive ? '0 4px 12px rgba(0,180,216,0.25)' : 'none',
              }}
              id={`tab-${id}`}
            >
              <Icon style={{ fontSize: '1rem' }} />
              {label}
              {id === 'submissions' && Array.isArray(submissions) && submissions.filter((s) => s?.status === 'submitted').length > 0 && (
                <span style={{ background: isActive ? 'rgba(255,255,255,0.25)' : '#fee2e2', color: isActive ? '#fff' : '#dc2626', borderRadius: '9999px', fontSize: '0.625rem', fontWeight: 800, padding: '0.1rem 0.4rem', minWidth: '18px', textAlign: 'center' }}>
                  {submissions.filter((s) => s?.status === 'submitted').length}
                </span>
              )}
              {id === 'drafts' && draftTasks.length > 0 && (
                <span style={{ background: isActive ? 'rgba(255,255,255,0.25)' : '#fef3c7', color: isActive ? '#fff' : '#b45309', borderRadius: '9999px', fontSize: '0.625rem', fontWeight: 800, padding: '0.1rem 0.45rem', minWidth: '18px', textAlign: 'center' }}>
                  {draftTasks.length}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* ── DASHBOARD ─────────────────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* KPIs */}
            <TaskKPISummary
              kpis={kpis}
              isLoading={loading.dashboard}
              onKPIClick={handleKPIClick}
            />

            {/* Two-column: Activity + Deadlines */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
              <ActivityFeed items={recentActivity} />
              <UpcomingDeadlines deadlines={upcomingDeadlines} />
            </div>

            {/* Quick access: task directory preview */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-800)' }}>
                  Task Overview
                </h3>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab('directory')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00b4d8', fontSize: '0.875rem', fontWeight: 700 }}
                >
                  View All →
                </motion.button>
              </div>
              <TaskDirectoryTable
                tasks={(Array.isArray(tasks) ? tasks : []).slice(0, 5)}
                isLoading={loading.tasks}
                selectedTaskIds={selectedTaskIds}
                onToggleSelect={toggleSelectTask}
                onSelectAll={selectAllTasks}
                onClearSelection={clearSelection}
                onView={handleViewTask}
                onEdit={handleEditTask}
                onDuplicate={handleDuplicateTask}
                onAssign={handleAssignTask}
                onArchive={handleArchiveTask}
                onDelete={handleDeleteTask}
                activeSort={activeSort}
                onSortChange={setSort}
                currentPage={1}
                totalPages={1}
                totalTasks={Math.min((Array.isArray(tasks) ? tasks : []).length, 5)}
                pageSize={5}
                emptyType="no-tasks"
                onCreateFirst={() => openCreateModal()}
              />
            </div>
          </motion.div>
        )}

        {/* ── TASK DIRECTORY ────────────────────────────────────────────────── */}
        {activeTab === 'directory' && (
          <motion.div key="directory" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Filters */}
            <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <TaskManagementFilters
                filters={filters}
                activeFilterChips={activeFilterChips}
                search={filters.search}
                onSearch={setSearch}
                onFilterChange={setFilter}
                onRemoveChip={removeFilterChip}
                onClearAll={clearAllFilters}
                onSortChange={setSort}
                activeSort={activeSort}
              />
            </div>

            {/* Table */}
            <TaskDirectoryTable
              tasks={tasks}
              isLoading={loading.tasks}
              selectedTaskIds={selectedTaskIds}
              onToggleSelect={toggleSelectTask}
              onSelectAll={selectAllTasks}
              onClearSelection={clearSelection}
              onView={handleViewTask}
              onEdit={handleEditTask}
              onDuplicate={handleDuplicateTask}
              onAssign={handleAssignTask}
              onArchive={handleArchiveTask}
              onDelete={handleDeleteTask}
              activeSort={activeSort}
              onSortChange={setSort}
              currentPage={currentPage}
              totalPages={totalPages}
              totalTasks={totalTasks}
              pageSize={pageSize}
              onPageChange={setPage}
              emptyType={Object.values(filters).some((v) => v && v !== 'all' && v !== '') ? 'no-results' : 'no-tasks'}
              onCreateFirst={() => openCreateModal()}
            />
          </motion.div>
        )}

        {/* ── DRAFTS ────────────────────────────────────────────────────────── */}
        {activeTab === 'drafts' && (
          <motion.div key="drafts" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                background: '#fffbeb',
                borderRadius: '1rem',
                border: '1px solid #fde68a',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RiDraftLine style={{ color: '#d97706', fontSize: '1.25rem' }} />
                  <h2 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800, color: '#92400e' }}>
                    Draft Tasks ({draftTasks.length})
                  </h2>
                </div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#b45309' }}>
                  Tasks saved as drafts are unpublished and not visible to interns yet. Click "Edit" to finalize details and assign them, or publish directly.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openCreateModal()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  background: '#d97706',
                  color: '#fff',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(217,119,6,0.25)',
                }}
              >
                <RiAddCircleLine /> New Task
              </motion.button>
            </div>

            <TaskDirectoryTable
              tasks={draftTasks}
              isLoading={loading.tasks}
              selectedTaskIds={selectedTaskIds}
              onToggleSelect={toggleSelectTask}
              onSelectAll={selectAllTasks}
              onClearSelection={clearSelection}
              onView={handleViewTask}
              onEdit={handleEditTask}
              onDuplicate={handleDuplicateTask}
              onAssign={handleAssignTask}
              onArchive={handleArchiveTask}
              onDelete={handleDeleteTask}
              activeSort={activeSort}
              onSortChange={setSort}
              currentPage={1}
              totalPages={1}
              totalTasks={draftTasks.length}
              pageSize={Math.max(draftTasks.length, 1)}
              emptyType="no-drafts"
              onCreateFirst={() => openCreateModal()}
            />
          </motion.div>
        )}

        {/* ── SUBMISSIONS ───────────────────────────────────────────────────── */}
        {activeTab === 'submissions' && (
          <motion.div key="submissions" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <SubmissionMonitoringView />
          </motion.div>
        )}

        {/* ── WEEKLY REPORTS ────────────────────────────────────────────────── */}
        {activeTab === 'weekly' && (
          <motion.div key="weekly" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ width: '100%', minWidth: 0 }}>
            <WeeklyReview onTaskClick={handleWeeklyTaskClick} />
          </motion.div>
        )}

        {/* ── CALENDAR ──────────────────────────────────────────────────────── */}
        {activeTab === 'calendar' && (
          <motion.div key="calendar" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <TaskCalendarView />
          </motion.div>
        )}

        {activeTab === 'archived' && (
          <motion.div key="archived" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-neutral-800)' }}>Archived tasks</h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
                Tasks you archived remain available here and can still be opened, duplicated, or deleted.
              </p>
            </div>
            <TaskDirectoryTable
              tasks={archivedTasks}
              isLoading={loading.tasks}
              selectedTaskIds={selectedTaskIds}
              onToggleSelect={toggleSelectTask}
              onSelectAll={selectAllTasks}
              onClearSelection={clearSelection}
              onView={handleViewTask}
              onEdit={handleEditTask}
              onDuplicate={handleDuplicateTask}
              onAssign={handleAssignTask}
              onArchive={handleArchiveTask}
              onDelete={handleDeleteTask}
              activeSort={activeSort}
              onSortChange={setSort}
              currentPage={1}
              totalPages={1}
              totalTasks={archivedTasks.length}
              pageSize={Math.max(archivedTasks.length, 1)}
              emptyType="no-archived"
              onCreateFirst={() => openCreateModal()}
            />
          </motion.div>
        )}

        {/* ── TEMPLATES ─────────────────────────────────────────────────────── */}
        {activeTab === 'templates' && (
          <motion.div key="templates" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-neutral-800)' }}>Task Templates</h2>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>Reusable task blueprints to speed up your workflow</p>
              </div>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsCreateTemplateModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5625rem 1rem', borderRadius: '0.875rem', border: 'none', background: '#00b4d8', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,180,216,0.25)' }}
              >
                <RiAddCircleLine /> New Template
              </motion.button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem', alignItems: 'stretch' }}>
              {loading.templates ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: '0.875rem', padding: '1.25rem', border: '1px solid var(--color-neutral-200)', height: '180px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[80, 60, 90, 40].map((w, j) => (
                      <div key={j} style={{ height: j === 0 ? 16 : 12, width: `${w}%`, background: '#00b4d8', borderRadius: '4px' }} />
                    ))}
                  </div>
                ))
              ) : (Array.isArray(templates) ? templates.filter(Boolean) : []).length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: '0.875rem', border: '1px solid var(--color-neutral-200)', color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>
                  No templates available yet. Click "New Template" above to create one.
                </div>
              ) : (Array.isArray(templates) ? templates.filter(Boolean) : []).map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                  style={{ background: '#fff', borderRadius: '0.875rem', padding: '1.25rem', border: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', gap: '0.875rem', minHeight: '230px', height: '100%' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', minHeight: '42px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)', lineHeight: 1.3 }}>{template.name || 'Untitled Template'}</h3>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: '#eff2ff', color: '#4338ca', flexShrink: 0 }}>
                      {template.category || 'General'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-500)', lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', minHeight: '62px' }}>
                    {template.description || 'No description provided.'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>~{template.estimatedHours || 0}h</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>· Used {template.usageCount || 0}×</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-neutral-100)', marginTop: 'auto' }}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleUseTemplate(template)}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '0.625rem', border: 'none', background: '#00b4d8', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Use Template
                    </motion.button>
                    <motion.button
                      whileHover={{ background: '#fef2f2' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        if (window.confirm(`Delete template "${template.name}"?`)) {
                          deleteTemplate(template.id);
                          toast.success('Template deleted.');
                        }
                      }}
                      style={{ padding: '0.5rem 0.75rem', borderRadius: '0.625rem', border: '1px solid var(--color-neutral-200)', background: '#fff', cursor: 'pointer', color: '#dc2626', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Floating Bulk Action Toolbar ─────────────────────────────────────── */}
      <TaskBulkActionToolbar
        selectedCount={selectedTaskIds.length}
        onClear={clearSelection}
        onAction={handleBulkAction}
      />

      {/* ── Create / Edit Task Modal ─────────────────────────────────────────── */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        editingTask={editingTask}
        onClose={closeCreateModal}
        isLoading={loading.action}
        onSubmit={async (data) => {
          if (editingTask?.id && !editingTask.title?.includes('(template)')) {
            await updateTask(editingTask.id, data);
          } else {
            await createTask(data);
          }
        }}
      />

      <CreateTemplateModal
        isOpen={isCreateTemplateModalOpen}
        onClose={() => setIsCreateTemplateModalOpen(false)}
        isLoading={loading.action}
        onSubmit={createTemplate}
      />

      {/* ── Task Details Drawer ───────────────────────────────────────────────── */}
      <TaskDetailsDrawer
        isOpen={isDetailsDrawerOpen}
        task={selectedTask}
        submissions={(Array.isArray(taskSubmissions) ? taskSubmissions : []).filter((s) => String(s?.taskId) === String(selectedTask?.id))}
        isLoadingSubmissions={loading.submissions}
        timeline={taskTimeline}
        isLoadingTimeline={loading.timeline}
        onClose={closeDetailsDrawer}
        onEdit={handleEditTask}
        onAssign={handleAssignTask}
        onDuplicate={handleDuplicateTask}
        onArchive={handleArchiveTask}
      />

      {/* ── Assign Task Modal ─────────────────────────────────────────────────── */}
      <TaskAssignmentModal
        isOpen={isAssignModalOpen}
        task={selectedTask}
        isLoading={loading.action}
        onClose={closeAssignModal}
        onAssign={assignTask}
      />

      {/* ── Templates Picker Modal ─────────────────────────────────────────────── */}
      <TaskTemplatesModal
        isOpen={isTemplatesModalOpen}
        templates={templates}
        isLoading={loading.templates}
        onClose={closeTemplatesModal}
        onUseTemplate={handleUseTemplate}
        onDuplicateTemplate={(template) => toast.success(`"${template.name}" duplicated.`)}
        onDeleteTemplate={(id) => deleteTemplate(id)}
        onCreateTemplate={() => { closeTemplatesModal(); setIsCreateTemplateModalOpen(true); }}
      />
    </motion.div>
  );
};

export default TaskManagementPage;
