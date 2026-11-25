const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

exports.addMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Fix #3: only these fields are taken from the request. `restaurant`, `rating`, `image` etc. can't be set by the client.
    const { name, description, price, category, isVeg, isAvailable, preparationTime, tags } = req.body;
    const toBool = (v) => (v === 'true' || v === true ? true : v === 'false' || v === false ? false : undefined);
    const itemData = { name, description, price, category, preparationTime, tags };
    if (toBool(isVeg) !== undefined) itemData.isVeg = toBool(isVeg);
    if (toBool(isAvailable) !== undefined) itemData.isAvailable = toBool(isAvailable);
    Object.keys(itemData).forEach((k) => itemData[k] === undefined && delete itemData[k]);

    const item = new MenuItem({
      ...itemData,
      restaurant: restaurant._id,          // always the caller's own restaurant
    });

    if (req.file) {
      item.image = `/uploads/${req.file.filename}`;
    }

    await item.save();
    res.status(201).json({ success: true, menuItem: item });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const item = await MenuItem.findOne({ _id: req.params.id, restaurant: restaurant._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    const allowedUpdates = ['name', 'description', 'price', 'category', 'isVeg', 'isAvailable', 'preparationTime', 'tags'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (req.body[field] === 'true') item[field] = true;
        else if (req.body[field] === 'false') item[field] = false;
        else item[field] = req.body[field];
      }
    });

    if (req.file) {
      item.image = `/uploads/${req.file.filename}`;
    }

    await item.save();
    res.json({ success: true, menuItem: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const item = await MenuItem.findOneAndDelete({ _id: req.params.id, restaurant: restaurant._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMenuByRestaurant = async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurant: req.params.restaurantId });
    res.json({ success: true, menuItems: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true }).populate('restaurant', 'name isOpen rating');
    res.json({ success: true, menuItems: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
