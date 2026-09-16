/**
 * @file departments.js
 * @description Mock data for organization departments.
 */

import { STANDARD_DEPARTMENTS } from '../utils/departments';

export const mockDepartments = STANDARD_DEPARTMENTS.map((department, index) => ({
  ...department,
  leadId: department.name === 'FifthLab' ? 'sup-001' : null,
  leadName: department.name === 'FifthLab' ? 'Tochukwu Mgbemena' : 'Vacant',
  leadTitle: department.name === 'FifthLab' ? 'FifthLab Director / Lead Supervisor' : '-',
  internCount: department.name === 'FifthLab' ? 25 : 0,
  supervisorCount: department.name === 'FifthLab' ? 5 : 0,
  capacity: index === 0 ? 40 : 20,
  completionRate: department.name === 'FifthLab' ? 98.0 : 0,
  activeBatch: 'Batch 2026-B3',
  createdAt: '2023-01-10',
  status: 'active',
}));
