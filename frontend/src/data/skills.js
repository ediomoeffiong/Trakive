/**
 * @file skills.js
 * @description Mock skills data for Trakive User Profile module.
 */

export const mockSkills = [
  {
    id: 'skill_001',
    name: 'JavaScript',
    category: 'Technical',
    proficiency: 'Advanced',
    percentage: 80,
    color: '#f59e0b',
  },
  {
    id: 'skill_002',
    name: 'React',
    category: 'Technical',
    proficiency: 'Advanced',
    percentage: 78,
    color: '#3b82f6',
  },
  {
    id: 'skill_003',
    name: 'TailwindCSS',
    category: 'Technical',
    proficiency: 'Expert',
    percentage: 90,
    color: '#06b6d4',
  },
  {
    id: 'skill_004',
    name: 'TypeScript',
    category: 'Technical',
    proficiency: 'Intermediate',
    percentage: 55,
    color: '#8b5cf6',
  },
  {
    id: 'skill_005',
    name: 'Git & Version Control',
    category: 'Technical',
    proficiency: 'Advanced',
    percentage: 75,
    color: '#ef4444',
  },
  {
    id: 'skill_006',
    name: 'Communication',
    category: 'Soft Skill',
    proficiency: 'Expert',
    percentage: 92,
    color: '#22c55e',
  },
  {
    id: 'skill_007',
    name: 'Teamwork',
    category: 'Soft Skill',
    proficiency: 'Expert',
    percentage: 88,
    color: '#10b981',
  },
  {
    id: 'skill_008',
    name: 'Problem Solving',
    category: 'Soft Skill',
    proficiency: 'Advanced',
    percentage: 82,
    color: '#ec4899',
  },
  {
    id: 'skill_009',
    name: 'Figma / UI Design',
    category: 'Technical',
    proficiency: 'Intermediate',
    percentage: 60,
    color: '#f97316',
  },
  {
    id: 'skill_010',
    name: 'REST APIs',
    category: 'Technical',
    proficiency: 'Advanced',
    percentage: 76,
    color: '#6366f1',
  },
];

export const PROFICIENCY_LEVELS = [
  { label: 'Beginner', value: 'Beginner', percentage: 25 },
  { label: 'Intermediate', value: 'Intermediate', percentage: 50 },
  { label: 'Advanced', value: 'Advanced', percentage: 75 },
  { label: 'Expert', value: 'Expert', percentage: 95 },
];

export const SKILL_CATEGORIES = ['Technical', 'Soft Skill', 'Domain', 'Tool'];
