import { normalizeDepartmentName } from './departments';

const FIFTHLAB_DEPARTMENT = 'FifthLab';
export const DEFAULT_FIFTHLAB_SUPERVISOR = {
  id: 'sup-tochukwu',
  name: 'Tochukwu Mgbemena',
  email: 'tochukwu.mgbemena@thefifthlab.com',
  title: 'Lead Supervisor',
};

const normalizeWhitespace = (value = '') => String(value || '').trim().replace(/\s+/g, ' ');

const fullNameFromRecord = (record = {}) =>
  normalizeWhitespace(
    record.name ||
      record.fullName ||
      [record.first_name || record.firstName, record.last_name || record.lastName].filter(Boolean).join(' ')
  );

export const isFifthLabDisplayPerson = (record = {}) => {
  const name = fullNameFromRecord(record).toLowerCase();
  const email = String(record.email || '').toLowerCase();

  return (
    name === 'ediomo effiong' ||
    name === 'tochukwu mgbemena' ||
    name === 'tochukwu mgbemmena' ||
    email === 'intern@thefifthlab.com' ||
    email === 'supervisor@thefifthlab.com' ||
    /@thefifthlab\.com$/i.test(email) && /fifthlab/i.test(record.organization || record.organization_name || '')
  );
};

export const normalizePersonName = (name = '') => {
  const normalized = normalizeWhitespace(name);
  if (/^tochukwu\s+mgbemmena$/i.test(normalized)) return 'Tochukwu Mgbemena';
  return normalized;
};

export const normalizeDepartmentForPerson = (record = {}, department = '') =>
  isFifthLabDisplayPerson(record) ? FIFTHLAB_DEPARTMENT : (normalizeDepartmentName(department) || department);

export const normalizePersonRecord = (record = {}) => {
  if (!record || typeof record !== 'object') return record;

  const normalizedName = normalizePersonName(record.name || record.fullName || '');
  const isFifthLabPerson = isFifthLabDisplayPerson({ ...record, name: normalizedName || record.name });
  const updates = {};

  if (normalizedName) {
    updates.name = normalizedName;
    if (record.fullName !== undefined) updates.fullName = normalizedName;
  }

  if (/^tochukwu\s+mgbemena$/i.test(normalizedName)) {
    if (record.lastName !== undefined) updates.lastName = 'Mgbemena';
    if (record.last_name !== undefined) updates.last_name = 'Mgbemena';
  }

  if (isFifthLabPerson) {
    updates.department = FIFTHLAB_DEPARTMENT;
    if (record.department_name !== undefined) updates.department_name = FIFTHLAB_DEPARTMENT;
  } else {
    const department = normalizeDepartmentName(record.department || record.department_name || '');
    if (department && record.department !== undefined) updates.department = department;
    if (department && record.department_name !== undefined) updates.department_name = department;
  }

  return { ...record, ...updates };
};
