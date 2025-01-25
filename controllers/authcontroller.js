const User = require("../models/User");
const generateOtp = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { logActivity } = require("../controllers/activityController");
const emailTemplates = require("../utils/emailTemplate");
require("dotenv").config();

exports.register = async (req, res) => {
  const {
    accountType,
    fullName,
    professionalTitle,
    email,
    password,
    confirmPassword,
  } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Passwords do not match" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    user = new User({
      accountType,
      fullName,
      professionalTitle,
      email,
      password,
      createdAt: new Date(),
    });

    user.otp = generateOtp();
    user.otpCreatedAt = new Date();

    await user.save();

    const emailSubject = "OTP Verification Code";
    const emailText = emailTemplates.otpVerification(user.otp);

    await sendEmail(user.email, emailSubject, emailText);

    res
      .status(200)
      .json({ msg: "Registration successful, OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const otpExpiryDuration = 15 * 60 * 1000;
    const currentTime = Date.now();

    if (
      currentTime - new Date(user.otpCreatedAt).getTime() >
      otpExpiryDuration
    ) {
      return res.status(400).json({ msg: "OTP has expired" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpCreatedAt = undefined;
    await user.save();

    res.status(200).json({ msg: "OTP verified, account activated" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(400).json({ msg: "Account not verified" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    await logActivity(user._id, "login", "User logged in successfully");

    res.status(200).json({
      userId: user._id,
      token,
      fullName: user.fullName,
      email: user.email,
      isVerified: user.isVerified,
      accountType: user.accountType,
      professionalTitle: user.professionalTitle,
      createdAt: user.createdAt,
      profileStatus: user.profileStatus,
      profilePicture: user.profilePicture || null,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    user.otp = generateOtp();
    user.otpCreatedAt = new Date();

    await user.save();

    const emailSubject = "Password Reset OTP";
    const emailText = emailTemplates.otpVerification(user.otp);

    await sendEmail(user.email, emailSubject, emailText);

    res.status(200).json({ msg: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    // if (!user || user.otp !== otp)
    //   return res.status(400).json({ msg: "Invalid OTP" });

    user.password = newPassword;
    user.otp = undefined;
    await user.save();

    res.status(200).json({ msg: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.resendOtp = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    if (!user.isVerified) {
      user.otp = generateOtp();
      user.otpCreatedAt = new Date();
      await user.save();

      const emailSubject = "OTP Verification Code";
      const emailText = emailTemplates.otpVerification(user.otp);

      await sendEmail(user.email, emailSubject, emailText);

      res.status(200).json({ msg: "New OTP sent to your email" });
    } else {
      res.status(400).json({ msg: "Account is already verified" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const users = await User.find({}, "fullName email profilePicture");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  const { fullName, profilePicture } = req.body;
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.fullName = fullName || user.fullName;
    user.profilePicture = profilePicture || user.profilePicture;

    user.profileStatus = 100;
    await user.save();

    await logActivity(
      userId,
      "update profile",
      "User updated profile in successfully"
    );

    res.status(200).json({
      msg: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ msg: "Old password is incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ msg: "Password changed successfully" });
    await logActivity(
      user._id,
      "change password",
      "User changed password in successfully"
    );
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user account:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
