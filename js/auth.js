let resolvedApiBaseUrl = null;

function normalizeBaseUrl(baseUrl) {
  try {
    const normalized = new URL('./', baseUrl).toString();
    return normalized.startsWith('file:') ? null : normalized;
  } catch {
    return null;
  }
}

function getLocalProjectBaseCandidates() {
  if (window.location.protocol !== 'file:') {
    return [];
  }

  const path = decodeURIComponent(window.location.pathname || '');
  const segments = path.split('/').filter(Boolean);
  const projectFolder = segments.length >= 2 ? segments[segments.length - 2] : '';

  if (!projectFolder) {
    return [];
  }

  return [
    `http://localhost/${projectFolder}/`,
    `http://127.0.0.1/${projectFolder}/`,
  ];
}

function getApiBaseCandidates() {
  const candidates = [];
  const override = window.DIET_SYSTEM_API_BASE_URL || localStorage.getItem('dietSystemApiBaseUrl');
  const scriptBase = document.currentScript?.src && !document.currentScript.src.startsWith('file:')
    ? new URL('../', document.currentScript.src).toString()
    : null;
  const currentDir = window.location.protocol !== 'file:' ? new URL('./', window.location.href).toString() : null;

  [override, scriptBase, currentDir, ...getLocalProjectBaseCandidates(), 'http://localhost:8000/', 'http://127.0.0.1:8000/', 'http://localhost/', 'http://127.0.0.1/']
    .forEach((candidate) => {
      const normalized = normalizeBaseUrl(candidate);
      if (normalized && !candidates.includes(normalized)) {
        candidates.push(normalized);
      }
    });

  return candidates;
}

function setResolvedApiBaseUrl(baseUrl) {
  const normalized = normalizeBaseUrl(baseUrl);
  if (!normalized) return null;

  resolvedApiBaseUrl = normalized;
  window.DIET_SYSTEM_API_BASE_URL = normalized;
  localStorage.setItem('dietSystemApiBaseUrl', normalized);

  return normalized;
}

function getResolvedApiBaseUrl() {
  const override = normalizeBaseUrl(resolvedApiBaseUrl || window.DIET_SYSTEM_API_BASE_URL || localStorage.getItem('dietSystemApiBaseUrl'));
  return override || getApiBaseCandidates()[0] || 'http://localhost:8000/';
}

// ========================================
// Diet System - Authentication JavaScript
// ========================================

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  setCurrentDate();
});

function getApiUrl(path) {
  const normalizedPath = String(path || '').replace(/^\/+/, '');
  return new URL(normalizedPath, getResolvedApiBaseUrl()).toString();
}

function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}

function getLocalAuthUsers() {
  const savedUsers = localStorage.getItem('dietSystemLocalUsers');

  if (!savedUsers) {
    return [];
  }

  try {
    const users = JSON.parse(savedUsers);
    return Array.isArray(users) ? users : [];
  } catch (error) {
    return [];
  }
}

function saveLocalAuthUsers(users) {
  localStorage.setItem('dietSystemLocalUsers', JSON.stringify(users));
}

function loginWithLocalAuth(email, password) {
  const users = getLocalAuthUsers();
  const matchedUser = users.find(user => user.email.toLowerCase() === email.toLowerCase() && user.password === password);

  if (!matchedUser) {
    return {
      success: false,
      message: 'Invalid email or password.'
    };
  }

  const sessionUser = {
    id: matchedUser.id,
    name: matchedUser.name,
    email: matchedUser.email,
    role: matchedUser.role,
    loginTime: new Date().toISOString()
  };

  localStorage.setItem('dietSystemUser', JSON.stringify(sessionUser));

  return {
    success: true,
    user: sessionUser
  };
}

function registerWithLocalAuth(name, email, password, role) {
  const users = getLocalAuthUsers();
  const normalizedEmail = email.toLowerCase();
  const existingUser = users.find(user => user.email.toLowerCase() === normalizedEmail);

  if (existingUser) {
    return {
      success: false,
      message: 'An account with this email already exists.'
    };
  }

  const createdUser = {
    id: Date.now(),
    name,
    email,
    password,
    role,
    createdAt: new Date().toISOString()
  };

  users.push(createdUser);
  saveLocalAuthUsers(users);

  const sessionUser = {
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
    role: createdUser.role,
    loginTime: new Date().toISOString()
  };

  localStorage.setItem('dietSystemUser', JSON.stringify(sessionUser));

  return {
    success: true,
    user: sessionUser
  };
}

async function parseJsonResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch (error) {
    return {
      success: false,
      message: text || 'Server returned an invalid response.'
    };
  }
}

