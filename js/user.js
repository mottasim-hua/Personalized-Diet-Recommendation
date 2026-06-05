
const ML_PER_GLASS = 250;

let foodLog = [];
let calorieLimit = 2000;
let totalCalories = 0;
let weeklyChartInstance = null;
let waterTracker = getDefaultWaterTracker();
let dismissedWarningSignature = null;
let currentWarningSignature = null;

if (!window.storage) {
  window.storage = {
    get(key, fallback = undefined) {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;

      try {
        return JSON.parse(raw);
      } catch (error) {
        return raw;
      }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    remove(key) {
      localStorage.removeItem(key);
    }
  };
}

// Initialize user dashboard
document.addEventListener('DOMContentLoaded', function() {
  if (!window.location.href.includes('user-dashboard.html')) return;

  loadUserData();
  loadFoodLog();
  loadWaterTracker();
  setupNavigation();
  showSection('home');
  initializeDashboardControls();
  updateCalorieDisplay();
  updateWaterDisplay();
  initWeeklyChart();
});

function getDefaultWaterTracker() {
  return {
    unit: 'glasses',
    goalGlasses: 8,
    goalMl: 2000,
    entries: {}
  };
}

function getStorageNamespace() {
  const user = getCurrentUser();
  const identifier = user && (user.id || user.email || user.name) ? (user.id || user.email || user.name) : 'guest';
  return `dietSystem:${String(identifier).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
}

function getScopedStorageKey(key) {
  return `${getStorageNamespace()}:${key}`;
}

function readLegacyStorageValue(key) {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    return raw;
  }
}

function getStoredValue(key, fallback, legacyKey) {
  const scopedValue = window.storage.get(getScopedStorageKey(key));
  if (scopedValue !== undefined) return scopedValue;

  if (legacyKey) {
    const legacyValue = readLegacyStorageValue(legacyKey);
    if (legacyValue !== null) {
      window.storage.set(getScopedStorageKey(key), legacyValue);
      return legacyValue;
    }
  }

  return fallback;
}

function setStoredValue(key, value, legacyKey) {
  window.storage.set(getScopedStorageKey(key), value);

  if (!legacyKey) return;

  if (typeof value === 'string') {
    localStorage.setItem(legacyKey, value);
  } else {
    localStorage.setItem(legacyKey, JSON.stringify(value));
  }
}

function getTodayKey() {
  return new Date().toLocaleDateString('en-CA');
}

function normalizePositiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatWaterAmount(value, unit) {
  if (unit === 'ml') {
    return `${Math.round(value)} ml`;
  }

  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)} glasses`;
}

function getTodayWaterMl() {
  return Number(waterTracker.entries[getTodayKey()] || 0);
}

function getWaterGoalForUnit(unit) {
  return unit === 'ml'
    ? normalizePositiveNumber(waterTracker.goalMl, 2000)
    : normalizePositiveNumber(waterTracker.goalGlasses, 8);
}

function getWaterGoalMl() {
  return waterTracker.unit === 'ml'
    ? normalizePositiveNumber(waterTracker.goalMl, 2000)
    : normalizePositiveNumber(waterTracker.goalGlasses, 8) * ML_PER_GLASS;
}

function getHydrationMessage(progressPercent) {
  if (progressPercent >= 100) return 'Goal reached! 🎉';
  if (progressPercent >= 50) return 'Halfway there!';
  if (progressPercent >= 25) return 'Nice progress, keep sipping.';
  return 'Stay hydrated! 💧';
}

function setBadgeState(element, text, state) {
  if (!element) return;

  element.textContent = text;
  element.className = 'status-badge';

  if (state === 'warning') {
    element.classList.add('warning-badge');
  } else if (state === 'danger') {
    element.classList.add('danger-badge');
  } else {
    element.classList.add('on-track');
  }
}

// Load user data from storage
function loadUserData() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  const userName = document.getElementById('userName');
  const welcomeName = document.getElementById('welcomeName') || document.getElementById('heroUserName');
  const userAvatar = document.getElementById('userAvatar');

  if (userName) userName.textContent = user.name;
  if (welcomeName) welcomeName.textContent = user.name;
  if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();

  const healthData = getStoredValue('healthData', {}, 'healthData');
  document.getElementById('age').value = healthData.age || '';
  document.getElementById('gender').value = healthData.gender || '';
  document.getElementById('weight').value = healthData.weight || '';
  document.getElementById('height').value = healthData.height || '';
  document.getElementById('activityLevel').value = healthData.activityLevel || '';
  document.getElementById('dietaryPreference').value = healthData.dietaryPreference || '';
  document.getElementById('healthGoal').value = healthData.healthGoal || '';

  const storedLimit = getStoredValue('calorieLimit', healthData.calorieLimit || 2000, 'calorieLimit');
  calorieLimit = normalizePositiveNumber(storedLimit, 2000);
  syncCalorieGoalInputs();

  if (healthData.weight && healthData.height) {
    calculateBMI();
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

function buildHealthDataPayload() {
  return {
    age: document.getElementById('age').value,
    gender: document.getElementById('gender').value,
    weight: document.getElementById('weight').value,
    height: document.getElementById('height').value,
    activityLevel: document.getElementById('activityLevel').value,
    dietaryPreference: document.getElementById('dietaryPreference').value,
    healthGoal: document.getElementById('healthGoal').value,
    calorieLimit: calorieLimit
  };
}

function persistHealthData() {
  setStoredValue('healthData', buildHealthDataPayload(), 'healthData');
  setStoredValue('calorieLimit', String(calorieLimit), 'calorieLimit');
}

// Save health data
function saveHealthData(event) {
  event.preventDefault();

  persistHealthData();
  calculateBMI();
  updateCalorieDisplay();
  showToast('Health data saved successfully!', 'success');
}

function syncCalorieGoalInputs() {
  const homeInput = document.getElementById('homeCalorieGoal');
  const healthInput = document.getElementById('calorieLimit');

  if (homeInput) homeInput.value = calorieLimit;
  if (healthInput) healthInput.value = calorieLimit;
}

function updateCalorieGoal(value) {
  const parsedGoal = normalizePositiveNumber(value, null);
  if (!parsedGoal) return;

  calorieLimit = Math.round(parsedGoal);
  syncCalorieGoalInputs();
  persistHealthData();
  updateCalorieDisplay();
}

// Load food log from storage
function loadFoodLog() {
  const savedLog = getStoredValue('foodLog', [], 'foodLog');
  foodLog = Array.isArray(savedLog) ? savedLog : [];
  renderFoodLog();
}

function saveFoodLog() {
  setStoredValue('foodLog', foodLog, 'foodLog');
}

function loadWaterTracker() {
  const savedTracker = getStoredValue('waterTracker', getDefaultWaterTracker(), 'waterTracker');
  waterTracker = {
    ...getDefaultWaterTracker(),
    ...(savedTracker || {}),
    entries: savedTracker && typeof savedTracker.entries === 'object' ? savedTracker.entries : {}
  };
}

function saveWaterTracker() {
  setStoredValue('waterTracker', waterTracker, 'waterTracker');
}

function initializeDashboardControls() {
  const homeCalorieGoal = document.getElementById('homeCalorieGoal');
  const healthCalorieGoal = document.getElementById('calorieLimit');
  const waterGoalInput = document.getElementById('waterGoalInput');

  [homeCalorieGoal, healthCalorieGoal].forEach(input => {
    if (!input) return;

    input.addEventListener('input', function() {
      updateCalorieGoal(this.value);
    });

    input.addEventListener('blur', syncCalorieGoalInputs);
  });

  if (waterGoalInput) {
    waterGoalInput.addEventListener('input', function() {
      updateWaterGoal(this.value);
    });
  }
}

// Add food entry
function addFoodEntry(event) {
  event.preventDefault();

  const mealType = document.getElementById('mealType').value;
  const foodName = document.getElementById('foodName').value.trim();
  const calories = parseInt(document.getElementById('foodCalories').value, 10);
  const quantity = parseInt(document.getElementById('foodQuantity').value, 10);

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
    date: getTodayKey()
  };

  foodLog.push(entry);
  saveFoodLog();

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

  [...foodLog].reverse().forEach(entry => {
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
    breakfast: 'normal',
    lunch: 'normal',
    dinner: 'overweight',
    snacks: 'underweight'
  };
  return classes[mealType] || 'normal';
}

// Delete food entry
function deleteFoodEntry(id) {
  foodLog = foodLog.filter(entry => entry.id !== id);
  saveFoodLog();
  renderFoodLog();
  updateCalorieDisplay();
  showToast('Food entry deleted', 'success');
}

function resetTodayFoodLog() {
  const today = getTodayKey();
  const hasEntries = foodLog.some(entry => entry.date === today);

  if (!hasEntries) {
    showToast('No food entries found for today', 'error');
    return;
  }

  foodLog = foodLog.filter(entry => entry.date !== today);
  saveFoodLog();
  renderFoodLog();
  updateCalorieDisplay();
  showToast('Today\'s food log has been reset', 'success');
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

// Update calorie display with enhanced real-time feedback
function updateCalorieDisplay() {
  const today = getTodayKey();
  totalCalories = foodLog
    .filter(entry => entry.date === today)
    .reduce((sum, entry) => sum + (entry.calories * entry.quantity), 0);

  const safeGoal = normalizePositiveNumber(calorieLimit, 2000);
  const consumedEl = document.getElementById('caloriesConsumed');
  const remainingEl = document.getElementById('caloriesRemaining');
  const progressEl = document.getElementById('calorieProgress');
  const totalEl = document.getElementById('totalCalories');
  const summaryEl = document.getElementById('calorieGoalSummary');
  const fillEl = document.getElementById('calorieGoalFill');
  const percentEl = document.getElementById('calorieCardPercent');
  const remainingSummaryEl = document.getElementById('calorieGoalRemaining');
  const statusEl = document.getElementById('calorieGoalStatus');
  const miniLabelEl = document.getElementById('miniCalorieLabel');
  const cardConsumedEl = document.getElementById('calorieCardConsumed');
  const cardRemainingEl = document.getElementById('calorieCardRemaining');
  const legacyPercentEl = document.getElementById('calorieGoalPercent');

  const rawPercent = (totalCalories / safeGoal) * 100;
  const progressPercent = Math.round(rawPercent);
  const boundedPercent = Math.min(rawPercent, 100);
  const remainingCalories = Math.max(0, safeGoal - totalCalories);
  const excessCalories = Math.max(0, totalCalories - safeGoal);

  // Update all calorie displays
  if (consumedEl) consumedEl.textContent = totalCalories;
  if (remainingEl) remainingEl.textContent = remainingCalories;
  if (progressEl) progressEl.textContent = `${progressPercent}%`;
  if (totalEl) totalEl.textContent = totalCalories;
  if (summaryEl) summaryEl.textContent = `${totalCalories} of ${safeGoal} kcal consumed`;
  if (percentEl) percentEl.textContent = `${progressPercent}%`;
  if (cardConsumedEl) cardConsumedEl.textContent = totalCalories;
  if (cardRemainingEl) cardRemainingEl.textContent = remainingCalories;
  if (legacyPercentEl) legacyPercentEl.textContent = `${progressPercent}%`;
  if (remainingSummaryEl) {
    remainingSummaryEl.textContent = excessCalories > 0
      ? `${excessCalories} kcal over goal`
      : `${remainingCalories} kcal remaining`;
  }
  if (miniLabelEl) miniLabelEl.textContent = `${totalCalories} / ${safeGoal} kcal`;

  // Update progress bar with smooth animation
  if (fillEl) {
    fillEl.style.width = `${Math.max(0, boundedPercent)}%`;
    fillEl.classList.remove('warning-fill', 'danger-fill');

    if (rawPercent >= 100) {
      fillEl.classList.add('danger-fill');
    } else if (rawPercent >= 80) {
      fillEl.classList.add('warning-fill');
    }
  }

  // Update status badge
  if (statusEl) {
    if (rawPercent >= 100) {
      setBadgeState(statusEl, 'Limit Reached ⚠️', 'danger');
    } else if (rawPercent >= 80) {
      setBadgeState(statusEl, 'Almost There ⚠️', 'warning');
    } else {
      setBadgeState(statusEl, 'On Track ✓', 'success');
    }
  }

  updateMiniCalorieRing(rawPercent);
  if (statusEl) {
    if (rawPercent >= 100) {
      setBadgeState(statusEl, 'Limit Reached', 'danger');
    } else if (rawPercent >= 80) {
      setBadgeState(statusEl, 'Almost There', 'warning');
    } else {
      setBadgeState(statusEl, 'On Track', 'success');
    }
  }
  checkCalorieWarning(rawPercent);
  initWeeklyChart();
}

function updateMiniCalorieRing(progressPercent) {
  const miniRing = document.getElementById('miniCalorieRing');
  if (!miniRing) return;

  const boundedPercent = Math.min(progressPercent, 100);
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (boundedPercent / 100) * circumference;

  miniRing.style.strokeDasharray = `${circumference}`;
  miniRing.style.strokeDashoffset = `${offset}`;
  miniRing.style.stroke = progressPercent >= 100 ? '#e74c3c' : progressPercent >= 80 ? '#f39c12' : '#95d5b2';
}

// Enhanced calorie warning with visual feedback
function checkCalorieWarning(progressPercent) {
  const warning = document.getElementById('calorieWarning');
  const warningText = document.getElementById('calorieWarningText');
  const inlineWarning = document.getElementById('inlineCalorieWarning');
  const inlineWarningText = document.getElementById('inlineCalorieWarningText');
  if (!warning || !warningText) return;

  // Hide warning if below threshold
  if (progressPercent < 100) {
    warning.classList.remove('show', 'near-limit');
    if (inlineWarning) inlineWarning.classList.add('hidden');
    currentWarningSignature = null;
    dismissedWarningSignature = null;
    return;
  }

  // Determine warning type
  const isExceeded = totalCalories > calorieLimit;
  const excessAmount = Math.max(0, totalCalories - calorieLimit);
  
  currentWarningSignature = `${getTodayKey()}:${calorieLimit}:${totalCalories}:${isExceeded ? 'exceeded' : 'limit'}`;

  // Update warning appearance
  warning.classList.toggle('near-limit', !isExceeded);
  
  // Generate dynamic message
  if (isExceeded) {
    const message = `⚠️ You've exceeded your daily calorie limit by ${excessAmount} kcal!`;
    warningText.textContent = message;
    if (inlineWarningText) inlineWarningText.textContent = message;
  } else {
    const message = '⚠️ You\'ve reached your daily calorie limit!';
    warningText.textContent = message;
    if (inlineWarningText) inlineWarningText.textContent = message;
  }

  if (inlineWarning) {
    inlineWarning.classList.remove('hidden');
  }

  // Show or hide based on dismissal state
  if (dismissedWarningSignature === currentWarningSignature) {
    warning.classList.remove('show');
    return;
  }

  warning.classList.add('show');
  
  // Auto-animate the banner
  if (warning.style.animation !== 'slideInDown 0.4s ease-out') {
    warning.style.animation = 'slideInDown 0.4s ease-out';
  }
}

// Dismiss warning banner
function dismissWarning() {
  const warning = document.getElementById('calorieWarning');
  dismissedWarningSignature = currentWarningSignature;

  if (warning) {
    warning.classList.remove('show');
  }
}

function setWaterUnit(unit) {
  waterTracker.unit = unit === 'ml' ? 'ml' : 'glasses';
  saveWaterTracker();
  updateWaterDisplay();
}

function updateWaterGoal(value) {
  const parsedGoal = normalizePositiveNumber(value, null);
  if (!parsedGoal) return;

  if (waterTracker.unit === 'ml') {
    waterTracker.goalMl = Math.round(parsedGoal);
  } else {
    waterTracker.goalGlasses = Math.round(parsedGoal * 10) / 10;
  }

  saveWaterTracker();
  updateWaterDisplay();
}

function addWaterByMl(amountMl) {
  const today = getTodayKey();
  const nextValue = Math.max(0, getTodayWaterMl() + amountMl);

  waterTracker.entries[today] = Math.round(nextValue * 10) / 10;
  saveWaterTracker();
  updateWaterDisplay();
}

function quickAddWater(amountMl) {
  addWaterByMl(amountMl || ML_PER_GLASS);
  
  // Add visual feedback
  const button = event?.target;
  if (button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 100);
  }
}

function addManualWater() {
  const input = document.getElementById('waterManualAmount');
  if (!input) return;

  const manualAmount = parseFloat(input.value);
  if (!manualAmount || manualAmount <= 0) {
    showToast('Enter a valid water amount', 'error');
    return;
  }

  const amountMl = waterTracker.unit === 'ml'
    ? manualAmount
    : manualAmount * ML_PER_GLASS;

  addWaterByMl(amountMl);
  input.value = '';
  showToast('Water intake updated', 'success');
}

function resetWaterToday() {
  const today = getTodayKey();
  waterTracker.entries[today] = 0;
  saveWaterTracker();
  updateWaterDisplay();
  showToast('Today\'s water intake has been reset', 'success');
}

function updateWaterDisplay() {
  const activeUnit = waterTracker.unit;
  const consumedMl = getTodayWaterMl();
  const consumedValue = activeUnit === 'ml' ? consumedMl : consumedMl / ML_PER_GLASS;
  const goalValue = getWaterGoalForUnit(activeUnit);
  const goalMl = getWaterGoalMl();
  const progressPercent = goalMl > 0 ? Math.round((consumedMl / goalMl) * 100) : 0;
  const boundedPercent = Math.min(progressPercent, 100);

  const glassesToggle = document.getElementById('waterUnitGlasses');
  const mlToggle = document.getElementById('waterUnitMl');
  const consumedDisplay = document.getElementById('waterConsumedDisplay');
  const goalDisplay = document.getElementById('waterGoalDisplay');
  const progressFill = document.getElementById('waterProgressFill');
  const progressPercentEl = document.getElementById('waterCardPercent');
  const progressMetaEl = document.getElementById('waterProgressMeta');
  const progressLabelEl = document.getElementById('waterProgressLabel');
  const motivationEl = document.getElementById('waterMotivation');
  const statusBadge = document.getElementById('waterStatusBadge');
  const statusBadgeInline = document.getElementById('waterStatusBadgeInline');
  const goalInput = document.getElementById('waterGoalInput');
  const manualInput = document.getElementById('waterManualAmount');
  const legacyProgressPercentEl = document.getElementById('waterProgressPercent');

  // Update toggle buttons
  if (glassesToggle) glassesToggle.classList.toggle('active', activeUnit === 'glasses');
  if (mlToggle) mlToggle.classList.toggle('active', activeUnit === 'ml');
  
  // Update displays with smooth animation
  if (consumedDisplay) consumedDisplay.textContent = formatWaterAmount(consumedValue, activeUnit);
  if (goalDisplay) goalDisplay.textContent = `Goal: ${formatWaterAmount(goalValue, activeUnit)}`;
  if (progressPercentEl) progressPercentEl.textContent = `${progressPercent}%`;
  if (progressLabelEl) progressLabelEl.textContent = formatWaterAmount(consumedValue, activeUnit);
  if (legacyProgressPercentEl) legacyProgressPercentEl.textContent = `${progressPercent}%`;
  if (progressMetaEl) {
    progressMetaEl.textContent = `${formatWaterAmount(consumedValue, activeUnit)} of ${formatWaterAmount(goalValue, activeUnit)}`;
  }
  
  // Update motivational message with dynamic feedback
  if (motivationEl) {
    motivationEl.textContent = getHydrationMessage(progressPercent);
    motivationEl.style.animation = 'none';
    setTimeout(() => {
      motivationEl.style.animation = 'fadeInScale 0.3s ease-out';
    }, 10);
  }
  
  if (goalInput) goalInput.value = goalValue;
  if (manualInput) {
    manualInput.placeholder = activeUnit === 'ml' ? 'Enter ml' : 'Enter glasses';
    manualInput.step = activeUnit === 'ml' ? '50' : '0.5';
  }

  // Update progress bar with color transition
  if (progressFill) {
    progressFill.style.width = `${Math.max(0, boundedPercent)}%`;
    progressFill.style.transition = 'width 0.3s ease, background-color 0.3s ease';
    
    // Dynamic color based on progress
    if (progressPercent >= 100) {
      progressFill.style.backgroundColor = '#2ecc71'; // Green for goal reached
    } else if (progressPercent >= 75) {
      progressFill.style.backgroundColor = '#f39c12'; // Amber for almost there
    } else if (progressPercent >= 50) {
      progressFill.style.backgroundColor = '#3498db'; // Blue for halfway
    } else {
      progressFill.style.backgroundColor = '#95d5b2'; // Light green for starting
    }
  }

  // Update status badge with celebratory message
  if (statusBadge) {
    if (progressPercent >= 100) {
      setBadgeState(statusBadge, 'Goal Reached! 🎉', 'success');
    } else if (progressPercent >= 50) {
      setBadgeState(statusBadge, 'Halfway There! 💪', 'warning');
    } else {
      setBadgeState(statusBadge, 'Stay Hydrated! 💧', 'success');
    }
  }
  if (statusBadge) {
    if (progressPercent >= 100) {
      setBadgeState(statusBadge, 'Goal Reached', 'success');
    } else if (progressPercent >= 50) {
      setBadgeState(statusBadge, 'Halfway There', 'warning');
    } else {
      setBadgeState(statusBadge, 'Stay Hydrated', 'success');
    }
  }

  if (statusBadgeInline) {
    if (progressPercent >= 100) {
      setBadgeState(statusBadgeInline, 'Goal Reached', 'success');
    } else if (progressPercent >= 50) {
      setBadgeState(statusBadgeInline, 'Halfway There', 'warning');
    } else {
      setBadgeState(statusBadgeInline, 'Stay Hydrated', 'success');
    }
  }
}

function buildWeeklyCalorieData() {
  const days = [];

  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const key = date.toLocaleDateString('en-CA');
    const label = date.toLocaleDateString('en-US', { weekday: 'short' });
    const calories = foodLog
      .filter(entry => entry.date === key)
      .reduce((sum, entry) => sum + (entry.calories * entry.quantity), 0);

    days.push({ key, label, calories });
  }

  return days;
}

// Initialize weekly chart
function initWeeklyChart() {
  const ctx = document.getElementById('weeklyChart');
  if (!ctx) return;

  const weeklyData = buildWeeklyCalorieData();
  const labels = weeklyData.map(day => day.label);
  const data = weeklyData.map(day => day.calories);

  if (!weeklyChartInstance) {
    weeklyChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Calories',
          data: data,
          backgroundColor: data.map(calories => calories >= calorieLimit ? '#e74c3c' : '#2ecc71'),
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
                return `${context.parsed.y} kcal`;
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
                return `${value} kcal`;
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
  } else {
    weeklyChartInstance.data.labels = labels;
    weeklyChartInstance.data.datasets[0].data = data;
    weeklyChartInstance.data.datasets[0].backgroundColor = data.map(calories => calories >= calorieLimit ? '#e74c3c' : '#2ecc71');
    weeklyChartInstance.update();
  }

  updateReportStats(data);
}

// Update report section stats
function updateReportStats(data) {
  const avgCalories = document.getElementById('avgCalories');
  const daysTracked = document.getElementById('daysTracked');
  const streakDays = document.getElementById('streakDays');

  if (avgCalories) {
    const avg = data.length ? Math.round(data.reduce((a, b) => a + b, 0) / data.length) : 0;
    avgCalories.textContent = avg;
  }

  if (daysTracked) {
    daysTracked.textContent = data.filter(dayCalories => dayCalories > 0).length;
  }

  if (streakDays) {
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
    home: { title: 'Home', subtitle: 'Welcome back to your nutrition dashboard' },
    'health-data': { title: 'Health Data', subtitle: 'Manage your health information' },
    'food-tracker': { title: 'Food Tracker', subtitle: 'Track your daily meals' },
    'diet-plan': { title: 'Diet Plan', subtitle: 'Your personalized meal plan' },
    reports: { title: 'Reports', subtitle: 'View your progress reports' }
  };

  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');

  if (titles[section]) {
    if (pageTitle) pageTitle.textContent = titles[section].title;
    if (pageSubtitle) pageSubtitle.textContent = titles[section].subtitle;
  }
}
