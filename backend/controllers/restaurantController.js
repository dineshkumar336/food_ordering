const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

exports.getAllRestaurants = async (req, res) => {
  try {
    const { cuisine, search, sort } = req.query;
    let query = { isVerified: true };

    if (cuisine) {
      query.cuisine = { $in: cuisine.split(',') };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisine: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = {};
    if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'deliveryTime') sortOption = { deliveryTime: 1 };
    else if (sort === 'deliveryFee') sortOption = { deliveryFee: 1 };
    else sortOption = { createdAt: -1 };

    // Also include unverified ones for now (dev mode)
    const restaurants = await Restaurant.find({}).sort(sortOption);
    res.json({ success: true, restaurants });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const menuItems = await MenuItem.find({ restaurant: restaurant._id, isAvailable: true });

    res.json({ success: true, restaurant, menuItems });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const allowedUpdates = ['name', 'description', 'cuisine', 'phone', 'address', 'deliveryTime', 'deliveryFee', 'minOrder', 'isOpen', 'openingHours', 'tags'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (req.body[field] === 'true') restaurant[field] = true;
        else if (req.body[field] === 'false') restaurant[field] = false;
        else restaurant[field] = req.body[field];
      }
    });

    if (req.files) {
      if (req.files['image']) {
        restaurant.image = `/uploads/${req.files['image'][0].filename}`;
      }
      if (req.files['bannerImage']) {
        restaurant.bannerImage = `/uploads/${req.files['bannerImage'][0].filename}`;
      }
      if (req.files['infrastructureImages']) {
        const newImages = req.files['infrastructureImages'].map(file => `/uploads/${file.filename}`);
        restaurant.infrastructureImages = [...(restaurant.infrastructureImages || []), ...newImages];
      }
    }

    await restaurant.save();
    res.json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    const menuItems = await MenuItem.find({ restaurant: restaurant._id });
    res.json({ success: true, restaurant, menuItems });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
