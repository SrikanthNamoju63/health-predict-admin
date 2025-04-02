import { authService } from './api/auth.js';
import { medicineService } from './api/medicines.js';
import { orderService } from './api/orders.js';
import { analyticsService } from './api/analytics.js';

class AdminApp {
    constructor() {
        this.currentUser = null;
        this.salesChart = null;
        this.ordersChart = null;
        
        // DOM Elements
        this.loginModal = document.getElementById('login-modal');
        this.loginForm = document.getElementById('login-form');
        this.loginError = document.getElementById('login-error');
        this.adminContainer = document.querySelector('.admin-container');
        
        // Initialize the app
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.setupEventListeners();
    }

    async checkAuth() {
        try {
            this.currentUser = await authService.getCurrentUser();
            this.updateUserDisplay();
            this.loginModal.classList.remove('active');
            this.adminContainer.style.display = 'flex';
            this.renderAdminPanel();
            this.loadDashboardData();
        } catch (error) {
            this.showLogin();
        }
    }

    showLogin() {
        this.loginModal.classList.add('active');
        this.adminContainer.style.display = 'none';
    }

    updateUserDisplay() {
        if (this.currentUser) {
            const usernameDisplay = document.getElementById('admin-username-display');
            if (usernameDisplay) {
                usernameDisplay.textContent = this.currentUser.username;
            }
        }
    }

