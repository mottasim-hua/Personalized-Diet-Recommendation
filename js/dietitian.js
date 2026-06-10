const isServerMode = true;
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

const API_BASE_URL = (() => {
  const override = window.DIET_SYSTEM_API_BASE_URL || localStorage.getItem('dietSystemApiBaseUrl');
  const scriptBase = document.currentScript?.src && !document.currentScript.src.startsWith('file:')
    ? new URL('../', document.currentScript.src).toString()
    : null;
  if (override && !String(override).startsWith('file:')) return override;
  if (scriptBase) return scriptBase;
  if (window.location.protocol !== 'file:') return new URL('./', window.location.href).toString();
  const localProjectBase = getLocalProjectBaseCandidates()[0];
  if (localProjectBase) return localProjectBase;
  return 'http://localhost:8000/';
})();

let assignedUsers = [];
let mealPlans = [];
let feedbackEntries = [];
let currentSessionUser = null;

let editingUserId = null;
let editingPlanId = null;
let confirmAction = null;

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

document.addEventListener('DOMContentLoaded', function () {
  if (!window.location.href.includes('dietitian-dashboard.html')) return;
  initializeDietitianDashboard();
});

async function initializeDietitianDashboard() {
  await ensureServerSession();
  loadDietitianData();
  bindDietitianEvents();
  resetMealPlanForm();
  await loadDietitianDataStore();
  refreshDietitianUI();
}

function loadDietitianData() {
  const user = currentSessionUser || getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  const dietitian = user;

  [document.getElementById('dietitianName'), document.getElementById('heroDietitianName')].forEach(el => {
    if (el) el.textContent = dietitian.name;
  });

  const avatar = document.getElementById('dietitianAvatar');
  if (avatar) avatar.textContent = getInitials(dietitian.name);

  const heroDateLine = document.getElementById('heroDateLine');
  if (heroDateLine) {
    heroDateLine.textContent = `Today is ${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })}. Stay on top of care plans, user updates, and pending reviews.`;
  }
}

async function ensureServerSession() {
  try {
    const status = await apiRequest('api/auth/status.php');
    const sessionUser = status?.data || {};

    if (!sessionUser.authenticated || sessionUser.role !== 'dietitian') {
      localStorage.removeItem('dietSystemUser');
      currentSessionUser = null;
      window.location.href = 'index.html';
      return;
    }

    currentSessionUser = {
      id: sessionUser.user_id,
      name: sessionUser.name,
      email: sessionUser.email,
      role: sessionUser.role
    };

    localStorage.setItem('dietSystemUser', JSON.stringify({
      ...currentSessionUser,
      loginTime: new Date().toISOString()
    }));
  } catch (error) {
    localStorage.removeItem('dietSystemUser');
    currentSessionUser = null;
    window.location.href = 'index.html';
  }
}

function bindDietitianEvents() {
  [document.getElementById('userSearch'), document.getElementById('goalFilter'), document.getElementById('dietFilter'), document.getElementById('statusFilter')].forEach(input => {
    if (input) input.addEventListener('input', renderUsersTable);
  });

  [document.getElementById('feedbackUserFilter'), document.getElementById('feedbackStatusFilter')].forEach(input => {
    if (input) input.addEventListener('input', renderFeedbackList);
  });

  document.getElementById('generateDaysBtn')?.addEventListener('click', function () {
    renderMealBuilder(Number(document.getElementById('planDays').value || 1));
  });

  document.getElementById('resetPlanBtn')?.addEventListener('click', resetMealPlanForm);
  document.getElementById('userForm')?.addEventListener('submit', handleUserSubmit);
  document.getElementById('mealPlanForm')?.addEventListener('submit', handlePlanSubmit);
  document.getElementById('userModalBackdrop')?.addEventListener('click', closeUserModal);
  document.getElementById('userDrawerBackdrop')?.addEventListener('click', closeUserDrawer);
  document.getElementById('confirmBackdrop')?.addEventListener('click', closeConfirmModal);
  document.getElementById('confirmActionBtn')?.addEventListener('click', async function () {
    if (typeof confirmAction === 'function') {
      await confirmAction();
    }
    closeConfirmModal();
  });
}

