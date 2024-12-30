const express = require("express");
const router = express.Router();
const {
  registerOrganization,
  loginOrganization,
  getOrganizationDetails,
  updateOrganizationDetails,
  changeOrganizationPassword,
  getAllOrganizations,
  getOrganizationDetailsByID,
} = require("../controllers/organizationController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createApplication,
  getApplications,
} = require("../controllers/credentialingApplication");
const {
  getAllApplicationsForOrganization,
  approveApplication,
  declineApplication,
} = require("../controllers/credController");
const {
  authenticateOrganization,
} = require("../controllers/organizationController");

router.post("/register", registerOrganization);
router.post("/login", loginOrganization);
router.post(
  "/application",
  protect,
  authorize("credentialing_organization"),
  createApplication
);
router.get("/getApplications", protect, getApplications);

router.get("/getApplications/all", protect, getAllOrganizations);

router.get("/details", authenticateOrganization, getOrganizationDetails);
router.get(
  "/details/:id",
  authenticateOrganization,
  getOrganizationDetailsByID
);

router.put("/update", authenticateOrganization, updateOrganizationDetails);
router.put(
  "/change-password",
  authenticateOrganization,
  changeOrganizationPassword
);

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

module.exports = router;
