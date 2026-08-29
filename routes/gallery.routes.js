const express = require("express");
const router = express.Router();
const galleryController = require("../controller/gallery.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.get("/", galleryController.getGallery);
router.post("/", authenticateToken, galleryController.createGalleryItem);
router.delete("/:id", authenticateToken, galleryController.deleteGalleryItem);

module.exports = router;