async function checkServerConnection() {
  const candidates = getApiBaseCandidates();

  for (const baseUrl of candidates) {
    try {
      const testUrl = new URL('api/test-connection.php', baseUrl).toString();
      const response = await fetch(testUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      const payload = await parseJsonResponse(response);
      if (response.ok && payload.success) {
        setResolvedApiBaseUrl(baseUrl);
        return {
          success: true,
          mode: 'server',
          apiBaseUrl: baseUrl
        };
      }
    } catch (error) {
      // Try the next candidate
    }
  }

  return {
    success: false,
    message: 'Cannot reach the PHP server. Please start Apache/PHP and MySQL, then try again.'
  };
}

// Toggle between login and register forms
function showForm(formType) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginToggle = document.getElementById('loginTab');
  const registerToggle = document.getElementById('registerTab');
  
  if (formType === 'login') {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    loginToggle.classList.add('active');
    registerToggle.classList.remove('active');
  } else {
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
    loginToggle.classList.remove('active');
    registerToggle.classList.add('active');
  }
}

// Password strength checker
function checkPasswordStrength() {
  const password = document.getElementById('registerPassword').value;
  const strengthFill = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');
  
  let strength = 0;
  let label = '';
  
  if (password.length >= 8) strength++;
  if (password.match(/[A-Z]/)) strength++;
  if (password.match(/[0-9]/)) strength++;
  if (password.match(/[^A-Za-z0-9]/)) strength++;
  
  strengthFill.className = 'strength-fill';
  
  if (password.length === 0) {
    strengthFill.style.width = '0';
    strengthText.textContent = 'Password strength: ';
  } else if (strength <= 1) {
    strengthFill.classList.add('weak');
    label = 'Weak';
  } else if (strength <= 2) {
    strengthFill.classList.add('medium');
    label = 'Medium';
  } else {
    strengthFill.classList.add('strong');
    label = 'Strong';
  }
  
  strengthText.textContent = 'Password strength: ' + label;
}

// Validate email format
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate password
function validatePassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

