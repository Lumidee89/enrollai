const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  applicationName: { type: String, required: true },
  applicationTitle: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Credapplication', ApplicationSchema);