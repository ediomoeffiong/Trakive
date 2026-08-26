-- Day 9 Migration: Indexes for Search, Audit Logging & Automations

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);

CREATE INDEX IF NOT EXISTS idx_tasks_search ON tasks(organization_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_attendance_search ON attendance(organization_id, status, date);
CREATE INDEX IF NOT EXISTS idx_leave_search ON leave_requests(organization_id, status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_documents_search ON documents(organization_id, category, created_at);
