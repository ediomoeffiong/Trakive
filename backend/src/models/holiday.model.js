const { query } = require('../config/db');

const HolidayModel = {
  async listCached(countryCode, startDate, endDate) {
    const res = await query(
      `SELECT * FROM public_holiday_cache
       WHERE country_code = $1 AND holiday_date >= $2 AND holiday_date <= $3
       ORDER BY holiday_date ASC`,
      [countryCode, startDate, endDate]
    );
    return res.rows;
  },

  async findCachedOnDate(countryCode, date) {
    const res = await query(
      `SELECT * FROM public_holiday_cache
       WHERE country_code = $1 AND holiday_date = $2
       LIMIT 1`,
      [countryCode, date]
    );
    return res.rows[0] || null;
  },

  async latestFetch(countryCode, year) {
    const res = await query(
      `SELECT MAX(fetched_at) AS fetched_at
       FROM public_holiday_cache
       WHERE country_code = $1 AND EXTRACT(YEAR FROM holiday_date) = $2`,
      [countryCode, year]
    );
    return res.rows[0]?.fetched_at || null;
  },

  async upsertCached(rows) {
    for (const row of rows) {
      await query(
        `INSERT INTO public_holiday_cache (country_code, holiday_date, local_name, english_name, provider, raw, fetched_at)
         VALUES ($1,$2,$3,$4,$5,$6,NOW())
         ON CONFLICT (country_code, holiday_date, local_name)
         DO UPDATE SET english_name = EXCLUDED.english_name, raw = EXCLUDED.raw, fetched_at = NOW()`,
        [
          row.countryCode,
          row.date,
          row.localName,
          row.name || null,
          row.provider || 'nager',
          JSON.stringify(row.raw || {}),
        ]
      );
    }
  },

  async listOrgHolidays(organizationId, startDate, endDate) {
    const res = await query(
      `SELECT * FROM organization_holidays
       WHERE organization_id = $1 AND holiday_date >= $2 AND holiday_date <= $3
       ORDER BY holiday_date ASC`,
      [organizationId, startDate, endDate]
    );
    return res.rows;
  },

  async findOrgHolidayOnDate(organizationId, date) {
    const res = await query(
      `SELECT * FROM organization_holidays
       WHERE organization_id = $1
         AND (
           holiday_date = $2
           OR (is_recurring = TRUE AND EXTRACT(MONTH FROM holiday_date) = EXTRACT(MONTH FROM $2::date)
               AND EXTRACT(DAY FROM holiday_date) = EXTRACT(DAY FROM $2::date))
         )
       ORDER BY created_at DESC
       LIMIT 1`,
      [organizationId, date]
    );
    return res.rows[0] || null;
  },

  async createOrgHoliday(data) {
    const sql = `
      INSERT INTO organization_holidays (
        organization_id, holiday_date, name, kind, is_recurring, notes, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
    `;
    const res = await query(sql, [
      data.organization_id,
      data.holiday_date,
      data.name,
      data.kind || 'org_holiday',
      data.is_recurring === true,
      data.notes || null,
      data.created_by || null,
    ]);
    return res.rows[0];
  },

  async deleteOrgHoliday(id, organizationId) {
    const res = await query(
      'DELETE FROM organization_holidays WHERE id = $1 AND organization_id = $2 RETURNING *',
      [id, organizationId]
    );
    return res.rows[0] || null;
  },
};

module.exports = HolidayModel;
