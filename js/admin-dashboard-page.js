(() => {
  const API_PREFIX = 'api/';
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
  const safeAssignments = (() => {
    try {
      const raw = localStorage.getItem('dietitianAssignments');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  })();
  const pageState = {
    stats: null,
    chartData: null,
    users: [],
    dietitians: [],
    plans: [],
    settings: {},
    currentSection: 'dashboard',
    assignments: safeAssignments,
    usersPage: 1,
    dietitiansPage: 1,
    plansPage: 1,
    usersPerPage: 10,
    dietitiansPerPage: 10,
    plansPerPage: 10,
    reportRange: 30,
    userSearch: '',
    userStatusFilter: 'all',
    userGoalFilter: 'all',
    dietitianSearch: '',
    planSearch: '',
    planStatusFilter: 'all',
    planDietitianFilter: 'all',
    charts: {},
    confirmCallback: null,
    currentUser: { name: 'Admin User', email: 'admin@diet.com', role: 'admin' },
  };

  const defaultUsers = [
    { id: 1, name: 'Ahsan Rahman', email: 'ahsan@example.com', phone: '+8801712345678', role: 'user', status: 'active', created_at: '2026-06-01', bmi: 22.6, health_goal: 'Weight Loss', calorie_limit: 1800, dietary_pref: 'Vegetarian', activity_level: 'Moderate', weight: 68, height: 173, age: 29, food_today: 1620, plan_status: 'Active plan' },
    { id: 2, name: 'Nadia Islam', email: 'nadia@example.com', phone: '+8801712345679', role: 'user', status: 'active', created_at: '2026-05-30', bmi: 27.1, health_goal: 'Muscle Gain', calorie_limit: 2200, dietary_pref: 'Non-veg', activity_level: 'Active', weight: 74, height: 165, age: 27, food_today: 2050, plan_status: 'Active plan' },
    { id: 3, name: 'Tanvir Hossain', email: 'tanvir@example.com', phone: '+8801712345680', role: 'user', status: 'inactive', created_at: '2026-05-29', bmi: 18.2, health_goal: 'Maintenance', calorie_limit: 2000, dietary_pref: 'Vegan', activity_level: 'Low', weight: 51, height: 167, age: 24, food_today: 1680, plan_status: 'No plan assigned' },
    { id: 4, name: 'Shila Ahmed', email: 'shila@example.com', phone: '+8801712345681', role: 'user', status: 'active', created_at: '2026-05-28', bmi: 31.2, health_goal: 'Weight Loss', calorie_limit: 1700, dietary_pref: 'Vegetarian', activity_level: 'Moderate', weight: 82, height: 162, age: 35, food_today: 1920, plan_status: 'Active plan' },
  ];

  const defaultDietitians = [
    { id: 11, name: 'Dr. Amanda Lee', email: 'amanda@diet.com', status: 'approved', created_at: '2026-04-01', patients: 12, plans_created: 15, feedback_given: 20, assigned_patients: ['Ahsan Rahman', 'Shila Ahmed'] },
    { id: 12, name: 'Dr. Robert Chen', email: 'robert@diet.com', status: 'approved', created_at: '2026-04-12', patients: 8, plans_created: 11, feedback_given: 17, assigned_patients: ['Nadia Islam'] },
    { id: 13, name: 'Dr. Maria Garcia', email: 'maria@diet.com', status: 'pending', created_at: '2026-05-03', patients: 15, plans_created: 9, feedback_given: 11, assigned_patients: [] },
  ];

  const defaultPlans = [
    { id: 101, user_id: 1, user_name: 'Ahsan Rahman', health_goal: 'Weight Loss', dietitian_id: 11, dietitian_name: 'Dr. Amanda Lee', created_at: '2026-06-01', calories: 1800, status: 'active', notes: 'Focus on sustainable deficit.', meals: sampleMeals('Weight loss day plan') },
    { id: 102, user_id: 2, user_name: 'Nadia Islam', health_goal: 'Muscle Gain', dietitian_id: 12, dietitian_name: 'Dr. Robert Chen', created_at: '2026-05-30', calories: 2200, status: 'active', notes: 'Protein-first schedule.', meals: sampleMeals('Muscle gain day plan') },
    { id: 103, user_id: 3, user_name: 'Tanvir Hossain', health_goal: 'Maintenance', dietitian_id: null, dietitian_name: null, created_at: '2026-05-29', calories: 2000, status: 'unassigned', notes: '', meals: sampleMeals('Maintenance day plan') },
  ];

  const fallbackSettings = {
    site_name: 'Personalized Diet Recommendation System',
    default_calorie_limit: 2000,
    allow_self_registration: 1,
    default_role: 'user',
    email_alerts: 1,
    new_registration_alerts: 1,
    alert_threshold: 20,
    admin_name: 'Admin User',
    admin_email: 'admin@diet.com',
  };

  const els = {};

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function apiUrl(path) {
    return new URL(`${API_PREFIX}${String(path || '').replace(/^\/+/, '')}`, API_BASE_URL).toString();
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function toTitle(value) {
    if (!value) return '';
    return String(value)
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function formatDate(value) {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatDateTime(value) {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function fmtNumber(value, fraction = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num.toLocaleString('en-US', { minimumFractionDigits: fraction, maximumFractionDigits: fraction }) : '0';
  }

  function initials(name) {
    return String(name || 'A')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }

  function bmiCategory(bmi) {
    const value = Number(bmi);
    if (!Number.isFinite(value) || value <= 0) return { label: 'Unknown', tone: 'info', color: '#3498db' };
    if (value < 18.5) return { label: 'Underweight', tone: 'info', color: '#3498db' };
    if (value < 25) return { label: 'Normal', tone: 'success', color: '#2ecc71' };
    if (value < 30) return { label: 'Overweight', tone: 'warning', color: '#f39c12' };
    return { label: 'Obese', tone: 'danger', color: '#e74c3c' };
  }

  function showToast(message, type = 'success') {
    if (!els.toastStack) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-xmark';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHtml(message)}</span>`;
    els.toastStack.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(14px)';
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }

  function setLoading(isLoading) {
    if (els.loadingLayer) els.loadingLayer.hidden = !isLoading;
  }

  function openSidebar(open) {
    if (els.sidebar) els.sidebar.classList.toggle('open', open);
    if (els.overlay) els.overlay.classList.toggle('show', open);
  }

  function openModal(node) {
    if (!els.modalLayer) {
      console.error('Modal layer is missing from the page.');
      return;
    }
    els.modalLayer.innerHTML = '';
    els.modalLayer.appendChild(node);
    els.modalLayer.classList.add('show');
    bindModalClose(node);
    trapFocus(node);
  }

  function closeModal() {
    els.modalLayer.classList.remove('show');
    els.modalLayer.innerHTML = '';
  }

  function openDrawer(content) {
    if (!els.drawer) {
      console.error('Drawer is missing from the page.');
      return;
    }
    els.drawer.innerHTML = content;
    els.drawer.classList.add('open');
    els.overlay.classList.add('show');
  }

  function closeDrawer() {
    if (els.drawer) {
      els.drawer.classList.remove('open');
      els.drawer.innerHTML = '';
    }
    if (els.modalLayer && !els.modalLayer.classList.contains('show')) {
      if (els.overlay) els.overlay.classList.remove('show');
    }
  }

  function bindModalClose(root) {
    qsa('[data-close]', root).forEach((btn) => btn.addEventListener('click', closeModal));
    root.addEventListener('click', (event) => {
      if (event.target === root) closeModal();
    });
  }

  function setFormValue(form, name, value) {
    const field = form?.elements?.namedItem(name);
    if (!field) {
      console.warn(`Missing form field: ${name}`);
      return;
    }
    field.value = value ?? '';
  }

  function trapFocus(root) {
    const focusables = qsa('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', root).filter((el) => !el.disabled);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (first) first.focus();
    root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeModal();
      if (event.key !== 'Tab' || !first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }, { once: true });
  }

  function sampleMeals(title) {
    return {
      morning: [
        { item: 'Oatmeal with berries', calories: 320 },
        { item: 'Boiled egg', calories: 78 },
      ],
      afternoon: [
        { item: 'Grilled chicken salad', calories: 410 },
        { item: 'Apple', calories: 95 },
      ],
      evening: [
        { item: 'Brown rice', calories: 280 },
        { item: 'Vegetable curry', calories: 260 },
      ],
      night: [
        { item: 'Greek yogurt', calories: 150 },
      ],
      title,
      notes: 'Follow the dietitian notes for adjustments.',
    };
  }

  function safeJson(value, fallback = null) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  async function apiRequest(path, options = {}) {
    const config = {
      credentials: 'include',
      headers: { Accept: 'application/json' },
      ...options,
    };

    const controller = new AbortController();
    const timeoutMs = 8000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    config.signal = controller.signal;

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(apiUrl(path), config);
      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { success: false, message: text || 'Server returned invalid JSON.' };
      }
      if (!response.ok || data.success === false) {
        const error = new Error(data.message || `Request failed: ${response.status}`);
        error.payload = data;
        throw error;
      }
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutMs / 1000} seconds.`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function apiRequestFallback(path, options = {}, fallback = null) {
    try {
      return await apiRequest(path, options);
    } catch (error) {
      if (fallback !== null) return fallback;
      throw error;
    }
  }

  function normalizeUsers(rows) {
    return rows.map((row) => {
      const id = Number(row.id ?? row.user_id ?? row.userId);
      const name = row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unnamed User';
      const created = row.created_at || row.joined || row.createdAt || new Date().toISOString();
      const bmiValue = row.bmi || calculateBmi(row.weight, row.height);
      const goal = row.health_goal || row.goal || row.diet_goal || 'Other';
      const assignment = pageState.assignments[id];
      const assignedDietitian = pageState.dietitians.find((dietitian) => Number(dietitian.id) === Number(assignment));
      return {
        ...row,
        id,
        name,
        email: row.email || '',
        role: (row.role || 'user').toLowerCase(),
        status: (row.status || row.is_active || 'active').toString().toLowerCase().includes('active') ? 'active' : 'inactive',
        created_at: created,
        bmi: Number(bmiValue) || 0,
        health_goal: goal,
        calorie_limit: Number(row.calorie_limit || row.daily_calorie_goal || 2000),
        dietary_pref: row.dietary_pref || row.dietary_preference || row.dietary_preferences || '—',
        activity_level: row.activity_level || '—',
        weight: Number(row.weight || 0) || null,
        height: Number(row.height || 0) || null,
        age: Number(row.age || 0) || null,
        food_today: Number(row.food_today || row.total_calories || 0),
        plan_status: row.plan_status || (assignedDietitian ? 'Active plan' : 'No plan assigned'),
        assigned_dietitian_id: assignment || row.dietitian_id || null,
        assigned_dietitian_name: assignedDietitian ? assignedDietitian.name : row.assigned_dietitian_name || 'Unassigned',
      };
    });
  }

  function normalizeDietitians(rows) {
    return rows.map((row) => ({
      ...row,
      id: Number(row.id ?? row.user_id),
      name: row.name || 'Unnamed Dietitian',
      email: row.email || '',
      status: (row.status || 'approved').toString().toLowerCase(),
      patients: Number(row.patients || row.assigned_patients || 0),
      plans_created: Number(row.plans_created || row.plan_count || 0),
      feedback_given: Number(row.feedback_given || 0),
      created_at: row.created_at || new Date().toISOString(),
      assigned_patients: Array.isArray(row.assigned_patients) ? row.assigned_patients : [],
    }));
  }

  function normalizePlans(rows) {
    return rows.map((row) => {
      const meals = row.meals || row.days_json || row.meals_json;
      const parsedMeals = typeof meals === 'string' ? safeJson(meals, null) : meals;
      return {
        ...row,
        id: Number(row.id ?? row.plan_id),
        user_id: Number(row.user_id),
        user_name: row.user_name || 'Unknown User',
        health_goal: row.health_goal || 'Other',
        dietitian_id: row.dietitian_id ? Number(row.dietitian_id) : null,
        dietitian_name: row.dietitian_name || 'Unassigned',
        created_at: row.created_at || row.assigned_at || new Date().toISOString(),
        calories: Number(row.calories || row.calorie_target || row.daily_calorie_target || 2000),
        status: (row.status || 'active').toLowerCase(),
        notes: row.notes || row.description || '',
        meals: parsedMeals || sampleMeals(row.title || row.plan_name || 'Daily plan'),
      };
    });
  }

  function calculateBmi(weight, height) {
    const w = Number(weight);
    const h = Number(height);
    if (!w || !h) return 0;
    const bmi = w / Math.pow(h / 100, 2);
    return Math.round(bmi * 10) / 10;
  }

  function createStatCard({ label, value, icon, tone, trend }) {
    const card = document.createElement('article');
    card.className = 'stat-card';
    card.innerHTML = `
      <div class="stat-card__top">
        <div>
          <div class="stat-icon ${tone}"><i class="fa-solid ${icon}"></i></div>
        </div>
        <span class="trend ${trend?.includes('-') ? 'down' : 'up'}">${trend || ''}</span>
      </div>
      <div>
        <strong>${escapeHtml(value)}</strong>
        <div style="color: var(--muted); margin-top: 4px;">${escapeHtml(label)}</div>
      </div>
    `;
    return card;
  }

  function renderDashboardStats() {
    const stats = pageState.stats || {};
    const cards = [
      { label: 'Total Users', value: stats.total_users ?? 0, icon: 'fa-users', tone: 'blue', trend: '+12%' },
      { label: 'Total Dietitians', value: stats.total_dietitians ?? 0, icon: 'fa-user-doctor', tone: 'green', trend: '+8%' },
      { label: 'Diet Plans Active', value: stats.active_plans ?? 0, icon: 'fa-clipboard-list', tone: 'orange', trend: '+5%' },
      { label: 'Alerts Today', value: stats.alerts_today ?? 0, icon: 'fa-bell', tone: 'red', trend: stats.alerts_today > 0 ? '+ alerts' : '0' },
    ];
    if (els.dashboardStats) {
      els.dashboardStats.innerHTML = '';
      cards.forEach((card) => els.dashboardStats.appendChild(createStatCard(card)));
    }

    const reportCards = [
      { label: 'Total Registrations', value: stats.total_users ?? 0, icon: 'fa-user-plus', tone: 'blue', trend: '+registrations' },
      { label: 'Active Diet Plans', value: stats.active_plans ?? 0, icon: 'fa-clipboard-check', tone: 'green', trend: '+plans' },
      { label: 'Avg BMI', value: (stats.avg_bmi ?? 0).toFixed ? Number(stats.avg_bmi).toFixed(1) : stats.avg_bmi || 0, icon: 'fa-weight-scale', tone: 'orange', trend: 'avg' },
      { label: 'Calorie Alerts Triggered', value: stats.alerts_today ?? 0, icon: 'fa-triangle-exclamation', tone: 'red', trend: 'today' },
      { label: 'Feedback Messages Sent', value: stats.feedback_messages_sent ?? 0, icon: 'fa-comments', tone: 'blue', trend: 'sent' },
    ];
    if (els.reportsStats) {
      els.reportsStats.innerHTML = '';
      reportCards.forEach((card) => els.reportsStats.appendChild(createStatCard(card)));
    }

    if (els.heroUsers) els.heroUsers.textContent = stats.total_users ?? 0;
    if (els.heroPlans) els.heroPlans.textContent = stats.active_plans ?? 0;
    if (els.heroAlerts) els.heroAlerts.textContent = stats.alerts_today ?? 0;
    if (els.heroLine) els.heroLine.textContent = `Average BMI is ${Number(stats.avg_bmi || 0).toFixed(1)} with ${stats.alerts_today || 0} alerts today.`;
  }

  function renderRecentUsers() {
    const rows = pageState.users.slice(0, 10);
    const tbody = qs('#recentUsersTable tbody');
    if (!tbody) return;
    tbody.innerHTML = rows.map((user) => `
      <tr>
        <td>${escapeHtml(user.name)}</td>
        <td>${escapeHtml(user.email)}</td>
        <td><span class="badge info">${escapeHtml(toTitle(user.role))}</span></td>
        <td>${escapeHtml(formatDate(user.created_at))}</td>
        <td><span class="badge ${user.status === 'active' ? 'success' : 'danger'}">${escapeHtml(toTitle(user.status))}</span></td>
      </tr>
    `).join('');
  }

  function renderUsersTable() {
    const tbody = qs('#usersTable tbody');
    if (!tbody) return;
    const filtered = pageState.users.filter((user) => {
      const q = pageState.userSearch.trim().toLowerCase();
      const matchesSearch = !q || [user.name, user.email].join(' ').toLowerCase().includes(q);
      const matchesStatus = pageState.userStatusFilter === 'all' || user.status === pageState.userStatusFilter;
      const goal = String(user.health_goal || '').toLowerCase();
      const matchesGoal = pageState.userGoalFilter === 'all' || goal.includes(pageState.userGoalFilter);
      return matchesSearch && matchesStatus && matchesGoal;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageState.usersPerPage));
    if (pageState.usersPage > totalPages) pageState.usersPage = totalPages;
    const start = (pageState.usersPage - 1) * pageState.usersPerPage;
    const pageRows = filtered.slice(start, start + pageState.usersPerPage);

    tbody.innerHTML = pageRows.map((user, index) => {
      const bmiMeta = bmiCategory(user.bmi);
      const selectedDietitian = pageState.dietitians.find((dietitian) => Number(dietitian.id) === Number(user.assigned_dietitian_id));
      return `
        <tr data-id="${user.id}">
          <td>${start + index + 1}</td>
          <td>
            <div class="name-stack">
              <div class="avatar">${escapeHtml(initials(user.name))}</div>
              <div><strong>${escapeHtml(user.name)}</strong><span>${escapeHtml(toTitle(user.role))}</span></div>
            </div>
          </td>
          <td>${escapeHtml(user.email)}</td>
          <td><span class="badge ${bmiMeta.tone}">${escapeHtml(Number(user.bmi).toFixed ? Number(user.bmi).toFixed(1) : user.bmi)} (${escapeHtml(bmiMeta.label)})</span></td>
          <td>${escapeHtml(user.health_goal || 'Other')}</td>
          <td>${escapeHtml(fmtNumber(user.calorie_limit))}</td>
          <td>${escapeHtml(user.dietary_pref || '—')}</td>
          <td>${escapeHtml(formatDate(user.created_at))}</td>
          <td><span class="badge ${user.status === 'active' ? 'success' : 'danger'}">${escapeHtml(toTitle(user.status))}</span></td>
          <td>
            <div class="actions">
              <button class="small-btn" data-action="view-user" data-id="${user.id}" title="View Profile"><i class="fa-solid fa-eye"></i></button>
              <button class="small-btn" data-action="edit-user" data-id="${user.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
              <button class="small-btn" data-action="delete-user" data-id="${user.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div>
            <select class="field" data-action="assign-dietitian" data-id="${user.id}" style="margin-top:8px; min-width: 180px;">
              <option value="">Assign Dietitian</option>
              ${pageState.dietitians.map((d) => `<option value="${d.id}" ${selectedDietitian && Number(selectedDietitian.id) === Number(d.id) ? 'selected' : ''}>${escapeHtml(d.name)}</option>`).join('')}
            </select>
          </td>
        </tr>
      `;
    }).join('');

    renderPagination(els.usersPagination, filtered.length, pageState.usersPage, pageState.usersPerPage, (page) => {
      pageState.usersPage = page;
      renderUsersTable();
    });
  }

  function renderDietitiansTable() {
    const tbody = qs('#dietitiansTable tbody');
    if (!tbody) return;
    const filtered = pageState.dietitians.filter((dietitian) => {
      const q = pageState.dietitianSearch.trim().toLowerCase();
      return !q || [dietitian.name, dietitian.email].join(' ').toLowerCase().includes(q);
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageState.dietitiansPerPage));
    if (pageState.dietitiansPage > totalPages) pageState.dietitiansPage = totalPages;
    const start = (pageState.dietitiansPage - 1) * pageState.dietitiansPerPage;
    const pageRows = filtered.slice(start, start + pageState.dietitiansPerPage);

    tbody.innerHTML = pageRows.map((dietitian, index) => `
      <tr>
        <td>${start + index + 1}</td>
        <td>
          <div class="name-stack">
            <div class="avatar">${escapeHtml(initials(dietitian.name))}</div>
            <div><strong>${escapeHtml(dietitian.name)}</strong><span>Dietitian</span></div>
          </div>
        </td>
        <td>${escapeHtml(dietitian.email)}</td>
        <td>${escapeHtml(fmtNumber(dietitian.patients))}</td>
        <td>${escapeHtml(fmtNumber(dietitian.plans_created))}</td>
        <td>${escapeHtml(fmtNumber(dietitian.feedback_given))}</td>
        <td>${escapeHtml(formatDate(dietitian.created_at))}</td>
        <td><span class="badge ${dietitian.status === 'approved' ? 'success' : 'warning'}">${escapeHtml(toTitle(dietitian.status))}</span></td>
        <td>
          <div class="actions">
            <button class="small-btn" data-action="view-dietitian" data-id="${dietitian.id}" title="View Details"><i class="fa-solid fa-eye"></i></button>
            <button class="small-btn" data-action="edit-dietitian" data-id="${dietitian.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="small-btn" data-action="reassign-patients" data-id="${dietitian.id}" title="Reassign Patients"><i class="fa-solid fa-users"></i></button>
            <button class="small-btn" data-action="delete-dietitian" data-id="${dietitian.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');

    renderPagination(els.dietitiansPagination, filtered.length, pageState.dietitiansPage, pageState.dietitiansPerPage, (page) => {
      pageState.dietitiansPage = page;
      renderDietitiansTable();
    });
  }

  function renderPlansTable() {
    const tbody = qs('#plansTable tbody');
    if (!tbody) return;
    const filtered = pageState.plans.filter((plan) => {
      const q = pageState.planSearch.trim().toLowerCase();
      const matchesSearch = !q || String(plan.user_name).toLowerCase().includes(q);
      const matchesStatus = pageState.planStatusFilter === 'all' || (pageState.planStatusFilter === 'unassigned' ? !plan.dietitian_id : plan.status === pageState.planStatusFilter);
      const matchesDietitian = pageState.planDietitianFilter === 'all' || String(plan.dietitian_id || '').includes(pageState.planDietitianFilter);
      return matchesSearch && matchesStatus && matchesDietitian;
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageState.plansPerPage));
    if (pageState.plansPage > totalPages) pageState.plansPage = totalPages;
    const start = (pageState.plansPage - 1) * pageState.plansPerPage;
    const pageRows = filtered.slice(start, start + pageState.plansPerPage);

    tbody.innerHTML = pageRows.map((plan, index) => `
      <tr>
        <td>${start + index + 1}</td>
        <td>${escapeHtml(plan.user_name)}</td>
        <td>${escapeHtml(plan.health_goal || 'Other')}</td>
        <td>${escapeHtml(plan.dietitian_name || 'Unassigned')}</td>
        <td>${escapeHtml(formatDate(plan.created_at))}</td>
        <td>${escapeHtml(fmtNumber(plan.calories))}</td>
        <td><span class="badge ${plan.status === 'active' ? 'success' : plan.status === 'unassigned' ? 'warning' : 'info'}">${escapeHtml(toTitle(plan.status))}</span></td>
        <td>
          <div class="actions">
            <button class="small-btn" data-action="view-plan" data-id="${plan.id}" title="View Plan"><i class="fa-solid fa-eye"></i></button>
            <button class="small-btn" data-action="reassign-plan" data-id="${plan.id}" title="Reassign"><i class="fa-solid fa-link"></i></button>
            <button class="small-btn" data-action="create-plan-for-user" data-id="${plan.user_id}" title="Create Plan"><i class="fa-solid fa-plus"></i></button>
            <button class="small-btn" data-action="delete-plan" data-id="${plan.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');

    renderPagination(els.plansPagination, filtered.length, pageState.plansPage, pageState.plansPerPage, (page) => {
      pageState.plansPage = page;
      renderPlansTable();
    });

    const unassignedCount = pageState.users.filter((user) => !pageState.assignments[user.id] && !pageState.plans.some((plan) => Number(plan.user_id) === Number(user.id) && plan.status === 'active')).length;
    if (unassignedCount > 0 && els.unassignedAlert) {
      els.unassignedAlert.hidden = false;
      els.unassignedAlert.innerHTML = `
        <strong>${unassignedCount} users have no diet plan assigned.</strong>
        <button class="ghost-btn" style="margin-left:12px;">Assign Now</button>
      `;
      els.unassignedAlert.querySelector('button').addEventListener('click', () => {
        pageState.planStatusFilter = 'unassigned';
        qs('#planStatusFilter').value = 'unassigned';
        setSection('plans');
        renderPlansTable();
      });
    } else if (els.unassignedAlert) {
      els.unassignedAlert.hidden = true;
    }
  }

  function renderPagination(container, totalItems, currentPage, perPage, onPage) {
    if (!container) return;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    container.innerHTML = '';
    if (totalPages <= 1) return;
    const buttons = [];
    buttons.push(createPageButton('Prev', currentPage === 1, () => onPage(Math.max(1, currentPage - 1))));
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(createPageButton(String(i), i === currentPage, () => onPage(i)));
    }
    buttons.push(createPageButton('Next', currentPage === totalPages, () => onPage(Math.min(totalPages, currentPage + 1))));
    buttons.forEach((btn) => container.appendChild(btn));
  }

  function createPageButton(label, active, onClick) {
    const button = document.createElement('button');
    button.className = `page-btn ${active ? 'active' : ''}`;
    button.textContent = label;
    button.disabled = active && (label === 'Prev' || label === 'Next');
    button.addEventListener('click', onClick);
    return button;
  }

  function renderReportsAlerts() {
    const tbody = qs('#alertTable tbody');
    if (!tbody) return;
    const source = pageState.users.map((user) => {
      const limit = Number(user.calorie_limit || 2000);
      const consumed = Number(user.food_today || 0);
      const exceeded = Math.max(0, consumed - limit);
      const ratio = limit > 0 ? exceeded / limit : 0;
      return {
        name: user.name,
        date: formatDate(user.created_at),
        consumed,
        limit,
        exceeded,
        severity: ratio > 0.2 ? 'Critical' : ratio > 0.1 ? 'Warning' : 'Caution',
        visible: exceeded > 0,
      };
    }).filter((row) => row.visible);

    tbody.innerHTML = source.slice(0, 12).map((row) => `
      <tr class="${row.severity === 'Critical' ? 'row-danger' : row.severity === 'Warning' ? 'row-warning' : ''}">
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.date)}</td>
        <td>${escapeHtml(fmtNumber(row.consumed))}</td>
        <td>${escapeHtml(fmtNumber(row.limit))}</td>
        <td>${escapeHtml(fmtNumber(row.exceeded))}</td>
        <td><span class="badge ${row.severity === 'Critical' ? 'danger' : row.severity === 'Warning' ? 'warning' : 'info'}">${escapeHtml(row.severity)}</span></td>
      </tr>
    `).join('');
  }

  function buildGoalChart() {
    const data = pageState.chartData?.health_goals || {};
    const labels = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Other'];
    const values = [
      data.weight_loss || 0,
      data.muscle_gain || 0,
      data.maintenance || 0,
      data.other || Math.max(0, pageState.users.length - ((data.weight_loss || 0) + (data.muscle_gain || 0) + (data.maintenance || 0))),
    ];
    return makeChart('goalChart', 'doughnut', {
      labels,
      datasets: [{ data: values, backgroundColor: ['#2ecc71', '#3498db', '#f39c12', '#e74c3c'], borderWidth: 0 }],
    }, { cutout: '68%' });
  }

  function buildWeeklyChart() {
    const rows = pageState.chartData?.weekly_registrations || [];
    return makeChart('weeklyChart', 'bar', {
      labels: rows.map((item) => new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [{ data: rows.map((item) => item.count), backgroundColor: '#2ecc71', borderRadius: 12 }],
    }, { legend: false, yLabel: '' });
  }

  function buildRegistrationChart() {
    const rows = pageState.chartData?.registrations || [];
    return makeChart('registrationsChart', 'line', {
      labels: rows.map((item) => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{ data: rows.map((item) => item.count), borderColor: '#2ecc71', backgroundColor: 'rgba(46,204,113,0.16)', fill: true, tension: 0.35 }],
    }, { legend: false });
  }

  function buildAlertsChart() {
    const rows = pageState.chartData?.alerts || [];
    return makeChart('alertsChart', 'bar', {
      labels: rows.map((item) => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{ data: rows.map((item) => item.count), backgroundColor: '#e74c3c', borderRadius: 10 }],
    }, { legend: false });
  }

  function buildPrefsChart() {
    const prefs = pageState.chartData?.diet_prefs || { vegetarian: 0, non_vegetarian: 0, vegan: 0 };
    return makeChart('prefsChart', 'pie', {
      labels: ['Veg', 'Non-veg', 'Vegan'],
      datasets: [{ data: [prefs.vegetarian || 0, prefs.non_vegetarian || 0, prefs.vegan || 0], backgroundColor: ['#2ecc71', '#3498db', '#f39c12'] }],
    }, { legendBottom: true });
  }

  function buildDietitianActivityChart() {
    const rows = pageState.chartData?.top_dietitians || [];
    return makeChart('dietitianActivityChart', 'bar', {
      labels: rows.map((item) => item.name || 'Unknown'),
      datasets: [{ data: rows.map((item) => Number(item.plan_count || 0)), backgroundColor: '#3498db', borderRadius: 10 }],
    }, { legend: false });
  }

  function makeChart(canvasId, type, data, options = {}) {
    if (pageState.charts[canvasId]) {
      pageState.charts[canvasId].destroy();
    }
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    const chart = new Chart(ctx, {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: options.legend !== false,
            position: options.legendBottom ? 'bottom' : 'top',
          },
          tooltip: { enabled: true },
        },
        scales: ['bar', 'line'].includes(type) ? {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(120, 140, 160, 0.12)' },
            ticks: { color: '#64748b' },
          },
          x: {
            grid: { display: false },
            ticks: { color: '#64748b' },
          },
        } : {},
      },
    });
    pageState.charts[canvasId] = chart;
    return chart;
  }

  function renderCharts() {
    buildGoalChart();
    buildWeeklyChart();
    buildRegistrationChart();
    buildAlertsChart();
    buildPrefsChart();
    buildDietitianActivityChart();
  }

  function renderSettings() {
    const form = qs('#systemSettingsForm');
    form.site_name.value = pageState.settings.site_name || fallbackSettings.site_name;
    form.default_calorie_limit.value = pageState.settings.default_calorie_limit || fallbackSettings.default_calorie_limit;
    form.allow_self_registration.value = String(pageState.settings.allow_self_registration ?? 1);
    form.default_role.value = pageState.settings.default_role || fallbackSettings.default_role;

    const profileForm = qs('#profileSettingsForm');
    profileForm.admin_name.value = pageState.settings.admin_name || pageState.currentUser.name || fallbackSettings.admin_name;
    profileForm.admin_email.value = pageState.settings.admin_email || pageState.currentUser.email || fallbackSettings.admin_email;

    const notifForm = qs('#notificationSettingsForm');
    notifForm.email_alerts.checked = Boolean(Number(pageState.settings.email_alerts ?? 1));
    notifForm.new_registration_alerts.checked = Boolean(Number(pageState.settings.new_registration_alerts ?? 1));
    notifForm.alert_threshold.value = Number(pageState.settings.alert_threshold ?? 20);
  }

  function updateTopbar() {
    const adminName = pageState.settings.admin_name || pageState.currentUser.name || 'Admin User';
    const initial = initials(adminName);
    qs('#sidebarAdminName').textContent = adminName;
    qs('#sidebarAvatar').textContent = initial;
    document.title = `${adminName} | Personalized Diet Recommendation System`;
    const today = new Date();
    els.todayDate.textContent = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  function setSection(section) {
    pageState.currentSection = section;
    qsa('.page-section').forEach((el) => el.classList.remove('active'));
    const sectionNode = qs(`#section-${section}`);
    if (sectionNode) sectionNode.classList.add('active');
    qsa('.nav-item').forEach((btn) => btn.classList.toggle('active', btn.dataset.section === section));
    const titles = {
      dashboard: ['Good morning, Admin 👋', 'Dashboard overview for the control center.'],
      users: ['User Management', 'Manage users, their health data, and assignments.'],
      dietitians: ['Dietitian Management', 'Review team workload and patient assignments.'],
      plans: ['Diet Plans', 'Monitor and manage meal plan assignment.'],
      reports: ['Reports & Analytics', 'Explore trends, alerts, and engagement.'],
      settings: ['Settings', 'Configure the system and admin profile.'],
    };
    const [title, subtitle] = titles[section] || titles.dashboard;
    if (els.pageTitle) els.pageTitle.textContent = title;
    if (els.pageSubtitle) els.pageSubtitle.textContent = subtitle;
    openSidebar(false);
    closeDrawer();
  }

  function openConfirm(title, message, onConfirm) {
    const template = qs('#confirmTemplate');
    const node = template.content.cloneNode(true).firstElementChild;
    node.querySelector('#confirmTitle').textContent = title;
    node.querySelector('#confirmMessage').textContent = message;
    node.querySelector('#confirmActionBtn').addEventListener('click', async () => {
      closeModal();
      if (onConfirm) await onConfirm();
    });
    openModal(node);
  }

  function openUserForm(user = null) {
    const template = qs('#userModalTemplate');
    if (!template || !template.content) {
      console.error('User modal template is missing.');
      return;
    }
    const node = template.content.cloneNode(true).firstElementChild;
    const form = node.querySelector('#userForm');
    const title = node.querySelector('#userModalTitle');
    if (!form || !title) {
      console.error('User form markup is incomplete.');
      return;
    }
    title.textContent = user ? 'Edit User' : 'Add User';
    setFormValue(form, 'id', user?.id || '');
    setFormValue(form, 'name', user?.name || '');
    setFormValue(form, 'email', user?.email || '');
    setFormValue(form, 'password', '');
    setFormValue(form, 'role', user?.role || 'user');
    setFormValue(form, 'status', user?.status || 'active');
    setFormValue(form, 'health_goal', user?.health_goal || 'Weight Loss');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      saveUser(new FormData(form), Boolean(user));
    });
    openModal(node);
  }

  function openDietitianForm(dietitian = null) {
    const template = qs('#dietitianModalTemplate');
    if (!template || !template.content) {
      console.error('Dietitian modal template is missing.');
      return;
    }
    const node = template.content.cloneNode(true).firstElementChild;
    const form = node.querySelector('#dietitianForm');
    const title = node.querySelector('#dietitianModalTitle');
    if (!form || !title) {
      console.error('Dietitian form markup is incomplete.');
      return;
    }
    title.textContent = dietitian ? 'Edit Dietitian' : 'Add Dietitian';
    setFormValue(form, 'id', dietitian?.id || '');
    setFormValue(form, 'name', dietitian?.name || '');
    setFormValue(form, 'email', dietitian?.email || '');
    setFormValue(form, 'password', '');
    setFormValue(form, 'status', dietitian?.status || 'approved');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      saveDietitian(new FormData(form), Boolean(dietitian));
    });
    openModal(node);
  }

  function openPlanForm(plan = null, userId = null) {
    const template = qs('#planModalTemplate');
    if (!template || !template.content) {
      console.error('Plan modal template is missing.');
      return;
    }
    const node = template.content.cloneNode(true).firstElementChild;
    const form = node.querySelector('#planForm');
    const title = node.querySelector('#planModalTitle');
    if (!form || !title) {
      console.error('Plan form markup is incomplete.');
      return;
    }
    title.textContent = plan ? 'Edit Plan' : 'Create Plan';
    const userSelect = node.querySelector('#planUserSelect');
    const dietitianSelect = node.querySelector('#planDietitianSelect');
    if (userSelect) {
      userSelect.innerHTML = pageState.users.map((user) => `<option value="${user.id}" ${Number(user.id) === Number(userId || plan?.user_id) ? 'selected' : ''}>${escapeHtml(user.name)}</option>`).join('');
    }
    if (dietitianSelect) {
      dietitianSelect.innerHTML = `<option value="">Unassigned</option>` + pageState.dietitians.map((dietitian) => `<option value="${dietitian.id}" ${Number(dietitian.id) === Number(plan?.dietitian_id) ? 'selected' : ''}>${escapeHtml(dietitian.name)}</option>`).join('');
    }
    setFormValue(form, 'id', plan?.id || '');
    setFormValue(form, 'user_id', plan?.user_id || userId || pageState.users[0]?.id || '');
    setFormValue(form, 'dietitian_id', plan?.dietitian_id || '');
    setFormValue(form, 'title', plan?.title || plan?.plan_name || 'Admin Assigned Plan');
    setFormValue(form, 'calories', plan?.calories || 2000);
    setFormValue(form, 'duration_days', plan?.duration_days || 30);
    setFormValue(form, 'status', plan?.status || 'active');
    setFormValue(form, 'notes', plan?.notes || '');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      savePlan(new FormData(form), Boolean(plan));
    });
    openModal(node);
  }

  function openUserDrawer(user) {
    const bmiMeta = bmiCategory(user.bmi);
    const assignedDietitian = pageState.dietitians.find((dietitian) => Number(dietitian.id) === Number(user.assigned_dietitian_id));
    const plan = pageState.plans.find((item) => Number(item.user_id) === Number(user.id) && item.status === 'active');
    const consumed = Number(user.food_today || 0);
    const limit = Number(user.calorie_limit || 2000);
    const warning = consumed > limit;
    openDrawer(`
      <div class="modal__head">
        <div>
          <h3>${escapeHtml(user.name)}</h3>
          <p>${escapeHtml(user.email)}</p>
        </div>
        <button type="button" class="icon-btn" data-close-drawer><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="name-stack" style="margin-bottom:16px;">
        <div class="avatar" style="width:64px;height:64px;font-size:1.2rem;">${escapeHtml(initials(user.name))}</div>
        <div>
          <div class="badge ${user.status === 'active' ? 'success' : 'danger'}">${escapeHtml(toTitle(user.status))}</div>
          <div style="margin-top:8px;color:var(--muted);">Role: ${escapeHtml(toTitle(user.role))}</div>
        </div>
      </div>
      <div class="panel" style="box-shadow:none;margin-bottom:16px;">
        <strong>Health Data</strong>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px;">
          <div><span class="badge info">Age</span><div>${escapeHtml(user.age || '—')}</div></div>
          <div><span class="badge info">Weight</span><div>${escapeHtml(user.weight || '—')} kg</div></div>
          <div><span class="badge info">Height</span><div>${escapeHtml(user.height || '—')} cm</div></div>
          <div><span class="badge ${bmiMeta.tone}">BMI</span><div>${escapeHtml(Number(user.bmi).toFixed ? Number(user.bmi).toFixed(1) : user.bmi || '—')} (${escapeHtml(bmiMeta.label)})</div></div>
        </div>
        <div style="margin-top:14px;">
          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span>Daily calorie limit</span><strong>${escapeHtml(fmtNumber(limit))}</strong>
          </div>
          <div style="height:10px;background:#e5efe8;border-radius:999px;overflow:hidden;margin-top:8px;">
            <div style="height:100%;width:${Math.min(100, (consumed / Math.max(limit, 1)) * 100)}%;background:${warning ? 'var(--danger)' : 'var(--primary)'}"></div>
          </div>
          <small>${escapeHtml(fmtNumber(consumed))} consumed today ${warning ? '(limit exceeded)' : ''}</small>
        </div>
      </div>
      <div class="panel" style="box-shadow:none;margin-bottom:16px;">
        <strong>Diet Profile</strong>
        <p>Activity level: ${escapeHtml(user.activity_level || '—')}</p>
        <p>Dietary preference: ${escapeHtml(user.dietary_pref || '—')}</p>
        <p>Health goal: ${escapeHtml(user.health_goal || '—')}</p>
        <p>Assigned dietitian: ${escapeHtml(assignedDietitian ? assignedDietitian.name : 'Unassigned')}</p>
        <p>Diet plan status: ${escapeHtml(plan ? 'Active plan' : user.plan_status || 'No plan assigned')}</p>
      </div>
      <div class="panel" style="box-shadow:none;">
        <strong>Food Log Summary</strong>
        <p>${warning ? '<span class="badge danger">Warning</span>' : '<span class="badge success">Within limit</span>'} Today: ${escapeHtml(fmtNumber(consumed))} kcal</p>
      </div>
    `);
    qs('[data-close-drawer]', els.drawer).addEventListener('click', closeDrawer);
  }

  function openDietitianDrawer(dietitian) {
    const patients = dietitian.assigned_patients.length ? dietitian.assigned_patients : pageState.users.filter((user) => Number(user.assigned_dietitian_id) === Number(dietitian.id)).map((user) => user.name);
    const patientList = patients.length ? patients.map((name) => `<li>${escapeHtml(name)}</li>`).join('') : '<li>No assigned patients</li>';
    openDrawer(`
      <div class="modal__head">
        <div><h3>${escapeHtml(dietitian.name)}</h3><p>${escapeHtml(dietitian.email)}</p></div>
        <button type="button" class="icon-btn" data-close-drawer><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="panel" style="box-shadow:none;">
        <p>Status: <span class="badge ${dietitian.status === 'approved' ? 'success' : 'warning'}">${escapeHtml(toTitle(dietitian.status))}</span></p>
        <p>Assigned patients: ${escapeHtml(fmtNumber(dietitian.patients))}</p>
        <p>Plans created: ${escapeHtml(fmtNumber(dietitian.plans_created))}</p>
        <p>Feedback given: ${escapeHtml(fmtNumber(dietitian.feedback_given))}</p>
      </div>
      <div class="panel" style="box-shadow:none;">
        <strong>Assigned Patients</strong>
        <ul>${patientList}</ul>
      </div>
    `);
    qs('[data-close-drawer]', els.drawer).addEventListener('click', closeDrawer);
  }

  function openPlanDrawer(plan) {
    const meals = plan.meals || sampleMeals(plan.title || plan.plan_name || 'Daily plan');
    const slotMarkup = [
      ['Morning', '🌅', meals.morning || []],
      ['Afternoon', '☀️', meals.afternoon || []],
      ['Evening', '🌆', meals.evening || []],
      ['Night', '🌙', meals.night || []],
    ].map(([label, emoji, items]) => `
      <div class="panel" style="box-shadow:none;margin-bottom:12px;">
        <strong>${emoji} ${label}</strong>
        <ul>${items.map((item) => `<li>${escapeHtml(item.item || item.food || item.name)} - ${escapeHtml(fmtNumber(item.calories || item.kcal || 0))} kcal</li>`).join('')}</ul>
        <small>Total: ${escapeHtml(fmtNumber(items.reduce((sum, item) => sum + Number(item.calories || item.kcal || 0), 0)))} kcal</small>
      </div>
    `).join('');
    openDrawer(`
      <div class="modal__head">
        <div><h3>${escapeHtml(plan.user_name)}</h3><p>${escapeHtml(plan.dietitian_name || 'Unassigned')}</p></div>
        <button type="button" class="icon-btn" data-close-drawer><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="panel" style="box-shadow:none;">
        <p><strong>Goal:</strong> ${escapeHtml(plan.health_goal || 'Other')}</p>
        <p><strong>Daily calorie target:</strong> ${escapeHtml(fmtNumber(plan.calories))}</p>
        <p><strong>Status:</strong> <span class="badge ${plan.status === 'active' ? 'success' : plan.status === 'unassigned' ? 'warning' : 'info'}">${escapeHtml(toTitle(plan.status))}</span></p>
        <p><strong>Notes:</strong> ${escapeHtml(plan.notes || 'No notes yet')}</p>
      </div>
      ${slotMarkup}
      <div class="panel" style="box-shadow:none;">
        <strong>Dietitian Notes</strong>
        <p>${escapeHtml(plan.notes || 'No notes recorded yet.')}</p>
      </div>
    `);
    qs('[data-close-drawer]', els.drawer).addEventListener('click', closeDrawer);
  }

  async function saveUser(formData, isEdit) {
    const payload = Object.fromEntries(formData.entries());
    payload.id = payload.id ? Number(payload.id) : undefined;
    payload.name = payload.name?.trim();
    payload.email = payload.email?.trim();
    payload.password = payload.password || undefined;
    payload.role = payload.role || 'user';
    payload.status = payload.status || 'active';
    payload.health_goal = payload.health_goal || 'Weight Loss';
    if (!payload.name || !payload.email) {
      showToast('Name and email are required.', 'error');
      return;
    }
    setLoading(true);
    try {
      await apiRequest('admin/users.php', { method: 'POST', body: payload });
      showToast(isEdit ? 'User updated successfully.' : 'User created successfully.');
      await loadData();
      closeModal();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function saveDietitian(formData, isEdit) {
    const payload = Object.fromEntries(formData.entries());
    payload.id = payload.id ? Number(payload.id) : undefined;
    payload.name = payload.name?.trim();
    payload.email = payload.email?.trim();
    payload.password = payload.password || undefined;
    if (!payload.name || !payload.email) {
      showToast('Name and email are required.', 'error');
      return;
    }
    setLoading(true);
    try {
      await apiRequest('admin/dietitians.php', { method: 'POST', body: payload });
      showToast(isEdit ? 'Dietitian updated successfully.' : 'Dietitian created successfully.');
      await loadData();
      closeModal();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function savePlan(formData, isEdit) {
    const payload = Object.fromEntries(formData.entries());
    payload.id = payload.id ? Number(payload.id) : undefined;
    payload.user_id = Number(payload.user_id || 0);
    payload.dietitian_id = payload.dietitian_id ? Number(payload.dietitian_id) : null;
    payload.title = payload.title?.trim();
    payload.calories = Number(payload.calories || 0);
    payload.duration_days = Number(payload.duration_days || 0);
    if (!payload.user_id || !payload.title) {
      showToast('User and plan name are required.', 'error');
      return;
    }
    setLoading(true);
    try {
      await apiRequest('admin/plans.php', { method: 'POST', body: payload });
      showToast(isEdit ? 'Plan updated successfully.' : 'Plan created successfully.');
      await loadData();
      closeModal();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function deleteEntity(path, id, message) {
    openConfirm('Are you sure?', message, async () => {
      setLoading(true);
      try {
        await apiRequest(path, { method: 'DELETE', body: { id } });
        showToast('Deleted successfully.');
        await loadData();
      } catch (error) {
        showToast(error.message, 'error');
      } finally {
        setLoading(false);
      }
    });
  }

  async function assignDietitianToUser(userId, dietitianId) {
    pageState.assignments[userId] = dietitianId ? Number(dietitianId) : null;
    localStorage.setItem('dietitianAssignments', JSON.stringify(pageState.assignments));
    pageState.users = normalizeUsers(pageState.users);
    renderUsersTable();
    renderRecentUsers();
    showToast('Dietitian assignment updated.', 'success');
  }

  function openUserSelectPlan(userId) {
    setSection('plans');
    openPlanForm(null, userId);
  }

  function exportCsv(rows, filename) {
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function exportUsersCsv() {
    exportCsv(
      [
        ['Name', 'Email', 'BMI', 'Health Goal', 'Calorie Limit', 'Dietary Pref', 'Joined', 'Status'],
        ...pageState.users.map((user) => [user.name, user.email, user.bmi, user.health_goal, user.calorie_limit, user.dietary_pref, formatDate(user.created_at), user.status]),
      ],
      'users.csv'
    );
    showToast('Users CSV exported.', 'success');
  }

  function exportDietitiansCsv() {
    exportCsv(
      [
        ['Name', 'Email', 'Patients', 'Plans Created', 'Feedback Given', 'Joined', 'Status'],
        ...pageState.dietitians.map((dietitian) => [dietitian.name, dietitian.email, dietitian.patients, dietitian.plans_created, dietitian.feedback_given, formatDate(dietitian.created_at), dietitian.status]),
      ],
      'dietitians.csv'
    );
    showToast('Dietitians CSV exported.', 'success');
  }

  function exportPlansCsv() {
    exportCsv(
      [
        ['User Name', 'Health Goal', 'Dietitian', 'Created', 'Calorie Target', 'Status'],
        ...pageState.plans.map((plan) => [plan.user_name, plan.health_goal, plan.dietitian_name || 'Unassigned', formatDate(plan.created_at), plan.calories, plan.status]),
      ],
      'plans.csv'
    );
    showToast('Plans CSV exported.', 'success');
  }

  function exportFullReport() {
    const report = [
      ['Metric', 'Value'],
      ['Total Users', pageState.stats?.total_users ?? 0],
      ['Total Dietitians', pageState.stats?.total_dietitians ?? 0],
      ['Active Plans', pageState.stats?.active_plans ?? 0],
      ['Alerts Today', pageState.stats?.alerts_today ?? 0],
      ['Average BMI', pageState.stats?.avg_bmi ?? 0],
      ['Feedback Messages Sent', pageState.stats?.feedback_messages_sent ?? 0],
    ];
    exportCsv(report, 'full-report.csv');
    showToast('Full report exported.', 'success');
  }

  async function loadData() {
    setLoading(true);
    try {
      const [statsRes, usersRes, dietitiansRes, plansRes, settingsRes] = await Promise.all([
        apiRequestFallback('admin/stats.php', {}, { success: true, data: { total_users: defaultUsers.length, total_dietitians: defaultDietitians.length, active_plans: 2, alerts_today: 1, avg_bmi: 24.1, feedback_messages_sent: 9, chart: {
          weekly_registrations: [{ date: '2026-06-02', count: 3 }, { date: '2026-06-03', count: 4 }, { date: '2026-06-04', count: 2 }, { date: '2026-06-05', count: 5 }, { date: '2026-06-06', count: 6 }, { date: '2026-06-07', count: 3 }, { date: '2026-06-08', count: 4 }],
          registrations: [],
          alerts: [],
          diet_prefs: { vegetarian: 4, non_vegetarian: 4, vegan: 1 },
          health_goals: { weight_loss: 3, muscle_gain: 2, maintenance: 1, other: 1 },
          top_dietitians: [{ name: 'Dr. Amanda Lee', plan_count: 5 }, { name: 'Dr. Robert Chen', plan_count: 4 }],
        }}}),
        apiRequestFallback('admin/users.php?limit=50', {}, { success: true, data: defaultUsers }),
        apiRequestFallback('admin/dietitians.php', {}, { success: true, data: defaultDietitians }),
        apiRequestFallback('admin/plans.php', {}, { success: true, data: defaultPlans }),
        apiRequestFallback('admin/settings.php', {}, { success: true, data: fallbackSettings }),
      ]);

      pageState.stats = statsRes.data || {};
      pageState.chartData = pageState.stats.chart || statsRes.data?.chart || {};
      pageState.settings = settingsRes.data || fallbackSettings;
      pageState.dietitians = normalizeDietitians(dietitiansRes.data || defaultDietitians);
      pageState.users = normalizeUsers(usersRes.data || defaultUsers);
      pageState.plans = normalizePlans(plansRes.data || defaultPlans);

      pageState.users = normalizeUsers(pageState.users);
      pageState.plans = normalizePlans(pageState.plans);
      pageState.dietitians = normalizeDietitians(pageState.dietitians);

      populatePlanFilters();
      updateTopbar();
      renderDashboardStats();
      renderRecentUsers();
      renderUsersTable();
      renderDietitiansTable();
      renderPlansTable();
      renderReportsAlerts();
      renderSettings();
      renderCharts();
    } catch (error) {
      showToast(error.message || 'Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function populatePlanFilters() {
    const select = qs('#planDietitianFilter');
    if (select) {
      select.innerHTML = `<option value="all">All Dietitians</option>` + pageState.dietitians.map((dietitian) => `<option value="${dietitian.id}">${escapeHtml(dietitian.name)}</option>`).join('');
    }
    const planUserSelect = qs('#planUserSelect');
    if (planUserSelect) {
      planUserSelect.innerHTML = pageState.users.map((user) => `<option value="${user.id}">${escapeHtml(user.name)}</option>`).join('');
    }
    const planDietitianSelect = qs('#planDietitianSelect');
    if (planDietitianSelect) {
      planDietitianSelect.innerHTML = `<option value="">Unassigned</option>` + pageState.dietitians.map((dietitian) => `<option value="${dietitian.id}">${escapeHtml(dietitian.name)}</option>`).join('');
    }
  }

  function setupEvents() {
    if (els.sidebarToggle) els.sidebarToggle.addEventListener('click', () => openSidebar(true));
    if (els.overlay) els.overlay.addEventListener('click', () => {
      openSidebar(false);
      closeDrawer();
      closeModal();
    });
    if (els.refreshBtn) els.refreshBtn.addEventListener('click', loadData);
    if (els.logoutBtn) els.logoutBtn.addEventListener('click', logout);

    qsa('.nav-item').forEach((btn) => btn.addEventListener('click', () => setSection(btn.dataset.section)));
    qsa('.tab').forEach((tab) => tab.addEventListener('click', () => {
      qsa('.tab').forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
      qsa('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === tab.dataset.tab));
    }));

    const addUserBtn = qs('#addUserBtn');
    if (addUserBtn) addUserBtn.addEventListener('click', () => openUserForm());
    
    const addDietitianBtn = qs('#addDietitianBtn');
    if (addDietitianBtn) addDietitianBtn.addEventListener('click', () => openDietitianForm());
    
    const createPlanBtn = qs('#createPlanBtn');
    if (createPlanBtn) createPlanBtn.addEventListener('click', () => openPlanForm());
    
    const exportUsersBtn = qs('#exportUsersBtn');
    if (exportUsersBtn) exportUsersBtn.addEventListener('click', exportUsersCsv);
    
    const exportDietitiansBtn = qs('#exportDietitiansBtn');
    if (exportDietitiansBtn) exportDietitiansBtn.addEventListener('click', exportDietitiansCsv);
    
    const exportPlansBtn = qs('#exportPlansBtn');
    if (exportPlansBtn) exportPlansBtn.addEventListener('click', exportPlansCsv);
    
    const exportFullReportBtn = qs('#exportFullReportBtn');
    if (exportFullReportBtn) exportFullReportBtn.addEventListener('click', exportFullReport);
    
    const exportReportUsersBtn = qs('#exportReportUsersBtn');
    if (exportReportUsersBtn) exportReportUsersBtn.addEventListener('click', exportUsersCsv);
    
    const exportReportPlansBtn = qs('#exportReportPlansBtn');
    if (exportReportPlansBtn) exportReportPlansBtn.addEventListener('click', exportPlansCsv);

    const userSearch = qs('#userSearch');
    if (userSearch) userSearch.addEventListener('input', debounce((event) => {
      pageState.userSearch = event.target.value;
      pageState.usersPage = 1;
      renderUsersTable();
    }, 300));
    
    const userStatusFilter = qs('#userStatusFilter');
    if (userStatusFilter) userStatusFilter.addEventListener('change', (event) => {
      pageState.userStatusFilter = event.target.value;
      pageState.usersPage = 1;
      renderUsersTable();
    });
    
    const userGoalFilter = qs('#userGoalFilter');
    if (userGoalFilter) userGoalFilter.addEventListener('change', (event) => {
      pageState.userGoalFilter = event.target.value;
      pageState.usersPage = 1;
      renderUsersTable();
    });

    const dietitianSearch = qs('#dietitianSearch');
    if (dietitianSearch) dietitianSearch.addEventListener('input', debounce((event) => {
      pageState.dietitianSearch = event.target.value;
      pageState.dietitiansPage = 1;
      renderDietitiansTable();
    }, 300));

    const planSearch = qs('#planSearch');
    if (planSearch) planSearch.addEventListener('input', debounce((event) => {
      pageState.planSearch = event.target.value;
      pageState.plansPage = 1;
      renderPlansTable();
    }, 300));
    
    const planStatusFilter = qs('#planStatusFilter');
    if (planStatusFilter) planStatusFilter.addEventListener('change', (event) => {
      pageState.planStatusFilter = event.target.value;
      pageState.plansPage = 1;
      renderPlansTable();
    });
    
    const planDietitianFilter = qs('#planDietitianFilter');
    if (planDietitianFilter) planDietitianFilter.addEventListener('change', (event) => {
      pageState.planDietitianFilter = event.target.value;
      pageState.plansPage = 1;
      renderPlansTable();
    });

    const reportRange = qs('#reportRange');
    if (reportRange) reportRange.addEventListener('change', (event) => {
      pageState.reportRange = Number(event.target.value);
      loadReportsData();
    });

    const systemSettingsForm = qs('#systemSettingsForm');
    if (systemSettingsForm) systemSettingsForm.addEventListener('submit', saveSystemSettings);
    
    const profileSettingsForm = qs('#profileSettingsForm');
    if (profileSettingsForm) profileSettingsForm.addEventListener('submit', saveProfileSettings);
    
    const notificationSettingsForm = qs('#notificationSettingsForm');
    if (notificationSettingsForm) notificationSettingsForm.addEventListener('submit', saveNotificationSettings);

    document.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]');
      if (!action) return;
      const { action: name, id } = action.dataset;
      handleAction(name, id, event.target);
    });

    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-close-drawer]')) {
        closeDrawer();
      }
    });
  }

  function handleAction(name, id, target) {
    const userId = Number(id);
    if (name === 'view-user') {
      openUserDrawer(pageState.users.find((user) => Number(user.id) === userId));
      return;
    }
    if (name === 'edit-user') {
      openUserForm(pageState.users.find((user) => Number(user.id) === userId));
      return;
    }
    if (name === 'delete-user') {
      const user = pageState.users.find((item) => Number(item.id) === userId);
      deleteEntity('admin/users.php', userId, `Are you sure? This will delete all data for ${user?.name || 'this user'}.`);
      return;
    }
    if (name === 'assign-dietitian') {
      assignDietitianToUser(userId, target.value);
      return;
    }
    if (name === 'view-dietitian') {
      openDietitianDrawer(pageState.dietitians.find((dietitian) => Number(dietitian.id) === userId));
      return;
    }
    if (name === 'edit-dietitian') {
      openDietitianForm(pageState.dietitians.find((dietitian) => Number(dietitian.id) === userId));
      return;
    }
    if (name === 'reassign-patients') {
      reassignPatients(pageState.dietitians.find((dietitian) => Number(dietitian.id) === userId));
      return;
    }
    if (name === 'delete-dietitian') {
      const dietitian = pageState.dietitians.find((item) => Number(item.id) === userId);
      deleteEntity('admin/dietitians.php', userId, `Are you sure? This dietitian currently has ${dietitian?.patients || 0} patients.`);
      return;
    }
    if (name === 'view-plan') {
      openPlanDrawer(pageState.plans.find((plan) => Number(plan.id) === userId));
      return;
    }
    if (name === 'reassign-plan') {
      openPlanForm(pageState.plans.find((plan) => Number(plan.id) === userId));
      return;
    }
    if (name === 'create-plan-for-user') {
      openPlanForm(null, userId);
      return;
    }
    if (name === 'delete-plan') {
      deleteEntity('admin/plans.php', userId, 'Are you sure you want to delete this plan?');
    }
  }

  function reassignPatients(dietitian) {
    if (!dietitian) return;
    const otherDietitians = pageState.dietitians.filter((item) => Number(item.id) !== Number(dietitian.id));
    openDrawer(`
      <div class="modal__head">
        <div><h3>Reassign Patients</h3><p>${escapeHtml(dietitian.name)}</p></div>
        <button type="button" class="icon-btn" data-close-drawer><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="panel" style="box-shadow:none;">
        <p>This will move assigned patients to another dietitian. For now the UI keeps this selection locally until a dedicated backend endpoint is added.</p>
        <label style="display:grid;gap:8px;">
          <span>Select new dietitian</span>
          <select class="field" id="reassignDietitianSelect">
            ${otherDietitians.map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join('')}
          </select>
        </label>
        <div class="modal__actions" style="justify-content:flex-start;">
          <button class="primary-btn" id="saveReassignBtn">Save</button>
        </div>
      </div>
    `);
    qs('[data-close-drawer]', els.drawer).addEventListener('click', closeDrawer);
    qs('#saveReassignBtn').addEventListener('click', () => {
      const newId = Number(qs('#reassignDietitianSelect').value);
      pageState.users.forEach((user) => {
        if (Number(user.assigned_dietitian_id) === Number(dietitian.id)) {
          pageState.assignments[user.id] = newId;
        }
      });
      localStorage.setItem('dietitianAssignments', JSON.stringify(pageState.assignments));
      pageState.users = normalizeUsers(pageState.users);
      renderUsersTable();
      renderDietitiansTable();
      closeDrawer();
      showToast('Patients reassigned locally.', 'success');
    });
  }

  function debounce(fn, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  }

  async function loadReportsData() {
    try {
      setLoading(true);
      const range = pageState.reportRange;
      const [statsRes] = await Promise.all([
        apiRequestFallback(`admin/stats.php?range=${range}`, {}, { success: true, data: { ...pageState.stats, chart: pageState.chartData } }),
      ]);
      pageState.stats = statsRes.data || pageState.stats;
      pageState.chartData = statsRes.data?.chart || pageState.chartData;
      renderDashboardStats();
      renderCharts();
      renderReportsAlerts();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function saveSystemSettings(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      site_name: form.site_name.value,
      default_calorie_limit: Number(form.default_calorie_limit.value || 2000),
      allow_self_registration: form.allow_self_registration.value,
      default_role: form.default_role.value,
    };
    setLoading(true);
    try {
      await apiRequest('admin/settings.php', { method: 'POST', body: payload });
      showToast('System settings saved.', 'success');
      await loadData();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function saveProfileSettings(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.new_password.value && form.new_password.value !== form.confirm_password.value) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    const payload = {
      admin_name: form.admin_name.value,
      admin_email: form.admin_email.value,
    };
    if (form.new_password.value) {
      payload.admin_password = form.new_password.value;
    }
    setLoading(true);
    try {
      await apiRequest('admin/settings.php', { method: 'POST', body: payload });
      showToast('Admin profile saved.', 'success');
      await loadData();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function saveNotificationSettings(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      email_alerts: form.email_alerts.checked ? 1 : 0,
      new_registration_alerts: form.new_registration_alerts.checked ? 1 : 0,
      alert_threshold: Number(form.alert_threshold.value || 20),
    };
    setLoading(true);
    try {
      await apiRequest('admin/settings.php', { method: 'POST', body: { ...pageState.settings, ...payload } });
      showToast('Notification settings saved.', 'success');
      await loadData();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await fetch(apiUrl('auth/logout.php'), { method: 'POST', credentials: 'include' });
    } catch {
      // local cleanup still happens below
    } finally {
      localStorage.removeItem('dietSystemUser');
      localStorage.removeItem('dietitianAssignments');
      window.location.href = 'login.html';
    }
  }

  async function guardAdmin() {
    const localUser = safeJson(localStorage.getItem('dietSystemUser'), null);
    let remoteUser = null;
    try {
      const status = await apiRequest('auth/status.php');
      const data = status.data || {};
      const remoteRole = String(data.role || '').toLowerCase();
      if (data.authenticated && (remoteRole.includes('admin') || remoteRole === 'super admin')) {
        remoteUser = {
          name: data.name || localUser.name || 'Admin User',
          email: data.email || localUser.email || 'admin@diet.com',
          role: 'admin',
        };
      }
    } catch {
      // Local login state is enough to continue when the backend is unavailable.
    }

    const activeUser = remoteUser || localUser;
    const activeRole = String(activeUser?.role || '').toLowerCase();

    if (!activeUser || (!activeRole.includes('admin') && activeRole !== 'super admin')) {
      window.location.href = 'login.html';
      return false;
    }

    pageState.currentUser = {
      name: activeUser.name || 'Admin User',
      email: activeUser.email || 'admin@diet.com',
      role: 'admin',
    };

    if (remoteUser && !localUser) {
      try {
        localStorage.setItem('dietSystemUser', JSON.stringify(pageState.currentUser));
      } catch {
        // Ignore storage issues and continue with the server session.
      }
    }

    return true;
  }

  function bindWindowResize() {
    window.addEventListener('resize', () => {
      Object.values(pageState.charts).forEach((chart) => chart && chart.resize && chart.resize());
    });
  }

  function boot() {
    try {
      els.sidebar = qs('#sidebar');
      els.overlay = qs('#overlay');
      els.drawer = qs('#drawer');
      els.modalLayer = qs('#modalLayer');
      els.toastStack = qs('#toastStack');
      els.loadingLayer = qs('#loadingLayer');
      els.sidebarToggle = qs('#sidebarToggle');
      els.refreshBtn = qs('#refreshBtn');
      els.logoutBtn = qs('#logoutBtn');
      els.todayDate = qs('#todayDate');
      els.pageTitle = qs('#pageTitle');
      els.pageSubtitle = qs('#pageSubtitle');
      els.dashboardStats = qs('#dashboardStats');
      els.reportsStats = qs('#reportsStats');
      els.unassignedAlert = qs('#unassignedAlert');
      els.usersPagination = qs('#usersPagination');
      els.dietitiansPagination = qs('#dietitiansPagination');
      els.plansPagination = qs('#plansPagination');
      els.heroUsers = qs('#heroUsers');
      els.heroPlans = qs('#heroPlans');
      els.heroAlerts = qs('#heroAlerts');
      els.heroLine = qs('#heroLine');

      setupEvents();
      bindWindowResize();
      setLoading(true);
      guardAdmin().then((ok) => {
        if (!ok) {
          setLoading(false);
          return;
        }
        loadData();
        setSection('dashboard');
      }).catch((error) => {
        console.error('Admin guard failed:', error);
        setLoading(false);
        window.location.href = 'login.html';
      });
    } catch (error) {
      console.error('Admin dashboard boot failed:', error);
      setLoading(false);
      window.location.href = 'login.html';
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
