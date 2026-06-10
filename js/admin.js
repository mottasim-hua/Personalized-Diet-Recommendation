let users = [];
let dietitians = [];
let plans = [];
let currentSection = 'home';
let confirmCallback = null;

const reportData = {
  weekly: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    users: [34, 42, 39, 48, 56, 44, 37],
    revenue: [620, 740, 680, 810, 930, 770, 690],
  },
  monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    users: [320, 380, 430, 510, 590, 660, 740],
    revenue: [5200, 6100, 7200, 8100, 9300, 10400, 11800],
  },
};

const planCategories = [
  {
    key: 'weight-loss',
    title: 'Weight Loss',
    description: 'Calorie-controlled plans with sustainable pacing.',
    color: 'linear-gradient(90deg, #fb7185, #f97316)',
  },
  {
    key: 'muscle-gain',
    title: 'Muscle Gain',
    description: 'Protein-focused nutrition for active members.',
    color: 'linear-gradient(90deg, #38bdf8, #06b6d4)',
  },
  {
    key: 'maintenance',
    title: 'Maintenance',
    description: 'Balanced everyday plans for long-term consistency.',
    color: 'linear-gradient(90deg, #34d399, #10b981)',
  },
  {
    key: 'clinical',
    title: 'Clinical',
    description: 'Condition-supportive nutrition with expert supervision.',
    color: 'linear-gradient(90deg, #a78bfa, #8b5cf6)',
  },
];

document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.href.includes('admin-dashboard.html')) return;

  initializeAdminDashboard();
});

function initializeAdminDashboard() {
  const user = getCurrentUser();

  hydrateProfile(user);
  loadUsers();
  loadDietitians();
  loadPlans();
  bindUI();
  updateCurrentDate();
  renderEverything();
  showSection('home');
  initializeCharts();
  window.addEventListener('resize', handleResponsiveResize);
}

function getCurrentUser() {
  const rawUser = localStorage.getItem('dietSystemUser');

  if (!rawUser) {
    return { name: 'Admin User', role: 'admin' };
  }

  try {
    const parsed = JSON.parse(rawUser);

    return {
      name: parsed?.name || 'Admin User',
      role: parsed?.role || 'admin',
      email: parsed?.email || '',
    };
  } catch (error) {
    return { name: 'Admin User', role: 'admin' };
  }
}

function hydrateProfile(user) {
  const name = user.name || 'Admin User';
  const initial = name.charAt(0).toUpperCase();

  ['adminName', 'topbarName'].forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.textContent = name;
  });

  ['adminAvatar', 'topbarAvatar'].forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.textContent = initial;
  });
}

function bindUI() {
  setupNavigation();
  setupDropdowns();
  setupTheme();
  setupSearchAndFilters();
  setupForms();

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('admin-modal')) {
      event.target.classList.remove('show');
    }
  });
}

function loadUsers() {
  const savedUsers = localStorage.getItem('adminUsers');
  users = savedUsers
    ? normalizeUsers(JSON.parse(savedUsers))
    : [
        {
          id: 1,
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+8801712345678',
          role: 'user',
          status: 'active',
          subscription: 'Premium',
          joined: '2026-04-15',
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+8801712345679',
          role: 'user',
          status: 'active',
          subscription: 'Standard',
          joined: '2026-04-10',
        },
        {
          id: 3,
          name: 'Mike Brown',
          email: 'mike@example.com',
          phone: '+8801712345680',
          role: 'user',
          status: 'inactive',
          subscription: 'Trial',
          joined: '2026-04-05',
        },
        {
          id: 4,
          name: 'Emily Davis',
          email: 'emily@example.com',
          phone: '+8801712345681',
          role: 'user',
          status: 'active',
          subscription: 'Premium',
          joined: '2026-03-28',
        },
      ];

  persistUsers();
}

