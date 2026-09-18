const HTML_ENTITY_MAP = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
};

const SKIP_KEY_PATTERN = /(password|token|secret|authorization|email|url|uri|path|file_path|avatar_url)$/i;

function escapeHtml(value) {
  return value.replace(/[<>"'`]/g, (char) => HTML_ENTITY_MAP[char]);
}

function sanitizeTextInput(value) {
  if (typeof value !== 'string') return value;

  return escapeHtml(
    value
      .replace(/\u0000/g, '')
      .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .replace(/\s+on\w+\s*=/gi, ' ')
      .replace(/javascript\s*:/gi, '')
      .replace(/data\s*:\s*text\/html/gi, '')
  );
}

function sanitizeValidatedData(value, key = '') {
  if (typeof value === 'string') {
    return SKIP_KEY_PATTERN.test(key) ? value : sanitizeTextInput(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValidatedData(item, key));
  }

  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        sanitizeValidatedData(childValue, childKey),
      ])
    );
  }

  return value;
}

module.exports = {
  sanitizeTextInput,
  sanitizeValidatedData,
};
