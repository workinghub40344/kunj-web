const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin } = require('../controllers/adminController');
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Protected route (sirf login ke baad access)
router.get("/dashboard", protect, (req, res) => {
  res.json({ message: `Welcome ${req.admin.username}` });
});

module.exports = router;
