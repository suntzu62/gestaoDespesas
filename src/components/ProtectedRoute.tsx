import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/access-denied' 
}: ProtectedRouteProps) {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute: checking access', {
    loading,
    user: user ? { id: user.id, email: user.email, role: user.role } : null,
    allowedRoles,
    currentPath: location.pathname
  });

  if (loading) {
    console.log('⏳ ProtectedRoute: still loading, showing spinner');
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ ProtectedRoute: no user found, redirecting to signin');
    // Redirect to sign in page with return url
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && !hasRole(allowedRoles)) {
    console.log('🚫 ProtectedRoute: user role check failed', {
      userRole: user.role,
      allowedRoles,
      hasRoleResult: hasRole(allowedRoles)
    });
    return <Navigate to={redirectTo} replace />;
  }

  console.log('✅ ProtectedRoute: access granted, rendering children');
  return <>{children}</>;
}