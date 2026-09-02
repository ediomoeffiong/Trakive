-- Seed default Super Admin user account if missing

DO $$
DECLARE
    v_org_id UUID;
    v_role_id UUID;
    v_user_id UUID;
BEGIN
    -- Get or create default organization
    SELECT id INTO v_org_id FROM organizations LIMIT 1;
    IF v_org_id IS NULL THEN
        INSERT INTO organizations (name, slug)
        VALUES ('Trakive Organization', 'trakive-org')
        RETURNING id INTO v_org_id;
    END IF;

    -- Get super_admin role ID
    SELECT id INTO v_role_id FROM roles WHERE name = 'super_admin';

    -- Insert default super admin user if not already present
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'superadmin@trakive.com') THEN
        INSERT INTO users (
            organization_id, role_id, email, password_hash,
            first_name, last_name, status, is_email_verified
        )
        VALUES (
            v_org_id, v_role_id, 'superadmin@trakive.com',
            '$2b$10$AurBCh/xgTxcIx0jax3yqOcGymgVg8VnBtpfvV1E8HW3Q7QrzNONy',
            'Super', 'Admin', 'active', true
        );
    END IF;
END $$;
