const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const DEFAULT_PASSWORD = process.env.DEFAULT_TEST_PASSWORD || 'Password123!';
const DEFAULT_EMAILS = ['intern@thefifthlab.com', 'supervisor@thefifthlab.com'];

async function verifyDefaultAccounts() {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT
        u.email,
        u.password_hash,
        u.status,
        u.is_email_verified,
        r.name AS role_name,
        o.slug AS organization_slug,
        d.name AS department_name,
        sp.id AS supervisor_profile_id,
        ip.id AS intern_profile_id,
        sup_user.email AS assigned_supervisor_email
        ,
        ir.id AS active_internship_record_id,
        ir.status AS active_internship_status
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN organizations o ON o.id = u.organization_id
      LEFT JOIN departments d ON d.id = u.department_id
      LEFT JOIN supervisor_profiles sp ON sp.user_id = u.id
      LEFT JOIN intern_profiles ip ON ip.user_id = u.id
      LEFT JOIN supervisor_profiles assigned_sp ON assigned_sp.id = ip.supervisor_id
      LEFT JOIN users sup_user ON sup_user.id = assigned_sp.user_id
      LEFT JOIN internship_records ir ON ir.user_id = u.id AND ir.status IN ('active', 'onboarding')
      WHERE LOWER(u.email) = ANY($1)
        AND u.deleted_at IS NULL
      ORDER BY u.email;
      `,
      [DEFAULT_EMAILS]
    );

    const found = new Map(result.rows.map((row) => [row.email.toLowerCase(), row]));
    let ok = true;

    for (const email of DEFAULT_EMAILS) {
      const row = found.get(email);
      if (!row) {
        ok = false;
        console.error(`MISSING ${email}`);
        continue;
      }

      const passwordMatches = await bcrypt.compare(DEFAULT_PASSWORD, row.password_hash);
      const expectedRole = email.startsWith('intern@') ? 'intern' : 'supervisor';
      const hasProfile = expectedRole === 'intern' ? Boolean(row.intern_profile_id) : Boolean(row.supervisor_profile_id);
      const hasActiveInternship = expectedRole !== 'intern' || Boolean(row.active_internship_record_id);
      const accountOk =
        passwordMatches &&
        row.status === 'active' &&
        row.role_name === expectedRole &&
        row.organization_slug === 'fifthlab' &&
        hasProfile &&
        hasActiveInternship;

      if (!accountOk) ok = false;

      console.log(
        JSON.stringify(
          {
            email,
            ok: accountOk,
            passwordMatches,
            status: row.status,
            role: row.role_name,
            organization: row.organization_slug,
            department: row.department_name,
            emailVerified: row.is_email_verified,
            hasProfile,
            hasActiveInternship,
            activeInternshipStatus: row.active_internship_status || null,
            assignedSupervisor: row.assigned_supervisor_email || null,
          },
          null,
          2
        )
      );
    }

    if (!ok) {
      process.exitCode = 1;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  verifyDefaultAccounts().catch((error) => {
    console.error('Default account verification failed:', error.message);
    process.exit(1);
  });
}

module.exports = verifyDefaultAccounts;
