-- Migration 013: Standardize organization departments
-- Keep only the approved department set active in development and production.

DO $$
DECLARE
    org RECORD;
BEGIN
    FOR org IN SELECT id FROM organizations WHERE deleted_at IS NULL LOOP
        INSERT INTO departments (organization_id, name, code, description)
        VALUES
          (org.id, 'FifthLab', 'FIFTHLAB', 'FifthLab venture lab and internship programs.'),
          (org.id, 'Human Resources (HR)', 'HR', 'People operations, onboarding, and employee support.'),
          (org.id, 'IT Department', 'IT', 'Information technology support and administration.'),
          (org.id, 'IT Infrastructure', 'IT-INFRA', 'Infrastructure systems, endpoints, and internal platforms.'),
          (org.id, 'Networking', 'NET', 'Network operations, connectivity, and access management.'),
          (org.id, 'Data Centre', 'DC', 'Data centre operations and systems availability.')
        ON CONFLICT (organization_id, name)
        DO UPDATE SET
          code = EXCLUDED.code,
          description = COALESCE(departments.description, EXCLUDED.description),
          deleted_at = NULL,
          updated_at = NOW();
    END LOOP;
END $$;

WITH department_aliases AS (
    SELECT source.id AS source_id, target.id AS target_id
    FROM departments source
    JOIN departments target
      ON target.organization_id = source.organization_id
     AND target.deleted_at IS NULL
     AND target.name = CASE
        WHEN LOWER(source.name) IN ('fifth lab', 'fifthlab') THEN 'FifthLab'
        WHEN LOWER(source.name) IN ('hr', 'human resources') THEN 'Human Resources (HR)'
        WHEN LOWER(source.name) IN ('it', 'it support', 'information technology', 'it department') THEN 'IT Department'
        WHEN LOWER(source.name) IN ('infrastructure', 'it infrastructure') THEN 'IT Infrastructure'
        WHEN LOWER(source.name) IN ('network', 'networking') THEN 'Networking'
        WHEN LOWER(source.name) IN ('data center', 'data centre') THEN 'Data Centre'
        ELSE NULL
      END
    WHERE source.id <> target.id
)
UPDATE users u
SET department_id = da.target_id, updated_at = NOW()
FROM department_aliases da
WHERE u.department_id = da.source_id;

WITH department_aliases AS (
    SELECT source.id AS source_id, target.id AS target_id
    FROM departments source
    JOIN departments target
      ON target.organization_id = source.organization_id
     AND target.deleted_at IS NULL
     AND target.name = CASE
        WHEN LOWER(source.name) IN ('fifth lab', 'fifthlab') THEN 'FifthLab'
        WHEN LOWER(source.name) IN ('hr', 'human resources') THEN 'Human Resources (HR)'
        WHEN LOWER(source.name) IN ('it', 'it support', 'information technology', 'it department') THEN 'IT Department'
        WHEN LOWER(source.name) IN ('infrastructure', 'it infrastructure') THEN 'IT Infrastructure'
        WHEN LOWER(source.name) IN ('network', 'networking') THEN 'Networking'
        WHEN LOWER(source.name) IN ('data center', 'data centre') THEN 'Data Centre'
        ELSE NULL
      END
    WHERE source.id <> target.id
)
UPDATE intern_profiles ip
SET department_id = da.target_id, updated_at = NOW()
FROM department_aliases da
WHERE ip.department_id = da.source_id;

WITH department_aliases AS (
    SELECT source.id AS source_id, target.id AS target_id
    FROM departments source
    JOIN departments target
      ON target.organization_id = source.organization_id
     AND target.deleted_at IS NULL
     AND target.name = CASE
        WHEN LOWER(source.name) IN ('fifth lab', 'fifthlab') THEN 'FifthLab'
        WHEN LOWER(source.name) IN ('hr', 'human resources') THEN 'Human Resources (HR)'
        WHEN LOWER(source.name) IN ('it', 'it support', 'information technology', 'it department') THEN 'IT Department'
        WHEN LOWER(source.name) IN ('infrastructure', 'it infrastructure') THEN 'IT Infrastructure'
        WHEN LOWER(source.name) IN ('network', 'networking') THEN 'Networking'
        WHEN LOWER(source.name) IN ('data center', 'data centre') THEN 'Data Centre'
        ELSE NULL
      END
    WHERE source.id <> target.id
)
UPDATE supervisor_profiles sp
SET department_id = da.target_id, updated_at = NOW()
FROM department_aliases da
WHERE sp.department_id = da.source_id;

