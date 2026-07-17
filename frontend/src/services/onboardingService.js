/**
 * @file onboardingService.js
 * @description Mock service layer for onboarding tasks and verification status.
 */

import { mockOnboardingSteps } from '../data/onboardingSteps';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Keep local in-memory reference to allow changes during the session
let localSteps = [...mockOnboardingSteps];

export const onboardingService = {
  /**
   * Fetch all onboarding steps.
   */
  getChecklist: async () => {
    await delay(600);
    return JSON.parse(JSON.stringify(localSteps));
  },

  /**
   * Update a step status.
   */
  updateStepStatus: async (stepId, status) => {
    await delay(400);
    const index = localSteps.findIndex((s) => s.id === stepId);
    if (index === -1) {
      throw new Error(`Step with ID ${stepId} not found.`);
    }

    localSteps[index].status = status;
    return { ...localSteps[index] };
  },

  /**
   * Mock document upload with progress simulation.
   */
  uploadDocument: async (stepId, file, onProgress) => {
    // 1. Validation
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Supported types: PDF, DOCX, JPG, PNG.");
    }
    if (file.size > maxSizeBytes) {
      throw new Error("File exceeds the maximum size limit of 5MB.");
    }

    // 2. Simulate progress bar
    for (let percent = 10; percent <= 100; percent += 15) {
      await delay(150);
      if (onProgress) {
        onProgress(Math.min(percent, 100));
      }
    }

    // 3. Update store/local array with uploaded file
    const index = localSteps.findIndex((s) => s.id === stepId);
    if (index === -1) {
      throw new Error(`Step with ID ${stepId} not found.`);
    }

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: localSteps[index].requiresVerification ? "pending" : "completed"
    };

    localSteps[index].uploadedDocuments = [...(localSteps[index].uploadedDocuments || []), newDoc];

    // If verification is required, set step status to awaiting_verification
    if (localSteps[index].requiresVerification) {
      localSteps[index].status = "awaiting_verification";
    } else {
      localSteps[index].status = "completed";
    }

    return { step: { ...localSteps[index] }, document: newDoc };
  },

  /**
   * Remove an uploaded document from a step.
   */
  removeDocument: async (stepId, docId) => {
    await delay(300);
    const index = localSteps.findIndex((s) => s.id === stepId);
    if (index === -1) {
      throw new Error(`Step with ID ${stepId} not found.`);
    }

    localSteps[index].uploadedDocuments = localSteps[index].uploadedDocuments.filter((d) => d.id !== docId);

    // Revert status if all documents are removed
    if (localSteps[index].uploadedDocuments.length === 0) {
      localSteps[index].status = "in_progress";
    }

    return { ...localSteps[index] };
  },

  /**
   * Simulate a supervisor review response (approval / rejection).
   */
  verifyStep: async (stepId, approve = true, rejectionNotes = "") => {
    await delay(2000); // 2 seconds delay to simulate real-time notification
    const index = localSteps.findIndex((s) => s.id === stepId);
    if (index === -1) {
      throw new Error(`Step with ID ${stepId} not found.`);
    }

    const nextStatus = approve ? "verified" : "rejected";
    localSteps[index].status = nextStatus;

    // Update history
    const historyItem = {
      id: `vh-${Date.now()}`,
      status: nextStatus,
      reviewer: "Sarah Jenkins (Engineering Manager)",
      date: new Date().toISOString(),
      notes: approve ? "All requirements look great. Ready to proceed!" : rejectionNotes || "Document scan is blurry. Please upload a clear image."
    };

    localSteps[index].verificationHistory = [historyItem, ...(localSteps[index].verificationHistory || [])];

    // Update uploaded documents status
    localSteps[index].uploadedDocuments = localSteps[index].uploadedDocuments.map((doc) => ({
      ...doc,
      status: approve ? "verified" : "rejected"
    }));

    return { ...localSteps[index] };
  },

  /**
   * Reset all onboarding steps (for testing/demo purposes).
   */
  resetOnboarding: async () => {
    await delay(300);
    localSteps = JSON.parse(JSON.stringify(mockOnboardingSteps));
    return [...localSteps];
  }
};
