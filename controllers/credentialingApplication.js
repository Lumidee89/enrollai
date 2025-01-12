const Application = require('../models/credentialingApplication');
const Organization = require('../models/Organization');
const { logActivity } = require('../controllers/activityController');

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
    await logActivity(user._id, 'create application', 'Application created successfully');
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

const getApplicationsByOrganization = async (req, res) => {
  try {
    const organizationId = req.user._id;
    const applications = await Application.find({ organization: organizationId })
      .populate('organization', 'organizationName administratorFullName workEmail') 
      .sort({ createdAt: -1 }); 
    
    if (!applications || applications.length === 0) {
      return res.status(404).json({ message: 'No applications found for this organization' });
    }
    
    res.status(200).json({ applications });
  } catch (error) {
    console.error('Error fetching applications for organization:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createApplication, getApplications, getApplicationsByOrganization };