function loadDietitians() {
  const savedDietitians = localStorage.getItem('adminDietitians');
  dietitians = savedDietitians
    ? normalizeDietitians(JSON.parse(savedDietitians))
    : [
        {
          id: 1,
          name: 'Dr. Amanda Lee',
          email: 'amanda@diet.com',
          qualification: 'MSc Nutrition',
          specialty: 'Weight Management',
          availability: 'available',
          status: 'approved',
          patients: 12,
        },
        {
          id: 2,
          name: 'Dr. Robert Chen',
          email: 'robert@diet.com',
          qualification: 'BSc Dietetics',
          specialty: 'Sports Nutrition',
          availability: 'available',
          status: 'approved',
          patients: 8,
        },
        {
          id: 3,
          name: 'Dr. Maria Garcia',
          email: 'maria@diet.com',
          qualification: 'Clinical Nutrition Specialist',
          specialty: 'Clinical Nutrition',
          availability: 'unavailable',
          status: 'pending',
          patients: 15,
        },
      ];

  persistDietitians();
}

function loadPlans() {
  const savedPlans = localStorage.getItem('adminPlans');
  plans = savedPlans
    ? normalizePlans(JSON.parse(savedPlans))
    : [
        {
          id: 1,
          name: 'Weight Loss Basic',
          type: 'weight-loss',
          calories: 1500,
          duration: 30,
          price: 49,
          description: 'Structured calorie deficit plan.',
        },
        {
          id: 2,
          name: 'Muscle Gain Pro',
          type: 'muscle-gain',
          calories: 2600,
          duration: 45,
          price: 79,
          description: 'High protein progression plan.',
        },
        {
          id: 3,
          name: 'Maintenance Balance',
          type: 'maintenance',
          calories: 2000,
          duration: 28,
          price: 59,
          description: 'Balanced nutrition for consistency.',
        },
        {
          id: 4,
          name: 'Clinical Recovery',
          type: 'clinical',
          calories: 1800,
          duration: 21,
          price: 99,
          description: 'Specialized nutrition for recovery support.',
        },
      ];

  persistPlans();
}

function persistUsers() {
  localStorage.setItem('adminUsers', JSON.stringify(users));
}

function persistDietitians() {
  localStorage.setItem('adminDietitians', JSON.stringify(dietitians));
}

function persistPlans() {
  localStorage.setItem('adminPlans', JSON.stringify(plans));
}

function renderEverything() {
  updateAdminStats();
  renderUsersTable();
  renderHomeUsers();
  renderDietitiansTable();
  renderPlansTable();
  renderPlanCategoryCards();
  renderRecentActivities();
}

function updateAdminStats() {
  setText('totalUsers', users.length);
  setText('totalDietitians', dietitians.length);
  setText('totalPlans', plans.length);
  setText('monthlyReports', Math.max(18, users.length + dietitians.length));
}

function renderUsersTable() {
  const search = getValue('usersSearch').toLowerCase();
  const filter = getValue('usersFilter');
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !search ||
      [user.name, user.email, user.phone, user.subscription]
        .join(' ')
        .toLowerCase()
        .includes(search);
    const matchesFilter = filter === 'all' || user.status === filter;
    return matchesSearch && matchesFilter;
  });

  const tbody = document.getElementById('usersTableBody');
  const emptyState = document.getElementById('usersEmpty');
  if (!tbody || !emptyState) return;

  tbody.innerHTML = filteredUsers
    .map(
      (user) => `
        <tr>
          <td>
            <div class="admin-user-cell">
              <div class="admin-user-cell__avatar">${getInitials(user.name)}</div>
              <div class="admin-user-cell__meta">
                <strong>${user.name}</strong>
                <span>${formatDate(user.joined)}</span>
              </div>
            </div>
          </td>
          <td>${user.email}</td>
          <td>${user.phone || '-'}</td>
          <td><span class="admin-status ${user.status}">${capitalize(user.status)}</span></td>
          <td>
            <div class="table-actions">
              <button class="view-btn" title="View" onclick="viewUser(${user.id})"><i class="fas fa-eye"></i></button>
              <button class="edit-btn" title="Edit" onclick="openUserModal(${user.id})"><i class="fas fa-pen"></i></button>
              <button class="delete-btn" title="Delete" onclick="confirmDelete('user', ${user.id})"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `,
    )
    .join('');

  emptyState.classList.toggle('hidden', filteredUsers.length > 0);
}

