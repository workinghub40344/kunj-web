const express = require('express');
const upload = require('../middleware/multer');
const {  createAccessory, getAllAccessories, getAccessoryById, updateAccessory, deleteAccessory } = require('../controllers/accessoryController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Public Routes (Sabhi dekh sakte hain)
router.get('/', getAllAccessories);
router.get('/:id', getAccessoryById);

// Admin Only Routes (Sirf admin access kar sakta hai)
router.post('/', protect, upload.array('images', 1), createAccessory);
router.put('/:id', protect, upload.array('images', 1), updateAccessory);
router.delete('/:id', protect, deleteAccessory);

module.exports = router;