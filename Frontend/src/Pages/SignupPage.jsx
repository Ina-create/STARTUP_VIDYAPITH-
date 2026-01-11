// src/pages/SignupPage.js - UPDATED WITH COMPULSORY BANASTHALI ID & PERSONAL EMAIL
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Pages/AuthContext';
import './AuthPages.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    userType: '', // 'student', 'founder', 'admin'
    email: '',
    banasthaliId: '', // COMPULSORY FOR ALL USERS
    password: '',
    confirmPassword: '',
    year: '',
    branch: '',
    phone: '',
    startupName: '', // Only for founders
    designation: '' // For admin
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [signupError, setSignupError] = useState('');
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Validate Step 1: Basic Information
  const validateStep1 = () => {
    const newErrors = {};
    
    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    }
    
    // User Type validation
    if (!formData.userType) {
      newErrors.userType = 'Please select your user type';
    }
    
    // Email validation (REQUIRED FOR ALL) - Personal email for everyone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // BANASTHALI ID VALIDATION - NOW COMPULSORY FOR ALL
    if (!formData.banasthaliId) {
      newErrors.banasthaliId = 'Banasthali ID is REQUIRED for all users';
    } else {
      const idRegex = /^[A-Za-z]{5}\d{5}$/;
      if (!idRegex.test(formData.banasthaliId)) {
        newErrors.banasthaliId = 'ID must be exactly 5 letters followed by 5 numbers (e.g., BTBTC12345)';
      }
    }
    
    return newErrors;
  };

  // Validate Step 2: Password
  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }     
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  // Validate Step 3: Profile Details
  const validateStep3 = () => {
    const newErrors = {};
    
    // Year and Branch only for students
    if (formData.userType === 'student') {
      if (!formData.year) {
        newErrors.year = 'Current year is required';
      }
      
      if (!formData.branch) {
        newErrors.branch = 'Branch/Department is required';
      }
    }
    
    if (formData.userType === 'founder' && !formData.startupName) {
      newErrors.startupName = 'Startup name is required for founders';
    }
    
    if (formData.userType === 'admin' && !formData.designation) {
      newErrors.designation = 'Designation is required for admin';
    }
    
    // Phone validation for everyone
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }
    
    return newErrors;
  };

  // Navigate to next step
  const handleNextStep = () => {
    let validationErrors = {};
    
    if (currentStep === 1) {
      validationErrors = validateStep1();
    } else if (currentStep === 2) {
      validationErrors = validateStep2();
    }
    
    if (Object.keys(validationErrors).length === 0) {
      setCurrentStep(prev => prev + 1);
    } else {
      setErrors(validationErrors);
    }
  };

  // Navigate to previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // ✅ UPDATED: Handle form submission with different redirects for founders
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');
    const validationErrors = validateStep3();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare data for API call
      const signupData = {
        fullName: formData.fullName,
        userType: formData.userType,
        email: formData.email.toLowerCase(),
        banasthaliId: formData.banasthaliId.toUpperCase(), // COMPULSORY
        password: formData.password,
        phone: formData.phone
      };
      
      // Add conditional fields based on user type
      if (formData.userType === 'student') {
        signupData.year = formData.year;
        signupData.branch = formData.branch;
      } else if (formData.userType === 'founder') {
        signupData.startupName = formData.startupName;
      } else if (formData.userType === 'admin') {
        signupData.designation = formData.designation;
      }
      
      console.log('Submitting signup data:', signupData);
      
      // API CALL TO BACKEND
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // ✅ CRITICAL FIX: Check if backend returns success
      if (data.success) {
        // ✅ Store token and user data in localStorage for authentication
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // ✅ DIFFERENT REDIRECTS BASED ON USER TYPE
        if (formData.userType === 'founder') {
          // For founders: Store signup data and redirect to setup page
          localStorage.setItem('founderSignupData', JSON.stringify(data.user));
          console.log('Founder signup successful, redirecting to setup page');
          
          // ✅ Navigate to founder setup page with user data
          // The founderId should be data.user._id from backend
          navigate(`/founder/setup/${data.user._id}`, {
            state: { user: data.user }
          });
        } else {
          // For students and admin: redirect to login with success message
          console.log('Non-founder signup successful, redirecting to login');
          navigate('/login?signup=success');
        }
      } else {
        // If backend returns success: false
        throw new Error(data.message || 'Registration failed');
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      setSignupError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'banasthaliId') {
      // Auto-uppercase for Banasthali ID
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (signupError) {
      setSignupError('');
    }
    
    // Reset dependent fields when user type changes
    if (name === 'userType') {
      setFormData(prev => ({
        ...prev,
        startupName: '',
        designation: '',
        year: '',
        branch: ''
      }));
    }
  };

  // User type descriptions for UI
  const userTypeDescriptions = {
    student: {
      title: 'Student',
      description: 'Current students of Banasthali Vidyapith',
      icon: '👨‍🎓'
    },
    founder: {
      title: 'Startup Founder',
      description: 'Entrepreneurs building startups from Banasthali',
      icon: '🚀'
    },
    admin: {
      title: 'Admin',
      description: 'Platform administrators and faculty coordinators',
      icon: '👨‍💼'
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Panel - Branding */}
        <div className="auth-left-panel">
          <div className="university-branding">
            <div className="university-logo">
              <span className="logo-text">Banasthali Vidyapith</span>
            </div>
            <h1 className="university-tagline">
              Startup Innovation Portal
            </h1>
          </div>
          
          <div className="auth-description">
            <h2>Create Your Account</h2>
            <p>
              Join the startup ecosystem of Banasthali Vidyapith. 
              <strong> Banasthali ID is COMPULSORY for all users.</strong>
            </p>
          </div>
          
          {/* Signup Progress Indicator */}
          <div className="signup-progress">
            <div className="progress-steps">
              <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">Basic Info</div>
              </div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Security</div>
              </div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">Details</div>
              </div>
            </div>
          </div>
          
          <div className="user-type-info">
            <h4>Important Notes:</h4>
            <ul>
              <li><strong>Banasthali ID is COMPULSORY</strong> for all users</li>
              <li>Format: 5 letters + 5 numbers</li>
              <li>Example: BTBTC12345</li>
              <li>Use your personal email address</li>
              <li>All fields are required for verification</li>
            </ul>
            <div className="id-format-example">
              <strong>Banasthali ID Format:</strong>
              <div className="id-example">
                <span className="letters">BTBTC</span>
                <span className="numbers">12345</span>
              </div>
              <div className="id-explanation">
                <span>5 Letters</span>
                <span>5 Numbers</span>
              </div>
            </div>
          </div>
          
          <div className="already-have-account">
            <p>Already have an account?</p>
            <Link to="/login" className="login-link">
              Login here
            </Link>
          </div>
        </div>
        
        {/* Right Panel - Signup Form */}
        <div className="auth-right-panel">
          <div className="auth-form-container">
            <div className="form-header">
              <h2>Create New Account</h2>
              <p className="form-subtitle">
                Step {currentStep} of 3 - Banasthali ID is COMPULSORY
              </p>
            </div>
            
            {/* Display signup errors if any */}
            {signupError && (
              <div className="error-message">
                <span className="error-icon">!</span>
                {signupError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Step 1: Account Type & Basic Info */}
              {currentStep === 1 && (
                <>
                  <div className="form-group">
                    <label htmlFor="fullName" className="form-label">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`form-input ${errors.fullName ? 'error' : ''}`}
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                    {errors.fullName && (
                      <div className="field-error">{errors.fullName}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="userType" className="form-label">
                      I am a *
                    </label>
                    <div className="user-type-options">
                      {['student', 'founder', 'admin'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`user-type-btn ${formData.userType === type ? 'active' : ''}`}
                          onClick={() => handleChange({ 
                            target: { name: 'userType', value: type } 
                          })}
                        >
                          <span className="type-icon">
                            {userTypeDescriptions[type].icon}
                          </span>
                          <span className="type-label">
                            {userTypeDescriptions[type].title}
                          </span>
                          <span className="type-description">
                            {userTypeDescriptions[type].description}
                          </span>
                        </button>
                      ))}
                    </div>
                    {errors.userType && (
                      <div className="field-error">{errors.userType}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="Enter your personal email address"
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <div className="field-error">{errors.email}</div>
                    )}
                    <div className="input-hint">
                      Use your personal email for verification
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="banasthaliId" className="form-label">
                      Banasthali ID *
                    </label>
                    <div className="input-with-hint compulsory-field">
                      <input
                        type="text"
                        id="banasthaliId"
                        name="banasthaliId"
                        value={formData.banasthaliId}
                        onChange={handleChange}
                        className={`form-input ${errors.banasthaliId ? 'error' : ''}`}
                        placeholder="Enter your Banasthali ID (e.g., BTBTC12345)"
                        maxLength="10"
                        pattern="[A-Za-z]{5}\d{5}"
                        title="5 letters followed by 5 numbers"
                        disabled={isLoading}
                      />
                      <div className="input-hint compulsory-hint">
                        ⚠️ COMPULSORY: 5 letters + 5 numbers format
                      </div>
                    </div>
                    {errors.banasthaliId && (
                      <div className="field-error">{errors.banasthaliId}</div>
                    )}
                    <div className="id-examples">
                      <small>Examples: BTBTC12345, BTITC67890, BTECE24680</small>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="auth-button primary"
                    onClick={handleNextStep}
                    disabled={isLoading}
                  >
                    Next: Set Password
                  </button>
                </>
              )}
              
              {/* Step 2: Password */}
              {currentStep === 2 && (
                <>
                  <div className="password-requirements-header">
                    <h4>Create a Strong Password</h4>
                    <p>Your password must meet the following requirements:</p>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      Password *
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`form-input ${errors.password ? 'error' : ''}`}
                        placeholder="Create a strong password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? 'HIDE' : 'SHOW'}
                      </button>
                    </div>
                    {errors.password && (
                      <div className="field-error">{errors.password}</div>
                    )}
                    <div className="password-requirements">
                      <ul>
                        <li className={formData.password.length >= 8 ? 'met' : ''}>
                          At least 8 characters
                        </li>
                        <li className={/[a-z]/.test(formData.password) ? 'met' : ''}>
                          One lowercase letter
                        </li>
                        <li className={/[A-Z]/.test(formData.password) ? 'met' : ''}>
                          One uppercase letter
                        </li>
                        <li className={/\d/.test(formData.password) ? 'met' : ''}>
                          One number
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password *
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                        placeholder="Confirm your password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? 'HIDE' : 'SHOW'}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className="field-error">{errors.confirmPassword}</div>
                    )}
                  </div>
                  
                  <div className="step-buttons">
                    <button
                      type="button"
                      className="auth-button secondary"
                      onClick={handlePrevStep}
                      disabled={isLoading}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="auth-button primary"
                      onClick={handleNextStep}
                      disabled={isLoading}
                    >
                      Next: Complete Profile
                    </button>
                  </div>
                </>
              )}
              
              {/* Step 3: Profile Details */}
              {currentStep === 3 && (
                <>
                  {/* Student-specific fields */}
                  {formData.userType === 'student' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="year" className="form-label">
                          Current Year *
                        </label>
                        <select
                          id="year"
                          name="year"
                          value={formData.year}
                          onChange={handleChange}
                          className={`form-input ${errors.year ? 'error' : ''}`}
                          disabled={isLoading}
                        >
                          <option value="">Select Current Year</option>
                          <option value="1st">1st Year</option>
                          <option value="2nd">2nd Year</option>
                          <option value="3rd">3rd Year</option>
                          <option value="4th">4th Year</option>
                          <option value="5th">5th Year</option>
                        </select>
                        {errors.year && (
                          <div className="field-error">{errors.year}</div>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="branch" className="form-label">
                          Branch/Department *
                        </label>
                        <select
                          id="branch"
                          name="branch"
                          value={formData.branch}
                          onChange={handleChange}
                          className={`form-input ${errors.branch ? 'error' : ''}`}
                          disabled={isLoading}
                        >
                          <option value="">Select Branch/Department</option>
                          <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Electronics & Communication">Electronics & Communication</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Civil Engineering">Civil Engineering</option>
                          <option value="Chemical Engineering">Chemical Engineering</option>
                          <option value="Biotechnology">Biotechnology</option>
                          <option value="Business Administration">Business Administration</option>
                          <option value="Commerce">Commerce</option>
                          <option value="Arts">Arts</option>
                          <option value="Science">Science</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.branch && (
                          <div className="field-error">{errors.branch}</div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Founder-specific fields */}
                  {formData.userType === 'founder' && (
                    <div className="form-group">
                      <label htmlFor="startupName" className="form-label">
                        Startup Name *
                      </label>
                      <input
                        type="text"
                        id="startupName"
                        name="startupName"
                        value={formData.startupName}
                        onChange={handleChange}
                        className={`form-input ${errors.startupName ? 'error' : ''}`}
                        placeholder="Enter your startup name"
                        disabled={isLoading}
                      />
                      {errors.startupName && (
                        <div className="field-error">{errors.startupName}</div>
                      )}
                      {/* ✅ ADDED: Inform founders they'll go to setup page next */}
                      <div className="input-hint">
                        After signup, you'll be directed to complete your founder profile setup
                      </div>
                    </div>
                  )}
                  
                  {/* Admin-specific fields */}
                  {formData.userType === 'admin' && (
                    <div className="form-group">
                      <label htmlFor="designation" className="form-label">
                        Designation *
                      </label>
                      <select
                        id="designation"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        className={`form-input ${errors.designation ? 'error' : ''}`}
                        disabled={isLoading}
                      >
                        <option value="">Select Designation</option>
                        <option value="Faculty Coordinator">Faculty Coordinator</option>
                        <option value="Platform Admin">Platform Admin</option>
                        <option value="System Administrator">System Administrator</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.designation && (
                        <div className="field-error">{errors.designation}</div>
                      )}
                    </div>
                  )}
                  
                  {/* Common field: Phone Number */}
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`form-input ${errors.phone ? 'error' : ''}`}
                      placeholder="Enter 10-digit phone number"
                      maxLength="10"
                      disabled={isLoading}
                    />
                    {errors.phone && (
                      <div className="field-error">{errors.phone}</div>
                    )}
                  </div>
                  
                  {/* Terms and Conditions */}
                  <div className="terms-agreement">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        required 
                        disabled={isLoading}
                      />
                      <span>
                        I agree to the{' '}
                        <Link to="/terms">Terms of Service</Link> and{' '}
                        <Link to="/privacy">Privacy Policy</Link>
                      </span>
                    </label>
                  </div>
                  
                  {/* Navigation buttons for step 3 */}
                  <div className="step-buttons">
                    <button
                      type="button"
                      className="auth-button secondary"
                      onClick={handlePrevStep}
                      disabled={isLoading}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="auth-button primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="loading-spinner"></span>
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </>
              )}
              
              {/* Terms notice */}
              <div className="terms-notice">
                <p className="restricted-access">
                  Restricted Access: For Banasthali Vidyapith community only
                </p>
              </div>
            </form>
          </div>
          
          {/* Footer with security info */}
          <div className="auth-footer">
            <div className="security-info">
              <span>🔒 Banasthali ID is COMPULSORY for all accounts</span>
            </div>
            <div className="contact-support">
              Need help? <Link to="/contact">Contact Support</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;