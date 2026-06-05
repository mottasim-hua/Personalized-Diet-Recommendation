import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Dashboard from './pages/Dashboard';
import ManageDietitians from './pages/ManageDietitians';
import ManagePlans from './pages/ManagePlans';
import ManageUsers from './pages/ManageUsers';
import Reports from './pages/Reports';

// Store
import { useAppStore } from './store/appStore';

function App() {
  const { isDark } = useAppStore();

  return (
    <div className={isDark ? 'dark' : ''}>
      <Router>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<ManageUsers />} />
            <Route path="/dietitians" element={<ManageDietitians />} />
            <Route path="/plans" element={<ManagePlans />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Route>
        </Routes>
      </Router>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDark ? 'dark' : 'light'}
      />
    </div>
  );
}

export default App;
