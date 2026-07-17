// How It Works steps — displayed as a numbered process section on the landing page.
// Icons use react-icons/ri names as strings; resolve dynamically via RiIcons[step.icon].

export const steps = [
  {
    id: 1,
    step: 1,
    icon: 'RiUserAddLine',
    title: 'Register & Get Verified',
    description:
      "Create your account and receive access credentials from your organisation's HR team. Your profile is set up and ready in minutes.",
  },
  {
    id: 2,
    step: 2,
    icon: 'RiClipboardLine',
    title: 'Complete Your Onboarding',
    description:
      'Work through a structured onboarding checklist covering company policies, team introductions, and tool access — all tracked in one place.',
  },
  {
    id: 3,
    step: 3,
    icon: 'RiTaskLine',
    title: 'Receive & Complete Tasks',
    description:
      'Your supervisor assigns tasks with clear descriptions, deadlines, and priorities. Submit your work directly through the platform.',
  },
  {
    id: 4,
    step: 4,
    icon: 'RiLineChartLine',
    title: 'Track Progress & Get Reviewed',
    description:
      'Monitor your performance with live analytics. Receive mid-term and final reviews, and walk away with a comprehensive performance summary.',
  },
];
