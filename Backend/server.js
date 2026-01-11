// server.js - CORRECTED VERSION
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path'); // ADD THIS
const connectDB = require('./database/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const founderRoutes = require('./routes/founders');
const productRoutes = require('./routes/products');
const questionRoutes = require('./routes/questions');
const applicationRoutes = require('./routes/applications');
const studentRoutes = require('./routes/students');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// CORS setup
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
    'http://localhost:3000', 
    'http://localhost:5173'
  ],
  credentials: true
}));

// ✅ CRITICAL: Serve static files from uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
console.log('📁 Static files path:', uploadsPath);

// Log static file requests
app.use('/uploads', (req, res, next) => {
  console.log(`📁 Static file requested: ${req.originalUrl}`);
  next();
});

app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/founders', founderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/applications', applicationRoutes);

// Test upload directory
app.get('/test-upload', (req, res) => {
  const fs = require('fs');
  const uploadsPath = path.join(__dirname, 'uploads');
  
  try {
    const uploadsExists = fs.existsSync(uploadsPath);
    const profilesExists = fs.existsSync(path.join(uploadsPath, 'profiles'));
    const resumesExists = fs.existsSync(path.join(uploadsPath, 'resumes'));
    
    res.json({
      success: true,
      message: 'Upload directory test',
      directories: {
        uploads: uploadsExists,
        profiles: profilesExists,
        resumes: resumesExists
      },
      currentDirectory: __dirname,
      uploadsPath: uploadsPath
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Banasthali Startup Portal API',
    version: '1.0.0',
    status: 'Server is running',
    endpoints: {
      testUpload: '/test-upload',
      health: '/health',
      staticFiles: '/uploads/:filename'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    requestedUrl: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'uploads')}`);
  console.log(`🌍 Test static files at: http://localhost:${PORT}/test-upload`);
});