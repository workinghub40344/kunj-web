// routes/sliderRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAllSliderImages, uploadSliderImage, deleteSliderImage } = require('../controllers/sliderController');
const { protect } = require('../middleware/authMiddleware'); // Admin protection

const upload = multer({ dest: 'uploads/' });

router.get('/', getAllSliderImages);
router.post('/upload', protect, upload.array('images', 10), uploadSliderImage);
router.delete('/:id', protect, deleteSliderImage);

module.exports = router;