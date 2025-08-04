
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Button } from '@/components/ui/button';
import { Users, BarChart3, Settings, Home, LogOut, Mail, DollarSign, FileText } from 'lucide-react';
import AppBreadcrumbs from '@/components/navigation/AppBreadcrumbs';

const AdminLayout = () => {
  const { signOut } = useAuth();

  const navItems = [
    { to: '/admin', icon: BarChart3, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/projects', icon: Settings, label: 'Projects' },
    { to: '/admin/blog', icon: FileText, label: 'Blog' },
    { to: '/admin/ai-costs', icon: DollarSign, label: 'AI Costs' },
    { to: '/admin/waitlist', icon: Mail, label: 'API Waitlist' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <nav className="mt-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
                    isActive ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : ''
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="absolute bottom-0 w-64 p-6 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start mb-2"
              onClick={() => window.location.href = '/dashboard'}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to App
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <AppBreadcrumbs />
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
