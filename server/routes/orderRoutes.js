const express = require('express');
const router = express.Router();
const {
    getOrders,
    getOrdersByDateRange,
    getOrderById,
    updateOrderStatus
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .get(protect, admin, getOrders);

router.route('/range')
    .get(protect, admin, getOrdersByDateRange);

router.route('/:id')
    .get(protect, admin, getOrderById);

router.route('/:id/status')
    .patch(protect, admin, updateOrderStatus);

module.exports = router;