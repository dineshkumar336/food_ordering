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

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify authorization
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (req.user.role === 'restaurant' && (!restaurant || order.restaurant.toString() !== restaurant._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }


    order.status = status;
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }
    await order.save();

    // Notify User
    emitToUser(order.user, 'status_updated', { orderId: order._id, status: order.status });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name image phone address')
      .populate('user', 'name phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
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
