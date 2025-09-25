const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/orderController.js');


router.route('/').post(createOrder); // Pehle protect laga sakte hain

module.exports = router;