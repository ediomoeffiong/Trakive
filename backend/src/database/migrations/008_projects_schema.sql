-- Migration 008: Projects, Milestones & Weekly Plans
-- Extends the existing Trakive schema with project management and weekly task planning.

-- 1. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    supervisor_id UUID REFERENCES supervisor_profiles(id) ON DELETE SET NULL,
    source VARCHAR(30) NOT NULL DEFAULT 'supervisor_assigned'
        CHECK (source IN ('supervisor_assigned', 'intern_proposed')),
    status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'pending_approval', 'active', 'on_hold', 'completed', 'cancelled')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    start_date DATE,
    due_date DATE,
    progress NUMERIC(5,2) NOT NULL DEFAULT 0
        CHECK (progress >= 0 AND progress <= 100),
    proposed_objectives TEXT,
    expected_outcome TEXT,
    rejection_reason TEXT,
    supervisor_feedback TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 2. PROJECT_MEMBERS (M:N — interns assigned to projects)
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    intern_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member'
        CHECK (role IN ('lead', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_project_intern UNIQUE (project_id, intern_id)
);

-- 3. PROJECT_APPROVAL_HISTORY — Full audit trail
CREATE TABLE IF NOT EXISTS project_approval_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    action VARCHAR(30) NOT NULL
        CHECK (action IN ('submitted', 'approved', 'rejected', 'changes_requested', 'resubmitted')),
    actor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PROJECT_MILESTONES
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    due_date DATE,
    completion_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'not_started'
        CHECK (status IN ('not_started', 'ongoing', 'completed', 'overdue')),
    progress NUMERIC(5,2) NOT NULL DEFAULT 0
        CHECK (progress >= 0 AND progress <= 100),
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Extend TASKS table with project/milestone/weekly columns
ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES project_milestones(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS task_source VARCHAR(30) DEFAULT 'supervisor_assigned'
        CHECK (task_source IN ('supervisor_assigned', 'intern_created', 'project_task')),
    ADD COLUMN IF NOT EXISTS week_start DATE,
    ADD COLUMN IF NOT EXISTS weekly_note TEXT,
    ADD COLUMN IF NOT EXISTS end_of_week_status VARCHAR(20)
        CHECK (end_of_week_status IN ('completed', 'not_done', 'pending', 'ongoing'));

-- 6. WEEKLY_PLANS — One per intern per week
CREATE TABLE IF NOT EXISTS weekly_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'submitted', 'reviewed', 'requires_changes')),
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewer_feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_intern_week UNIQUE (intern_id, week_start)
);

-- 7. WEEKLY_SUBMISSION_HISTORY — Preserves each submission/review cycle
CREATE TABLE IF NOT EXISTS weekly_submission_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_plan_id UUID NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
    action VARCHAR(30) NOT NULL
        CHECK (action IN ('submitted', 'reviewed', 'changes_requested', 'resubmitted')),
    actor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Extend notifications type CHECK to include project and weekly
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
    CHECK (type IN ('task', 'attendance', 'leave', 'system', 'message', 'application', 'project', 'weekly'));

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_creator ON projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_projects_supervisor ON projects(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_intern ON project_members(intern_id);
CREATE INDEX IF NOT EXISTS idx_project_approval_project ON project_approval_history(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON project_milestones(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_week_start ON tasks(week_start);
CREATE INDEX IF NOT EXISTS idx_tasks_source ON tasks(task_source);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_intern ON weekly_plans(intern_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_week ON weekly_plans(week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_status ON weekly_plans(status);
CREATE INDEX IF NOT EXISTS idx_weekly_history_plan ON weekly_submission_history(weekly_plan_id);

-- TRIGGERS
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_milestones_updated_at ON project_milestones;
CREATE TRIGGER update_milestones_updated_at
    BEFORE UPDATE ON project_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_weekly_plans_updated_at ON weekly_plans;
CREATE TRIGGER update_weekly_plans_updated_at
    BEFORE UPDATE ON weekly_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
