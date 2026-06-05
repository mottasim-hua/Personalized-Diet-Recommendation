import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { getInitials } from '../utils/helpers';

/**
 * Top navbar component.
 */
export default function Navbar() {
  const { isDark, toggleDarkMode, toggleSidebar, user } = useAppStore();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const titles = {
    '/dashboard': 'Home',
    '/users': 'Manage Users',
    '/dietitians': 'Manage Dietitians',
    '/plans': 'Manage Plans',
    '/reports': 'Reports',
  };

  const currentTitle = titles[location.pathname] || 'Dashboard';

  const notifications = [
    { id: 1, message: 'New user registration', time: '5 min ago', read: false },
    {
      id: 2,
      message: 'System backup completed',
      time: '1 hour ago',
      read: true,
    },
    {
      id: 3,
      message: 'New dietitian pending approval',
      time: '2 hours ago',
      read: false,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="sticky top-0 z-20 border-b border-white/60 bg-slate-100/80 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:border-primary-300 hover:text-primary-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-primary-700 dark:hover:text-primary-300 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400 dark:text-slate-500">
              Diet System Admin
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {currentTitle}
            </h2>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search people, plans, reports"
              className="field-input pl-11"
            />
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 hover:border-primary-300 hover:text-primary-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-primary-700 dark:hover:text-primary-300"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 hover:border-primary-300 hover:text-primary-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-primary-700 dark:hover:text-primary-300"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-rose-500" />
                )}
              </motion.button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-3 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`cursor-pointer border-b border-slate-100 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 ${
                            !notif.read ? 'bg-primary-50/80 dark:bg-primary-950/20' : ''
                          }`}
                        >
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {notif.message}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {notif.time}
                          </p>
                        </div>
                      ))}
                    </div>

                    <button className="w-full border-t border-slate-100 p-3 text-center text-sm font-medium text-primary-600 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60">
                      View all notifications
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 hover:border-primary-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-primary-700"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-600 text-xs font-bold text-white shadow-lg shadow-primary-500/20">
                  {getInitials(user?.name || 'Admin')}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Super Admin</p>
                </div>
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="border-b border-slate-100 p-4 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {user?.name || 'Admin User'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user?.email || 'admin@diet.com'}
                      </p>
                    </div>

                    <button className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60">
                      <User size={16} />
                      <span>Profile Settings</span>
                    </button>

                    <button className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60">
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>

                    <button className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-3 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:border-slate-800 dark:text-rose-300 dark:hover:bg-rose-950/30">
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
