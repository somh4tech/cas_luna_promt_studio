
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ReviewerGuard from './ReviewerGuard';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, initialized } = useAuth();

  console.log('ProtectedRoute: user =', user?.email || 'null', 'loading =', loading, 'initialized =', initialized);

  // Show loading while auth is initializing
  if (!initialized || loading) {
    console.log('ProtectedRoute: Still initializing auth state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect to landing page if no user after initialization
  if (!user) {
    console.log('ProtectedRoute: No user found after initialization, redirecting to landing page');
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute: User authenticated, rendering protected content');
  return (
    <ReviewerGuard>
      {children}
    </ReviewerGuard>
  );
};

export default ProtectedRoute;
