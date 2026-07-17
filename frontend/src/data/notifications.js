/**
 * @file notifications.js
 * @description Mock notification list.
 */

export const mockNotifications = [
  {
    id: "notif-1",
    type: "task", // task, review, general, reminder
    title: "New Task Assigned",
    description: "You have been assigned: 'Draft Project Proposal & System Design'.",
    timestamp: "10 minutes ago",
    unread: true
  },
  {
    id: "notif-2",
    type: "review",
    title: "New Review Available",
    description: "Mentor Jane Smith left a performance review for Week 1.",
    timestamp: "1 hour ago",
    unread: true
  },
  {
    id: "notif-3",
    type: "reminder",
    title: "Onboarding Milestone Due",
    description: "Your 'Review Design Guidelines' onboarding step is overdue.",
    timestamp: "Yesterday",
    unread: true
  },
  {
    id: "notif-4",
    type: "general",
    title: "Welcome to Trakive!",
    description: "Get started by reviewing your onboarding dashboard and filling out your profile.",
    timestamp: "3 days ago",
    unread: false
  }
];
