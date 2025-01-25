const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAllApplications,
  getAllProviders,
  createSuperAdmin,
  getApplicationStats,
  getAllOrganizations,
  getAllApplicationsBasedOnStatus,
  updateAdminProfile,
  updateProfile,
  getAllAdmins,
  deleteAdminAccount,
  changeAdminPassword,
} = require("../controllers/adminController");

router.post("/create", protect, authorize("super_admin"), createSuperAdmin);

router.get(
  "/applications/all",
  protect,
  authorize("super_admin"),
  getAllApplications
);

router.get(
  "/applications-status",
  protect,
  authorize("super_admin"),
  getAllApplicationsBasedOnStatus
);

router.get(
  "/application-stats",
  protect,
  authorize("super_admin"),
  getApplicationStats
);
router.get("/all", protect, authorize("super_admin"), getAllAdmins);
router.get("/providers", protect, authorize("super_admin"), getAllProviders);

router.get(
  "/credentialing-organizations",
  protect,
  authorize("super_admin"),
  getAllOrganizations
);

router.put("/update/profile", protect, authorize("super_admin"), updateProfile);

router.delete("/delete", protect, authorize("super_admin"), deleteAdminAccount);

module.exports = router;
