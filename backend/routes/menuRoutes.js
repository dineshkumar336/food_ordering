const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { auth, requireRole } = require('../middleware/auth');

const upload = require('../middleware/upload');

router.get('/all', menuController.getAllMenuItems);
router.get('/restaurant/:restaurantId', menuController.getMenuByRestaurant);
router.post('/', auth, requireRole('restaurant'), upload.single('image'), menuController.addMenuItem);
router.put('/:id', auth, requireRole('restaurant'), upload.single('image'), menuController.updateMenuItem);
router.delete('/:id', auth, requireRole('restaurant'), menuController.deleteMenuItem);

module.exports = router;
