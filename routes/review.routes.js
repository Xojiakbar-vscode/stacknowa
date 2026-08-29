const express = require("express");
const router = express.Router();
const reviewController = require("../controller/review.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.get("/", reviewController.getReviews);
router.get("/admin", authenticateToken, reviewController.getAllReviewsAdmin);
router.post("/", authenticateToken, reviewController.createReview);
router.put("/:id", authenticateToken, reviewController.updateReview);
router.delete("/:id", authenticateToken, reviewController.deleteReview);

module.exports = router;
