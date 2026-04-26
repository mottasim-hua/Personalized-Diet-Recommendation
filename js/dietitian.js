// ========================================
// Diet System - Dietitian Dashboard JavaScript
// ========================================

// Global variables
let assignedUsers = [];
let mealPlans = [];
let currentTab = 'breakfast';

// Initialize dietitian dashboard
document.addEventListener('DOMContentLoaded', function() {
  if (!window.location.href.includes('dietitian-dashboard.html')) return;
  
  loadDietitianData();
  loadAssignedUsers();
  loadMealPlans();
  setupNavigation();
  initDietitianCharts();
});

// Load dietitian data
function loadDietitianData() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  
  // Update user info
  const dietitianName = document.getElementById('dietitianName');
  const welcomeName = document.getElementById('welcomeName') || document.getElementById('heroDietitianName');
  const userAvatar = document.getElementById('userAvatar') || document.getElementById('dietitianAvatar');
  
  if (dietitianName) dietitianName.textContent = user.name;
  if (welcomeName) welcomeName.textContent = user.name;
  if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();
  
  // Load stats
  updateDietitianStats();
}

// Update dietitian stats
function updateDietitianStats() {
  const usersCount = document.getElementById('usersCount');
  const plansCount = document.getElementById('plansCount');
  const feedbackCount = document.getElementById('feedbackCount');
  
  // Load from localStorage or use demo data
  const users = JSON.parse(localStorage.getItem('assignedUsers') || '[]');
  const plans = JSON.parse(localStorage.getItem('mealPlans') || '[]');
  
  if (usersCount) usersCount.textContent = users.length || 5;
  if (plansCount) plansCount.textContent = plans.length || 12;
  if (feedbackCount) feedbackCount.textContent = 8;
}

