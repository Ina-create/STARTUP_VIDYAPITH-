// src/components/Header.jsx - COMPLETE CORRECTED VERSION
import React, { useState, useEffect } from 'react';
import './Header.css';
import { Menu, X, ChevronDown, Search, User, Bell, LogOut, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../Pages/AuthContext";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, loading } = useAuth();
  
  console.log('Header rendered with auth state:', { 
    isAuthenticated, 
    user, 
    pathname: location.pathname,
    hasToken: !!localStorage.getItem('token'),
    hasUser: !!localStorage.getItem('user')
  });

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobileMenuOpen && !e.target.closest('.mobile-menu') && !e.target.closest('.mobile-menu-btn')) {
        setIsMobileMenuOpen(false);
      }
      
      if (showUserDropdown && !e.target.closest('.user-profile') && !e.target.closest('.user-dropdown')) {
        setShowUserDropdown(false);
      }
      
      if (showGuestDropdown && !e.target.closest('.guest-profile') && !e.target.closest('.guest-dropdown')) {
        setShowGuestDropdown(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen, showUserDropdown, showGuestDropdown]);

  // Update active link based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveLink('home');
    else if (path === '/founders') setActiveLink('startups');
    else if (path === '/events') setActiveLink('events');
    else if (path === '/about') setActiveLink('about');
    else if (path === '/DashboardPage') setActiveLink('profile');
    else if (path === '/dashboard') setActiveLink('profile');
  }, [location]);

  // Function to handle login navigation
  const handleLoginClick = () => {
    navigate('/login');
    setShowGuestDropdown(false);
    setIsMobileMenuOpen(false);
  };

  // CORRECTED: Function to handle logout
  const handleLogout = () => {
    console.log('Header: Logging out');
    logout(); // Calls AuthContext logout
    setShowUserDropdown(false);
    setShowGuestDropdown(false);
    setIsMobileMenuOpen(false);
    // Navigate to login page
    navigate('/login');
  };

  // Get profile link based on user type
  const getProfileLink = () => {
    if (!user) return '/login';
    
    if (user.userType === 'founder') {
      return `/founder/${user._id}`;
    } else {
      return '/dashboard';
    }
  };

  // Handle profile click
  const handleProfileClick = () => {
    const link = getProfileLink();
    console.log('Profile click, navigating to:', link);
    navigate(link);
    setShowUserDropdown(false);
    setShowGuestDropdown(false);
    setIsMobileMenuOpen(false);
  };

  // Handle guest profile click
  const handleGuestProfileClick = () => {
    // For guests, navigate to login
    navigate('/login');
    setShowGuestDropdown(false);
    setIsMobileMenuOpen(false);
  };

  // Get user's first name
  const getUserFirstName = () => {
    if (!user) return '';
    if (user.fullName) return user.fullName.split(' ')[0];
    if (user.name) return user.name.split(' ')[0];
    return 'User';
  };

  // Get user type/role
  const getUserRole = () => {
    if (!user) return 'Guest';
    if (user.userType) return user.userType.charAt(0).toUpperCase() + user.userType.slice(1);
    if (user.type) return user.type.charAt(0).toUpperCase() + user.type.slice(1);
    return 'User';
  };
  
  const navLinks = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'startups', label: 'Startups', href: '/founders' },
    { id: 'events', label: 'Events', href: '/events' },
    { id: 'blog', label: 'Blog', href: '#blog' },
    { id: 'community', label: 'Community', href: '#community' },
    { id: 'about', label: 'About', href: '/about' },
  ];

  const handleLinkClick = (id, e) => {
    if (e) e.preventDefault();
    setActiveLink(id);
    setIsMobileMenuOpen(false);
    
    // Navigate to the correct page
    const link = navLinks.find(l => l.id === id);
    if (link && link.href !== '#') {
      navigate(link.href);
    }
  };

  // Don't render until auth state is loaded
  if (loading) {
    return (
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <div className="logo-icon">
              <span className="logo-icon-text">BV</span>
            </div>
            <div className="logo-text">
              <span className="logo-primary">Banasthali</span>
              <span className="logo-secondary">Startup Hub</span>
            </div>
          </div>
          <div className="header-actions">
            <div className="loading-auth">Loading...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''} ${isMobileMenuOpen ? 'menu-open' : ''}`}>
        <div className="header-container">
          {/* Logo */}
          <div 
            className="logo"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            <div className="logo-icon">
              <span className="logo-icon-text">BV</span>
            </div>
            <div className="logo-text">
              <span className="logo-primary">Banasthali</span>
              <span className="logo-secondary">Startup Hub</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <ul className="nav-list">
              {navLinks.map((link) => (
                <li key={link.id} className="nav-item">
                  <a
                    href={link.href}
                    className={`nav-link ${activeLink === link.id ? 'active' : ''}`}
                    onClick={(e) => handleLinkClick(link.id, e)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Actions */}
          <div className="header-actions">
            {/* Search Bar */}
            <div className={`search-container ${isSearchOpen ? 'open' : ''}`}>
              <button 
                className="search-toggle"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Toggle search"
              >
                <Search size={20} />
              </button>
              <div className="search-bar">
                <input 
                  type="text" 
                  placeholder="Search startups, events, resources..." 
                  className="search-input"
                />
                <button className="search-submit" aria-label="Search">
                  <Search size={18} />
                </button>
              </div>
            </div>

            {/* Notifications - Only show if logged in */}
            {isAuthenticated && (
              <button className="notification-btn" aria-label="Notifications">
                <Bell size={20} />
                <span className="notification-badge">3</span>
              </button>
            )}

            {/* User Profile */}
            {isAuthenticated && user ? (
              // Logged-in User
              <div 
                className="user-profile clickable"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                style={{ cursor: 'pointer', position: 'relative' }}
                title="Click for options"
              >
                <div className="avatar">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-info">
                  <span className="user-name">Welcome, {getUserFirstName()}</span>
                  <span className="user-role" style={{ textTransform: 'capitalize' }}>
                    {getUserRole()}
                  </span>
                </div>
                
                {/* User Dropdown Menu */}
                {showUserDropdown && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="dropdown-user-info">
                        <strong>{user.fullName || 'User'}</strong>
                        <small style={{ textTransform: 'capitalize' }}>
                          {user.userType || 'User'} • {user.banasthaliId || user._id?.substring(0, 8)}
                        </small>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button 
                      className="dropdown-item"
                      onClick={handleProfileClick}
                    >
                      <User size={16} /> 
                      {user.userType === 'founder' ? 'My Founder Profile' : 'Student Dashboard'}
                    </button>
                    
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/');
                        setShowUserDropdown(false);
                      }}
                    >
                      <Home size={16} /> Home
                    </button>
                    
                    {user.userType === 'founder' && (
                      <button 
                        className="dropdown-item"
                        onClick={() => {
                          navigate('/founder/setup');
                          setShowUserDropdown(false);
                        }}
                      >
                        <span className="icon">⚙️</span> Edit Profile
                      </button>
                    )}
                    
                    <div className="dropdown-divider"></div>
                    
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Guest User
              <div 
                className="user-profile guest-profile clickable"
                onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                style={{ cursor: 'pointer', position: 'relative' }}
                title="Login or Profile"
              >
                <div className="avatar">
                  <User size={20} />
                </div>
                <div className="user-info">
                  <span className="user-name">Welcome</span>
                  <span className="user-role">Guest</span>
                </div>
                
                {/* Guest Dropdown Menu */}
                {showGuestDropdown && (
                  <div className="user-dropdown guest-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">
                        <User size={24} />
                      </div>
                      <div className="dropdown-user-info">
                        <strong>Welcome Guest!</strong>
                        <small>Login or create account</small>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button 
                      className="dropdown-item"
                      onClick={handleLoginClick}
                    >
                      <User size={16} /> Login
                    </button>
                    
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/signup');
                        setShowGuestDropdown(false);
                      }}
                    >
                      <span className="icon">📝</span> Register
                    </button>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button className="dropdown-item" onClick={() => {
                      navigate('/dashboard');
                      setShowGuestDropdown(false);
                    }}>
                      <span className="icon">👁️</span> View Dashboard
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-container">
            {/* Mobile Search */}
            <div className="mobile-search">
              <Search size={20} className="mobile-search-icon" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="mobile-search-input"
              />
            </div>

            {/* Mobile Links */}
            <ul className="mobile-nav-list">
              {navLinks.map((link) => (
                <li key={link.id} className="mobile-nav-item">
                  <a
                    href={link.href}
                    className={`mobile-nav-link ${activeLink === link.id ? 'active' : ''}`}
                    onClick={(e) => handleLinkClick(link.id, e)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Mobile Actions */}
            <div className="mobile-actions">
              {isAuthenticated && user ? (
                <>
                  <div className="mobile-user-info">
                    <div className="mobile-avatar">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="mobile-user-details">
                      <strong>{user.fullName || 'User'}</strong>
                      <small style={{ textTransform: 'capitalize' }}>
                        {user.userType || 'User'} • {user.banasthaliId || user._id?.substring(0, 8)}
                      </small>
                    </div>
                  </div>
                  
                  <div className="mobile-user-links">
                    <button 
                      className="mobile-user-link"
                      onClick={handleProfileClick}
                    >
                      <User size={16} /> 
                      {user.userType === 'founder' ? 'My Founder Profile' : 'Student Dashboard'}
                    </button>
                    
                    <button 
                      className="mobile-user-link"
                      onClick={() => {
                        navigate('/');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Home size={16} /> Home
                    </button>
                    
                    {user.userType === 'founder' && (
                      <button 
                        className="mobile-user-link"
                        onClick={() => {
                          navigate('/founder/setup');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        ⚙️ Edit Profile
                      </button>
                    )}
                    
                    <button 
                      className="mobile-user-link logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mobile-guest-info">
                    <div className="mobile-avatar">
                      <User size={24} />
                    </div>
                    <div className="mobile-guest-details">
                      <strong>Welcome Guest!</strong>
                      <small>Login or create account</small>
                    </div>
                  </div>
                  
                  <div className="mobile-user-links">
                    <button 
                      className="mobile-user-link"
                      onClick={() => {
                        navigate('/login');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <User size={16} /> Login
                    </button>
                    
                    <button 
                      className="mobile-user-link"
                      onClick={() => {
                        navigate('/signup');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      📝 Register
                    </button>
                    
                    <button 
                      className="mobile-user-link"
                      onClick={() => {
                        navigate('/dashboard');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      👁️ View Dashboard
                    </button>
                  </div>
                </>
              )}
              
              <div className="mobile-footer">
                <p className="university-info">
                  Banasthali Vidyapith • Rajasthan, India
                </p>
                <p className="copyright">
                  © 2024 Startup Hub. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header;