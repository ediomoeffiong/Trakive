/**
 * @file submissions.js
 * @description Mock submission history database for intern tasks.
 */

export const mockSubmissions = {
  "task-1": [
    {
      id: "sub-1-1",
      submittedAt: "2026-07-14T14:30:00Z",
      fileName: "Security_Compliance_Quiz_Report.pdf",
      fileSize: "850 KB",
      status: "completed",
      feedback: "Great job! You scored 100% on the security and compliance quiz. You're ready to proceed with your tasks.",
      feedbackAuthor: "Moses Mornu (Security Lead)",
      feedbackDate: "2026-07-14T16:00:00Z"
    }
  ],
  "task-2": [
    {
      id: "sub-2-1",
      submittedAt: "2026-07-16T09:15:00Z",
      fileName: "dev_setup_log.txt",
      fileSize: "45 KB",
      status: "completed",
      feedback: "Verified SSH keys and repository sync. Build and test runs successfully on your local machine. Good work.",
      feedbackAuthor: "Gbolohan Folarin (Senior Developer)",
      feedbackDate: "2026-07-16T11:30:00Z"
    }
  ],
  "task-3": [],
  "task-4": [],
  "task-5": [
    {
      id: "sub-5-1",
      submittedAt: "2026-07-19T10:00:00Z",
      fileName: "PR_405_Review_Comments.pdf",
      fileSize: "1.2 MB",
      status: "needs-revision",
      feedback: "You've missed examining the performance impact of the dynamic charts. Please check if lazy loading is properly implemented.",
      feedbackAuthor: "Amara Ude (Senior Developer)",
      feedbackDate: "2026-07-19T15:45:00Z"
    }
  ],
  "task-6": [
    {
      id: "sub-6-1",
      submittedAt: "2026-07-12T11:00:00Z",
      fileName: "1on1_Intro_Meeting.ics",
      fileSize: "12 KB",
      status: "completed",
      feedback: "Intro meeting scheduled and completed successfully. Expectations are aligned.",
      feedbackAuthor: "Tochukwu Mgbemena (Supervisor)",
      feedbackDate: "2026-07-12T12:00:00Z"
    }
  ],
  "task-7": [],
  "task-8": [
    {
      id: "sub-8-1",
      submittedAt: "2026-07-13T16:20:00Z",
      fileName: "design_system_review.docx",
      fileSize: "320 KB",
      status: "needs-revision",
      feedback: "Please review section 4 on color palettes again. The contrast ratios listed are slightly off standard WCAG guidelines.",
      feedbackAuthor: "Chris (UX Lead)",
      feedbackDate: "2026-07-14T09:00:00Z"
    }
  ]
};
