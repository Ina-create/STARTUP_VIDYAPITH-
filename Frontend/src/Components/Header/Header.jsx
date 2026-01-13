// src/components/Header.jsx - SIMPLIFIED VERSION WITH SINGLE PROFILE OPTION
import React, { useState, useEffect } from 'react';
import './Header.css';
import { Menu, X, User, Bell, LogOut } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from "../../Pages/AuthContext";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

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
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen, showUserDropdown]);

  // Function to handle login navigation
  const handleLoginClick = () => {
    navigate('/login');
  };

  // Function to handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserDropdown(false);
  };

  // Function to handle profile click (single option for all users)
  const handleProfileClick = () => {
    if (!user) return;
    
    console.log('User data:', user); // Debug log
    
    // For founders - go to founder profile page
    if (user.type === 'founder' || user.userType === 'founder') {
      if (user.founderProfileId) {
        console.log('Founder has profile ID:', user.founderProfileId);
        navigate(`/founder/${user.founderProfileId}`);
      } else if (user._id) {
        console.log('Founder has user ID:', user._id);
        // Try to fetch founder profile using user ID
        navigate(`/founder/${user._id}`);
      } else {
        console.log('Founder has no ID, redirecting to dashboard');
        navigate('/dashboard');
      }
    } else {
      // For students, admins, and other types - go to dashboard
      console.log('Non-founder user, redirecting to dashboard');
      navigate('/dashboard');
    }
    
    setShowUserDropdown(false);
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'startups', label: 'Startups', href: '/founders' },
    { id: 'events', label: 'Events', href: '/events' },
    { id: 'blog', label: 'Blog', href: '#blog' },
    { id: 'community', label: 'Community', href: '#community' },
    { id: 'about', label: 'About', href: '/about' },
    { id: 'success', label: 'Success', href: '/success' }
  ];

  // Check if a link is active based on current route
  const isLinkActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    
    if (href.startsWith('#')) {
      // For hash links, check hash
      return location.hash === href;
    }
    
    // For other links, check if current path starts with href
    return location.pathname.startsWith(href);
  };

  const handleLinkClick = (href, e) => {
    // If it's a hash link, prevent default and scroll to section
    if (href.startsWith('#')) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // For regular links, let React Router handle it
      setIsMobileMenuOpen(false);
    }
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

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''} ${isMobileMenuOpen ? 'menu-open' : ''}`}>
        <div className="header-container">
          {/* Logo */}
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">
              <span className="logo-icon-text">BV</span>
            </div>
            <div className="logo-text">
              <span className="logo-primary">Startup Vidyapith</span>
            </div>
          </div>

          {/* Desktop Navigation - Center section */}
          <nav className="desktop-nav">
            <ul className="nav-list">
              {navLinks.map((link) => (
                <li key={link.id} className="nav-item">
                  {link.href.startsWith('#') ? (
                    // Hash links for same-page navigation
                    <a
                      href={link.href}
                      className={`nav-link ${isLinkActive(link.href) ? 'active' : ''}`}
                      onClick={(e) => handleLinkClick(link.href, e)}
                    >
                      {link.label}
                    </a>
                  ) : (
                    // Regular page navigation using Link (no page reload)
                    <Link
                      to={link.href}
                      className={`nav-link ${isLinkActive(link.href) ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Actions - Updated with better spacing */}
          <div className="header-actions">
            {/* Notifications - Only show when authenticated */}
            {isAuthenticated && (
              <button className="notification-btn" aria-label="Notifications">
                <Bell size={20} />
                <span className="notification-badge">3</span>
              </button>
            )}

            {/* User Profile Section */}
            <div className="user-section">
              {isAuthenticated && user ? (
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
                  
                  {/* User Dropdown Menu - SINGLE Profile option */}
                  {showUserDropdown && (
                    <div className="user-dropdown">
                      <div className="dropdown-header">
                        <div className="dropdown-avatar">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="dropdown-user-info">
                          <strong>{user.fullName || user.name}</strong>
                          <small>{getUserRole()} • {user.banasthaliId || user.id}</small>
                        </div>
                      </div>
                      <div className="dropdown-divider"></div>
                      
                      {/* SINGLE PROFILE ITEM - Shows "My Profile" for everyone */}
                      <button 
                        className="dropdown-item" 
                        onClick={handleProfileClick}
                      >
                        <User size={16} /> 
                        My Profile
                      </button>
                      
                      <div className="dropdown-divider"></div>
                      
                      {/* LOGOUT ITEM */}
                      <button className="dropdown-item logout" onClick={handleLogout}>
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="guest-section">
                  <div 
                    className="user-profile clickable guest"
                    onClick={handleLoginClick}
                    style={{ cursor: 'pointer' }}
                    title="Click to login"
                  >
                    <div className="avatar">
                      <User size={20} />
                    </div>
                    <div className="user-info">
                      <span className="user-name">Welcome</span>
                      <span className="user-role">Guest</span>
                    </div>
                  </div>
                  
                  {/* Get Started Button - Smaller size */}
                  <button 
                    className="cta-button"
                    onClick={handleLoginClick}
                  >
                    <span className="cta-text">Get Started</span>
                    <span className="cta-icon">→</span>
                  </button>
                </div>
              )}
            </div>

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

        {/* Mobile Navigation - SINGLE Profile option */}
        <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-container">
            {/* Mobile Links */}
            <ul className="mobile-nav-list">
              {navLinks.map((link) => (
                <li key={link.id} className="mobile-nav-item">
                  {link.href.startsWith('#') ? (
                    // Hash links for same-page navigation
                    <a
                      href={link.href}
                      className={`mobile-nav-link ${isLinkActive(link.href) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        const element = document.querySelector(link.href);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    // Regular page navigation
                    <Link
                      to={link.href}
                      className={`mobile-nav-link ${isLinkActive(link.href) ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* Mobile Actions - SINGLE Profile option */}
            <div className="mobile-actions">
              {isAuthenticated && user ? (
                <>
                  <div className="mobile-user-info">
                    <div className="mobile-avatar">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="mobile-user-details">
                      <strong>{user.fullName || user.name}</strong>
                      <small>{getUserRole()} • {user.banasthaliId || user.id}</small>
                    </div>
                  </div>
                  <div className="mobile-user-links">
                    {/* SINGLE PROFILE LINK - Shows "My Profile" for everyone */}
                    <button 
                      className="mobile-user-link" 
                      onClick={handleProfileClick}
                    >
                      <User size={16} /> 
                      My Profile
                    </button>
                    
                    {/* LOGOUT LINK */}
                    <button className="mobile-user-link logout" onClick={handleLogout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="mobile-guest-section">
                  <div className="mobile-guest-info">
                    <User size={24} />
                    <div>
                      <strong>Welcome Guest</strong>
                      <p>Login to access all features</p>
                    </div>
                  </div>
                  <button 
                    className="mobile-cta-button"
                    onClick={() => {
                      handleLoginClick();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <span>Get Started</span>
                    <span>→</span>
                  </button>
                </div>
              )}
              
              <div className="mobile-footer">
                <div className="mobile-divider"></div>
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
