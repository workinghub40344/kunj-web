const Order = require('../models/orderModel.js');
const Counter = require('../models/counterModel.js');

// Function to get the next sequence number
async function getNextSequenceValue(sequenceName) {
  const sequenceDocument = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.seq;
}

exports.createOrder = async (req, res) => {
  try {
    const { customerName, customerPhone, orderItems, totalPrice } = req.body;

    // Generate Custom Order ID
    const orderNumber = await getNextSequenceValue('orderId');
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const customOrderId = `${year}${orderNumber}${month}`;

    const order = new Order({
        orderId: customOrderId,
        customerName,
        customerPhone,
        orderItems,
        totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error creating order' });
  }
};