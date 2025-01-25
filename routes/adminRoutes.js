const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAllApplications,
  getAllProviders,
  createSuperAdmin,
  getApplicationStats,
  getAllOrganizations,
} = require("../controllers/adminController");

router.get("/all", protect, authorize("super_admin"), getAllApplications);
router.get(
  "/application-stats",
  protect,
  authorize("super_admin"),
  getApplicationStats
);
router.get("/providers", protect, authorize("super_admin"), getAllProviders);
router.post("/create", protect, authorize("super_admin"), createSuperAdmin);

router.get(
  "/credentialing-organizations",
  protect,
  authorize("super_admin"),
  getAllOrganizations
);

module.exports = router;
