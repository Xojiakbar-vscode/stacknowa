/**
 * Lead Form Security Rate Limiter & IP Block Middleware
 * Rule: Max 3 requests per 1 second per IP.
 * Exceeding 3 requests/sec blocks the IP for 15 minutes.
 */

const requestCounts = new Map(); // IP -> { count, windowStart }
const blockedIPs = new Map();   // IP -> unblockTimestamp

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // Pick first IP if multiple proxies present
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "unknown";
};

const leadRateLimiter = (req, res, next) => {
  const ip = getClientIp(req);
  const now = Date.now();

  // 1. Check if IP is currently blocked (15 minutes block)
  if (blockedIPs.has(ip)) {
    const unblockTime = blockedIPs.get(ip);
    if (now < unblockTime) {
      const remainingMinutes = Math.ceil((unblockTime - now) / 60000);
      return res.status(429).json({
        message: `Juda ko'p so'rov yuborildi! Xavfsizlik yuzasidan IP manzilingiz ${remainingMinutes} minutga bloklandi.`,
        retryAfterMinutes: remainingMinutes,
      });
    } else {
      // Unblock expired block
      blockedIPs.delete(ip);
      requestCounts.delete(ip);
    }
  }

  // 2. Track requests within 1 second window
  const windowMs = 1000; // 1 second
  const maxRequestsPerSec = 3;
  const blockDurationMs = 15 * 60 * 1000; // 15 minutes

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, windowStart: now });
  } else {
    const record = requestCounts.get(ip);
    if (now - record.windowStart < windowMs) {
      record.count += 1;

      // If > 3 requests in 1 sec -> Block IP for 15 minutes!
      if (record.count > maxRequestsPerSec) {
        const unblockTime = now + blockDurationMs;
        blockedIPs.set(ip, unblockTime);
        requestCounts.delete(ip);

        return res.status(429).json({
          message: "Spam so'rovlar aniqlandi! IP manzilingiz 15 minutga bloklandi.",
          retryAfterMinutes: 15,
        });
      }
    } else {
      // Reset 1-second window
      record.count = 1;
      record.windowStart = now;
    }
  }

  next();
};

module.exports = {
  leadRateLimiter,
};
