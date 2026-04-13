const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => process.env.NODE_ENV === 'development'
  });
};

// General API rate limiter
const apiLimiter = createRateLimiter(15 * 60 * 1000, 1000);

// Stricter limiter for auth endpoints
const authLimiter = createRateLimiter(15 * 60 * 1000, 50);

// Blockchain operations limiter
const blockchainLimiter = createRateLimiter(60 * 1000, 100);

module.exports = {
  apiLimiter,
  authLimiter,
  blockchainLimiter,
  createRateLimiter
};