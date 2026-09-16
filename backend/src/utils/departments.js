const STANDARD_DEPARTMENTS = [
  {
    name: 'FifthLab',
    code: 'FIFTHLAB',
    description: 'FifthLab venture lab and internship programs.',
  },
  {
    name: 'Human Resources (HR)',
    code: 'HR',
    description: 'People operations, onboarding, and employee support.',
  },
  {
    name: 'IT Department',
    code: 'IT',
    description: 'Information technology support and administration.',
  },
  {
    name: 'IT Infrastructure',
    code: 'IT-INFRA',
    description: 'Infrastructure systems, endpoints, and internal platforms.',
  },
  {
    name: 'Networking',
    code: 'NET',
    description: 'Network operations, connectivity, and access management.',
  },
  {
    name: 'Data Centre',
    code: 'DC',
    description: 'Data centre operations and systems availability.',
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

const standardByName = new Map(STANDARD_DEPARTMENTS.map((department) => [department.name, department]));

const normalizeDepartmentName = (value = '') => aliases.get(normalizeKey(value)) || '';

const sanitizeDepartmentRows = (departments = []) => {
  const byName = new Map();
  departments.forEach((department) => {
    const name = normalizeDepartmentName(department?.name || department?.code || '');
    if (!name || byName.has(name)) return;
    byName.set(name, {
      ...department,
      name,
      code: standardByName.get(name)?.code || department.code,
      description: department.description || standardByName.get(name)?.description || null,
    });
  });
  return STANDARD_DEPARTMENTS.map((department) => byName.get(department.name)).filter(Boolean);
};

module.exports = {
  STANDARD_DEPARTMENTS,
  normalizeDepartmentName,
  sanitizeDepartmentRows,
};
