const express = require("express");
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAllApplications } = require('../controllers/adminController');

router.get('/all', protect, authorize('super_admin'), getAllApplications);

module.exports = router;