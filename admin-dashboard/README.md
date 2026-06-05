# Diet System Admin Dashboard

A modern, professional React-based admin dashboard for the Diet System project with beautiful UI/UX, responsive design, and comprehensive features.

## 🚀 Features

### Dashboard Pages

- **Dashboard Home** - Overview with statistics, charts, and recent activities
- **Manage Users** - CRUD operations for users with search, filter, and pagination
- **Manage Dietitians** - Manage dietitian profiles with approval system
- **Manage Plans** - Create and manage diet plans with categories
- **Reports** - Analytics and insights with downloadable reports

### UI/UX Features

- ✨ Modern professional design with green/white color scheme
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎨 Beautiful animations with Framer Motion
- 📊 Interactive charts with Recharts
- 🔍 Search, filter, and pagination on data tables
- 🎯 Reusable component library
- 💫 Skeleton loaders and loading states
- 🌙 Dark mode support (ready to implement)
- 🔔 Notification system with toast alerts
- ⌨️ Confirmation modals for critical actions

### Technical Stack

- **React 18** - UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **React Router v6** - Navigation
- **Zustand** - State management
- **Recharts** - Charts and analytics
- **Lucide React** - Beautiful icons
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Toastify** - Toast notifications

## 📁 Project Structure

```
admin-dashboard/
├── src/
│   ├── api/
│   │   ├── axiosConfig.js        # API configuration and interceptors
│   │   └── services.js           # API service methods
│   ├── components/
│   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   ├── Navbar.jsx            # Top navigation bar
│   │   ├── DataTable.jsx         # Reusable data table
│   │   ├── StatCard.jsx          # Statistics card
│   │   ├── Modal.jsx             # Modal dialog
│   │   ├── ConfirmModal.jsx      # Confirmation dialog
│   │   ├── SkeletonLoader.jsx    # Loading skeleton
│   │   ├── LoadingSpinner.jsx    # Loading spinner
│   │   └── EmptyState.jsx        # Empty state component
│   ├── layouts/
│   │   └── DashboardLayout.jsx   # Main layout
│   ├── pages/
│   │   ├── Dashboard.jsx         # Home dashboard
│   │   ├── ManageUsers.jsx       # Users management
│   │   ├── ManageDietitians.jsx  # Dietitians management
│   │   ├── ManagePlans.jsx       # Plans management
│   │   └── Reports.jsx           # Reports and analytics
│   ├── store/
│   │   └── appStore.js           # Zustand state store
│   ├── utils/
│   │   ├── helpers.js            # Utility functions
│   │   └── mockData.js           # Mock data for development
│   ├── App.jsx                   # Main app component
│   ├── index.css                 # Global styles
│   └── main.jsx                  # Entry point
├── index.html                    # HTML template
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.js             # PostCSS configuration
└── package.json                  # Dependencies
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 16+ and npm/yarn

### Steps

1. **Navigate to the project directory**

```bash
cd admin-dashboard
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables** (optional)
   Create a `.env` file if you need to customize API endpoints:

```
VITE_API_URL=http://localhost:8000
```

4. **Start development server**

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

5. **Build for production**

```bash
npm run build
```

## 🔌 API Integration

The dashboard is pre-configured to work with your existing PHP APIs. Update the API base URL in `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000', // Your API server
    changeOrigin: true,
  }
}
```

### Available API Endpoints

- `GET /api/admin/stats.php` - Get dashboard statistics
- `GET /api/admin/users.php` - Get users list
- `POST /api/admin/users.php` - Create/Update user
- `DELETE /api/admin/users.php` - Delete user
- `GET /api/admin/dietitians.php` - Get dietitians list
- `POST /api/admin/dietitians.php` - Create/Update/Approve dietitian
- `DELETE /api/admin/dietitians.php` - Delete dietitian
- `GET /api/admin/plans.php` - Get plans list
- `POST /api/admin/plans.php` - Create/Update plan
- `DELETE /api/admin/plans.php` - Delete plan

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
primary: {
  500: '#22c55e', // Change primary color
  600: '#16a34a',
}
```

### Typography

Modify font settings in `tailwind.config.js`:

```javascript
fontFamily: {
  sans: ['Your Font', 'system-ui', 'sans-serif'],
}
```

### Animations

Customize animations in `tailwind.config.js` under `animation` and `keyframes`.

## 📊 State Management

The app uses Zustand for state management. Access global state:

```javascript
import { useAppStore } from './store/appStore';

function MyComponent() {
  const { isDark, toggleDarkMode, sidebarOpen } = useAppStore();
  // ... use state
}
```

## 🚀 Performance Optimization

- ✅ Code splitting with React Router
- ✅ Lazy loading of components
- ✅ Optimized bundle size
- ✅ Caching with Axios
- ✅ Memoization of expensive computations

## 🔐 Security Considerations

1. **Authentication** - Implement token-based auth with the existing PHP backend
2. **CORS** - Configure CORS headers in your PHP backend
3. **Input Validation** - All forms have client-side validation
4. **API Security** - Ensure your PHP APIs require proper authentication

## 🐛 Troubleshooting

### API Connection Issues

- Check if your PHP server is running
- Verify proxy settings in `vite.config.js`
- Check browser console for CORS errors

### Styling Issues

- Clear node_modules: `rm -rf node_modules && npm install`
- Rebuild Tailwind: `npm run build`

### Component Issues

- Check browser console for error messages
- Verify all imports are correct
- Ensure Zustand store is properly initialized

## 📝 Adding New Pages

1. Create new component in `src/pages/NewPage.jsx`
2. Add route in `App.jsx`
3. Add menu item in `Sidebar.jsx`
4. Create API service methods if needed in `src/api/services.js`

Example:

```javascript
// App.jsx
<Route path="/new-page" element={<NewPage />} />

// Sidebar.jsx
{ path: '/new-page', label: 'New Page', icon: Icon }
```

## 🤝 Contributing

Feel free to customize and extend this dashboard for your needs!

## 📄 License

This project is part of the Diet System project.

## 📞 Support

For issues or questions, contact the development team.

---

**Built with ❤️ using React, Tailwind CSS, and modern web technologies**
