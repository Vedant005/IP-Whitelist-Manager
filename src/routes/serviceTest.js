import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import enforceIpWhitelist from "../middlewares/access.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Protected Services (Test)
 *   description: Endpoints to test JWT and IP whitelist enforcement
 */

/**
 * @swagger
 * /api/v1/service/verifyJWTed-resource-1:
 *   get:
 *     summary: Access Resource 1 (JWT + IP Whitelist)
 *     tags: [Protected Services (Test)]
 *     description: Requires valid JWT and IP whitelisted for 'service-1'.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Access granted to verifyJWTed Resource 1. Your IP (192.168.1.100) is whitelisted for 'service-1'. }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied due to IP restrictions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 message: { type: string, example: Access denied. Your IP (192.168.1.50) is not whitelisted for this service. }
 *       500:
 *         description: Server error
 */
router.get(
  "/verifyJWTed-resource-1",
  verifyJWT,
  enforceIpWhitelist("service-1"),
  async (req, res) => {
    res.status(200).json({
      success: true,
      message: `Access granted to verifyJWTed Resource 1. Your IP (${
        req.ip || req.connection.remoteAddress
      }) is whitelisted for 'service-1'.`,
    });
  }
);

/**
 * @swagger
 * /api/v1/service/verifyJWTed-resource-2:
 *   get:
 *     summary: Access Resource 2 (JWT + IP Whitelist)
 *     tags: [Protected Services (Test)]
 *     description: Requires valid JWT and IP whitelisted for 'service-2'.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Access granted to verifyJWTed Resource 2. Your IP (192.168.1.100) is whitelisted for 'service-2'. }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied due to IP restrictions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 message: { type: string, example: Access denied. Your IP (192.168.1.50) is not whitelisted for this service. }
 *       500:
 *         description: Server error
 */
router.get(
  "/verifyJWTed-resource-2",
  verifyJWT,
  enforceIpWhitelist("service-2"),
  async (req, res) => {
    res.status(200).json({
      success: true,
      message: `Access granted to verifyJWTed Resource 2. Your IP (${
        req.ip || req.connection.remoteAddress
      }) is whitelisted for 'service-2'.`,
    });
  }
);

export default router;
