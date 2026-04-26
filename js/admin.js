// ========================================
// Diet System - Admin Dashboard JavaScript
// ========================================

// Global variables
let users = [];
let dietitians = [];
let plans = [];
let currentModal = null;

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
  if (!window.location.href.includes('admin-dashboard.html')) return;
  
  loadAdminData();
  setupNavigation();
  setupAdminHeader();
  showSection('home');
  initAdminCharts();
});

// Load admin data
function loadAdminData() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  
  // Update user info
  const adminName = document.getElementById('adminName');
  const welcomeName = document.getElementById('welcomeName');
  const userAvatar = document.getElementById('userAvatar') || document.getElementById('adminAvatar');
  
  if (adminName) adminName.textContent = user.name;
  if (welcomeName) welcomeName.textContent = user.name;
  if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();
  
  loadUsers();
  loadDietitians();
  loadPlans();
  updateAdminStats();
}

// Update admin stats
function updateAdminStats() {
  const totalUsers = document.getElementById('totalUsers');
  const totalDietitians = document.getElementById('totalDietitians');
  const totalPlans = document.getElementById('totalPlans');
  const activePlans = document.getElementById('activePlans');
  
  if (totalUsers) totalUsers.textContent = users.length || 25;
  if (totalDietitians) totalDietitians.textContent = dietitians.length || 8;
  if (totalPlans) totalPlans.textContent = plans.length || 45;
  if (activePlans) activePlans.textContent = Math.floor((plans.length || 45) * 0.7);
}

// Load users
function loadUsers() {
  const savedUsers = localStorage.getItem('adminUsers');
  
  if (savedUsers) {
    users = JSON.parse(savedUsers);
  } else {
    // Demo data
    users = [
      { id: 1, name: 'John Smith', email: 'john@example.com', role: 'user', status: 'active', joined: '2024-01-15' },
      { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'user', status: 'active', joined: '2024-01-10' },
      { id: 3, name: 'Mike Brown', email: 'mike@example.com', role: 'user', status: 'inactive', joined: '2024-01-08' },
      { id: 4, name: 'Emily Davis', email: 'emily@example.com', role: 'user', status: 'active', joined: '2024-01-05' },
      { id: 5, name: 'David Wilson', email: 'david@example.com', role: 'user', status: 'active', joined: '2024-01-02' }
    ];
    localStorage.setItem('adminUsers', JSON.stringify(users));
  }
  
  renderUsersTable();
}

// Load dietitians
function loadDietitians() {
  const savedDietitians = localStorage.getItem('adminDietitians');
  
  if (savedDietitians) {
    dietitians = JSON.parse(savedDietitians);
  } else {
    // Demo data
    dietitians = [
      { id: 1, name: 'Dr. Amanda Lee', email: 'amanda@diet.com', specialty: 'Weight Management', status: 'active', patients: 12 },
      { id: 2, name: 'Dr. Robert Chen', email: 'robert@diet.com', specialty: 'Sports Nutrition', status: 'active', patients: 8 },
      { id: 3, name: 'Dr. Maria Garcia', email: 'maria@diet.com', specialty: 'Clinical Nutrition', status: 'active', patients: 15 },
      { id: 4, name: 'Dr. James Wilson', email: 'james@diet.com', specialty: 'Pediatric Nutrition', status: 'inactive', patients: 5 }
    ];
    localStorage.setItem('adminDietitians', JSON.stringify(dietitians));
  }
  
  renderDietitiansTable();
}

// Load plans
function loadPlans() {
  const savedPlans = localStorage.getItem('adminPlans');
  
  if (savedPlans) {
    plans = JSON.parse(savedPlans);
  } else {
    // Demo data
    plans = [
      { id: 1, name: 'Weight Loss Basic', type: 'weight-loss', calories: 1500, duration: 7, assigned: 15 },
      { id: 2, name: 'Muscle Gain Pro', type: 'muscle-gain', calories: 2500, duration: 14, assigned: 10 },
      { id: 3, name: 'Maintenance Plan', type: 'maintenance', calories: 2000, duration: 7, assigned: 8 },
      { id: 4, name: 'Keto Diet Plan', type: 'keto', calories: 1800, duration: 21, assigned: 7 },
      { id: 5, name: 'Vegan Meal Plan', type: 'vegan', calories: 1600, duration: 7, assigned: 5 }
    ];
    localStorage.setItem('adminPlans', JSON.stringify(plans));
  }
  
  renderPlansTable();
}

