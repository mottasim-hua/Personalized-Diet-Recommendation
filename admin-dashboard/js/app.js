/**
 * Admin Dashboard - Vanilla JavaScript
 * No frameworks, no build tools - Pure JS with HTML and CSS
 */

// ============================================
// STATE & CONFIGURATION
// ============================================

let currentPage = 'dashboard';
let currentUserPage = 1;
let itemsPerPage = 10;

// Mock data
const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-0123', joined: '2024-01-15', status: 'active' },
    { id: 2, name: 'Sarah Miller', email: 'sarah@example.com', phone: '555-0124', joined: '2023-12-08', status: 'active' },
    { id: 3, name: 'Robert Johnson', email: 'robert@example.com', phone: '555-0125', joined: '2024-02-01', status: 'inactive' },
    { id: 4, name: 'Emma Wilson', email: 'emma@example.com', phone: '555-0126', joined: '2024-01-20', status: 'active' },
    { id: 5, name: 'Michael Brown', email: 'michael@example.com', phone: '555-0127', joined: '2023-11-15', status: 'active' },
    { id: 6, name: 'Lisa Davis', email: 'lisa@example.com', phone: '555-0128', joined: '2024-02-10', status: 'active' },
    { id: 7, name: 'James Taylor', email: 'james@example.com', phone: '555-0129', joined: '2024-01-05', status: 'inactive' },
    { id: 8, name: 'Jessica Garcia', email: 'jessica@example.com', phone: '555-0130', joined: '2024-02-15', status: 'active' },
    { id: 9, name: 'David Martinez', email: 'david@example.com', phone: '555-0131', joined: '2023-12-20', status: 'active' },
    { id: 10, name: 'Amanda Lee', email: 'amanda@example.com', phone: '555-0132', joined: '2024-01-25', status: 'active' },
];

const mockDietitians = [
    { id: 1, name: 'Dr. Sarah Smith', email: 'sarah.smith@example.com', qualification: 'BS Nutrition', specialization: 'Weight Loss', status: 'approved' },
    { id: 2, name: 'Dr. James Brown', email: 'james.brown@example.com', qualification: 'MS Dietetics', specialization: 'Sports Nutrition', status: 'approved' },
    { id: 3, name: 'Dr. Emily Davis', email: 'emily.davis@example.com', qualification: 'PhD Nutrition', specialization: 'Medical Nutrition', status: 'pending' },
    { id: 4, name: 'Dr. Michael Wilson', email: 'michael.wilson@example.com', qualification: 'BS Nutrition', specialization: 'Pediatric Nutrition', status: 'approved' },
    { id: 5, name: 'Dr. Jennifer Miller', email: 'jennifer.miller@example.com', qualification: 'MS Dietetics', specialization: 'Gerontology', status: 'approved' },
];

