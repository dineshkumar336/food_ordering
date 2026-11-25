const mongoose = require('mongoose');
const audit = require('../utils/audit');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { emitToRestaurant, emitToUser } = require('../config/socket');

exports.createOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod, notes } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Calculate totals
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) continue;
      
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        image: menuItem.image
      });
    }

    const deliveryFee = 30;
    const tax = Math.round(totalAmount * 0.05 * 100) / 100; // 5% tax
    const grandTotal = totalAmount + deliveryFee + tax;

    const order = new Order({
      user: req.user._id,
      restaurant: restaurant._id,
      items: orderItems,
      totalAmount,
      deliveryFee,
      tax,
      grandTotal,
      deliveryAddress,
      paymentMethod: paymentMethod || 'cod',
      notes: notes || '',
      estimatedDeliveryTime: restaurant.deliveryTime
    });

    await order.save();
    
    // Notify Restaurant
    emitToRestaurant(restaurant._id, 'new_order', { orderId: order._id });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const idOf = (x) => String(x && x._id ? x._id : x);

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('restaurant', 'name image')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const { status } = req.query;
    let query = { restaurant: restaurant._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('user', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Fix #8: an order can only move forward through these steps. Finished orders stay finished.
const ALLOWED_TRANSITIONS = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered'],
  delivered: [],
  cancelled: [],
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    if (typeof status !== 'string' || !Object.prototype.hasOwnProperty.call(ALLOWED_TRANSITIONS, status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify authorization
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (req.user.role === 'restaurant' && (!restaurant || order.restaurant.toString() !== restaurant._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!ALLOWED_TRANSITIONS[order.status].includes(status)) {
      return res.status(400).json({ success: false, message: `An order that is ${order.status} cannot be changed to ${status}` });
    }

    const previousStatus = order.status;
    order.status = status;
    // Cash on delivery is paid when the order is delivered. Online payments are never marked paid by this route.
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    }
    await order.save();
    audit.record('order.status_change', { req, actor: req.user, target: order._id, detail: { from: previousStatus, to: status } });

    // Notify User
    emitToUser(order.user, 'status_updated', { orderId: order._id, status: order.status });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name image phone address owner')
      .populate('user', 'name phone');

    // Fix #1: only the customer who placed the order, or the restaurant it was placed with, may see it.
    // Everyone else gets the same 404 as for an order that doesn't exist.
    let allowed = false;
    if (order) {
      if (req.user.role === 'user') {
        allowed = idOf(order.user) === String(req.user._id);
      } else if (req.user.role === 'restaurant') {
        allowed = !!order.restaurant && idOf(order.restaurant.owner) === String(req.user._id);
      }
    }
    if (!order || !allowed) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const result = order.toObject();
    if (result.restaurant) delete result.restaurant.owner;
    res.json({ success: true, order: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!['placed', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'cancelled';
    await order.save();

    // Notify Restaurant of cancellation
    const restaurant = await Restaurant.findOne({ _id: order.restaurant });
    if (restaurant) {
      emitToRestaurant(restaurant._id, 'order_cancelled', { orderId: order._id });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
