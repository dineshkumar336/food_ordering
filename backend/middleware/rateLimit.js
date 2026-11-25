// Rate limiting by IP. In-memory store: fine for one server process.
// With several instances, use a shared store (for example rate-limit-redis).
// Account lockout (5 wrong tries) is separate and lives in the auth controller.
const rateLimit = require('express-rate-limit');

// Only for load tests in development; ignored in production.
const scale = process.env.NODE_ENV === 'production' ? 1 : Number(process.env.RATE_LIMIT_SCALE || 1);

const make = ({ minutes, max, message, onlyFailures = false }) =>
  rateLimit({
    windowMs: minutes * 60 * 1000,
    limit: Math.max(1, Math.round(max * scale)),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: onlyFailures,
    message: { success: false, message },
  });

const tooMany = 'Too many attempts. Please wait a while and try again.';

module.exports = {
  apiLimiter: make({ minutes: 15, max: 600, message: tooMany }),
  loginIpLimiter: make({ minutes: 15, max: 30, message: tooMany, onlyFailures: true }),
  registerLimiter: make({ minutes: 60, max: 10, message: tooMany }),
  mfaLimiter: make({ minutes: 15, max: 30, message: tooMany }),
  recoverLimiter: make({ minutes: 15, max: 10, message: tooMany }),
  passwordLimiter: make({ minutes: 15, max: 10, message: tooMany }),
};
