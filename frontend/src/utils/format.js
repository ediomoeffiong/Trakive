/**
 * @file format.js
 * @description Formatting utility functions for Trakive.
 */

/**
 * Format a number as a compact locale string (e.g. 1200 → "1.2K").
 * @param {number} value
 * @param {string} [locale='en-US']
 */
export function formatCompactNumber(value, locale = 'en-US') {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

/**
 * Format a number as currency.
 * @param {number} value
 * @param {string} [currency='USD']
 * @param {string} [locale='en-US']
 */
export function formatCurrency(value, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

/**
 * Format a date into a human-readable string.
 * @param {Date|string|number} date
 * @param {Intl.DateTimeFormatOptions} [options]
 */
export function formatDate(date, options = { year: 'numeric', month: 'short', day: 'numeric' }) {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
}

/**
 * Return a relative time string (e.g. "3 hours ago").
 * @param {Date|string|number} date
 */
export function formatRelativeTime(date) {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = Date.now();
  const diff = new Date(date).getTime() - now;
  const absSeconds = Math.abs(diff) / 1000;

  if (absSeconds < 60)       return rtf.format(Math.round(diff / 1000),        'second');
  if (absSeconds < 3600)     return rtf.format(Math.round(diff / 60000),       'minute');
  if (absSeconds < 86400)    return rtf.format(Math.round(diff / 3600000),     'hour');
  if (absSeconds < 2592000)  return rtf.format(Math.round(diff / 86400000),    'day');
  if (absSeconds < 31536000) return rtf.format(Math.round(diff / 2592000000),  'month');
  return rtf.format(Math.round(diff / 31536000000), 'year');
}

/**
 * Truncate a string to a given length, appending "…".
 * @param {string} str
 * @param {number} [maxLength=80]
 */
export function truncate(str, maxLength = 80) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}
