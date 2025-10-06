const express = require('express');
const router = express.Router();
const { googleLogin, getAllUsers, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');


router.post('/google-login', googleLogin);
router.get('/', protect, getAllUsers);
router.delete('/:id', protect, deleteUser);

module.exports = router;