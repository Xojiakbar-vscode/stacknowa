const { Router } = require("express");
const testimonial = Router();
const testimonialController = require("../controllers/testimonial.controller");
const upload = require("../middleware/upload");

/**
 * @swagger
 * tags:
 *   name: Testimonial
 *   description: Testimonial API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Testimonial:
 *       type: object
 *       required:
 *         - customer_name
 *         - description
 *         - rating
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         customer_name:
 *           type: string
 *           example: "John Doe"
 *         company_name:
 *           type: string
 *           example: "Google"
 *         description:
 *           type: string
 *           example: "Very good service!"
 *         rating:
 *           type: integer
 *           example: 5
 *         image_url:
 *           type: string
 *           example: "https://example.com/image.jpg"
 *         order:
 *           type: integer
 *           example: 1
 *         is_active:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /testimonial/post:
 *   post:
 *     summary: Create Testimonial
 *     tags: [Testimonial]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               customer_name:
 *                 type: string
 *                 example: "John Doe"
 *               company_name:
 *                 type: string
 *                 example: "Google"
 *               description:
 *                 type: string
 *                 example: "Amazing service!"
 *               rating:
 *                 type: integer
 *                 example: 5
 *               image_url:
 *                 type: string
 *                 format: binary
 *                 description: "Upload testimonial image"
 *               order:
 *                 type: integer
 *                 example: 1
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Testimonial created
 */
testimonial.post("/post", upload.single("image_url"), testimonialController.createTestimonial);

/**
 * @swagger
 * /testimonial/getAll:
 *   get:
 *     summary: Get all testimonials
 *     tags: [Testimonial]
 *     responses:
 *       200:
 *         description: List of testimonials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Testimonial'
 */
testimonial.get("/getAll", testimonialController.getAllTestimonials);

/**
 * @swagger
 * /testimonial/getById/{id}:
 *   get:
 *     summary: Get testimonial by ID
 *     tags: [Testimonial]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Testimonial found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Testimonial'
 *       404:
 *         description: Not found
 */
testimonial.get("/getById/:id", testimonialController.getTestimonialById);

/**
 * @swagger
 * /testimonial/update/{id}:
 *   put:
 *     summary: Update testimonial
 *     tags: [Testimonial]
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
 *               customer_name:
 *                 type: string
 *               company_name:
 *                 type: string
 *               description:
 *                 type: string
 *               rating:
 *                 type: integer
 *               image_url:
 *                 type: string
 *                 format: binary
 *               order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated successfully
 */
testimonial.put(
  "/update/:id",
  upload.single("image_url"),
  testimonialController.updateTestimonial
);

/**
 * @swagger
 * /testimonial/delete/{id}:
 *   delete:
 *     summary: Delete testimonial
 *     tags: [Testimonial]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
testimonial.delete("/delete/:id", testimonialController.deleteTestimonial);

module.exports = { testimonial };