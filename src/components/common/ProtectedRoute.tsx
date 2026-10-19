import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../context/useAuth';
import { UserRole } from '../../types';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="যাচাই করা হচ্ছে..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    const isGoingToAdmin = location.pathname.startsWith('/admin');
    const targetLogin = isGoingToAdmin ? '/admin/login' : '/login';
    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : null;
};

export default ProtectedRoute;
