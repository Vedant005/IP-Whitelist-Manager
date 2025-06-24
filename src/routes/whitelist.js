import express from "express";
import {
  createWhiteListEntry,
  deleteWhitelistEntry,
  getAllWhitelistEntries,
  getWhiteListEntry,
  updateWhitelistEntry,
} from "../controllers/whitelist.controller.js";

import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { whitelistCreateLimiter } from "../middlewares/ratelimit.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Whitelist Management
 *   description: API for managing IP whitelist entries
 */

/**
 * @swagger
 * /api/v1/whitelist:
 *   get:
 *     summary: Get all whitelisted entries
 *     tags: [Whitelist Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of whitelist entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WhitelistEntry'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */
router.route("/").get(verifyJWT, getAllWhitelistEntries);

/**
 * @swagger
 * /api/v1/whitelist/{id}:
 *   get:
 *     summary: Get a whitelisted entry by ID
 *     tags: [Whitelist Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 60c72b2f9c1a4d0015f8a3d5
 *     responses:
 *       200:
 *         description: Whitelist entry found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/WhitelistEntry' }
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Entry not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */
router.route("/:id").get(verifyJWT, getWhiteListEntry);

/**
 * @swagger
 * /api/v1/whitelist:
 *   post:
 *     summary: Create a new whitelist entry (Admin only)
 *     tags: [Whitelist Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ipAddress, serviceName]
 *             properties:
 *               ipAddress:
 *                 type: string
 *                 example: 192.168.1.100
 *               serviceName:
 *                 type: string
 *                 example: api-gateway
 *               description:
 *                 type: string
 *                 example: Office main IP
 *     responses:
 *       201:
 *         description: Entry created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/WhitelistEntry' }
 *       400:
 *         description: Invalid input or duplicate entry
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Server error
 */
router
  .route("/")
  .post(
    verifyJWT,
    authorizeRoles("admin"),
    whitelistCreateLimiter,
    createWhiteListEntry
  );

/**
 * @swagger
 * /api/v1/whitelist/{id}:
 *   put:
 *     summary: Update a whitelist entry by ID (Admin only)
 *     tags: [Whitelist Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 60c72b2f9c1a4d0015f8a3d5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ipAddress:
 *                 type: string
 *                 example: 192.168.1.101
 *               serviceName:
 *                 type: string
 *                 example: web-app
 *               description:
 *                 type: string
 *                 example: Updated office IP
 *     responses:
 *       200:
 *         description: Entry updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/WhitelistEntry' }
 *       400:
 *         description: Invalid input or ID
 *       404:
 *         description: Entry not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Server error
 */
router
  .route("/:id")
  .put(verifyJWT, authorizeRoles("admin"), updateWhitelistEntry);

/**
 * @swagger
 * /api/v1/whitelist/{id}:
 *   delete:
 *     summary: Delete a whitelist entry by ID (Admin only)
 *     tags: [Whitelist Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 60c72b2f9c1a4d0015f8a3d5
 *     responses:
 *       200:
 *         description: Entry deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Whitelist entry deleted successfully }
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Entry not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Server error
 */
router
  .route("/:id")
  .delete(verifyJWT, authorizeRoles("admin"), deleteWhitelistEntry);

export default router;
