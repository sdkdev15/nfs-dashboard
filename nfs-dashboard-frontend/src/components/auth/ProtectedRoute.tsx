import React from 'react';
import { Navigate } from 'react-router-dom';
import { User } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  user: User | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false, user }) => {
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.role.name !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;