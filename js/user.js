// ========================================
// Diet System - User Dashboard JavaScript
// ========================================

// Global variables
let foodLog = [];
let calorieLimit = 2000;
let totalCalories = 0;

// Initialize user dashboard
document.addEventListener('DOMContentLoaded', function() {
  if (!window.location.href.includes('user-dashboard.html')) return;
  
  loadUserData();
  loadFoodLog();
  setupNavigation();
  showSection('home');
  initWeeklyChart();
  updateCalorieDisplay();
});

// Load user data from localStorage
function loadUserData() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  
  // Update user info
  const userName = document.getElementById('userName');
  const welcomeName = document.getElementById('welcomeName') || document.getElementById('heroUserName');
  const userAvatar = document.getElementById('userAvatar');
  
  if (userName) userName.textContent = user.name;
  if (welcomeName) welcomeName.textContent = user.name;
  if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();
  
  // Load health data
  const healthData = localStorage.getItem('healthData');
  if (healthData) {
    const data = JSON.parse(healthData);
    document.getElementById('age').value = data.age || '';
    document.getElementById('gender').value = data.gender || '';
    document.getElementById('weight').value = data.weight || '';
    document.getElementById('height').value = data.height || '';
    document.getElementById('activityLevel').value = data.activityLevel || '';
    document.getElementById('dietaryPreference').value = data.dietaryPreference || '';
    document.getElementById('healthGoal').value = data.healthGoal || '';
    document.getElementById('calorieLimit').value = data.calorieLimit || 2000;
    
    if (data.weight && data.height) {
      calculateBMI();
    }
  }
  
  // Load calorie limit
  const savedLimit = localStorage.getItem('calorieLimit');
  if (savedLimit) {
    calorieLimit = parseInt(savedLimit);
    document.getElementById('calorieLimit').value = calorieLimit;
  }
}

// Calculate BMI
function calculateBMI() {
  const weight = parseFloat(document.getElementById('weight').value);
  const height = parseFloat(document.getElementById('height').value);
  const bmiDisplay = document.getElementById('bmiDisplay');
  const bmiValue = document.getElementById('bmiValue');
  const bmiCategory = document.getElementById('bmiCategory');
  const homeBmiValue = document.getElementById('homeBmiValue');
  
  if (weight && height) {
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    
    bmiDisplay.classList.remove('hidden');
    bmiDisplay.style.display = 'block';
    bmiValue.textContent = bmi;
    if (homeBmiValue) homeBmiValue.textContent = bmi;
    
    let category = '';
    let categoryClass = '';
    
    if (bmi < 18.5) {
      category = 'Underweight';
      categoryClass = 'underweight';
    } else if (bmi < 25) {
      category = 'Normal';
      categoryClass = 'normal';
    } else if (bmi < 30) {
      category = 'Overweight';
      categoryClass = 'overweight';
    } else {
      category = 'Obese';
      categoryClass = 'obese';
    }
    
    bmiCategory.textContent = category;
    bmiCategory.className = 'bmi-category ' + categoryClass;
  } else {
    bmiDisplay.classList.add('hidden');
    bmiDisplay.style.display = 'none';
    if (homeBmiValue) homeBmiValue.textContent = '--';
  }
}

// Save health data
function saveHealthData(event) {
  event.preventDefault();
  
  const healthData = {
    age: document.getElementById('age').value,
    gender: document.getElementById('gender').value,
    weight: document.getElementById('weight').value,
    height: document.getElementById('height').value,
    activityLevel: document.getElementById('activityLevel').value,
    dietaryPreference: document.getElementById('dietaryPreference').value,
    healthGoal: document.getElementById('healthGoal').value,
    calorieLimit: document.getElementById('calorieLimit').value
  };
  
  localStorage.setItem('healthData', JSON.stringify(healthData));
  localStorage.setItem('calorieLimit', healthData.calorieLimit);
  calorieLimit = parseInt(healthData.calorieLimit);
  
  showToast('Health data saved successfully!', 'success');
  updateCalorieDisplay();
}

// Load food log from localStorage
function loadFoodLog() {
  const savedLog = localStorage.getItem('foodLog');
  if (savedLog) {
    foodLog = JSON.parse(savedLog);
    renderFoodLog();
  }
}

// Add food entry
function addFoodEntry(event) {
  event.preventDefault();
  
  const mealType = document.getElementById('mealType').value;
  const foodName = document.getElementById('foodName').value;
  const calories = parseInt(document.getElementById('foodCalories').value);
  const quantity = parseInt(document.getElementById('foodQuantity').value);
  
  if (!foodName || !calories || !quantity) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  
  const entry = {
    id: Date.now(),
    mealType: mealType,
    foodName: foodName,
    calories: calories,
    quantity: quantity,
    date: new Date().toISOString().split('T')[0]
  };
  
  foodLog.push(entry);
  localStorage.setItem('foodLog', JSON.stringify(foodLog));
  
  // Clear form
  document.getElementById('foodName').value = '';
  document.getElementById('foodCalories').value = '';
  document.getElementById('foodQuantity').value = '1';
  
  renderFoodLog();
  updateCalorieDisplay();
  
  showToast('Food entry added!', 'success');
}

