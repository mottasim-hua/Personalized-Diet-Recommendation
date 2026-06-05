/**
 * Mock data for dashboard presentation and graceful fallbacks.
 */

export const mockRecentActivities = [
  {
    id: 1,
    type: 'user',
    action: 'New premium member joined the system',
    user: 'John Doe',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 2,
    type: 'plan',
    action: 'Weight management plan was assigned',
    details: '28-day calorie-balanced journey',
    timestamp: new Date(Date.now() - 1000 * 60 * 18),
  },
  {
    id: 3,
    type: 'dietitian',
    action: 'Dietitian consultation completed',
    user: 'Dr. Sarah Smith',
    timestamp: new Date(Date.now() - 1000 * 60 * 48),
  },
  {
    id: 4,
    type: 'report',
    action: 'Monthly performance report generated',
    details: 'Revenue and retention snapshot',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
  },
];

export const mockChartData = [
  { month: 'Jan', users: 320, revenue: 7200, subscriptions: 180, reports: 42 },
  { month: 'Feb', users: 380, revenue: 8600, subscriptions: 210, reports: 51 },
  { month: 'Mar', users: 440, revenue: 9400, subscriptions: 236, reports: 58 },
  { month: 'Apr', users: 510, revenue: 10600, subscriptions: 265, reports: 63 },
  { month: 'May', users: 590, revenue: 11800, subscriptions: 302, reports: 69 },
  { month: 'Jun', users: 680, revenue: 12950, subscriptions: 340, reports: 78 },
  { month: 'Jul', users: 760, revenue: 14200, subscriptions: 378, reports: 86 },
];

export const mockWeeklyReportData = [
  { label: 'Mon', users: 28, revenue: 920, subscriptions: 18 },
  { label: 'Tue', users: 34, revenue: 1020, subscriptions: 22 },
  { label: 'Wed', users: 39, revenue: 1110, subscriptions: 24 },
  { label: 'Thu', users: 42, revenue: 1240, subscriptions: 27 },
  { label: 'Fri', users: 46, revenue: 1380, subscriptions: 31 },
  { label: 'Sat', users: 38, revenue: 1150, subscriptions: 25 },
  { label: 'Sun', users: 31, revenue: 970, subscriptions: 19 },
];

export const mockPlanCategories = [
  {
    id: 1,
    name: 'Weight Loss',
    key: 'weight-loss',
    description: 'Structured calorie deficit with behavior coaching.',
    count: 24,
    color: 'from-rose-400 to-orange-400',
  },
  {
    id: 2,
    name: 'Muscle Gain',
    key: 'muscle-gain',
    description: 'Protein-rich plans for active members.',
    count: 18,
    color: 'from-sky-400 to-cyan-400',
  },
  {
    id: 3,
    name: 'Maintenance',
    key: 'maintenance',
    description: 'Balanced long-term nutrition and habit support.',
    count: 32,
    color: 'from-emerald-400 to-teal-400',
  },
  {
    id: 4,
    name: 'Therapeutic',
    key: 'therapeutic',
    description: 'Condition-aware meal planning with expert oversight.',
    count: 15,
    color: 'from-violet-400 to-fuchsia-400',
  },
];