// Load assigned users
function loadAssignedUsers() {
  const savedUsers = localStorage.getItem('assignedUsers');
  
  if (savedUsers) {
    assignedUsers = JSON.parse(savedUsers);
  } else {
    // Demo data
    assignedUsers = [
      { id: 1, name: 'John Smith', email: 'john@example.com', goal: 'Weight Loss', progress: 65, status: 'active' },
      { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', goal: 'Muscle Gain', progress: 45, status: 'active' },
      { id: 3, name: 'Mike Brown', email: 'mike@example.com', goal: 'Maintenance', progress: 80, status: 'completed' },
      { id: 4, name: 'Emily Davis', email: 'emily@example.com', goal: 'Weight Loss', progress: 30, status: 'active' },
      { id: 5, name: 'David Wilson', email: 'david@example.com', goal: 'Muscle Gain', progress: 55, status: 'active' }
    ];
    localStorage.setItem('assignedUsers', JSON.stringify(assignedUsers));
  }
  
  renderUsersTable();
}

// Render users table
function renderUsersTable() {
  const tbody = document.getElementById('usersTableBody');
  const emptyState = document.getElementById('usersEmpty');
  
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (assignedUsers.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  
  assignedUsers.forEach(user => {
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
      <td>${user.goal}</td>
      <td>
        <div class="progress-cell">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${user.progress}%"></div>
          </div>
          <span>${user.progress}%</span>
        </div>
      </td>
      <td><span class="status-badge ${user.status}">${capitalizeFirst(user.status)}</span></td>
      <td>
        <div class="table-actions">
          <button class="view-btn" title="View Profile" onclick="viewUserProfile(${user.id})">
            <i class="fas fa-eye"></i>
          </button>
          <button class="edit-btn" title="Create Plan" onclick="createPlanForUser(${user.id})">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Search users
function searchUsers() {
  const searchTerm = document.getElementById('userSearch').value.toLowerCase();
  const rows = document.querySelectorAll('#usersTableBody tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

// View user profile
function viewUserProfile(userId) {
  const user = assignedUsers.find(u => u.id === userId);
  if (user) {
    showToast(`Viewing profile for ${user.name}`, 'success');
    // In a real app, this would open a modal or navigate to profile page
  }
}

// Create plan for user
function createPlanForUser(userId) {
  const user = assignedUsers.find(u => u.id === userId);
  if (user) {
    // Switch to create plan section
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(nav => nav.classList.remove('active'));
    
    const createPlanNav = document.querySelector('[data-section="create-plan"]');
    if (createPlanNav) createPlanNav.classList.add('active');
    
    showSection('create-plan');
    
    // Pre-fill user name
    const planUserName = document.getElementById('planUserName');
    if (planUserName) planUserName.value = user.name;
    
    showToast(`Creating meal plan for ${user.name}`, 'success');
  }
}

// Load meal plans
function loadMealPlans() {
  const savedPlans = localStorage.getItem('mealPlans');
  
  if (savedPlans) {
    mealPlans = JSON.parse(savedPlans);
  } else {
    // Demo data
    mealPlans = [
      { id: 1, userId: 1, name: 'Weight Loss Plan A', calories: 1500, meals: 5, created: '2024-01-15' },
      { id: 2, userId: 2, name: 'Muscle Gain Plan B', calories: 2500, meals: 6, created: '2024-01-10' },
      { id: 3, userId: 3, name: 'Maintenance Plan', calories: 2000, meals: 4, created: '2024-01-08' }
    ];
    localStorage.setItem('mealPlans', JSON.stringify(mealPlans));
  }
}

// Show tab in meal plan form
function showTab(tabName) {
  currentTab = tabName;
  
  // Update tab buttons
  const tabs = document.querySelectorAll('.meal-tab');
  tabs.forEach(tab => {
    tab.classList.remove('active');
    if (tab.getAttribute('data-tab') === tabName) {
      tab.classList.add('active');
    }
  });
  
  // Update tab content
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(content => {
    content.classList.add('hidden');
    if (content.id === tabName + 'Tab') {
      content.classList.remove('hidden');
    }
  });
}

// Add meal item to plan
function addMealItem() {
  const mealType = currentTab;
  const foodName = document.getElementById('mealFoodName').value;
  const calories = document.getElementById('mealCalories').value;
  const protein = document.getElementById('mealProtein').value;
  const carbs = document.getElementById('mealCarbs').value;
  const fat = document.getElementById('mealFat').value;
  
  if (!foodName || !calories) {
    showToast('Please enter food name and calories', 'error');
    return;
  }
  
  const mealItem = {
    id: Date.now(),
    type: mealType,
    name: foodName,
    calories: parseInt(calories),
    protein: protein ? parseInt(protein) : 0,
    carbs: carbs ? parseInt(carbs) : 0,
    fat: fat ? parseInt(fat) : 0
  };
  
  // Add to localStorage or display in preview
  const previewList = document.getElementById(mealType + 'Preview');
  if (previewList) {
    const item = document.createElement('div');
    item.className = 'meal-item-preview';
    item.innerHTML = `
      <span>${foodName}</span>
      <span>${calories} kcal</span>
    `;
    previewList.appendChild(item);
  }
  
  // Clear form
  document.getElementById('mealFoodName').value = '';
  document.getElementById('mealCalories').value = '';
  document.getElementById('mealProtein').value = '';
  document.getElementById('mealCarbs').value = '';
  document.getElementById('mealFat').value = '';
  
  showToast('Meal item added to plan', 'success');
}

// Create meal plan
function createMealPlan(event) {
  event.preventDefault();
  
  const planName = document.getElementById('planName').value;
  const planUserName = document.getElementById('planUserName').value;
  const planCalories = document.getElementById('planCalories').value;
  const planDuration = document.getElementById('planDuration').value;
  
  if (!planName || !planUserName || !planCalories) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  const newPlan = {
    id: Date.now(),
    name: planName,
    userName: planUserName,
    calories: parseInt(planCalories),
    duration: planDuration || 7,
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    },
    created: new Date().toISOString().split('T')[0]
  };
  
  // Collect meal items from previews
  ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(type => {
    const preview = document.getElementById(type + 'Preview');
    if (preview) {
      const items = preview.querySelectorAll('.meal-item-preview');
      items.forEach(item => {
        const text = item.textContent;
        const match = text.match(/(.+?)(\d+)\s*kcal/);
        if (match) {
          newPlan.meals[type].push({
            name: match[1].trim(),
            calories: parseInt(match[2])
          });
        }
      });
    }
  });
  
  mealPlans.push(newPlan);
  localStorage.setItem('mealPlans', JSON.stringify(mealPlans));
  
  showToast('Meal plan created successfully!', 'success');
  
  // Clear form and previews
  document.getElementById('planName').value = '';
  document.getElementById('planUserName').value = '';
  document.getElementById('planCalories').value = '';
  document.getElementById('planDuration').value = '';
  
  ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(type => {
    const preview = document.getElementById(type + 'Preview');
    if (preview) preview.innerHTML = '';
  });
  
  updateDietitianStats();
}

// Send feedback
function sendFeedback(event) {
  event.preventDefault();
  
  const recipient = document.getElementById('feedbackRecipient').value;
  const subject = document.getElementById('feedbackSubject').value;
  const message = document.getElementById('feedbackMessage').value;
  
  if (!recipient || !subject || !message) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  
  // In a real app, this would send to an API
  showToast(`Feedback sent to ${recipient}!`, 'success');
  
  // Clear form
  document.getElementById('feedbackRecipient').value = '';
  document.getElementById('feedbackSubject').value = '';
  document.getElementById('feedbackMessage').value = '';
}

// Initialize dietitian charts
function initDietitianCharts() {
  initProgressChart();
  initUserGoalChart();
}

// Progress chart
function initProgressChart() {
  const ctx = document.getElementById('dietitianProgressChart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Average Progress',
        data: [20, 35, 50, 65],
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
          max: 100,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: function(value) {
              return value + '%';
            }
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

// User goal distribution chart
function initUserGoalChart() {
  const ctx = document.getElementById('userGoalChart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Weight Loss', 'Muscle Gain', 'Maintenance'],
      datasets: [{
        data: [40, 35, 25],
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
  
  updatePageTitle(sectionId);
}

// Update page title
function updatePageTitle(section) {
  const titles = {
    'home': { title: 'Dashboard', subtitle: 'Welcome back!' },
    'assigned-users': { title: 'Assigned Users', subtitle: 'Manage your patients' },
    'create-plan': { title: 'Create Meal Plan', subtitle: 'Create a new meal plan' },
    'feedback': { title: 'Feedback', subtitle: 'Send feedback to patients' }
  };
  
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  
  if (titles[section]) {
    if (pageTitle) pageTitle.textContent = titles[section].title;
    if (pageSubtitle) pageSubtitle.textContent = titles[section].subtitle;
  }
}

// Capitalize first letter
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
