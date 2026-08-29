const express = require("express");
const router = express.Router();
const leadController = require("../controller/lead.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { leadRateLimiter } = require("../middleware/rateLimiter.middleware");

// Public lead submission with strict rate limiter (max 3 req/sec, 15-min IP block)
router.post("/", leadRateLimiter, leadController.createLead);

// Protected Admin pipeline endpoints
router.get("/", authenticateToken, leadController.getLeads);
router.patch("/:id/status", authenticateToken, leadController.updateLeadStatus);
router.delete("/:id", authenticateToken, leadController.deleteLead);

module.exports = router;
