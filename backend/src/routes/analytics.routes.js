const { Router } = require("express");
const { authenticate } = require("../middleware/auth.middleware");
const { getDashboardMetrics } = require("../controllers/analytics.controller");

const router = Router();

router.get("/dashboard", authenticate, getDashboardMetrics);

module.exports = router;
