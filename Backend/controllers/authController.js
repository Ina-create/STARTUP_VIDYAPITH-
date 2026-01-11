// controllers/authController.js - CORRECTED VERSION
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      userType: user.userType,
      banasthaliId: user.banasthaliId,
      email: user.email,
      fullName: user.fullName 
    },
    process.env.JWT_SECRET || 'banasthali_startup_portal_secret_key',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Register function - FIXED
const register = async (req, res) => {
  try {
    const { 
      fullName, 
      banasthaliId, 
      email, 
      password, 
      phone, 
      year, 
      branch, 
      userType,       // Added
      startupName,    // Added
      designation     // Added
    } = req.body;

    console.log('📝 Registration attempt:', { 
      banasthaliId, 
      email, 
      userType        // Log userType
    });

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() }, 
        { banasthaliId: banasthaliId.toUpperCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email.toLowerCase() 
          ? 'Email already registered' 
          : 'Banasthali ID already registered'
      });
    }

    // Create user object based on userType
    const userData = {
      fullName,
      email: email.toLowerCase(),
      banasthaliId: banasthaliId.toUpperCase(),
      password,
      phone,
      userType: userType || 'student',  // USE FROM REQUEST, not hardcoded
      isActive: true
    };

    // Add conditional fields based on userType
    if (userType === 'student') {
      userData.year = year;
      userData.branch = branch;
    } else if (userType === 'founder') {
      userData.startupName = startupName;
      // Optional: Add year and branch if provided
      if (year) userData.year = year;
      if (branch) userData.branch = branch;
    } else if (userType === 'admin') {
      userData.designation = designation;
    }

    // Create user
    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user);

    // Return appropriate user data
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      banasthaliId: user.banasthaliId,
      email: user.email,
      userType: user.userType,
      phone: user.phone,
      isActive: user.isActive
    };

    // Add conditional fields to response
    if (user.userType === 'student') {
      userResponse.year = user.year;
      userResponse.branch = user.branch;
    } else if (user.userType === 'founder') {
      userResponse.startupName = user.startupName;
    } else if (user.userType === 'admin') {
      userResponse.designation = user.designation;
    }

    res.status(201).json({
      success: true,
      token,
      user: userResponse,
      message: 'Registration successful!'
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// Login function - ALSO NEEDS UPDATE FOR FOUNDER/ADMIN LOGIN
const login = async (req, res) => {
  try {
    const { banasthaliId, email, password } = req.body;

    console.log('🔑 Login attempt:', { banasthaliId, email });

    // Validate fields
    if (!banasthaliId || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Banasthali ID, Email, and Password'
      });
    }

    // Find user
    const user = await User.findOne({
      banasthaliId: banasthaliId.toUpperCase(),
      email: email.toLowerCase()
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Generate token
    const token = generateToken(user);

    // Return appropriate user data
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      banasthaliId: user.banasthaliId,
      email: user.email,
      userType: user.userType,
      phone: user.phone
    };

    // Add conditional fields to response
    if (user.userType === 'student') {
      userResponse.year = user.year;
      userResponse.branch = user.branch;
    } else if (user.userType === 'founder') {
      userResponse.startupName = user.startupName;
    } else if (user.userType === 'admin') {
      userResponse.designation = user.designation;
    }

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get current user - ALSO NEEDS UPDATE
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return appropriate user data
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      banasthaliId: user.banasthaliId,
      email: user.email,
      userType: user.userType,
      phone: user.phone
    };

    // Add conditional fields to response
    if (user.userType === 'student') {
      userResponse.year = user.year;
      userResponse.branch = user.branch;
    } else if (user.userType === 'founder') {
      userResponse.startupName = user.startupName;
    } else if (user.userType === 'admin') {
      userResponse.designation = user.designation;
    }

    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Logout
const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Test endpoint
const test = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth API is working',
    timestamp: new Date().toISOString()
  });
};

// Export all functions
module.exports = {
  register,
  login,
  getMe,
  logout,
  test
};