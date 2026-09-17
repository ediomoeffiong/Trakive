const config = require('../config/env');
const HolidayModel = require('../models/holiday.model');
const { createHolidayProvider } = require('./holidayProvider.service');

const HolidayService = {
  getProvider() {
    return createHolidayProvider({
      holidayProvider: config.holiday.provider,
      holidayApiUrl: config.holiday.apiUrl,
      holidayCountry: config.holiday.country,
    });
  },

  async ensureYearCached(countryCode, year, { force = false } = {}) {
    const ttlHours = config.holiday.cacheTtlHours;
    const latest = await HolidayModel.latestFetch(countryCode, year);
    const fresh = latest && (Date.now() - new Date(latest).getTime()) < ttlHours * 3600 * 1000;
    if (fresh && !force) return { source: 'cache', year };

    try {
      const provider = this.getProvider();
      const holidays = await provider.fetchYear(year);
      const mapped = holidays.map((h) => ({ ...h, countryCode: h.countryCode || countryCode }));
      if (mapped.length) await HolidayModel.upsertCached(mapped);
      return { source: 'provider', year, count: mapped.length };
    } catch (err) {
      return { source: 'cache_fallback', year, error: err.message };
    }
  },

  async getPublicHoliday(countryCode, date) {
    const year = Number(String(date).slice(0, 4));
    await this.ensureYearCached(countryCode, year);
    return HolidayModel.findCachedOnDate(countryCode, date);
  },

  async listRange(countryCode, organizationId, startDate, endDate) {
    const startYear = Number(String(startDate).slice(0, 4));
    const endYear = Number(String(endDate).slice(0, 4));
    for (let y = startYear; y <= endYear; y += 1) {
      await this.ensureYearCached(countryCode, y);
    }
    const publicHolidays = await HolidayModel.listCached(countryCode, startDate, endDate);
    const orgHolidays = await HolidayModel.listOrgHolidays(organizationId, startDate, endDate);
    return { publicHolidays, orgHolidays };
  },
};

module.exports = HolidayService;
