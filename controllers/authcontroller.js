const User = require('../models/User');
const generateOtp = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const upload = require('../utils/multer');
const fs = require('fs');
const path = require('path');
const { logActivity } = require('../controllers/activityController');

exports.register = async (req, res) => {
  const { accountType, fullName, professionalTitle, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: 'Passwords do not match' });
  }

  try {

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({
      accountType,
      fullName,
      professionalTitle,
      email,
      password,
    });

    user.otp = generateOtp(); 
    user.otpCreatedAt = new Date(); 

    await user.save();  

    await sendEmail(user.email, 'OTP Verification', `Your OTP is ${user.otp}`);

    res.status(200).json({ msg: 'Registration successful, OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    const otpExpiryDuration = 15 * 60 * 1000; 
    const currentTime = Date.now();

    if (currentTime - new Date(user.otpCreatedAt).getTime() > otpExpiryDuration) {
      return res.status(400).json({ msg: 'OTP has expired' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    user.isVerified = true; 
    user.otp = undefined; 
    user.otpCreatedAt = undefined;  
    await user.save();

    res.status(200).json({ msg: 'OTP verified, account activated' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
  
      if (!user.isVerified) return res.status(400).json({ msg: 'Account not verified' });
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      await logActivity(user._id, 'login', 'User logged in successfully');
  
      res.status(200).json({
        userId: user._id, 
        token,
        fullName: user.fullName,
        email: user.email,
        isVerified: user.isVerified,
        accountType: user.accountType, 
        professionalTitle: user.professionalTitle,
        profileStatus: user.profileStatus 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ msg: 'Server error' });
    }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    user.otp = generateOtp();
    user.otpCreatedAt = new Date(); 

    await user.save();  

    await sendEmail(user.email, 'Password Reset OTP', `Your OTP is ${user.otp}`);

    res.status(200).json({ msg: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) return res.status(400).json({ msg: 'Invalid OTP' });

    user.password = newPassword;
    user.otp = undefined;
    await user.save();

    res.status(200).json({ msg: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.resendOtp = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    if (!user.isVerified) {
      user.otp = generateOtp();
      await user.save();

      await sendEmail(user.email, 'OTP Verification', `Your new OTP is ${user.otp}`);

      res.status(200).json({ msg: 'New OTP sent to your email' });
    } else {
      res.status(400).json({ msg: 'Account is already verified' });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const users = await User.find({}, 'fullName email profilePicture');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { fullName, email } = req.body;
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
    }
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    if (req.file) {
      if (user.profilePicture) {
        const oldPath = path.join(__dirname, '../uploads/profile-pictures', user.profilePicture);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      user.profilePicture = req.file.filename;
    }
    user.profileStatus = 100;
    await user.save();

    await logActivity(user._id, 'profile update', 'User updated profile in successfully');

    res.status(200).json({
      msg: 'Profile updated successfully',
      user: {
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;
  try {
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ msg: 'User not found' });
      }
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
          return res.status(400).json({ msg: 'Old password is incorrect' });
      }
      user.password = newPassword;
      await user.save();
      res.status(200).json({ msg: 'Password changed successfully' });
      await logActivity(user._id, 'change password', 'User changed password in successfully');
  } catch (error) {
      res.status(500).json({ msg: 'Server error', error: error.message });
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