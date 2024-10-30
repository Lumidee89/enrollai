const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  step: { type: Number, default: 1 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicationType: { type: String, enum: ['Credentialing request', 'Health plan', 'Health insurance', 'Licensing'] },

  personalInfo: {
    fullName: String,
    sex: String,
    dateOfBirth: Date,
    ssn: String,
    languageSpoken: String,
    phoneNumber: String,
    emailAddress: String,
    address: String,
    nationalProviderIdentifier: String,
    tin: String,
    medicalCareID: String,
    deaCertificateNumber: String,
    education: [{
      institution: String,
      degree: String,
      yearOfGraduation: String
    }]
  },

  practiceLocations: {
    primaryLocation: {
      name: String,
      officeAddress: String,
      contact: String,
      fax: String,
      email: String,
      officeHours: String
    },
    additionalLocations: [{
      name: String,
      officeAddress: String,
      contact: String,
      fax: String,
      email: String,
      officeHours: String
    }],
    hospitalAffiliations: [{
      location: String,
      privileges: String
    }],
    licenses: [{
      licenseType: String,
      licenseNumber: String,
      expiryDate: Date
    }],
    workHistory: [{
      position: String,
      startDate: Date,
      endDate: Date
    }],
    malpracticeInsurance: [{
      carrier: String,
      policyNumber: String,
      coverageLimit: String,
      effectiveDates: {
        startDate: Date,
        endDate: Date
      }
    }],
    liabilityClaimsHistory: [{
      claim: String,
      status: String
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
