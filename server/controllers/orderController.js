const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const { status } = req.query;
    let query = {};
    
    if (status && status !== 'all') {
        query.status = status;
    }
    
    const orders = await Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
    
    res.json(orders);
});

// @desc    Get orders by date range
// @route   GET /api/orders/range
// @access  Private/Admin
const getOrdersByDateRange = asyncHandler(async (req, res) => {
    const { range } = req.query;
    let startDate = new Date();
    
    switch (range) {
        case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'week':
            startDate.setDate(startDate.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        default:
            startDate = new Date(0); // All time
    }
    
    const orders = await Order.find({
        createdAt: { $gte: startDate }
    }).populate('user', 'name email');
    
    res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private/Admin
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    
    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (order) {
        order.status = status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

module.exports = {
    getOrders,
    getOrdersByDateRange,
    getOrderById,
    updateOrderStatus
};