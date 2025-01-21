const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: {
    type: String,
    enum: ['login', 'profile-update', 'delete-application', 'approve-application', 'createapplication', 
      'delete-application' ],
    required: true
  },
  actionDetails: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;