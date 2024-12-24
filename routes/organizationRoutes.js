const express = require('express');
const router = express.Router();
const { registerOrganization, loginOrganization } = require('../controllers/organizationController');

router.post('/register', registerOrganization);
router.post('/login', loginOrganization);

module.exports = router;