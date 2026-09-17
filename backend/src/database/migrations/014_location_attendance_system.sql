-- Migration 014: Location-Based Attendance System
-- Adds configurable offices, schedules, holidays, review requests, audit trail,
-- and geolocation verification metadata while preserving existing attendance.

ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_status_check;
ALTER TABLE attendance
  ADD CONSTRAINT attendance_status_check
  CHECK (status IN (
    'present', 'late', 'absent', 'excused', 'remote',
    'public_holiday', 'non_workday', 'pending_review', 'rejected'
  ));

ALTER TABLE attendance ADD COLUMN IF NOT EXISTS office_id UUID;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_in_latitude NUMERIC(10, 7);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_in_longitude NUMERIC(10, 7);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS accuracy_meters NUMERIC(10, 2);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS distance_meters NUMERIC(10, 2);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS verification_status VARCHAR(40) NOT NULL DEFAULT 'manual'
  CHECK (verification_status IN ('verified', 'outside_geofence', 'inaccurate', 'location_denied', 'unavailable', 'manual', 'pending_review', 'suspicious'));
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS verification_method VARCHAR(40) NOT NULL DEFAULT 'manual'
  CHECK (verification_method IN ('geolocation', 'manual', 'supervisor_override', 'system'));
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS verification_metadata JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS suspicious_flags JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS source VARCHAR(40) NOT NULL DEFAULT 'system'
  CHECK (source IN ('auto', 'manual', 'supervisor', 'system', 'correction'));
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_intern_attendance_date'
  ) THEN
    ALTER TABLE attendance DROP CONSTRAINT unique_intern_attendance_date;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS unique_attendance_internship_date
  ON attendance(internship_record_id, date)
  WHERE internship_record_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_attendance_intern_date_without_record
  ON attendance(intern_id, date)
  WHERE internship_record_id IS NULL;

CREATE TABLE IF NOT EXISTS attendance_offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 200 CHECK (radius_meters > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT unique_attendance_office_name UNIQUE (organization_id, name)
);

CREATE TABLE IF NOT EXISTS attendance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  required_weekdays INTEGER[] NOT NULL DEFAULT ARRAY[2,3,4],
  arrival_time TIME NOT NULL DEFAULT '08:00',
  grace_minutes INTEGER NOT NULL DEFAULT 60 CHECK (grace_minutes >= 0),
  timezone VARCHAR(100) NOT NULL DEFAULT 'Africa/Lagos',
  attendance_score_enabled BOOLEAN NOT NULL DEFAULT true,
  attendance_score_weight NUMERIC(5,2) NOT NULL DEFAULT 30 CHECK (attendance_score_weight >= 0 AND attendance_score_weight <= 100),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_attendance_policy_department UNIQUE (organization_id, department_id)
);

CREATE TABLE IF NOT EXISTS attendance_schedule_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  intern_id UUID REFERENCES users(id) ON DELETE CASCADE,
  internship_record_id UUID REFERENCES internship_records(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  required BOOLEAN,
  status VARCHAR(40) CHECK (status IN ('remote', 'excused', 'public_holiday', 'non_workday')),
  reason TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_attendance_override_dates CHECK (end_date >= start_date),
  CONSTRAINT check_attendance_override_target CHECK (department_id IS NOT NULL OR intern_id IS NOT NULL OR internship_record_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS attendance_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  country_code CHAR(2) NOT NULL DEFAULT 'NG',
  date DATE NOT NULL,
  name VARCHAR(255) NOT NULL,
  source VARCHAR(80) NOT NULL DEFAULT 'manual',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_attendance_holiday UNIQUE (organization_id, country_code, date, name)
);

CREATE TABLE IF NOT EXISTS attendance_correction_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID REFERENCES attendance(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  intern_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  internship_record_id UUID REFERENCES internship_records(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  requested_status VARCHAR(40) CHECK (requested_status IN ('present', 'late', 'excused', 'remote')),
  reason TEXT NOT NULL,
  location_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewer_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  attendance_id UUID REFERENCES attendance(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(80) NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attendance_offices_org ON attendance_offices(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_attendance_policy_org_dept ON attendance_policies(organization_id, department_id);
CREATE UNIQUE INDEX IF NOT EXISTS unique_attendance_policy_global
  ON attendance_policies(organization_id)
  WHERE department_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_attendance_overrides_lookup ON attendance_schedule_overrides(organization_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_attendance_holidays_lookup ON attendance_holidays(country_code, date);
CREATE INDEX IF NOT EXISTS idx_attendance_corrections_status ON attendance_correction_requests(organization_id, status, date);
CREATE INDEX IF NOT EXISTS idx_attendance_audit_attendance ON attendance_audit_logs(attendance_id, created_at);
CREATE INDEX IF NOT EXISTS idx_attendance_office ON attendance(office_id);
CREATE INDEX IF NOT EXISTS idx_attendance_verification ON attendance(verification_status);

ALTER TABLE attendance
  DROP CONSTRAINT IF EXISTS attendance_office_fk,
  ADD CONSTRAINT attendance_office_fk
  FOREIGN KEY (office_id) REFERENCES attendance_offices(id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS update_attendance_offices_updated_at ON attendance_offices;
CREATE TRIGGER update_attendance_offices_updated_at
  BEFORE UPDATE ON attendance_offices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendance_policies_updated_at ON attendance_policies;
CREATE TRIGGER update_attendance_policies_updated_at
  BEFORE UPDATE ON attendance_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendance_schedule_overrides_updated_at ON attendance_schedule_overrides;
CREATE TRIGGER update_attendance_schedule_overrides_updated_at
  BEFORE UPDATE ON attendance_schedule_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendance_holidays_updated_at ON attendance_holidays;
CREATE TRIGGER update_attendance_holidays_updated_at
  BEFORE UPDATE ON attendance_holidays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendance_correction_requests_updated_at ON attendance_correction_requests;
CREATE TRIGGER update_attendance_correction_requests_updated_at
  BEFORE UPDATE ON attendance_correction_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
