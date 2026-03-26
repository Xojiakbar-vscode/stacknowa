const { Router } = require("express");
const homeBanner = Router();
const homeBannerController = require("../controllers/homeBanner.controller");
const upload = require("../middleware/upload");

/**
 * @swagger
 * tags:
 *   name: HomeBanner
 *   description: Home Banner API
 */

/**
 * @swagger
 * /homeBanner/post:
 *   post:
 *     summary: Create Home Banner
 *     tags: [HomeBanner]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Welcome"
 *               description:
 *                 type: string
 *                 example: "Main banner text"
 *               image_url:
 *                 type: string
 *                 format: binary
 *                 description: "Upload banner image"
 *               button_text:
 *                 type: string
 *                 example: "Learn More"
 *               button_link:
 *                 type: string
 *                 example: "https://example.com"
 *               order:
 *                 type: integer
 *                 example: 1
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Created
 */
homeBanner.post("/post", upload.single("image_url"), homeBannerController.createBanner);

/**
 * @swagger
 * /homeBanner/getAll:
 *   get:
 *     summary: Get all banners
 *     tags: [HomeBanner]
 *     responses:
 *       200:
 *         description: Success
 */
homeBanner.get("/getAll", homeBannerController.getAllBanners);

/**
 * @swagger
 * /homeBanner/getById/{id}:
 *   get:
 *     summary: Get banner by ID
 *     tags: [HomeBanner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
homeBanner.get("/getById/:id", homeBannerController.getBannerById);

/**
 * @swagger
 * /homeBanner/update/{id}:
 *   put:
 *     summary: Update banner
 *     tags: [HomeBanner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *                 format: binary
 *               button_text:
 *                 type: string
 *               button_link:
 *                 type: string
 *               order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated
 */
homeBanner.put(
  "/update/:id",
  upload.single("image_url"), // multer bilan rasm upload
  homeBannerController.updateBanner
);

/**
 * @swagger
 * /homeBanner/delete/{id}:
 *   delete:
 *     summary: Delete banner
 *     tags: [HomeBanner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
homeBanner.delete("/delete/:id", homeBannerController.deleteBanner);

module.exports = { homeBanner };