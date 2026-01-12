import './index.css';  // Import first
import './App.css';  // Import second
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Pages/AuthContext'; // Corrected path
import Home from './Pages/Home/Home.jsx';
import LoginPage from './Pages/LoginPage';
import SignupPage from './Pages/SignupPage';
import DashboardPage from './Pages/DashboardPage';
import './Pages/AuthPages.css'; // If you need global auth styles
import Events from './Pages/Events/Events.jsx';
import SuccessStories from './Pages/SuccessStories/SuccessStories';
import About from "./Pages/About/About.jsx";
import FounderProfile from './Pages/FounderProfile.jsx';
import FounderSetupMultiStep from './Pages/FounderSetupMultiStep.jsx';
import FoundersDirectory from './Pages/FoundersDirectory.jsx';
import FounderApplications from './Pages/FounderApplications';


// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false, requireFounder = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && user.type !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  if (requireFounder && user.type !== 'founder') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/about" element={<About />} />
           <Route path="/success" element={<SuccessStories />} />
          <Route 
  path="/founder/applications/:founderId" 
  element={
    <ProtectedRoute requireFounder>
      <FounderApplications />
    </ProtectedRoute>
  } 
/>
          
          {/* New founder routes */}
          <Route path="/founder/setup/:founderId?" element={<FounderSetupMultiStep />} />
          <Route path="/founder/:founderId" element={<FounderProfile />} />
          <Route path="/founders" element={<FoundersDirectory />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin>
                <h1>Admin Dashboard - Coming Soon</h1>
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;