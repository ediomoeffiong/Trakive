-- Day 4: Database Schema Enhancements for Users, Interns & Onboarding Workflow

-- 1. Add head_user_id to departments table
ALTER TABLE departments ADD COLUMN IF NOT EXISTS head_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- 2. Update status constraint on internship_applications table
ALTER TABLE internship_applications DROP CONSTRAINT IF EXISTS internship_applications_status_check;
ALTER TABLE internship_applications ADD CONSTRAINT internship_applications_status_check 
  CHECK (status IN ('applied', 'pending_review', 'under_review', 'accepted', 'approved', 'rejected', 'account_created', 'onboarding_in_progress', 'onboarding_completed', 'completed', 'terminated'));

-- 3. Add index for department head lookup
CREATE INDEX IF NOT EXISTS idx_departments_head_user ON departments(head_user_id);
