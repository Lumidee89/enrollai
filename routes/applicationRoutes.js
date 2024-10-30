const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

router.post('/step1', applicationController.selectApplicationType);
router.post('/step2', applicationController.updatePersonalInfo);
router.post('/step3', applicationController.updatePracticeLocations);

module.exports = router;