    renderAdminPanel() {
        this.adminContainer.innerHTML = `
            <aside class="sidebar">
                <div class="logo">
                    <i class="fas fa-heartbeat"></i>
                    <h2>Health Predict</h2>
                </div>
                <nav>
                    <ul>
                        <li class="active" data-section="dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</li>
                        <li data-section="medicines"><i class="fas fa-pills"></i> Medicines</li>
                        <li data-section="orders"><i class="fas fa-shopping-cart"></i> Orders</li>
                        <li data-section="analytics"><i class="fas fa-chart-line"></i> Analytics</li>
                        <li data-section="settings"><i class="fas fa-cog"></i> Settings</li>
                    </ul>
                </nav>
            </aside>

            <main class="main-content">
                <header class="header">
                    <div class="search-bar">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Search...">
                    </div>
                    <div class="user-info">
                        <span id="admin-username-display">Admin</span>
                        <div class="user-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="dropdown-menu">
                            <a href="#" id="profile-link">Profile</a>
                            <a href="#" id="logout-link">Logout</a>
                        </div>
                    </div>
                </header>

                <section class="content-section active" id="dashboard">
                    <h1>Dashboard Overview</h1>
                    <div class="stats-container">
                        <div class="stat-card">
                            <div class="stat-icon" style="background-color: #4e73df;">
                                <i class="fas fa-pills"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Total Medicines</h3>
                                <p id="total-medicines">0</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background-color: #1cc88a;">
                                <i class="fas fa-shopping-cart"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Total Orders</h3>
                                <p id="total-orders">0</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background-color: #36b9cc;">
                                <i class="fas fa-user-clock"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Pending Orders</h3>
                                <p id="pending-orders">0</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background-color: #f6c23e;">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Completed Orders</h3>
                                <p id="completed-orders">0</p>
                            </div>
                        </div>
                    </div>

                    <div class="recent-orders">
                        <h2>Recent Orders</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Medicines</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="recent-orders-table">
                                <!-- Filled by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </section>

                <section class="content-section" id="medicines">
                    <div class="section-header">
                        <h1>Medicine Management</h1>
                        <button id="add-medicine-btn" class="btn-primary">
                            <i class="fas fa-plus"></i> Add Medicine
                        </button>
                    </div>

                    <div class="medicine-filters">
                        <div class="filter-group">
                            <label for="category-filter">Category:</label>
                            <select id="category-filter">
                                <option value="all">All Categories</option>
                                <!-- Categories will be loaded dynamically -->
                            </select>
                        </div>
                        <div class="search-group">
                            <i class="fas fa-search"></i>
                            <input type="text" id="medicine-search" placeholder="Search medicines...">
                        </div>
                        <div class="action-group">
                            <button id="export-medicines" class="btn-secondary">
                                <i class="fas fa-file-export"></i> Export
                            </button>
                            <button id="import-medicines" class="btn-secondary">
                                <i class="fas fa-file-import"></i> Import
                            </button>
                        </div>
                    </div>

                    <table class="medicine-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Expiry</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="medicine-table-body">
                            <!-- Filled by JavaScript -->
                        </tbody>
                    </table>

                    <!-- Add/Edit Medicine Modal -->
                    <div class="modal" id="medicine-modal">
                        <div class="modal-content">
                            <span class="close-btn">&times;</span>
                            <h2 id="modal-title">Add New Medicine</h2>
                            <form id="medicine-form">
                                <input type="hidden" id="medicine-id">
                                <div class="form-group">
                                    <label for="medicine-name">Medicine Name</label>
                                    <input type="text" id="medicine-name" required>
                                </div>
                                <div class="form-group">
                                    <label for="medicine-description">Description</label>
                                    <textarea id="medicine-description" rows="3"></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="medicine-category">Category</label>
                                    <select id="medicine-category" required>
                                        <!-- Categories will be loaded dynamically -->
                                    </select>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="medicine-price">Price (₹)</label>
                                        <input type="number" id="medicine-price" min="0" step="0.01" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="medicine-stock">Stock Quantity</label>
                                        <input type="number" id="medicine-stock" min="0" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="medicine-expiry">Expiry Date</label>
                                        <input type="date" id="medicine-expiry">
                                    </div>
                                    <div class="form-group">
                                        <label for="medicine-barcode">Barcode</label>
                                        <input type="text" id="medicine-barcode">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="medicine-image">Image URL</label>
                                    <input type="text" id="medicine-image" placeholder="https://example.com/image.jpg">
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="btn-secondary close-btn">Cancel</button>
                                    <button type="submit" class="btn-primary">Save Medicine</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Import Medicines Modal -->
                    <div class="modal" id="import-modal">
                        <div class="modal-content">
                            <span class="close-btn">&times;</span>
                            <h2>Import Medicines</h2>
                            <div class="import-instructions">
                                <p>Upload a CSV file with the following columns:</p>
                                <ul>
                                    <li>name (required)</li>
                                    <li>description</li>
                                    <li>category</li>
                                    <li>price (required)</li>
                                    <li>stock (required)</li>
                                    <li>expiry_date (YYYY-MM-DD)</li>
                                    <li>barcode</li>
                                    <li>image_url</li>
                                </ul>
                            </div>
                            <form id="import-form">
                                <div class="form-group">
                                    <label for="import-file">CSV File</label>
                                    <input type="file" id="import-file" accept=".csv" required>
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="btn-secondary close-btn">Cancel</button>
                                    <button type="submit" class="btn-primary">Import</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>

                <section class="content-section" id="orders">
                    <h1>Order Management</h1>
                    
                    <div class="order-filters">
                        <div class="filter-group">
                            <label for="order-status-filter">Status:</label>
                            <select id="order-status-filter">
                                <option value="all">All Orders</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="order-date-filter">Date:</label>
                            <select id="order-date-filter">
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                        <div class="search-group">
                            <i class="fas fa-search"></i>
                            <input type="text" id="order-search" placeholder="Search orders...">
                        </div>
                    </div>

                    <table class="order-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="order-table-body">
                            <!-- Filled by JavaScript -->
                        </tbody>
                    </table>

                    <!-- Order Detail Modal -->
                    <div class="modal" id="order-modal">
                        <div class="modal-content wide-modal">
                            <span class="close-btn">&times;</span>
                            <h2>Order Details <span id="order-id-title"></span></h2>
                            
                            <div class="order-detail-container">
                                <div class="order-info">
                                    <h3>Order Information</h3>
                                    <p><strong>Order ID:</strong> <span id="detail-order-id"></span></p>
                                    <p><strong>Customer:</strong> <span id="detail-customer"></span></p>
                                    <p><strong>Date:</strong> <span id="detail-date"></span></p>
                                    <p><strong>Status:</strong> 
                                        <select id="detail-status">
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </p>
                                    <p><strong>Address:</strong> <span id="detail-address"></span></p>
                                    <p><strong>Contact:</strong> <span id="detail-contact"></span></p>
                                    <p><strong>Payment Method:</strong> <span id="detail-payment"></span></p>
                                    <p><strong>Prescription:</strong> 
                                        <a href="#" id="prescription-link" target="_blank">View Prescription</a>
                                    </p>
                                </div>
                                
                                <div class="order-items">
                                    <h3>Order Items</h3>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Medicine</th>
                                                <th>Price</th>
                                                <th>Quantity</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody id="order-items-body">
                                            <!-- Filled by JavaScript -->
                                        </tbody>
                                    </table>
                                    <div class="order-total">
                                        <p><strong>Subtotal:</strong> ₹<span id="detail-subtotal">0.00</span></p>
                                        <p><strong>Shipping:</strong> ₹<span id="detail-shipping">0.00</span></p>
                                        <p><strong>Discount:</strong> ₹<span id="detail-discount">0.00</span></p>
                                        <p><strong>Total:</strong> ₹<span id="detail-total">0.00</span></p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary close-btn">Close</button>
                                <button type="button" class="btn-primary" id="save-order-btn">Save Changes</button>
                                <button type="button" class="btn-danger" id="cancel-order-btn">Cancel Order</button>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="content-section" id="analytics">
                    <h1>Sales Analytics</h1>
                    <div class="analytics-filters">
                        <div class="filter-group">
                            <label for="analytics-period">Period:</label>
                            <select id="analytics-period">
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                                <option value="quarter">Last 3 Months</option>
                                <option value="year">Last 12 Months</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                        <div class="filter-group" id="custom-range-group" style="display: none;">
                            <label for="start-date">From:</label>
                            <input type="date" id="start-date">
                            <label for="end-date">To:</label>
                            <input type="date" id="end-date">
                        </div>
                        <button id="apply-filters" class="btn-primary">Apply</button>
                    </div>
                    
                    <div class="analytics-container">
                        <div class="chart-container">
                            <canvas id="sales-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <canvas id="orders-chart"></canvas>
                        </div>
                    </div>
                    
                    <div class="analytics-container">
                        <div class="top-products">
                            <h3>Top Selling Medicines</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Medicine</th>
                                        <th>Sales</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody id="top-products-body">
                                    <!-- Filled by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                        <div class="low-stock">
                            <h3>Low Stock Alerts</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Medicine</th>
                                        <th>Current Stock</th>
                                        <th>Reorder Level</th>
                                    </tr>
                                </thead>
                                <tbody id="low-stock-body">
                                    <!-- Filled by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section class="content-section" id="settings">
                    <h1>Admin Settings</h1>
                    <div class="settings-container">
                        <div class="settings-form">
                            <h3>Account Settings</h3>
                            <div class="form-group">
                                <label for="admin-username">Username</label>
                                <input type="text" id="admin-username" value="admin" disabled>
                            </div>
                            <div class="form-group">
                                <label for="admin-email">Email</label>
                                <input type="email" id="admin-email" value="admin@healthpredict.com">
                            </div>
                            <div class="form-group">
                                <label for="admin-password">New Password</label>
                                <input type="password" id="admin-password" placeholder="Leave blank to keep current">
                            </div>
                            <div class="form-group">
                                <label for="admin-confirm-password">Confirm Password</label>
                                <input type="password" id="admin-confirm-password">
                            </div>
                            <div class="form-group">
                                <label for="two-factor">Two-Factor Authentication</label>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="two-factor">
                                    <span class="slider"></span>
                                </div>
                            </div>
                            <button class="btn-primary" id="update-account-btn">Update Account</button>
                        </div>
                        <div class="settings-form">
                            <h3>Application Settings</h3>
                            <div class="form-group">
                                <label for="app-name">Application Name</label>
                                <input type="text" id="app-name" value="Health Predict">
                            </div>
                            <div class="form-group">
                                <label for="delivery-fee">Delivery Fee (₹)</label>
                                <input type="number" id="delivery-fee" value="50">
                            </div>
                            <div class="form-group">
                                <label for="min-order">Minimum Order (₹)</label>
                                <input type="number" id="min-order" value="100">
                            </div>
                            <div class="form-group">
                                <label for="currency">Currency</label>
                                <select id="currency">
                                    <option value="INR">Indian Rupee (₹)</option>
                                    <option value="USD">US Dollar ($)</option>
                                    <option value="EUR">Euro (€)</option>
                                    <option value="GBP">British Pound (£)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="timezone">Timezone</label>
                                <select id="timezone">
                                    <option value="Asia/Kolkata">(GMT+5:30) India</option>
                                    <option value="America/New_York">(GMT-5:00) Eastern Time</option>
                                    <option value="Europe/London">(GMT+0:00) London</option>
                                </select>
                            </div>
                            <button class="btn-primary" id="save-settings-btn">Save Settings</button>
                        </div>
                    </div>
                </section>
            </main>
        `;

        this.updateUserDisplay();
    }

