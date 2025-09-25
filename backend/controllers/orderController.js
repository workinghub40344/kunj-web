const Order = require('../models/orderModel.js');
const Counter = require('../models/counterModel.js');

async function getNextSequenceValue(sequenceName) {
  const sequenceDocument = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.seq;
}

const createOrder = async (req, res) => {
  try {
    const { customerName, customerPhone, orderItems, totalPrice } = req.body;

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

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json(orders);

  } catch (error) {
    res.status(500).json({ message: "Error while fetching orders", error });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting order' });
  }
};

const resetOrders = async (req, res) => {
  try {
    // Step 1: Delete all documents from the Order collection
    await Order.deleteMany({});

    // Step 2: Reset the counter sequence to 0
    // Agli order ID 1 se start hogi kyunki getNextSequenceValue pehle 1 se increment karta hai
    await Counter.updateOne(
      { _id: 'orderId' },
      { $set: { seq: 0 } },
      { upsert: true }
    );

    res.status(200).json({ 
      message: 'All orders have been deleted and the Order ID counter has been reset to 0.' 
    });

  } catch (error)
  {
    console.error("Error during reset:", error);
    res.status(500).json({ message: 'Server error while resetting orders.' });
  }
};


module.exports = {
    createOrder,
    getAllOrders,
    deleteOrder,
    resetOrders,
};