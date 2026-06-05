import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAppStore } from '../store/appStore';

/**
 * Main dashboard layout
 */
export default function DashboardLayout() {
  const { setUser } = useAppStore();

  useEffect(() => {
    // Set mock user data (replace with actual auth data)
    setUser({
      name: 'Admin User',
      email: 'admin@diet.com',
      role: 'admin',
    });
  }, [setUser]);

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-primary-200/40 blur-3xl dark:bg-primary-900/30" />
          <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-900/20" />
        </div>
        <Navbar />
        <main className="relative flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
