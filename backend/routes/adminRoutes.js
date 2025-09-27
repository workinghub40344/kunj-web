// routes/adminRoute.js

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { loginAdmin } = require('../controllers/adminController');
const { protect } = require("../middleware/authMiddleware");
const Admin = require('../models/Admin');

// user-based limiter
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many attempts for this account. Try after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.body.username || rateLimit.ipKeyGenerator(req),
});

// ip-based limiter
const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts from this IP. Try after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => rateLimit.ipKeyGenerator(req),
});

async function selectiveLimiter(req, res, next) {
  try {
    const username = req.body?.username;
    if (!username) {
      return ipLimiter(req, res, next);
    }
    const user = await Admin.findOne({ username }).select('_id').lean();
    if (user) {
      return userLimiter(req, res, next);
    } else {
      return ipLimiter(req, res, next);
    }
  } catch {
    return ipLimiter(req, res, next);
  }
}

router.post('/login', selectiveLimiter, loginAdmin);

router.get("/dashboard", protect, (req, res) => {
  res.json({ message: `Welcome ${req.admin.username}` });
});

module.exports = router;
