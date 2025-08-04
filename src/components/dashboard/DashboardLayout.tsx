
import { ReactNode } from 'react';
import DashboardHeader from './DashboardHeader';
import AppBreadcrumbs from '@/components/navigation/AppBreadcrumbs';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />
      <AppBreadcrumbs />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
