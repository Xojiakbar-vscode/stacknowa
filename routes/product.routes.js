const { Router } = require("express");
const product = Router();
const productController = require("../controllers/product.controller");
const upload = require("../middleware/upload");

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - image_url
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "Portfolio Website"
 *         description:
 *           type: string
 *           example: "Modern React + Node.js project"
 *         image_url:
 *           type: string
 *           example: "https://example.com/image.jpg"
 *         project_link:
 *           type: string
 *           example: "https://mysite.com"
 *         github_link:
 *           type: string
 *           example: "https://github.com/user/repo"
 *         technologies:
 *           type: array
 *           items:
 *             type: string
 *           example: ["React", "Node.js", "PostgreSQL"]
 *         order:
 *           type: integer
 *           example: 1
 *         is_active:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /product/post:
 *   post:
 *     summary: Create Product
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Portfolio Website"
 *               description:
 *                 type: string
 *                 example: "Modern React + Node.js project"
 *               image_url:
 *                 type: string
 *                 format: binary
 *                 description: "Upload product image"
 *               project_link:
 *                 type: string
 *                 example: "https://mysite.com"
 *               github_link:
 *                 type: string
 *                 example: "https://github.com/user/repo"
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["React", "Node.js", "PostgreSQL"]
 *               order:
 *                 type: integer
 *                 example: 1
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Product created
 */
product.post("/post", upload.single("image_url"), productController.createProduct);

/**
 * @swagger
 * /product/getAll:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
product.get("/getAll", productController.getAllProducts);

/**
 * @swagger
 * /product/getById/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Not found
 */
product.get("/getById/:id", productController.getProductById);

/**
 * @swagger
 * /product/update/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Product]
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
 *               project_link:
 *                 type: string
 *               github_link:
 *                 type: string
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *               order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated successfully
 */
product.put("/update/:id", upload.single("image_url"), productController.updateProduct);

/**
 * @swagger
 * /product/delete/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Product]
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
product.delete("/delete/:id", productController.deleteProduct);

module.exports = { product };