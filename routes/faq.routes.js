const express = require("express");
const router = express.Router();
const faqController = require("../controller/faq.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.get("/", faqController.getFaqs);
router.post("/", authenticateToken, faqController.createFaq);
router.put("/:id", authenticateToken, faqController.updateFaq);
router.delete("/:id", authenticateToken, faqController.deleteFaq);

module.exports = router;
