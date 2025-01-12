const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/multer');

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/resend-otp/:email', authController.resendOtp);
router.get('/users', authController.getUserDetails);
router.put('/update-profile', protect, upload.single('profilePicture'), authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);
router.delete('/delete', protect, authController.deleteUserAccount);

module.exports = router;