function renderHomeUsers() {
  const tbody = document.getElementById('homeUsersTableBody');
  if (!tbody) return;

  tbody.innerHTML = users
    .slice(0, 4)
    .map(
      (user) => `
        <tr>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td><span class="admin-status ${user.status}">${capitalize(user.status)}</span></td>
        </tr>
      `,
    )
    .join('');
}

function renderDietitiansTable() {
  const search = getValue('dietitiansSearch').toLowerCase();
  const filter = getValue('dietitiansFilter');
  const filteredDietitians = dietitians.filter((dietitian) => {
    const matchesSearch =
      !search ||
      [dietitian.name, dietitian.email, dietitian.specialty, dietitian.qualification]
        .join(' ')
        .toLowerCase()
        .includes(search);

    let matchesFilter = true;
    if (filter === 'approved' || filter === 'pending') {
      matchesFilter = dietitian.status === filter;
    } else if (filter === 'available') {
      matchesFilter = dietitian.availability === 'available';
    }

    return matchesSearch && matchesFilter;
  });

  const tbody = document.getElementById('dietitiansTableBody');
  const emptyState = document.getElementById('dietitiansEmpty');
  if (!tbody || !emptyState) return;

  tbody.innerHTML = filteredDietitians
    .map(
      (dietitian) => `
        <tr>
          <td>
            <div class="admin-user-cell">
              <div class="admin-user-cell__avatar">${getInitials(dietitian.name)}</div>
              <div class="admin-user-cell__meta">
                <strong>${dietitian.name}</strong>
                <span>${dietitian.email}</span>
              </div>
            </div>
          </td>
          <td>${dietitian.qualification}</td>
          <td>${dietitian.specialty}</td>
          <td><span class="admin-status ${dietitian.availability}">${capitalize(dietitian.availability)}</span></td>
          <td>
            <div class="table-actions">
              ${
                dietitian.status === 'pending'
                  ? `<button class="view-btn" title="Approve" onclick="approveDietitian(${dietitian.id})"><i class="fas fa-check"></i></button>`
                  : ''
              }
              <button class="edit-btn" title="Edit" onclick="openDietitianModal(${dietitian.id})"><i class="fas fa-pen"></i></button>
              <button class="delete-btn" title="Delete" onclick="confirmDelete('dietitian', ${dietitian.id})"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `,
    )
    .join('');

  emptyState.classList.toggle('hidden', filteredDietitians.length > 0);
}

function renderPlansTable() {
  const search = getValue('plansSearch').toLowerCase();
  const filter = getValue('plansFilter');
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      !search ||
      [plan.name, plan.type, plan.description].join(' ').toLowerCase().includes(search);
    const matchesFilter = filter === 'all' || plan.type === filter;
    return matchesSearch && matchesFilter;
  });

  const tbody = document.getElementById('plansTableBody');
  const emptyState = document.getElementById('plansEmpty');
  if (!tbody || !emptyState) return;

  tbody.innerHTML = filteredPlans
    .map(
      (plan) => `
        <tr>
          <td>
            <div class="admin-user-cell__meta">
              <strong>${plan.name}</strong>
              <span>${plan.description || 'Diet plan package'}</span>
            </div>
          </td>
          <td><span class="admin-status category">${humanizePlanType(plan.type)}</span></td>
          <td>${plan.calories} kcal</td>
          <td>${plan.duration} days</td>
          <td>$${Number(plan.price || 0).toFixed(0)}</td>
          <td>
            <div class="table-actions">
              <button class="view-btn" title="View" onclick="viewPlan(${plan.id})"><i class="fas fa-eye"></i></button>
              <button class="edit-btn" title="Edit" onclick="openPlanModal(${plan.id})"><i class="fas fa-pen"></i></button>
              <button class="delete-btn" title="Delete" onclick="confirmDelete('plan', ${plan.id})"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `,
    )
    .join('');

  emptyState.classList.toggle('hidden', filteredPlans.length > 0);
}

