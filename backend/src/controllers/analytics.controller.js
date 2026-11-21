const { AnalyticsService } = require("../services/analytics.service");

const service = new AnalyticsService();

const getDashboardMetrics = async (req, res) => {
  try {
    const metrics = await service.getDashboardMetrics();

    return res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("DASHBOARD ANALYTICS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard metrics",
    });
  }
};

module.exports = { getDashboardMetrics };
