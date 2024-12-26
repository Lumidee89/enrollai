const express = require('express');
const router = express.Router();
const { registerOrganization, loginOrganization } = require('../controllers/organizationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createApplication, getApplications } = require('../controllers/credentialingApplication');

router.post('/register', registerOrganization);
router.post('/login', loginOrganization);
router.post('/application', protect, authorize('credentialing_organization'), createApplication);
router.get('/getApplications', protect, getApplications);

module.exports = router;