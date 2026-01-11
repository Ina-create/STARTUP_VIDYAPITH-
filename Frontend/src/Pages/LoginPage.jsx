// src/pages/LoginPage.js - UPDATED WITH FOUNDER REDIRECT
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../Pages/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    banasthaliId: '',
    email: '',
    password: ''  
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for signup success message
  useEffect(() => {
    if (location.search.includes('signup=success')) {
      setShowSuccessMessage('Account created successfully! Please login with your credentials.');
    }
  }, [location]);

  const validateForm = () => {
    const newErrors = {};
    
    // Banasthali ID validation - COMPULSORY
    if (!formData.banasthaliId) {
      newErrors.banasthaliId = 'Banasthali ID is required';
    } else {
      const idRegex = /^[A-Za-z]{5}\d{5}$/;
      if (!idRegex.test(formData.banasthaliId)) {
        newErrors.banasthaliId = 'ID must be exactly 5 uppercase letters followed by 5 numbers (e.g., BTCSE20201)';
      }
    }
    
    // Email validation - COMPULSORY
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    // Password validation - COMPULSORY
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Send all three fields to backend for verification
      const credentials = {
        banasthaliId: formData.banasthaliId.toUpperCase(),
        email: formData.email.toLowerCase(),
        password: formData.password
      };

      console.log('🔄 Sending login credentials:', credentials);

      const result = await login(credentials, rememberMe);
      
      console.log('✅ Login result:', result);
      
      if (result.success) {
        // Navigate based on user type
        const userType = result.user?.userType || result.user?.type || 'student';
        const userId = result.user?._id;
        
        console.log(`🎉 Login successful! User type: ${userType}, ID: ${userId}`);
        
        // Handle founder-specific routing
        if (userType === 'founder') {
          // Check if founder has a profile
          if (result.user.founderProfileId) {
            // Redirect to founder profile page
            navigate(`/founder/${result.user.founderProfileId}`);
          } else if (result.user.profileComplete === false) {
            // Redirect to setup page
            navigate('/founder/setup', { 
              state: { user: result.user } 
            });
          } else {
            // Try to fetch founder profile
            try {
              const founderResponse = await fetch(`http://localhost:5000/api/founders/user/${userId}`, {
                headers: {
                  'Authorization': `Bearer ${result.token || localStorage.getItem('token')}`
                }
              });
              
              if (founderResponse.ok) {
                const founderData = await founderResponse.json();
                if (founderData.success && founderData.founder) {
                  navigate(`/founder/${founderData.founder._id}`);
                } else {
                  navigate('/founder/setup', { 
                    state: { user: result.user } 
                  });
                }
              } else {
                navigate('/founder/setup', { 
                  state: { user: result.user } 
                });
              }
            } catch (error) {
              console.error('Error fetching founder profile:', error);
              navigate('/founder/setup', { 
                state: { user: result.user } 
              });
            }
          }
        } else if (userType === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setLoginError(result.error || 'Invalid credentials. Please check your Banasthali ID, Email, and Password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convert Banasthali ID to uppercase as user types
    if (name === 'banasthaliId') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (loginError) setLoginError('');
    if (showSuccessMessage) setShowSuccessMessage('');
  };

  const handleDemoLogin = async (type) => {
    console.log(`🔄 Demo login clicked for: ${type}`);
    
    const demoUsers = {
      student: {
        banasthaliId: 'BTCSE20201',
        email: 'priya.sharma@gmail.com',
        password: 'Student@123'
      },
      founder: {
        banasthaliId: 'BTFDR20201',
        email: 'meera.joshi@techstartup.com',
        password: 'Founder@123'
      },
      admin: {
        banasthaliId: 'BTADM20201',
        email: 'sunita.verma@banasthali.in',
        password: 'Admin@123'
      }
    };
    
    const demo = demoUsers[type];
    
    if (!demo) {
      console.error('❌ No demo user for type:', type);
      setLoginError(`Demo ${type} account not found`);
      return;
    }
    
    console.log('📤 Sending demo credentials:', demo);
    
    setFormData(demo);
    setLoginError('');
    setErrors({});
    setShowSuccessMessage('');
    
    // Auto-submit the demo login
    setIsLoading(true);
    try {
      const credentials = {
        banasthaliId: demo.banasthaliId,
        email: demo.email,
        password: demo.password
      };
      
      const result = await login(credentials, false);
      
      console.log('✅ Demo login result:', result);
      
      if (result.success) {
        const userType = result.user?.userType || type;
        const userId = result.user?._id;
        
        console.log(`🎉 Demo login successful! User type: ${userType}, ID: ${userId}`);
        
        // Handle founder-specific routing
        if (userType === 'founder') {
          // Check if founder has a profile
          if (result.user.founderProfileId) {
            // Redirect to founder profile page
            navigate(`/founder/${result.user.founderProfileId}`);
          } else {
            // Try to fetch founder profile or go to setup
            try {
              const founderResponse = await fetch(`http://localhost:5000/api/founders/user/${userId}`);
              
              if (founderResponse.ok) {
                const founderData = await founderResponse.json();
                if (founderData.success && founderData.founder) {
                  navigate(`/founder/${founderData.founder._id}`);
                } else {
                  navigate('/founder/setup', { 
                    state: { user: result.user } 
                  });
                }
              } else {
                navigate('/founder/setup', { 
                  state: { user: result.user } 
                });
              }
            } catch (error) {
              navigate('/founder/setup', { 
                state: { user: result.user } 
              });
            }
          }
        } else if (userType === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        console.error('❌ Demo login failed:', result.error);
        setLoginError(result.error || `Demo ${type} login failed`);
      }
    } catch (error) {
      console.error('❌ Demo login error:', error);
      setLoginError(`Demo ${type} login failed. Please try again.`);
    } finally {
      setIsLoading(false);
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
            <h2>Secure Login</h2>
            <p>
              All three fields are required for enhanced security and verification.
            </p>
          </div>
          
          <div className="login-requirements">
            <div className="requirement-item">
              <div className="requirement-icon">🎯</div>
              <div className="requirement-text">
                <h4>Banasthali ID Required</h4>
                <p>5 uppercase letters + 5 numbers<br/>Format: BTCSE20201</p>
              </div>
            </div>
            <div className="requirement-item">
              <div className="requirement-icon">📧</div>
              <div className="requirement-text">
                <h4>Email Required</h4>
                <p>Registered email for verification</p>
              </div>
            </div>
            <div className="requirement-item">
              <div className="requirement-icon">🔒</div>
              <div className="requirement-text">
                <h4>Password Required</h4>
                <p>Minimum 6 characters</p>
              </div>
            </div>
          </div>
          
          <div className="demo-credentials">
            <h4>Demo Accounts (Use these for testing):</h4>
            <div className="demo-account-item">
              <strong>🎓 Student:</strong><br/>
              ID: <span className="demo-id">BTCSE20201</span><br/>
              Email: priya.sharma@gmail.com<br/>
              Password: Student@123
            </div>
            <div className="demo-account-item">
              <strong>💼 Founder:</strong><br/>
              ID: <span className="demo-id">BTFDR20201</span><br/>
              Email: meera.joshi@techstartup.com<br/>
              Password: Founder@123
            </div>
            <div className="demo-account-item">
              <strong>👨‍💼 Admin:</strong><br/>
              ID: <span className="demo-id">BTADM20201</span><br/>
              Email: sunita.verma@banasthali.in<br/>
              Password: Admin@123
            </div>
          </div>
          
          <div className="already-have-account">
            <p>Don't have an account?</p>
            <Link to="/signup" className="login-link">
              Create New Account
            </Link>
          </div>
        </div>
        
        {/* Right Panel - Login Form */}
        <div className="auth-right-panel">
          <div className="auth-form-container">
            <div className="form-header">
              <h2>Login to Portal</h2>
              <p className="form-subtitle">
                All fields are required for verification
              </p>
            </div>
            
            {showSuccessMessage && (
              <div className="success-message">
                <span className="success-icon">✓</span>
                {showSuccessMessage}
              </div>
            )}
            
            {loginError && (
              <div className="error-message">
                <span className="error-icon">!</span>
                {loginError}
              </div>
            )}
            
            {/* TEST BUTTON - TEMPORARY */}
            <button 
              type="button"
              onClick={() => handleDemoLogin('founder')}
              style={{
                background: '#3b82f6', 
                color: 'white', 
                padding: '10px', 
                margin: '10px 0',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: 'bold'
              }}
            >
              🚀 TEST FOUNDER LOGIN (Meera Joshi)
            </button>
            
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Banasthali ID Field - COMPULSORY */}
              <div className="form-group">
                <label htmlFor="banasthaliId" className="form-label">
                  Banasthali ID *
                </label>
                <div className="input-with-hint">
                  <input
                    type="text"
                    id="banasthaliId"
                    name="banasthaliId"
                    value={formData.banasthaliId}
                    onChange={handleChange}
                    className={`form-input ${errors.banasthaliId ? 'error' : ''}`}
                    placeholder="Enter your Banasthali ID (e.g., BTCSE20201)"
                    maxLength="10"
                    disabled={isLoading}
                    pattern="[A-Za-z]{5}\d{5}"
                    title="5 letters followed by 5 numbers"
                  />
                  <div className="input-hint">
                    Format: 5 uppercase letters + 5 numbers (e.g., BTCSE20201)
                  </div>
                </div>
                {errors.banasthaliId && (
                  <div className="field-error">{errors.banasthaliId}</div>
                )}
              </div>
              
              {/* Email Field - COMPULSORY */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address *
                </label>
                <div className="input-with-hint">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter your registered email"
                    disabled={isLoading}
                  />
                  <div className="input-hint">
                    Use the email you registered with
                  </div>
                </div>
                {errors.email && (
                  <div className="field-error">{errors.email}</div>
                )}
              </div>
              
              {/* Password Field - COMPULSORY */}
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
                    placeholder="Enter your password"
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
                
                <div className="form-options">
                  <label className="remember-me">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                    />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="forgot-password">
                    Forgot Password?
                  </Link>
                </div>
              </div>
              
              <button
                type="submit"
                className="auth-button primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
              
              <div className="demo-logins">
                <p className="demo-label">Quick Test Accounts (Click any):</p>
                <div className="demo-buttons">
                  <button
                    type="button"
                    className="demo-btn student"
                    onClick={() => handleDemoLogin('student')}
                    disabled={isLoading}
                  >
                    <span>👨‍🎓</span> Student
                  </button>
                  <button
                    type="button"
                    className="demo-btn founder"
                    onClick={() => handleDemoLogin('founder')}
                    disabled={isLoading}
                  >
                    <span>🚀</span> Founder
                  </button>
                  <button
                    type="button"
                    className="demo-btn admin"
                    onClick={() => handleDemoLogin('admin')}
                    disabled={isLoading}
                  >
                    <span>👨‍💼</span> Admin
                  </button>
                </div>
              </div>
              
              <div className="auth-divider">
                <div></div>
                <span>New to the portal?</span>
                <div></div>
              </div>
              
              <Link to="/signup" className="auth-button secondary">
                Create New Account
              </Link>
              
              <div className="terms-notice">
                <p>
                  By logging in, you agree to our{' '}
                  <Link to="/terms">Terms of Service</Link> and{' '}
                  <Link to="/privacy">Privacy Policy</Link>.
                </p>
                <p className="restricted-access">
                  Restricted Access: For Banasthali Vidyapith Community Only
                </p>
              </div>
            </form>
          </div>
          
          <div className="auth-footer">
            <div className="security-info">
              <span>🔒 All three fields are required for security verification</span>
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

export default LoginPage;