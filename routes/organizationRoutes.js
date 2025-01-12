const express = require("express");
const router = express.Router();
const {registerOrganization, loginOrganization, getOrganizationDetails, updateOrganizationDetails, changeOrganizationPassword, getAllOrganizations, getOrganizationDetailsByID, deleteOrganization} = require("../controllers/organizationController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {createApplication, getApplications, getApplicationsByOrganization} = require("../controllers/credentialingApplication");
const {getAllApplicationsForOrganization, approveApplication, declineApplication, getPendingApplicationsForOrganization, getApprovedApplicationsForOrganization, getUserDetailsByBearerToken} = require("../controllers/credController");
const {authenticateOrganization} = require("../controllers/organizationController");
const upload = require('../utils/multer');

router.post("/register", registerOrganization);
router.post("/login", loginOrganization);
router.post("/application", protect, authorize("credentialing_organization"), createApplication);
router.get("/getApplications", protect, getApplications);
router.get("/getApplications/all", protect, getAllOrganizations);
router.get("/details", authenticateOrganization, getOrganizationDetails);
router.get("/details/:id", authenticateOrganization, getOrganizationDetailsByID);
router.put("/update", authenticateOrganization, upload.single('profilePicture'), updateOrganizationDetails);
router.put("/change-password", authenticateOrganization, changeOrganizationPassword);
router.delete("/delete", authenticateOrganization, deleteOrganization);
router.get('/orgapplications', protect, getApplicationsByOrganization);
router.get("/applications", async (req, res) => {
const result = await getAllApplicationsForOrganization();
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(400).json(result);
  }
});

router.put("/approve/:applicationId", async (req, res) => {
  const { applicationId } = req.params;
  const result = await approveApplication(applicationId);
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(400).json(result);
  }
});

router.put("/decline/:applicationId", async (req, res) => {
  const { applicationId } = req.params;
  const result = await declineApplication(applicationId);
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(400).json(result);
  }
});

router.get('/incoming-applications', async (req, res) => {
  const { organizationId } = req.params;
  const result = await getPendingApplicationsForOrganization(organizationId);
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(404).json(result);
  }
});

router.get('/get-providers', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  const result = await getUserDetailsByBearerToken(token);
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
});

router.get('/approved-applications/:organizationId', getApprovedApplicationsForOrganization);

module.exports = router;
