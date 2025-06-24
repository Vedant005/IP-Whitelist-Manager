import ip from "ip";
import { WhitelistEntry } from "../models/whitelist.model.js";
import { AuditLog } from "../models/audit.model.js";

/**
 * @function enforceIpWhitelist
 * @description Middleware to restrict API access based on client's IP and associated whitelist.
 * @param {string} serviceName - The name of the service/endpoint to check against.
 */
const enforceIpWhitelist = (serviceName) => async (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  const userId = req.user ? req.user.id : null;

  try {
    const whitelistEntries = await WhitelistEntry.find({
      serviceName: serviceName.toLowerCase(),
    });

    if (whitelistEntries.length === 0) {
      // If no whitelist entries for this service, allow access by default
      // Or implement strict mode: if no whitelist, deny access
      // For now, let's assume if no specific whitelist, it's open.
      // You might want to change this based on security policy.
      await AuditLog.create({
        eventType: "ACCESS_GRANTED",
        userId: userId,
        ipAddress: clientIp,
        details: {
          serviceName,
          reason:
            "No whitelist entries found for service (allowing by default)",
        },
      });

      return next();
    }

    // Check if clientIp matches any of the whitelisted IPs or CIDR ranges
    const isWhitelisted = whitelistEntries.some((entry) => {
      const entryIp = entry.ipAddress;
      if (ip.cidr.isValid(entryIp)) {
        return ip.cidr.contains(entryIp, clientIp);
      } else if (ip.isV4Format(entryIp) || ip.isV6Format(entryIp)) {
        return entryIp === clientIp;
      }
      return false;
    });

    if (isWhitelisted) {
      await AuditLog.create({
        eventType: "ACCESS_GRANTED",
        userId: userId,
        ipAddress: clientIp,
        details: { serviceName },
      });

      next();
    } else {
      await AuditLog.create({
        eventType: "ACCESS_DENIED",
        userId: userId,
        ipAddress: clientIp,
        details: { serviceName, reason: "IP not whitelisted for service" },
      });

      res.status(403).json({
        success: false,
        message: `Access denied. Your IP (${clientIp}) is not whitelisted for this service.`,
      });
    }
  } catch (error) {
    await AuditLog.create({
      eventType: "ACCESS_DENIED", // Log as denied due to server error
      userId: userId,
      ipAddress: clientIp,
      details: {
        serviceName,
        reason: "Server error during whitelist check",
        error: error.message,
      },
    });
    res.status(500).json({
      success: false,
      message: "Server error during access validation.",
    });
  }
};

export default enforceIpWhitelist;
