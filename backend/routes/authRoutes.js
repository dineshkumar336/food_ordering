const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);
router.post('/forgotpassword', authController.forgotPassword);
router.put('/resetpassword/:token', authController.resetPassword);
router.post('/verifyemail', authController.verifyEmail);
router.post('/resendotp', authController.resendVerificationOtp);

module.exports = router;
