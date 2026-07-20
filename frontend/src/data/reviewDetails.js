/**
 * @file reviewDetails.js
 * @description Mock detailed data for individual performance reviews.
 * Keyed by review ID. Includes evaluation criteria, supervisor feedback, and self-assessment.
 */

export const mockReviewDetails = {
  'rev-001': {
    id: 'rev-001',
    title: 'Month 1 Performance Review',
    period: 'Month 1',
    periodType: 'monthly',
    reviewDate: '2026-06-30',
    publishedAt: '2026-07-02',
    reviewerId: 'sup-001',
    reviewerName: 'Tochukwu Mgbemena',
    reviewerRole: 'Supervisor',
    reviewerAvatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp5OZN_RzRJQ2uE0wMl4jfA5IjbH8B6S9IJaY9tRUBLQ&s=10',
    overallScore: 88,
    status: 'published',
    overallSummary:
      'Covenant has demonstrated exceptional growth during the nine month of the internship. Their ability to quickly absorb information and apply it to real-world problems is commendable. The quality of work delivered has consistently met or exceeded expectations, and their communication style has been a great addition to the team dynamic.',
    evaluationCriteria: [
      {
        id: 'productivity',
        label: 'Productivity',
        score: 87,
        maxScore: 100,
        ratingLabel: 'Exceeds Expectations',
        feedback:
          'Completed 9 out of 10 assigned tasks within sprint deadlines. Proactively identified and resolved two blockers without supervisor intervention.',
      },
      {
        id: 'quality',
        label: 'Quality of Work',
        score: 92,
        maxScore: 100,
        ratingLabel: 'Outstanding',
        feedback:
          'Code reviews showed exceptional attention to detail. Only minor revisions were required across all submitted deliverables. Followed coding standards from day one.',
      },
      {
        id: 'communication',
        label: 'Communication',
        score: 85,
        maxScore: 100,
        ratingLabel: 'Exceeds Expectations',
        feedback:
          'Clear and concise in written updates. Presents ideas confidently in meetings. Could improve frequency of proactive status updates during longer tasks.',
      },
      {
        id: 'initiative',
        label: 'Initiative',
        score: 90,
        maxScore: 100,
        ratingLabel: 'Outstanding',
        feedback:
          'Volunteered for the onboarding dashboard redesign without prompting. Suggested and implemented a reusable component library that is now used team-wide.',
      },
      {
        id: 'teamwork',
        label: 'Teamwork',
        score: 86,
        maxScore: 100,
        ratingLabel: 'Exceeds Expectations',
        feedback:
          'Well-received by the full team. Offers help proactively and collaborates effectively across disciplines. Attended all team ceremonies without exception.',
      },
    ],
    supervisorFeedback: {
      heading: 'Supervisor Comments',
      submittedAt: '2026-07-01T14:30:00Z',
      richText:
        "Alex has truly impressed me during this first month. What stands out most is not just the technical output, but the attitude and approach to learning. Every piece of feedback was absorbed constructively and acted upon quickly.\n\nThe component library initiative was particularly noteworthy — it wasn't asked for, but it solved a real pain point for the team and is now used in production.\n\nMy key area of focus for the next review period would be developing more confidence in estimating task complexity. Some tasks took longer than scoped, not due to skill gaps, but due to underestimating testing effort.",
      strengths: [
        { icon: '🚀', title: 'Strong Initiative', description: 'Proactively contributed beyond assigned scope.' },
        { icon: '✨', title: 'Exceptional Quality', description: 'Deliverables consistently met bar on first submission.' },
        { icon: '🤝', title: 'Team Collaborator', description: 'Positive force on team dynamics and morale.' },
        { icon: '📚', title: 'Fast Learner', description: 'Picked up new technologies rapidly with minimal guidance.' },
      ],
      improvements: [
        { icon: '⏱️', title: 'Time Estimation', description: 'Improve accuracy when scoping task complexity.' },
        { icon: '📝', title: 'Documentation', description: 'Increase inline documentation on complex logic blocks.' },
      ],
    },
    selfAssessment: {
      submitted: true,
      submittedAt: '2026-06-29T09:15:00Z',
      productivityRating: 8,
      communicationRating: 7,
      teamworkRating: 9,
      initiativeRating: 9,
      overallReflection:
        "I feel I've had a strong start. The biggest challenge was context-switching between tasks, which I've improved by using time-blocking. I'm proud of the component library I built and how it was adopted by the team.",
      achievements:
        '- Completed onboarding dashboard redesign 2 days ahead of schedule\n- Built and published reusable component library\n- Resolved 2 production blockers independently',
      challenges:
        '- Underestimated testing effort for the API integration task\n- Initially struggled to understand the existing codebase architecture',
      nextGoals:
        '- Improve time estimates by breaking tasks into smaller sub-tasks\n- Add comprehensive inline documentation to all new code\n- Take ownership of a feature from design to deployment',
    },
  },

  'rev-002': {
    id: 'rev-002',
    title: 'Week 2 Check-in Review',
    period: 'Week 2',
    periodType: 'weekly',
    reviewDate: '2026-06-14',
    publishedAt: '2026-06-15',
    reviewerId: 'sup-001',
    reviewerName: 'Moradeke Akintola',
    reviewerRole: 'Department Head',
    reviewerAvatar: 'https://media.licdn.com/dms/image/v2/C4E03AQE9cuYESnpQ-g/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1517532620864?e=2147483647&v=beta&t=e52Dy0Qfu0GcbSIIlxlwbUdKKryeHHHWoDrDt6lM83Q',
    overallScore: 82,
    status: 'published',
    overallSummary:
      'A strong second week showing genuine enthusiasm for the role. Technical foundation is solid and the ability to adapt to new tools and frameworks has been impressive. Focus areas for the coming week include improving cross-team communication and providing more frequent status updates.',
    evaluationCriteria: [
      {
        id: 'productivity',
        label: 'Productivity',
        score: 80,
        maxScore: 100,
        ratingLabel: 'Meets Expectations',
        feedback: 'Completed 7 out of 9 assigned tasks. The 2 remaining are actively in progress and on track.',
      },
      {
        id: 'quality',
        label: 'Quality of Work',
        score: 85,
        maxScore: 100,
        ratingLabel: 'Exceeds Expectations',
        feedback: 'Good code quality with minor style issues flagged in review. No critical bugs introduced.',
      },
      {
        id: 'communication',
        label: 'Communication',
        score: 75,
        maxScore: 100,
        ratingLabel: 'Meets Expectations',
        feedback:
          'Communicates well in 1:1s but could be more proactive in sharing blockers with the broader team earlier.',
      },
      {
        id: 'initiative',
        label: 'Initiative',
        score: 82,
        maxScore: 100,
        ratingLabel: 'Exceeds Expectations',
        feedback: 'Asked for additional work when sprint tasks were completed. Good proactive mindset.',
      },
      {
        id: 'teamwork',
        label: 'Teamwork',
        score: 88,
        maxScore: 100,
        ratingLabel: 'Exceeds Expectations',
        feedback: 'Excellent integration into the team. Participated actively in all stand-ups and retrospectives.',
      },
    ],
    supervisorFeedback: {
      heading: 'Supervisor Comments',
      submittedAt: '2026-06-14T17:00:00Z',
      richText:
        "Week 2 has shown solid progress. The technical capability is clearly there, and I'm pleased with the quality of work output. The main area I'd like to see improvement is in proactive communication — specifically raising blockers and sharing status updates before I need to ask.\n\nOverall a very encouraging start. Keep this momentum going into Week 3.",
      strengths: [
        { icon: '💻', title: 'Technical Skills', description: 'Strong foundation across the tech stack.' },
        { icon: '🔄', title: 'Adaptability', description: 'Quickly adapted to team tools and processes.' },
        { icon: '👥', title: 'Team Integration', description: 'Well-received by the full team from day one.' },
      ],
      improvements: [
        { icon: '📢', title: 'Proactive Updates', description: 'Share blockers and status more frequently.' },
        { icon: '🌐', title: 'Cross-Team Communication', description: 'Engage more with non-engineering stakeholders.' },
      ],
    },
    selfAssessment: {
      submitted: true,
      submittedAt: '2026-06-13T11:00:00Z',
      productivityRating: 8,
      communicationRating: 7,
      teamworkRating: 8,
      initiativeRating: 8,
      overallReflection: "I'm finding my footing in the team. The codebase is complex but I'm making progress understanding the architecture.",
      achievements: '- Completed API integration task\n- Set up local dev environment efficiently\n- Attended all team ceremonies',
      challenges: '- Understanding existing state management patterns\n- Estimating effort for unfamiliar tasks',
      nextGoals: '- Be more proactive in sharing updates\n- Study the codebase architecture more deeply',
    },
  },

  'rev-003': {
    id: 'rev-003',
    title: 'Week 4 Mid-Period Review',
    period: 'Week 4',
    periodType: 'weekly',
    reviewDate: '2026-06-28',
    publishedAt: '2026-06-29',
    reviewerId: 'sup-002',
    reviewerName: 'Tinu Adeyemi',
    reviewerRole: 'HR Administrator',
    reviewerAvatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOJU2OaNdLSLyJcEAW9WkK8QGGIy2WMqoIQR37JijSnw&s=10',
    overallScore: 91,
    status: 'published',
    overallSummary:
      'An outstanding week. The dashboard redesign exceeded all stakeholder expectations and set a new quality bar for the design system. Alex demonstrated senior-level design thinking and execution throughout. The early delivery created space for additional polish that made a significant difference.',
    evaluationCriteria: [
      {
        id: 'productivity',
        label: 'Productivity',
        score: 94,
        maxScore: 100,
        ratingLabel: 'Outstanding',
        feedback: 'Delivered the full dashboard redesign 2 days ahead of schedule with zero scope compromises.',
      },
      {
        id: 'quality',
        label: 'Quality of Work',
        score: 95,
        maxScore: 100,
        ratingLabel: 'Outstanding',
        feedback:
          'The redesign was praised by stakeholders as the best work we have shipped this quarter. Pixel-perfect execution.',
      },
      {
        id: 'communication',
        label: 'Communication',
        score: 88,
        maxScore: 100,
        ratingLabel: 'Exceeds Expectations',
        feedback: 'Clearly articulated design decisions to non-technical stakeholders. Excellent presentation skills.',
      },
      {
        id: 'initiative',
        label: 'Initiative',
        score: 92,
        maxScore: 100,
        ratingLabel: 'Outstanding',
        feedback: 'Used spare time from early delivery to create an extended mobile variant of the design without being asked.',
      },
      {
        id: 'teamwork',
        label: 'Teamwork',
        score: 86,
        maxScore: 100,
        ratingLabel: 'Exceeds Expectations',
        feedback: 'Collaborated seamlessly with the engineering team to ensure design feasibility. Great cross-functional work.',
      },
    ],
    supervisorFeedback: {
      heading: 'Supervisor Comments',
      submittedAt: '2026-06-28T16:00:00Z',
      richText:
        "I genuinely cannot say enough good things about the work produced this week. The dashboard redesign wasn't just executed well — it changed the way we think about our design system. The stakeholder feedback was overwhelmingly positive.\n\nWhat impressed me most was the decision to use the extra time wisely — creating the mobile variant showed real product ownership. That kind of thinking is rare in interns.\n\nThe one minor area to develop is planning for mobile from the start rather than retrofitting it, but even that note is minor given the quality of the output.",
      strengths: [
        { icon: '🎨', title: 'Design Thinking', description: 'Outstanding product design sense and execution.' },
        { icon: '🚀', title: 'Delivery Speed', description: 'Delivered complex work well ahead of deadline.' },
        { icon: '🎤', title: 'Stakeholder Management', description: 'Confident presentation to senior leadership.' },
        { icon: '📱', title: 'Product Ownership', description: 'Demonstrated ownership beyond assigned scope.' },
      ],
      improvements: [
        { icon: '📐', title: 'Mobile-First Planning', description: 'Consider mobile layouts during initial design phase.' },
      ],
    },
    selfAssessment: {
      submitted: true,
      submittedAt: '2026-06-27T14:00:00Z',
      productivityRating: 9,
      communicationRating: 9,
      teamworkRating: 8,
      initiativeRating: 9,
      overallReflection:
        "This was my best week so far. I felt fully in the zone on the dashboard redesign and the stakeholder presentation went better than I expected. I'm growing more confident in design decisions.",
      achievements:
        '- Completed and shipped dashboard redesign ahead of schedule\n- Received outstanding stakeholder feedback\n- Created mobile variant independently',
      challenges: '- Initial mobile planning could have been better\n- Coordinating feedback rounds across teams was complex',
      nextGoals: '- Adopt mobile-first approach from the start of new projects\n- Deepen knowledge of the design system',
    },
  },
};
