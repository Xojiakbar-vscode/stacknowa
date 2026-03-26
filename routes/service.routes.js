const { Router } = require("express");
const service = Router();
const serviceController = require("../controllers/service.controller");

/**
 * @swagger
 * tags:
 *   name: Service
 *   description: Service API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - icon_code
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "Web Development"
 *         description:
 *           type: string
 *           example: "We build modern websites"
 *         icon_code:
 *           type: string
 *           example: "fa-solid fa-code"
 *         order:
 *           type: integer
 *           example: 1
 *         is_active:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /service/post:
 *   post:
 *     summary: Create service
 *     tags: [Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       201:
 *         description: Service created
 */
service.post("/post", serviceController.createService);

/**
 * @swagger
 * /service/getAll:
 *   get:
 *     summary: Get all services
 *     tags: [Service]
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 */
service.get("/getAll", serviceController.getAllServices);

/**
 * @swagger
 * /service/getById/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Service]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Not found
 */
service.get("/getById/:id", serviceController.getServiceById);

/**
 * @swagger
 * /service/update/{id}:
 *   put:
 *     summary: Update service
 *     tags: [Service]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Updated successfully
 */
service.put("/update/:id", serviceController.updateService);

/**
 * @swagger
 * /service/delete/{id}:
 *   delete:
 *     summary: Delete service
 *     tags: [Service]
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
service.delete("/delete/:id", serviceController.deleteService);

module.exports = { service };