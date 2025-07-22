const rateLimit = require("express-rate-limit");
const { respondFailure } = require("../utils/res.util");
const { ApiError } = require("../utils/error.util");

const windowMinutes = process.env.RATE_LIMIT_WINDOW_MINUTES || 5;
const maxRequests = process.env.RATE_LIMIT_MAX_REQUESTS || 5;

const rateLimiter = rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  max: parseInt(maxRequests),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    respondFailure(res, new ApiError(options.statusCode, "Too Many Requests"));
  },
});

module.exports = { rateLimiter };