// Handle login form submission
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  // Basic validation
  if (!email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  
  if (!validateEmail(email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }

  const connection = await checkServerConnection();
  if (!connection.success) {
    showToast(connection.message, 'error');
    return;
  }

  try {
    const response = await fetch(getApiUrl('api/auth/login.php'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await parseJsonResponse(response);

    if (!response.ok || !result.success) {
      showToast(result.message || 'Login failed', 'error');
      return;
    }

    localStorage.setItem('dietSystemUser', JSON.stringify(result.user));
    showToast('Login successful! Redirecting...', 'success');
    redirectByRole(result.user.role);
  } catch (error) {
    showToast(
      'Login request failed. Make sure Apache, MySQL, and the API are running.',
      'error'
    );
  }
}

// Handle register form submission
async function handleRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const selectedRole = document.querySelector('.role-option.selected');
  const role = selectedRole ? selectedRole.dataset.role : '';
  
  // Validation
  if (!name || !email || !password || !confirmPassword || !role) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  
  if (!validateEmail(email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }
  
  if (!validatePassword(password)) {
    showToast('Password must be at least 8 characters with 1 uppercase and 1 number', 'error');
    return;
  }
  
  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  const connection = await checkServerConnection();
  if (!connection.success) {
    showToast(connection.message, 'error');
    return;
  }

  try {
    const response = await fetch(getApiUrl('api/auth/register.php'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ name, email, password, role })
    });

    const result = await parseJsonResponse(response);

    if (!response.ok || !result.success) {
      showToast(result.message || 'Registration failed', 'error');
      return;
    }

    localStorage.setItem('dietSystemUser', JSON.stringify({
      ...result.user,
      loginTime: new Date().toISOString()
    }));

    showToast('Registration successful! Redirecting...', 'success');
    redirectByRole(result.user.role);
  } catch (error) {
    showToast(
      'Registration request failed. Make sure Apache, MySQL, and the API are running.',
      'error'
    );
  }
}

// Check authentication status
async function checkAuth() {
  const userData = localStorage.getItem('dietSystemUser');
  
  // If on login page and already logged in, redirect to appropriate dashboard
  const path = window.location.pathname;
  const isAuthPage = path.endsWith('/') || path.endsWith('/index.html') || path.endsWith('index.html');

  if (userData && isAuthPage) {
    try {
      const response = await fetch(getApiUrl('api/auth/status.php'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      const result = await parseJsonResponse(response);
      if (response.ok && result.success && result.data?.authenticated) {
        const role = normalizeRole(result.data.role || JSON.parse(userData).role);

        switch (role) {
          case 'admin':
            window.location.href = 'admin-dashboard.html';
            break;
          case 'dietitian':
            window.location.href = 'dietitian-dashboard.html';
            break;
          default:
            window.location.href = 'user-dashboard.html';
        }
        return;
      }
    } catch (error) {
      // If the server cannot be checked, stay on the auth page and let login handle it.
    }

    localStorage.removeItem('dietSystemUser');
  }
}

// Handle logout
async function handleLogout() {
  try {
    await fetch(getApiUrl('api/auth/logout.php'), {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    // Local cleanup still happens even if the backend request fails.
  }

  localStorage.removeItem('dietSystemUser');
  localStorage.removeItem('healthData');
  localStorage.removeItem('foodLog');
  localStorage.removeItem('calorieLimit');
  localStorage.removeItem('waterTracker');
  localStorage.removeItem('dietitianAssignments');
  
  showToast('Logged out successfully', 'success');
  
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}

// Set current date in header
function setCurrentDate() {
  const dateElement = document.getElementById('currentDate');
  if (dateElement) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString('en-US', options);
  }
}

// Toggle sidebar on mobile
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('show');
  }
}

// Get current user data
function getCurrentUser() {
  const userData = localStorage.getItem('dietSystemUser');
  return userData ? JSON.parse(userData) : null;
}

// Show toast notification
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'exclamation-triangle';
  
  toast.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'toastSlide 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Navigation for dashboard pages
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      const section = this.getAttribute('data-section');
      showSection(section);
      
      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

// Show specific section
function showSection(sectionId) {
  const sections = document.querySelectorAll('.dashboard-section');
  sections.forEach(section => {
    section.classList.add('hidden');
  });
  
  const targetSection = document.getElementById(sectionId + 'Section');
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }
  
  // Update page title
  updatePageTitle(sectionId);
}

// Update page title based on section
function updatePageTitle(section) {
  const titles = {
    'home': { title: 'Dashboard', subtitle: 'Welcome back!' },
    'health-data': { title: 'Health Data', subtitle: 'Manage your health information' },
    'food-tracker': { title: 'Food Tracker', subtitle: 'Track your daily meals' },
    'diet-plan': { title: 'Diet Plan', subtitle: 'Your personalized meal plan' },
    'reports': { title: 'Reports', subtitle: 'View your progress reports' },
    'assigned-users': { title: 'Assigned Users', subtitle: 'Manage your patients' },
    'create-plan': { title: 'Create Meal Plan', subtitle: 'Create a new meal plan' },
    'feedback': { title: 'Feedback', subtitle: 'Send feedback to patients' },
    'manage-users': { title: 'Manage Users', subtitle: 'CRUD operations for users' },
    'manage-dietitians': { title: 'Manage Dietitians', subtitle: 'CRUD operations for dietitians' },
    'manage-plans': { title: 'Manage Plans', subtitle: 'View and assign plans' }
  };
  
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  
  if (titles[section]) {
    if (pageTitle) pageTitle.textContent = titles[section].title;
    if (pageSubtitle) pageSubtitle.textContent = titles[section].subtitle;
  }
}

// Initialize dashboard if on dashboard page
if (window.location.href.includes('-dashboard.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    
    // Set user info in sidebar
    const user = getCurrentUser();
    if (user) {
      const userName = document.getElementById('userName') || document.getElementById('dietitianName') || document.getElementById('adminName');
      const userRole = document.getElementById('userRole');
      const welcomeName = document.getElementById('welcomeName') || document.getElementById('heroUserName') || document.getElementById('heroDietitianName');
      const userAvatar = document.getElementById('userAvatar') || document.getElementById('dietitianAvatar') || document.getElementById('adminAvatar');
      
      if (userName) userName.textContent = user.name;
      if (userRole) userRole.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
      if (welcomeName) welcomeName.textContent = user.name;
      if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();
    }
  });
}

function redirectByRole(role) {
  const normalizedRole = normalizeRole(role);
  const routes = {
    admin: 'admin-dashboard.html?v=20260608-2',
    dietitian: 'dietitian-dashboard.html?v=20260608-2',
    default: 'user-dashboard.html?v=20260608-2',
  };

  setTimeout(() => {
    switch (normalizedRole) {
      case 'admin':
        window.location.href = routes.admin;
        break;
      case 'dietitian':
        window.location.href = routes.dietitian;
        break;
      default:
        window.location.href = routes.default;
    }
  }, 1000);
}

function selectRole(role) {
  const roleOptions = document.querySelectorAll('.role-option');

  roleOptions.forEach(option => {
    option.classList.toggle('selected', option.dataset.role === role);
  });
}
