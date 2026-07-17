/**
 * @file onboardingCategories.js
 * @description Category metadata for onboarding steps grouping and display.
 */

export const mockOnboardingCategories = [
  {
    id: 'welcome',
    name: 'Welcome',
    icon: '👋',
    description: 'Get oriented with Trakive\'s mission and platform',
    color: 'primary',
    order: 1,
  },
  {
    id: 'hr-documents',
    name: 'HR Documents',
    icon: '📄',
    description: 'Complete all required legal and payroll paperwork',
    color: 'warning',
    order: 2,
  },
  {
    id: 'company-policies',
    name: 'Company Policies',
    icon: '📋',
    description: 'Understand the standards and expectations at Trakive',
    color: 'success',
    order: 3,
  },
  {
    id: 'it-setup',
    name: 'IT Setup',
    icon: '💻',
    description: 'Configure your development tools and access credentials',
    color: 'neutral',
    order: 4,
  },
  {
    id: 'team-introduction',
    name: 'Team Introduction',
    icon: '🤝',
    description: 'Meet the people you\'ll be working with day-to-day',
    color: 'primary',
    order: 5,
  },
  {
    id: 'training',
    name: 'Training',
    icon: '🎓',
    description: 'Master the skills and tools used across Trakive\'s codebase',
    color: 'success',
    order: 6,
  },
];
