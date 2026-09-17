-- Migration 014: Location-based attendance, schedules, holidays, corrections, scoring
-- All statements are idempotent (migrate.js re-runs every SQL file).

-- ---------------------------------------------------------------------------
-- Permissions (configure/correct/export for supervisors; keep intern check-in)
-- ---------------------------------------------------------------------------
INSERT INTO permissions (name, module, description) VALUES
('attendance:configure', 'attendance', 'Configure offices, schedules, holidays and attendance policy'),
('attendance:correct', 'attendance', 'Manually create or correct attendance records')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('attendance:configure', 'attendance:correct', 'attendance:export', 'attendance:verify')
WHERE r.name IN ('super_admin', 'org_admin', 'department_head', 'supervisor')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Office locations (org-scoped; IT/admin can take over later via permissions)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS office_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    address TEXT,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    radius_m INTEGER NOT NULL DEFAULT 200 CHECK (radius_m > 0 AND radius_m <= 5000),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_office_locations_org ON office_locations(organization_id) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- Org attendance policy (timezone, arrival, grace). Arrival time is org-level only.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    timezone VARCHAR(80) NOT NULL DEFAULT 'Africa/Lagos',
    country_code CHAR(2) NOT NULL DEFAULT 'NG',
    required_arrival_time TIME NOT NULL DEFAULT '08:00',
    grace_minutes INTEGER NOT NULL DEFAULT 60 CHECK (grace_minutes >= 0 AND grace_minutes <= 240),
    default_radius_m INTEGER NOT NULL DEFAULT 200,
    max_accuracy_m INTEGER NOT NULL DEFAULT 200,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Department weekday schedules (ISO weekday 1=Mon ... 7=Sun). Default Tue–Thu.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS department_attendance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    weekdays INTEGER[] NOT NULL DEFAULT ARRAY[2, 3, 4],
    effective_from DATE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_dept_attendance_schedule UNIQUE (department_id)
);

CREATE INDEX IF NOT EXISTS idx_dept_att_sched_org ON department_attendance_schedules(organization_id);

