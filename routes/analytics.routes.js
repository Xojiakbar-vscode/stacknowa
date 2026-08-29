const express = require("express");
const router = express.Router();
const analyticsController = require("../controller/analytics.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// Public track event
router.post("/event", analyticsController.trackEvent);

// Admin summary
router.get("/summary", authenticateToken, analyticsController.getAnalyticsSummary);

module.exports = router;
