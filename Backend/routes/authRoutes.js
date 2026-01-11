// routes/authRoutes.js - SIMPLIFIED VERSION
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/test', authController.test);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;