const express = require("express");
const router = express.Router();
const resultController = require("../controller/result.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.get("/", resultController.getResults);
router.post("/", authenticateToken, resultController.createResult);
router.put("/:id", authenticateToken, resultController.updateResult);
router.delete("/:id", authenticateToken, resultController.deleteResult);

module.exports = router;
