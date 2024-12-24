const Organization = require('../models/Organization');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const registerOrganization = async (req, res) => {
  try {
    const { organizationName, administratorFullName, workEmail, password } = req.body;

    const existingOrganization = await Organization.findOne({ workEmail });
    if (existingOrganization) {
      return res.status(400).json({ message: 'Organization with this email already exists' });
    }

    const newOrganization = new Organization({
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

module.exports = { registerOrganization, loginOrganization };
