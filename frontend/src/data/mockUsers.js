/**
 * @file mockUsers.js
 * @description Mock user data for prototyping Trakive frontend login & role-based dashboard redirection.
 */

export const mockUsers = [
  {
    id: 'u-1',
    name: 'Covenant Effiong',
    email: 'intern@trakive.com',
    role: 'Intern',
    department: 'Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=256&q=80',
    bio: 'Software Engineering Intern focused on frontend performance.',
  },
  {
    id: 'u-2',
    name: 'Tochukwu Mgbemena',
    email: 'supervisor@trakive.com',
    role: 'Supervisor',
    department: 'Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
    bio: 'Senior Technical Lead & Engineering Supervisor.',
  },
  {
    id: 'u-3',
    name: 'Tinu Adeyemi',
    email: 'hr@trakive.com',
    role: 'HR Administrator',
    department: 'People Operations',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=256&q=80',
    bio: 'Lead Talents Ops Coordinator.',
  },
  {
    id: 'u-4',
    name: 'Moradeke Akintola',
    email: 'head@trakive.com',
    role: 'Department Head',
    department: 'Product & Design',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    bio: 'Head of Product Design & Research.',
  },
];

// Default password for all mock accounts
export const DEFAULT_MOCK_PASSWORD = 'Password123!';
