import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AdminDashboard from '../components/admin/Dashboard';
import UserDashboard from '../components/user/Dashboard';
import Login from '../components/auth/Login';
import AdminLogin from '../components/auth/AdminLogin';
import AdminSignup from '../components/auth/AdminSignup';
import UserSignup from '../components/auth/UserSignup';

export default function AppRoutes() {
  const { user, isAdmin, initialized } = useAuthStore();

  // Don't render routes until auth is initialized
  if (!initialized) {
    return null;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/admin-login" 
        element={!user ? <AdminLogin /> : <Navigate to="/" />} 
      />
      <Route 
        path="/admin-signup" 
        element={!user ? <AdminSignup /> : <Navigate to="/" />} 
      />
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to="/" />} 
      />
      <Route 
        path="/signup" 
        element={!user ? <UserSignup /> : <Navigate to="/" />} 
      />
      
      {/* Protected routes */}
      <Route
        path="/"
        element={
          user ? (
            isAdmin ? <AdminDashboard /> : <UserDashboard />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}