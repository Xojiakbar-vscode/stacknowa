const express = require("express");
const router = express.Router();
const statController = require("../controller/stat.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.get("/", statController.getStats);
router.post("/", authenticateToken, statController.createStat);
router.put("/:id", authenticateToken, statController.updateStat);

module.exports = router;