function renderPlanCategoryCards() {
  const container = document.getElementById('planCategoryCards');
  if (!container) return;

  container.innerHTML = planCategories
    .map((category) => {
      const count = plans.filter((plan) => plan.type === category.key).length;
      return `
        <article class="plan-category-card">
          <div class="plan-category-card__bar" style="background:${category.color}"></div>
          <h4>${category.title}</h4>
          <p>${category.description}</p>
          <span>${count} active plans</span>
        </article>
      `;
    })
    .join('');
}

function renderRecentActivities() {
  const container = document.getElementById('recentActivities');
  if (!container) return;

  const activities = [
    {
      title: 'New user registration',
      meta: `${users[0]?.name || 'A member'} joined the platform`,
    },
    {
      title: 'Dietitian approval pending',
      meta: `${dietitians.find((item) => item.status === 'pending')?.name || 'A dietitian'} needs review`,
    },
    {
      title: 'Plan created',
      meta: `${plans[0]?.name || 'A new plan'} is available for assignment`,
    },
    {
      title: 'Monthly report compiled',
      meta: 'Platform analytics summary is ready for export',
    },
  ];

  container.innerHTML = activities
    .map(
      (item) => `
        <article class="activity-item">
          <strong>${item.title}</strong>
          <span class="activity-meta">${item.meta}</span>
        </article>
      `,
    )
    .join('');
}

function setupNavigation() {
  document.querySelectorAll('.admin-nav__item').forEach((item) => {
    item.addEventListener('click', () => {
      const section = item.getAttribute('data-section');
      showSection(section);
    });
  });
}

function showSection(sectionId) {
  currentSection = sectionId;
  document.querySelectorAll('.dashboard-section').forEach((section) => {
    section.classList.add('hidden');
  });

  document.querySelectorAll('.admin-nav__item').forEach((item) => {
    item.classList.toggle('active', item.getAttribute('data-section') === sectionId);
  });

  const target = document.getElementById(`${sectionId}Section`);
  if (target) target.classList.remove('hidden');

  updatePageHeader(sectionId);
  refreshSectionVisuals(sectionId);
  closeSidebarOnMobile();
}

function updatePageHeader(section) {
  const map = {
    home: {
      title: 'Home',
      subtitle: 'Monitor platform performance and operations.',
    },
    'manage-users': {
      title: 'Manage Users',
      subtitle: 'Review users, subscriptions, and member activity.',
    },
    'manage-dietitians': {
      title: 'Manage Dietitians',
      subtitle: 'Manage professional profiles and approval workflow.',
    },
    'manage-plans': {
      title: 'Manage Plans',
      subtitle: 'Create and maintain structured nutrition programs.',
    },
    reports: {
      title: 'Reports',
      subtitle: 'Track growth, subscriptions, and revenue performance.',
    },
  };

  setText('pageTitle', map[section]?.title || 'Home');
  setText('pageSubtitle', map[section]?.subtitle || '');
}

function setupDropdowns() {
  const notificationsToggle = document.getElementById('notificationsToggle');
  const profileToggle = document.getElementById('profileToggle');
  const notificationsMenu = document.getElementById('notificationsMenu');
  const profileMenu = document.getElementById('profileMenu');

  notificationsToggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    notificationsMenu?.classList.toggle('show');
    profileMenu?.classList.remove('show');
  });

  profileToggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    profileMenu?.classList.toggle('show');
    notificationsMenu?.classList.remove('show');
  });

  document.addEventListener('click', () => {
    notificationsMenu?.classList.remove('show');
    profileMenu?.classList.remove('show');
  });
}

function setupTheme() {
  const root = document.body;
  const savedTheme = localStorage.getItem('adminTheme');
  if (savedTheme === 'dark') {
    root.classList.add('admin-theme-dark');
  }

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    root.classList.toggle('admin-theme-dark');
    localStorage.setItem(
      'adminTheme',
      root.classList.contains('admin-theme-dark') ? 'dark' : 'light',
    );
    refreshSectionVisuals(currentSection);
  });
}

