-- Migration 006: Supervisor Assignments and History Tracking

CREATE TABLE IF NOT EXISTS supervisor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_profile_id UUID NOT NULL REFERENCES intern_profiles(id) ON DELETE CASCADE,
    supervisor_id UUID REFERENCES supervisor_profiles(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'reassignment_required')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sup_assign_intern ON supervisor_assignments(intern_profile_id);
CREATE INDEX IF NOT EXISTS idx_sup_assign_supervisor ON supervisor_assignments(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_sup_assign_status ON supervisor_assignments(status);

DROP TRIGGER IF EXISTS update_supervisor_assignments_updated_at ON supervisor_assignments;
CREATE TRIGGER update_supervisor_assignments_updated_at 
BEFORE UPDATE ON supervisor_assignments 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