// Render users table
function renderUsersTable() {
  const tbody = document.getElementById('usersTableBody');
  const emptyState = document.getElementById('usersEmpty');
  
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (users.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  
  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="user-cell">
          <div class="user-avatar">${user.name.charAt(0)}</div>
          <div>
            <div class="user-name">${user.name}</div>
            <div class="user-email">${user.email}</div>
          </div>
        </div>
      </td>
      <td>${capitalizeFirst(user.role)}</td>
      <td>${user.joined}</td>
      <td><span class="status-badge ${user.status}">${capitalizeFirst(user.status)}</span></td>
      <td>
        <div class="table-actions">
          <button class="edit-btn" title="Edit" onclick="editUser(${user.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" title="Delete" onclick="deleteUser(${user.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Render dietitians table
function renderDietitiansTable() {
  const tbody = document.getElementById('dietitiansTableBody');
  const emptyState = document.getElementById('dietitiansEmpty');
  
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (dietitians.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  
  dietitians.forEach(dietitian => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="user-cell">
          <div class="user-avatar dietitian">${dietitian.name.charAt(0)}</div>
          <div>
            <div class="user-name">${dietitian.name}</div>
            <div class="user-email">${dietitian.email}</div>
          </div>
        </div>
      </td>
      <td>${dietitian.specialty}</td>
      <td>${dietitian.patients}</td>
      <td><span class="status-badge ${dietitian.status}">${capitalizeFirst(dietitian.status)}</span></td>
      <td>
        <div class="table-actions">
          <button class="edit-btn" title="Edit" onclick="editDietitian(${dietitian.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" title="Delete" onclick="deleteDietitian(${dietitian.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Render plans table
function renderPlansTable() {
  const tbody = document.getElementById('plansTableBody');
  const emptyState = document.getElementById('plansEmpty');
  
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (plans.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  
  plans.forEach(plan => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${plan.name}</td>
      <td><span class="bmi-category ${getPlanTypeClass(plan.type)}">${capitalizeFirst(plan.type.replace('-', ' '))}</span></td>
      <td>${plan.calories}</td>
      <td>${plan.duration} days</td>
      <td>${plan.assigned}</td>
      <td>
        <div class="table-actions">
          <button class="view-btn" title="View" onclick="viewPlan(${plan.id})">
            <i class="fas fa-eye"></i>
          </button>
          <button class="edit-btn" title="Edit" onclick="editPlan(${plan.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" title="Delete" onclick="deletePlan(${plan.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Get plan type class
function getPlanTypeClass(type) {
  const classes = {
    'weight-loss': 'underweight',
    'muscle-gain': 'normal',
    'maintenance': 'normal',
    'keto': 'overweight',
    'vegan': 'normal'
  };
  return classes[type] || 'normal';
}

// CRUD Operations - Users
function addUser(event) {
  event.preventDefault();
  
  const name = document.getElementById('newUserName').value;
  const email = document.getElementById('newUserEmail').value;
  const role = document.getElementById('newUserRole').value;
  
  if (!name || !email) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    role: role,
    status: 'active',
    joined: new Date().toISOString().split('T')[0]
  };
  
  users.push(newUser);
  localStorage.setItem('adminUsers', JSON.stringify(users));
  renderUsersTable();
  updateAdminStats();
  
  closeModal('addUserModal');
  showToast('User added successfully!', 'success');
}

function editUser(userId) {
  const user = users.find(u => u.id === userId);
  if (user) {
    showToast(`Editing user: ${user.name}`, 'success');
    // In a real app, this would populate and open an edit modal
  }
}

function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    users = users.filter(u => u.id !== userId);
    localStorage.setItem('adminUsers', JSON.stringify(users));
    renderUsersTable();
    updateAdminStats();
    showToast('User deleted successfully!', 'success');
  }
}

// CRUD Operations - Dietitians
function addDietitian(event) {
  event.preventDefault();
  
  const name = document.getElementById('newDietitianName').value;
  const email = document.getElementById('newDietitianEmail').value;
  const specialty = document.getElementById('newDietitianSpecialty').value;
  
  if (!name || !email || !specialty) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  const newDietitian = {
    id: Date.now(),
    name: name,
    email: email,
    specialty: specialty,
    status: 'active',
    patients: 0
  };
  
  dietitians.push(newDietitian);
  localStorage.setItem('adminDietitians', JSON.stringify(dietitians));
  renderDietitiansTable();
  updateAdminStats();
  
  closeModal('addDietitianModal');
  showToast('Dietitian added successfully!', 'success');
}

function editDietitian(dietitianId) {
  const dietitian = dietitians.find(d => d.id === dietitianId);
  if (dietitian) {
    showToast(`Editing dietitian: ${dietitian.name}`, 'success');
  }
}

function deleteDietitian(dietitianId) {
  if (confirm('Are you sure you want to delete this dietitian?')) {
    dietitians = dietitians.filter(d => d.id !== dietitianId);
    localStorage.setItem('adminDietitians', JSON.stringify(dietitians));
    renderDietitiansTable();
    updateAdminStats();
    showToast('Dietitian deleted successfully!', 'success');
  }
}

// CRUD Operations - Plans
function viewPlan(planId) {
  const plan = plans.find(p => p.id === planId);
  if (plan) {
    showToast(`Viewing plan: ${plan.name}`, 'success');
  }
}

function editPlan(planId) {
  const plan = plans.find(p => p.id === planId);
  if (plan) {
    showToast(`Editing plan: ${plan.name}`, 'success');
  }
}

function deletePlan(planId) {
  if (confirm('Are you sure you want to delete this plan?')) {
    plans = plans.filter(p => p.id !== planId);
    localStorage.setItem('adminPlans', JSON.stringify(plans));
    renderPlansTable();
    updateAdminStats();
    showToast('Plan deleted successfully!', 'success');
  }
}

// Modal handling
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
    currentModal = modalId;
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    currentModal = null;
  }
}

// Close modal on outside click
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('show');
  }
});

