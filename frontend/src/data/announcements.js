/**
 * @file announcements.js
 * @description Mock organization-wide announcements for Trakive.
 */

export const mockAnnouncements = [
  {
    id: 'ann-1',
    title: 'Quarterly All-Hands Meeting — Q3 2026',
    author: { name: 'Sarah Johnson', role: 'CEO', avatar: null },
    date: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    displayDate: 'Yesterday, 10:00 AM',
    priority: 'important',
    type: 'event',
    preview:
      'All staff and interns are invited to our Q3 All-Hands Meeting on August 1, 2026. Join us for key updates on company direction, product launches, and team recognition.',
    body: `Dear Team,

We are excited to invite all staff and interns to our Quarterly All-Hands Meeting for Q3 2026.

📅 Date: Friday, August 1, 2026
🕐 Time: 11:00 AM – 12:30 PM
📍 Venue: Main Conference Hall + Live Stream

Agenda:
• CEO Welcome & Q2 Highlights
• Product Team: Q3 Roadmap Reveal
• Engineering Team: Infrastructure Updates
• HR Announcements & New Hires
• Intern Spotlight: Featured Projects
• Open Q&A Session

Attendance is mandatory for all interns. The session will be recorded for those unable to attend live. Please RSVP by July 29 via the HR portal.

We look forward to seeing everyone there!`,
    tags: ['all-hands', 'mandatory', 'q3'],
  },
  {
    id: 'ann-2',
    title: 'Intern Showcase Event — Register by August 5',
    author: { name: 'Mike Chen', role: 'HR Manager', avatar: null },
    date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    displayDate: 'Jul 15',
    priority: 'important',
    type: 'event',
    preview:
      'Showcase your internship work on August 15! Each intern gets 10 minutes to present. Awards for Best Innovation, Best Design & Best Impact.',
    body: `Hello Interns,

We are thrilled to announce the Annual Intern Showcase 2026!

📅 Date: August 15, 2026
🕐 Time: 2:00 PM – 5:00 PM
📍 Venue: Innovation Hub, Floor 4

This is your opportunity to present the amazing work you have accomplished during your internship to company leaders, mentors, and your peers.

Format:
• 10 minutes presentation per intern
• 5 minutes Q&A
• Panel of judges (Engineering leads + CEO)

Awards:
🥇 Best Innovation
🎨 Best Design
💡 Best Business Impact

How to Register:
Submit your project title and a 2-paragraph abstract to hr@company.com by August 5, 2026.

This event is a fantastic opportunity for visibility and could lead to full-time opportunities!`,
    tags: ['intern', 'showcase', 'awards'],
  },
  {
    id: 'ann-3',
    title: 'New Learning Resources Available on the Portal',
    author: { name: 'Lisa Park', role: 'Learning & Development', avatar: null },
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    displayDate: 'Jul 19',
    priority: 'general',
    type: 'general',
    preview:
      'New courses on React Advanced Patterns, System Design, and Leadership Fundamentals are now available in the learning portal.',
    body: `Hi everyone,

We have added new learning resources to the company learning portal this week.

New Courses Available:
📚 React Advanced Patterns & Performance (8 hours)
🏗️ System Design for Engineers (12 hours)
👥 Leadership Fundamentals for Tech Professionals (6 hours)
🔐 Cybersecurity Essentials (4 hours)

Access: Go to learning.company.com and log in with your company credentials.

Interns are encouraged to complete at least one course per month. Course completions are tracked and reflected in your performance review.

Happy learning!`,
    tags: ['learning', 'development', 'courses'],
  },
  {
    id: 'ann-4',
    title: 'Office Closure — Civic Holiday',
    author: { name: 'HR Team', role: 'Human Resources', avatar: null },
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    displayDate: 'Jul 17',
    priority: 'general',
    type: 'general',
    preview:
      "The office will be closed on August 4 (Civic Holiday). Remote work is permitted for those with project deadlines. Normal operations resume August 5.",
    body: `Dear Team,

Please note that the office will be closed on Monday, August 4, 2026 in observance of the Civic Holiday.

For those with critical project deadlines:
• Remote work is permitted with manager approval
• Overtime during the holiday will be compensated per company policy
• Emergency support line will be active

Normal office operations will resume on Tuesday, August 5, 2026.

Please plan your work accordingly and communicate any urgent matters to your mentor or manager before the holiday weekend.

Enjoy the long weekend!`,
    tags: ['holiday', 'office-closure'],
  },
  {
    id: 'ann-5',
    title: 'Mentorship Program: Mid-Term Check-in Week',
    author: { name: 'Jane Smith', role: 'Mentorship Coordinator', avatar: null },
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    displayDate: 'Mon, Jul 22',
    priority: 'important',
    type: 'reminder',
    preview:
      'This week is Mid-Term Check-in Week. All interns must complete their self-assessment and schedule a 1-on-1 with their mentor by July 26.',
    body: `Hello Interns,

This week (July 22–26) is designated as Mid-Term Check-in Week for the Summer 2026 Internship Cohort.

Required Actions by July 26:
✅ Complete your self-assessment in Trakive
✅ Schedule a 1-on-1 meeting with your mentor
✅ Update your task completion status
✅ Ensure your profile is complete (100%)

What to prepare for your 1-on-1:
• A summary of tasks completed so far
• Challenges you've faced and how you handled them
• Skills you've gained
• Goals for the remaining 4 weeks
• Any concerns or questions

This check-in is a key milestone in your internship journey. Your mentor will provide feedback and adjust your learning plan if needed. Missing this check-in will be flagged in your final performance review.`,
    tags: ['mentorship', 'mid-term', 'mandatory'],
  },
  {
    id: 'ann-6',
    title: 'Updated Code of Conduct Policy',
    author: { name: 'Legal & Compliance', role: 'Legal Team', avatar: null },
    date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    displayDate: 'Jul 6',
    priority: 'important',
    type: 'general',
    preview:
      'Our Code of Conduct has been updated. All employees and interns must review and acknowledge the new policy by July 31, 2026.',
    body: `Dear All,

Our Code of Conduct has been updated to reflect new workplace standards and legal requirements. All employees and interns are required to read the updated policy and provide a digital acknowledgement by July 31, 2026.

Key updates include:
• Enhanced remote work guidelines
• Updated social media policy
• Clearer guidance on data privacy
• Expanded DEI commitments
• Updated reporting procedures

Action Required:
1. Read the updated Code of Conduct (available on the HR portal)
2. Complete the acknowledgement form by July 31, 2026

Non-compliance will result in HR follow-up. Please contact hr@company.com with any questions.`,
    tags: ['policy', 'compliance', 'mandatory'],
  },
];
