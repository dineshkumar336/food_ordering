const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  cuisine: [{ type: String }],
  image: { type: String, default: '' },
  bannerImage: { type: String, default: '' },
  infrastructureImages: [{ type: String }],
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    }
  },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  deliveryTime: { type: String, default: '30-45 min' },
  deliveryFee: { type: Number, default: 0 },
  minOrder: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  openingHours: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '22:00' }
  },
  tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