function setupSearchAndFilters() {
  const bindings = [
    ['usersSearch', renderUsersTable],
    ['usersFilter', renderUsersTable],
    ['dietitiansSearch', renderDietitiansTable],
    ['dietitiansFilter', renderDietitiansTable],
    ['plansSearch', renderPlansTable],
    ['plansFilter', renderPlansTable],
  ];

  bindings.forEach(([id, handler]) => {
    document.getElementById(id)?.addEventListener('input', handler);
    document.getElementById(id)?.addEventListener('change', handler);
  });

  document.getElementById('globalSearch')?.addEventListener('input', handleGlobalSearch);
  document.getElementById('reportsRange')?.addEventListener('change', updateReportsChart);
}

function handleGlobalSearch(event) {
  const value = event.target.value.toLowerCase();

  if (currentSection === 'manage-users') {
    document.getElementById('usersSearch').value = value;
    renderUsersTable();
  } else if (currentSection === 'manage-dietitians') {
    document.getElementById('dietitiansSearch').value = value;
    renderDietitiansTable();
  } else if (currentSection === 'manage-plans') {
    document.getElementById('plansSearch').value = value;
    renderPlansTable();
  }
}

function setupForms() {
  document.getElementById('userForm')?.addEventListener('submit', saveUser);
  document.getElementById('dietitianForm')?.addEventListener('submit', saveDietitian);
  document.getElementById('planForm')?.addEventListener('submit', savePlan);
}

function openUserModal(userId = null) {
  const title = document.getElementById('userModalTitle');
  const form = document.getElementById('userForm');
  form.reset();
  setValue('userId', '');

  if (userId) {
    const user = users.find((item) => item.id === userId);
    if (!user) return;
    title.textContent = 'Update User';
    setValue('userId', user.id);
    setValue('newUserName', user.name);
    setValue('newUserEmail', user.email);
    setValue('newUserPhone', user.phone || '');
    setValue('newUserStatus', user.status);
  } else {
    title.textContent = 'Add User';
  }

  openModal('userModal');
}

function saveUser(event) {
  event.preventDefault();

  const id = Number(getValue('userId'));
  const payload = {
    id: id || Date.now(),
    name: getValue('newUserName'),
    email: getValue('newUserEmail'),
    phone: getValue('newUserPhone'),
    status: getValue('newUserStatus'),
    subscription: 'Premium',
    role: 'user',
    joined: id ? users.find((item) => item.id === id)?.joined || todayISO() : todayISO(),
  };

  if (id) {
    users = users.map((user) => (user.id === id ? payload : user));
    showToast('User updated successfully', 'success');
  } else {
    users.unshift(payload);
    showToast('User added successfully', 'success');
  }

  persistUsers();
  renderEverything();
  closeModal('userModal');
}

function openDietitianModal(dietitianId = null) {
  const title = document.getElementById('dietitianModalTitle');
  const form = document.getElementById('dietitianForm');
  form.reset();
  setValue('dietitianId', '');

  if (dietitianId) {
    const dietitian = dietitians.find((item) => item.id === dietitianId);
    if (!dietitian) return;
    title.textContent = 'Update Dietitian';
    setValue('dietitianId', dietitian.id);
    setValue('newDietitianName', dietitian.name);
    setValue('newDietitianEmail', dietitian.email);
    setValue('newDietitianQualification', dietitian.qualification);
    setValue('newDietitianSpecialty', dietitian.specialty);
    setValue('newDietitianAvailability', dietitian.availability);
    setValue('newDietitianStatus', dietitian.status);
  } else {
    title.textContent = 'Add Dietitian';
  }

  openModal('dietitianModal');
}

function saveDietitian(event) {
  event.preventDefault();

  const id = Number(getValue('dietitianId'));
  const payload = {
    id: id || Date.now(),
    name: getValue('newDietitianName'),
    email: getValue('newDietitianEmail'),
    qualification: getValue('newDietitianQualification'),
    specialty: getValue('newDietitianSpecialty'),
    availability: getValue('newDietitianAvailability'),
    status: getValue('newDietitianStatus'),
    patients: id ? dietitians.find((item) => item.id === id)?.patients || 0 : 0,
  };

  if (id) {
    dietitians = dietitians.map((item) => (item.id === id ? payload : item));
    showToast('Dietitian updated successfully', 'success');
  } else {
    dietitians.unshift(payload);
    showToast('Dietitian added successfully', 'success');
  }

  persistDietitians();
  renderEverything();
  closeModal('dietitianModal');
}

