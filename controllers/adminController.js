const Application = require('../models/applicationModel');
const User = require('../models/User');

exports.getAllApplications = async (req, res) => {
    try {
      const applications = await Application.find()
        .populate('userId', 'fullName email accountType')
        .exec();
        
      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications. Please try again later.',
      });
    }
  };

exports.getAllProviders = async (req, res) => {
    try {
      const providers = await User.find({ accountType: 'provider' }).select('-password');
      res.status(200).json({ success: true, data: providers });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

exports.createSuperAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists. Please use a different email.',
      });
    }

    const newSuperAdmin = new User({
      fullName,
      email,
      password,
      accountType: 'super_admin',
    });

    await newSuperAdmin.save();

    res.status(201).json({
      success: true,
      message: 'Super admin created successfully.',
      data: {
        id: newSuperAdmin._id,
        fullName: newSuperAdmin.fullName,
        email: newSuperAdmin.email,
        accountType: newSuperAdmin.accountType,
      },
    });
  } catch (error) {
    console.error('Error creating super admin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};