// backend/models/Products.js

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    itemCode: { type: String, trim: true },
    metal_pagdi: [
      {
        size: { type: String, required: true, trim: true },
        price: { type: Number, required: true, trim: true },
      },
    ],
    marble_pagdi: [
      {
        size: { type: String, required: true, trim: true },
        price: { type: Number, required: true, trim: true },
      },
    ],
    description: { type: String, required: true },
    colour: { type: String },
    images: [{ type: String, required: true }],
    imagePublicIds: [{ type: String, required: true }],
    category: { type: String, required: true },
    style_code: { type: String, required: true, trim: true },
    stock_status: {
      type: String,
      enum: ["IN_STOCK", "OUT_OF_STOCK", "BOOKING_CLOSED"],
      default: "IN_STOCK",
    },
    metal_sizes: [
      {
        size: { type: String, required: true, trim: true },
        price: { type: Number, required: true, trim: true },
      },
    ],
    marble_sizes: [
      {
        size: { type: String, required: true, trim: true },
        price: { type: Number, required: true, trim: true },
      },
    ],
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' }); // Indexing for search functionality
productSchema.index({ category: 1 }); // Indexing for category filtering
productSchema.index({ colour: 1 }); // Indexing for colour filtering
productSchema.index({ style_code: 1 }); // Indexing for product variants
productSchema.index({ createdAt: -1 }); // Indexing for sorting by newest products

module.exports = mongoose.model("Products", productSchema);