WITH department_aliases AS (
    SELECT source.id AS source_id, target.id AS target_id
    FROM departments source
    JOIN departments target
      ON target.organization_id = source.organization_id
     AND target.deleted_at IS NULL
     AND target.name = CASE
        WHEN LOWER(source.name) IN ('fifth lab', 'fifthlab') THEN 'FifthLab'
        WHEN LOWER(source.name) IN ('hr', 'human resources') THEN 'Human Resources (HR)'
        WHEN LOWER(source.name) IN ('it', 'it support', 'information technology', 'it department') THEN 'IT Department'
        WHEN LOWER(source.name) IN ('infrastructure', 'it infrastructure') THEN 'IT Infrastructure'
        WHEN LOWER(source.name) IN ('network', 'networking') THEN 'Networking'
        WHEN LOWER(source.name) IN ('data center', 'data centre') THEN 'Data Centre'
        ELSE NULL
      END
    WHERE source.id <> target.id
)
UPDATE head_profiles hp
SET department_id = da.target_id, updated_at = NOW()
FROM department_aliases da
WHERE hp.department_id = da.source_id;

WITH department_aliases AS (
    SELECT source.id AS source_id, target.id AS target_id
    FROM departments source
    JOIN departments target
      ON target.organization_id = source.organization_id
     AND target.deleted_at IS NULL
     AND target.name = CASE
        WHEN LOWER(source.name) IN ('fifth lab', 'fifthlab') THEN 'FifthLab'
        WHEN LOWER(source.name) IN ('hr', 'human resources') THEN 'Human Resources (HR)'
        WHEN LOWER(source.name) IN ('it', 'it support', 'information technology', 'it department') THEN 'IT Department'
        WHEN LOWER(source.name) IN ('infrastructure', 'it infrastructure') THEN 'IT Infrastructure'
        WHEN LOWER(source.name) IN ('network', 'networking') THEN 'Networking'
        WHEN LOWER(source.name) IN ('data center', 'data centre') THEN 'Data Centre'
        ELSE NULL
      END
    WHERE source.id <> target.id
)
UPDATE internships i
SET department_id = da.target_id, updated_at = NOW()
FROM department_aliases da
WHERE i.department_id = da.source_id;

WITH department_aliases AS (
    SELECT source.id AS source_id, target.id AS target_id
    FROM departments source
    JOIN departments target
      ON target.organization_id = source.organization_id
     AND target.deleted_at IS NULL
     AND target.name = CASE
        WHEN LOWER(source.name) IN ('fifth lab', 'fifthlab') THEN 'FifthLab'
        WHEN LOWER(source.name) IN ('hr', 'human resources') THEN 'Human Resources (HR)'
        WHEN LOWER(source.name) IN ('it', 'it support', 'information technology', 'it department') THEN 'IT Department'
        WHEN LOWER(source.name) IN ('infrastructure', 'it infrastructure') THEN 'IT Infrastructure'
        WHEN LOWER(source.name) IN ('network', 'networking') THEN 'Networking'
        WHEN LOWER(source.name) IN ('data center', 'data centre') THEN 'Data Centre'
        ELSE NULL
      END
    WHERE source.id <> target.id
)
UPDATE tasks t
SET department_id = da.target_id, updated_at = NOW()
FROM department_aliases da
WHERE t.department_id = da.source_id;

UPDATE departments
SET deleted_at = COALESCE(deleted_at, NOW()), updated_at = NOW()
WHERE name NOT IN (
  'FifthLab',
  'Human Resources (HR)',
  'IT Department',
  'IT Infrastructure',
  'Networking',
  'Data Centre'
);
