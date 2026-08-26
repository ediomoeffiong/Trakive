-- Day 8: Analytics & Performance Indexes

-- Additional performance indexes for frequent analytics filtering and aggregations
CREATE INDEX IF NOT EXISTS idx_tasks_dept ON tasks(department_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON task_submissions(status);
CREATE INDEX IF NOT EXISTS idx_task_reviews_rating ON task_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_attendance_check_in_out ON attendance(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_leave_type ON leave_requests(leave_type);