function openPlanModal(planId = null) {
  const title = document.getElementById('planModalTitle');
  const form = document.getElementById('planForm');
  form.reset();
  setValue('planId', '');

  if (planId) {
    const plan = plans.find((item) => item.id === planId);
    if (!plan) return;
    title.textContent = 'Update Plan';
    setValue('planId', plan.id);
    setValue('newPlanName', plan.name);
    setValue('newPlanType', plan.type);
    setValue('newPlanCalories', plan.calories);
    setValue('newPlanDuration', plan.duration);
    setValue('newPlanPrice', plan.price);
    setValue('newPlanDescription', plan.description || '');
  } else {
    title.textContent = 'Create Plan';
  }

  openModal('planModal');
}

function savePlan(event) {
  event.preventDefault();

  const id = Number(getValue('planId'));
  const payload = {
    id: id || Date.now(),
    name: getValue('newPlanName'),
    type: getValue('newPlanType'),
    calories: Number(getValue('newPlanCalories')),
    duration: Number(getValue('newPlanDuration')),
    price: Number(getValue('newPlanPrice')),
    description: getValue('newPlanDescription'),
  };

  if (id) {
    plans = plans.map((item) => (item.id === id ? payload : item));
    showToast('Plan updated successfully', 'success');
  } else {
    plans.unshift(payload);
    showToast('Plan created successfully', 'success');
  }

  persistPlans();
  renderEverything();
  updateAllCharts();
  closeModal('planModal');
}

function viewUser(userId) {
  const user = users.find((item) => item.id === userId);
  if (user) showToast(`Viewing ${user.name}`, 'success');
}

function viewPlan(planId) {
  const plan = plans.find((item) => item.id === planId);
  if (plan) showToast(`Viewing ${plan.name}`, 'success');
}

function approveDietitian(dietitianId) {
  dietitians = dietitians.map((item) =>
    item.id === dietitianId ? { ...item, status: 'approved' } : item,
  );
  persistDietitians();
  renderEverything();
  showToast('Dietitian approved successfully', 'success');
}

function confirmDelete(type, id) {
  const config = {
    user: {
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      action: () => {
        users = users.filter((item) => item.id !== id);
        persistUsers();
        renderEverything();
        showToast('User deleted successfully', 'success');
      },
    },
    dietitian: {
      title: 'Delete Dietitian',
      message: 'Are you sure you want to delete this dietitian? This action cannot be undone.',
      action: () => {
        dietitians = dietitians.filter((item) => item.id !== id);
        persistDietitians();
        renderEverything();
        showToast('Dietitian deleted successfully', 'success');
      },
    },
    plan: {
      title: 'Delete Plan',
      message: 'Are you sure you want to delete this plan? This action cannot be undone.',
      action: () => {
        plans = plans.filter((item) => item.id !== id);
        persistPlans();
        renderEverything();
        updateAllCharts();
        showToast('Plan deleted successfully', 'success');
      },
    },
  };

  const selected = config[type];
  if (!selected) return;

  setText('confirmTitle', selected.title);
  setText('confirmMessage', selected.message);
  confirmCallback = selected.action;
  openModal('confirmModal');

  const button = document.getElementById('confirmActionButton');
  if (button) {
    button.onclick = () => {
      confirmCallback?.();
      closeModal('confirmModal');
      confirmCallback = null;
    };
  }
}

function openModal(id) {
  document.getElementById(id)?.classList.add('show');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('show');
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('show');
  document.getElementById('sidebarOverlay')?.classList.toggle('show');
}

function closeSidebarOnMobile() {
  if (window.innerWidth <= 1024) {
    document.getElementById('sidebar')?.classList.remove('show');
    document.getElementById('sidebarOverlay')?.classList.remove('show');
  }
}

function updateCurrentDate() {
  setText(
    'currentDate',
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
  );
}

function initializeCharts() {
  if (typeof Chart === 'undefined') {
    return;
  }

  createActivityChart();
  createStatusChart();
  if (currentSection === 'reports') {
    createRevenueChart();
  }
}

