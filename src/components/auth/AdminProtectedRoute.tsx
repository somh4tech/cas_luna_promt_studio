
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { user, isAdmin, loading, initialized, roleLoading, userRole } = useAuth();

  console.log('AdminProtectedRoute: Detailed state check:', {
    userEmail: user?.email || 'null',
    isAdmin,
    userRole,
    loading,
    roleLoading,
    initialized,
    userId: user?.id || 'null'
  });

  // Show loading while auth is initializing OR while role is being fetched
  if (!initialized || loading || roleLoading) {
    console.log('AdminProtectedRoute: Still initializing auth state or loading role');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect to landing page if no user
  if (!user) {
    console.log('AdminProtectedRoute: No user found, redirecting to landing page');
    return <Navigate to="/" replace />;
  }

  // Redirect to dashboard if not admin (only after role is fully loaded)
  if (!isAdmin) {
    console.log('AdminProtectedRoute: User is not admin, redirecting to dashboard. User role:', userRole);
    return <Navigate to="/dashboard" replace />;
  }

  console.log('AdminProtectedRoute: Admin access granted for user:', user.email);
  return <>{children}</>;
};

export default AdminProtectedRoute;
