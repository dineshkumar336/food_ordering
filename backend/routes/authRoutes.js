const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, authAnyScope } = require('../middleware/auth');
const rl = require('../middleware/rateLimit');

router.post('/register', rl.registerLimiter, authController.register);
router.post('/login', rl.loginIpLimiter, authController.login);
router.post('/recover', rl.recoverLimiter, authController.recover);

// A limited ("mfa_setup") token may only use these routes
router.get('/me', authAnyScope, authController.getMe);
router.post('/logout', authAnyScope, authController.logout);
router.post('/mfa/setup', rl.mfaLimiter, authAnyScope, authController.mfaSetup);
router.post('/mfa/enable', rl.mfaLimiter, authAnyScope, authController.mfaEnable);

// Full token only
router.post('/mfa/disable', rl.mfaLimiter, auth, authController.mfaDisable);
router.put('/password', rl.passwordLimiter, auth, authController.changePassword);
router.get('/activity', auth, authController.activity);

module.exports = router;
