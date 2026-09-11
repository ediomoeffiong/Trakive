// How It Works steps — displayed as a numbered process section on the landing page.
// Icons use react-icons/ri names as strings; resolve dynamically via RiIcons[step.icon].

export const steps = [
  {
    id: 1,
    step: 1,
    icon: 'RiUserAddLine',
    title: 'Register & Onboard',
    description:
      'Access your account with credentials from HR and complete a structured onboarding checklist.',
  },
  {
    id: 2,
    step: 2,
    icon: 'RiTaskLine',
    title: 'Manage Tasks & Projects',
    description:
      'Execute assigned tasks, work toward project milestones, and submit weekly progress updates.',
  },
  {
    id: 3,
    step: 3,
    icon: 'RiUserStarLine',
    title: 'Supervisor Oversight',
    description:
      'Supervisors monitor progress, review submitted deliverables, and provide continuous feedback.',
  },
  {
    id: 4,
    step: 4,
    icon: 'RiLineChartLine',
    title: 'Track Progress & Evaluation',
    description:
      'Track growth with live analytics and complete mid-term and final performance reviews.',
  },
];
