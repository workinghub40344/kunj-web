// models/SliderImage.js

const mongoose = require('mongoose');

const sliderImageSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    public_id: { type: String, required: true }, 
    order: { type: Number, required: true }, 
    link: { type: String, default: '#' },
}, { timestamps: true });

module.exports = mongoose.model('SliderImage', sliderImageSchema);