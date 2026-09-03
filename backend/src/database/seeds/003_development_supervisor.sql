-- Development/test supervisor account for local portal verification.

DO $$
DECLARE
    v_org_id UUID;
    v_role_id UUID;
    v_user_id UUID;
BEGIN
    SELECT id INTO v_org_id FROM organizations ORDER BY created_at LIMIT 1;
    SELECT id INTO v_role_id FROM roles WHERE name = 'supervisor';

    INSERT INTO users (
        organization_id, role_id, email, password_hash,
        first_name, last_name, status, is_email_verified
    )
    VALUES (
        v_org_id, v_role_id, 'supervisor@trakive.com',
        '$2b$10$Xf4KCf2GUmWaFWWdXN4yJO74HU1pZ5U2IJVHAiM8nlg33B9Amx2ii',
        'Dev', 'Supervisor', 'active', true
    )
    ON CONFLICT (email) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        role_id = EXCLUDED.role_id,
        password_hash = EXCLUDED.password_hash,
        status = 'active',
        is_email_verified = true;

    SELECT id INTO v_user_id FROM users WHERE email = 'supervisor@trakive.com';

    INSERT INTO supervisor_profiles (user_id, organization_id, title, specialization)
    VALUES (v_user_id, v_org_id, 'Development Supervisor', 'General')
    ON CONFLICT (user_id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        title = EXCLUDED.title,
        specialization = EXCLUDED.specialization,
        updated_at = NOW();
END $$;