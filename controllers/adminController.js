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
  