-- Day 6: Schema Enhancements for Attendance, Leave & Activity

-- 1. Update attendance status constraint to include 'on_leave'
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_status_check;
ALTER TABLE attendance ADD CONSTRAINT attendance_status_check 
  CHECK (status IN ('present', 'absent', 'late', 'on_leave', 'half_day', 'excused'));

-- 2. Add work_duration_minutes column to attendance table
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS work_duration_minutes INTEGER DEFAULT 0;

-- 3. Indexes for fast lookup & filtering
CREATE INDEX IF NOT EXISTS idx_attendance_intern_date ON attendance(intern_id, date);
CREATE INDEX IF NOT EXISTS idx_leave_approved_range ON leave_requests(intern_id, status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_action ON audit_logs(entity_type, action);
