const Application = require('../models/credentialingApplication');
const Organization = require('../models/Organization');

const createApplication = async (req, res) => {
  try {
    const { applicationName, applicationTitle } = req.body;
    if (!applicationName || !applicationTitle) {
      return res.status(400).json({ message: 'Application name and title are required' });
    }
    const organizationId = req.user._id;
    const application = new Application({
      organization: organizationId,
      applicationName,
      applicationTitle,
    });
    await application.save();
    res.status(201).json({
      message: 'Application created successfully',
      application,
    });
  } catch (error) {
    console.error('Error creating application:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('organization', 'organizationName administratorFullName workEmail') 
      .sort({ createdAt: -1 });
    res.status(200).json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createApplication, getApplications };