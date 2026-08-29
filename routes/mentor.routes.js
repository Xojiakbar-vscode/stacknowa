const express = require("express");
const router = express.Router();
const mentorController = require("../controller/mentor.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// Public endpoints
router.get("/", mentorController.getMentors);
router.get("/:id", mentorController.getMentorById);

// Protected Admin endpoints
router.post("/", authenticateToken, mentorController.createMentor);
router.put("/:id", authenticateToken, mentorController.updateMentor);
router.delete("/:id", authenticateToken, mentorController.deleteMentor);

module.exports = router;
