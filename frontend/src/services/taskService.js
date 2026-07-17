/**
 * @file taskService.js
 * @description Mock service layer for task management.
 * Simulates network requests with Promises and artificial delay.
 */

import { mockTasks, mockTaskComments, mockSubmissions, mockAttachments } from '../data';

// Helper to simulate API delay
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export const taskService = {
  /**
   * Fetch all tasks.
   */
  getTasks: async () => {
    await delay(500);
    // Return a copy of the mock tasks array
    return JSON.parse(JSON.stringify(mockTasks));
  },

  /**
   * Fetch task details by ID, including its attachments, comments, and submission history.
   */
  getTaskById: async (taskId) => {
    await delay(600);
    const tasks = JSON.parse(JSON.stringify(mockTasks));
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found.`);
    }

    // Attach comments, resources, and submissions
    task.attachments = JSON.parse(JSON.stringify(mockAttachments[taskId] || []));
    task.comments = JSON.parse(JSON.stringify(mockTaskComments[taskId] || []));
    task.submissions = JSON.parse(JSON.stringify(mockSubmissions[taskId] || []));

    return task;
  },

  /**
   * Update task status.
   */
  updateTaskStatus: async (taskId, status) => {
    await delay(400);
    // Find task in local data and update status
    const taskIdx = mockTasks.findIndex((t) => t.id === taskId);
    if (taskIdx === -1) {
      throw new Error(`Task with ID ${taskId} not found.`);
    }

    mockTasks[taskIdx].status = status;
    
    // Auto-calculate progress or completion details if finished
    if (status === 'completed') {
      mockTasks[taskIdx].progress = 100;
      mockTasks[taskIdx].completedAt = new Date().toISOString().split('T')[0];
    } else if (status === 'assigned') {
      mockTasks[taskIdx].progress = 0;
    } else if (status === 'in-progress') {
      mockTasks[taskIdx].progress = Math.max(mockTasks[taskIdx].progress, 25);
    }

    return mockTasks[taskIdx];
  },

  /**
   * Upload a deliverable submission (simulated file upload).
   */
  submitTaskDeliverable: async (taskId, fileMetadata) => {
    await delay(1200); // Higher delay for file upload emulation
    
    if (!mockSubmissions[taskId]) {
      mockSubmissions[taskId] = [];
    }

    const newSubmission = {
      id: `sub-${taskId}-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      fileName: fileMetadata.name,
      fileSize: fileMetadata.size,
      status: 'under-review',
      feedback: null,
      feedbackAuthor: null,
      feedbackDate: null
    };

    // Push to local memory
    mockSubmissions[taskId].unshift(newSubmission);

    // Update task status to under-review
    const taskIdx = mockTasks.findIndex((t) => t.id === taskId);
    if (taskIdx !== -1) {
      mockTasks[taskIdx].status = 'under-review';
    }

    return newSubmission;
  },

  /**
   * Fetch comments for a specific task.
   */
  getTaskComments: async (taskId) => {
    await delay(300);
    return JSON.parse(JSON.stringify(mockTaskComments[taskId] || []));
  },

  /**
   * Add a new comment to a task.
   */
  addTaskComment: async (taskId, commentData) => {
    await delay(400);
    if (!mockTaskComments[taskId]) {
      mockTaskComments[taskId] = [];
    }

    const newComment = {
      id: `c-${taskId}-${Date.now()}`,
      authorName: commentData.authorName || "Covenant Effiong",
      authorRole: commentData.authorRole || "Software Engineer Intern",
      avatar: commentData.avatar || "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150",
      timestamp: new Date().toISOString(),
      message: commentData.message
    };

    mockTaskComments[taskId].push(newComment);
    return newComment;
  }
};
