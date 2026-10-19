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

  const isGoingToAdmin = location.pathname.startsWith('/admin');

  if (!isAuthenticated || !user) {
    const targetLogin = isGoingToAdmin ? '/admin/login' : '/login';
    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  // Strict Admin Isolation Guard: Customers must NEVER access /admin routes
  if (isGoingToAdmin) {
    const isAdminOrMod =
      user.role === UserRole.ADMIN ||
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.MODERATOR;

    if (!isAdminOrMod) {
      return <Navigate to="/" replace />;
    }
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : null;
};

export default ProtectedRoute;
