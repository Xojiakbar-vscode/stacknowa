const express = require("express");
const router = express.Router();
const courseController = require("../controller/course.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// Public endpoints
router.get("/", courseController.getCourses);
router.get("/:identifier", courseController.getCourseBySlugOrId);

// Protected Admin endpoints
router.post("/", authenticateToken, courseController.createCourse);
router.put("/:id", authenticateToken, courseController.updateCourse);
router.delete("/:id", authenticateToken, courseController.deleteCourse);

module.exports = router;
