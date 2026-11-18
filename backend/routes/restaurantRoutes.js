const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { auth, requireRole } = require('../middleware/auth');

const upload = require('../middleware/upload');

router.get('/', restaurantController.getAllRestaurants);
router.get('/my', auth, requireRole('restaurant'), restaurantController.getMyRestaurant);
router.get('/:id', restaurantController.getRestaurantById);
router.put('/update', auth, requireRole('restaurant'), upload.fields([
  { name: 'image', maxCount: 1 }, 
  { name: 'bannerImage', maxCount: 1 },
  { name: 'infrastructureImages', maxCount: 10 }
]), restaurantController.updateRestaurant);

module.exports = router;
