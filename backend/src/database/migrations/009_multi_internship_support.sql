-- Migration 009: Multi-Internship Support & Internship Records
-- Support multiple internship periods per intern while preserving existing data.

-- 1. Create INTERNSHIP_RECORDS table
CREATE TABLE IF NOT EXISTS internship_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    internship_number INTEGER NOT NULL DEFAULT 1 CHECK (internship_number >= 1),
    title VARCHAR(255) NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    supervisor_id UUID REFERENCES supervisor_profiles(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active'
        CHECK (status IN ('onboarding', 'active', 'completed', 'terminated', 'paused')),
    work_location VARCHAR(255),
    work_hours VARCHAR(100),
    days_per_week INTEGER DEFAULT 5 CHECK (days_per_week >= 0 AND days_per_week <= 7),
    final_summary JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_internship_number UNIQUE (user_id, internship_number),
    CONSTRAINT check_internship_record_dates CHECK (end_date >= start_date)
);

-- Indexes for internship_records
CREATE INDEX IF NOT EXISTS idx_internship_records_user ON internship_records(user_id);
CREATE INDEX IF NOT EXISTS idx_internship_records_org ON internship_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_internship_records_dept ON internship_records(department_id);
CREATE INDEX IF NOT EXISTS idx_internship_records_supervisor ON internship_records(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_internship_records_status ON internship_records(status);
CREATE INDEX IF NOT EXISTS idx_internship_records_dates ON internship_records(start_date, end_date);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_internship_records_updated_at ON internship_records;
CREATE TRIGGER update_internship_records_updated_at
    BEFORE UPDATE ON internship_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Add internship_record_id foreign key to task/project/report/weekly/attendance/leave tables
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS internship_record_id UUID REFERENCES internship_records(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS internship_record_id UUID REFERENCES internship_records(id) ON DELETE SET NULL;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS internship_record_id UUID REFERENCES internship_records(id) ON DELETE SET NULL;
ALTER TABLE weekly_plans ADD COLUMN IF NOT EXISTS internship_record_id UUID REFERENCES internship_records(id) ON DELETE SET NULL;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS internship_record_id UUID REFERENCES internship_records(id) ON DELETE SET NULL;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS internship_record_id UUID REFERENCES internship_records(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_internship_record ON tasks(internship_record_id);
CREATE INDEX IF NOT EXISTS idx_projects_internship_record ON projects(internship_record_id);
CREATE INDEX IF NOT EXISTS idx_reports_internship_record ON reports(internship_record_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_internship_record ON weekly_plans(internship_record_id);
CREATE INDEX IF NOT EXISTS idx_attendance_internship_record ON attendance(internship_record_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_internship_record ON leave_requests(internship_record_id);

-- 3. Data Migration: Automatically create Internship #1 for existing intern profiles
DO $$
DECLARE
    rec RECORD;
    new_record_id UUID;
    user_start_date DATE;
    user_end_date DATE;
BEGIN
    FOR rec IN 
        SELECT ip.id AS profile_id, ip.user_id, ip.organization_id, ip.department_id, 
               ip.supervisor_id, ip.status AS profile_status, ip.work_location, ip.work_hours, ip.days_per_week,
               u.created_at AS user_created
        FROM intern_profiles ip
        JOIN users u ON u.id = ip.user_id
    LOOP
        -- Check if an internship_record already exists for this user
        IF NOT EXISTS (SELECT 1 FROM internship_records WHERE user_id = rec.user_id AND internship_number = 1) THEN
            user_start_date := rec.user_created::DATE;
            user_end_date := (rec.user_created + INTERVAL '6 months')::DATE;

            INSERT INTO internship_records (
                user_id, internship_number, title, organization_id, department_id,
                supervisor_id, start_date, end_date, status, work_location, work_hours, days_per_week
            )
            VALUES (
                rec.user_id,
                1,
                'Internship #1',
                rec.organization_id,
                rec.department_id,
                rec.supervisor_id,
                user_start_date,
                user_end_date,
                CASE WHEN rec.profile_status IN ('onboarding', 'active', 'completed', 'terminated', 'paused') THEN rec.profile_status ELSE 'active' END,
                rec.work_location,
                rec.work_hours,
                COALESCE(rec.days_per_week, 5)
            )
            RETURNING id INTO new_record_id;

            -- Backfill tasks
            UPDATE tasks SET internship_record_id = new_record_id WHERE assignee_id = rec.user_id AND internship_record_id IS NULL;
            -- Backfill reports
            UPDATE reports SET internship_record_id = new_record_id WHERE intern_id = rec.user_id AND internship_record_id IS NULL;
            -- Backfill weekly plans
            UPDATE weekly_plans SET internship_record_id = new_record_id WHERE intern_id = rec.user_id AND internship_record_id IS NULL;
            -- Backfill attendance
            UPDATE attendance SET internship_record_id = new_record_id WHERE intern_id = rec.user_id AND internship_record_id IS NULL;
            -- Backfill leave requests
            UPDATE leave_requests SET internship_record_id = new_record_id WHERE intern_id = rec.user_id AND internship_record_id IS NULL;
            -- Backfill projects
            UPDATE projects SET internship_record_id = new_record_id
            WHERE id IN (SELECT project_id FROM project_members WHERE intern_id = rec.user_id) AND internship_record_id IS NULL;
        END IF;
    END LOOP;
END $$;
