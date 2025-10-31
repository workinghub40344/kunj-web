const mongoose = require('mongoose');

const accessorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    itemCode: { type: String, unique: true },
    description: { type: String },
    category: { type: String, required: true },
    colour: { type: [String], required: true },
    price: { type: Number, required: true },
    priceForKrishna: { type: Number, default: 0 },
    style_code: { type: String, required: true },
    single_product: [
      {
        size: { type: String, required: true, trim: true },
        price: { type: Number, required: true, trim: true },
      },
    ],
    productType: {
        type: String,
        required: true,
        enum: ['Set', 'Single Product'],
        default: 'Single Product'
    },
    deity: {
      type: String,
      required: true,
      enum: ['Radha Ji', 'Krishna Ji', 'Radha and Krishna']
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0,
    },
    images: [{ type: String, required: true }],
    imagePublicIds: [{ type: String, required: true }],
  },
  { timestamps: true }
);

accessorySchema.index({ name: 'text', description: 'text' });
accessorySchema.index({ deity: 1 });
accessorySchema.index({ style_code: 1 });

const Accessory = mongoose.model('Accessory', accessorySchema);
module.exports = Accessory;

