const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/apply', protect, applicationController.createApplication);
router.get('/:applicationId', protect, applicationController.getApplicationById);
router.get('/:userId', protect, applicationController.getApplicationsByUserId);
router.put('/:applicationId', protect, applicationController.updateApplication);
router.delete('/:applicationId', protect, applicationController.deleteApplication);
router.get('/credentialing', protect, authorize('credentialing_organization'), applicationController.getAllApplications);
router.put('/status/:applicationId', protect, authorize('credentialing_organization'), applicationController.updateApplicationStatus);

module.exports = router;