function updateAllCharts() {
  if (typeof Chart === 'undefined') {
    return;
  }

  if (currentSection === 'reports') {
    updateReportsChart();
  }
  createStatusChart(true);
  createActivityChart(true);
}

function createActivityChart(force = false) {
  const canvas = document.getElementById('activityChart');
  if (!canvas) return;

  if (Chart.getChart(canvas) && !force) return;
  Chart.getChart(canvas)?.destroy();

  new Chart(canvas, {
    type: 'line',
    data: {
      labels: reportData.monthly.labels,
      datasets: [
        {
          label: 'Users',
          data: reportData.monthly.users,
          borderColor: '#2f7d5a',
          backgroundColor: 'rgba(47, 125, 90, 0.12)',
          fill: true,
          tension: 0.35,
          borderWidth: 3,
        },
      ],
    },
    options: sharedChartOptions(),
  });
}

function createStatusChart(force = false) {
  const canvas = document.getElementById('roleDistributionChart');
  if (!canvas) return;

  if (Chart.getChart(canvas) && !force) return;
  Chart.getChart(canvas)?.destroy();

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Pending', 'Flagged'],
      datasets: [
        {
          data: [62, 24, 14],
          backgroundColor: ['#2f7d5a', '#f39c12', '#3498db'],
          borderWidth: 0,
        },
      ],
    },
    options: {
      ...sharedChartOptions(),
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: getThemeColor(),
            padding: 18,
            usePointStyle: true,
          },
        },
      },
    },
  });
}

function createRevenueChart() {
  updateReportsChart();
}

function updateReportsChart() {
  const range = getValue('reportsRange') || 'monthly';
  const data = reportData[range];
  const canvas = document.getElementById('monthlyPlansChart');
  if (!canvas) return;

  Chart.getChart(canvas)?.destroy();

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Revenue',
          data: data.revenue,
          backgroundColor: '#52b788',
          borderRadius: 12,
        },
      ],
    },
    options: sharedChartOptions(),
  });
}

function sharedChartOptions() {
  const textColor = getThemeColor();
  const gridColor = document.body.classList.contains('admin-theme-dark')
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(20,40,29,0.08)';

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: document.body.classList.contains('admin-theme-dark')
          ? '#16211a'
          : '#ffffff',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: gridColor,
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
      x: {
        ticks: { color: textColor },
        grid: { display: false },
      },
    },
  };
}

