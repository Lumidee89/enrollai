const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
        console.log('Decoded Token:', decoded); 
        req.user = await User.findById(decoded.userId).select('-password');
        console.log('Found User:', req.user); 
        if (!req.user) {
          return res.status(404).json({ message: 'User not found' });
        }
        next();
      } catch (err) {
        console.error('Error during token validation:', err.message);
        return res.status(401).json({ message: 'Token is not valid' });
      }
    } else {
      return res.status(401).json({ message: 'Token not provided' });
    }
  };  

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.accountType)) {
            return res.status(403).json({ message: `User type ${req.user.accountType} is not authorized to access this resource` });
        }
        next();
    };
};

module.exports = { protect, authorize };