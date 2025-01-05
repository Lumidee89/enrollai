const Application = require("../models/applicationModel");
const User = require("../models/User");
const OrganizationApplication = require("../models/Organization");

const createApplication = async (req, res) => {
  try {
    const { applicationType, step1, step2, step3, organizationApplicationId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const organizationApplication = await OrganizationApplication.findById(organizationApplicationId);
    if (!organizationApplication) {
      return res.status(404).json({ message: 'Organization application not found' });
    }

    const existingApplication = await Application.findOne({ userId, applicationType });
    if (existingApplication) {
      return res.status(200).json({
        message: 'Existing application found',
        application: existingApplication,
      });
    }

    const newApplication = new Application({
      userId,
      applicationType,
      step1,
      step2,
      step3,
      organizationApplication: organizationApplicationId,
    });

    await newApplication.save();

    res.status(201).json({
      message: 'Application created successfully',
      application: newApplication,
    });
  } catch (error) {
    console.error('Error creating user application:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId).populate(
      "userId"
    );
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.status(200).json({ application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getApplicationsByStatusAndUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    if (!["pending", "approved", "declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Fetch applications based on userId and status
    const applications = await Application.find({ userId, status }).populate(
      "userId organizationApplication"
    );

    if (!applications || applications.length === 0) {
      return res
        .status(404)
        .json({ message: `No applications found with status: ${status}` });
    }

    res.status(200).json({ applications });
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
    if (!applications || applications.length === 0) {
      return res
        .status(404)
        .json({ message: "No applications found for this user" });
    }
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

const deleteApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const deletedApplication = await Application.findByIdAndDelete(
      applicationId
    );
    if (!deletedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find().populate("userId");
    if (!applications || applications.length === 0) {
      return res.status(404).json({ message: "No applications found" });
    }
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
};
