const Application = require("../models/applicationModel");
const Organization = require("../models/Organization");
const User = require("../models/User");

exports.createSuperAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists. Please use a different email.",
      });
    }

    const newSuperAdmin = new User({
      fullName,
      email,
      password,
      accountType: "super_admin",

      //
      isVerified: true,
    });

    await newSuperAdmin.save();

    res.status(201).json({
      success: true,
      message: "Super admin created successfully.",
      data: {
        id: newSuperAdmin._id,
        fullName: newSuperAdmin.fullName,
        email: newSuperAdmin.email,
        accountType: newSuperAdmin.accountType,
      },
    });
  } catch (error) {
    console.error("Error creating super admin:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("userId", "fullName email accountType")
      .exec();

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications. Please try again later.",
    });
  }
};

exports.getApplicationStats = async (req, res) => {
  try {
    // Aggregate applications by status and count them
    const stats = await Application.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert the array of stats into an object for easier access
    const statsObject = stats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Return the stats object
    res.status(200).json({
      success: true,
      stats: {
        pending: statsObject.pending || 0,
        approved: statsObject.approved || 0,
        declined: statsObject.declined || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching application statistics",
      error: error.message,
    });
  }
};

exports.getAllProviders = async (req, res) => {
  try {
    //  Fetch all providers
    const providers = await User.find({ accountType: "provider" }).select(
      "-password"
    );

    if (!providers || providers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No providers found.",
      });
    }

    //   Extract provider IDs
    const providerIds = providers.map((provider) => provider._id);

    // Step 3: Fetch all applications for these providers
    const applications = await Application.find({
      userId: { $in: providerIds },
    });

    //   Combine provider data with their applications
    const response = providers.map((provider) => ({
      provider: provider,
      applications: applications.filter(
        (app) => app.userId.toString() === provider._id.toString()
      ),
    }));

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error(
      "Error fetching providers and their applications:",
      error.message
    );
    res.status(500).json({
      success: false,
      message:
        "An error occurred while fetching providers and their applications.",
      error: error.message,
    });
  }
};

exports.getAllOrganizations = async (req, res) => {
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
};