const mockPlans = [
    { id: 1, name: 'Quick Start Weight Loss', category: 'Weight Loss', duration: '30 days', price: '$49', status: 'active' },
    { id: 2, name: 'Muscle Building Plan', category: 'Muscle Gain', duration: '60 days', price: '$79', status: 'active' },
    { id: 3, name: 'Maintenance Plus', category: 'Maintenance', duration: '90 days', price: '$99', status: 'active' },
    { id: 4, name: 'Athletic Performance', category: 'Athletic', duration: '45 days', price: '$89', status: 'active' },
    { id: 5, name: 'Beginner Fitness', category: 'Weight Loss', duration: '21 days', price: '$39', status: 'inactive' },
];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    setupCharts();
    loadTheme();
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            navigateTo(page);
        });
    });

    // Menu toggle
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });

    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('active');
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Notifications
    document.getElementById('notificationBtn').addEventListener('click', () => {
        document.getElementById('notificationPanel').classList.toggle('active');
    });

    // User menu
    document.getElementById('userMenuBtn').addEventListener('click', () => {
        document.getElementById('userDropdown').classList.toggle('active');
    });

    // Close dropdowns on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
            document.getElementById('userDropdown').classList.remove('active');
        }
        if (!e.target.closest('.notifications')) {
            document.getElementById('notificationPanel').classList.remove('active');
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('adminToken');
            window.location.href = '/';
        }
    });

    // Modal
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('formModal').addEventListener('click', (e) => {
        if (e.target.id === 'formModal') closeModal();
    });

    // Users page
    document.getElementById('addUserBtn')?.addEventListener('click', showAddUserForm);
    document.getElementById('usersSearch')?.addEventListener('input', filterUsers);
    document.getElementById('usersFilter')?.addEventListener('change', filterUsers);
    document.getElementById('prevPage')?.addEventListener('click', () => previousPage());
    document.getElementById('nextPage')?.addEventListener('click', () => nextPage());

    // Dietitians page
    document.getElementById('addDietitianBtn')?.addEventListener('click', showAddDietitianForm);
    document.getElementById('dietitiansSearch')?.addEventListener('input', filterDietitians);
    document.getElementById('dietitiansFilter')?.addEventListener('change', filterDietitians);

    // Plans page
    document.getElementById('addPlanBtn')?.addEventListener('click', showAddPlanForm);
    document.getElementById('plansSearch')?.addEventListener('input', filterPlans);

    // Reports
    document.getElementById('downloadReportBtn')?.addEventListener('click', downloadReport);
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

// ============================================
// NAVIGATION
// ============================================

function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');

    // Remove active from nav links
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    // Show selected page
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.style.display = 'block';
        document.querySelector(`[data-page="${page}"]`).classList.add('active');
        currentPage = page;

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            users: 'Manage Users',
            dietitians: 'Manage Dietitians',
            plans: 'Manage Plans',
            reports: 'Reports & Analytics'
        };
        document.getElementById('pageTitle').textContent = titles[page];

        // Load page-specific data
        if (page === 'users') loadUsersTable();
        if (page === 'dietitians') loadDietitianTable();
        if (page === 'plans') loadPlansTable();

        // Close sidebar on mobile
        if (window.innerWidth < 768) {
            document.getElementById('sidebar').classList.remove('active');
        }
    }
}

// ============================================
// USERS PAGE
// ============================================

function loadUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    const start = (currentUserPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedUsers = mockUsers.slice(start, end);

    tbody.innerHTML = paginatedUsers.map(user => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem;">
                        ${user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight: 600; color: var(--text-color);">${user.name}</div>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${formatDate(user.joined)}</td>
            <td><span class="status-badge ${user.status}">${user.status === 'active' ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon edit" onclick="editUser(${user.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteUser(${user.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Update pagination
    const totalPages = Math.ceil(mockUsers.length / itemsPerPage);
    document.getElementById('currentPage').textContent = currentUserPage;
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('prevPage').disabled = currentUserPage === 1;
    document.getElementById('nextPage').disabled = currentUserPage === totalPages;
}

function previousPage() {
    if (currentUserPage > 1) {
        currentUserPage--;
        loadUsersTable();
        document.querySelector('.page-content').scrollTop = 0;
    }
}

function nextPage() {
    const totalPages = Math.ceil(mockUsers.length / itemsPerPage);
    if (currentUserPage < totalPages) {
        currentUserPage++;
        loadUsersTable();
        document.querySelector('.page-content').scrollTop = 0;
    }
}

function filterUsers() {
    const search = document.getElementById('usersSearch').value.toLowerCase();
    const status = document.getElementById('usersFilter').value;

    const filtered = mockUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search);
        const matchesStatus = !status || user.status === status;
        return matchesSearch && matchesStatus;
    });

    const tbody = document.getElementById('usersTableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--gray-500);">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.slice(0, itemsPerPage).map(user => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem;">
                        ${user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight: 600; color: var(--text-color);">${user.name}</div>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${formatDate(user.joined)}</td>
            <td><span class="status-badge ${user.status}">${user.status === 'active' ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon edit" onclick="editUser(${user.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteUser(${user.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function showAddUserForm() {
    document.getElementById('modalTitle').textContent = 'Add New User';
    document.getElementById('modalBody').innerHTML = `
        <form onsubmit="handleAddUser(event)">
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" required>
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="tel" required>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select required>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Add User</button>
            </div>
        </form>
    `;
    openModal();
}

function handleAddUser(e) {
    e.preventDefault();
    showToast('User added successfully!', 'success');
    closeModal();
    loadUsersTable();
}

function editUser(id) {
    const user = mockUsers.find(u => u.id === id);
    if (user) {
        document.getElementById('modalTitle').textContent = `Edit User: ${user.name}`;
        document.getElementById('modalBody').innerHTML = `
            <form onsubmit="handleEditUser(${id}, event)">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" value="${user.name}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" value="${user.email}" required>
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" value="${user.phone}" required>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select required>
                        <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        `;
        openModal();
    }
}

function handleEditUser(id, e) {
    e.preventDefault();
    showToast('User updated successfully!', 'success');
    closeModal();
    loadUsersTable();
}

function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        mockUsers.splice(mockUsers.findIndex(u => u.id === id), 1);
        showToast('User deleted successfully!', 'success');
        loadUsersTable();
    }
}

// ============================================
// DIETITIANS PAGE
// ============================================

function loadDietitianTable() {
    const tbody = document.getElementById('dietitiansTableBody');
    tbody.innerHTML = mockDietitians.map(dt => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem;">
                        ${dt.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight: 600; color: var(--text-color);">${dt.name}</div>
                    </div>
                </div>
            </td>
            <td>${dt.email}</td>
            <td>${dt.qualification}</td>
            <td>${dt.specialization}</td>
            <td><span class="status-badge ${dt.status}">${dt.status === 'approved' ? 'Approved' : 'Pending'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon edit" onclick="editDietitian(${dt.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteDietitian(${dt.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterDietitians() {
    const search = document.getElementById('dietitiansSearch').value.toLowerCase();
    const status = document.getElementById('dietitiansFilter').value;

    const filtered = mockDietitians.filter(dt => {
        const matchesSearch = dt.name.toLowerCase().includes(search) || dt.email.toLowerCase().includes(search);
        const matchesStatus = !status || dt.status === status;
        return matchesSearch && matchesStatus;
    });

    const tbody = document.getElementById('dietitiansTableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--gray-500);">No dietitians found</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(dt => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem;">
                        ${dt.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight: 600; color: var(--text-color);">${dt.name}</div>
                    </div>
                </div>
            </td>
            <td>${dt.email}</td>
            <td>${dt.qualification}</td>
            <td>${dt.specialization}</td>
            <td><span class="status-badge ${dt.status}">${dt.status === 'approved' ? 'Approved' : 'Pending'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon edit" onclick="editDietitian(${dt.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteDietitian(${dt.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function showAddDietitianForm() {
    document.getElementById('modalTitle').textContent = 'Add New Dietitian';
    document.getElementById('modalBody').innerHTML = `
        <form onsubmit="handleAddDietitian(event)">
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" required>
            </div>
            <div class="form-group">
                <label>Qualification</label>
                <input type="text" required>
            </div>
            <div class="form-group">
                <label>Specialization</label>
                <input type="text" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Dietitian</button>
            </div>
        </form>
    `;
    openModal();
}

function handleAddDietitian(e) {
    e.preventDefault();
    showToast('Dietitian added successfully!', 'success');
    closeModal();
    loadDietitianTable();
}

function editDietitian(id) {
    const dt = mockDietitians.find(d => d.id === id);
    if (dt) {
        document.getElementById('modalTitle').textContent = `Edit Dietitian: ${dt.name}`;
        document.getElementById('modalBody').innerHTML = `
            <form onsubmit="handleEditDietitian(${id}, event)">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" value="${dt.name}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" value="${dt.email}" required>
                </div>
                <div class="form-group">
                    <label>Qualification</label>
                    <input type="text" value="${dt.qualification}" required>
                </div>
                <div class="form-group">
                    <label>Specialization</label>
                    <input type="text" value="${dt.specialization}" required>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select required>
                        <option value="approved" ${dt.status === 'approved' ? 'selected' : ''}>Approved</option>
                        <option value="pending" ${dt.status === 'pending' ? 'selected' : ''}>Pending</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        `;
        openModal();
    }
}

function handleEditDietitian(id, e) {
    e.preventDefault();
    showToast('Dietitian updated successfully!', 'success');
    closeModal();
    loadDietitianTable();
}

function deleteDietitian(id) {
    if (confirm('Are you sure you want to delete this dietitian?')) {
        mockDietitians.splice(mockDietitians.findIndex(d => d.id === id), 1);
        showToast('Dietitian deleted successfully!', 'success');
        loadDietitianTable();
    }
}

// ============================================
// PLANS PAGE
// ============================================

function loadPlansTable() {
    const tbody = document.getElementById('plansTableBody');
    tbody.innerHTML = mockPlans.map(plan => `
        <tr>
            <td><strong>${plan.name}</strong></td>
            <td>${plan.category}</td>
            <td>${plan.duration}</td>
            <td>${plan.price}</td>
            <td><span class="status-badge ${plan.status}">${plan.status === 'active' ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon edit" onclick="editPlan(${plan.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deletePlan(${plan.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterPlans() {
    const search = document.getElementById('plansSearch').value.toLowerCase();
    const filtered = mockPlans.filter(plan => plan.name.toLowerCase().includes(search));

    const tbody = document.getElementById('plansTableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--gray-500);">No plans found</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(plan => `
        <tr>
            <td><strong>${plan.name}</strong></td>
            <td>${plan.category}</td>
            <td>${plan.duration}</td>
            <td>${plan.price}</td>
            <td><span class="status-badge ${plan.status}">${plan.status === 'active' ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon edit" onclick="editPlan(${plan.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deletePlan(${plan.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function showAddPlanForm() {
    document.getElementById('modalTitle').textContent = 'Create New Plan';
    document.getElementById('modalBody').innerHTML = `
        <form onsubmit="handleAddPlan(event)">
            <div class="form-group">
                <label>Plan Name</label>
                <input type="text" required>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select required>
                    <option value="">Select Category</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Athletic">Athletic</option>
                </select>
            </div>
            <div class="form-group">
                <label>Duration</label>
                <input type="text" placeholder="e.g., 30 days" required>
            </div>
            <div class="form-group">
                <label>Price</label>
                <input type="text" placeholder="e.g., $49" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Plan</button>
            </div>
        </form>
    `;
    openModal();
}

function handleAddPlan(e) {
    e.preventDefault();
    showToast('Plan created successfully!', 'success');
    closeModal();
    loadPlansTable();
}

function editPlan(id) {
    const plan = mockPlans.find(p => p.id === id);
    if (plan) {
        document.getElementById('modalTitle').textContent = `Edit Plan: ${plan.name}`;
        document.getElementById('modalBody').innerHTML = `
            <form onsubmit="handleEditPlan(${id}, event)">
                <div class="form-group">
                    <label>Plan Name</label>
                    <input type="text" value="${plan.name}" required>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select required>
                        <option value="Weight Loss" ${plan.category === 'Weight Loss' ? 'selected' : ''}>Weight Loss</option>
                        <option value="Muscle Gain" ${plan.category === 'Muscle Gain' ? 'selected' : ''}>Muscle Gain</option>
                        <option value="Maintenance" ${plan.category === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
                        <option value="Athletic" ${plan.category === 'Athletic' ? 'selected' : ''}>Athletic</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Duration</label>
                    <input type="text" value="${plan.duration}" required>
                </div>
                <div class="form-group">
                    <label>Price</label>
                    <input type="text" value="${plan.price}" required>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select required>
                        <option value="active" ${plan.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${plan.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        `;
        openModal();
    }
}

function handleEditPlan(id, e) {
    e.preventDefault();
    showToast('Plan updated successfully!', 'success');
    closeModal();
    loadPlansTable();
}

function deletePlan(id) {
    if (confirm('Are you sure you want to delete this plan?')) {
        mockPlans.splice(mockPlans.findIndex(p => p.id === id), 1);
        showToast('Plan deleted successfully!', 'success');
        loadPlansTable();
    }
}

// ============================================
// CHARTS
// ============================================

let userGrowthChart, planDistributionChart, revenueChart, subscriptionChart;

function setupCharts() {
    setTimeout(() => {
        if (document.getElementById('userGrowthChart')) {
            createUserGrowthChart();
        }
        if (document.getElementById('planDistributionChart')) {
            createPlanDistributionChart();
        }
        if (document.getElementById('revenueChart')) {
            createRevenueChart();
        }
        if (document.getElementById('subscriptionChart')) {
            createSubscriptionChart();
        }
    }, 100);
}

function createUserGrowthChart() {
    const ctx = document.getElementById('userGrowthChart').getContext('2d');
    userGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'New Users',
                data: [120, 190, 150, 220, 280, 320],
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.3,
                fill: true,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#22c55e',
                pointBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'var(--gray-500)'
                    },
                    grid: {
                        color: 'var(--border-color)'
                    }
                },
                x: {
                    ticks: {
                        color: 'var(--gray-500)'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function createPlanDistributionChart() {
    const ctx = document.getElementById('planDistributionChart').getContext('2d');
    planDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Athletic'],
            datasets: [{
                data: [24, 18, 32, 15],
                backgroundColor: [
                    '#667eea',
                    '#f093fb',
                    '#4facfe',
                    '#fa709a'
                ],
                borderColor: 'var(--bg-color)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'var(--text-color)',
                        padding: 15
                    }
                }
            }
        }
    });
}

function createRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Revenue',
                data: [8500, 12000, 10500, 13500],
                backgroundColor: '#22c55e',
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'var(--gray-500)',
                        callback: (value) => '$' + value.toLocaleString()
                    },
                    grid: {
                        color: 'var(--border-color)'
                    }
                },
                x: {
                    ticks: {
                        color: 'var(--gray-500)'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function createSubscriptionChart() {
    const ctx = document.getElementById('subscriptionChart').getContext('2d');
    subscriptionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Active Subscriptions',
                data: [450, 520, 480, 610, 750, 890],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.3,
                fill: true,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'var(--gray-500)'
                    },
                    grid: {
                        color: 'var(--border-color)'
                    }
                },
                x: {
                    ticks: {
                        color: 'var(--gray-500)'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ============================================
// REPORTS
// ============================================

function downloadReport() {
    let csv = 'Report Generated: ' + new Date().toLocaleString() + '\n\n';
    csv += 'USERS REPORT\n';
    csv += 'Name,Email,Phone,Joined,Status\n';
    mockUsers.forEach(user => {
        csv += `"${user.name}","${user.email}","${user.phone}","${user.joined}","${user.status}"\n`;
    });
    csv += '\nDIETITIANS REPORT\n';
    csv += 'Name,Email,Qualification,Specialization,Status\n';
    mockDietitians.forEach(dt => {
        csv += `"${dt.name}","${dt.email}","${dt.qualification}","${dt.specialization}","${dt.status}"\n`;
    });

    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = `Admin_Report_${new Date().getTime()}.csv`;
    link.click();

    showToast('Report downloaded successfully!', 'success');
}

// ============================================
// MODAL
// ============================================

function openModal() {
    document.getElementById('formModal').classList.add('active');
}

function closeModal() {
    document.getElementById('formModal').classList.remove('active');
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type]} toast-icon"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// THEME
// ============================================

function loadTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon('sun');
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark ? 'sun' : 'moon');
    showToast(isDark ? 'Dark mode enabled' : 'Light mode enabled', 'success');
}

function updateThemeIcon(icon) {
    const btn = document.getElementById('themeToggle');
    btn.querySelector('i').className = `fas fa-${icon}`;
}

// ============================================
// UTILITIES
// ============================================

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        document.getElementById('userDropdown')?.classList.remove('active');
    }
    if (!e.target.closest('.notifications')) {
        document.getElementById('notificationPanel')?.classList.remove('active');
    }
});
