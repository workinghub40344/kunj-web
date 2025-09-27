const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/adminController');
const { protect } = require("../middleware/authMiddleware");


router.post('/login', loginAdmin);

router.get("/dashboard", protect, (req, res) => {
    res.json({ message: `Welcome ${req.admin.username}` });
});

module.exports = router;