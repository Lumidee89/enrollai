const Application = require("../models/credentialingApplication");

const { logActivity } = require("../controllers/activityController");

//  Create Application (FE: Organization Route)
const createApplication = async (req, res) => {
  try {
    const { applicationName, applicationTitle } = req.body;
    if (!applicationName || !applicationTitle) {
      return res
        .status(400)
        .json({ message: "Application name and title are required" });
    }
    const organizationId = req.user._id;
    const application = new Application({
      organization: organizationId,
      organizationId,
      applicationName,
      applicationTitle,
    });

    await application.save();
    res.status(201).json({
      message: "Application created successfully",
      application,
    });
    await logActivity(
      req.user._id,
      "createapplication",
      "Application created successfully"
    );
  } catch (error) {
    console.error("Error creating application:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Applications created by organizations for Providers to fill (FE: Provider Route)
const getApplications = async (req, res) => {
  try {
    // Extract query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 5;
    const order_by = req.query.order_by || "desc";

    // Calculate the number of documents to skip
    const skip = (page - 1) * size;

    // Fetch applications with pagination and sorting
    const applications = await Application.find()
      .populate(
        "organization",
        "organizationName administratorFullName workEmail"
      )
      .sort({ createdAt: order_by === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(size);

    // Get the total number of applications (for pagination metadata)
    const totalApplications = await Application.countDocuments();

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
    console.error("Error fetching applications:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getApplicationsByOrganization = async (req, res) => {
  try {
    const organizationId = req.user._id;
    const applications = await Application.find({
      organization: organizationId,
    })
      .populate(
        "organization",
        "organizationName administratorFullName workEmail"
      )
      .sort({ createdAt: -1 });

    if (!applications || applications.length === 0) {
      return res
        .status(404)
        .json({ message: "No applications found for this organization" });
    }

    res.status(200).json({ applications });
  } catch (error) {
    console.error(
      "Error fetching applications for organization:",
      error.message
    );
    res.status(500).json({ message: "Server error" });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    const organizationId = req.user._id;
    if (application.organization.toString() !== organizationId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this application",
      });
    }
    await Application.findByIdAndDelete(id);
    res.status(200).json({ message: "Application deleted successfully" });

    await logActivity(
      req.user._id,
      "delete-application",
      "Application deleted successfully"
    );
  } catch (error) {
    console.error("Error deleting application:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationsByOrganization,
  deleteApplication,
};
