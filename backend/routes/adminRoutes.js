// routes/adminRoute.js

const express = require('express');
const router = express.Router();
// const rateLimit = require('express-rate-limit');
const { loginAdmin } = require('../controllers/adminController');
const { protect } = require("../middleware/authMiddleware");


// const loginLimiter = rateLimit({
// 	windowMs: 15 * 60 * 1000, // 1 min.
// 	max: 10, 
// 	message: 'Too many login attempts from this IP, please try again after 15 minutes.',
// 	standardHeaders: true, 
// 	legacyHeaders: false,
// 	skipSuccessfulRequests: true
// });


// Public routes
// router.post('/register', registerAdmin);  //commanted due to security risk
router.post('/login', loginAdmin);

// Protected route (sirf login ke baad access)
router.get("/dashboard", protect, (req, res) => {
  res.json({ message: `Welcome ${req.admin.username}` });
});

module.exports = router;
