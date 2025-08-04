
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ReviewerGuard from './ReviewerGuard';

interface SimpleProtectedRouteProps {
  children: React.ReactNode;
}

const SimpleProtectedRoute = ({ children }: SimpleProtectedRouteProps) => {
  const { user, loading, initialized } = useAuth();

  console.log('SimpleProtectedRoute: user =', user?.email || 'null', 'loading =', loading, 'initialized =', initialized);

  // Show loading while auth is initializing
  if (!initialized || loading) {
    console.log('SimpleProtectedRoute: Still initializing auth state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect to landing page if no user after initialization
  if (!user) {
    console.log('SimpleProtectedRoute: No user found after initialization, redirecting to landing page');
    return <Navigate to="/" replace />;
  }

  console.log('SimpleProtectedRoute: User authenticated, rendering protected content');
  return (
    <ReviewerGuard>
      {children}
    </ReviewerGuard>
  );
};

export default SimpleProtectedRoute;
