const Organization = require('../models/Organization');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const registerOrganization = async (req, res) => {
  try {
    const { accountType, organizationName, administratorFullName, workEmail, password } = req.body;

    const existingOrganization = await Organization.findOne({ workEmail });
    if (existingOrganization) {
      return res.status(400).json({ message: 'Organization with this email already exists' });
    }

    const newOrganization = new Organization({
      accountType,
      organizationName,
      administratorFullName,
      workEmail,
      password,
    });

    await newOrganization.save();

    const token = jwt.sign(
      { userId: newOrganization._id, accountType: 'credentialing_organization' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Organization registered successfully',
      token,
      organization: {
        id: newOrganization._id,
        organizationName: newOrganization.organizationName,
        administratorFullName: newOrganization.administratorFullName,
        workEmail: newOrganization.workEmail,
      },
    });
  } catch (error) {
    console.error('Error registering organization:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginOrganization = async (req, res) => {
    try {
      const { workEmail, password } = req.body;
      const organization = await Organization.findOne({ workEmail });
      if (!organization) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      const isMatch = await bcrypt.compare(password, organization.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      const token = jwt.sign(
        { userId: organization._id, accountType: 'credentialing_organization' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      res.status(200).json({
        message: 'Login successful',
        token,
        organization: {
          id: organization._id,
          organizationName: organization.organizationName,
          administratorFullName: organization.administratorFullName,
          workEmail: organization.workEmail,
        },
      });
    } catch (error) {
      console.error('Error logging in organization:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  };

  const authenticateOrganization = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]; 
      if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.organizationId = decoded.userId; 
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
  
  const getOrganizationDetails = async (req, res) => {
    try {
      const organization = await Organization.findById(req.organizationId).select('-password');
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      res.status(200).json({
        success: true,
        organization: {
          id: organization._id,
          organizationName: organization.organizationName,
          administratorFullName: organization.administratorFullName,
          workEmail: organization.workEmail,
          createdAt: organization.createdAt,
        },
      });
    } catch (error) {
      console.error('Error fetching organization details:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  const updateOrganizationDetails = async (req, res) => {
    try {
      const { organizationName, administratorFullName, workEmail } = req.body;
  
      const updatedOrganization = await Organization.findByIdAndUpdate(
        req.organizationId,
        { organizationName, administratorFullName, workEmail },
        { new: true, runValidators: true }
      );
  
      if (!updatedOrganization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
  
      res.status(200).json({
        success: true,
        message: 'Organization details updated successfully',
        organization: {
          id: updatedOrganization._id,
          organizationName: updatedOrganization.organizationName,
          administratorFullName: updatedOrganization.administratorFullName,
          workEmail: updatedOrganization.workEmail,
        },
      });
    } catch (error) {
      console.error('Error updating organization details:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  const changeOrganizationPassword = async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
  
      const organization = await Organization.findById(req.organizationId);
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
  
      const isMatch = await bcrypt.compare(oldPassword, organization.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }
  
      const salt = await bcrypt.genSalt(10);
      organization.password = await bcrypt.hash(newPassword, salt);
      await organization.save();
  
      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      console.error('Error changing organization password:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
module.exports = { authenticateOrganization, registerOrganization, loginOrganization, registerOrganization, loginOrganization, getOrganizationDetails, updateOrganizationDetails, changeOrganizationPassword };
