/**
 * @file departments.js
 * @description Canonical department list and helpers for department dropdowns.
 */

export const STANDARD_DEPARTMENTS = [
  {
    id: 'dept-fifthlab',
    name: 'FifthLab',
    code: 'FIFTHLAB',
    description: 'FifthLab venture lab and internship programs.',
    color: '#0284c7',
  },
  {
    id: 'dept-hr',
    name: 'Human Resources (HR)',
    code: 'HR',
    description: 'People operations, onboarding, and employee support.',
    color: '#f97316',
  },
  {
    id: 'dept-it',
    name: 'IT Department',
    code: 'IT',
    description: 'Information technology support and administration.',
    color: '#2563eb',
  },
  {
    id: 'dept-it-infrastructure',
    name: 'IT Infrastructure',
    code: 'IT-INFRA',
    description: 'Infrastructure systems, endpoints, and internal platforms.',
    color: '#6366f1',
  },
  {
    id: 'dept-networking',
    name: 'Networking',
    code: 'NET',
    description: 'Network operations, connectivity, and access management.',
    color: '#10b981',
  },
  {
    id: 'dept-data-centre',
    name: 'Data Centre',
    code: 'DC',
    description: 'Data centre operations and systems availability.',
    color: '#06b6d4',
  },
];

const normalizeKey = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const aliases = new Map([
  ['fifthlab', 'FifthLab'],
  ['fifth lab', 'FifthLab'],
  ['hr', 'Human Resources (HR)'],
  ['human resources', 'Human Resources (HR)'],
  ['people culture', 'Human Resources (HR)'],
  ['people and culture', 'Human Resources (HR)'],
  ['it', 'IT Department'],
  ['it department', 'IT Department'],
  ['information technology', 'IT Department'],
  ['it support', 'IT Department'],
  ['it infrastructure', 'IT Infrastructure'],
  ['infrastructure', 'IT Infrastructure'],
  ['networking', 'Networking'],
  ['network', 'Networking'],
  ['data centre', 'Data Centre'],
  ['data center', 'Data Centre'],
]);

const canonicalByName = new Map(STANDARD_DEPARTMENTS.map((dept) => [dept.name, dept]));

export const normalizeDepartmentName = (value = '') => {
  const key = normalizeKey(value);
  return aliases.get(key) || '';
};

export const isStandardDepartment = (value = '') => Boolean(normalizeDepartmentName(value));

export const sanitizeDepartments = (departments = []) => {
  const byName = new Map();

  departments.forEach((department) => {
    const name = normalizeDepartmentName(department?.name || department?.code || '');
    if (!name || byName.has(name)) return;
    byName.set(name, {
      ...canonicalByName.get(name),
      ...department,
      name,
      code: canonicalByName.get(name)?.code,
    });
  });

  return STANDARD_DEPARTMENTS.map((department) => byName.get(department.name) || department);
};
