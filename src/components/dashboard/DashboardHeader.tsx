
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings } from 'lucide-react';

const DashboardHeader = () => {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/72b4715a-9e0a-45a6-9593-90b2719057bb.png" 
              alt="Cascade Prompt Studio" 
              className="h-8 w-auto cursor-pointer"
              onClick={() => window.location.href = '/dashboard'}
            />
            <span className="text-xl font-bold text-gray-900">Cascade Prompt Studio</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
              Beta
            </Badge>
            <div className="ml-2">
              <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => window.location.href = '/admin'}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Admin Panel
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
