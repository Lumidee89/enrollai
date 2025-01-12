const Application = require('../models/applicationModel'); 
const CredentialingApplication = require('../models/credentialingApplication'); 
const User = require('../models/User'); 
const jwt = require('jsonwebtoken');
const { logActivity } = require('../controllers/activityController');

async function getAllApplicationsForOrganization() {
    try {
      const applications = await Application.find();
  
      if (!applications || applications.length === 0) {
        return { success: false, message: 'No applications found.' };
      }
  
      const groupedApplications = applications.reduce((acc, application) => {
        const { organizationApplication } = application;
        if (!acc[organizationApplication]) {
          acc[organizationApplication] = [];
        }
        acc[organizationApplication].push(application);
        return acc;
      }, {});
  
      return { success: true, groupedApplications };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  async function approveApplication(applicationId) {
    try {
      const application = await Application.findByIdAndUpdate(
        applicationId,
        { status: 'approved' },
        { new: true }
      );
  
      if (!application) {
        return { success: false, message: 'Application not found.' };
      }
  
      if (!organization) {
        return { success: false, message: 'Organization not found.' };
      }
  
      await logActivity(application.organizationId, 'approve-application', 'Application approved successfully');
  
      return { 
        success: true, 
        message: 'Application approved and profile status updated to 100%.', 
        application 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  async function declineApplication(applicationId) {
    try {
      const application = await Application.findByIdAndUpdate(
        applicationId,
        { status: 'declined' },
        { new: true }
      );
  
      if (!application) {
        return { success: false, message: 'Application not found.' };
      }
  
      return { success: true, message: 'Application declined.', application };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async function getPendingApplicationsForOrganization(organizationId) {
    try {
      const pendingApplications = await Application.find({
        'organizationRecipient': organizationId,
        status: 'pending',
      }).populate('provider', 'name email')
        .populate('organizationRecipient', 'name');
  
      if (!pendingApplications || pendingApplications.length === 0) {
        return { success: false, message: 'No pending applications found.' };
      }
  
      return { success: true, pendingApplications };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async function getApprovedApplicationsForOrganization(req, res) {
    try {
      const { organizationId } = req.params; 
      const approvedApplications = await Application.find({
        organizationApplication: organizationId,
        status: 'approved', 
      });
  
      if (!approvedApplications || approvedApplications.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No approved applications found for this organization.',
        });
      }
  
      res.status(200).json({
        success: true,
        applications: approvedApplications,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching approved applications.',
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
        status: 'approved',
      }).populate('userId', '-password'); 
  
      if (!application) {
        return { success: false, message: 'No approved application found for this user.' };
      }
  
      const userDetails = application.userId;
      return { success: true, userDetails };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  module.exports = {
    getAllApplicationsForOrganization,
    approveApplication,
    declineApplication,
    getPendingApplicationsForOrganization,
    getApprovedApplicationsForOrganization,
    getUserDetailsByBearerToken
  };