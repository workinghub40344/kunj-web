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
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      size: { type: String, required: true },
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

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;