    setupEventListeners() {
        // Login form
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Sidebar navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.sidebar nav ul li')) {
                const link = e.target.closest('.sidebar nav ul li');
                this.handleSidebarNavigation(link);
            }
        });
        
        // Medicine management
        document.addEventListener('click', (e) => {
            if (e.target.id === 'add-medicine-btn' || e.target.closest('#add-medicine-btn')) {
                this.openMedicineModal();
            }
            
            if (e.target.classList.contains('edit-medicine') || e.target.closest('.edit-medicine')) {
                const btn = e.target.classList.contains('edit-medicine') ? e.target : e.target.closest('.edit-medicine');
                this.openMedicineModal(btn.getAttribute('data-id'));
            }
            
            if (e.target.classList.contains('delete-medicine') || e.target.closest('.delete-medicine')) {
                const btn = e.target.classList.contains('delete-medicine') ? e.target : e.target.closest('.delete-medicine');
                this.deleteMedicine(btn.getAttribute('data-id'));
            }
            
            if (e.target.id === 'export-medicines' || e.target.closest('#export-medicines')) {
                this.exportMedicines();
            }
            
            if (e.target.id === 'import-medicines' || e.target.closest('#import-medicines')) {
                document.getElementById('import-modal').classList.add('active');
            }
            
            if (e.target.classList.contains('view-order') || e.target.closest('.view-order')) {
                const btn = e.target.classList.contains('view-order') ? e.target : e.target.closest('.view-order');
                this.openOrderModal(btn.getAttribute('data-id'));
            }
            
            if (e.target.id === 'save-order-btn' || e.target.closest('#save-order-btn')) {
                this.saveOrderChanges();
            }
            
            if (e.target.id === 'cancel-order-btn' || e.target.closest('#cancel-order-btn')) {
                this.cancelOrder();
            }
            
            if (e.target.id === 'update-account-btn' || e.target.closest('#update-account-btn')) {
                this.updateAccount();
            }
            
            if (e.target.id === 'save-settings-btn' || e.target.closest('#save-settings-btn')) {
                this.saveSettings();
            }
            
            if (e.target.id === 'logout-link' || e.target.closest('#logout-link')) {
                e.preventDefault();
                this.handleLogout();
            }
            
            if (e.target.classList.contains('close-btn')) {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
        
        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'medicine-form') {
                e.preventDefault();
                this.handleMedicineFormSubmit(e);
            }
            
            if (e.target.id === 'import-form') {
                e.preventDefault();
                this.handleImportSubmit(e);
            }
        });
        
        // Input changes
        document.addEventListener('input', (e) => {
            if (e.target.id === 'medicine-search') {
                this.loadMedicines();
            }
            
            if (e.target.id === 'order-search') {
                this.loadOrders();
            }
        });
        
        document.addEventListener('change', (e) => {
            if (e.target.id === 'category-filter') {
                this.loadMedicines();
            }
            
            if (e.target.id === 'order-status-filter' || e.target.id === 'order-date-filter') {
                this.loadOrders();
            }
            
            if (e.target.id === 'analytics-period') {
                if (e.target.value === 'custom') {
                    document.getElementById('custom-range-group').style.display = 'flex';
                } else {
                    document.getElementById('custom-range-group').style.display = 'none';
                }
            }
            
            if (e.target.id === 'apply-filters') {
                this.loadAnalyticsData();
            }
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            // Show loading state
            const submitBtn = this.loginForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<div class="loading-spinner"></div>';
            submitBtn.disabled = true;
            
            // Authenticate user
            this.currentUser = await authService.login(username, password);
            
            // Hide error if previously shown
            this.loginError.style.display = 'none';
            
            // Update UI
            this.updateUserDisplay();
            
            // Hide login modal and show admin panel
            this.loginModal.classList.remove('active');
            this.adminContainer.style.display = 'flex';
            
            // Render admin panel
            this.renderAdminPanel();
            
            // Load initial data
            this.loadDashboardData();
            this.loadMedicines();
        } catch (error) {
            console.error('Login failed:', error);
            this.loginError.textContent = error.message;
            this.loginError.style.display = 'block';
            
            // Reset button
            const submitBtn = this.loginForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = 'Login';
            submitBtn.disabled = false;
        }
    }

    handleLogout() {
        authService.logout();
        this.currentUser = null;
        this.showLogin();
    }

    handleSidebarNavigation(link) {
        // Remove active class from all links
        document.querySelectorAll('.sidebar nav ul li').forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        // Hide all content sections
        document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
        
        // Show the corresponding content section
        const sectionId = link.getAttribute('data-section');
        document.getElementById(sectionId).classList.add('active');
        
        // Refresh data if needed
        if (sectionId === 'dashboard') {
            this.loadDashboardData();
        } else if (sectionId === 'medicines') {
            this.loadMedicines();
        } else if (sectionId === 'orders') {
            this.loadOrders();
        } else if (sectionId === 'analytics') {
            this.loadAnalyticsData();
        }
    }

    async loadDashboardData() {
        try {
            // Get stats
            const stats = await analyticsService.getDashboardStats();
            
            // Update stats
            document.getElementById('total-medicines').textContent = stats.totalMedicines;
            document.getElementById('total-orders').textContent = stats.totalOrders;
            document.getElementById('pending-orders').textContent = stats.pendingOrders;
            document.getElementById('completed-orders').textContent = stats.completedOrders;
            
            // Update recent orders table
            const recentOrdersTable = document.getElementById('recent-orders-table');
            recentOrdersTable.innerHTML = '';
            
            stats.recentOrders.forEach(order => {
                const medicinesList = order.items.map(item => item.name).join(', ');
                
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.customer}</td>
                    <td>${medicinesList}</td>
                    <td>₹${order.total.toFixed(2)}</td>
                    <td><span class="status-badge status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                    <td class="action-buttons">
                        <button class="btn-primary view-order" data-id="${order.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
                
                recentOrdersTable.appendChild(row);
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showAlert('Failed to load dashboard data. Please try again.', 'error');
        }
    }

    async loadMedicines() {
        try {
            const searchTerm = document.getElementById('medicine-search').value;
            const category = document.getElementById('category-filter').value;
            
            const medicines = await medicineService.getMedicines(searchTerm, category);
            this.medicineTableBody.innerHTML = '';
            
            medicines.forEach(medicine => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${medicine.id}</td>
                    <td>${medicine.name}</td>
                    <td>${medicine.description}</td>
                    <td>${this.formatCategory(medicine.category)}</td>
                    <td>₹${medicine.price.toFixed(2)}</td>
                    <td>${medicine.stock}</td>
                    <td>${medicine.expiry ? new Date(medicine.expiry).toLocaleDateString() : 'N/A'}</td>
                    <td class="action-buttons">
                        <button class="btn-primary edit-medicine" data-id="${medicine.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-danger delete-medicine" data-id="${medicine.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                
                this.medicineTableBody.appendChild(row);
            });
            
            // Load categories if not already loaded
            if (document.getElementById('category-filter').options.length <= 1) {
                this.loadCategories();
            }
        } catch (error) {
            console.error('Failed to load medicines:', error);
            this.showAlert('Failed to load medicines. Please try again.', 'error');
        }
    }

    async loadCategories() {
        try {
            const categories = await medicineService.getCategories();
            const categorySelects = document.querySelectorAll('#category-filter, #medicine-category');
            
            categorySelects.forEach(select => {
                // Clear existing options except the first one
                while (select.options.length > 1) {
                    select.remove(1);
                }
                
                // Add new options
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = this.formatCategory(category);
                    select.appendChild(option);
                });
            });
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    formatCategory(category) {
        const categories = {
            'pain-relief': 'Pain Relief',
            'antibiotics': 'Antibiotics',
            'allergy': 'Allergy',
            'digestive': 'Digestive',
            'respiratory': 'Respiratory',
            'cardiovascular': 'Cardiovascular',
            'other': 'Other'
        };
        
        return categories[category] || category;
    }

    async openMedicineModal(medicineId = null) {
        const modalTitle = document.getElementById('modal-title');
        
        if (medicineId) {
            // Edit mode
            modalTitle.textContent = 'Edit Medicine';
            try {
                const medicine = await medicineService.getMedicine(medicineId);
                
                document.getElementById('medicine-id').value = medicine.id;
                document.getElementById('medicine-name').value = medicine.name;
                document.getElementById('medicine-description').value = medicine.description;
                document.getElementById('medicine-category').value = medicine.category;
                document.getElementById('medicine-price').value = medicine.price;
                document.getElementById('medicine-stock').value = medicine.stock;
                document.getElementById('medicine-expiry').value = medicine.expiry ? medicine.expiry.split('T')[0] : '';
                document.getElementById('medicine-barcode').value = medicine.barcode || '';
                document.getElementById('medicine-image').value = medicine.image || '';
            } catch (error) {
                console.error('Failed to load medicine:', error);
                this.showAlert('Failed to load medicine details. Please try again.', 'error');
                return;
            }
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Medicine';
            document.getElementById('medicine-form').reset();
            document.getElementById('medicine-id').value = '';
        }
        
        document.getElementById('medicine-modal').classList.add('active');
    }

    async handleMedicineFormSubmit(e) {
        e.preventDefault();
        
        const id = document.getElementById('medicine-id').value;
        const name = document.getElementById('medicine-name').value;
        const description = document.getElementById('medicine-description').value;
        const category = document.getElementById('medicine-category').value;
        const price = parseFloat(document.getElementById('medicine-price').value);
        const stock = parseInt(document.getElementById('medicine-stock').value);
        const expiry = document.getElementById('medicine-expiry').value;
        const barcode = document.getElementById('medicine-barcode').value;
        const image = document.getElementById('medicine-image').value;
        
        try {
            if (id) {
                // Update existing medicine
                await medicineService.updateMedicine(id, {
                    name, description, category, price, stock, expiry, barcode, image
                });
                this.showAlert('Medicine updated successfully', 'success');
            } else {
                // Add new medicine
                await medicineService.addMedicine({
                    name, description, category, price, stock, expiry, barcode, image
                });
                this.showAlert('Medicine added successfully', 'success');
            }
            
            this.loadMedicines();
            this.loadDashboardData();
            document.getElementById('medicine-modal').classList.remove('active');
        } catch (error) {
            console.error('Failed to save medicine:', error);
            this.showAlert(`Failed to save medicine: ${error.message}`, 'error');
        }
    }

    async deleteMedicine(medicineId) {
        if (confirm('Are you sure you want to delete this medicine?')) {
            try {
                await medicineService.deleteMedicine(medicineId);
                this.showAlert('Medicine deleted successfully', 'success');
                this.loadMedicines();
                this.loadDashboardData();
            } catch (error) {
                console.error('Failed to delete medicine:', error);
                this.showAlert('Failed to delete medicine. Please try again.', 'error');
            }
        }
    }

    async exportMedicines() {
        try {
            const medicines = await medicineService.getMedicines();
            const csv = Papa.unparse(medicines);
            
            // Create download link
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `medicines_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to export medicines:', error);
            this.showAlert('Failed to export medicines. Please try again.', 'error');
        }
    }

    async handleImportSubmit(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showAlert('Please select a file to import', 'error');
            return;
        }
        
        try {
            // Show loading state
            const submitBtn = this.importForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<div class="loading-spinner"></div> Importing...';
            submitBtn.disabled = true;
            
            // Parse CSV file
            const results = await new Promise((resolve, reject) => {
                Papa.parse(file, {
                    header: true,
                    complete: (results) => resolve(results),
                    error: (error) => reject(error)
                });
            });
            
            // Validate and import medicines
            const medicines = results.data.map(row => ({
                name: row.name,
                description: row.description || '',
                category: row.category || 'other',
                price: parseFloat(row.price) || 0,
                stock: parseInt(row.stock) || 0,
                expiry: row.expiry_date || '',
                barcode: row.barcode || '',
                image: row.image_url || ''
            }));
            
            await medicineService.importMedicines(medicines);
            
            // Reload medicines table
            this.loadMedicines();
            
            // Close modal and reset form
            document.getElementById('import-modal').classList.remove('active');
            document.getElementById('import-form').reset();
            
            this.showAlert('Medicines imported successfully!', 'success');
        } catch (error) {
            console.error('Failed to import medicines:', error);
            this.showAlert('Failed to import medicines. Please check the file format and try again.', 'error');
        } finally {
            // Reset button
            const submitBtn = document.getElementById('import-form').querySelector('button[type="submit"]');
            submitBtn.innerHTML = 'Import';
            submitBtn.disabled = false;
        }
    }

    async loadOrders() {
        try {
            const status = document.getElementById('order-status-filter').value;
            const dateFilter = document.getElementById('order-date-filter').value;
            const searchTerm = document.getElementById('order-search').value;
            
            let orders;
            
            if (dateFilter !== 'all') {
                orders = await orderService.getOrdersByDate(dateFilter);
            } else {
                orders = await orderService.getOrders(status);
            }
            
            // Apply search filter if needed
            if (searchTerm) {
                orders = orders.filter(order => 
                    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    order.id.toString().includes(searchTerm) ||
                    order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                )
            }
            
            const orderTableBody = document.getElementById('order-table-body');
            orderTableBody.innerHTML = '';
            
            orders.forEach(order => {
                const row = document.createElement('tr');
                const medicinesList = order.items.map(item => `${item.name} (${item.quantity})`).join(', ');
                const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.customer}</td>
                    <td>${new Date(order.date).toLocaleDateString()}</td>
                    <td>${medicinesList}</td>
                    <td>₹${total.toFixed(2)}</td>
                    <td><span class="status-badge status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                    <td class="action-buttons">
                        <button class="btn-primary view-order" data-id="${order.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
                
                orderTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Failed to load orders:', error);
            this.showAlert('Failed to load orders. Please try again.', 'error');
        }
    }

    async openOrderModal(orderId) {
        try {
            const order = await orderService.getOrder(orderId);
            
            // Update modal title
            document.getElementById('order-id-title').textContent = `#${order.id}`;
            
            // Update order info
            document.getElementById('detail-order-id').textContent = order.id;
            document.getElementById('detail-customer').textContent = order.customer;
            document.getElementById('detail-date').textContent = new Date(order.date).toLocaleDateString();
            document.getElementById('detail-status').value = order.status;
            document.getElementById('detail-address').textContent = order.address;
            document.getElementById('detail-contact').textContent = order.contact;
            document.getElementById('detail-payment').textContent = order.paymentMethod;
            
            // Update prescription link if exists
            const prescriptionLink = document.getElementById('prescription-link');
            if (order.prescription) {
                prescriptionLink.href = order.prescription;
                prescriptionLink.style.display = 'inline';
            } else {
                prescriptionLink.style.display = 'none';
            }
            
            // Update order items
            const orderItemsBody = document.getElementById('order-items-body');
            orderItemsBody.innerHTML = '';
            
            let subtotal = 0;
            
            order.items.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>₹${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>₹${itemTotal.toFixed(2)}</td>
                `;
                orderItemsBody.appendChild(row);
            });
            
            // Update totals
            document.getElementById('detail-subtotal').textContent = subtotal.toFixed(2);
            document.getElementById('detail-shipping').textContent = (order.shipping || 0).toFixed(2);
            document.getElementById('detail-discount').textContent = (order.discount || 0).toFixed(2);
            
            const total = subtotal + (order.shipping || 0) - (order.discount || 0);
            document.getElementById('detail-total').textContent = total.toFixed(2);
            
            // Store order ID in the modal for later use
            document.getElementById('order-modal').setAttribute('data-order-id', order.id);
            
            // Show modal
            document.getElementById('order-modal').classList.add('active');
        } catch (error) {
            console.error('Failed to load order details:', error);
            this.showAlert('Failed to load order details. Please try again.', 'error');
        }
    }

    async saveOrderChanges() {
        const orderId = document.getElementById('order-modal').getAttribute('data-order-id');
        const newStatus = document.getElementById('detail-status').value;
        
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            this.showAlert('Order updated successfully', 'success');
            document.getElementById('order-modal').classList.remove('active');
            this.loadOrders();
            this.loadDashboardData();
        } catch (error) {
            console.error('Failed to update order:', error);
            this.showAlert('Failed to update order. Please try again.', 'error');
        }
    }

    async cancelOrder() {
        const orderId = document.getElementById('order-modal').getAttribute('data-order-id');
        
        if (confirm('Are you sure you want to cancel this order?')) {
            try {
                await orderService.cancelOrder(orderId);
                this.showAlert('Order cancelled successfully', 'success');
                document.getElementById('order-modal').classList.remove('active');
                this.loadOrders();
                this.loadDashboardData();
            } catch (error) {
                console.error('Failed to cancel order:', error);
                this.showAlert('Failed to cancel order. Please try again.', 'error');
            }
        }
    }

    async loadAnalyticsData() {
        try {
            const period = document.getElementById('analytics-period').value;
            let startDate, endDate;
            
            if (period === 'custom') {
                startDate = document.getElementById('start-date').value;
                endDate = document.getElementById('end-date').value;
                
                if (!startDate || !endDate) {
                    this.showAlert('Please select both start and end dates', 'error');
                    return;
                }
            }
            
            const data = await analyticsService.getSalesAnalytics(period, startDate, endDate);
            
            // Update charts
            this.updateCharts(data.sales, data.orders);
            
            // Update top products
            const topProductsBody = document.getElementById('top-products-body');
            topProductsBody.innerHTML = '';
            
            data.topProducts.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>₹${product.revenue.toFixed(2)}</td>
                `;
                topProductsBody.appendChild(row);
            });
            
            // Update low stock alerts
            const lowStockBody = document.getElementById('low-stock-body');
            lowStockBody.innerHTML = '';
            
            data.lowStock.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.stock}</td>
                    <td>${item.reorderLevel}</td>
                `;
                lowStockBody.appendChild(row);
            });
        } catch (error) {
            console.error('Failed to load analytics data:', error);
            this.showAlert('Failed to load analytics data. Please try again.', 'error');
        }
    }

    updateCharts(salesData, ordersData) {
        // Destroy existing charts if they exist
        if (this.salesChart) {
            this.salesChart.destroy();
        }
        if (this.ordersChart) {
            this.ordersChart.destroy();
        }
        
        // Create sales chart
        const salesCtx = document.getElementById('sales-chart').getContext('2d');
        this.salesChart = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: salesData.labels,
                datasets: [{
                    label: 'Sales (₹)',
                    data: salesData.data,
                    backgroundColor: 'rgba(78, 115, 223, 0.05)',
                    borderColor: 'rgba(78, 115, 223, 1)',
                    pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
                    tension: 0.3
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value;
                            }
                        }
                    }
                }
            }
        });
        
        // Create orders chart
        const ordersCtx = document.getElementById('orders-chart').getContext('2d');
        this.ordersChart = new Chart(ordersCtx, {
            type: 'bar',
            data: {
                labels: ordersData.labels,
                datasets: [{
                    label: 'Orders',
                    data: ordersData.data,
                    backgroundColor: 'rgba(28, 200, 138, 0.5)',
                    borderColor: 'rgba(28, 200, 138, 1)',
                    hoverBackgroundColor: 'rgba(28, 200, 138, 0.7)',
                    hoverBorderColor: 'rgba(28, 200, 138, 1)'
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    async updateAccount() {
        const email = document.getElementById('admin-email').value;
        const newPassword = document.getElementById('admin-password').value;
        const confirmPassword = document.getElementById('admin-confirm-password').value;
        const twoFactorEnabled = document.getElementById('two-factor').checked;
        
        if (newPassword && newPassword !== confirmPassword) {
            this.showAlert('Passwords do not match', 'error');
            return;
        }
        
        try {
            await authService.updateAccount({
                email,
                newPassword,
                twoFactorEnabled
            });
            
            this.showAlert('Account updated successfully', 'success');
        } catch (error) {
            console.error('Failed to update account:', error);
            this.showAlert('Failed to update account. Please try again.', 'error');
        }
    }

    async saveSettings() {
        const settings = {
            appName: document.getElementById('app-name').value,
            deliveryFee: parseFloat(document.getElementById('delivery-fee').value),
            minOrder: parseFloat(document.getElementById('min-order').value),
            currency: document.getElementById('currency').value,
            timezone: document.getElementById('timezone').value
        };
        
        try {
            await authService.saveSettings(settings);
            this.showAlert('Settings saved successfully', 'success');
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showAlert('Failed to save settings. Please try again.', 'error');
        }
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${type}`;
        alertDiv.textContent = message;
        
        document.body.prepend(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}

// Initialize the application
const app = new AdminApp();