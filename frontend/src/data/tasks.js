/**
 * @file tasks.js
 * @description Mock tasks database for Trakive Task Management.
 */

export const mockTasks = [
  {
    id: "task-1",
    title: "Complete Security & Compliance Training",
    description: "Watch the compliance videos and complete the quiz with a passing score of 80% or higher.",
    fullDescription: "All new hires and interns must complete the annual security awareness and compliance training. This ensures we protect our client data, meet regulatory standards, and practice secure computing habits. The training covers password hygiene, phishing detection, device security, and social engineering.",
    category: "training",
    priority: "high",
    status: "completed",
    dueDate: "2026-07-15",
    assignedDate: "2026-07-10",
    completedAt: "2026-07-14",
    onboardingStep: true,
    remainingDays: -2,
    estimatedTime: "2 hours",
    supervisor: {
      name: "Sarah Jenkins",
      role: "Security Lead",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    objectives: [
      { id: "obj-1-1", text: "Watch Security Awareness Video", checked: true },
      { id: "obj-1-2", text: "Read Data Privacy Policy", checked: true },
      { id: "obj-1-3", text: "Pass Compliance Quiz with >= 80%", checked: true }
    ],
    progress: 100
  },
  {
    id: "task-2",
    title: "Setup Development Environment & Git SSH Keys",
    description: "Clone the main repository, install dependencies, and verify you can run tests locally.",
    fullDescription: "Get your laptop configured for active development. Follow the dev onboarding playbook to install Node.js, Docker, setup your SSH keys, clone the Trakive codebase, install local packages, and successfully execute the integration test suite.",
    category: "development",
    priority: "high",
    status: "completed",
    dueDate: "2026-07-16",
    assignedDate: "2026-07-12",
    completedAt: "2026-07-16",
    onboardingStep: true,
    remainingDays: 0,
    estimatedTime: "4 hours",
    supervisor: {
      name: "Marcus Chen",
      role: "Senior Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    objectives: [
      { id: "obj-2-1", text: "Generate SSH keys and add to GitHub profile", checked: true },
      { id: "obj-2-2", text: "Install Node, Docker, and Git", checked: true },
      { id: "obj-2-3", text: "Clone the Trakive repository", checked: true },
      { id: "obj-2-4", text: "Run local development server and execute npm test", checked: true }
    ],
    progress: 100
  },
  {
    id: "task-3",
    title: "Draft Project Proposal & System Design",
    description: "Create a technical design document for the feature set and share it with your mentor.",
    fullDescription: "Formulate the architectural design and database schema for the Intern Task Management module. Highlight how components will read/write status updates, upload files to cloud storage, and interact with the Zustand state management flow. Produce a visual sequence flowchart.",
    category: "research",
    priority: "high",
    status: "in-progress",
    dueDate: "2026-07-18",
    assignedDate: "2026-07-14",
    onboardingStep: false,
    remainingDays: 2,
    estimatedTime: "3 days",
    supervisor: {
      name: "Marcus Chen",
      role: "Senior Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    objectives: [
      { id: "obj-3-1", text: "Research existing state machine libraries for React", checked: true },
      { id: "obj-3-2", text: "Outline API endpoints structure in Markdown document", checked: true },
      { id: "obj-3-3", text: "Draw architecture diagram using Mermaid or Figma", checked: false },
      { id: "obj-3-4", text: "Write draft system design and submit for feedback", checked: false }
    ],
    progress: 50
  },
  {
    id: "task-4",
    title: "Submit Week 1 Status Report",
    description: "Write down what you have learned and accomplished this week in a Markdown summary.",
    fullDescription: "Provide a detailed account of your first-week learnings, blockers faced, setup achievements, and objectives for Week 2. This report is used to track onboarding progress and align resources to help you succeed.",
    category: "documentation",
    priority: "medium",
    status: "assigned",
    dueDate: "2026-07-17",
    assignedDate: "2026-07-14",
    onboardingStep: false,
    remainingDays: 1,
    estimatedTime: "1 hour",
    supervisor: {
      name: "Marcus Chen",
      role: "Senior Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    objectives: [
      { id: "obj-4-1", text: "Summarize weekly learnings and tasks completed", checked: false },
      { id: "obj-4-2", text: "Identify any system blockers or tooling issues", checked: false },
      { id: "obj-4-3", text: "Set goals for next week and submit weekly report", checked: false }
    ],
    progress: 0
  },
  {
    id: "task-5",
    title: "Review PR #405 and Provide Feedback",
    description: "Look at the frontend improvements and verify code styling matches the design system.",
    fullDescription: "Review the PR implementing Recharts dynamic animations in the dashboard. Perform visual inspection on accessibility, check if custom Tailwind styles adhere to our colors variables, ensure responsive layouts work correctly, and offer suggestions on optimizing state polling.",
    category: "development",
    priority: "low",
    status: "needs-revision",
    dueDate: "2026-07-20",
    assignedDate: "2026-07-15",
    onboardingStep: false,
    remainingDays: 4,
    estimatedTime: "2 hours",
    supervisor: {
      name: "Marcus Chen",
      role: "Senior Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    objectives: [
      { id: "obj-5-1", text: "Inspect bundle size impact of Recharts libraries", checked: true },
      { id: "obj-5-2", text: "Test chart scaling on mobile resolutions (320px - 480px)", checked: true },
      { id: "obj-5-3", text: "Comment on CSS variable variables consistency in PR review", checked: false }
    ],
    progress: 66
  },
  {
    id: "task-6",
    title: "Schedule 1:1 Intro with Mentor",
    description: "Book a 30-minute meeting to sync on expectations and goals.",
    fullDescription: "Establish contact with your dedicated mentor, Marcus. Set up a quick 1-on-1 greeting to discuss the quarterly internship goals, milestone timelines, communication channels, and preferred feedback cycles.",
    category: "other",
    priority: "low",
    status: "completed",
    dueDate: "2026-07-12",
    assignedDate: "2026-07-10",
    completedAt: "2026-07-12",
    onboardingStep: true,
    remainingDays: -4,
    estimatedTime: "30 mins",
    supervisor: {
      name: "Marcus Chen",
      role: "Senior Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    objectives: [
      { id: "obj-6-1", text: "Find a suitable slot on Marcus's calendar", checked: true },
      { id: "obj-6-2", text: "Prepare a brief outline of personal learning goals", checked: true },
      { id: "obj-6-3", text: "Hold the meeting and draft quick action items", checked: true }
    ],
    progress: 100
  },
  {
    id: "task-7",
    title: "Prepare Mid-term Presentation Mockup",
    description: "Design slides summarizing your initial achievements and upcoming work.",
    fullDescription: "Draft the layout, content outline, and visuals for your mid-term internship review. Share key dashboard screenshots, detail system architecture blocks you built, list personal development learnings, and outline items for the second half of the internship.",
    category: "presentation",
    priority: "high",
    status: "assigned",
    dueDate: "2026-07-16",
    assignedDate: "2026-07-10",
    onboardingStep: false,
    remainingDays: 0, // Due today!
    estimatedTime: "5 hours",
    supervisor: {
      name: "Sarah Jenkins",
      role: "UX Lead",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    objectives: [
      { id: "obj-7-1", text: "Outline slide deck sections in document", checked: false },
      { id: "obj-7-2", text: "Gather charts screenshots from Trakive app", checked: false },
      { id: "obj-7-3", text: "Draft slide designs using Trakive branding guideline", checked: false }
    ],
    progress: 0
  },
  {
    id: "task-8",
    title: "Review Design Guidelines",
    description: "Go through the Figma design system instructions and brand colors.",
    fullDescription: "Gain familiarity with the Trakive brand assets, design tokens, UI templates, accessibility thresholds, and component interaction specifications. Pay special attention to semantic colors usage, alert layouts, and dark mode transitions.",
    category: "documentation",
    priority: "medium",
    status: "assigned",
    dueDate: "2026-07-14", // Overdue!
    assignedDate: "2026-07-10",
    onboardingStep: true,
    remainingDays: -2,
    estimatedTime: "2 hours",
    supervisor: {
      name: "Sarah Jenkins",
      role: "UX Lead",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    objectives: [
      { id: "obj-8-1", text: "Download Trakive brand color guide", checked: false },
      { id: "obj-8-2", text: "Review typography stack and standard spacing scales", checked: false },
      { id: "obj-8-3", text: "Inspect interactive state guidelines (hover, active, disabled)", checked: false }
    ],
    progress: 0
  }
];
