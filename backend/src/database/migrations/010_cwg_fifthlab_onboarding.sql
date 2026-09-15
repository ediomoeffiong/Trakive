-- Migration 010: CWG PLC / FifthLab Onboarding Support

-- 1. Ensure FifthLab and CWG PLC organizations exist
INSERT INTO organizations (name, slug, domain)
VALUES 
  ('FifthLab', 'fifthlab', 'thefifthlab.com'),
  ('CWG PLC', 'cwg-plc', 'cwg-plc.com')
ON CONFLICT (slug) DO UPDATE 
SET domain = EXCLUDED.domain;

-- 2. Ensure departments exist for FifthLab and CWG PLC
DO $$
DECLARE
    v_fifthlab_id UUID;
    v_cwg_id UUID;
BEGIN
    SELECT id INTO v_fifthlab_id FROM organizations WHERE slug = 'fifthlab' LIMIT 1;
    SELECT id INTO v_cwg_id FROM organizations WHERE slug = 'cwg-plc' LIMIT 1;

    -- Update departments with legacy org to fifthlab if any
    UPDATE departments SET organization_id = v_fifthlab_id WHERE organization_id NOT IN (v_fifthlab_id, v_cwg_id);

    -- Insert standard departments for FifthLab
    INSERT INTO departments (organization_id, name, code, description)
    VALUES 
      (v_fifthlab_id, 'Engineering', 'ENG', 'Engineering & Software Development'),
      (v_fifthlab_id, 'Product & Design', 'DES', 'Product Management & UI/UX Design'),
      (v_fifthlab_id, 'Human Resources', 'HR', 'People & Culture')
    ON CONFLICT (organization_id, name) DO NOTHING;

    -- Insert standard departments for CWG PLC
    INSERT INTO departments (organization_id, name, code, description)
    VALUES 
      (v_cwg_id, 'Engineering', 'ENG', 'Engineering & IT Infrastructure'),
      (v_cwg_id, 'Operations', 'OPS', 'Business Operations'),
      (v_cwg_id, 'Human Resources', 'HR', 'People & Culture')
    ON CONFLICT (organization_id, name) DO NOTHING;
END $$;

-- 3. Update existing test accounts and supervisor profiles to matching orgs
UPDATE users
SET email = REPLACE(email, '@trakive.com', '@thefifthlab.com'),
    organization_id = (SELECT id FROM organizations WHERE slug = 'fifthlab' LIMIT 1)
WHERE email LIKE '%@trakive.com' OR email LIKE '%@thefifthlab.com';

UPDATE users
SET organization_id = (SELECT id FROM organizations WHERE slug = 'cwg-plc' LIMIT 1)
WHERE email LIKE '%@cwg-plc.com';

UPDATE supervisor_profiles sp
SET organization_id = u.organization_id
FROM users u
WHERE sp.user_id = u.id AND u.organization_id IS NOT NULL;

-- 3. Update documents category check constraint and add review columns
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_category_check;
ALTER TABLE documents ADD CONSTRAINT documents_category_check 
  CHECK (category IN ('resume', 'placement_letter', 'acceptance_letter', 'id_proof', 'agreement', 'report', 'submission', 'general'));

ALTER TABLE documents ADD COLUMN IF NOT EXISTS review_status VARCHAR(30) NOT NULL DEFAULT 'pending';
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_review_status_check;
ALTER TABLE documents ADD CONSTRAINT documents_review_status_check 
  CHECK (review_status IN ('pending', 'approved', 'rejected', 'resubmission_required'));

ALTER TABLE documents ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- 4. Create document_history table to preserve resubmission records
CREATE TABLE IF NOT EXISTS document_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    review_status VARCHAR(30) NOT NULL,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Expand notifications_type_check constraint to support onboarding types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('task', 'attendance', 'leave', 'system', 'message', 'application', 'onboarding_submission', 'onboarding_review'));

