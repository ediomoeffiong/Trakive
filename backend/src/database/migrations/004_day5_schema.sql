-- Day 5: Database Schema Enhancements for Tasks, Submissions, Reviews & Activity History

-- 1. Update status constraint on tasks table
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('draft', 'todo', 'assigned', 'in_progress', 'submitted', 'in_review', 'under_review', 'approved', 'completed', 'rejected', 'resubmitted', 'revision_requested'));

-- 2. Update status constraint on task_submissions table
ALTER TABLE task_submissions DROP CONSTRAINT IF EXISTS task_submissions_status_check;
ALTER TABLE task_submissions ADD CONSTRAINT task_submissions_status_check 
  CHECK (status IN ('pending_review', 'submitted', 'resubmitted', 'approved', 'revision_requested', 'rejected'));

-- 3. Create task_activities table for history tracking
CREATE TABLE IF NOT EXISTS task_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(50) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create indexes for task_activities
CREATE INDEX IF NOT EXISTS idx_task_activities_task ON task_activities(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activities_actor ON task_activities(actor_id);
CREATE INDEX IF NOT EXISTS idx_task_activities_action ON task_activities(action);
