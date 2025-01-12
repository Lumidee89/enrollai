const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const OrganizationSchema = new mongoose.Schema({
  accountType: {
    type: String,
    enum: [
      "credentialing_organization",
      "organization",
      "credential specialist",
    ],
    required: true,
  },
  organizationName: { type: String, required: true },
  administratorFullName: { type: String, required: true },
  workEmail: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  profileStatus: { type: Number, default: 50 },
  createdAt: { type: Date, default: Date.now },
});

OrganizationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("Organization", OrganizationSchema);
