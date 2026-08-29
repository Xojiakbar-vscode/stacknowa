const express = require("express");
const router = express.Router();
const grantController = require("../controller/grant.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// Public endpoints
router.get("/config", grantController.getGrantExamConfig);
router.get("/questions", grantController.getGrantQuestions);

// Protected Admin endpoints
router.put("/config", authenticateToken, grantController.updateGrantExamConfig);
router.post("/questions", authenticateToken, grantController.createGrantQuestion);
router.put("/questions/:id", authenticateToken, grantController.updateGrantQuestion);
router.delete("/questions/:id", authenticateToken, grantController.deleteGrantQuestion);
router.get("/participants", authenticateToken, grantController.getGrantParticipants);
router.post("/broadcast", authenticateToken, grantController.sendBroadcastMessage);

module.exports = router;
