const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/apply", protect, applicationController.createApplication);

router.get(
  "/:applicationId",
  protect,
  applicationController.getApplicationById
);

router.get(
  "/getrecentapplication/:userId",
  protect,
  applicationController.getMostRecentApplication
);

router.get(
  "/user/status/:userId",
  protect,
  applicationController.getApplicationsByStatusAndUserId
);
router.get(
  "/user/:userId",
  protect,
  applicationController.getApplicationsByUserId
);
router.get(
  "/user-stat/:userId",
  protect,
  applicationController.getApplicationStatsByUserId
);
router.put("/:applicationId", protect, applicationController.updateApplication);

router.delete(
  "/:applicationId",
  protect,
  applicationController.deleteApplication
);
router.get(
  "/credentialing",
  protect,
  authorize("organization"),
  applicationController.getAllApplications
);
router.put(
  "/status/:applicationId",
  protect,
  authorize("organization"),
  applicationController.updateApplicationStatus
);

router.delete(
  "/delete/all",
  // protect,
  applicationController.clearAllApplications
);

module.exports = router;