async function loadDietitianDataStore() {
  try {
    const [patientsRes, plansRes, feedbackRes] = await Promise.all([
      apiRequest('api/dietitian/patients.php'),
      apiRequest('api/dietitian/meal_plan.php'),
      apiRequest('api/dietitian/feedback.php')
    ]);

    assignedUsers = (patientsRes.data || []).map(mapPatientFromApi);
    mealPlans = (plansRes.data || []).map(mapPlanFromApi);
    feedbackEntries = (feedbackRes.data || []).map(mapFeedbackFromApi);
  } catch (error) {
    assignedUsers = [];
    mealPlans = [];
    feedbackEntries = [];
    refreshDietitianUI();
    showToast(error.message || 'Server data could not be loaded.', 'error');
  }
}

function refreshDietitianUI() {
  updateDietitianStats();
  populatePlanUserOptions();
  populateFeedbackUserOptions();
  renderHomeActivity();
  renderUsersTable();
  renderPlansList();
  renderFeedbackList();
}

function updateDietitianStats() {
  setText('usersCount', assignedUsers.length);
  setText('plansCount', mealPlans.length);
  setText('feedbackCount', feedbackEntries.filter(item => item.status === 'Pending').length);
  setText('activePlansCount', mealPlans.filter(plan => plan.status === 'Active').length);
}

