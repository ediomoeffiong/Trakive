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
    avatarUrl: 'https://media.licdn.com/dms/image/v2/D4E03AQHi3ZYYUFg3BA/profile-displayphoto-scale_200_200/B4EZn2pX4JIQAY-/0/1760779700254?e=2147483647&v=beta&t=m2VcejF7Sc7-T5m2cldFz4lrewoSSMY6HyHc63NBtkM',
    bio: 'Software Engineering Intern focused on frontend performance.',
  },
  {
    id: 'u-2',
    name: 'Tochukwu Mgbemena',
    email: 'supervisor@trakive.com',
    role: 'Supervisor',
    department: 'Engineering',
    avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp5OZN_RzRJQ2uE0wMl4jfA5IjbH8B6S9IJaY9tRUBLQ&s=10',
    bio: 'Senior Technical Lead & Engineering Supervisor.',
  },
  {
    id: 'u-3',
    name: 'Tinu Adeyemi',
    email: 'hr@trakive.com',
    role: 'HR Administrator',
    department: 'People Operations',
    avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOJU2OaNdLSLyJcEAW9WkK8QGGIy2WMqoIQR37JijSnw&s=10',
    bio: 'Lead Talents Ops Coordinator.',
  },
  {
    id: 'u-4',
    name: 'Moradeke Akintola',
    email: 'head@trakive.com',
    role: 'Department Head',
    department: 'Product & Design',
    avatarUrl: 'https://media.licdn.com/dms/image/v2/C4E03AQE9cuYESnpQ-g/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1517532620864?e=2147483647&v=beta&t=e52Dy0Qfu0GcbSIIlxlwbUdKKryeHHHWoDrDt6lM83Q',
    bio: 'Head of Product Design & Research.',
  },
];

// Default password for all mock accounts
export const DEFAULT_MOCK_PASSWORD = 'Password123!';
