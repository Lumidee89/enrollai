const Application = require("../models/applicationModel");
const OrgApplication = require("../models/credentialingApplication");
const User = require("../models/User");
const OrganizationApplication = require("../models/credentialingApplication");
const { logActivity } = require("../controllers/activityController");

const mongoose = require("mongoose");

const createApplication = async (req, res) => {
  try {
    const {
      applicationType,
      step1,
      step2,
      step3,
      organizationApplicationId,
      applicationTitle,
      organizationName,
      organizationId,
    } = req.body;
    const userId = req.user._id;

    // Validate the organizationApplicationId
    if (!mongoose.Types.ObjectId.isValid(organizationApplicationId)) {
      return res
        .status(400)
        .json({ message: "Invalid organization application ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const organizationApplication = await OrganizationApplication.findById(
      organizationApplicationId
    ).select("-password");

    if (!organizationApplication) {
      return res
        .status(404)
        .json({ message: "Organization application not found" });
    }

    const newApplication = new Application({
      userId,
      applicationType,
      applicationTitle,
      organizationName,
      step1,
      step2,
      step3,
      organizationApplication: organizationApplicationId,
      organizationId,
    });

    await newApplication.save();
    await User.findByIdAndUpdate(userId, { profileStatus: 88 }, { new: true });
    await logActivity(
      user._id,
      "create-application",
      "User created an application successfully"
    );

    res.status(201).json({
      message: "Application created successfully",
      application: newApplication,
    });
  } catch (error) {
    console.error("Error creating user application:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId).populate(
      "userId"
    );

    res.status(200).json({ application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMostRecentApplication = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId, "userIduserIduserId");
    // Find the most recent application for the user
    const recentApplication = await Application.findOne({ userId })
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json({
      message: "Most recent application retrieved successfully",
      application: recentApplication,
    });
  } catch (error) {
    console.error("Error retrieving most recent application:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getApplicationsByStatusAndUserId = async (req, res) => {
  try {
    // Extract query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const order_by = req.query.order_by || "desc";

    const { userId } = req.params;
    const { status } = req.query;

    // Calculate the number of documents to skip
    const skip = (page - 1) * size;

    if (!["pending", "approved", "declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Fetch applications based on userId and status
    const applications = await Application.find({ userId, status })
      .populate("userId organizationApplication")
      .sort({ createdAt: order_by === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(size);

    // Get the total number of applications (for pagination metadata)
    const totalApplications = await Application.countDocuments({
      userId,
      status,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalApplications / size);

    // Return the response with pagination metadata
    res.status(200).json({
      success: true,
      applications,
      pagination: {
        page,
        size,
        totalApplications,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getApplicationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const applications = await Application.find({ userId }).populate(
      "userId organizationApplication"
    );

    res.status(200).json({ applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getApplicationStatsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const applications = await Application.find({ userId });

    if (!applications || applications.length === 0) {
      return res
        .status(404)
        .json({ message: "No applications found for this user" });
    }

    const totalApplications = applications.length;
    const activeApplications = applications.filter(
      (app) => app.status === "active"
    ).length;
    const pendingApplications = applications.filter(
      (app) => app.status === "pending"
    ).length;

    res.status(200).json({
      totalApplications,
      activeApplications,
      pendingApplications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { step1, step2, step3 } = req.body;
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { step1, step2, step3 },
      { new: true }
    );
    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.status(200).json({
      message: "Application updated successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find().populate("userId");
    // if (!applications || applications.length === 0) {
    //   return res.status(404).json({ message: "No applications found" });
    // }
    res.status(200).json({ applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    if (!["approved", "declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    );
    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.status(200).json({
      message: `Application ${status} successfully`,
      application: updatedApplication,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const deletedApplication = await Application.findByIdAndDelete(
      applicationId
    );
    if (!deletedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }

    await logActivity(
      req.user._id,
      "delete-application",
      "User deleted an application successfully"
    );
    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const clearAllApplications = async (req, res) => {
  try {
    // Delete all Applications from the database
    const result = await Application.deleteMany({});

    const orgresult = await OrgApplication.deleteMany({});

    // Check if any Applications were deleted
    if (result.deletedCount === 0 && orgresult.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No Applications found to delete.",
      });
    }

    res.status(200).json({
      success: true,
      message: "All Applications have been deleted successfully.",
      deletedCount: result.deletedCount + orgresult.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing Applications:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while clearing Applications.",
      error: error.message,
    });
  }
};

module.exports = {
  createApplication,
  getApplicationById,
  getApplicationsByUserId,
  updateApplication,
  deleteApplication,
  getAllApplications,
  updateApplicationStatus,
  getApplicationStatsByUserId,
  getApplicationsByStatusAndUserId,
  getMostRecentApplication,
  clearAllApplications,
};
