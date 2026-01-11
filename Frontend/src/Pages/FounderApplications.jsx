import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Components/Header/Header.jsx';
import { API_BASE_URL } from '../constants.jsx';
import './FounderApplications.css';

const FounderApplications = () => {
  const { founderId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [applicationToAction, setApplicationToAction] = useState(null);
  const [applicantProfile, setApplicantProfile] = useState(null);
  const [showApplicantProfile, setShowApplicantProfile] = useState(false);

  // Load current user
  useEffect(() => {
    const loadUser = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    
    loadUser();
  }, []);

  // Load applications
  useEffect(() => {
    if (founderId) {
      loadApplications();
    }
  }, [founderId]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view applications');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/applications/founder/${founderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const formattedApplications = data.applications.map(app => ({
          ...app,
          applicantName: app.applicantName || app.studentId?.fullName || 'Anonymous',
          email: app.email || app.studentId?.email || '',
          phone: app.phone || app.studentId?.phone || '',
          skills: app.skills || app.studentId?.skills || [],
          experience: app.experience || '',
          portfolio: app.portfolio || '',
          resume: app.resume || app.studentId?.resume || '',
          // Ensure studentId is properly set
          studentId: app.studentId?._id || app.studentId
        }));
        setApplications(formattedApplications);
      } else {
        setError(data.message || 'Failed to load applications');
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if current user is the founder
  const isCurrentUserFounder = () => {
    if (!currentUser || !founderId) return false;
    return currentUser._id === founderId || currentUser.userId === founderId;
  };

  // Load applicant profile - FIXED
  const loadApplicantProfile = async (studentId) => {
    try {
      if (!studentId) {
        alert('No student ID found');
        return;
      }
      
      const token = localStorage.getItem('token');
      console.log('Loading profile for studentId:', studentId); // Debug
      
      const response = await fetch(`${API_BASE_URL}/users/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile data:', data); // Debug
        if (data.success && data.user) {
          setApplicantProfile(data.user);
          setShowApplicantProfile(true);
        } else {
          alert('Failed to load profile: ' + (data.message || 'Unknown error'));
        }
      } else {
        const errorText = await response.text();
        alert('Error loading profile: ' + errorText);
      }
    } catch (error) {
      console.error('Error loading applicant profile:', error);
      alert('Failed to load applicant profile: ' + error.message);
    }
  };

  // Prepare action for accept/reject
  const prepareAction = (application, action) => {
    setApplicationToAction(application);
    setSelectedAction(action);
    // Set default message
    const defaultMessage = action === 'accepted' 
      ? `Congratulations! Your application has been accepted at ${currentUser?.startupName || 'our startup'}. We will contact you soon with further details.`
      : `Thank you for your application to ${currentUser?.startupName || 'our startup'}. After careful consideration, we regret to inform you that we cannot proceed with your application at this time.`;
    
    setNotificationMessage(defaultMessage);
    setShowNotificationModal(true);
  };

  // Handle application status update with notification - UPDATED
  const handleUpdateStatus = async (applicationId, newStatus, customMessage = '', applicantEmail = '') => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          actionBy: currentUser._id,
          actionDate: new Date().toISOString(),
          customMessage: customMessage || notificationMessage
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update local state
        const updatedApplications = applications.map(app => {
          if (app._id === applicationId) {
            // When changing from accept/reject to pending (revert), clear previousStatus
            if (newStatus === 'pending' && (app.status === 'accepted' || app.status === 'rejected')) {
              return { 
                ...app, 
                status: newStatus,
                previousStatus: null // Clear previous status when reverting
              };
            }
            // When accepting/rejecting, set previousStatus to current status
            return { 
              ...app, 
              status: newStatus,
              previousStatus: app.status === 'pending' ? 'pending' : app.previousStatus
            };
          }
          return app;
        });
        
        setApplications(updatedApplications);
        
        // Update selected application in modal
        if (selectedApplication && selectedApplication._id === applicationId) {
          setSelectedApplication({
            ...selectedApplication,
            status: newStatus,
            previousStatus: selectedApplication.status === 'pending' ? 'pending' : selectedApplication.previousStatus
          });
        }

        // Show success message
        if (newStatus === 'accepted') {
          alert(`✅ Application accepted! Email has been sent to the applicant.`);
        } else if (newStatus === 'rejected') {
          alert(`📫 Application rejected. Notification has been sent to the applicant.`);
        } else {
          alert(`✅ Application status updated to ${newStatus}`);
        }

        // Close modals
        setShowNotificationModal(false);
        setNotificationMessage('');
        return true;
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
    }
    return false;
  };

  // Handle withdraw application
  const handleWithdrawApplication = async (applicationId, currentStatus) => {
    const confirmWithdraw = window.confirm(
      `Are you sure you want to withdraw this application? This will change the status from ${currentStatus} to 'withdrawn'.`
    );
    
    if (!confirmWithdraw) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'withdrawn',
          actionBy: currentUser._id,
          actionDate: new Date().toISOString(),
          previousStatus: currentStatus
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update local state
        setApplications(applications.map(app => 
          app._id === applicationId ? { 
            ...app, 
            status: 'withdrawn',
            previousStatus: currentStatus
          } : app
        ));
        
        if (selectedApplication && selectedApplication._id === applicationId) {
          setSelectedApplication({ 
            ...selectedApplication, 
            status: 'withdrawn',
            previousStatus: currentStatus
          });
        }

        alert('Application withdrawn successfully!');
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
      alert('Failed to withdraw application');
    }
  };

  // Revert to pending status - UPDATED
  const handleRevertStatus = async (applicationId, currentStatus, previousStatus) => {
    const confirmRevert = window.confirm(
      `Are you sure you want to revert this application from ${currentStatus} to pending? This will allow you to accept or reject it again.`
    );
    
    if (!confirmRevert) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'pending',
          actionBy: currentUser._id,
          actionDate: new Date().toISOString(),
          customMessage: `Your application status for ${currentUser.startupName} has been reverted to pending for reconsideration.`
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update local state - revert to pending and clear previousStatus
        setApplications(applications.map(app => 
          app._id === applicationId ? { 
            ...app, 
            status: 'pending',
            previousStatus: null
          } : app
        ));
        
        if (selectedApplication && selectedApplication._id === applicationId) {
          setSelectedApplication({ 
            ...selectedApplication, 
            status: 'pending',
            previousStatus: null
          });
        }

        alert(`✅ Status reverted from ${currentStatus} to pending! Applicant has been notified.`);
      }
    } catch (error) {
      console.error('Error reverting status:', error);
      alert('Failed to revert status');
    }
  };

  // View application details
  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  // Filter applications by status
  const getFilteredApplications = () => {
    if (statusFilter === 'all') {
      return applications;
    }
    return applications.filter(app => app.status === statusFilter);
  };

  // Get status count
  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
      all: applications.length
    };
    
    applications.forEach(app => {
      if (app.status && counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="founder-applications-container">
        <Header />
        <div className="founder-applications loading">
          <div className="spinner"></div>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  // Check if user is authorized to view applications
  if (!isCurrentUserFounder()) {
    return (
      <div className="founder-applications-container">
        <Header />
        <div className="founder-applications unauthorized">
          <h2>Access Denied</h2>
          <p>You are not authorized to view these applications.</p>
          <button onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="founder-applications-container">
      <Header />
      <div className="founder-applications">
        {/* Header */}
        <div className="applications-header">
          <h1>📋 Manage Applications</h1>
          <p>Review and manage applications for your startup</p>
          
          <div className="stats-overview">
            <div className="stat-card">
              <span className="stat-number">{statusCounts.all}</span>
              <span className="stat-label">Total Applications</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{statusCounts.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{statusCounts.reviewed}</span>
              <span className="stat-label">Reviewed</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{statusCounts.accepted}</span>
              <span className="stat-label">Accepted</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{statusCounts.rejected}</span>
              <span className="stat-label">Rejected</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{statusCounts.withdrawn}</span>
              <span className="stat-label">Withdrawn</span>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All ({statusCounts.all})
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              Pending ({statusCounts.pending})
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'reviewed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('reviewed')}
            >
              Reviewed ({statusCounts.reviewed})
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'accepted' ? 'active' : ''}`}
              onClick={() => setStatusFilter('accepted')}
            >
              Accepted ({statusCounts.accepted})
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setStatusFilter('rejected')}
            >
              Rejected ({statusCounts.rejected})
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'withdrawn' ? 'active' : ''}`}
              onClick={() => setStatusFilter('withdrawn')}
            >
              Withdrawn ({statusCounts.withdrawn})
            </button>
          </div>
          
          <button className="refresh-btn" onClick={loadApplications}>
            🔄 Refresh
          </button>
        </div>

        {/* Applications List */}
        <div className="applications-list">
          {error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={loadApplications}>Try Again</button>
            </div>
          ) : getFilteredApplications().length === 0 ? (
            <div className="no-applications">
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <h3>No applications yet</h3>
                <p>Applications from users will appear here when they apply for your open positions.</p>
                <button onClick={() => navigate(-1)}>Back to Profile</button>
              </div>
            </div>
          ) : (
            <div className="applications-table">
              <table>
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Position</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredApplications().map(app => (
                    <tr key={app._id} className={`application-row status-${app.status}`}>
                      <td>
                        <div className="applicant-info">
                          <div className="applicant-avatar">
                            {app.applicantName ? app.applicantName.charAt(0) : 'A'}
                          </div>
                          <div className="applicant-details">
                            <strong>{app.applicantName || 'Anonymous'}</strong>
                            <small>{app.email}</small>
                            <small>{app.applicantType || 'Student'}</small>
                          </div>
                        </div>
                      </td>
                      <td>{app.role}</td>
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${app.status || 'pending'}`}>
                          {app.status || 'pending'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="view-btn"
                            onClick={() => handleViewApplication(app)}
                          >
                            View Details
                          </button>
                          
                          {/* Show Accept/Reject only for pending applications */}
                          {app.status === 'pending' && (
                            <>
                              <button 
                                className="accept-btn"
                                onClick={() => prepareAction(app, 'accepted')}
                              >
                                Accept
                              </button>
                              <button 
                                className="reject-btn"
                                onClick={() => prepareAction(app, 'rejected')}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          
                          {/* Show Revert button for accepted/rejected applications */}
                          {(app.status === 'accepted' || app.status === 'rejected') && (
                            <button 
                              className="revert-btn"
                              onClick={() => handleRevertStatus(app._id, app.status, app.previousStatus)}
                            >
                              Revert to Pending
                            </button>
                          )}
                          
                          {/* Show Withdraw button for non-withdrawn applications */}
                          {app.status !== 'withdrawn' && app.status !== 'pending' && (
                            <button 
                              className="withdraw-btn"
                              onClick={() => handleWithdrawApplication(app._id, app.status)}
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Application Details Modal */}
        {showApplicationModal && selectedApplication && (
          <div className="modal-overlay">
            <div className="modal-content application-details-modal">
              <div className="modal-header">
                <h2>Application Details</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowApplicationModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="application-details">
                <div className="detail-section">
                  <h3>Applicant Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{selectedApplication.applicantName || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{selectedApplication.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{selectedApplication.phone || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">User Type:</span>
                      <span className="detail-value">{selectedApplication.applicantType || 'Student'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Applied for:</span>
                      <span className="detail-value">{selectedApplication.role}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Applied on:</span>
                      <span className="detail-value">
                        {new Date(selectedApplication.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className={`status-badge ${selectedApplication.status || 'pending'}`}>
                        {selectedApplication.status || 'pending'}
                      </span>
                    </div>
                  </div>
                  
                  {/* View Profile Button - FIXED */}
                  {selectedApplication.studentId && (
                    <div className="view-profile-section">
                      <button 
                        className="view-profile-btn"
                        onClick={() => {
                          console.log('Student ID to load:', selectedApplication.studentId); // Debug
                          loadApplicantProfile(selectedApplication.studentId);
                        }}
                      >
                        👤 View Applicant's Profile
                      </button>
                    </div>
                  )}
                </div>

                <div className="detail-section">
                  <h3>Application Message</h3>
                  <div className="message-box">
                    <p>{selectedApplication.message || 'No message provided'}</p>
                  </div>
                </div>

                {selectedApplication.experience && (
                  <div className="detail-section">
                    <h3>Experience & Background</h3>
                    <div className="message-box">
                      <p>{selectedApplication.experience}</p>
                    </div>
                  </div>
                )}

                {selectedApplication.skills && selectedApplication.skills.length > 0 && (
                  <div className="detail-section">
                    <h3>Skills</h3>
                    <div className="skills-tags">
                      {Array.isArray(selectedApplication.skills) 
                        ? selectedApplication.skills.map((skill, index) => (
                            <span key={index} className="skill-tag">
                              {skill}
                            </span>
                          ))
                        : selectedApplication.skills.split(',').map((skill, index) => (
                            <span key={index} className="skill-tag">
                              {skill.trim()}
                            </span>
                          ))
                      }
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h3>Attachments & Links</h3>
                  <div className="attachments">
                    {selectedApplication.resume && (
                      <a 
                        href={selectedApplication.resume} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="attachment-link"
                      >
                        📄 View Resume
                      </a>
                    )}
                    {selectedApplication.portfolio && (
                      <a 
                        href={selectedApplication.portfolio} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="attachment-link"
                      >
                        🌐 View Portfolio
                      </a>
                    )}
                    {!selectedApplication.resume && !selectedApplication.portfolio && (
                      <p className="no-attachments">No attachments provided</p>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Decision Actions</h3>
                  <div className="decision-actions">
                    {/* Show Accept/Reject only for pending applications */}
                    {selectedApplication.status === 'pending' && (
                      <>
                        <button 
                          className="action-btn accept-btn"
                          onClick={() => prepareAction(selectedApplication, 'accepted')}
                        >
                          Accept Application
                        </button>
                        <button 
                          className="action-btn reject-btn"
                          onClick={() => prepareAction(selectedApplication, 'rejected')}
                        >
                          Reject Application
                        </button>
                      </>
                    )}
                    
                    {/* Show Revert button for accepted/rejected applications */}
                    {(selectedApplication.status === 'accepted' || selectedApplication.status === 'rejected') && (
                      <button 
                        className="action-btn revert-btn"
                        onClick={() => handleRevertStatus(selectedApplication._id, selectedApplication.status, selectedApplication.previousStatus)}
                      >
                        Revert to Pending
                      </button>
                    )}
                    
                    {/* Show Withdraw button for non-withdrawn, non-pending applications */}
                    {selectedApplication.status !== 'withdrawn' && selectedApplication.status !== 'pending' && (
                      <button 
                        className="action-btn withdraw-btn"
                        onClick={() => handleWithdrawApplication(selectedApplication._id, selectedApplication.status)}
                      >
                        Withdraw Application
                      </button>
                    )}
                    
                    {/* Mark as Reviewed button */}
                    {selectedApplication.status === 'pending' && (
                      <button 
                        className="action-btn reviewed-btn"
                        onClick={() => handleUpdateStatus(selectedApplication._id, 'reviewed', '', selectedApplication.email)}
                      >
                        Mark as Reviewed
                      </button>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    className="close-modal-btn"
                    onClick={() => setShowApplicationModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Applicant Profile Modal */}
        {showApplicantProfile && applicantProfile && (
          <div className="modal-overlay">
            <div className="modal-content applicant-profile-modal">
              <div className="modal-header">
                <h2>Applicant Profile</h2>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowApplicantProfile(false);
                    setApplicantProfile(null);
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="applicant-profile-details">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {applicantProfile.profileImage ? (
                      <img src={applicantProfile.profileImage} alt={applicantProfile.fullName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {applicantProfile.fullName?.charAt(0) || 'A'}
                      </div>
                    )}
                  </div>
                  <div className="profile-info">
                    <h3>{applicantProfile.fullName || 'Unknown User'}</h3>
                    <p className="profile-email">{applicantProfile.email}</p>
                    <p className="profile-type">{applicantProfile.userType === 'student' ? 'Student' : 'Founder'}</p>
                  </div>
                </div>

                <div className="profile-section">
                  <h4>Contact Information</h4>
                  <div className="detail-grid">
                    {applicantProfile.phone && (
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{applicantProfile.phone}</span>
                      </div>
                    )}
                    {applicantProfile.branch && (
                      <div className="detail-item">
                        <span className="detail-label">Branch:</span>
                        <span className="detail-value">{applicantProfile.branch}</span>
                      </div>
                    )}
                    {applicantProfile.year && (
                      <div className="detail-item">
                        <span className="detail-label">Year:</span>
                        <span className="detail-value">Year {applicantProfile.year}</span>
                      </div>
                    )}
                    {applicantProfile.location && (
                      <div className="detail-item">
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">{applicantProfile.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {applicantProfile.bio && (
                  <div className="profile-section">
                    <h4>About</h4>
                    <p className="bio-text">{applicantProfile.bio}</p>
                  </div>
                )}

                {applicantProfile.skills && applicantProfile.skills.length > 0 && (
                  <div className="profile-section">
                    <h4>Skills</h4>
                    <div className="skills-tags">
                      {applicantProfile.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {applicantProfile.resume && (
                  <div className="profile-section">
                    <h4>Resume</h4>
                    <a 
                      href={applicantProfile.resume} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="resume-link"
                    >
                      📄 View Applicant's Resume
                    </a>
                  </div>
                )}

                <div className="modal-actions">
                  <button 
                    className="close-profile-btn"
                    onClick={() => {
                      setShowApplicantProfile(false);
                      setApplicantProfile(null);
                    }}
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Modal for Accept/Reject */}
        {showNotificationModal && applicationToAction && (
          <div className="modal-overlay">
            <div className="modal-content notification-modal">
              <div className="modal-header">
                <h2>{selectedAction === 'accepted' ? '🎉 Accept Application' : '😔 Reject Application'}</h2>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowNotificationModal(false);
                    setNotificationMessage('');
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="notification-form">
                <div className="form-group">
                  <label>Notification Message to Applicant:</label>
                  <textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    className="notification-textarea"
                    placeholder="Customize the message that will be sent to the applicant..."
                    rows="6"
                  />
                  <small className="hint">
                    This message will be sent to the applicant via email.
                  </small>
                </div>

                <div className="applicant-preview">
                  <h4>Applicant: {applicationToAction.applicantName || 'Anonymous'}</h4>
                  <p><strong>Role:</strong> {applicationToAction.role}</p>
                  <p><strong>Email:</strong> {applicationToAction.email}</p>
                  <p><strong>Current Status:</strong> <span className={`status-badge ${applicationToAction.status}`}>{applicationToAction.status}</span></p>
                </div>

                <div className="notification-actions">
                  <button 
                    className="confirm-btn"
                    onClick={() => {
                      handleUpdateStatus(
                        applicationToAction._id, 
                        selectedAction, 
                        notificationMessage,
                        applicationToAction.email
                      );
                    }}
                  >
                    {selectedAction === 'accepted' ? 'Accept & Send Email Notification' : 'Reject & Send Email Notification'}
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setShowNotificationModal(false);
                      setNotificationMessage('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FounderApplications;