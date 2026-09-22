-- Migration 019: Associate Documents with Internship Records
-- Enables multi-internship support for onboarding documents and history preservation.

ALTER TABLE documents ADD COLUMN IF NOT EXISTS internship_record_id UUID REFERENCES internship_records(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_documents_internship_record ON documents(internship_record_id);

-- Backfill existing documents to the owner's first internship record if available
DO $$
DECLARE
    r RECORD;
    target_record_id UUID;
BEGIN
    FOR r IN SELECT DISTINCT owner_id FROM documents WHERE internship_record_id IS NULL AND owner_id IS NOT NULL LOOP
        SELECT id INTO target_record_id 
        FROM internship_records 
        WHERE user_id = r.owner_id 
        ORDER BY internship_number ASC 
        LIMIT 1;

        IF target_record_id IS NOT NULL THEN
            UPDATE documents 
            SET internship_record_id = target_record_id 
            WHERE owner_id = r.owner_id AND internship_record_id IS NULL;
        END IF;
    END LOOP;
END $$;
