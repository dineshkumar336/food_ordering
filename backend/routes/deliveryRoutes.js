const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/available-boys', auth, requireRole('restaurant'), deliveryController.getAvailableDeliveryBoys);
router.post('/assign/:id', auth, requireRole('restaurant'), deliveryController.assignDeliveryBoy);
router.post('/pickup/:id', auth, requireRole('delivery'), deliveryController.confirmOrderPickup);

router.get('/available', auth, requireRole('delivery'), deliveryController.getAvailableOrders);
router.get('/my', auth, requireRole('delivery'), deliveryController.getMyDeliveries);
router.put('/:id/status', auth, requireRole('delivery'), deliveryController.updateDeliveryStatus);
router.put('/toggle-availability', auth, requireRole('delivery'), deliveryController.toggleAvailability);

module.exports = router;
