const { query } = require('../config/db');
const ApiError = require('../utils/apiError');

const WEEKLY_STATUS_MAP = {
  reviewed: 'published',
  submitted: 'scheduled',
  requires_changes: 'pending-self-assessment',
  open: 'scheduled',
};

const toReview = (row) => {
  const metrics = row.metrics || {};
  return {
    id: row.id,
    period: row.period_label || `${row.period_start} - ${row.period_end}`,
    title: row.title || 'Performance Review',
    status: row.status === 'published' || row.status === 'draft' ? (row.status === 'draft' ? 'scheduled' : 'published') : row.status,
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

const toWeeklyReview = (row) => {
  const weekLabel = `${row.week_start} - ${row.week_end}`;
  return {
    id: row.id,
    period: weekLabel,
    title: `Weekly Review · ${weekLabel}`,
    status: WEEKLY_STATUS_MAP[row.status] || 'scheduled',
    overallScore: null,
    reviewerName: row.evaluator_first_name
      ? `${row.evaluator_first_name} ${row.evaluator_last_name || ''}`.trim()
      : 'Supervisor',
    reviewerRole: row.evaluator_role || 'Supervisor',
    reviewDate: row.reviewed_at || row.submitted_at || row.updated_at,
    summary: row.reviewer_feedback || '',
    strengths: [],
    areasForImprovement: [],
    recommendation: '',
    scheduledAt: row.week_end,
    nextReviewDate: row.status === 'submitted' ? row.week_end : null,
    metrics: { source: 'weekly_plan' },
  };
};

const toTaskReview = (row) => ({
  id: row.id,
  period: row.due_date ? String(row.due_date).slice(0, 10) : 'Task Review',
  title: row.title || 'Task Review',
  status: 'published',
  overallScore: row.rating == null ? null : Number(row.rating) * 20,
  reviewerName: row.evaluator_first_name
    ? `${row.evaluator_first_name} ${row.evaluator_last_name || ''}`.trim()
    : 'Supervisor',
  reviewerRole: row.evaluator_role || 'Supervisor',
  reviewDate: row.reviewed_at || row.created_at,
  summary: row.feedback || '',
  strengths: [],
  areasForImprovement: [],
  recommendation: row.status || '',
  scheduledAt: row.reviewed_at,
  nextReviewDate: null,
  metrics: { source: 'task_review', rating: row.rating },
});

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

const sortByDateDesc = (items) =>
  items.sort((a, b) => new Date(b.reviewDate || b.scheduledAt || 0) - new Date(a.reviewDate || a.scheduledAt || 0));

const ReviewService = {
  async listInternReviews(requestingUser) {
    const [reports, weekly, taskReviews] = await Promise.all([
      query(
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
      ),
      query(
        `SELECT
           wp.*,
           evaluator.first_name AS evaluator_first_name,
           evaluator.last_name AS evaluator_last_name,
           roles.name AS evaluator_role
         FROM weekly_plans wp
         LEFT JOIN users evaluator ON evaluator.id = wp.reviewer_id
         LEFT JOIN roles ON roles.id = evaluator.role_id
         WHERE wp.intern_id = $1
           AND wp.status IN ('submitted', 'reviewed', 'requires_changes')
         ORDER BY wp.week_start DESC`,
        [requestingUser.id]
      ),
      query(
        `SELECT
           tr.*,
           t.title,
           t.due_date,
           reviewer.first_name AS evaluator_first_name,
           reviewer.last_name AS evaluator_last_name,
           roles.name AS evaluator_role
         FROM task_reviews tr
         JOIN tasks t ON t.id = tr.task_id
         LEFT JOIN users reviewer ON reviewer.id = tr.reviewer_id
         LEFT JOIN roles ON roles.id = reviewer.role_id
         WHERE t.assignee_id = $1
         ORDER BY tr.reviewed_at DESC`,
        [requestingUser.id]
      ),
    ]);

    return sortByDateDesc([
      ...reports.rows.map(toReview),
      ...weekly.rows.map(toWeeklyReview),
      ...taskReviews.rows.map(toTaskReview),
    ]);
  },

  async getInternReviewById(reviewId, requestingUser) {
    const reportRes = await query(
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
    if (reportRes.rows[0]) return toReview(reportRes.rows[0]);

    const weeklyRes = await query(
      `SELECT
         wp.*,
         evaluator.first_name AS evaluator_first_name,
         evaluator.last_name AS evaluator_last_name,
         roles.name AS evaluator_role
       FROM weekly_plans wp
       LEFT JOIN users evaluator ON evaluator.id = wp.reviewer_id
       LEFT JOIN roles ON roles.id = evaluator.role_id
       WHERE wp.id = $1
         AND wp.intern_id = $2
       LIMIT 1`,
      [reviewId, requestingUser.id]
    );
    if (weeklyRes.rows[0]) return toWeeklyReview(weeklyRes.rows[0]);

    const taskRes = await query(
      `SELECT
         tr.*,
         t.title,
         t.due_date,
         reviewer.first_name AS evaluator_first_name,
         reviewer.last_name AS evaluator_last_name,
         roles.name AS evaluator_role
       FROM task_reviews tr
       JOIN tasks t ON t.id = tr.task_id
       LEFT JOIN users reviewer ON reviewer.id = tr.reviewer_id
       LEFT JOIN roles ON roles.id = reviewer.role_id
       WHERE tr.id = $1
         AND t.assignee_id = $2
       LIMIT 1`,
      [reviewId, requestingUser.id]
    );
    if (taskRes.rows[0]) return toTaskReview(taskRes.rows[0]);

    throw ApiError.notFound('Review not found');
  },

  async getPerformanceTrends(requestingUser) {
    const [reports, taskReviews] = await Promise.all([
      query(
        `SELECT period_start, period_end, overall_score, metrics, created_at
         FROM reports
         WHERE intern_id = $1
           AND status = 'published'
           AND overall_score IS NOT NULL
         ORDER BY period_end ASC, created_at ASC`,
        [requestingUser.id]
      ),
      query(
        `SELECT tr.rating, tr.reviewed_at, t.title
         FROM task_reviews tr
         JOIN tasks t ON t.id = tr.task_id
         WHERE t.assignee_id = $1
           AND tr.rating IS NOT NULL
         ORDER BY tr.reviewed_at ASC`,
        [requestingUser.id]
      ),
    ]);

    const trends = [
      ...reports.rows.map((row, index) => {
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
      }),
      ...taskReviews.rows.map((row) => {
        const overall = Number(row.rating) * 20;
        return {
          period: row.title || 'Task Review',
          overall,
          productivity: overall,
          quality: overall,
          communication: overall,
          initiative: overall,
          teamwork: overall,
        };
      }),
    ];

    if (trends.length === 0) {
      return emptyTrends;
    }

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