// Search functionality
function searchTable(tableId) {
  const searchInput = document.getElementById(tableId + 'Search')
    || document.getElementById(tableId.replace('Table', '') + 'Search');
  const tbody = document.getElementById(tableId + 'Body');
  
  if (!tbody || !searchInput) return;

  const searchTerm = searchInput.value.toLowerCase();
  
  const rows = tbody.querySelectorAll('tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

// Initialize admin charts
function initAdminCharts() {
  initRoleDistributionChart();
  initMonthlyPlansChart();
  initActivityChart();
}

// Role distribution chart
function initRoleDistributionChart() {
  const ctx = document.getElementById('roleDistributionChart');
  if (!ctx) return;
  if (Chart.getChart(ctx)) return;
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Users', 'Dietitians', 'Admins'],
      datasets: [{
        data: [25, 8, 2],
        backgroundColor: ['#2ecc71', '#3498db', '#f39c12'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        }
      },
      cutout: '70%'
    }
  });
}

// Monthly plans chart
function initMonthlyPlansChart() {
  const ctx = document.getElementById('monthlyPlansChart');
  if (!ctx) return;
  if (Chart.getChart(ctx)) return;
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Plans Created',
        data: [12, 19, 15, 25, 22, 30],
        backgroundColor: '#2ecc71',
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// Activity chart
function initActivityChart() {
  const ctx = document.getElementById('activityChart');
  if (!ctx) return;
  if (Chart.getChart(ctx)) return;
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Active Users',
        data: [45, 52, 48, 60, 55, 30, 25],
        borderColor: '#2ecc71',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// Setup navigation
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      const section = this.getAttribute('data-section');
      showSection(section);
      
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

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.classList.toggle(
      'active',
      item.getAttribute('data-section') === sectionId
    );
  });
  
  updatePageTitle(sectionId);
}

// Update page title
function updatePageTitle(section) {
  const titles = {
    'home': { title: 'Dashboard', subtitle: 'Welcome back!' },
    'manage-users': { title: 'Manage Users', subtitle: 'CRUD operations for users' },
    'manage-dietitians': { title: 'Manage Dietitians', subtitle: 'CRUD operations for dietitians' },
    'manage-plans': { title: 'Manage Plans', subtitle: 'View and assign plans' },
    'reports': { title: 'Reports', subtitle: 'View analytics and reports' }
  };
  
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  
  if (titles[section]) {
    if (pageTitle) pageTitle.textContent = titles[section].title;
    if (pageSubtitle) pageSubtitle.textContent = titles[section].subtitle;
  }
}

function setupAdminHeader() {
  const currentDate = document.getElementById('currentDate');
  if (!currentDate) return;

  currentDate.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('show');
  }
}

// Capitalize first letter
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
