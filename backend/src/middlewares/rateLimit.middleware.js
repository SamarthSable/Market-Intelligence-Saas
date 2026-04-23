const requestLog = new Map();

function readPositiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getClientKey(req) {
  return req.ip || req.headers["x-forwarded-for"] || "unknown";
}

export function createRateLimiter({
  windowMs = readPositiveNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  maxRequests = readPositiveNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 300),
} = {}) {
  return (req, res, next) => {
    if (req.path === "/api/health") {
      next();
      return;
    }

    const now = Date.now();
    const key = getClientKey(req);
    const entry = requestLog.get(key);

    if (!entry || now > entry.resetAt) {
      requestLog.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      next();
      return;
    }

    entry.count += 1;

    if (entry.count > maxRequests) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((entry.resetAt - now) / 1000)
      );

      res.setHeader("Retry-After", retryAfterSeconds);
      res.status(429).json({
        error: "Too many requests. Please try again shortly.",
      });
      return;
    }

    next();
  };
}

export const apiRateLimiter = createRateLimiter();
