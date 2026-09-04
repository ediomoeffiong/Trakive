/**
 * @file onboardingService.js
 * @description Mock service layer for onboarding tasks and verification status.
 */

import { mockOnboardingSteps } from '../data/onboardingSteps';
import { useAppStore } from '../store/useAppStore';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const isDemoUser = () => {
  try {
    const user = useAppStore.getState()?.user;
    if (!user) return false;
    const demoIds = ['u-1', 'u-2', 'u-3', 'u-4'];
    const demoEmails = ['intern@trakive.com', 'supervisor@trakive.com', 'hr@trakive.com', 'head@trakive.com'];
    return demoIds.includes(user.id) || demoEmails.includes(user.email?.toLowerCase());
  } catch {
    return false;
  }
};

const getCleanOnboardingSteps = () => {
  return mockOnboardingSteps.map((step) => ({
    ...step,
    status: 'not_started',
    uploadedDocuments: [],
    verificationHistory: [],
  }));
};

let localSteps = [...mockOnboardingSteps];

const getUserSteps = () => {
  if (isDemoUser()) {
    return localSteps;
  }
  const user = useAppStore.getState()?.user;
  const key = `trakive_user_onboarding_${user?.id || 'new'}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    return JSON.parse(saved);
  }
  const clean = getCleanOnboardingSteps();
  localStorage.setItem(key, JSON.stringify(clean));
  return clean;
};

const saveUserSteps = (steps) => {
  if (isDemoUser()) {
    localSteps = steps;
    return;
  }
  const user = useAppStore.getState()?.user;
  const key = `trakive_user_onboarding_${user?.id || 'new'}`;
  localStorage.setItem(key, JSON.stringify(steps));
};

export const onboardingService = {
  /**
   * Fetch all onboarding steps.
   */
  getChecklist: async () => {
    await delay(400);
    const steps = getUserSteps();
    return JSON.parse(JSON.stringify(steps));
  },

  /**
   * Update a step status.
   */
  updateStepStatus: async (stepId, status) => {
    await delay(400);
    const currentSteps = getUserSteps();
    const index = currentSteps.findIndex((s) => s.id === stepId);
    if (index === -1) {
      throw new Error(`Step with ID ${stepId} not found.`);
    }

    currentSteps[index].status = status;
    saveUserSteps(currentSteps);
    return { ...currentSteps[index] };
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
      await delay(100);
      if (onProgress) {
        onProgress(Math.min(percent, 100));
      }
    }

    // 3. Update store/local array with uploaded file
    const currentSteps = getUserSteps();
    const index = currentSteps.findIndex((s) => s.id === stepId);
    if (index === -1) {
      throw new Error(`Step with ID ${stepId} not found.`);
    }

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: currentSteps[index].requiresVerification ? "pending" : "completed"
    };

    currentSteps[index].uploadedDocuments = [...(currentSteps[index].uploadedDocuments || []), newDoc];

    // If verification is required, set step status to awaiting_verification
    if (currentSteps[index].requiresVerification) {
      currentSteps[index].status = "awaiting_verification";
    } else {
      currentSteps[index].status = "completed";
    }

    saveUserSteps(currentSteps);
    return { step: { ...currentSteps[index] }, document: newDoc };
  },

  /**
   * Remove an uploaded document from a step.
   */
  removeDocument: async (stepId, docId) => {
    await delay(300);
    const currentSteps = getUserSteps();
    const index = currentSteps.findIndex((s) => s.id === stepId);
    if (index === -1) {
      throw new Error(`Step with ID ${stepId} not found.`);
    }

    currentSteps[index].uploadedDocuments = currentSteps[index].uploadedDocuments.filter((d) => d.id !== docId);

    // Revert status if all documents are removed
    if (currentSteps[index].uploadedDocuments.length === 0) {
      currentSteps[index].status = "not_started";
    }

    saveUserSteps(currentSteps);
    return { ...currentSteps[index] };
  },

  /**
   * Simulate a supervisor review response (approval / rejection).
   */
  verifyStep: async (stepId, approve = true, rejectionNotes = "") => {
    await delay(1000);
    const currentSteps = getUserSteps();
    const index = currentSteps.findIndex((s) => s.id === stepId);
    if (index === -1) {
      throw new Error(`Step with ID ${stepId} not found.`);
    }

    const nextStatus = approve ? "verified" : "rejected";
    currentSteps[index].status = nextStatus;

    // Update history
    const historyItem = {
      id: `vh-${Date.now()}`,
      status: nextStatus,
      reviewer: "Supervisor Reviewer",
      date: new Date().toISOString(),
      notes: approve ? "All requirements look great. Ready to proceed!" : rejectionNotes || "Document scan is blurry. Please upload a clear image."
    };

    currentSteps[index].verificationHistory = [historyItem, ...(currentSteps[index].verificationHistory || [])];

    // Update uploaded documents status
    currentSteps[index].uploadedDocuments = currentSteps[index].uploadedDocuments.map((doc) => ({
      ...doc,
      status: approve ? "verified" : "rejected"
    }));

    saveUserSteps(currentSteps);
    return { ...currentSteps[index] };
  },

  /**
   * Reset all onboarding steps (for testing/demo purposes).
   */
  resetOnboarding: async () => {
    await delay(300);
    if (isDemoUser()) {
      localSteps = JSON.parse(JSON.stringify(mockOnboardingSteps));
      return [...localSteps];
    }
    const clean = getCleanOnboardingSteps();
    saveUserSteps(clean);
    return clean;
  }
};