// Render food log table
function renderFoodLog() {
  const tbody = document.getElementById('foodLogBody');
  const emptyState = document.getElementById('foodLogEmpty');
  
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (foodLog.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  
  foodLog.forEach(entry => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="bmi-category ${getMealTypeClass(entry.mealType)}">${capitalizeFirst(entry.mealType)}</span></td>
      <td>${entry.foodName}</td>
      <td>${entry.calories}</td>
      <td>${entry.quantity}</td>
      <td>
        <div class="table-actions">
          <button class="delete-btn" title="Delete" onclick="deleteFoodEntry(${entry.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Get meal type class for styling
function getMealTypeClass(mealType) {
  const classes = {
    'breakfast': 'normal',
    'lunch': 'normal',
    'dinner': 'overweight',
    'snacks': 'underweight'
  };
  return classes[mealType] || 'normal';
}

// Delete food entry
function deleteFoodEntry(id) {
  foodLog = foodLog.filter(entry => entry.id !== id);
  localStorage.setItem('foodLog', JSON.stringify(foodLog));
  renderFoodLog();
  updateCalorieDisplay();
  showToast('Food entry deleted', 'success');
}

// Search food log
function searchFood() {
  const searchTerm = document.getElementById('foodSearch').value.toLowerCase();
  const rows = document.querySelectorAll('#foodLogBody tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

// Update calorie display
function updateCalorieDisplay() {
  // Calculate today's total calories
  const today = new Date().toISOString().split('T')[0];
  totalCalories = foodLog
    .filter(entry => entry.date === today)
    .reduce((sum, entry) => sum + (entry.calories * entry.quantity), 0);
  
  // Update stats
  const consumedEl = document.getElementById('caloriesConsumed');
  const remainingEl = document.getElementById('caloriesRemaining');
  const progressEl = document.getElementById('calorieProgress');
  const totalEl = document.getElementById('totalCalories');
  
  if (consumedEl) consumedEl.textContent = totalCalories;
  if (remainingEl) remainingEl.textContent = Math.max(0, calorieLimit - totalCalories);
  if (progressEl) progressEl.textContent = Math.round((totalCalories / calorieLimit) * 100) + '%';
  if (totalEl) totalEl.textContent = totalCalories;
  
  // Update progress ring
  updateProgressRing();
  
  // Check for calorie warning
  checkCalorieWarning();
}

// Update progress ring chart
function updateProgressRing() {
  const ring = document.getElementById('progressRing');
  const ringValue = document.getElementById('ringValue');
  
  if (!ring) return;
  
  const percentage = Math.min((totalCalories / calorieLimit) * 100, 100);
  const circumference = 2 * Math.PI * 80; // r = 80
  const offset = circumference - (percentage / 100) * circumference;
  
  ring.style.strokeDashoffset = offset;
  
  if (ringValue) {
    ringValue.textContent = Math.round(percentage) + '%';
  }
  
  // Change color based on percentage
  if (percentage > 100) {
    ring.style.stroke = '#e74c3c'; // Red
  } else if (percentage > 80) {
    ring.style.stroke = '#f39c12'; // Yellow
  } else {
    ring.style.stroke = '#2ecc71'; // Green
  }
}

// Check and show calorie warning
function checkCalorieWarning() {
  const warning = document.getElementById('calorieWarning');
  if (!warning) return;
  
  if (totalCalories > calorieLimit) {
    warning.classList.add('show');
  } else {
    warning.classList.remove('show');
  }
}

// Dismiss warning banner
function dismissWarning() {
  const warning = document.getElementById('calorieWarning');
  if (warning) {
    warning.classList.remove('show');
  }
}

// Initialize weekly chart
function initWeeklyChart() {
  const ctx = document.getElementById('weeklyChart');
  if (!ctx) return;
  
  // Generate sample data for the week
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = [1800, 2100, 1950, 2200, 1850, 2300, totalCalories || 0];
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{
        label: 'Calories',
        data: data,
        backgroundColor: data.map(cal => cal > calorieLimit ? '#e74c3c' : '#2ecc71'),
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
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.parsed.y + ' kcal';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: function(value) {
              return value + ' kcal';
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
  
  // Update stats
  updateReportStats(data);
}

// Update report section stats
function updateReportStats(data) {
  const avgCalories = document.getElementById('avgCalories');
  const daysTracked = document.getElementById('daysTracked');
  const streakDays = document.getElementById('streakDays');
  
  if (avgCalories) {
    const avg = Math.round(data.reduce((a, b) => a + b, 0) / data.length);
    avgCalories.textContent = avg;
  }
  
  if (daysTracked) {
    daysTracked.textContent = data.filter(d => d > 0).length;
  }
  
  if (streakDays) {
    // Calculate streak (consecutive days with entries)
    let streak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i] > 0) streak++;
      else break;
    }
    streakDays.textContent = streak;
  }
}

// Capitalize first letter
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Setup navigation
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

// Update page title
function updatePageTitle(section) {
  const titles = {
    'home': { title: 'Home', subtitle: 'Welcome back to your nutrition dashboard' },
    'health-data': { title: 'Health Data', subtitle: 'Manage your health information' },
    'food-tracker': { title: 'Food Tracker', subtitle: 'Track your daily meals' },
    'diet-plan': { title: 'Diet Plan', subtitle: 'Your personalized meal plan' },
    'reports': { title: 'Reports', subtitle: 'View your progress reports' }
  };
  
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  
  if (titles[section]) {
    if (pageTitle) pageTitle.textContent = titles[section].title;
    if (pageSubtitle) pageSubtitle.textContent = titles[section].subtitle;
  }
}
