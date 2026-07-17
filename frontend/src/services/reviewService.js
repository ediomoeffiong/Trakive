/**
 * @file reviewService.js
 * @description Mock service layer for the Performance Reviews module.
 * Simulates network requests with Promises and artificial delays.
 * Structured for easy replacement with real API calls.
 */

import {
  mockReviews,
  mockReviewDetails,
  mockPerformanceTrends,
  mockRadarData,
  mockPerformanceSummary,
  mockDevelopmentGoals,
  mockReviewTimelines,
} from '../data';

// Helper to simulate API delay
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export const reviewService = {
  /**
   * Fetch all reviews for the current intern.
   */
  getReviews: async () => {
    await delay(700);
    return JSON.parse(JSON.stringify(mockReviews));
  },

  /**
   * Fetch detailed data for a single review by ID.
   */
  getReviewById: async (reviewId) => {
    await delay(800);
    const detail = mockReviewDetails[reviewId];
    if (!detail) {
      throw new Error(`Review with ID "${reviewId}" not found.`);
    }
    // Attach timeline events
    const timeline = mockReviewTimelines[reviewId] ?? [];
    return {
      ...JSON.parse(JSON.stringify(detail)),
      timeline: JSON.parse(JSON.stringify(timeline)),
    };
  },

  /**
   * Submit the intern's self-assessment form.
   */
  submitSelfAssessment: async (reviewId, formData) => {
    await delay(1000);
    // In a real implementation this would POST to the API.
    // We just return a mock success response here.
    return {
      success: true,
      reviewId,
      submittedAt: new Date().toISOString(),
      data: formData,
    };
  },

  /**
   * Fetch performance trend data for charts.
   */
  getPerformanceTrends: async () => {
    await delay(600);
    return {
      trends: JSON.parse(JSON.stringify(mockPerformanceTrends)),
      radarData: JSON.parse(JSON.stringify(mockRadarData)),
      summary: JSON.parse(JSON.stringify(mockPerformanceSummary)),
    };
  },

  /**
   * Fetch the intern's development goals.
   */
  getDevelopmentGoals: async () => {
    await delay(500);
    return JSON.parse(JSON.stringify(mockDevelopmentGoals));
  },
};
