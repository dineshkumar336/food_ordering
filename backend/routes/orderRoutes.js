const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, requireRole } = require('../middleware/auth');

router.post('/', auth, requireRole('user'), orderController.createOrder);
router.get('/my', auth, requireRole('user'), orderController.getUserOrders);
router.get('/restaurant', auth, requireRole('restaurant'), orderController.getRestaurantOrders);
router.get('/:id', auth, orderController.getOrderById);
router.put('/:id/status', auth, requireRole('restaurant'), orderController.updateOrderStatus);
router.put('/:id/cancel', auth, requireRole('user'), orderController.cancelOrder);

module.exports = router;
