const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAllApplications,
  getAllProviders,
  createSuperAdmin,
  getApplicationStats,
} = require("../controllers/adminController");
const Organization = require("../models/Organization");

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
  async (req, res) => {
    try {
      const organizations = await Organization.find({
        accountType: "credentialing_organization",
      }).select("-password");

      return res.status(200).json({
        success: true,
        data: organizations,
      });
    } catch (error) {
      console.error("Error fetching credentialing organizations:", error);
      return res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }
  }
);

module.exports = router;
