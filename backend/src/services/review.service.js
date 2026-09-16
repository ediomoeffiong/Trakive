const { query } = require('../config/db');
const ApiError = require('../utils/apiError');

const toReview = (row) => {
  const metrics = row.metrics || {};
  return {
    id: row.id,
    period: row.period_label || `${row.period_start} - ${row.period_end}`,
    title: row.title || 'Performance Review',
    status: row.status === 'published' ? 'published' : row.status,
    overallScore: row.overall_score === null || row.overall_score === undefined ? null : Number(row.overall_score),
    reviewerName: row.evaluator_first_name
      ? `${row.evaluator_first_name} ${row.evaluator_last_name || ''}`.trim()
      : 'Supervisor',
    reviewerRole: row.evaluator_role || 'Supervisor',
    reviewDate: row.updated_at || row.created_at,
    summary: row.feedback || '',
    strengths: metrics.strengths || [],
    areasForImprovement: metrics.areasForImprovement || metrics.improvements || [],
    recommendation: metrics.recommendation || '',
    scheduledAt: row.period_end,
    nextReviewDate: metrics.nextReviewDate || null,
    metrics,
  };
};

const emptyTrends = {
  trends: [],
  radarData: [],
  summary: {
    overallScore: 0,
    completedReviews: 0,
    nextReviewDate: null,
    averageRating: 0,
    trend: 'stable',
    trendDelta: '0',
  },
};

const ReviewService = {
  async listInternReviews(requestingUser) {
    const res = await query(
      `SELECT
         r.*,
         evaluator.first_name AS evaluator_first_name,
         evaluator.last_name AS evaluator_last_name,
         roles.name AS evaluator_role
       FROM reports r
       LEFT JOIN users evaluator ON evaluator.id = r.evaluator_id
       LEFT JOIN roles ON roles.id = evaluator.role_id
       WHERE r.intern_id = $1
         AND r.status IN ('published', 'draft')
       ORDER BY r.period_end DESC, r.created_at DESC`,
      [requestingUser.id]
    );

    return res.rows.map(toReview);
  },

  async getInternReviewById(reviewId, requestingUser) {
    const res = await query(
      `SELECT
         r.*,
         evaluator.first_name AS evaluator_first_name,
         evaluator.last_name AS evaluator_last_name,
         roles.name AS evaluator_role
       FROM reports r
       LEFT JOIN users evaluator ON evaluator.id = r.evaluator_id
       LEFT JOIN roles ON roles.id = evaluator.role_id
       WHERE r.id = $1
         AND r.intern_id = $2
       LIMIT 1`,
      [reviewId, requestingUser.id]
    );

    if (!res.rows[0]) {
      throw ApiError.notFound('Review not found');
    }

    return toReview(res.rows[0]);
  },

  async getPerformanceTrends(requestingUser) {
    const res = await query(
      `SELECT period_start, period_end, overall_score, metrics
       FROM reports
       WHERE intern_id = $1
         AND status = 'published'
         AND overall_score IS NOT NULL
       ORDER BY period_end ASC, created_at ASC`,
      [requestingUser.id]
    );

    if (res.rows.length === 0) {
      return emptyTrends;
    }

    const trends = res.rows.map((row, index) => {
      const metrics = row.metrics || {};
      return {
        period: metrics.periodLabel || `Review ${index + 1}`,
        overall: Number(row.overall_score || 0),
        productivity: Number(metrics.productivity ?? row.overall_score ?? 0),
        quality: Number(metrics.quality ?? row.overall_score ?? 0),
        communication: Number(metrics.communication ?? row.overall_score ?? 0),
        initiative: Number(metrics.initiative ?? row.overall_score ?? 0),
        teamwork: Number(metrics.teamwork ?? row.overall_score ?? 0),
      };
    });

    const latest = trends[trends.length - 1];
    const previous = trends[trends.length - 2];
    const delta = previous ? Math.round(latest.overall - previous.overall) : 0;

    return {
      trends,
      radarData: [
        { subject: 'Productivity', score: latest.productivity, fullMark: 100 },
        { subject: 'Quality', score: latest.quality, fullMark: 100 },
        { subject: 'Communication', score: latest.communication, fullMark: 100 },
        { subject: 'Initiative', score: latest.initiative, fullMark: 100 },
        { subject: 'Teamwork', score: latest.teamwork, fullMark: 100 },
      ],
      summary: {
        overallScore: latest.overall,
        completedReviews: trends.length,
        nextReviewDate: null,
        averageRating: Math.round(trends.reduce((sum, item) => sum + item.overall, 0) / trends.length),
        trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable',
        trendDelta: `${delta > 0 ? '+' : ''}${delta}`,
      },
    };
  },

  async getDevelopmentGoals(requestingUser) {
    const res = await query(
      `SELECT id, period_end, feedback, metrics
       FROM reports
       WHERE intern_id = $1
         AND status = 'published'
       ORDER BY period_end DESC, created_at DESC
       LIMIT 5`,
      [requestingUser.id]
    );

    return res.rows.flatMap((row) => {
      const metrics = row.metrics || {};
      const goals = metrics.goals || metrics.developmentGoals || [];
      return Array.isArray(goals)
        ? goals.map((goal, index) => ({
            id: goal.id || `${row.id}-goal-${index + 1}`,
            title: goal.title || 'Development Goal',
            description: goal.description || goal.notes || row.feedback || '',
            progress: Number(goal.progress || 0),
            status: goal.status || 'in-progress',
            targetDate: goal.targetDate || null,
            sourceReviewId: row.id,
            sourceReviewTitle: goal.sourceReviewTitle || 'Performance Review',
            category: goal.category || 'growth',
          }))
        : [];
    });
  },

  async submitSelfAssessment(reviewId, formData, requestingUser) {
    const review = await this.getInternReviewById(reviewId, requestingUser);
    return {
      reviewId: review.id,
      submittedAt: new Date().toISOString(),
      selfAssessment: formData,
    };
  },
};

module.exports = ReviewService;
