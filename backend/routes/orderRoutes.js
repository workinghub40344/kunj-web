// backend/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, deleteOrder, resetOrders } = require('../controllers/orderController'); 
const { protectUser } = require('../middleware/authMiddleware');


router.post('/create', protectUser, createOrder);
router.get('/:id', getAllOrders);
router.delete('/reset', resetOrders);
router.delete('/:id', deleteOrder);

module.exports = router;