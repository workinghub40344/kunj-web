const Order = require('../models/orderModel.js');
const Counter = require('../models/counterModel.js');
const User = require('../models/userModel.js');
const Product = require('../models/Products.js');
const Accessory = require('../models/accessoryModel.js')

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
    console.log("🟢 New Order Request Received:", req.body);
    const { customerPhone, orderItems, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items in cart');
    }

    // ✅ Clean + Validate order items
    const cleanedOrderItems = orderItems.map((item, index) => {
      if (!item.itemCode || !item.productId || !item.productName) {
        throw new Error(`Invalid item at index ${index}: Missing required fields (itemCode, productId, or productName).`);
      }
    
      return {
        itemCode: item.itemCode.trim(),
        productId: item.productId.split('-')[0],
        productName: item.productName.trim(),
        quantity: Number(item.quantity) || 1,
        size: item.size?.trim() || "",
        sizeType: item.sizeType?.trim() || "",
        price: Number(item.price) || 0,
        image: item.image?.trim() || "",
        customization: item.customization?.trim() || "",
        colour: item.colour?.trim() || "",
        pagdi: item.pagdi || null,
      };
    });


    // ✅ Stock validation before creating order
    for (const item of cleanedOrderItems) {
      let product = await Product.findById(item.productId);
      if (!product) {
        product = await Accessory.findById(item.productId);
      }

      if (!product) {
        return res.status(404).json({ message: `Product ${item.productName} not found.` });
      }

      if (product.countInStock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${item.productName}. Available: ${product.countInStock}, Requested: ${item.quantity}`
        });
      }
    }

    // Generate custom order ID
    const orderNumber = await getNextSequenceValue('orderId');
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const customOrderId = `${year}${orderNumber}${month}`;

    // Create order
    const order = new Order({
      orderId: customOrderId,
      orderItems: cleanedOrderItems,
      totalPrice,
      customerPhone,
      user: req.user._id,
      customerName: req.user.name,
    });

    const createdOrder = await order.save();

    // ✅ Reduce stock after order is successfully created
    for (const item of createdOrder.orderItems) {
      let product = await Product.findById(item.productId);
      if (!product) {
        product = await Accessory.findById(item.productId);
      }
      if (product && typeof product.countInStock !== 'undefined') {
        product.countInStock = Math.max(product.countInStock - item.quantity, 0);
        await product.save();
      }
    }

    // Update user phone if not already present
    if (req.user && !req.user.phone) {
      req.user.phone = customerPhone;
      await req.user.save();
    }
    res.status(201).json(createdOrder);

  } catch (error) {
    console.error("❌ Error creating order:", error);
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

const getOrdersByUserId = async (req, res) => {
  try {
    const userIdToFind = req.params.userId;
    const orders = await Order.find({ user: userIdToFind }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error in getOrdersByUserId:", error); // Error ko aache se log karein
    res.status(500).json({ message: "Error fetching user's orders" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error in getMyOrders:", error);
    res.status(500).json({ message: "Error fetching user's orders" });
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
    await Order.deleteMany({});
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
    getOrdersByUserId,
    getMyOrders,
    deleteOrder,
    resetOrders,
};