function downloadReport() {
  const range = getValue('reportsRange') || 'monthly';
  const data = reportData[range];
  const rows = [
    ['Period', 'Users', 'Revenue'],
    ...data.labels.map((label, index) => [label, data.users[index], data.revenue[index]]),
  ];
  const csv = rows.map((row) => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `diet-system-report-${range}.csv`;
  link.click();
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas ${type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check'}"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2800);
}

function handleLogout() {
  showToast('Logging out...', 'success');
  setTimeout(() => {
    if (typeof logout === 'function') {
      logout();
    } else {
      window.location.href = 'index.html';
    }
  }, 600);
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function setValue(id, value) {
  const node = document.getElementById(id);
  if (node) node.value = value;
}

function getValue(id) {
  return document.getElementById(id)?.value || '';
}

function capitalize(value = '') {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getInitials(name = '') {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function humanizePlanType(type = '') {
  return type
    .split('-')
    .map((part) => capitalize(part))
    .join(' ');
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function getThemeColor() {
  return document.body.classList.contains('admin-theme-dark') ? '#eef8f0' : '#14281d';
}

function refreshSectionVisuals(sectionId) {
  if (typeof Chart === 'undefined') {
    return;
  }

  if (sectionId === 'reports') {
    requestAnimationFrame(() => {
      updateReportsChart();
    });
  } else {
    requestAnimationFrame(() => {
      Chart.getChart('activityChart')?.resize();
      Chart.getChart('roleDistributionChart')?.resize();
    });
  }
}

function handleResponsiveResize() {
  if (typeof Chart === 'undefined') {
    return;
  }

  Chart.getChart('activityChart')?.resize();
  Chart.getChart('roleDistributionChart')?.resize();
  Chart.getChart('monthlyPlansChart')?.resize();
}

function normalizeUsers(data) {
  if (!Array.isArray(data)) return [];

  return data.map((user, index) => ({
    id: Number(user.id) || Date.now() + index,
    name: user.name || 'Unnamed User',
    email: user.email || `user${index + 1}@example.com`,
    phone: user.phone || generatePhone(index),
    role: user.role || 'user',
    status: normalizeUserStatus(user.status, user.subscriptionStatus),
    subscription:
      user.subscription ||
      user.subscriptionStatus ||
      (normalizeUserStatus(user.status, user.subscriptionStatus) === 'active'
        ? 'Premium'
        : 'Trial'),
    joined: normalizeDate(user.joined || user.created_at),
  }));
}

function normalizeDietitians(data) {
  if (!Array.isArray(data)) return [];

  const qualificationFallbacks = [
    'MSc Nutrition',
    'BSc Dietetics',
    'Clinical Nutrition Specialist',
  ];
  const specialtyFallbacks = [
    'Weight Management',
    'Sports Nutrition',
    'Clinical Nutrition',
  ];

  return data.map((dietitian, index) => ({
    id: Number(dietitian.id) || Date.now() + index,
    name: dietitian.name || 'Unnamed Dietitian',
    email: dietitian.email || `dietitian${index + 1}@example.com`,
    qualification:
      dietitian.qualification || qualificationFallbacks[index % qualificationFallbacks.length],
    specialty:
      dietitian.specialty ||
      dietitian.specialization ||
      specialtyFallbacks[index % specialtyFallbacks.length],
    availability: normalizeAvailability(dietitian.availability, dietitian.status),
    status: normalizeDietitianStatus(dietitian.status, dietitian.is_approved),
    patients: Number(dietitian.patients) || 0,
  }));
}

function normalizePlans(data) {
  if (!Array.isArray(data)) return [];

  return data.map((plan, index) => ({
    id: Number(plan.id) || Date.now() + index,
    name: plan.name || plan.title || 'Untitled Plan',
    type: normalizePlanType(plan.type || plan.plan_type || plan.category),
    calories: Number(plan.calories) || 1800,
    duration: Number(plan.duration || plan.duration_days) || 30,
    price: Number(plan.price) || estimatePlanPrice(plan),
    description: plan.description || plan.notes || 'Professional diet plan package.',
  }));
}

function normalizeUserStatus(status, subscriptionStatus) {
  const normalized = String(status || subscriptionStatus || '')
    .trim()
    .toLowerCase();

  if (['inactive', 'disabled', 'cancelled'].includes(normalized)) {
    return 'inactive';
  }

  return 'active';
}

function normalizeDietitianStatus(status, isApproved) {
  if (typeof isApproved === 'boolean') {
    return isApproved ? 'approved' : 'pending';
  }

  const normalized = String(status || '').trim().toLowerCase();
  if (['pending', 'inactive', 'review'].includes(normalized)) {
    return 'pending';
  }

  return 'approved';
}

function normalizeAvailability(availability, status) {
  const normalized = String(availability || '').trim().toLowerCase();
  if (['available', 'unavailable'].includes(normalized)) {
    return normalized;
  }

  return String(status || '').trim().toLowerCase() === 'inactive'
    ? 'unavailable'
    : 'available';
}

function normalizePlanType(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  const supported = ['weight-loss', 'muscle-gain', 'maintenance', 'clinical'];
  if (supported.includes(normalized)) {
    return normalized;
  }

  if (normalized.includes('keto') || normalized.includes('vegan')) {
    return 'maintenance';
  }

  return 'weight-loss';
}

function normalizeDate(value) {
  if (!value) return todayISO();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? todayISO() : date.toISOString().split('T')[0];
}

function estimatePlanPrice(plan) {
  const calories = Number(plan.calories) || 1800;
  const duration = Number(plan.duration || plan.duration_days) || 30;
  return Math.max(39, Math.round(duration * 1.3 + calories / 100));
}

function generatePhone(index) {
  return `+88017${String(12345678 + index).padStart(8, '0').slice(0, 8)}`;
}
