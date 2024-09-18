const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller'); 

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/resend-otp/:email', authController.resendOtp);

module.exports = router;
