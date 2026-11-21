const Task = require("../models/task.model");

class AnalyticsService {
  async getDashboardMetrics() {
    const stats = await Task.aggregate([
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                pending: {
                  $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                },
                assigned: {
                  $sum: { $cond: [{ $eq: ["$status", "assigned"] }, 1, 0] },
                },
                inProgress: {
                  $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] },
                },
                submitted: {
                  $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] },
                },
                underReview: {
                  $sum: { $cond: [{ $eq: ["$status", "under_review"] }, 1, 0] },
                },
                approved: {
                  $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
                },
                rejected: {
                  $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
                },
                reworkRequired: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "rework_required"] }, 1, 0],
                  },
                },
                completed: {
                  $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                },
              },
            },
          ],
        },
      },
    ]);

    const overview = stats[0].overview[0] || {
      totalTasks: 0,
      pending: 0,
      assigned: 0,
      inProgress: 0,
      submitted: 0,
      underReview: 0,
      approved: 0,
      rejected: 0,
      reworkRequired: 0,
      completed: 0,
    };

    const totalTasks = overview.totalTasks;

    return {
      totalTasks,
      activeTasks:
        overview.pending +
        overview.assigned +
        overview.inProgress +
        overview.submitted +
        overview.underReview +
        overview.reworkRequired,

      completionRate: totalTasks
        ? Number(((overview.completed / totalTasks) * 100).toFixed(1))
        : 0,

      rejectionRate: totalTasks
        ? Number(((overview.rejected / totalTasks) * 100).toFixed(1))
        : 0,

      pipeline: {
        pending: overview.pending,
        assigned: overview.assigned,
        inProgress: overview.inProgress,
        submitted: overview.submitted,
        underReview: overview.underReview,
        approved: overview.approved,
        rejected: overview.rejected,
        reworkRequired: overview.reworkRequired,
        completed: overview.completed,
      },
    };
  }
}

module.exports = { AnalyticsService };
