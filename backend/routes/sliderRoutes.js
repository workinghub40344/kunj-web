const express = require('express');
const router = express.Router();

const { getAllSliderImages, uploadSliderImage, deleteSliderImage } = require('../controllers/sliderController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

router.get('/', getAllSliderImages);
router.post('/upload', protect, upload.array('images', 10), uploadSliderImage);
router.delete('/:id', protect, deleteSliderImage);

module.exports = router;