const mongoose = require('mongoose');

const accessorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    colour: { type: String, required: true },
    price: { type: Number, required: true },
    style_code: { type: String, required: true },
    deity: {
      type: String,
      required: true,
      enum: ['Radha Ji', 'Krishna Ji', 'Radha and Krishna']
    },
    images: [{ type: String, required: true }],
    imagePublicIds: [{ type: String, required: true }],
  },
  { timestamps: true }
);

accessorySchema.index({ name: 'text', description: 'text' });
accessorySchema.index({ deity: 1 });

const Accessory = mongoose.model('Accessory', accessorySchema);
module.exports = Accessory;