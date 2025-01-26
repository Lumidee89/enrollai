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
  deleteOrganization,
  verifyOrganizationOtp,
  resendOrganizationOtp,
  forgotOrganizationPassword,
  resetOrganizationPassword,
  clearAllOrganizations,
} = require("../controllers/organizationController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createApplication,
  getApplications,
  getApplicationsByOrganization,
  deleteApplication,
} = require("../controllers/credentialingApplication");
const {
  approveApplication,
  declineApplication,
  getPendingApplicationsForOrganization,
  getApprovedApplicationsForOrganization,

  fetchApplicationsByOrganization,
  getAllApplicationsForOrganization,
  getApprovedProviders,
  getApplicationStatsForOrganization,
} = require("../controllers/credController");
const {
  authenticateOrganization,
} = require("../controllers/organizationController");
const upload = require("../utils/multer");

// Routes

// Auth
router.post("/register", registerOrganization);
router.post("/login", loginOrganization);
router.post("/verify-otp", verifyOrganizationOtp);
router.get("/resend-otp/:workEmail", resendOrganizationOtp);
router.post("/forgot-password", forgotOrganizationPassword);
router.post("/reset-password", resetOrganizationPassword);

// Applications

// Create Application for Providers to fill
router.post(
  "/create-application",
  protect,
  authorize("organization"),
  createApplication
);

// Get Applications created for Providers (FE: Organization Route)
router.get("/created-applications", protect, getApplicationsByOrganization);

// Get Applications created by organizations for Providers to fill (FE: Provider Route)
router.get("/get-organization-applications", protect, getApplications);

// Get All Returned Filled Applications (FE: Organization Route)
router.get("/applications", getAllApplicationsForOrganization);

router.get("/getApplications/all", protect, getAllOrganizations);
router.get("/details", authenticateOrganization, getOrganizationDetails);
router.get(
  "/details/:id",
  authenticateOrganization,
  getOrganizationDetailsByID
);
router.put(
  "/update",
  authenticateOrganization,
  upload.single("profilePicture"),
  updateOrganizationDetails
);
router.put(
  "/change-password",
  authenticateOrganization,
  changeOrganizationPassword
);
router.delete("/delete", authenticateOrganization, deleteOrganization);

router.get(
  "/incoming/:organizationApplicationId",
  fetchApplicationsByOrganization
);
router.delete("/:id", protect, authorize("organization"), deleteApplication);

router.put("/approve/:applicationId", async (req, res) => {
  const { applicationId } = req.params;

  if (!applicationId) {
    return res
      .status(400)
      .json({ success: false, message: "Organization is required" });
  }

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

router.get("/incoming-applications", async (req, res) => {
  try {
    const { organization_name } = req.query;

    if (!organization_name) {
      return res
        .status(400)
        .json({ success: false, message: "Organization is required" });
    }

    const result = await getPendingApplicationsForOrganization(
      organization_name
    );

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res
        .status(404)
        .json({ success: false, message: "No applications found" });
    }
  } catch (error) {
    console.error("Error fetching incoming applications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get(
  "/:organizationName/application-stats",
  getApplicationStatsForOrganization
);

router.get("/get-providers/:organizationId", getApprovedProviders);

// router.get("/get-providers", async (req, res) => {
//   const token = req.headers.authorization?.split(" ")[1];

//   if (!token) {
//     return res
//       .status(401)
//       .json({ success: false, message: "No token provided." });
//   }

//   const result = await getUserDetailsByBearerToken(token);
//   if (result.success) {
//     res.status(200).json(result);
//   } else {
//     res.status(400).json(result);
//   }
// });

router.get(
  "/approved-applications/:organizationId",
  getApprovedApplicationsForOrganization
);

router.delete(
  "/delete/all",
  // protect,
  // authorize("organization"),
  clearAllOrganizations
);

module.exports = router;
