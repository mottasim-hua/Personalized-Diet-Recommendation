import React, { useState, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Home, Users, Stethoscope, BookOpen, BarChart3, LogOut,
  Plus, Search, Eye, Edit2, Trash2, X, Check, AlertCircle
} from 'lucide-react';

// CSS Styles
const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #0f1117; color: #e1e8ed; }
  .app { display: flex; height: 100vh; background: #0f1117; }
  .sidebar { width: 280px; background: linear-gradient(135deg, #1a1d2e 0%, #16192b 100%); border-right: 1px solid #2d3139; display: flex; flex-direction: column; padding: 20px; overflow-y: auto; }
  .logo { font-size: 20px; font-weight: 700; color: #22c55e; margin-bottom: 30px; }
  .admin-profile { display: flex; align-items: center; gap: 12px; padding: 15px; background: rgba(168, 85, 247, 0.1); border-radius: 12px; margin-bottom: 30px; border: 1px solid rgba(168, 85, 247, 0.2); }
  .admin-avatar { width: 45px; height: 45px; border-radius: 50%; background: linear-gradient(135deg, #a855f7, #ec4899); display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; }
  .nav-menu { flex: 1; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 15px; margin-bottom: 8px; border-radius: 8px; cursor: pointer; transition: all 0.3s; border-left: 3px solid transparent; color: #8b92a1; font-size: 14px; }
  .nav-item:hover { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
  .nav-item.active { background: rgba(34, 197, 94, 0.15); color: #22c55e; border-left-color: #22c55e; }
  .logout-btn { display: flex; align-items: center; gap: 12px; padding: 12px 15px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; }
  .content { flex: 1; overflow-y: auto; padding: 30px; background: #0f1117; }
  .page-title { font-size: 32px; font-weight: 700; color: #e1e8ed; margin-bottom: 10px; }
  .page-subtitle { color: #8b92a1; font-size: 14px; }
  .hero-banner { height: 200px; background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1)), url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200'); background-size: cover; border-radius: 16px; margin: 30px 0; display: flex; align-items: flex-end; padding: 30px; position: relative; border: 1px solid rgba(34, 197, 94, 0.2); }
  .hero-banner::before { content: ''; position: absolute; inset: 0; background: rgba(15, 17, 23, 0.6); border-radius: 16px; }
  .hero-content { position: relative; z-index: 1; }
  .hero-content h2 { font-size: 28px; font-weight: 700; color: #22c55e; }
  .hero-content p { color: #8b92a1; font-size: 14px; margin-top: 5px; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
  .stat-card { background: rgba(26, 29, 46, 0.8); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 24px; transition: all 0.3s; }
  .stat-card:hover { border-color: rgba(34, 197, 94, 0.3); }
  .stat-value { font-size: 32px; font-weight: 700; color: #e1e8ed; margin: 15px 0 8px 0; }
  .stat-label { font-size: 14px; color: #8b92a1; margin-bottom: 8px; }
  .stat-change { font-size: 13px; color: #22c55e; }
  .search-bar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(26, 29, 46, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; margin: 20px 0; }
  .search-bar input { flex: 1; background: transparent; border: none; color: #e1e8ed; font-size: 14px; outline: none; }
  .search-bar input::placeholder { color: #8b92a1; }
  .table-container { background: rgba(26, 29, 46, 0.8); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; overflow: hidden; margin: 20px 0; }
  .table-wrapper { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  thead { background: rgba(45, 49, 57, 0.5); border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
  th { padding: 16px; text-align: left; font-size: 12px; font-weight: 600; color: #8b92a1; text-transform: uppercase; }
  td { padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.02); font-size: 14px; color: #e1e8ed; }
  tr:hover { background: rgba(34, 197, 94, 0.05); }
  .user-cell { display: flex; align-items: center; gap: 12px; }
  .user-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #a855f7, #ec4899); display: flex; align-items: center; justify-content: center; font-weight: 600; color: white; font-size: 14px; }
  .user-info h4 { font-size: 14px; font-weight: 600; color: #e1e8ed; }
  .user-info p { font-size: 12px; color: #8b92a1; }
  .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .badge-active { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
  .badge-inactive { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
  .actions { display: flex; gap: 10px; }
  .action-btn { background: none; border: none; cursor: pointer; color: #8b92a1; padding: 6px; border-radius: 6px; transition: all 0.2s; display: flex; align-items: center; }
  .action-btn:hover { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
  .action-btn.delete:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
  .btn-add { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; margin: 20px 0; }
  .filters { display: flex; gap: 12px; margin: 20px 0; flex-wrap: wrap; }
  .filter-btn { padding: 8px 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #8b92a1; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; }
  .filter-btn:hover, .filter-btn.active { background: rgba(34, 197, 94, 0.2); color: #22c55e; border-color: rgba(34, 197, 94, 0.3); }
  .pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.05); }
  .page-btn { padding: 8px 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #8b92a1; border-radius: 6px; cursor: pointer; font-size: 13px; }
  .page-btn:hover { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .modal { background: rgba(26, 29, 46, 0.95); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 30px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .modal-header h2 { font-size: 20px; font-weight: 700; color: #e1e8ed; }
  .modal-close { background: none; border: none; color: #8b92a1; cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.2s; }
  .form-group { margin-bottom: 20px; }
  .form-group label { display: block; font-size: 13px; font-weight: 600; color: #e1e8ed; margin-bottom: 8px; }
  .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 12px; background: rgba(45, 49, 57, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #e1e8ed; font-size: 14px; }
  .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #22c55e; background: rgba(45, 49, 57, 0.8); }
  .form-actions { display: flex; gap: 12px; margin-top: 24px; }
  .btn { flex: 1; padding: 12px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-primary { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; }
  .btn-secondary { background: rgba(255, 255, 255, 0.1); color: #e1e8ed; border: 1px solid rgba(255, 255, 255, 0.2); }
  .btn-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
  .toast { position: fixed; bottom: 20px; right: 20px; padding: 16px 24px; background: rgba(26, 29, 46, 0.95); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #e1e8ed; display: flex; align-items: center; gap: 12px; z-index: 2000; }
  .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin: 30px 0; }
  .chart-card { background: rgba(26, 29, 46, 0.8); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; }
  .chart-card h3 { font-size: 16px; font-weight: 600; color: #e1e8ed; margin-bottom: 20px; }
  .chart-wrapper { width: 100%; height: 300px; }
  @media (max-width: 768px) {
    .app { flex-direction: column; }
    .sidebar { width: 100%; max-height: 80px; flex-direction: row; }
    .content { flex: 1; padding: 20px; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .charts-grid { grid-template-columns: 1fr; }
  }
`;

// Mock data
const generateUsers = () => [
  { id: 1, name: 'John Doe', email: 'john@example.com', age: 28, weight: 85, height: 180, goal: 'Weight Loss', dietitian: 'Dr. Sarah', status: 'Active', joined: '2024-01-15' },
  { id: 2, name: 'Emma Wilson', email: 'emma@example.com', age: 34, weight: 72, height: 168, goal: 'Maintenance', dietitian: 'Dr. Mike', status: 'Active', joined: '2024-01-20' },
  { id: 3, name: 'Alex Martinez', email: 'alex@example.com', age: 31, weight: 92, height: 185, goal: 'Muscle Gain', dietitian: 'Dr. Sarah', status: 'Inactive', joined: '2024-02-01' },
  { id: 4, name: 'Lisa Chen', email: 'lisa@example.com', age: 26, weight: 65, height: 165, goal: 'Weight Loss', dietitian: 'Dr. John', status: 'Active', joined: '2024-02-10' },
  { id: 5, name: 'Michael Johnson', email: 'michael@example.com', age: 45, weight: 88, height: 182, goal: 'Weight Loss', dietitian: 'Dr. Mike', status: 'Active', joined: '2024-02-15' },
  { id: 6, name: 'Sarah Davis', email: 'sarah@example.com', age: 29, weight: 70, height: 170, goal: 'Maintenance', dietitian: 'Dr. Sarah', status: 'Active', joined: '2024-02-20' },
  { id: 7, name: 'James Brown', email: 'james@example.com', age: 52, weight: 95, height: 188, goal: 'Weight Loss', dietitian: 'Dr. John', status: 'Inactive', joined: '2024-03-01' },
  { id: 8, name: 'Rachel Garcia', email: 'rachel@example.com', age: 23, weight: 62, height: 162, goal: 'Muscle Gain', dietitian: 'Dr. Sarah', status: 'Active', joined: '2024-03-05' },
];

const generateDietitians = () => [
  { id: 1, name: 'Dr. Sarah Mitchell', email: 'sarah@example.com', specialization: 'Weight Management', phone: '+1-234-567-8901', assignedUsers: 12, status: 'Active', bio: 'Expert in personalized nutrition' },
  { id: 2, name: 'Dr. Mike Thompson', email: 'mike@example.com', specialization: 'Sports Nutrition', phone: '+1-234-567-8902', assignedUsers: 15, status: 'Active', bio: 'Specializes in athlete diets' },
  { id: 3, name: 'Dr. John Anderson', email: 'john@example.com', specialization: 'Clinical Nutrition', phone: '+1-234-567-8903', assignedUsers: 8, status: 'Active', bio: 'Medical nutrition specialist' },
  { id: 4, name: 'Dr. Emma Wilson', email: 'emma.w@example.com', specialization: 'Plant-Based Diets', phone: '+1-234-567-8904', assignedUsers: 11, status: 'Active', bio: 'Vegan and vegetarian expert' },
  { id: 5, name: 'Dr. Robert Lee', email: 'robert@example.com', specialization: 'Diabetes Management', phone: '+1-234-567-8905', assignedUsers: 9, status: 'Inactive', bio: 'Specialized in metabolic disorders' },
];

const generatePlans = () => [
  { id: 1, name: 'Rapid Fat Loss', type: 'Weight Loss', createdBy: 'Dr. Sarah', assignedUsers: 45, duration: 12, status: 'Active', description: 'Intensive 12-week fat loss' },
  { id: 2, name: 'Muscle Builder Pro', type: 'Muscle Gain', createdBy: 'Dr. Mike', assignedUsers: 32, duration: 16, status: 'Active', description: 'Advanced muscle building' },
  { id: 3, name: 'Keto Mastery', type: 'Keto', createdBy: 'Dr. John', assignedUsers: 28, duration: 8, status: 'Active', description: 'Complete ketogenic protocol' },
  { id: 4, name: 'Vegan Vitality', type: 'Vegan', createdBy: 'Dr. Emma', assignedUsers: 35, duration: 10, status: 'Active', description: 'Plant-based excellence' },
];

const monthlyData = [
  { month: 'Jan', users: 120 }, { month: 'Feb', users: 180 }, { month: 'Mar', users: 240 },
  { month: 'Apr', users: 210 }, { month: 'May', users: 290 }, { month: 'Jun', users: 350 },
];

const calorieData = [
  { day: 'Mon', calories: 2100 }, { day: 'Tue', calories: 2050 }, { day: 'Wed', calories: 2200 },
  { day: 'Thu', calories: 2000 }, { day: 'Fri', calories: 2150 }, { day: 'Sat', calories: 2300 }, { day: 'Sun', calories: 2100 },
];

const goalData = [
  { name: 'Weight Loss', value: 450, fill: '#ef4444' },
  { name: 'Muscle Gain', value: 280, fill: '#3b82f6' },
  { name: 'Maintenance', value: 220, fill: '#f59e0b' },
];

// Main Component
export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);

  // Users
  const [users, setUsers] = useState(generateUsers());
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', age: '', weight: '', height: '', goal: 'Weight Loss', dietitian: '' });
  const [userFilter, setUserFilter] = useState('All');
  const [userGoalFilter, setUserGoalFilter] = useState('All');
  const [userPage, setUserPage] = useState(1);

  // Dietitians
  const [dietitians, setDietitians] = useState(generateDietitians());
  const [showDietitianModal, setShowDietitianModal] = useState(false);
  const [editingDietitian, setEditingDietitian] = useState(null);
  const [dietitianForm, setDietitianForm] = useState({ name: '', email: '', password: '', specialization: '', bio: '', phone: '' });

  // Plans
  const [plans, setPlans] = useState(generatePlans());
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({ name: '', type: 'Weight Loss', description: '', duration: '', calorieTarget: '', dietitian: '' });
  const [planTypeFilter, setPlanTypeFilter] = useState('All');

  // Modals
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Toast
  const showToast = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);

  // ========== HOME PAGE ==========
  const HomePage = () => (
    <div>
      <h1 className="page-title">Welcome back, Admin!</h1>
      <p className="page-subtitle">Here's what's happening in your diet system today</p>
      
      <div className="hero-banner">
        <div className="hero-content">
          <h2>🌿 System Overview</h2>
          <p>Monitor your diet management system performance and user metrics</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">1,245</div>
          <div className="stat-change">↑ 12% from last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dietitians</div>
          <div className="stat-value">28</div>
          <div className="stat-change">↑ 2 new this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Plans</div>
          <div className="stat-value">856</div>
          <div className="stat-change">↑ 5% from last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Success Rate</div>
          <div className="stat-value">87%</div>
          <div className="stat-change">↑ 3% improvement</div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3 className="page-title" style={{ fontSize: '20px', marginBottom: '15px' }}>Search Across System</h3>
        <div className="search-bar">
          <Search size={20} />
          <input type="text" placeholder="Search users, dietitians, plans..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#e1e8ed' }}>Recent Users</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>User</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map(user => (
                <tr key={user.id}>
                  <td><div className="user-cell"><div className="user-avatar">{user.name[0]}</div><div className="user-info"><h4>{user.name}</h4><p>{user.email}</p></div></div></td>
                  <td>User</td><td>{user.joined}</td>
                  <td><span className={`badge badge-${user.status.toLowerCase()}`}>{user.status}</span></td>
                  <td><div className="actions"><button className="action-btn"><Eye size={18} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ========== MANAGE USERS ==========
  const ManageUsersPage = () => {
    const filtered = useMemo(() => {
      let result = users;
      if (userFilter !== 'All') result = result.filter(u => u.status === userFilter);
      if (userGoalFilter !== 'All') result = result.filter(u => u.goal === userGoalFilter);
      if (searchQuery) result = result.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
      return result;
    }, [users, userFilter, userGoalFilter, searchQuery]);

    const paginated = filtered.slice((userPage - 1) * 10, userPage * 10);

    const handleSaveUser = () => {
      if (!userForm.name || !userForm.email) { showToast('Name and email required', 'error'); return; }
      if (editingUser) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userForm } : u));
        showToast('User updated', 'success');
      } else {
        setUsers([{ id: users.length + 1, ...userForm, status: 'Active', joined: new Date().toISOString().split('T')[0] }, ...users]);
        showToast('User added', 'success');
      }
      setShowUserModal(false);
    };

    return (
      <div>
        <h1 className="page-title">Manage Users</h1>
        <p className="page-subtitle">View, add, edit, and manage user accounts</p>
        <button className="btn-add" onClick={() => { setEditingUser(null); setUserForm({ name: '', email: '', password: '', age: '', weight: '', height: '', goal: 'Weight Loss', dietitian: '' }); setShowUserModal(true); }}>
          <Plus size={18} /> Add New User
        </button>
        <div className="filters">
          {['All', 'Active', 'Inactive'].map(s => <button key={s} className={`filter-btn ${userFilter === s ? 'active' : ''}`} onClick={() => { setUserFilter(s); setUserPage(1); }}>{s}</button>)}
          <div style={{ flex: 1 }} />
          {['All', 'Weight Loss', 'Muscle Gain', 'Maintenance'].map(g => <button key={g} className={`filter-btn ${userGoalFilter === g ? 'active' : ''}`} onClick={() => { setUserGoalFilter(g); setUserPage(1); }}>{g}</button>)}
        </div>
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>User</th><th>Email</th><th>Age</th><th>Weight</th><th>Goal</th><th>Dietitian</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paginated.map(user => (
                  <tr key={user.id}>
                    <td><div className="user-cell"><div className="user-avatar">{user.name[0]}</div><div className="user-info"><h4>{user.name}</h4></div></div></td>
                    <td>{user.email}</td><td>{user.age}</td><td>{user.weight}</td><td>{user.goal}</td><td>{user.dietitian}</td>
                    <td><span className={`badge badge-${user.status.toLowerCase()}`}>{user.status}</span></td>
                    <td><div className="actions"><button className="action-btn" onClick={() => { setEditingUser(user); setUserForm(user); setShowUserModal(true); }}><Edit2 size={18} /></button><button className="action-btn delete" onClick={() => { setConfirmAction(() => () => { setUsers(users.filter(u => u.id !== user.id)); showToast('User deleted', 'success'); setShowConfirm(false); }); setShowConfirm(true); }}><Trash2 size={18} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span>Page {userPage} of {Math.ceil(filtered.length / 10)}</span>
            <button className="page-btn" onClick={() => setUserPage(Math.max(1, userPage - 1))}>Previous</button>
            <button className="page-btn" onClick={() => setUserPage(Math.min(Math.ceil(filtered.length / 10), userPage + 1))}>Next</button>
          </div>
        </div>

        {showUserModal && (
          <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h2>{editingUser ? 'Edit User' : 'Add User'}</h2><button className="modal-close" onClick={() => setShowUserModal(false)}><X size={24} /></button></div>
              <div className="form-group"><label>Name *</label><input type="text" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} /></div>
              <div className="form-group"><label>Email *</label><input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></div>
              <div className="form-group"><label>Age</label><input type="number" value={userForm.age} onChange={(e) => setUserForm({ ...userForm, age: e.target.value })} /></div>
              <div className="form-group"><label>Weight</label><input type="number" value={userForm.weight} onChange={(e) => setUserForm({ ...userForm, weight: e.target.value })} /></div>
              <div className="form-group"><label>Height</label><input type="number" value={userForm.height} onChange={(e) => setUserForm({ ...userForm, height: e.target.value })} /></div>
              <div className="form-group"><label>Goal</label><select value={userForm.goal} onChange={(e) => setUserForm({ ...userForm, goal: e.target.value })}><option>Weight Loss</option><option>Muscle Gain</option><option>Maintenance</option></select></div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleSaveUser}><Check size={18} /> Save</button>
                <button className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========== MANAGE DIETITIANS ==========
  const ManageDietitians = () => {
    const handleSaveDietitian = () => {
      if (!dietitianForm.name || !dietitianForm.email) { showToast('Name and email required', 'error'); return; }
      if (editingDietitian) {
        setDietitians(dietitians.map(d => d.id === editingDietitian.id ? { ...d, ...dietitianForm } : d));
        showToast('Dietitian updated', 'success');
      } else {
        setDietitians([{ id: dietitians.length + 1, ...dietitianForm, assignedUsers: 0, status: 'Active' }, ...dietitians]);
        showToast('Dietitian added', 'success');
      }
      setShowDietitianModal(false);
    };

    return (
      <div>
        <h1 className="page-title">Manage Dietitians</h1>
        <p className="page-subtitle">View, add, edit, and manage dietitian accounts</p>
        <button className="btn-add" onClick={() => { setEditingDietitian(null); setDietitianForm({ name: '', email: '', password: '', specialization: '', bio: '', phone: '' }); setShowDietitianModal(true); }}>
          <Plus size={18} /> Add Dietitian
        </button>
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Dietitian</th><th>Email</th><th>Specialization</th><th>Phone</th><th>Patients</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {dietitians.map(d => (
                  <tr key={d.id}>
                    <td><div className="user-cell"><div className="user-avatar">{d.name[0]}</div><div className="user-info"><h4>{d.name}</h4></div></div></td>
                    <td>{d.email}</td><td>{d.specialization}</td><td>{d.phone}</td><td>{d.assignedUsers}</td>
                    <td><span className={`badge badge-${d.status.toLowerCase()}`}>{d.status}</span></td>
                    <td><div className="actions"><button className="action-btn" onClick={() => { setEditingDietitian(d); setDietitianForm(d); setShowDietitianModal(true); }}><Edit2 size={18} /></button><button className="action-btn delete" onClick={() => { setConfirmAction(() => () => { setDietitians(dietitians.filter(x => x.id !== d.id)); showToast('Deleted', 'success'); setShowConfirm(false); }); setShowConfirm(true); }}><Trash2 size={18} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showDietitianModal && (
          <div className="modal-overlay" onClick={() => setShowDietitianModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h2>{editingDietitian ? 'Edit' : 'Add'} Dietitian</h2><button className="modal-close" onClick={() => setShowDietitianModal(false)}><X size={24} /></button></div>
              <div className="form-group"><label>Name *</label><input type="text" value={dietitianForm.name} onChange={(e) => setDietitianForm({ ...dietitianForm, name: e.target.value })} /></div>
              <div className="form-group"><label>Email *</label><input type="email" value={dietitianForm.email} onChange={(e) => setDietitianForm({ ...dietitianForm, email: e.target.value })} /></div>
              <div className="form-group"><label>Specialization</label><input type="text" value={dietitianForm.specialization} onChange={(e) => setDietitianForm({ ...dietitianForm, specialization: e.target.value })} /></div>
              <div className="form-group"><label>Phone</label><input type="tel" value={dietitianForm.phone} onChange={(e) => setDietitianForm({ ...dietitianForm, phone: e.target.value })} /></div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleSaveDietitian}><Check size={18} /> Save</button>
                <button className="btn btn-secondary" onClick={() => setShowDietitianModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========== MANAGE PLANS ==========
  const ManagePlans = () => {
    const filtered = useMemo(() => {
      let result = plans;
      if (planTypeFilter !== 'All') result = result.filter(p => p.type === planTypeFilter);
      return result;
    }, [plans, planTypeFilter]);

    const handleSavePlan = () => {
      if (!planForm.name || !planForm.duration) { showToast('Name and duration required', 'error'); return; }
      if (editingPlan) {
        setPlans(plans.map(p => p.id === editingPlan.id ? { ...p, ...planForm } : p));
        showToast('Plan updated', 'success');
      } else {
        setPlans([{ id: plans.length + 1, ...planForm, assignedUsers: 0, status: 'Active', createdBy: 'Admin' }, ...plans]);
        showToast('Plan created', 'success');
      }
      setShowPlanModal(false);
    };

    return (
      <div>
        <h1 className="page-title">Manage Plans</h1>
        <p className="page-subtitle">Create, edit, and manage meal plans</p>
        <button className="btn-add" onClick={() => { setEditingPlan(null); setPlanForm({ name: '', type: 'Weight Loss', description: '', duration: '', calorieTarget: '', dietitian: '' }); setShowPlanModal(true); }}>
          <Plus size={18} /> Create Plan
        </button>
        <div className="filters">
          {['All', 'Weight Loss', 'Muscle Gain', 'Keto', 'Vegan'].map(t => <button key={t} className={`filter-btn ${planTypeFilter === t ? 'active' : ''}`} onClick={() => setPlanTypeFilter(t)}>{t}</button>)}
        </div>
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Plan</th><th>Type</th><th>Created By</th><th>Users</th><th>Duration</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: '600' }}>{p.name}</td><td>{p.type}</td><td>{p.createdBy}</td><td>{p.assignedUsers}</td><td>{p.duration}w</td>
                    <td><span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span></td>
                    <td><div className="actions"><button className="action-btn" onClick={() => { setEditingPlan(p); setPlanForm(p); setShowPlanModal(true); }}><Edit2 size={18} /></button><button className="action-btn delete" onClick={() => { setConfirmAction(() => () => { setPlans(plans.filter(x => x.id !== p.id)); showToast('Deleted', 'success'); setShowConfirm(false); }); setShowConfirm(true); }}><Trash2 size={18} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showPlanModal && (
          <div className="modal-overlay" onClick={() => setShowPlanModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h2>{editingPlan ? 'Edit' : 'Create'} Plan</h2><button className="modal-close" onClick={() => setShowPlanModal(false)}><X size={24} /></button></div>
              <div className="form-group"><label>Name *</label><input type="text" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} /></div>
              <div className="form-group"><label>Type</label><select value={planForm.type} onChange={(e) => setPlanForm({ ...planForm, type: e.target.value })}><option>Weight Loss</option><option>Muscle Gain</option><option>Keto</option><option>Vegan</option></select></div>
              <div className="form-group"><label>Duration (weeks) *</label><input type="number" value={planForm.duration} onChange={(e) => setPlanForm({ ...planForm, duration: e.target.value })} /></div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleSavePlan}><Check size={18} /> Save</button>
                <button className="btn btn-secondary" onClick={() => setShowPlanModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========== REPORTS ==========
  const ReportsPage = () => (
    <div>
      <h1 className="page-title">Reports & Analytics</h1>
      <p className="page-subtitle">View system performance metrics</p>
      <button className="btn-add" onClick={() => window.print()}>📊 Export Report</button>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly User Registrations</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis stroke="#8b92a1" /><YAxis stroke="#8b92a1" />
                <Tooltip contentStyle={{ background: 'rgba(26,29,46,0.9)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Legend /><Bar dataKey="users" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Daily Calorie Intake</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calorieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis stroke="#8b92a1" /><YAxis stroke="#8b92a1" />
                <Tooltip contentStyle={{ background: 'rgba(26,29,46,0.9)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Legend /><Line type="monotone" dataKey="calories" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Goal Distribution</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={goalData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {goalData.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(26,29,46,0.9)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Performance Metrics</h3>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Top Dietitian</span><strong style={{ color: '#22c55e' }}>Dr. Mike Thompson</strong>
              </div>
              <p style={{ fontSize: '13px', color: '#8b92a1' }}>15 patients</p>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Top Plan</span><strong style={{ color: '#3b82f6' }}>Rapid Fat Loss</strong>
              </div>
              <p style={{ fontSize: '13px', color: '#8b92a1' }}>45 users</p>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Avg User BMI</span><strong style={{ color: '#f59e0b' }}>24.3</strong>
              </div>
              <p style={{ fontSize: '13px', color: '#8b92a1' }}>Healthy range</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render page based on currentPage state
  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'users': return <ManageUsersPage />;
      case 'dietitians': return <ManageDietitians />;
      case 'plans': return <ManagePlans />;
      case 'reports': return <ReportsPage />;
      default: return <HomePage />;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="logo">🌿 HealthyLife</div>
          <div className="admin-profile">
            <div className="admin-avatar">AD</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#e1e8ed', margin: '0 0 2px 0' }}>Admin Panel</h4>
              <p style={{ fontSize: '12px', color: '#8b92a1', margin: 0 }}>System Manager</p>
            </div>
          </div>

          <div className="nav-menu">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'users', label: 'Manage Users', icon: Users },
              { id: 'dietitians', label: 'Manage Dietitians', icon: Stethoscope },
              { id: 'plans', label: 'Manage Plans', icon: BookOpen },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                  onClick={() => {
                    console.log('Clicking page:', item.id); // Debug
                    setCurrentPage(item.id);
                    setSearchQuery('');
                  }}
                >
                  <Icon size={20} />
                  {item.label}
                </div>
              );
            })}
          </div>

          <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
            <LogOut size={20} />
            Logout
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="content">
          {renderPage()}
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={() => setShowConfirm(false)}><X size={24} /></button>
            </div>
            <p style={{ color: '#8b92a1', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={20} color="#f59e0b" />
              Are you sure? This action cannot be undone.
            </p>
            <div className="form-actions">
              <button className="btn btn-danger" onClick={confirmAction}><Trash2 size={18} /> Delete</button>
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Confirm Logout</h2>
              <button className="modal-close" onClick={() => setShowLogoutConfirm(false)}><X size={24} /></button>
            </div>
            <p style={{ color: '#8b92a1', marginBottom: '24px' }}>Are you sure you want to logout?</p>
            <div className="form-actions">
              <button className="btn btn-danger" onClick={() => { showToast('Logged out', 'success'); setShowLogoutConfirm(false); }}><LogOut size={18} /> Logout</button>
              <button className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* TOASTS */}
      {toasts.map(t => (
        <div key={t.id} className="toast" style={{ borderColor: t.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)' }}>
          {t.type === 'success' ? <Check size={20} style={{ color: '#22c55e' }} /> : <AlertCircle size={20} style={{ color: '#ef4444' }} />}
          {t.msg}
        </div>
      ))}
    </>
  );
}
