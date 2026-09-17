class NagerHolidayProvider {
  constructor({ baseUrl, countryCode, timeoutMs = 8000 }) {
    this.baseUrl = (baseUrl || 'https://date.nager.at/api/v3').replace(/\/$/, '');
    this.countryCode = countryCode || 'NG';
    this.timeoutMs = timeoutMs;
    this.name = 'nager';
  }

  async fetchYear(year) {
    const url = `${this.baseUrl}/PublicHolidays/${year}/${this.countryCode}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
      if (!res.ok) {
        throw new Error(`Holiday provider responded ${res.status}`);
      }
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.map((item) => ({
        date: item.date,
        localName: item.localName || item.name,
        name: item.name || item.localName,
        countryCode: item.countryCode || this.countryCode,
        raw: item,
        provider: this.name,
      }));
    } finally {
      clearTimeout(timer);
    }
  }
}

function createHolidayProvider(config) {
  const provider = (config.holidayProvider || 'nager').toLowerCase();
  if (provider === 'nager') {
    return new NagerHolidayProvider({
      baseUrl: config.holidayApiUrl,
      countryCode: config.holidayCountry,
    });
  }
  return new NagerHolidayProvider({
    baseUrl: config.holidayApiUrl,
    countryCode: config.holidayCountry,
  });
}

module.exports = {
  NagerHolidayProvider,
  createHolidayProvider,
};
