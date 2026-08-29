const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadController = require("../controller/upload.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// Configure multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Faqat rasm fayllari yuklanishi mumkin! (image/*)"), false);
    }
  },
});

// Upload image route
router.post("/", authenticateToken, upload.single("file"), uploadController.uploadImage);

module.exports = router;
