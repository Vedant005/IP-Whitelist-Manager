import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => req.ip, // Use the client's IP address
});

// Specific stricter rate limit for login attempts
export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Allow 5 login attempts per IP per 5 minutes
  message:
    "Too many login attempts from this IP, please try again after 5 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => req.ip,
});

// Specific stricter rate limit for whitelist creation (admin only)
export const whitelistCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Allow 30 whitelist creations per IP per hour
  message:
    "Too many whitelist creation requests from this IP, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => req.ip,
});
