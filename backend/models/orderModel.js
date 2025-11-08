const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'User', 
  },
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  orderItems: [
    {
      itemCode: { type: String },
      productId: { type: String, required: true },
      productName: { type: String, required: true },
      colour: { type: String},
      quantity: { type: Number, required: true },
      size: { type: String, required: true },
      sizeType: { type: String},
      price: { type: Number, required: true },
      image: { type: String, required: true },
      customization: { type: String },
      pagdi: {
        type: { type: String },
        size: { type: String },
        price: { type: Number }
      }
    }
  ],
  totalPrice: { type: Number, required: true },
}, { timestamps: true });

orderSchema.index({ user: 1 }); // 'user' field indexing for faster queries
orderSchema.index({ createdAt: -1 });  // 'createdAt' field indexing for sorting by most recent orders

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;