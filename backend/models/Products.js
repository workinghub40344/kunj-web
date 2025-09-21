const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    imagePublicIds: [{ type: String, required: true }],
    category: { type: String, required: true },
    sizes: [
      {
        size: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Products", productSchema);