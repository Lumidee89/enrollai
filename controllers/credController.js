const Application = require("../models/applicationModel");
const OrganizationApplication = require("../models/credentialingApplication");
const User = require("../models/User");
const { logActivity } = require("../controllers/activityController");
const jwt = require("jsonwebtoken");

async function approveApplication(applicationId) {
  try {
    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status: "approved" },
      { new: true }
    );

    if (!application) {
      return { success: false, message: "Application not found." };
    }

    // if (!organization) {
    //   return { success: false, message: "Organization not found." };
    // }

    // await logActivity(
    //   application.organizationId,
    //   "approve-application",
    //   "Application approved successfully"
    // );

    return {
      success: true,
      message: "Application approved and profile status updated to 100%.",
      application,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function declineApplication(applicationId) {
  try {
    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status: "declined" },
      { new: true }
    );

    if (!application) {
      return { success: false, message: "Application not found." };
    }

    return { success: true, message: "Application declined.", application };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function getPendingApplicationsForOrganization(organization_name) {
  try {
    // Fetch pending applications for the organization
    const pendingApplications = await Application.find({
      organizationName: organization_name,
      status: "pending",
    });

    if (!pendingApplications || pendingApplications.length === 0) {
      return { success: false, message: "No pending applications found." };
    }

    return { success: true, pendingApplications };
  } catch (error) {
    console.error("Error fetching pending applications:", error.message);
    return { success: false, message: error.message };
  }
}

async function getApprovedApplicationsForOrganization(req, res) {
  try {
    const { organizationId } = req.params;

    const approvedApplications = await Application.find({
      organizationName: organizationId,
      status: "approved",
    });

    if (!approvedApplications || approvedApplications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No approved applications found for this organization.",
      });
    }

    res.status(200).json({
      success: true,
      applications: approvedApplications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching approved applications.",
      error: error.message,
    });
  }
}

async function getAllApplicationsForOrganization(organization_name) {
  try {
    const allAppllications = await Application.find({
      organizationName: organization_name,
    });

    if (!allAppllications || allAppllications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No applications found for this organization.",
      });
    }

    return { success: true, allAppllications };
  } catch (error) {
    console.error("Error fetching all applications:", error.message);
    return { success: false, message: error.message };
  }
}

async function getApprovedProviders(req, res) {
  try {
    const { organizationId } = req.params;

    //   Find approved applications for the organization
    const approvedApplications = await Application.find({
      organizationName: organizationId,
      status: "approved",
    });

    if (!approvedApplications || approvedApplications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No approved applications found for this organization.",
      });
    }

    //   Extract userIds from approved applications
    const userIds = approvedApplications.map((app) => app.userId);

    //   Fetch user details using the userIds
    const users = await User.find({ _id: { $in: userIds } });

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found for the approved applications.",
      });
    }

    //   Return the users and their corresponding applications
    const response = users.map((user) => ({
      user,
      applications: approvedApplications.filter(
        (app) => app.userId.toString() === user._id.toString()
      ),
    }));

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error(
      "Error fetching approved applications and users:",
      error.message
    );
    return res.status(500).json({
      success: false,
      message:
        "An error occurred while fetching approved applications and users.",
      error: error.message,
    });
  }
}

async function getUserDetailsByBearerToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const credentialingProviderId = decoded.id;

    const application = await Application.findOne({
      userId: credentialingProviderId,
      status: "approved",
    }).populate("userId", "-password");

    if (!application) {
      return {
        success: false,
        message: "No approved application found for this user.",
      };
    }

    const userDetails = application.userId;
    return { success: true, userDetails };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

const fetchApplicationsByOrganization = async (req, res) => {
  try {
    const { organizationApplicationId } = req.params; // Organization ID passed as a URL parameter

    // Check if the organization exists
    const organization = await OrganizationApplication.findById(
      organizationApplicationId
    );
    if (!organization) {
      return res
        .status(404)
        .json({ message: "Credentialing organization not found" });
    }

    // Fetch applications associated with the organization
    const applications = await Application.find({
      organizationApplication: organizationApplicationId,
    }).populate("userId", "firstName lastName email"); // Populate user details if necessary

    if (applications.length === 0) {
      return res
        .status(404)
        .json({ message: "No applications found for this organization" });
    }

    res.status(200).json({
      message: "Applications fetched successfully",
      applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllApplicationsForOrganization,
  approveApplication,
  declineApplication,
  getPendingApplicationsForOrganization,
  getApprovedApplicationsForOrganization,
  getUserDetailsByBearerToken,
  fetchApplicationsByOrganization,
  getApprovedProviders,
};
