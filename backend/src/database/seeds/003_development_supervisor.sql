-- Development/test supervisor account for local portal verification.

DO $$
DECLARE
    v_org_id UUID;
    v_dept_id UUID;
    v_role_id UUID;
    v_user_id UUID;
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE slug = 'fifthlab' OR domain = 'thefifthlab.com' LIMIT 1;
    SELECT id INTO v_role_id FROM roles WHERE name = 'supervisor';
    INSERT INTO departments (organization_id, name, code, description)
    VALUES (v_org_id, 'FifthLab', 'FIFTHLAB', 'FifthLab Venture Lab')
    ON CONFLICT (organization_id, name) DO NOTHING;
    SELECT id INTO v_dept_id FROM departments WHERE organization_id = v_org_id AND name = 'FifthLab' LIMIT 1;

    INSERT INTO users (
        organization_id, department_id, role_id, email, password_hash,
        first_name, last_name, status, is_email_verified
    )
    VALUES (
        v_org_id, v_dept_id, v_role_id, 'supervisor@thefifthlab.com',
        '$2b$10$NXusR0Tb8VWYwIIy7IG75.y8K/kHdmKvfUvI64HBex/HWGa/pcAua',
        'Tochukwu', 'Mgbemena', 'active', true
    )
    ON CONFLICT (email) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        department_id = EXCLUDED.department_id,
        role_id = EXCLUDED.role_id,
        password_hash = EXCLUDED.password_hash,
        status = 'active',
        is_email_verified = true;

    SELECT id INTO v_user_id FROM users WHERE email = 'supervisor@thefifthlab.com';

    INSERT INTO supervisor_profiles (user_id, organization_id, department_id, title, specialization)
    VALUES (v_user_id, v_org_id, v_dept_id, 'Lead Supervisor', 'FifthLab')
    ON CONFLICT (user_id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        department_id = EXCLUDED.department_id,
        title = EXCLUDED.title,
        specialization = EXCLUDED.specialization,
        updated_at = NOW();
END $$;
