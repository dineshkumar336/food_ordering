const Order = require('../models/Order');
const User = require('../models/User');

exports.getAvailableDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await User.find({ 
      role: 'delivery',
      isAvailable: true 
    })
      .select('name phone vehicleType address rating')
      .sort({ rating: -1 });

    res.json({ success: true, deliveryBoys });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.assignDeliveryBoy = async (req, res) => {
  try {
    const { deliveryBoyId } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify restaurant ownership
    const Restaurant = require('../models/Restaurant');
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant || order.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check if order is ready for delivery
    if (order.status !== 'ready') {
      return res.status(400).json({ success: false, message: 'Order must be ready for delivery' });
    }

    // Check if delivery boy exists and is available
    const deliveryBoy = await User.findOne({ _id: deliveryBoyId, role: 'delivery', isAvailable: true });
    if (!deliveryBoy) {
      return res.status(404).json({ success: false, message: 'Delivery boy not found or not available' });
    }

    // Assign delivery boy and update status
    order.deliveryBoy = deliveryBoyId;
    order.status = 'assigned';
    await order.save();

    // Mark delivery boy as unavailable
    await User.findByIdAndUpdate(deliveryBoyId, { isAvailable: false });

    // Populate the response
    await order.populate('deliveryBoy', 'name phone');

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.confirmOrderPickup = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, deliveryBoy: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'assigned') {
      return res.status(400).json({ success: false, message: 'Order must be assigned first' });
    }

    order.status = 'picked_up';
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAvailableOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      status: 'assigned',
      deliveryBoy: req.user._id 
    })
      .populate('restaurant', 'name address phone')
      .populate('user', 'name phone address')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMyDeliveries = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { deliveryBoy: req.user._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('restaurant', 'name address phone')
      .populate('user', 'name phone address')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOne({ _id: req.params.id, deliveryBoy: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // If delivered, mark delivery boy available again
    if (status === 'delivered') {
      await User.findByIdAndUpdate(req.user._id, { isAvailable: true });
      order.paymentStatus = 'paid';
      await order.save();
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isAvailable = !user.isAvailable;
    await user.save();
    res.json({ success: true, isAvailable: user.isAvailable });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
