const Application = require('../models/applicationModel'); 
const CredentialingApplication = require('../models/credentialingApplication'); 

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
  
      return { success: true, message: 'Application approved.', application };
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
  
  module.exports = {
    getAllApplicationsForOrganization,
    approveApplication,
    declineApplication,
  };