function renderHomeActivity() {
  const activityFeed = document.getElementById('activityFeed');
  if (!activityFeed) return;

  const activity = [
    ...assignedUsers.map(user => ({ icon: 'fa-user-plus', text: `${user.name} is assigned with a ${String(user.goal || 'care').toLowerCase()} goal.`, time: user.createdAt })),
    ...mealPlans.map(plan => ({ icon: 'fa-clipboard-list', text: `${plan.planName} was linked to ${getUserName(plan.userId)}.`, time: plan.createdAt })),
    ...feedbackEntries.map(entry => ({ icon: 'fa-comment-medical', text: `Feedback for ${getUserName(entry.userId)} is ${String(entry.status || '').toLowerCase()}.`, time: entry.createdAt }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

  activityFeed.innerHTML = activity.map(item => `
    <div class="activity-item">
      <div class="activity-icon"><i class="fas ${item.icon}"></i></div>
      <div>
        <strong>${escapeHtml(item.text)}</strong>
        <p>${formatDateTime(item.time)}</p>
      </div>
    </div>
  `).join('');
}

function renderUsersTable() {
  const tbody = document.getElementById('usersTableBody');
  const emptyState = document.getElementById('usersEmpty');
  if (!tbody) return;

  const filteredUsers = getFilteredUsers();
  tbody.innerHTML = '';

  if (!filteredUsers.length) {
    emptyState?.classList.remove('hidden');
    return;
  }

  emptyState?.classList.add('hidden');

  filteredUsers.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="patient-cell">
          <div class="patient-avatar">${getInitials(user.name)}</div>
          <div>
            <div class="patient-name">${escapeHtml(user.name)}</div>
            <div class="patient-email">${escapeHtml(`${user.weight} kg • ${user.height} cm`)}</div>
          </div>
        </div>
      </td>
      <td>${escapeHtml(user.age)}</td>
      <td>${escapeHtml(user.goal)}</td>
      <td>${escapeHtml(user.dietType)}</td>
      <td><span class="status-badge ${String(user.status).toLowerCase()}">${escapeHtml(user.status)}</span></td>
      <td>
        <div class="table-actions">
          <button class="view-btn" type="button" onclick="viewUserProfile(${user.id})"><i class="fas fa-eye"></i></button>
          <button class="edit-btn" type="button" onclick="editUser(${user.id})"><i class="fas fa-edit"></i></button>
          <button class="delete-btn" type="button" onclick="confirmDeleteUser(${user.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function renderPlansList() {
  const plansList = document.getElementById('plansList');
  if (!plansList) return;

  if (!mealPlans.length) {
    plansList.innerHTML = `<div class="card empty-inline"><i class="fas fa-clipboard-list"></i><p>No meal plans yet. Create your first one above.</p></div>`;
    return;
  }

  plansList.innerHTML = mealPlans.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(plan => {
    const totalMeals = (plan.days || []).reduce((sum, day) => sum + mealTypes.reduce((count, type) => count + ((day.meals?.[type] || []).length), 0), 0);
    return `
      <div class="card plan-card">
        <div class="plan-card-header">
          <div>
            <h3>${escapeHtml(plan.planName)}</h3>
            <p>${escapeHtml(getUserName(plan.userId))} • ${formatDate(plan.startDate)} to ${formatDate(plan.endDate)}</p>
          </div>
          <span class="status-badge active">${escapeHtml(plan.status)}</span>
        </div>
        <div class="plan-summary-grid">
          <div class="plan-summary-box"><strong>${escapeHtml(plan.calorieTarget)} kcal/day</strong><span class="text-muted">Daily calorie target</span></div>
          <div class="plan-summary-box"><strong>${totalMeals} meal entries</strong><span class="text-muted">Across ${(plan.days || []).length} day(s)</span></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" onclick="editPlan(${plan.id})"><i class="fas fa-pen"></i> Edit</button>
          <button type="button" class="btn" onclick="confirmDeletePlan(${plan.id})"><i class="fas fa-trash"></i> Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderFeedbackList() {
  const feedbackList = document.getElementById('feedbackList');
  if (!feedbackList) return;

  const selectedUserId = document.getElementById('feedbackUserFilter')?.value || '';
  const selectedStatus = document.getElementById('feedbackStatusFilter')?.value || '';
  const entries = feedbackEntries.filter(entry => (!selectedUserId || Number(selectedUserId) === entry.userId) && (!selectedStatus || entry.status === selectedStatus));

  if (!entries.length) {
    feedbackList.innerHTML = `<div class="card empty-inline"><i class="fas fa-comment-slash"></i><p>No feedback entries match the current filter.</p></div>`;
    return;
  }

  feedbackList.innerHTML = entries.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(entry => `
    <div class="card feedback-card">
      <div class="feedback-card-header">
        <div>
          <h3>${escapeHtml(getUserName(entry.userId))}</h3>
          <p>${formatDateTime(entry.createdAt)}</p>
        </div>
        <span class="status-badge ${entry.status === 'Pending' ? 'warning-badge' : 'active'}">${escapeHtml(entry.status)}</span>
      </div>
      <p>${escapeHtml(entry.message)}</p>
      <div class="form-group feedback-note">
        <label for="feedback-response-${entry.id}">Dietitian Notes / Response</label>
        <textarea id="feedback-response-${entry.id}" class="form-control" onchange="updateFeedbackResponse(${entry.id}, this.value)">${escapeHtml(entry.response)}</textarea>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" onclick="markFeedbackReviewed(${entry.id})"><i class="fas fa-check-circle"></i> Mark as Reviewed</button>
      </div>
    </div>
  `).join('');
}

function openUserModal(userId = null) {
  editingUserId = userId;
  const form = document.getElementById('userForm');
  const title = document.getElementById('userModalTitle');
  if (!form) return;
  clearFormErrors(form);
  form.reset();
  setFieldValue('userStatus', 'Active');

  if (userId) {
    const user = assignedUsers.find(item => item.id === userId);
    if (!user) return;
    if (title) title.textContent = 'Edit User';
    setFieldValue('userName', user.name);
    setFieldValue('userAge', user.age);
    setFieldValue('userWeight', user.weight);
    setFieldValue('userHeight', user.height);
    setFieldValue('userGoal', user.goal);
    setFieldValue('userDietType', user.dietType);
    setFieldValue('userAllergies', user.allergies);
    setFieldValue('userStatus', user.status);
  } else if (title) {
    title.textContent = 'Add New User';
  }

  showElement('userModal');
  showElement('userModalBackdrop');
}

function closeUserModal() {
  hideElement('userModal');
  hideElement('userModalBackdrop');
  editingUserId = null;
}

function openUserDrawer(userId) {
  const user = assignedUsers.find(item => item.id === userId);
  const drawer = document.getElementById('userDrawer');
  if (!user || !drawer) return;

  const userPlans = mealPlans.filter(plan => plan.userId === userId);
  const userFeedback = feedbackEntries.filter(entry => entry.userId === userId);

  drawer.innerHTML = `
    <div class="drawer-header">
      <div>
        <h3>${escapeHtml(user.name)}</h3>
        <p class="text-muted">${escapeHtml(user.goal)} • ${escapeHtml(user.dietType)}</p>
      </div>
      <button class="close-btn" type="button" onclick="closeUserDrawer()"><i class="fas fa-times"></i></button>
    </div>
    <div class="drawer-grid">
      <div class="drawer-stat"><strong>Age</strong><span>${escapeHtml(user.age)} years</span></div>
      <div class="drawer-stat"><strong>Status</strong><span>${escapeHtml(user.status)}</span></div>
      <div class="drawer-stat"><strong>Weight</strong><span>${escapeHtml(user.weight)} kg</span></div>
      <div class="drawer-stat"><strong>Height</strong><span>${escapeHtml(user.height)} cm</span></div>
      <div class="drawer-stat"><strong>Allergies</strong><span>${escapeHtml(user.allergies)}</span></div>
      <div class="drawer-stat"><strong>Created</strong><span>${formatDate(user.createdAt)}</span></div>
    </div>
    <div class="section-header mt-3"><div class="section-copy"><h2 class="section-title" style="font-size: 1.15rem;">Meal Plans</h2><p>Plans currently linked to this user.</p></div></div>
    ${userPlans.length ? userPlans.map(plan => `<div class="activity-item"><div class="activity-icon"><i class="fas fa-bowl-food"></i></div><div><strong>${escapeHtml(plan.planName)}</strong><p>${formatDate(plan.startDate)} to ${formatDate(plan.endDate)} • ${escapeHtml(plan.calorieTarget)} kcal</p></div></div>`).join('') : '<div class="empty-inline">No meal plans linked yet.</div>'}
    <div class="section-header mt-3"><div class="section-copy"><h2 class="section-title" style="font-size: 1.15rem;">Feedback Summary</h2><p>Current review items for this user.</p></div></div>
    ${userFeedback.length ? userFeedback.map(entry => `<div class="activity-item"><div class="activity-icon"><i class="fas fa-comment-dots"></i></div><div><strong>${escapeHtml(entry.status)}</strong><p>${escapeHtml(entry.message)}</p></div></div>`).join('') : '<div class="empty-inline">No feedback entries yet.</div>'}
  `;

  showElement('userDrawer');
  showElement('userDrawerBackdrop');
}

function closeUserDrawer() {
  hideElement('userDrawer');
  hideElement('userDrawerBackdrop');
}

function showConfirmModal(title, message, actionLabel, action) {
  setText('confirmTitle', title);
  setText('confirmMessage', message);
  const confirmActionBtn = document.getElementById('confirmActionBtn');
  if (confirmActionBtn) confirmActionBtn.innerHTML = `<i class="fas fa-check"></i> ${escapeHtml(actionLabel)}`;
  confirmAction = action;
  showElement('confirmModal');
  showElement('confirmBackdrop');
}

function closeConfirmModal() {
  hideElement('confirmModal');
  hideElement('confirmBackdrop');
  confirmAction = null;
}

async function handleUserSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = document.getElementById('saveUserBtn');
  const formData = Object.fromEntries(new FormData(form).entries());
  const errors = validateUserForm(formData);
  if (Object.keys(errors).length) return setFormErrors(form, errors);

  clearFormErrors(form);
  setButtonLoading(submitButton, true, 'Saving User');

  const userPayload = {
    id: editingUserId || undefined,
    name: formData.name.trim(),
    age: Number(formData.age),
    weight: Number(formData.weight),
    height: Number(formData.height),
    goal: formData.goal,
    dietType: formData.dietType,
    allergies: formData.allergies.trim(),
    status: formData.status
  };

  try {
    if (isServerMode) {
      await apiRequest('api/dietitian/patients.php', { method: 'POST', body: userPayload });
      await loadDietitianDataStore();
    } else if (editingUserId) {
      const index = assignedUsers.findIndex(item => item.id === editingUserId);
      if (index >= 0) assignedUsers[index] = { ...assignedUsers[index], ...userPayload };
    } else {
      assignedUsers.push({ id: getNextId(assignedUsers), ...userPayload, createdAt: new Date().toISOString() });
    }

    closeUserModal();
    refreshDietitianUI();
    showToast(editingUserId ? 'User updated successfully' : 'New user added successfully', 'success');
  } catch (error) {
    showToast(error.message || 'User could not be saved.', 'error');
  } finally {
    setButtonLoading(submitButton, false, 'Save User');
  }
}

async function handlePlanSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = document.getElementById('savePlanBtn');
  const rawData = Object.fromEntries(new FormData(form).entries());
  const planData = {
    id: editingPlanId || undefined,
    userId: Number(rawData.userId),
    planName: (rawData.planName || '').trim(),
    startDate: rawData.startDate,
    endDate: rawData.endDate,
    calorieTarget: Number(rawData.calorieTarget),
    dayCount: Number(rawData.dayCount),
    days: collectMealBuilderData()
  };

  const errors = validatePlanForm(planData);
  if (Object.keys(errors).length) return setFormErrors(form, errors);

  clearFormErrors(form);
  setButtonLoading(submitButton, true, 'Saving Plan');

  try {
    if (isServerMode) {
      await apiRequest('api/dietitian/meal_plan.php', {
        method: 'POST',
        body: {
          id: planData.id,
          patient_id: planData.userId,
          plan_name: planData.planName,
          start_date: planData.startDate,
          end_date: planData.endDate,
          calorie_target: planData.calorieTarget,
          day_count: planData.dayCount,
          days: planData.days
        }
      });
      await loadDietitianDataStore();
    } else if (editingPlanId) {
      const plan = mealPlans.find(item => item.id === editingPlanId);
      if (plan) Object.assign(plan, { userId: planData.userId, planName: planData.planName, startDate: planData.startDate, endDate: planData.endDate, calorieTarget: planData.calorieTarget, days: planData.days, status: 'Active' });
      const linkedFeedback = feedbackEntries.find(entry => entry.planId === editingPlanId);
      if (linkedFeedback) {
        linkedFeedback.message = `Plan updated: ${planData.planName}. Review adherence and refresh coaching notes.`;
        linkedFeedback.status = 'Pending';
      }
    } else {
      const newPlan = { id: getNextId(mealPlans), userId: planData.userId, planName: planData.planName, startDate: planData.startDate, endDate: planData.endDate, calorieTarget: planData.calorieTarget, status: 'Active', createdAt: new Date().toISOString(), days: planData.days };
      mealPlans.push(newPlan);
      feedbackEntries.push({ id: getNextId(feedbackEntries), userId: planData.userId, planId: newPlan.id, message: `Plan assigned: ${planData.planName}. Follow up on adherence, progress, and user comfort.`, response: '', status: 'Pending', createdAt: new Date().toISOString() });
    }

    resetMealPlanForm();
    refreshDietitianUI();
    showToast(editingPlanId ? 'Meal plan updated successfully' : 'Meal plan saved successfully', 'success');
  } catch (error) {
    showToast(error.message || 'Meal plan could not be saved.', 'error');
  } finally {
    setButtonLoading(submitButton, false, 'Save Plan');
  }
}

function validateUserForm(formData) {
  const errors = {};
  if (!formData.name || !formData.name.trim()) errors.name = 'Name is required.';
  if (!formData.age || Number(formData.age) < 10) errors.age = 'Enter a valid age.';
  if (!formData.weight || Number(formData.weight) <= 0) errors.weight = 'Enter a valid weight.';
  if (!formData.height || Number(formData.height) <= 0) errors.height = 'Enter a valid height.';
  if (!formData.goal) errors.goal = 'Please select a health goal.';
  if (!formData.dietType) errors.dietType = 'Please select a diet preference.';
  if (!formData.allergies || !formData.allergies.trim()) errors.allergies = 'Write allergies or "None".';
  return errors;
}

function validatePlanForm(planData) {
  const errors = {};
  if (!planData.userId) errors.userId = 'Select an assigned user.';
  if (!planData.planName) errors.planName = 'Plan name is required.';
  if (!planData.startDate) errors.startDate = 'Start date is required.';
  if (!planData.endDate) errors.endDate = 'End date is required.';
  if (planData.startDate && planData.endDate && new Date(planData.endDate) < new Date(planData.startDate)) errors.endDate = 'End date must be on or after the start date.';
  if (!planData.calorieTarget || planData.calorieTarget < 1000) errors.calorieTarget = 'Enter a calorie target of at least 1000.';
  if (!planData.dayCount || planData.dayCount < 1 || planData.dayCount > 14) errors.dayCount = 'Number of days must be between 1 and 14.';
  const hasOneCompleteMeal = planData.days.some(day => mealTypes.some(type => (day.meals[type] || []).some(item => item.item && item.portion && item.calories)));
  if (!hasOneCompleteMeal) errors.dayCount = 'Add at least one meal item with food, portion, and calories.';
  return errors;
}

function populatePlanUserOptions() {
  const select = document.getElementById('planUserId');
  if (!select) return;
  const selectedValue = select.value;
  select.innerHTML = '<option value="">Select user</option>' + assignedUsers.map(user => `<option value="${user.id}">${escapeHtml(user.name)} • ${escapeHtml(user.goal)}</option>`).join('');
  if (selectedValue) select.value = selectedValue;
}

function populateFeedbackUserOptions() {
  const select = document.getElementById('feedbackUserFilter');
  if (!select) return;
  const selectedValue = select.value;
  select.innerHTML = '<option value="">All Users</option>' + assignedUsers.map(user => `<option value="${user.id}">${escapeHtml(user.name)}</option>`).join('');
  if (selectedValue) select.value = selectedValue;
}

function getFilteredUsers() {
  const searchTerm = (document.getElementById('userSearch')?.value || '').trim().toLowerCase();
  const goalFilter = document.getElementById('goalFilter')?.value || '';
  const dietFilter = document.getElementById('dietFilter')?.value || '';
  const statusFilter = document.getElementById('statusFilter')?.value || '';
  return assignedUsers.filter(user => {
    const matchesSearch = !searchTerm || [user.name, user.goal, user.dietType, user.allergies].join(' ').toLowerCase().includes(searchTerm);
    return matchesSearch && (!goalFilter || user.goal === goalFilter) && (!dietFilter || user.dietType === dietFilter) && (!statusFilter || user.status === statusFilter);
  });
}

function renderMealBuilder(dayCount, existingDays = null) {
  const builder = document.getElementById('mealBuilder');
  if (!builder) return;
  const safeDayCount = Math.max(1, Math.min(14, Number(dayCount) || 1));
  const daysSource = existingDays || [];
  builder.innerHTML = Array.from({ length: safeDayCount }, (_, index) => {
    const dayNumber = index + 1;
    const dayData = daysSource.find(day => day.day === dayNumber);
    return `<div class="meal-day" data-day="${dayNumber}"><div class="meal-day-header"><div><h3>Day ${dayNumber}</h3><p class="text-muted">Build meal entries for this day.</p></div></div>${mealTypes.map(type => renderMealGroup(dayNumber, type, dayData?.meals?.[type] || [{}])).join('')}</div>`;
  }).join('');
}

function renderMealGroup(dayNumber, mealType, entries) {
  return `<div class="meal-group"><div class="meal-group-header"><strong>${mealType}</strong><button type="button" class="btn btn-primary" onclick="addMealEntry(${dayNumber}, '${mealType}')"><i class="fas fa-plus"></i> Add Item</button></div><div class="meal-items" id="meal-${dayNumber}-${mealType}">${entries.map(entry => renderMealItem(entry)).join('')}</div></div>`;
}

function renderMealItem(entry = {}) {
  return `<div class="meal-item"><div class="modal-footer" style="margin-top: 0; margin-bottom: 0.75rem; justify-content: space-between;"><strong>Meal Item</strong><button type="button" class="btn" onclick="removeMealEntry(this)"><i class="fas fa-trash"></i> Remove</button></div><div class="meal-item-grid"><input type="text" class="form-control" data-field="item" placeholder="Food item" value="${escapeHtml(entry.item || '')}" /><input type="text" class="form-control" data-field="portion" placeholder="Portion" value="${escapeHtml(entry.portion || '')}" /><input type="number" class="form-control" data-field="calories" min="0" placeholder="Calories" value="${entry.calories || ''}" /></div><textarea class="form-control" data-field="notes" placeholder="Notes">${escapeHtml(entry.notes || '')}</textarea></div>`;
}

function collectMealBuilderData() {
  return Array.from(document.querySelectorAll('#mealBuilder .meal-day')).map(dayEl => {
    const day = Number(dayEl.dataset.day);
    const meals = {};
    mealTypes.forEach(type => {
      const mealContainer = document.getElementById(`meal-${day}-${type}`);
      const items = mealContainer ? Array.from(mealContainer.querySelectorAll('.meal-item')) : [];
      meals[type] = items.map(itemEl => ({
        item: itemEl.querySelector('[data-field="item"]').value.trim(),
        portion: itemEl.querySelector('[data-field="portion"]').value.trim(),
        calories: Number(itemEl.querySelector('[data-field="calories"]').value),
        notes: itemEl.querySelector('[data-field="notes"]').value.trim()
      })).filter(item => item.item || item.portion || item.calories || item.notes);
    });
    return { day, meals };
  });
}

function resetMealPlanForm() {
  editingPlanId = null;
  const form = document.getElementById('mealPlanForm');
  if (form) {
    form.reset();
    clearFormErrors(form);
  }
  setFieldValue('planDays', 3);
  renderMealBuilder(3);
}

function addMealEntry(dayNumber, mealType) {
  document.getElementById(`meal-${dayNumber}-${mealType}`)?.insertAdjacentHTML('beforeend', renderMealItem());
}

function removeMealEntry(button) {
  const item = button.closest('.meal-item');
  const container = button.closest('.meal-items');
  if (!item || !container) return;
  if (container.children.length === 1) {
    item.querySelectorAll('input, textarea').forEach(field => { field.value = ''; });
    return;
  }
  item.remove();
}

function viewUserProfile(userId) {
  openUserDrawer(userId);
}

function editUser(userId) {
  openUserModal(userId);
}

function confirmDeleteUser(userId) {
  const user = assignedUsers.find(item => item.id === userId);
  if (!user) return;

  showConfirmModal('Delete user', `Delete ${user.name} and remove all linked plans and feedback?`, 'Delete', async function () {
    try {
      if (isServerMode) {
        await apiRequest(`api/dietitian/patients.php?id=${userId}`, { method: 'DELETE' });
        await loadDietitianDataStore();
      } else {
        const relatedPlanIds = mealPlans.filter(plan => plan.userId === userId).map(plan => plan.id);
        assignedUsers = assignedUsers.filter(item => item.id !== userId);
        mealPlans = mealPlans.filter(plan => plan.userId !== userId);
        feedbackEntries = feedbackEntries.filter(entry => entry.userId !== userId && !relatedPlanIds.includes(entry.planId));
      }
      refreshDietitianUI();
      showToast('User deleted successfully', 'success');
    } catch (error) {
      showToast(error.message || 'User could not be deleted.', 'error');
    }
  });
}

function editPlan(planId) {
  const plan = mealPlans.find(item => item.id === planId);
  if (!plan) return;
  editingPlanId = planId;
  clearFormErrors(document.getElementById('mealPlanForm'));
  setFieldValue('planUserId', String(plan.userId));
  setFieldValue('planName', plan.planName);
  setFieldValue('planStartDate', plan.startDate);
  setFieldValue('planEndDate', plan.endDate);
  setFieldValue('planCalories', plan.calorieTarget);
  setFieldValue('planDays', (plan.days || []).length || 1);
  renderMealBuilder((plan.days || []).length || 1, plan.days || []);
  jumpToSection('create-plan');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function confirmDeletePlan(planId) {
  const plan = mealPlans.find(item => item.id === planId);
  if (!plan) return;

  showConfirmModal('Delete meal plan', `Delete "${plan.planName}" and its linked feedback entry?`, 'Delete', async function () {
    try {
      if (isServerMode) {
        await apiRequest(`api/dietitian/meal_plan.php?id=${planId}`, { method: 'DELETE' });
        await loadDietitianDataStore();
      } else {
        mealPlans = mealPlans.filter(item => item.id !== planId);
        feedbackEntries = feedbackEntries.filter(entry => entry.planId !== planId);
      }
      refreshDietitianUI();
      showToast('Meal plan deleted successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Meal plan could not be deleted.', 'error');
    }
  });
}

function updateFeedbackResponse(feedbackId, value) {
  const entry = feedbackEntries.find(item => item.id === feedbackId);
  if (entry) entry.response = value.trim();
}

async function markFeedbackReviewed(feedbackId) {
  const entry = feedbackEntries.find(item => item.id === feedbackId);
  if (!entry) return;

  try {
    if (isServerMode) {
      await apiRequest('api/dietitian/feedback.php', {
        method: 'POST',
        body: {
          id: entry.id,
          patient_id: entry.userId,
          plan_id: entry.planId,
          subject: entry.subject || 'Feedback Review',
          message: entry.message,
          response: entry.response || '',
          status: 'Reviewed'
        }
      });
      await loadDietitianDataStore();
    } else {
      entry.status = 'Reviewed';
    }
    refreshDietitianUI();
    showToast('Feedback marked as reviewed', 'success');
  } catch (error) {
    showToast(error.message || 'Feedback could not be updated.', 'error');
  }
}

function jumpToSection(sectionId) {
  showSection(sectionId);
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.section === sectionId));
  if (window.innerWidth <= 768) document.getElementById('sidebar')?.classList.remove('show');
}

function getUserName(userId) {
  return assignedUsers.find(user => Number(user.id) === Number(userId))?.name || 'Unknown User';
}

function getInitials(name) {
  return String(name).split(' ').map(part => part.charAt(0)).slice(0, 2).join('').toUpperCase();
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function setFieldValue(id, value) {
  const field = document.getElementById(id);
  if (field) field.value = value;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}

function showElement(id) {
  document.getElementById(id)?.classList.remove('hidden');
}

function hideElement(id) {
  document.getElementById(id)?.classList.add('hidden');
}

function clearFormErrors(form) {
  form?.querySelectorAll('.error-text').forEach(el => { el.textContent = ''; });
}

function setFormErrors(form, errors) {
  clearFormErrors(form);
  Object.entries(errors).forEach(([fieldName, message]) => {
    const target = form.querySelector(`[data-error-for="${fieldName}"]`);
    if (target) target.textContent = message;
  });
}

function setButtonLoading(button, isLoading, label) {
  if (!button) return;
  if (!button.dataset.defaultLabel) button.dataset.defaultLabel = button.innerHTML;
  button.classList.toggle('loading', isLoading);
  button.disabled = isLoading;
  button.innerHTML = isLoading ? `<i class="fas fa-spinner"></i> ${escapeHtml(label)}` : button.dataset.defaultLabel;
}

async function apiRequest(url, options = {}) {
  const requestOptions = {
    method: options.method || 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json'
    }
  };

  if (options.body !== undefined) {
    requestOptions.headers['Content-Type'] = 'application/json';
    requestOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(new URL(String(url || '').replace(/^\/+/, ''), API_BASE_URL).toString(), requestOptions);

  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch (error) {
    payload = { success: false, message: text || 'Invalid server response.' };
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || `Request failed with status ${response.status}`);
  }

  return payload;
}

function mapPatientFromApi(patient) {
  return {
    id: Number(patient.id),
    name: patient.name || 'Unnamed User',
    age: Number(patient.age || 0),
    weight: Number(patient.weight || 0),
    height: Number(patient.height || 0),
    goal: patient.goal || 'General Care',
    dietType: patient.diet_type || 'Balanced',
    allergies: patient.allergies || 'None',
    status: patient.status || 'Active',
    createdAt: patient.created_at || new Date().toISOString()
  };
}

function mapPlanFromApi(plan) {
  return {
    id: Number(plan.id),
    userId: Number(plan.patient_id),
    planName: plan.plan_name || 'Meal Plan',
    startDate: plan.start_date,
    endDate: plan.end_date,
    calorieTarget: Number(plan.calorie_target || 0),
    status: plan.status || 'Active',
    createdAt: plan.created_at || plan.updated_at || new Date().toISOString(),
    days: Array.isArray(plan.days) ? plan.days : []
  };
}

function mapFeedbackFromApi(entry) {
  return {
    id: Number(entry.id),
    userId: Number(entry.patient_id),
    planId: entry.plan_id ? Number(entry.plan_id) : null,
    subject: entry.subject || '',
    message: entry.message || '',
    response: entry.response || '',
    status: entry.status || 'Pending',
    createdAt: entry.created_at || new Date().toISOString()
  };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
