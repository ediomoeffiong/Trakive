/**
 * @file performanceScores.js
 * @description Mock performance score data across review periods for chart visualization.
 */

/** Line / Bar chart — scores per review period */
export const mockPerformanceTrends = [
  {
    period: 'Week 2',
    overall: 82,
    productivity: 80,
    quality: 85,
    communication: 75,
    initiative: 82,
    teamwork: 88,
  },
  {
    period: 'Week 4',
    overall: 91,
    productivity: 94,
    quality: 95,
    communication: 88,
    initiative: 92,
    teamwork: 86,
  },
  {
    period: 'Month 1',
    overall: 88,
    productivity: 87,
    quality: 92,
    communication: 85,
    initiative: 90,
    teamwork: 86,
  },
];

/** Radar chart data — latest period breakdown */
export const mockRadarData = [
  { subject: 'Productivity', score: 87, fullMark: 100 },
  { subject: 'Quality',      score: 92, fullMark: 100 },
  { subject: 'Communication',score: 85, fullMark: 100 },
  { subject: 'Initiative',   score: 90, fullMark: 100 },
  { subject: 'Teamwork',     score: 86, fullMark: 100 },
];

/** Summary stats */
export const mockPerformanceSummary = {
  overallScore: 88,
  completedReviews: 3,
  nextReviewDate: '2026-07-31',
  averageRating: 87,
  trend: 'up',        // 'up' | 'down' | 'stable'
  trendDelta: '+6',   // change from previous period
};
