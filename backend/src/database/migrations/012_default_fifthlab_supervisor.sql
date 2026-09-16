-- Migration 012: Default FifthLab interns to Tochukwu Mgbemena when no supervisor is set.

DO $$
DECLARE
    v_fifthlab_id UUID;
    v_fifthlab_dept_id UUID;
    v_tochukwu_supervisor_id UUID;
BEGIN
    SELECT id INTO v_fifthlab_id
    FROM organizations
    WHERE slug = 'fifthlab' OR domain = 'thefifthlab.com'
    LIMIT 1;

    IF v_fifthlab_id IS NULL THEN
        RETURN;
    END IF;

    SELECT id INTO v_fifthlab_dept_id
    FROM departments
    WHERE organization_id = v_fifthlab_id AND name = 'FifthLab'
    LIMIT 1;

    SELECT sp.id INTO v_tochukwu_supervisor_id
    FROM supervisor_profiles sp
    JOIN users u ON u.id = sp.user_id
    WHERE u.organization_id = v_fifthlab_id
      AND u.status = 'active'
      AND u.deleted_at IS NULL
      AND (
        LOWER(u.email) IN ('tochukwu.mgbemena@thefifthlab.com', 'supervisor@thefifthlab.com')
        OR (LOWER(u.first_name) = 'tochukwu' AND LOWER(u.last_name) IN ('mgbemena', 'mgbemmena'))
      )
    ORDER BY
      (sp.department_id = v_fifthlab_dept_id) DESC,
      (LOWER(u.email) = 'tochukwu.mgbemena@thefifthlab.com') DESC,
      sp.created_at ASC
    LIMIT 1;

    IF v_tochukwu_supervisor_id IS NULL THEN
        RETURN;
    END IF;

    UPDATE users u
    SET department_id = COALESCE(u.department_id, v_fifthlab_dept_id),
        updated_at = NOW()
    WHERE u.organization_id = v_fifthlab_id
      AND u.email LIKE '%@thefifthlab.com'
      AND u.deleted_at IS NULL
      AND EXISTS (
        SELECT 1 FROM roles r WHERE r.id = u.role_id AND r.name = 'intern'
      );

    UPDATE intern_profiles ip
    SET department_id = COALESCE(ip.department_id, v_fifthlab_dept_id),
        supervisor_id = COALESCE(ip.supervisor_id, v_tochukwu_supervisor_id),
        updated_at = NOW()
    WHERE ip.organization_id = v_fifthlab_id
      AND (ip.department_id IS NULL OR ip.department_id = v_fifthlab_dept_id)
      AND ip.supervisor_id IS NULL;

    INSERT INTO supervisor_assignments (intern_profile_id, supervisor_id, assigned_by, status, notes)
    SELECT ip.id, v_tochukwu_supervisor_id, NULL, 'active', 'Backfilled default FifthLab supervisor'
    FROM intern_profiles ip
    WHERE ip.organization_id = v_fifthlab_id
      AND ip.department_id = v_fifthlab_dept_id
      AND ip.supervisor_id = v_tochukwu_supervisor_id
      AND NOT EXISTS (
        SELECT 1
        FROM supervisor_assignments sa
        WHERE sa.intern_profile_id = ip.id
          AND sa.supervisor_id = v_tochukwu_supervisor_id
          AND sa.status = 'active'
      );
END $$;
