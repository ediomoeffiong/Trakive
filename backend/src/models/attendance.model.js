const { query } = require('../config/db');

function buildAttendanceFilters({
  organization_id = null,
  search = '',
  status = '',
  intern_id = null,
  department_id = null,
  internship_record_id = null,
  office_location_id = null,
  start_date = null,
  end_date = null,
  suspicious = null,
  month = null,
  supervisor_profile_id = null,
}) {
  const whereClauses = [];
  const values = [];
  let idx = 1;

  if (organization_id) {
    whereClauses.push(`a.organization_id = $${idx}`);
    values.push(organization_id);
    idx += 1;
  }
  if (search) {
    whereClauses.push(`(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR a.notes ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx += 1;
  }
  if (status) {
    whereClauses.push(`a.status = $${idx}`);
    values.push(status);
    idx += 1;
  }
  if (intern_id) {
    whereClauses.push(`a.intern_id = $${idx}`);
    values.push(intern_id);
    idx += 1;
  }
  if (department_id) {
    whereClauses.push(`u.department_id = $${idx}`);
    values.push(department_id);
    idx += 1;
  }
  if (internship_record_id) {
    whereClauses.push(`a.internship_record_id = $${idx}`);
    values.push(internship_record_id);
    idx += 1;
  }
  if (office_location_id) {
    whereClauses.push(`a.office_location_id = $${idx}`);
    values.push(office_location_id);
    idx += 1;
  }
  if (start_date) {
    whereClauses.push(`a.date >= $${idx}`);
    values.push(start_date);
    idx += 1;
  }
  if (end_date) {
    whereClauses.push(`a.date <= $${idx}`);
    values.push(end_date);
    idx += 1;
  }
  if (month) {
    whereClauses.push(`TO_CHAR(a.date, 'YYYY-MM') = $${idx}`);
    values.push(month);
    idx += 1;
  }
  if (suspicious === true || suspicious === 'true') {
    whereClauses.push('a.is_suspicious = TRUE');
  }
  if (supervisor_profile_id) {
    whereClauses.push(`EXISTS (SELECT 1 FROM intern_profiles ip WHERE ip.user_id = a.intern_id AND ip.supervisor_id = $${idx})`);
    values.push(supervisor_profile_id);
    idx += 1;
  }

  return {
    whereSql: whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '',
    values,
    idx,
  };
}

const SELECT_SQL = `
  SELECT
    a.*,
    u.first_name AS intern_first_name,
    u.last_name AS intern_last_name,
    u.email AS intern_email,
    u.department_id,
    d.name AS department_name,
    ol.name AS office_name,
    ir.title AS internship_title,
    ir.internship_number
  FROM attendance a
  JOIN users u ON u.id = a.intern_id
  LEFT JOIN departments d ON d.id = u.department_id
  LEFT JOIN office_locations ol ON ol.id = a.office_location_id
  LEFT JOIN internship_records ir ON ir.id = a.internship_record_id
`;

const AttendanceModel = {
  async findByInternAndDate(internId, date) {
    const res = await query('SELECT * FROM attendance WHERE intern_id = $1 AND date = $2', [internId, date]);
    return res.rows[0] || null;
  },

  async findById(id) {
    const res = await query(`${SELECT_SQL} WHERE a.id = $1`, [id]);
    return res.rows[0] || null;
  },

  async findByInternship(internshipRecordId) {
    const res = await query(
      'SELECT * FROM attendance WHERE internship_record_id = $1 ORDER BY date ASC',
      [internshipRecordId]
    );
    return res.rows;
  },

  async listRecentForIntern(internId, limit = 10) {
    const res = await query(
      `SELECT id, date, check_in_lat, check_in_lng, location_accuracy_m
       FROM attendance
       WHERE intern_id = $1 AND check_in_lat IS NOT NULL
       ORDER BY date DESC
       LIMIT $2`,
      [internId, limit]
    );
    return res.rows;
  },

  async findPaginated(filters) {
    const { whereSql, values, idx } = buildAttendanceFilters(filters);
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    let orderBy = 'a.date DESC, a.created_at DESC';
    if (filters.sort) {
      const [col, dir] = String(filters.sort).split(':');
      const allowedCols = ['date', 'status', 'created_at', 'check_in'];
      const orderDir = dir && dir.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      if (allowedCols.includes(col)) orderBy = `a.${col} ${orderDir}`;
    }
    const sql = `
      ${SELECT_SQL}
      ${whereSql}
      ORDER BY ${orderBy}
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    const res = await query(sql, [...values, limit, offset]);
    return res.rows;
  },

  async count(filters) {
    const { whereSql, values } = buildAttendanceFilters(filters);
    const sql = `
      SELECT COUNT(a.id) as count
      FROM attendance a
      JOIN users u ON u.id = a.intern_id
      ${whereSql}
    `;
    const res = await query(sql, values);
    return parseInt(res.rows[0].count, 10);
  },

  async insert(data) {
    const sql = `
      INSERT INTO attendance (
        organization_id, intern_id, internship_record_id, date, check_in, check_out,
        status, notes, verified_by, office_location_id, check_in_lat, check_in_lng,
        location_accuracy_m, distance_m, source, verification_status, verification_flags,
        is_suspicious, schedule_snapshot, client_meta, correction_reason
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
      )
      RETURNING *
    `;
    const res = await query(sql, [
      data.organization_id,
      data.intern_id,
      data.internship_record_id || null,
      data.date,
      data.check_in || null,
      data.check_out || null,
      data.status,
      data.notes || null,
      data.verified_by || null,
      data.office_location_id || null,
      data.check_in_lat || null,
      data.check_in_lng || null,
      data.location_accuracy_m ?? null,
      data.distance_m ?? null,
      data.source || 'geofence',
      data.verification_status || 'pending',
      JSON.stringify(data.verification_flags || []),
      data.is_suspicious === true,
      JSON.stringify(data.schedule_snapshot || {}),
      JSON.stringify(data.client_meta || {}),
      data.correction_reason || null,
    ]);
    return res.rows[0];
  },

  async update(id, updates) {
    const allowed = [
      'status', 'notes', 'verified_by', 'check_in', 'office_location_id',
      'check_in_lat', 'check_in_lng', 'location_accuracy_m', 'distance_m',
      'source', 'verification_status', 'verification_flags', 'is_suspicious',
      'schedule_snapshot', 'client_meta', 'correction_reason', 'internship_record_id',
    ];
    const jsonFields = new Set(['verification_flags', 'schedule_snapshot', 'client_meta']);
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(jsonFields.has(key) ? JSON.stringify(updates[key]) : updates[key]);
        idx += 1;
      }
    }
    if (!fields.length) return this.findById(id);
    fields.push('updated_at = NOW()');
    values.push(id);
    const res = await query(
      `UPDATE attendance SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0] || null;
  },

  async upsertExcusedAttendance(organizationId, internId, date, notes = 'On Approved Leave') {
    const sql = `
      INSERT INTO attendance (organization_id, intern_id, date, status, notes, source, verification_status, schedule_snapshot)
      VALUES ($1, $2, $3, 'excused', $4, 'system', 'verified', '{"required":false,"kind":"excused"}'::jsonb)
      ON CONFLICT (intern_id, date)
      DO UPDATE SET status = 'excused', notes = EXCLUDED.notes, updated_at = NOW()
    `;
    await query(sql, [organizationId, internId, date, notes]);
  },

  async statusCounts(filters) {
    const { whereSql, values } = buildAttendanceFilters(filters);
    const sql = `
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE a.status = 'present')::int AS present,
        COUNT(*) FILTER (WHERE a.status = 'late')::int AS late,
        COUNT(*) FILTER (WHERE a.status = 'absent')::int AS absent,
        COUNT(*) FILTER (WHERE a.status = 'excused')::int AS excused,
        COUNT(*) FILTER (WHERE a.status = 'remote')::int AS remote,
        COUNT(*) FILTER (WHERE a.status IN ('pending_review','pending_correction'))::int AS pending,
        COUNT(*) FILTER (WHERE a.is_suspicious)::int AS suspicious
      FROM attendance a
      JOIN users u ON u.id = a.intern_id
      ${whereSql}
    `;
    const res = await query(sql, values);
    return res.rows[0];
  },
};

module.exports = AttendanceModel;
