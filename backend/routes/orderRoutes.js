const express = require('express');
const router = express.Router();
const {  createOrder,  getAllOrders,  getOrdersByUserId,  deleteOrder,  resetOrders } = require('../controllers/orderController'); 
const { protect, protectUser } = require('../middleware/authMiddleware');

router.post('/create', protectUser, createOrder);
// router.get('/myorders', protectUser, getMyOrders);

// Admin Routes
router.get('/', protect, getAllOrders);
router.get('/user/:userId', protect, getOrdersByUserId);
router.delete('/reset', protect, resetOrders);
router.delete('/:id', protect, deleteOrder);

module.exports = router;