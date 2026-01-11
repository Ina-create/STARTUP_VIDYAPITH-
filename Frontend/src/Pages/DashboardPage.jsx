// src/Pages/DashboardPage.js - UPDATED WITH ENVIRONMENT VARIABLES
import React, { useState, useEffect } from 'react';
import { useAuth } from '../Pages/AuthContext';
import Header from '../Components/Header/Header.jsx';
import { API_BASE_URL, BACKEND_URL } from '../constants.jsx';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  
  // Form states for editing
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    branch: user?.branch || '',
    year: user?.year || '',
    enrollmentNumber: user?.enrollmentNumber || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    profileImage: user?.profileImage || null,
    resume: user?.resume || null
  });
  
  // Recent applications
  const [recentApplications, setRecentApplications] = useState([]);
  
  // Notifications (only for accepted applications)
  const [notifications, setNotifications] = useState([]);
  
  // Application details modal
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  
  // Notification panel
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  
  // Profile completion percentage
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  // Debug useEffect
  useEffect(() => {
    console.log('=== DASHBOARD DEBUG ===');
    console.log('User from context:', user);
    console.log('Profile data state:', profileData);
    console.log('Profile image exists:', !!profileData.profileImage);
    console.log('Profile image URL:', profileData.profileImage);
    console.log('API Base URL:', API_BASE_URL);
    console.log('Backend URL:', BACKEND_URL);
  }, [user, profileData]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchNotifications();
    }
  }, [user]);

  // Helper to get absolute URL
  const getAbsoluteUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('data:image')) return url;
    if (url.startsWith('/uploads')) return `${BACKEND_URL}${url}`;
    return `${BACKEND_URL}/uploads/profiles/${url}`;
  };

  // Fetch all dashboard data from backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setDebugInfo('Fetching dashboard data...');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        setDebugInfo('No token found');
        setLoading(false);
        return;
      }
      
      console.log('=== FETCHING STUDENT PROFILE ===');
      
      // Fetch student profile - FIRST check if endpoint exists
      const profileResponse = await fetch(`${API_BASE_URL}/students/profile`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log('Profile API Response Status:', profileResponse.status);
      
      if (profileResponse.status === 404) {
        setDebugInfo('Profile endpoint not found (404). Trying alternative endpoint...');
        // Try alternative endpoint
        await fetchStudentDataAlternative(token);
        return;
      }
      
      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('Profile fetch error:', errorText);
        setDebugInfo(`Profile fetch failed: ${profileResponse.status} - ${errorText}`);
        setLoading(false);
        return;
      }
      
      const profileDataFromApi = await profileResponse.json();
      console.log('Profile API Response Data:', profileDataFromApi);
      
      if (profileDataFromApi.success && profileDataFromApi.user) {
        const userData = profileDataFromApi.user;
        console.log('User data from API:', userData);
        
        // Map backend fields to frontend state
        const mappedData = {
          name: userData.fullName || userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          branch: userData.branch || '',
          year: userData.year || '',
          enrollmentNumber: userData.enrollmentNumber || '',
          bio: userData.bio || '',
          skills: userData.skills || [],
          profileImage: userData.profileImage ? getAbsoluteUrl(userData.profileImage) : null,
          resume: userData.resume ? getAbsoluteUrl(userData.resume) : null
        };
        
        console.log('Mapped profile data for display:', mappedData);
        setProfileData(mappedData);
        setDebugInfo(`Profile loaded successfully. Image: ${mappedData.profileImage ? 'Yes' : 'No'}`);
        
        // Calculate profile completion
        calculateProfileCompletion(userData);
        
        // Now fetch applications
        await fetchApplications(token);
        
      } else {
        console.error('Profile API returned success: false', profileDataFromApi.error);
        setDebugInfo(`Profile API error: ${profileDataFromApi.error}`);
        setLoading(false);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDebugInfo(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  // Alternative method to fetch student data
  const fetchStudentDataAlternative = async (token) => {
    try {
      console.log('Trying alternative endpoint: /api/users/profile');
      
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Alternative endpoint response:', data);
        
        if (data.success && data.user) {
          const userData = data.user;
          const mappedData = {
            name: userData.fullName || userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            branch: userData.branch || '',
            year: userData.year || '',
            enrollmentNumber: userData.enrollmentNumber || '',
            bio: userData.bio || '',
            skills: userData.skills || [],
            profileImage: userData.profileImage ? getAbsoluteUrl(userData.profileImage) : null,
            resume: userData.resume ? getAbsoluteUrl(userData.resume) : null
          };
          
          setProfileData(mappedData);
          setDebugInfo('Profile loaded via alternative endpoint');
          calculateProfileCompletion(userData);
        }
      } else {
        setDebugInfo('Alternative endpoint also failed');
      }
    } catch (error) {
      console.error('Error with alternative endpoint:', error);
    }
  };

  // Fetch applications separately
  const fetchApplications = async (token) => {
    try {
      console.log('=== FETCHING APPLICATIONS ===');
      
      // Try multiple endpoints for applications
      const endpoints = [
        `${API_BASE_URL}/students/applications`,
        `${API_BASE_URL}/applications/student`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`Trying endpoint ${endpoint}, status:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Applications from ${endpoint}:`, data);
            
            if (data.success && data.applications) {
              const transformedApps = data.applications.slice(0, 5).map(app => ({
                id: app._id,
                startupName: app.startupName || app.founderId?.startupName || 'Unknown Startup',
                role: app.role,
                status: app.status,
                appliedDate: new Date(app.createdAt).toLocaleDateString(),
                message: app.message,
                experience: app.experience,
                skills: app.skills || [],
                email: app.email,
                phone: app.phone,
                resume: app.resume,
                portfolio: app.portfolio
              }));
              
              setRecentApplications(transformedApps);
              console.log('Applications loaded:', transformedApps.length);
              break;
            }
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.message);
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/applications/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const acceptedNotifications = data.notifications.filter(n => 
            n.type === 'application_update' && 
            (n.message.toLowerCase().includes('accepted') || 
             n.title.toLowerCase().includes('accepted'))
          );
          setNotifications(acceptedNotifications);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/applications/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setNotifications(notifications.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const calculateProfileCompletion = (userData) => {
    if (!userData) {
      setProfileCompletion(0);
      return;
    }
    
    let completion = 0;
    const fields = [
      userData.fullName || userData.name,
      userData.email,
      userData.branch,
      userData.year,
      userData.bio,
      (userData.skills && userData.skills.length > 0),
      userData.profileImage,
      userData.resume
    ];
    
    const completedFields = fields.filter(Boolean).length;
    completion = Math.round((completedFields / fields.length) * 100);
    console.log('Profile completion calculated:', completion);
    setProfileCompletion(completion);
  };

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload - SIMPLIFIED
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);
      
      console.log('Uploading image...');
      
      const response = await fetch(`${API_BASE_URL}/students/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      console.log('Image upload response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Image upload response:', data);
      
      if (data.success) {
        // Get image URL and make it absolute
        let imageUrl = data.imageUrl || data.profileImage;
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = `${BACKEND_URL}${imageUrl}`;
        }
        
        console.log('Image uploaded successfully:', imageUrl);
        
        // Update state
        setProfileData(prev => ({
          ...prev,
          profileImage: imageUrl
        }));
        
        alert('Profile image updated successfully!');
        
        // Update localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          userData.profileImage = imageUrl;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        // Refresh
        fetchDashboardData();
      } else {
        throw new Error(data.error || data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Handle resume upload - SIMPLIFIED
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingResume(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await fetch(`${API_BASE_URL}/students/upload-resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Resume upload response:', data);
      
      if (data.success) {
        let resumeUrl = data.resumeUrl || data.resume;
        if (resumeUrl && !resumeUrl.startsWith('http')) {
          resumeUrl = `${BACKEND_URL}${resumeUrl}`;
        }
        
        setProfileData(prev => ({
          ...prev,
          resume: resumeUrl
        }));
        
        alert('Resume uploaded successfully!');
        
        // Update localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          userData.resume = resumeUrl;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        fetchDashboardData();
      } else {
        throw new Error(data.error || data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert(`Failed to upload resume: ${error.message}`);
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  // Handle skill management
  const handleAddSkill = async (skill) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !profileData.skills.includes(trimmedSkill)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/students/skills`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ skill: trimmedSkill })
        });
        
        if (response.ok) {
          setProfileData(prev => ({
            ...prev,
            skills: [...prev.skills, trimmedSkill]
          }));
          alert('Skill added successfully!');
        }
      } catch (error) {
        console.error('Error adding skill:', error);
        setProfileData(prev => ({
          ...prev,
          skills: [...prev.skills, trimmedSkill]
        }));
      }
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/students/skills/${encodeURIComponent(skillToRemove)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setProfileData(prev => ({
          ...prev,
          skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
        alert('Skill removed successfully!');
      }
    } catch (error) {
      console.error('Error removing skill:', error);
      setProfileData(prev => ({
        ...prev,
        skills: prev.skills.filter(skill => skill !== skillToRemove)
      }));
    }
  };

  // Save profile changes - SIMPLIFIED
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Validate
      if (!profileData.name || profileData.name.trim().length < 2) {
        alert('Full name is required (minimum 2 characters)');
        return;
      }
      
      if (!profileData.branch || profileData.branch.trim().length < 2) {
        alert('Branch is required');
        return;
      }
      
      if (!profileData.year || !['1', '2', '3', '4'].includes(profileData.year.toString())) {
        alert('Valid year is required (1-4)');
        return;
      }
      
      // Prepare data
      const updateData = {
        fullName: profileData.name.trim(),
        phone: profileData.phone ? profileData.phone.trim() : '',
        branch: profileData.branch.trim(),
        year: profileData.year.toString().trim(),
        bio: profileData.bio ? profileData.bio.trim() : '',
        skills: profileData.skills || [],
        enrollmentNumber: profileData.enrollmentNumber ? profileData.enrollmentNumber.trim() : ''
      };
      
      console.log('Sending profile update:', updateData);
      
      const response = await fetch(`${API_BASE_URL}/students/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      console.log('Update response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Update failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Update response data:', data);
      
      if (data.success) {
        setIsEditing(false);
        alert('Profile updated successfully!');
        
        // Update state
        if (data.user) {
          const updatedData = {
            name: data.user.fullName || profileData.name,
            phone: data.user.phone || profileData.phone,
            branch: data.user.branch || profileData.branch,
            year: data.user.year || profileData.year,
            bio: data.user.bio || profileData.bio,
            skills: data.user.skills || profileData.skills,
            enrollmentNumber: data.user.enrollmentNumber || profileData.enrollmentNumber,
            profileImage: profileData.profileImage, // Keep existing image
            resume: profileData.resume, // Keep existing resume
            email: profileData.email
          };
          
          setProfileData(updatedData);
        }
        
        // Update localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          userData.fullName = profileData.name;
          userData.name = profileData.name;
          userData.phone = profileData.phone;
          userData.branch = profileData.branch;
          userData.year = profileData.year;
          userData.bio = profileData.bio;
          userData.skills = profileData.skills;
          userData.enrollmentNumber = profileData.enrollmentNumber;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        // Refresh
        fetchDashboardData();
      } else {
        throw new Error(data.error || data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error.message}`);
    }
  };

  // View Resume
  const viewResume = () => {
    if (profileData.resume) {
      window.open(profileData.resume, '_blank', 'noopener,noreferrer');
    } else {
      alert('No resume uploaded yet');
    }
  };

  // View Application Details
  const handleViewApplicationDetails = (application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  // Withdraw Application
  const handleWithdrawApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/withdraw`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Application withdrawn successfully!');
          fetchDashboardData();
        }
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
      alert('Failed to withdraw application. Please try again.');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Header />
        <div className="dashboard-main">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your dashboard...</p>
            <p style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>{debugInfo}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Header />
      
      {/* Debug info - remove in production */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000,
        maxWidth: '300px',
        display: debugInfo ? 'block' : 'none'
      }}>
        <strong>Debug:</strong> {debugInfo}
      </div>
      
      {/* Notification Panel */}
      {showNotificationPanel && (
        <div className="notification-panel-overlay" onClick={() => setShowNotificationPanel(false)}>
          <div className="notification-panel" onClick={(e) => e.stopPropagation()}>
            <div className="notification-header">
              <h3>Acceptance Notifications</h3>
              <button className="close-notification-btn" onClick={() => setShowNotificationPanel(false)}>
                ×
              </button>
            </div>
            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <span className="empty-icon">🎉</span>
                  <h4>No acceptance notifications yet</h4>
                  <p>You'll see notifications here when your applications get accepted</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification._id} 
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => markNotificationAsRead(notification._id)}
                  >
                    <div className="notification-icon">🎉</div>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {!notification.read && <div className="unread-dot"></div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowApplicationModal(false)}>
          <div className="modal-content application-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application Details</h2>
              <button className="close-modal-btn" onClick={() => setShowApplicationModal(false)}>×</button>
            </div>
            
            <div className="application-details">
              <div className="detail-section">
                <div className="startup-name-large">{selectedApplication.startupName}</div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Position Applied:</span>
                    <span className="detail-value">{selectedApplication.role}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="status-badge" style={{backgroundColor: getStatusColor(selectedApplication.status)}}>
                      {getStatusText(selectedApplication.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Applied Date:</span>
                    <span className="detail-value">{selectedApplication.appliedDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Your Application Message</h4>
                <div className="application-message-content">
                  <p>{selectedApplication.message}</p>
                </div>
              </div>
              
              {selectedApplication.experience && (
                <div className="detail-section">
                  <h4>Experience & Background</h4>
                  <div className="application-experience">
                    <p>{selectedApplication.experience}</p>
                  </div>
                </div>
              )}
              
              {selectedApplication.skills && selectedApplication.skills.length > 0 && (
                <div className="detail-section">
                  <h4>Skills</h4>
                  <div className="skills-tags">
                    {selectedApplication.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="modal-actions">
                {selectedApplication.resume && (
                  <button 
                    className="view-resume-btn"
                    onClick={() => window.open(selectedApplication.resume, '_blank')}
                  >
                    View Resume
                  </button>
                )}
                {selectedApplication.status === 'pending' && (
                  <button 
                    className="withdraw-application-btn"
                    onClick={() => {
                      handleWithdrawApplication(selectedApplication.id);
                      setShowApplicationModal(false);
                    }}
                  >
                    Withdraw Application
                  </button>
                )}
                <button 
                  className="close-details-btn"
                  onClick={() => setShowApplicationModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="dashboard-main">
        
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="welcome-left">
            <h1>Welcome back, {profileData.name || 'Student'}!</h1>
            <p>Connect with startups and build your career</p>
            <div className="welcome-stats">
              <div className="welcome-stat">
                <span className="stat-number">{recentApplications.length}</span>
                <span className="stat-label">Applications</span>
              </div>
              <div className="welcome-stat">
                <span className="stat-number">
                  {recentApplications.filter(app => app.status === 'accepted').length}
                </span>
                <span className="stat-label">Accepted</span>
              </div>
              <div className="welcome-stat">
                <span className="stat-number">{notifications.length}</span>
                <span className="stat-label">Notifications</span>
              </div>
            </div>
          </div>
          <div className="welcome-right">
            <div className="profile-completion">
              <div className="completion-header">
                <span>Profile Completion</span>
                <span className="completion-percent">{profileCompletion}%</span>
              </div>
              <div className="completion-bar">
                <div 
                  className="completion-fill" 
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
              <button 
                className="complete-profile-btn" 
                onClick={() => setIsEditing(true)}
              >
                {profileCompletion < 100 ? 'Complete Profile' : 'Update Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>My Profile</h2>
            <div className="section-actions">
              {!isEditing ? (
                <button 
                  className="edit-profile-btn"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setIsEditing(false);
                      fetchDashboardData();
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="save-btn"
                    onClick={handleSaveProfile}
                    disabled={uploadingImage || uploadingResume}
                  >
                    {uploadingImage || uploadingResume ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="profile-content">
            {/* Left Column - Profile Info */}
            <div className="profile-info">
              <div className="profile-header">
                <div className="avatar-section">
                  <div className="avatar-container">
                    <div className="profile-avatar-container">
                      <img 
                        src={profileData.profileImage || '/default-avatar.png'} 
                        alt={profileData.name}
                        className="profile-avatar"
                        onError={(e) => {
                          e.target.src = '/default-avatar.png';
                          e.target.onerror = null;
                          console.log('Image failed to load, using default');
                        }}
                      />
                      {isEditing && (
                        <div className="avatar-upload-container">
                          <label className="avatar-upload-label">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden-input"
                              disabled={uploadingImage}
                            />
                            {uploadingImage ? '📤 Uploading...' : '📷 Change Photo'}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="user-name">
                    <h2>{profileData.name}</h2>
                    <div className="user-tags">
                      <span className="user-role">Student</span>
                      <span className="user-branch">{profileData.branch || 'Not specified'}</span>
                      <span className="user-year">Year {profileData.year || 'Not specified'}</span>
                    </div>
                    <div className="user-contact">
                      <span className="user-email">{profileData.email}</span>
                      {profileData.phone && <span className="user-phone">• {profileData.phone}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Form/Info */}
              <div className="info-fields">
                {isEditing ? (
                  <div className="edit-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          className="form-input"
                          disabled
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="+91 1234567890"
                        />
                      </div>
                      <div className="form-group">
                        <label>Branch</label>
                        <select
                          name="branch"
                          value={profileData.branch}
                          onChange={handleInputChange}
                          className="form-input"
                        >
                          <option value="">Select Branch</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Mechanical">Mechanical</option>
                          <option value="Civil">Civil</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Biotechnology">Biotechnology</option>
                          <option value="Commerce">Commerce</option>
                          <option value="Arts">Arts</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Year of Study</label>
                        <select
                          name="year"
                          value={profileData.year}
                          onChange={handleInputChange}
                          className="form-input"
                        >
                          <option value="">Select Year</option>
                          <option value="1">First Year</option>
                          <option value="2">Second Year</option>
                          <option value="3">Third Year</option>
                          <option value="4">Fourth Year</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Enrollment Number</label>
                        <input
                          type="text"
                          name="enrollmentNumber"
                          value={profileData.enrollmentNumber}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="B123456789"
                        />
                      </div>
                    </div>

                    {/* Resume Upload */}
                    <div className="form-group">
                      <label>Resume Upload</label>
                      <div className="resume-upload-form">
                        {profileData.resume ? (
                          <div className="resume-uploaded-form">
                            <div className="resume-info-form">
                              <span className="resume-name-form">Resume uploaded ✓</span>
                              <div className="resume-actions-form">
                                <button 
                                  type="button"
                                  className="view-resume-btn-form"
                                  onClick={viewResume}
                                >
                                  View Resume
                                </button>
                                <label className="resume-update-btn-form">
                                  <input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleResumeUpload}
                                    className="hidden-input"
                                    disabled={uploadingResume}
                                  />
                                  {uploadingResume ? 'Uploading...' : 'Update Resume'}
                                </label>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="resume-upload-form-section">
                            <p className="resume-upload-text">No resume uploaded yet</p>
                            <label className="upload-resume-btn-form">
                              <input 
                                type="file" 
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeUpload}
                                className="hidden-input"
                                disabled={uploadingResume}
                              />
                              {uploadingResume ? '📤 Uploading...' : '📄 Upload Resume (PDF/DOC)'}
                            </label>
                            <p className="resume-hint">Max file size: 5MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>About Me</label>
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        className="form-textarea"
                        placeholder="Tell startups about yourself, your interests, and career goals..."
                        rows="4"
                        maxLength="500"
                      />
                      <div className="char-count">{profileData.bio.length}/500</div>
                    </div>

                    <div className="form-group">
                      <label>Skills</label>
                      <div className="skills-edit">
                        <div className="skills-tags">
                          {profileData.skills.map((skill, index) => (
                            <div key={index} className="skill-tag">
                              {skill}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill)}
                                className="remove-skill"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="add-skill">
                          <input
                            type="text"
                            placeholder="Add a skill (press Enter)"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                handleAddSkill(e.target.value.trim());
                                e.target.value = '';
                              }
                            }}
                            className="skill-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="view-info">
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Email</span>
                        <span className="info-value">{profileData.email}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Phone</span>
                        <span className="info-value">
                          {profileData.phone || 'Not provided'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Branch</span>
                        <span className="info-value">{profileData.branch || 'Not specified'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Year</span>
                        <span className="info-value">Year {profileData.year || 'Not specified'}</span>
                      </div>
                      {profileData.enrollmentNumber && (
                        <div className="info-item">
                          <span className="info-label">Enrollment No.</span>
                          <span className="info-value">{profileData.enrollmentNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Resume Section */}
                    <div className="resume-view-section">
                      <h4>Resume</h4>
                      {profileData.resume ? (
                        <div className="resume-view">
                          <div className="resume-info-view">
                            <span className="resume-name-view">Resume Uploaded</span>
                            <div className="resume-actions-view">
                              <button 
                                className="view-resume-btn-view"
                                onClick={viewResume}
                              >
                                View Resume
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="no-resume-view">
                          <p>No resume uploaded yet</p>
                          <button 
                            className="upload-resume-btn-view"
                            onClick={() => setIsEditing(true)}
                          >
                            Upload Resume
                          </button>
                        </div>
                      )}
                    </div>

                    {profileData.bio && (
                      <div className="bio-display">
                        <h4>About Me</h4>
                        <p className="bio-text">{profileData.bio}</p>
                      </div>
                    )}

                    {profileData.skills.length > 0 && (
                      <div className="skills-display">
                        <h4>Skills</h4>
                        <div className="skills-tags">
                          {profileData.skills.map((skill, index) => (
                            <span key={index} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Notifications */}
            <div className="dashboard-sidebar">
              <div className="notifications-card">
                <div className="notifications-header">
                  <h3>Acceptance Notifications</h3>
                  <button 
                    className="view-all-notifications-btn"
                    onClick={() => setShowNotificationPanel(true)}
                  >
                    View All
                  </button>
                </div>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications-preview">
                      <span className="notification-icon">🎉</span>
                      <p>No acceptance notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 3).map(notification => (
                      <div 
                        key={notification._id} 
                        className="notification-preview"
                        onClick={() => markNotificationAsRead(notification._id)}
                      >
                        <div className="notification-preview-content">
                          <div className="notification-preview-title">
                            {notification.title}
                          </div>
                          <div className="notification-preview-message">
                            {notification.message.length > 50 
                              ? notification.message.substring(0, 50) + '...' 
                              : notification.message}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Applications Section */}
        <div className="recent-applications-section">
          <div className="section-header">
            <h3>Recent Applications</h3>
            <a href="/my-applications" className="view-all-link">View All →</a>
          </div>
          
          {recentApplications.length > 0 ? (
            <div className="applications-list">
              {recentApplications.map(app => (
                <div key={app.id} className="application-card">
                  <div className="application-header">
                    <div className="startup-info">
                      <div className="startup-icon">
                        <span className="startup-icon-text">🏢</span>
                      </div>
                      <div className="startup-details">
                        <div className="startup-name">{app.startupName}</div>
                        <div className="application-role">{app.role}</div>
                        <div className="application-status">
                          <span 
                            className="status-indicator" 
                            style={{backgroundColor: getStatusColor(app.status)}}
                          ></span>
                          <span className="status-text">{getStatusText(app.status)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {app.message && (
                    <div className="application-preview">
                      <p className="application-message-preview">
                        {app.message.length > 120 
                          ? app.message.substring(0, 120) + '...' 
                          : app.message}
                      </p>
                    </div>
                  )}
                  
                  <div className="application-footer">
                    <div className="application-meta">
                      <div className="application-date">
                        Applied: {app.appliedDate}
                      </div>
                    </div>
                    <div className="application-actions">
                      <button 
                        className="view-details-btn"
                        onClick={() => handleViewApplicationDetails(app)}
                      >
                        View Details
                      </button>
                      {app.status === 'pending' && (
                        <button 
                          className="withdraw-btn"
                          onClick={() => handleWithdrawApplication(app.id)}
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-applications">
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <h4>No Applications Yet</h4>
                <p>Start applying to startups to see your applications here.</p>
                <a href="/founders" className="browse-startups-btn">
                  Browse Startups
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Banasthali Startup Portal</h4>
              <p>Connect with startups and build your career</p>
            </div>
            <div className="footer-section">
              <h4>Need Help?</h4>
              <div className="footer-links">
                <a href="/help">Help Center</a>
                <a href="/contact">Contact Support</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Banasthali Vidyapith Startup Portal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;