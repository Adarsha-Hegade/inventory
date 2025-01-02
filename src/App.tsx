import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AdminDashboard from './components/admin/Dashboard';
import UserDashboard from './components/user/Dashboard';
import Login from './components/auth/Login';
import AdminLogin from './components/auth/AdminLogin';
import AdminSignup from './components/auth/AdminSignup';
import UserSignup from './components/auth/UserSignup';

function App() {
  const { user, isAdmin, loading, initialized } = useAuthStore();

  // Show loading spinner only during initial load
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/admin-login" element={!user ? <AdminLogin /> : <Navigate to="/" />} />
        <Route path="/admin-signup" element={!user ? <AdminSignup /> : <Navigate to="/" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <UserSignup /> : <Navigate to="/" />} />
        
        {/* Protected routes */}
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : isAdmin ? (
              <AdminDashboard />
            ) : (
              <UserDashboard />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;