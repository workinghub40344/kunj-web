// routes/adminRoute.js

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { loginAdmin } = require('../controllers/adminController');
const { protect } = require("../middleware/authMiddleware");


// username-based limiter (per account)
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many attempts for this account. Try after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    return req.body.username || req.ip;
  },
});

// ip-based limiter (for unknown username / spray)
const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts from this IP. Try after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.ip,
});


// middleware to choose limiter
async function selectiveLimiter(req, res, next) {
  try {
    const username = req.body && req.body.username;
    if (!username) {
      // no username supplied — fallback to IP limiter
      return ipLimiter(req, res, next);
    }

    // check if username exists in DB
    const user = await Admin.findOne({ username }).select('_id').lean();
    if (user) {
      // known account -> apply per-account limiter
      return userLimiter(req, res, next);
    } else {
      // unknown account -> apply ip limiter
      return ipLimiter(req, res, next);
    }
  } catch (err) {
    // if DB check fails for any reason, fallback to IP limiter (safer)
    return ipLimiter(req, res, next);
  }
}


// Public routes
// router.post('/register', registerAdmin);  //commanted due to security risk
router.post('/login', selectiveLimiter, loginAdmin);

// Protected route (sirf login ke baad access)
router.get("/dashboard", protect, (req, res) => {
  res.json({ message: `Welcome ${req.admin.username}` });
});

module.exports = router;
