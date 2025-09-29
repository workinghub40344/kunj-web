// controllers/sliderController.js

const SliderImage = require('../models/SliderImage');
const cloudinary = require('../config/cloudinary');


exports.getAllSliderImages = async (req, res) => {
    try {
        const images = await SliderImage.find().sort({ order: 1 });
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching images' });
    }
};

exports.uploadSliderImage = async (req, res) => {
    try {
        const currentImageCount = await SliderImage.countDocuments();
        const newImageCount = req.files.length;

        if (currentImageCount + newImageCount > 10) {
            return res.status(400).json({ message: `You can only upload ${10 - currentImageCount} more image(s).` });
        }
        
        // Sabhi files ko ek saath Cloudinary par upload karein
        const uploadPromises = req.files.map(file => cloudinary.uploader.upload(file.path, { folder: 'slider_images' }));
        const uploadResults = await Promise.all(uploadPromises);

        let orderCounter = currentImageCount;
        const newImages = uploadResults.map(result => {
            orderCounter++;
            return new SliderImage({
                imageUrl: result.secure_url,
                public_id: result.public_id,
                order: orderCounter,
            });
        });
        
        await SliderImage.insertMany(newImages);
        res.status(201).json(newImages);

    } catch (error) {
        console.error("Error uploading images:", error);
        res.status(500).json({ message: 'Error uploading images' });
    }
};

exports.deleteSliderImage = async (req, res) => {
    try {
        const image = await SliderImage.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }
        
        await cloudinary.uploader.destroy(image.public_id);
        await SliderImage.findByIdAndDelete(req.params.id);

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image' });
    }
};