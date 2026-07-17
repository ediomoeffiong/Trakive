/**
 * @file activities.js
 * @description Mock timeline activities.
 */

export const mockActivities = [
  {
    id: "act-1",
    type: "task_submitted", // task_submitted, review_received, onboarding_completed, profile_updated, notification_new
    title: "Task Submitted",
    description: "Submitted Setup Development Environment & Git SSH Keys for review.",
    timestamp: "2 hours ago",
    user: "John Doe"
  },
  {
    id: "act-2",
    type: "review_received",
    title: "Review Received",
    description: "Mentor Jane Smith left positive feedback on Security & Compliance Training.",
    timestamp: "5 hours ago",
    user: "Jane Smith"
  },
  {
    id: "act-3",
    type: "onboarding_completed",
    title: "Onboarding Step Completed",
    description: "Completed the 'Schedule 1:1 Intro with Mentor' milestone.",
    timestamp: "Yesterday at 3:45 PM",
    user: "John Doe"
  },
  {
    id: "act-4",
    type: "profile_updated",
    title: "Profile Updated",
    description: "Added skills, university details, and profile photo.",
    timestamp: "2 days ago",
    user: "John Doe"
  },
  {
    id: "act-5",
    type: "notification_new",
    title: "New Notification",
    description: "Assigned to a new onboarding pathway: 'Engineering Excellence Group'.",
    timestamp: "3 days ago",
    user: "System"
  }
];
