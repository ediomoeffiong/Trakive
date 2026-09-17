-- 004_default_test_users.sql: Default test accounts for CWG PLC and FifthLab with full user details

DO $$
DECLARE
    v_fifthlab_id UUID;
    v_cwg_id UUID;
    v_intern_role UUID;
    v_sup_role UUID;
    v_hr_role UUID;
    v_head_role UUID;
    v_admin_role UUID;
    v_pass_hash TEXT := '$2b$10$NXusR0Tb8VWYwIIy7IG75.y8K/kHdmKvfUvI64HBex/HWGa/pcAua'; -- Password123!
    v_intern_user UUID;
    v_sup_user UUID;
    v_hr_user UUID;
    v_head_user UUID;
    v_admin_user UUID;
    v_dept_id UUID;
BEGIN
    INSERT INTO organizations (name, slug, domain)
    VALUES
      ('FifthLab', 'fifthlab', 'thefifthlab.com'),
      ('CWG PLC', 'cwg-plc', 'cwg-plc.com')
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      domain = EXCLUDED.domain,
      updated_at = NOW();

    INSERT INTO roles (name, description, is_system) VALUES
      ('super_admin', 'System Super Administrator with full platform control', true),
      ('org_admin', 'Organization Administrator with full organization control', true),
      ('department_head', 'Department Head managing departmental teams and interns', true),
      ('supervisor', 'Supervisor assigned to guide and assess specific interns', true),
      ('intern', 'Intern participating in internship programs', true)
    ON CONFLICT (name) DO NOTHING;

    SELECT id INTO v_fifthlab_id FROM organizations WHERE slug = 'fifthlab' OR domain = 'thefifthlab.com' LIMIT 1;
    SELECT id INTO v_cwg_id FROM organizations WHERE slug = 'cwg-plc' OR domain = 'cwg-plc.com' LIMIT 1;

    SELECT id INTO v_intern_role FROM roles WHERE name = 'intern' LIMIT 1;
    SELECT id INTO v_sup_role FROM roles WHERE name = 'supervisor' LIMIT 1;
    SELECT id INTO v_hr_role FROM roles WHERE name IN ('hr', 'org_admin') LIMIT 1;
    SELECT id INTO v_head_role FROM roles WHERE name IN ('department_head', 'head') LIMIT 1;
    SELECT id INTO v_admin_role FROM roles WHERE name IN ('super_admin', 'admin', 'org_admin') LIMIT 1;

    INSERT INTO departments (organization_id, name, code, description)
    VALUES (v_fifthlab_id, 'FifthLab', 'FIFTHLAB', 'FifthLab Venture Lab')
    ON CONFLICT (organization_id, name) DO NOTHING;

    SELECT id INTO v_dept_id
    FROM departments
    WHERE organization_id = v_fifthlab_id AND name = 'FifthLab'
    LIMIT 1;

    -- 1. Intern (Ediomo Effiong @thefifthlab.com)
    INSERT INTO users (
        organization_id, department_id, role_id, email, password_hash,
        first_name, last_name, avatar_url, bio, status, is_email_verified
    )
    VALUES (
        v_fifthlab_id, v_dept_id, v_intern_role, 'intern@thefifthlab.com', v_pass_hash,
        'Ediomo', 'Effiong',
        'https://media.licdn.com/dms/image/v2/D4E03AQHi3ZYYUFg3BA/profile-displayphoto-scale_200_200/B4EZn2pX4JIQAY-/0/1760779700254?e=2147483647&v=beta&t=m2VcejF7Sc7-T5m2cldFz4lrewoSSMY6HyHc63NBtkM',
        'Software Engineering Intern focused on frontend performance.',
        'active', true
    )
    ON CONFLICT (email) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        department_id = EXCLUDED.department_id,
        role_id = EXCLUDED.role_id,
        password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        avatar_url = EXCLUDED.avatar_url,
        bio = EXCLUDED.bio,
        status = 'active',
        is_email_verified = true;

    SELECT id INTO v_intern_user FROM users WHERE email = 'intern@thefifthlab.com';

    -- 2. Supervisor (Tochukwu Mgbemena @thefifthlab.com)
    INSERT INTO users (
        organization_id, department_id, role_id, email, password_hash,
        first_name, last_name, avatar_url, bio, status, is_email_verified
    )
    VALUES (
        v_fifthlab_id, v_dept_id, v_sup_role, 'supervisor@thefifthlab.com', v_pass_hash,
        'Tochukwu', 'Mgbemena',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp5OZN_RzRJQ2uE0wMl4jfA5IjbH8B6S9IJaY9tRUBLQ&s=10',
        'Senior Project Manager & Lead.',
        'active', true
    )
    ON CONFLICT (email) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        department_id = EXCLUDED.department_id,
        role_id = EXCLUDED.role_id,
        password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        avatar_url = EXCLUDED.avatar_url,
        bio = EXCLUDED.bio,
        status = 'active',
        is_email_verified = true;

    SELECT id INTO v_sup_user FROM users WHERE email = 'supervisor@thefifthlab.com';

    INSERT INTO supervisor_profiles (user_id, organization_id, department_id, title, specialization)
    VALUES (v_sup_user, v_fifthlab_id, v_dept_id, 'Lead Supervisor', 'General Management')
    ON CONFLICT (user_id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        department_id = EXCLUDED.department_id,
        title = EXCLUDED.title,
        updated_at = NOW();

    INSERT INTO intern_profiles (user_id, organization_id, department_id, supervisor_id, status)
    VALUES (v_intern_user, v_fifthlab_id, v_dept_id, (SELECT id FROM supervisor_profiles WHERE user_id = v_sup_user LIMIT 1), 'onboarding')
    ON CONFLICT (user_id) DO UPDATE SET
        supervisor_id = EXCLUDED.supervisor_id,
        department_id = EXCLUDED.department_id,
        updated_at = NOW();

    INSERT INTO internship_records (
        user_id, internship_number, title, organization_id, department_id,
        supervisor_id, start_date, end_date, status, days_per_week
    )
    VALUES (
        v_intern_user, 1, 'Internship #1', v_fifthlab_id, v_dept_id,
        (SELECT id FROM supervisor_profiles WHERE user_id = v_sup_user LIMIT 1),
        CURRENT_DATE,
        (CURRENT_DATE + INTERVAL '6 months')::DATE,
        'onboarding',
        5
    )
    ON CONFLICT (user_id, internship_number) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        department_id = EXCLUDED.department_id,
        supervisor_id = EXCLUDED.supervisor_id,
        start_date = LEAST(internship_records.start_date, EXCLUDED.start_date),
        end_date = GREATEST(internship_records.end_date, EXCLUDED.end_date),
        status = CASE
            WHEN internship_records.status IN ('active', 'onboarding') THEN internship_records.status
            ELSE 'onboarding'
        END,
        updated_at = NOW();

    -- Ensure every existing FifthLab intern defaults to Tochukwu unless explicitly assigned elsewhere.
    UPDATE users u
    SET department_id = v_dept_id,
        updated_at = NOW()
    WHERE u.organization_id = v_fifthlab_id
      AND u.email LIKE '%@thefifthlab.com'
      AND u.role_id = v_intern_role
      AND u.department_id IS NULL;

    UPDATE intern_profiles ip
    SET department_id = COALESCE(ip.department_id, v_dept_id),
        supervisor_id = COALESCE(ip.supervisor_id, (SELECT id FROM supervisor_profiles WHERE user_id = v_sup_user LIMIT 1)),
        updated_at = NOW()
    WHERE ip.organization_id = v_fifthlab_id
      AND (ip.department_id IS NULL OR ip.department_id = v_dept_id)
      AND ip.supervisor_id IS NULL;

    -- 3. HR Administrator (Tinu Adeyemi @cwg-plc.com)
    INSERT INTO users (
        organization_id, role_id, email, password_hash,
        first_name, last_name, avatar_url, bio, status, is_email_verified
    )
    VALUES (
        v_cwg_id, v_hr_role, 'hr@cwg-plc.com', v_pass_hash,
        'Tinu', 'Adeyemi',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOJU2OaNdLSLyJcEAW9WkK8QGGIy2WMqoIQR37JijSnw&s=10',
        'Lead Talents Ops Coordinator.',
        'active', true
    )
    ON CONFLICT (email) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        role_id = EXCLUDED.role_id,
        password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        avatar_url = EXCLUDED.avatar_url,
        bio = EXCLUDED.bio,
        status = 'active',
        is_email_verified = true;

    -- 4. Department Head (Moradeke Akintola @cwg-plc.com)
    INSERT INTO users (
        organization_id, role_id, email, password_hash,
        first_name, last_name, avatar_url, bio, status, is_email_verified
    )
    VALUES (
        v_cwg_id, v_head_role, 'head@cwg-plc.com', v_pass_hash,
        'Moradeke', 'Akintola',
        'https://media.licdn.com/dms/image/v2/C4E03AQE9cuYESnpQ-g/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1517532620864?e=2147483647&v=beta&t=e52Dy0Qfu0GcbSIIlxlwbUdKKryeHHHWoDrDt6lM83Q',
        'Head of Product Design & Research.',
        'active', true
    )
    ON CONFLICT (email) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        role_id = EXCLUDED.role_id,
        password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        avatar_url = EXCLUDED.avatar_url,
        bio = EXCLUDED.bio,
        status = 'active',
        is_email_verified = true;

    -- 5. Admin (CWG Admin @cwg-plc.com)
    INSERT INTO users (
        organization_id, role_id, email, password_hash,
        first_name, last_name, status, is_email_verified
    )
    VALUES (v_cwg_id, v_admin_role, 'admin@cwg-plc.com', v_pass_hash, 'CWG', 'Admin', 'active', true)
    ON CONFLICT (email) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        role_id = EXCLUDED.role_id,
        password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        status = 'active',
        is_email_verified = true;

END $$;
