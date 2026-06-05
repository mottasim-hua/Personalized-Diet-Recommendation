# Quick Start Guide - Diet System Admin Dashboard

## 🚀 Getting Started

### 1. Installation

```bash
cd admin-dashboard
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Dashboard will be available at: `http://localhost:5173`

### 3. Configure API Connection

Edit `vite.config.js` and set your PHP backend URL:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000', // Your PHP server
  }
}
```

## 📋 Project Checklist

- [x] Project structure created
- [x] All dependencies configured
- [x] Dashboard home page with statistics
- [x] Users management page with CRUD
- [x] Dietitians management page with approval
- [x] Plans management page with categories
- [x] Reports page with analytics and charts
- [x] Responsive design for mobile/tablet/desktop
- [x] Modern UI with Tailwind CSS
- [x] Smooth animations with Framer Motion
- [x] Data table with search/filter/pagination
- [x] Modal and confirmation dialogs
- [x] Toast notifications
- [x] Loading states and skeleton loaders
- [x] Sidebar navigation
- [x] Top navbar with notifications

## 🎯 Key Features Implemented

### Components Created

✓ Sidebar Navigation - Sticky sidebar with smooth transitions
✓ Top Navbar - With notifications, dark mode, profile menu
✓ Data Table - Reusable table with search, filter, pagination
✓ Stat Cards - Beautiful statistics display
✓ Modal - Dialog for forms and confirmations
✓ Confirm Modal - Confirmation before delete actions
✓ Skeleton Loader - Loading states for content
✓ Empty State - Friendly empty state UI
✓ Alert/Banner - Dismissible notifications
✓ Badge - Status and label badges
✓ Button - Reusable button component
✓ Card - Content container
✓ Tabs - Tab switcher component
✓ Progress Bar - Progress indicator
✓ Loading Spinner - Animated spinner

### Pages Created

✓ Dashboard - Home with overview and activities
✓ Manage Users - Complete CRUD for users
✓ Manage Dietitians - Dietitian approval system
✓ Manage Plans - Plan creation and management
✓ Reports - Analytics with charts and export

## 🔧 Customization Guide

### Change Primary Color

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#22c55e', // Change to your color
    600: '#16a34a',
  }
}
```

### Modify API Endpoints

Update `src/api/services.js` to match your backend API structure.

### Add New Page

1. Create `src/pages/NewPage.jsx`
2. Add route in `App.jsx`:

```javascript
<Route path="/new-page" element={<NewPage />} />
```

3. Add menu item in `Sidebar.jsx`

### Change Sidebar Items

Edit the `menuItems` array in `src/components/Sidebar.jsx`

## 🔐 Authentication Integration

### Add Auth Token to API Calls

The `src/api/axiosConfig.js` is pre-configured to include auth tokens.

Update local storage on login:

```javascript
localStorage.setItem('adminToken', token);
```

## 📱 Responsive Design

The dashboard is fully responsive:

- **Mobile**: < 640px - Sidebar hidden, hamburger menu
- **Tablet**: 640px - 1024px - Adjusted layouts
- **Desktop**: > 1024px - Full layout

## 🎨 UI Customization

### Tailwind CSS Classes

All components use Tailwind CSS. Customize spacing, colors, and sizes in `tailwind.config.js`.

### Dark Mode

The store has dark mode support. Enable in:

```javascript
const { isDark, toggleDarkMode } = useAppStore();
```

## 🐛 Common Issues & Solutions

### 1. API Not Connecting

- Check PHP server is running
- Verify proxy URL in `vite.config.js`
- Check CORS headers in PHP backend

### 2. Styles Not Loading

```bash
npm install
npm run dev
```

### 3. Animations Lagging

Reduce animation duration or disable in components.

## 📦 Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

Deploy the `dist` folder to your web server.

## 📚 Component Examples

### Using DataTable

```jsx
<DataTable
  data={data}
  columns={[{ key: 'name', label: 'Name' }]}
  searchable
  pagination
  itemsPerPage={10}
/>
```

### Using Modal

```jsx
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="My Modal">
  Content here
</Modal>
```

### Using Toast Notifications

```jsx
import { showSuccess, showError } from './utils/helpers';

showSuccess('Action completed!');
showError('Something went wrong');
```

## 🚀 Performance Tips

1. Use React Router code splitting
2. Implement lazy loading for charts
3. Optimize images
4. Enable compression in production
5. Use CDN for static assets

## 📞 Support & Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [React Router Docs](https://reactrouter.com)
- [Recharts Docs](https://recharts.org)
- [Framer Motion Docs](https://www.framer.com/motion)

## 📝 Next Steps

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Customize colors and branding
4. Connect to your backend APIs
5. Add authentication
6. Deploy to production

---

**Happy coding! 🎉**