-- ---------------------------------------------------------------------------
-- Temporary / date-range / individual overrides
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_schedule_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    scope_type VARCHAR(20) NOT NULL CHECK (scope_type IN ('department', 'intern')),
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    intern_id UUID REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    weekdays INTEGER[],
    kind VARCHAR(30) NOT NULL DEFAULT 'schedule'
        CHECK (kind IN (
            'schedule', 'remote', 'office_closed', 'company_event',
            'training', 'excused', 'non_working', 'required'
        )),
    reason TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_override_dates CHECK (end_date >= start_date),
    CONSTRAINT check_override_scope CHECK (
        (scope_type = 'department' AND department_id IS NOT NULL)
        OR (scope_type = 'intern' AND intern_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_att_overrides_org_dates ON attendance_schedule_overrides(organization_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_att_overrides_intern ON attendance_schedule_overrides(intern_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_att_overrides_dept ON attendance_schedule_overrides(department_id, start_date, end_date);

-- ---------------------------------------------------------------------------
-- Cached public holidays + organization-specific holidays
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public_holiday_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code CHAR(2) NOT NULL,
    holiday_date DATE NOT NULL,
    local_name VARCHAR(255) NOT NULL,
    english_name VARCHAR(255),
    provider VARCHAR(50) NOT NULL DEFAULT 'nager',
    raw JSONB DEFAULT '{}'::jsonb,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_public_holiday UNIQUE (country_code, holiday_date, local_name)
);

CREATE INDEX IF NOT EXISTS idx_public_holiday_cache_date ON public_holiday_cache(country_code, holiday_date);

CREATE TABLE IF NOT EXISTS organization_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    holiday_date DATE NOT NULL,
    name VARCHAR(255) NOT NULL,
    kind VARCHAR(30) NOT NULL DEFAULT 'org_holiday'
        CHECK (kind IN ('org_holiday', 'office_closed', 'company_event', 'training', 'non_working')),
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_holidays_org_date ON organization_holidays(organization_id, holiday_date);

-- ---------------------------------------------------------------------------
-- Performance component settings (attendance can be disabled / reweighted)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_performance_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    attendance_weight NUMERIC(4, 2) NOT NULL DEFAULT 0.30,
    task_weight NUMERIC(4, 2) NOT NULL DEFAULT 0.40,
    rating_weight NUMERIC(4, 2) NOT NULL DEFAULT 0.30,
    present_points NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    late_points NUMERIC(4, 2) NOT NULL DEFAULT 0.75,
    remote_points NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Extend attendance records
-- ---------------------------------------------------------------------------
ALTER TABLE attendance ALTER COLUMN status TYPE VARCHAR(32);

ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_status_check;
ALTER TABLE attendance ADD CONSTRAINT attendance_status_check
    CHECK (status IN (
        'present', 'late', 'absent', 'excused', 'remote',
        'public_holiday', 'non_workday', 'half_day',
        'pending_review', 'pending_correction'
    ));

ALTER TABLE attendance ADD COLUMN IF NOT EXISTS internship_record_id UUID REFERENCES internship_records(id) ON DELETE SET NULL;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS office_location_id UUID REFERENCES office_locations(id) ON DELETE SET NULL;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_in_lat NUMERIC(10, 7);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_in_lng NUMERIC(10, 7);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS location_accuracy_m NUMERIC(10, 2);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS distance_m NUMERIC(10, 2);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS source VARCHAR(30) NOT NULL DEFAULT 'geofence';
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30) DEFAULT 'pending';
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS verification_flags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS is_suspicious BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS schedule_snapshot JSONB DEFAULT '{}'::jsonb;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS client_meta JSONB DEFAULT '{}'::jsonb;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS correction_reason TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'attendance_source_check'
    ) THEN
        ALTER TABLE attendance ADD CONSTRAINT attendance_source_check
            CHECK (source IN ('geofence', 'manual', 'supervisor', 'system', 'correction'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_attendance_internship_date ON attendance(internship_record_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_org_date ON attendance(organization_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_suspicious ON attendance(organization_id) WHERE is_suspicious = TRUE;

-- ---------------------------------------------------------------------------
-- Dedicated attendance audit trail (plus existing audit_logs)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    attendance_id UUID REFERENCES attendance(id) ON DELETE CASCADE,
    intern_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    internship_record_id UUID REFERENCES internship_records(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    previous_value JSONB,
    new_value JSONB,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_att_audit_attendance ON attendance_audit_events(attendance_id);
CREATE INDEX IF NOT EXISTS idx_att_audit_intern ON attendance_audit_events(intern_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Intern correction / supervisor-review requests
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_correction_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    intern_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    internship_record_id UUID REFERENCES internship_records(id) ON DELETE SET NULL,
    attendance_id UUID REFERENCES attendance(id) ON DELETE SET NULL,
    request_date DATE NOT NULL,
    reason TEXT NOT NULL,
    location_state VARCHAR(40),
    client_lat NUMERIC(10, 7),
    client_lng NUMERIC(10, 7),
    client_accuracy_m NUMERIC(10, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewer_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_att_corr_org_status ON attendance_correction_requests(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_att_corr_intern ON attendance_correction_requests(intern_id, request_date);

-- ---------------------------------------------------------------------------
-- Notification types: keep existing + attendance already allowed
-- ---------------------------------------------------------------------------
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
    CHECK (type IN (
        'task', 'attendance', 'leave', 'system', 'message', 'application',
        'project', 'weekly', 'onboarding_submission', 'onboarding_review'
    ));

-- ---------------------------------------------------------------------------
-- Backfill policies / schedules / scoring for existing orgs and departments
-- ---------------------------------------------------------------------------
INSERT INTO attendance_policies (organization_id)
SELECT id FROM organizations WHERE deleted_at IS NULL
ON CONFLICT (organization_id) DO NOTHING;

INSERT INTO attendance_performance_settings (organization_id)
SELECT id FROM organizations WHERE deleted_at IS NULL
ON CONFLICT (organization_id) DO NOTHING;

INSERT INTO department_attendance_schedules (organization_id, department_id, weekdays)
SELECT d.organization_id, d.id, ARRAY[2, 3, 4]
FROM departments d
WHERE d.deleted_at IS NULL
ON CONFLICT (department_id) DO NOTHING;
