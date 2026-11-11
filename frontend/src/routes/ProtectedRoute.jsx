import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';

export function ProtectedRoute({ children, allowedRole }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect to the role's appropriate home
    const defaultRoute = user.role === ROLES.DMO ? '/dmo/overview' : '/hospital/entry';
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
}

