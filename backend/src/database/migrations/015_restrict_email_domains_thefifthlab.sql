-- Migration 015: Restrict organization domain and user emails from fifthlab.com to thefifthlab.com
BEGIN;

-- 1. Ensure FifthLab organization domain is explicitly thefifthlab.com
UPDATE organizations
SET domain = 'thefifthlab.com'
WHERE slug = 'fifthlab' AND (domain = 'fifthlab.com' OR domain IS NULL);

-- 2. Update any legacy user email addresses with @fifthlab.com to @thefifthlab.com
UPDATE users
SET email = REPLACE(email, '@fifthlab.com', '@thefifthlab.com')
WHERE email LIKE '%@fifthlab.com';

COMMIT;
