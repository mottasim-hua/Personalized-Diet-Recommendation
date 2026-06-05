import { motion } from 'framer-motion';
import {
  BarChart3,
  ClipboardList,
  HeartPulse,
  Home,
  UserCog,
  Users,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

/**
 * Sidebar navigation component.
 */
export default function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  const menuItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/users', label: 'Manage Users', icon: Users },
    { path: '/dietitians', label: 'Manage Dietitians', icon: UserCog },
    { path: '/plans', label: 'Manage Plans', icon: ClipboardList },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm lg:hidden"
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-40 flex w-80 flex-col border-r border-white/10 bg-[linear-gradient(180deg,#0f172a_0%,#10271d_58%,#0f3d2e_100%)] px-5 py-5 text-white shadow-2xl shadow-slate-950/30 lg:sticky lg:translate-x-0"
      >
        <div className="mb-8 flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-lg shadow-black/10">
            <HeartPulse size={24} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">Diet System</h1>
            <p className="text-xs uppercase tracking-[0.26em] text-emerald-100/80">
              Admin Dashboard
            </p>
          </div>
        </div>

        <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/60">
          Workspace
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <motion.div
                key={item.path}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <Link
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      toggleSidebar();
                    }
                  }}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 font-medium transition-all ${
                    active
                      ? 'bg-white text-slate-900 shadow-xl shadow-black/10'
                      : 'text-emerald-50/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      active
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-white/10 text-emerald-100 group-hover:bg-white/15'
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="text-sm">{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-primary-500"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <p className="text-sm font-semibold">Platform health</p>
          <p className="mt-1 text-sm text-emerald-50/75">
            99.2% uptime this month with strong member retention.
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-emerald-300 to-primary-500" />
          </div>
          <p className="mt-3 text-xs text-emerald-100/70">Updated 5 minutes ago</p>
        </div>
      </motion.aside>
    </>
  );
}
