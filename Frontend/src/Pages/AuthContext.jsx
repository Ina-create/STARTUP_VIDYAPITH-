// src/Pages/AuthContext.jsx - UPDATED VERSION
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Import the constants
import { API_BASE_URL } from '../constants.jsx';

// Configure axios to send cookies with requests
const api = axios.create({
  baseURL: API_BASE_URL,  // CHANGED: Using the constant instead of hardcoded URL
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize user from localStorage on app start
  useEffect(() => {
    const initUserFromStorage = () => {
      try {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        console.log('🔄 Initializing from localStorage:', {
          hasUser: !!userStr,
          hasToken: !!token
        });
        
        if (userStr && token) {
          try {
            const userData = JSON.parse(userStr);
            console.log('📋 Loaded user from localStorage:', {
              id: userData._id,
              name: userData.fullName,
              type: userData.userType
            });
            setUser(userData);
          } catch (err) {
            console.error('❌ Error parsing user from localStorage:', err);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('❌ Error initializing from localStorage:', error);
      }
    };
    
    initUserFromStorage();
    checkUserLoggedIn();
  }, []);

  // Check if user is logged in on app start
  const checkUserLoggedIn = async () => {
    try {
      console.log('🔄 Checking if user is logged in via API...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('❌ No token found, skipping API check');
        setLoading(false);
        return;
      }
      
      const response = await api.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Auth check response:', response.data);
      
      if (response.data.success && response.data.user) {
        const userData = response.data.user;
        console.log('👤 User found via API:', {
          id: userData._id,
          name: userData.fullName,
          type: userData.userType,
          banasthaliId: userData.banasthaliId
        });
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser({
          ...userData,
          type: userData.userType,
          id: userData._id,
          name: userData.fullName
        });
      } else {
        console.log('❌ No active session found via API');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.log('🔒 API check failed:', err.message);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ADDED: Debug function to check user in database
  const checkUserExists = async (banasthaliId, email) => {
    try {
      console.log('🔍 Checking user in database:', { banasthaliId, email });
      const response = await api.post('/auth/check-user', {
        banasthaliId: banasthaliId?.toUpperCase(),
        email: email?.toLowerCase()
      });
      console.log('📊 User check result:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Check user error:', error);
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      console.log('📝 Registering user with data:', {
        fullName: userData.fullName,
        banasthaliId: userData.banasthaliId,
        email: userData.email
      });

      const response = await api.post('/auth/register', {
        fullName: userData.fullName,
        banasthaliId: userData.banasthaliId,
        email: userData.email,
        password: userData.password,
        branch: userData.branch,
        year: userData.year,
        phone: userData.phone
      });
      
      console.log('✅ Registration response:', response.data);
      
      if (response.data.success && response.data.token && response.data.user) {
        const { token, user: userData } = response.data;
        
        console.log('🎉 Registration successful! User:', {
          id: userData._id,
          name: userData.fullName,
          type: userData.userType
        });
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser({
          ...userData,
          type: userData.userType,
          id: userData._id,
          name: userData.fullName
        });
        return { success: true, user: userData, token };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('❌ Registration error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      console.log('🔑 Attempting login with:', {
        banasthaliId: credentials.banasthaliId,
        email: credentials.email,
        passwordLength: credentials.password?.length
      });

      const response = await api.post('/auth/login', {
        banasthaliId: credentials.banasthaliId?.toUpperCase(),
        email: credentials.email?.toLowerCase(),
        password: credentials.password
      });
      
      console.log('✅ Login response:', response.data);
      
      if (response.data.success && response.data.token && response.data.user) {
        const { token, user: userData } = response.data;
        
        console.log('🎉 Login successful! User:', {
          id: userData._id,
          name: userData.fullName,
          type: userData.userType,
          banasthaliId: userData.banasthaliId,
          email: userData.email
        });
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser({
          ...userData,
          type: userData.userType,
          id: userData._id,
          name: userData.fullName
        });
        
        return { success: true, user: userData, token };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Login failed. Please check your credentials.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('👋 Logging out...');
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await api.post('/auth/logout', {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (err) {
          console.error('Logout API error:', err);
        }
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setError(null);
      console.log('✅ User logged out and local storage cleared');
    }
  };

  // Update user details
  const updateUser = async (userData) => {
    try {
      console.log('📝 Updating user details:', userData);
      const token = localStorage.getItem('token');
      
      const response = await api.put('/auth/updatedetails', userData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success && response.data.user) {
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setUser({
          ...updatedUser,
          type: updatedUser.userType,
          id: updatedUser._id,
          name: updatedUser.fullName
        });
        return { success: true, user: updatedUser };
      }
    } catch (err) {
      console.error('❌ Update error:', err);
      const errorMessage = err.response?.data?.message || 'Update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Test login functions for demo accounts
  const testLogin = async (userType) => {
    console.log(`🧪 Testing ${userType} login...`);
    
    const demoAccounts = {
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

    const account = demoAccounts[userType];
    if (!account) {
      console.error(`❌ No demo account for type: ${userType}`);
      return { success: false, error: `Demo ${userType} account not found` };
    }

    console.log(`📤 Using demo ${userType} credentials:`, {
      banasthaliId: account.banasthaliId,
      email: account.email
    });

    return await login(account);
  };

  // Force refresh user data
  const refreshUser = async () => {
    await checkUserLoggedIn();
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateUser,
    checkUserExists, // Now properly defined
    testLogin,
    refreshUser,
    isAuthenticated: !!user && !!localStorage.getItem('token'),
    isAdmin: user?.type === 'admin' || user?.userType === 'admin',
    isFounder: user?.type === 'founder' || user?.userType === 'founder',
    isStudent: user?.type === 'student' || user?.userType === 'student' || user?.userType === 'user'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};