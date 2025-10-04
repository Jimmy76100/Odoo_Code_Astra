// ExpenseFlow - Modern Expense Management System
class ExpenseFlow {
    constructor() {
        this.currentUser = null;
        this.currentMode = 'admin';
        this.currentPage = 'dashboard';
        this.expenses = [];
        this.users = [];
        this.approvalRules = [];
        this.countries = [];
        this.currencies = {};
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.bindEvents();
        this.checkAuth();
    }

    async loadData() {
        // Load sample data
        this.loadSampleData();
        
        // Load countries and currencies
        try {
            await this.loadCountriesAndCurrencies();
        } catch (error) {
            console.error('Failed to load countries/currencies:', error);
        }

        // Load saved data from localStorage
        this.loadSavedData();
    }

    loadSavedData() {
        // Load expenses
        const savedExpenses = localStorage.getItem('expenseFlowExpenses');
        if (savedExpenses) {
            this.expenses = JSON.parse(savedExpenses);
        }

        // Load users
        const savedUsers = localStorage.getItem('expenseFlowUsers');
        if (savedUsers) {
            this.users = JSON.parse(savedUsers);
        }

        // Load approval rules
        const savedRules = localStorage.getItem('expenseFlowRules');
        if (savedRules) {
            this.approvalRules = JSON.parse(savedRules);
        }

        // Load company settings
        const savedSettings = localStorage.getItem('expenseFlowSettings');
        if (savedSettings) {
            this.companySettings = JSON.parse(savedSettings);
        }
    }

    saveData() {
        localStorage.setItem('expenseFlowExpenses', JSON.stringify(this.expenses));
        localStorage.setItem('expenseFlowUsers', JSON.stringify(this.users));
        localStorage.setItem('expenseFlowRules', JSON.stringify(this.approvalRules));
        if (this.companySettings) {
            localStorage.setItem('expenseFlowSettings', JSON.stringify(this.companySettings));
        }
    }

    loadSampleData() {
        // Initialize company settings
        this.companySettings = {
            companyName: 'ExpenseFlow Inc.',
            defaultCurrency: 'USD',
            country: 'United States',
            timezone: 'America/New_York',
            autoApprovalLimit: 100,
            receiptRequired: true,
            multiLevelApproval: true
        };

        // Sample users
        this.users = [
            {
                id: 1,
                name: 'John Admin',
                email: 'admin@expenseflow.com',
                role: 'admin',
                manager: null,
                status: 'active',
                department: 'Administration',
                joinDate: '2024-01-01',
                permissions: ['create_user', 'edit_user', 'delete_user', 'approve_expense', 'view_all_expenses', 'manage_rules']
            },
            {
                id: 2,
                name: 'Sarah Manager',
                email: 'sarah@expenseflow.com',
                role: 'manager',
                manager: null,
                status: 'active',
                department: 'Sales',
                joinDate: '2024-01-15',
                permissions: ['approve_expense', 'view_team_expenses', 'manage_team']
            },
            {
                id: 3,
                name: 'Mike Employee',
                email: 'mike@expenseflow.com',
                role: 'employee',
                manager: 2,
                status: 'active',
                department: 'Sales',
                joinDate: '2024-02-01',
                permissions: ['submit_expense', 'view_own_expenses']
            },
            {
                id: 4,
                name: 'Lisa Employee',
                email: 'lisa@expenseflow.com',
                role: 'employee',
                manager: 2,
                status: 'active',
                department: 'Marketing',
                joinDate: '2024-02-15',
                permissions: ['submit_expense', 'view_own_expenses']
            }
        ];

        // Sample expenses
        this.expenses = [
            {
                id: 1,
                employeeId: 3,
                amount: 150.00,
                currency: 'USD',
                category: 'Travel',
                description: 'Client meeting travel',
                date: '2024-01-15',
                status: 'pending',
                approvers: [2],
                currentApprover: 2,
                receipt: null,
                submittedAt: '2024-01-15T10:30:00Z',
                approvedAt: null,
                rejectedAt: null,
                approvalHistory: [],
                attachments: [],
                convertedAmount: 150.00,
                convertedCurrency: 'USD'
            },
            {
                id: 2,
                employeeId: 3,
                amount: 75.50,
                currency: 'USD',
                category: 'Meals',
                description: 'Team lunch',
                date: '2024-01-14',
                status: 'approved',
                approvers: [2],
                currentApprover: null,
                receipt: null,
                submittedAt: '2024-01-14T12:00:00Z',
                approvedAt: '2024-01-14T15:30:00Z',
                rejectedAt: null,
                approvalHistory: [
                    {
                        approverId: 2,
                        action: 'approved',
                        timestamp: '2024-01-14T15:30:00Z',
                        comment: 'Approved - reasonable team lunch expense'
                    }
                ],
                attachments: [],
                convertedAmount: 75.50,
                convertedCurrency: 'USD'
            },
            {
                id: 3,
                employeeId: 4,
                amount: 250.00,
                currency: 'EUR',
                category: 'Travel',
                description: 'Business trip to Paris',
                date: '2024-01-16',
                status: 'pending',
                approvers: [2, 1],
                currentApprover: 2,
                receipt: null,
                submittedAt: '2024-01-16T09:15:00Z',
                approvedAt: null,
                rejectedAt: null,
                approvalHistory: [],
                attachments: [],
                convertedAmount: 272.50,
                convertedCurrency: 'USD'
            }
        ];

        // Sample approval rules
        this.approvalRules = [
            {
                id: 1,
                name: 'Travel > $500',
                category: 'Travel',
                threshold: 500,
                approvers: [2],
                ruleType: 'threshold',
                isActive: true,
                priority: 1,
                description: 'Travel expenses over $500 require manager approval'
            },
            {
                id: 2,
                name: 'All Expenses > $1000',
                category: 'Any',
                threshold: 1000,
                approvers: [2, 1],
                ruleType: 'threshold',
                isActive: true,
                priority: 2,
                description: 'All expenses over $1000 require multi-level approval'
            },
            {
                id: 3,
                name: 'Meals > $100',
                category: 'Meals',
                threshold: 100,
                approvers: [2],
                ruleType: 'threshold',
                isActive: true,
                priority: 3,
                description: 'Meal expenses over $100 require manager approval'
            },
            {
                id: 4,
                name: 'Percentage Rule - 60%',
                category: 'Any',
                threshold: 0,
                approvers: [2, 1, 4],
                ruleType: 'percentage',
                percentage: 60,
                isActive: true,
                priority: 4,
                description: '60% of approvers must approve for auto-approval'
            }
        ];
    }

    async loadCountriesAndCurrencies() {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
        const countries = await response.json();
        
        this.countries = countries.map(country => ({
            name: country.name.common,
            currency: Object.keys(country.currencies || {})[0] || 'USD'
        }));

        // Load exchange rates
        await this.loadExchangeRates();
    }

    async loadExchangeRates() {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            this.currencies = data.rates;
        } catch (error) {
            console.error('Failed to load exchange rates:', error);
            // Fallback rates
            this.currencies = {
                'USD': 1,
                'EUR': 0.85,
                'GBP': 0.73,
                'JPY': 110
            };
        }
    }

    bindEvents() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        
        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        
        // Mode switcher (now in bottom nav)
        document.getElementById('mode-switcher').addEventListener('click', () => this.showModeSelector());
        
        // Bottom navigation
        document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
            if (!item.classList.contains('mode-switcher')) {
                item.addEventListener('click', (e) => this.handleNavigation(e));
            }
        });
    }

    checkAuth() {
        const savedUser = localStorage.getItem('expenseFlowUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Find user
        const user = this.users.find(u => u.email === email);
        
        if (user && this.validatePassword(password, user)) {
            this.currentUser = user;
            this.currentMode = user.role;
            localStorage.setItem('expenseFlowUser', JSON.stringify(user));
            this.showMainApp();
            this.showNotification(`Welcome back, ${user.name}!`, 'success');
            
            // Update last login
            user.lastLogin = new Date().toISOString();
            this.saveData();
        } else {
            this.showNotification('Invalid credentials', 'error');
        }
    }

    validatePassword(password, user) {
        // Simple validation - in real app, this would be hashed
        if (user.email === 'admin@expenseflow.com' && password === 'password123') return true;
        if (user.email === 'sarah@expenseflow.com' && password === 'password123') return true;
        if (user.email === 'mike@expenseflow.com' && password === 'password123') return true;
        if (user.email === 'lisa@expenseflow.com' && password === 'password123') return true;
        return false;
    }

    hasPermission(permission) {
        if (!this.currentUser) return false;
        return this.currentUser.permissions && this.currentUser.permissions.includes(permission);
    }

    canAccessPage(page) {
        const pagePermissions = {
            'dashboard': ['view_all_expenses', 'view_team_expenses', 'view_own_expenses'],
            'expenses': ['view_all_expenses', 'view_team_expenses', 'view_own_expenses'],
            'approvals': ['approve_expense'],
            'people': ['create_user', 'edit_user'],
            'settings': ['manage_rules']
        };

        const requiredPermissions = pagePermissions[page] || [];
        return requiredPermissions.some(permission => this.hasPermission(permission));
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('expenseFlowUser');
        this.showLoginPage();
        this.showNotification('Logged out successfully', 'info');
    }

    showModeSelector() {
        const modes = [
            { value: 'admin', label: 'Admin Mode', icon: 'fas fa-crown' },
            { value: 'manager', label: 'Manager Mode', icon: 'fas fa-user-tie' },
            { value: 'employee', label: 'Employee Mode', icon: 'fas fa-user' }
        ];

        const modal = this.createModal('Select Mode', `
            <div class="mode-selector">
                ${modes.map(mode => `
                    <div class="mode-option ${this.currentMode === mode.value ? 'active' : ''}" data-mode="${mode.value}">
                        <i class="${mode.icon}"></i>
                        <span>${mode.label}</span>
                        ${this.currentMode === mode.value ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                `).join('')}
            </div>
        `);
        
        this.showModal(modal);
        
        // Bind mode selection
        modal.querySelectorAll('.mode-option').forEach(option => {
            option.addEventListener('click', () => {
                const mode = option.dataset.mode;
                this.handleModeChange(mode);
                modal.remove();
            });
        });
    }

    handleModeChange(mode) {
        this.currentMode = mode;
        this.updateUserInterface();
        this.showNotification(`Switched to ${mode} mode`, 'info');
    }

    handleNavigation(e) {
        const page = e.currentTarget.dataset.page;
        if (page) {
            this.navigateToPage(page);
        }
    }

    showLoginPage() {
        document.getElementById('login-page').classList.add('active');
        document.getElementById('main-app').classList.remove('active');
    }

    showMainApp() {
        const loginPage = document.getElementById('login-page');
        const mainApp = document.getElementById('main-app');
        
        // Add smooth transition
        loginPage.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        loginPage.style.opacity = '0';
        loginPage.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            loginPage.classList.remove('active');
            loginPage.style.display = 'none'; // Completely hide to prevent scroll issues
            mainApp.classList.add('active');
            mainApp.style.opacity = '0';
            mainApp.style.transform = 'translateY(20px)';
            mainApp.style.transition = 'opacity 0.5s ease-in, transform 0.5s ease-in';
            
            // Trigger the animation
            setTimeout(() => {
                mainApp.style.opacity = '1';
                mainApp.style.transform = 'translateY(0)';
            }, 50);
            
            this.updateUserInterface();
            this.navigateToPage('dashboard');
        }, 500);
    }

    updateUserInterface() {
        // Update current user display
        document.getElementById('current-user').textContent = this.currentUser?.name || 'User';
        
        // Update mode switcher display
        const modeSwitcher = document.getElementById('mode-switcher');
        if (modeSwitcher) {
            const modeIcons = {
                'admin': 'fas fa-crown',
                'manager': 'fas fa-user-tie',
                'employee': 'fas fa-user'
            };
            const icon = modeSwitcher.querySelector('i');
            if (icon) {
                icon.className = modeIcons[this.currentMode] || 'fas fa-user-cog';
            }
        }
        
        // Update navigation based on role
        this.updateNavigationForRole();
    }

    updateNavigationForRole() {
        const navItems = document.querySelectorAll('.bottom-nav .nav-item');
        const bottomNav = document.querySelector('.bottom-nav');
        
        // Ensure the bottom nav container is always visible
        if (bottomNav) {
            bottomNav.style.display = 'flex';
            bottomNav.style.opacity = '1';
            bottomNav.style.transform = 'none'; // Prevent any sliding
        }
    
        navItems.forEach(item => {
            const page = item.dataset.page;
            // Only hide navigation items if user lacks permission
            if (!this.canAccessPage(page)) {
                item.style.display = 'none';
            } else {
                item.style.display = 'flex';
            }
        });
    }

    navigateToPage(page) {
        this.currentPage = page;
        
        // Update active navigation
        document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // Load page content
        this.loadPageContent(page);
    }

    loadPageContent(page) {
        const mainContent = document.getElementById('main-content');
        
        switch (page) {
            case 'dashboard':
                mainContent.innerHTML = this.getDashboardContent();
                break;
            case 'expenses':
                mainContent.innerHTML = this.getExpensesContent();
                break;
            case 'approvals':
                mainContent.innerHTML = this.getApprovalsContent();
                break;
            case 'people':
                mainContent.innerHTML = this.getPeopleContent();
                break;
            case 'settings':
                mainContent.innerHTML = this.getSettingsContent();
                break;
        }

        // Bind events for the new content
        this.bindPageEvents(page);
        
        // Initialize charts if dashboard
        if (page === 'dashboard') {
            setTimeout(() => this.initializeCharts(), 100);
        }
    }

    getDashboardContent() {
        const userExpenses = this.expenses.filter(e => 
            this.currentMode === 'admin' || 
            (this.currentMode === 'manager' && this.users.find(u => u.id === e.employeeId)?.manager === this.currentUser.id) ||
            (this.currentMode === 'employee' && e.employeeId === this.currentUser.id)
        );

        const pendingExpenses = userExpenses.filter(e => e.status === 'pending').length;
        const approvedExpenses = userExpenses.filter(e => e.status === 'approved').length;
        const totalAmount = userExpenses.reduce((sum, e) => sum + e.amount, 0);

        return `
            <div class="page-container">
                <div class="page-header">
                    <h1>Dashboard</h1>
                    <p>Welcome back, ${this.currentUser?.name}</p>
                </div>
                
                <div class="dashboard-grid">
                    <div class="stat-card liquid-glass">
                        <div class="stat-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Total Expenses</h3>
                            <div class="stat-value">$${totalAmount.toFixed(2)}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card liquid-glass">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Pending</h3>
                            <div class="stat-value">${pendingExpenses}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card liquid-glass">
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Approved</h3>
                            <div class="stat-value">${approvedExpenses}</div>
                        </div>
                    </div>
                </div>

                <div class="charts-section">
                    <div class="chart-container liquid-glass">
                        <h3>Expense Categories</h3>
                        <canvas id="expenseCategoryChart" width="400" height="200"></canvas>
                    </div>
                    
                    <div class="chart-container liquid-glass">
                        <h3>Monthly Trends</h3>
                        <canvas id="monthlyTrendChart" width="400" height="200"></canvas>
                    </div>
                </div>

                <div class="recent-expenses liquid-glass">
                    <h2>Recent Expenses</h2>
                    <div class="expense-list">
                        ${userExpenses.slice(0, 5).map(expense => `
                            <div class="expense-item">
                                <div class="expense-info">
                                    <span class="expense-amount">$${expense.amount}</span>
                                    <span class="expense-description">${expense.description}</span>
                                </div>
                                <span class="expense-status badge ${expense.status}">${expense.status}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    getExpensesContent() {
        const userExpenses = this.expenses.filter(e => 
            this.currentMode === 'admin' || 
            e.employeeId === this.currentUser.id
        );

        return `
            <div class="page-container">
                <div class="page-header">
                    <h1>Expenses</h1>
                    <button class="btn btn-primary liquid-glass" id="add-expense-btn">
                        <i class="fas fa-plus"></i>
                        Add Expense
                    </button>
                </div>

                <div class="expense-filters liquid-glass">
                    <div class="filter-tabs">
                        <button class="filter-tab active" data-filter="all">All</button>
                        <button class="filter-tab" data-filter="pending">Pending</button>
                        <button class="filter-tab" data-filter="approved">Approved</button>
                        <button class="filter-tab" data-filter="rejected">Rejected</button>
                    </div>
                </div>

                <div class="expense-table liquid-glass">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${userExpenses.map(expense => `
                                <tr>
                                    <td>${expense.date}</td>
                                    <td>${expense.description}</td>
                                    <td>${expense.category}</td>
                                    <td>$${expense.amount}</td>
                                    <td><span class="badge ${expense.status}">${expense.status}</span></td>
                                    <td>
                                        <button class="btn-action" onclick="expenseFlow.viewExpense(${expense.id})">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    getApprovalsContent() {
        if (this.currentMode === 'employee') {
            return `
                <div class="page-container">
                    <div class="page-header">
                        <h1>Approvals</h1>
                    </div>
                    <div class="no-access liquid-glass">
                        <i class="fas fa-lock"></i>
                        <h2>Access Restricted</h2>
                        <p>You don't have permission to view approvals.</p>
                    </div>
                </div>
            `;
        }

        const pendingExpenses = this.expenses.filter(e => 
            e.status === 'pending' && 
            (this.currentMode === 'admin' || e.currentApprover === this.currentUser.id)
        );

        return `
            <div class="page-container">
                <div class="page-header">
                    <h1>Approvals</h1>
                    <span class="pending-count">${pendingExpenses.length} pending</span>
                </div>

                <div class="approval-list">
                    ${pendingExpenses.map(expense => {
                        const employee = this.users.find(u => u.id === expense.employeeId);
                        return `
                            <div class="approval-item liquid-glass">
                                <div class="approval-header">
                                    <div class="employee-info">
                                        <div class="employee-avatar">${employee?.name.charAt(0)}</div>
                                        <div>
                                            <h3>${employee?.name}</h3>
                                            <p>${expense.description}</p>
                                        </div>
                                    </div>
                                    <div class="expense-amount">$${expense.amount}</div>
                                </div>
                                
                                <div class="approval-details">
                                    <div class="detail-item">
                                        <span class="label">Category:</span>
                                        <span class="value">${expense.category}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="label">Date:</span>
                                        <span class="value">${expense.date}</span>
                                    </div>
                                </div>

                                <div class="approval-actions">
                                    <button class="btn btn-danger" onclick="expenseFlow.approveExpense(${expense.id}, 'rejected')">
                                        <i class="fas fa-times"></i>
                                        Reject
                                    </button>
                                    <button class="btn btn-success" onclick="expenseFlow.approveExpense(${expense.id}, 'approved')">
                                        <i class="fas fa-check"></i>
                                        Approve
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    getPeopleContent() {
        if (this.currentMode !== 'admin') {
            return `
                <div class="page-container">
                    <div class="page-header">
                        <h1>People</h1>
                    </div>
                    <div class="no-access liquid-glass">
                        <i class="fas fa-lock"></i>
                        <h2>Access Restricted</h2>
                        <p>Only administrators can manage people.</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="page-container">
                <div class="page-header">
                    <h1>People Management</h1>
                    <button class="btn btn-primary liquid-glass" id="add-user-btn">
                        <i class="fas fa-plus"></i>
                        Add User
                    </button>
                </div>

                <div class="user-table liquid-glass">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Manager</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.users.map(user => {
                                const manager = user.manager ? this.users.find(u => u.id === user.manager) : null;
                                return `
                                    <tr>
                                        <td>${user.name}</td>
                                        <td>${user.email}</td>
                                        <td><span class="badge role-${user.role}">${user.role}</span></td>
                                        <td>${manager?.name || 'None'}</td>
                                        <td><span class="badge ${user.status}">${user.status}</span></td>
                                        <td>
                                            <button class="btn-action" onclick="expenseFlow.editUser(${user.id})">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    getSettingsContent() {
        return `
            <div class="page-container">
                <div class="page-header">
                    <h1>Settings</h1>
                </div>

                <div class="settings-sections">
                    <div class="settings-section liquid-glass">
                        <h2>Approval Rules</h2>
                        <button class="btn btn-primary" id="add-rule-btn">
                            <i class="fas fa-plus"></i>
                            Add Rule
                        </button>
                        
                        <div class="rules-list">
                            ${this.approvalRules.map(rule => `
                                <div class="rule-item">
                                    <div class="rule-info">
                                        <h3>${rule.name}</h3>
                                        <p>Category: ${rule.category} | Threshold: $${rule.threshold}</p>
                                    </div>
                                    <button class="btn-action" onclick="expenseFlow.editRule(${rule.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="settings-section liquid-glass">
                        <h2>Company Settings</h2>
                        <form class="company-form">
                            <div class="form-group">
                                <label>Company Name</label>
                                <input type="text" value="ExpenseFlow Inc.">
                            </div>
                            <div class="form-group">
                                <label>Default Currency</label>
                                <select>
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="INR">INR - Indian Rupee</option>
                                    <option value="CAD">CAD - Canadian Dollar</option>
                                    <option value="AUD">AUD - Australian Dollar</option>
                                    <option value="JPY">JPY - Japanese Yen</option>
                                    <option value="CHF">CHF - Swiss Franc</option>
                                    <option value="CNY">CNY - Chinese Yuan</option>
                                    <option value="SGD">SGD - Singapore Dollar</option>
                                    <option value="HKD">HKD - Hong Kong Dollar</option>
                                    <option value="NZD">NZD - New Zealand Dollar</option>
                                    <option value="SEK">SEK - Swedish Krona</option>
                                    <option value="NOK">NOK - Norwegian Krone</option>
                                    <option value="DKK">DKK - Danish Krone</option>
                                    <option value="PLN">PLN - Polish Zloty</option>
                                    <option value="CZK">CZK - Czech Koruna</option>
                                    <option value="HUF">HUF - Hungarian Forint</option>
                                    <option value="RUB">RUB - Russian Ruble</option>
                                    <option value="BRL">BRL - Brazilian Real</option>
                                    <option value="MXN">MXN - Mexican Peso</option>
                                    <option value="ZAR">ZAR - South African Rand</option>
                                    <option value="KRW">KRW - South Korean Won</option>
                                    <option value="THB">THB - Thai Baht</option>
                                    <option value="MYR">MYR - Malaysian Ringgit</option>
                                    <option value="PHP">PHP - Philippine Peso</option>
                                    <option value="IDR">IDR - Indonesian Rupiah</option>
                                    <option value="VND">VND - Vietnamese Dong</option>
                                    <option value="TRY">TRY - Turkish Lira</option>
                                    <option value="ILS">ILS - Israeli Shekel</option>
                                    <option value="AED">AED - UAE Dirham</option>
                                    <option value="SAR">SAR - Saudi Riyal</option>
                                    <option value="QAR">QAR - Qatari Riyal</option>
                                    <option value="KWD">KWD - Kuwaiti Dinar</option>
                                    <option value="BHD">BHD - Bahraini Dinar</option>
                                    <option value="OMR">OMR - Omani Rial</option>
                                    <option value="JOD">JOD - Jordanian Dinar</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    bindPageEvents(page) {
        // Add expense button
        const addExpenseBtn = document.getElementById('add-expense-btn');
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => this.showAddExpenseModal());
        }

        // Add user button
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.showAddUserModal());
        }

        // Add rule button
        const addRuleBtn = document.getElementById('add-rule-btn');
        if (addRuleBtn) {
            addRuleBtn.addEventListener('click', () => this.showAddRuleModal());
        }

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.handleFilterTab(e));
        });
    }

    showAddExpenseModal() {
        const modal = this.createModal('Add Expense', this.getAddExpenseForm());
        this.showModal(modal);
    }

    showAddUserModal() {
        const modal = this.createModal('Add User', this.getAddUserForm());
        this.showModal(modal);
    }

    getAddExpenseForm() {
        return `
            <form class="expense-form" id="add-expense-form">
                <div class="ocr-section">
                    <div class="ocr-upload">
                        <label class="ocr-label">
                            <i class="fas fa-camera"></i>
                            <span>Scan Receipt with OCR</span>
                            <input type="file" id="receipt-upload" accept="image/*" style="display: none;">
                        </label>
                        <button type="button" class="btn btn-outline" id="ocr-scan-btn">
                            <i class="fas fa-magic"></i>
                            Auto-fill from Receipt
                        </button>
                    </div>
                    <div class="ocr-preview" id="ocr-preview" style="display: none;">
                        <img id="receipt-image" style="max-width: 200px; max-height: 200px;">
                        <div class="ocr-results" id="ocr-results"></div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Amount</label>
                        <input type="number" id="expense-amount" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>Currency</label>
                        <select id="expense-currency">
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="JPY">JPY</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Category</label>
                        <select id="expense-category" required>
                            <option value="">Select Category</option>
                            <option value="Travel">Travel</option>
                            <option value="Meals">Meals</option>
                            <option value="Supplies">Office Supplies</option>
                            <option value="Accommodation">Accommodation</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Training">Training</option>
                            <option value="Software">Software</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" id="expense-date" required>
                    </div>
                </div>

                <div class="form-group">
                    <label>Description</label>
                    <textarea id="expense-description" rows="3" required></textarea>
                </div>

                <div class="form-group">
                    <label>Receipt Attachment</label>
                    <input type="file" id="receipt-file" accept="image/*,application/pdf">
                </div>

                <div class="expense-summary">
                    <h4>Expense Summary</h4>
                    <div class="summary-item">
                        <span>Amount:</span>
                        <span id="summary-amount">$0.00</span>
                    </div>
                    <div class="summary-item">
                        <span>Converted Amount:</span>
                        <span id="summary-converted">$0.00 USD</span>
                    </div>
                    <div class="summary-item">
                        <span>Approval Required:</span>
                        <span id="summary-approval">Auto-approved</span>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Submit Expense</button>
                </div>
            </form>
        `;
    }

    getAddUserForm() {
        const managers = this.users.filter(u => u.role === 'manager');
        
        return `
            <form class="user-form" id="add-user-form">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" required>
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select required>
                        <option value="">Select Role</option>
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Manager</label>
                    <select>
                        <option value="">Select Manager</option>
                        ${managers.map(manager => `
                            <option value="${manager.id}">${manager.name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add User</button>
                </div>
            </form>
        `;
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal liquid-glass">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
            </div>
        `;
        return modal;
    }

    showModal(modal) {
        document.getElementById('modal-container').appendChild(modal);
        
        // Close modal functionality
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Bind form submission
        const form = modal.querySelector('form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            
            // Bind OCR functionality
            if (form.id === 'add-expense-form') {
                this.bindExpenseFormEvents(form);
            }
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        if (form.id === 'add-expense-form') {
            this.addExpense(form);
        } else if (form.id === 'add-user-form') {
            this.addUser(form);
        } else if (form.id === 'add-rule-form') {
            this.addRule(form);
        }
    }

    async addExpense(form) {
        const formData = new FormData(form);
        const amount = parseFloat(form.querySelector('input[type="number"]').value);
        const currency = form.querySelector('select').value;
        const category = form.querySelectorAll('select')[1].value;
        
        // Convert currency if needed
        const convertedAmount = await this.convertCurrency(amount, currency, this.companySettings.defaultCurrency);
        
        const expense = {
            id: this.expenses.length + 1,
            employeeId: this.currentUser.id,
            amount: amount,
            currency: currency,
            category: category,
            date: form.querySelector('input[type="date"]').value,
            description: form.querySelector('textarea').value,
            status: 'pending',
            approvers: this.getApproversForExpense(amount, category),
            currentApprover: null,
            receipt: null,
            submittedAt: new Date().toISOString(),
            approvedAt: null,
            rejectedAt: null,
            approvalHistory: [],
            attachments: [],
            convertedAmount: convertedAmount,
            convertedCurrency: this.companySettings.defaultCurrency
        };

        // Set current approver
        if (expense.approvers.length > 0) {
            expense.currentApprover = expense.approvers[0];
        }

        // Check for auto-approval
        if (this.shouldAutoApprove(expense)) {
            expense.status = 'approved';
            expense.approvedAt = new Date().toISOString();
            expense.approvalHistory.push({
                approverId: 'system',
                action: 'auto_approved',
                timestamp: new Date().toISOString(),
                comment: 'Auto-approved based on company rules'
            });
        }

        this.expenses.push(expense);
        this.saveData();
        form.closest('.modal-overlay').remove();
        this.showNotification('Expense submitted successfully!', 'success');
        this.navigateToPage(this.currentPage); // Refresh current page
    }

    async convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;
        
        try {
            const rate = this.currencies[toCurrency] / this.currencies[fromCurrency];
            return amount * rate;
        } catch (error) {
            console.error('Currency conversion failed:', error);
            return amount; // Return original amount if conversion fails
        }
    }

    shouldAutoApprove(expense) {
        // Auto-approve if under auto-approval limit and no specific rules apply
        const applicableRules = this.approvalRules.filter(rule => 
            rule.isActive && 
            (rule.category === 'Any' || rule.category === expense.category) &&
            expense.convertedAmount >= rule.threshold
        );

        return applicableRules.length === 0 && 
               expense.convertedAmount <= this.companySettings.autoApprovalLimit;
    }

    addUser(form) {
        const formData = new FormData(form);
        const user = {
            id: this.users.length + 1,
            name: form.querySelector('input[type="text"]').value,
            email: form.querySelector('input[type="email"]').value,
            role: form.querySelectorAll('select')[0].value,
            manager: parseInt(form.querySelectorAll('select')[1].value) || null,
            status: 'active'
        };

        this.users.push(user);
        form.closest('.modal-overlay').remove();
        this.showNotification('User added successfully!', 'success');
        this.navigateToPage(this.currentPage); // Refresh current page
    }

    getApproversForExpense(amount, category) {
        const applicableRules = this.approvalRules.filter(rule => 
            rule.category === category && amount >= rule.threshold
        );

        if (applicableRules.length > 0) {
            return applicableRules[0].approvers;
        }

        // Default approver logic
        const managers = this.users.filter(u => u.role === 'manager');
        return managers.length > 0 ? [managers[0].id] : [];
    }

    approveExpense(expenseId, action, comment = '') {
        const expense = this.expenses.find(e => e.id === expenseId);
        if (!expense) return;

        // Add to approval history
        expense.approvalHistory.push({
            approverId: this.currentUser.id,
            action: action,
            timestamp: new Date().toISOString(),
            comment: comment
        });

        if (action === 'approved') {
            // Check if this expense uses percentage-based approval
            const applicableRule = this.approvalRules.find(rule => 
                rule.isActive && rule.ruleType === 'percentage' &&
                (rule.category === 'Any' || rule.category === expense.category)
            );

            if (applicableRule) {
                // Check if enough approvers have approved based on percentage
                const approvedCount = expense.approvalHistory.filter(h => h.action === 'approved').length;
                const requiredCount = Math.ceil(expense.approvers.length * (applicableRule.percentage / 100));
                
                if (approvedCount >= requiredCount) {
                    expense.status = 'approved';
                    expense.approvedAt = new Date().toISOString();
                    expense.currentApprover = null;
                    this.showNotification('Expense approved by majority!', 'success');
                } else {
                    // Move to next approver if available
                    const currentApproverIndex = expense.approvers.indexOf(expense.currentApprover);
                    if (currentApproverIndex < expense.approvers.length - 1) {
                        expense.currentApprover = expense.approvers[currentApproverIndex + 1];
                        this.showNotification(`Expense forwarded to next approver (${approvedCount}/${requiredCount} approvals)`, 'info');
                    } else {
                        this.showNotification('All approvers have reviewed. Waiting for majority approval.', 'info');
                    }
                }
            } else {
                // Sequential approval
                const currentApproverIndex = expense.approvers.indexOf(expense.currentApprover);
                
                if (currentApproverIndex < expense.approvers.length - 1) {
                    // Move to next approver
                    expense.currentApprover = expense.approvers[currentApproverIndex + 1];
                    this.showNotification('Expense forwarded to next approver', 'info');
                } else {
                    // All approvers approved
                    expense.status = 'approved';
                    expense.approvedAt = new Date().toISOString();
                    expense.currentApprover = null;
                    this.showNotification('Expense approved!', 'success');
                }
            }
        } else {
            expense.status = 'rejected';
            expense.rejectedAt = new Date().toISOString();
            expense.currentApprover = null;
            this.showNotification('Expense rejected', 'error');
        }

        this.saveData();
        this.navigateToPage(this.currentPage); // Refresh current page
    }

    viewExpense(expenseId) {
        const expense = this.expenses.find(e => e.id === expenseId);
        if (!expense) return;

        const employee = this.users.find(u => u.id === expense.employeeId);
        
        const modal = this.createModal('Expense Details', `
            <div class="expense-details">
                <div class="detail-row">
                    <span class="label">Employee:</span>
                    <span class="value">${employee?.name}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Amount:</span>
                    <span class="value">$${expense.amount} ${expense.currency}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Category:</span>
                    <span class="value">${expense.category}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Date:</span>
                    <span class="value">${expense.date}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Description:</span>
                    <span class="value">${expense.description}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status:</span>
                    <span class="value badge ${expense.status}">${expense.status}</span>
                </div>
            </div>
        `);
        
        this.showModal(modal);
    }

    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const modal = this.createModal('Edit User', `
            <form class="user-form" id="edit-user-form">
                <input type="hidden" value="${user.id}">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" value="${user.name}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" value="${user.email}" required>
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select required>
                        <option value="employee" ${user.role === 'employee' ? 'selected' : ''}>Employee</option>
                        <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select>
                        <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update User</button>
                </div>
            </form>
        `);
        
        this.showModal(modal);
    }

    editRule(ruleId) {
        // Implementation for editing approval rules
        this.showNotification('Rule editing coming soon!', 'info');
    }

    handleFilterTab(e) {
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');

        // Filter expenses based on selected tab
        const filter = e.target.dataset.filter;
        const rows = document.querySelectorAll('.expense-table tbody tr');
        
        rows.forEach(row => {
            const statusBadge = row.querySelector('.badge');
            if (statusBadge) {
                const status = statusBadge.textContent.toLowerCase();
                if (filter === 'all' || status === filter) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            }
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        document.getElementById('notification-container').appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    bindExpenseFormEvents(form) {
        // Set default date to today
        const dateInput = form.querySelector('#expense-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // OCR functionality
        const ocrUpload = form.querySelector('#receipt-upload');
        const ocrScanBtn = form.querySelector('#ocr-scan-btn');
        const ocrPreview = form.querySelector('#ocr-preview');
        const receiptImage = form.querySelector('#receipt-image');
        const ocrResults = form.querySelector('#ocr-results');

        if (ocrUpload && ocrScanBtn) {
            ocrUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        receiptImage.src = e.target.result;
                        ocrPreview.style.display = 'block';
                        this.showNotification('Receipt uploaded successfully!', 'success');
                    };
                    reader.readAsDataURL(file);
                }
            });

            ocrScanBtn.addEventListener('click', () => {
                this.performOCR(form);
            });
        }

        // Real-time form updates
        const amountInput = form.querySelector('#expense-amount');
        const currencySelect = form.querySelector('#expense-currency');
        const categorySelect = form.querySelector('#expense-category');

        const updateSummary = async () => {
            const amount = parseFloat(amountInput.value) || 0;
            const currency = currencySelect.value;
            const category = categorySelect.value;

            // Update summary display
            form.querySelector('#summary-amount').textContent = `${currency} ${amount.toFixed(2)}`;
            
            // Convert currency
            const convertedAmount = await this.convertCurrency(amount, currency, this.companySettings.defaultCurrency);
            form.querySelector('#summary-converted').textContent = `${this.companySettings.defaultCurrency} ${convertedAmount.toFixed(2)}`;
            
            // Check approval requirements
            const approvers = this.getApproversForExpense(amount, category);
            const approvalText = approvers.length > 0 ? `${approvers.length} approver(s) required` : 'Auto-approved';
            form.querySelector('#summary-approval').textContent = approvalText;
        };

        if (amountInput) amountInput.addEventListener('input', updateSummary);
        if (currencySelect) currencySelect.addEventListener('change', updateSummary);
        if (categorySelect) categorySelect.addEventListener('change', updateSummary);
    }

    async performOCR(form) {
        const ocrResults = form.querySelector('#ocr-results');
        const receiptImage = form.querySelector('#receipt-image');
        
        if (!receiptImage.src) {
            this.showNotification('Please upload a receipt first', 'error');
            return;
        }

        this.showNotification('Processing receipt with OCR...', 'info');
        
        try {
            // Simulate OCR processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Mock OCR results
            const ocrData = this.mockOCRResults();
            
            // Fill form with OCR data
            this.fillFormFromOCR(form, ocrData);
            
            ocrResults.innerHTML = `
                <div class="ocr-success">
                    <i class="fas fa-check-circle"></i>
                    <h4>Receipt Processed Successfully!</h4>
                    <p>Amount: ${ocrData.amount}</p>
                    <p>Date: ${ocrData.date}</p>
                    <p>Merchant: ${ocrData.merchant}</p>
                </div>
            `;
            
            this.showNotification('Receipt processed successfully!', 'success');
        } catch (error) {
            ocrResults.innerHTML = `
                <div class="ocr-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>OCR Processing Failed</h4>
                    <p>Please enter the information manually.</p>
                </div>
            `;
            this.showNotification('OCR processing failed', 'error');
        }
    }

    mockOCRResults() {
        const merchants = ['Starbucks', 'McDonald\'s', 'Uber', 'Amazon', 'Office Depot', 'Hilton Hotel'];
        const categories = ['Meals', 'Travel', 'Supplies', 'Accommodation'];
        
        return {
            amount: (Math.random() * 200 + 10).toFixed(2),
            currency: 'USD',
            date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            merchant: merchants[Math.floor(Math.random() * merchants.length)],
            category: categories[Math.floor(Math.random() * categories.length)]
        };
    }

    fillFormFromOCR(form, ocrData) {
        form.querySelector('#expense-amount').value = ocrData.amount;
        form.querySelector('#expense-currency').value = ocrData.currency;
        form.querySelector('#expense-date').value = ocrData.date;
        form.querySelector('#expense-category').value = ocrData.category;
        form.querySelector('#expense-description').value = `Receipt from ${ocrData.merchant}`;
        
        // Trigger summary update
        const event = new Event('input');
        form.querySelector('#expense-amount').dispatchEvent(event);
    }

    // Enhanced approval rules management
    showAddRuleModal() {
        const modal = this.createModal('Add Approval Rule', this.getAddRuleForm());
        this.showModal(modal);
    }

    getAddRuleForm() {
        return `
            <form class="rule-form" id="add-rule-form">
                <div class="form-group">
                    <label>Rule Name</label>
                    <input type="text" id="rule-name" required placeholder="e.g., High-Value Travel">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Category</label>
                        <select id="rule-category">
                            <option value="Any">Any Category</option>
                            <option value="Travel">Travel</option>
                            <option value="Meals">Meals</option>
                            <option value="Supplies">Office Supplies</option>
                            <option value="Accommodation">Accommodation</option>
                            <option value="Entertainment">Entertainment</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Rule Type</label>
                        <select id="rule-type" required>
                            <option value="">Select Type</option>
                            <option value="threshold">Threshold Based</option>
                            <option value="percentage">Percentage Based</option>
                        </select>
                    </div>
                </div>

                <div class="form-row" id="threshold-fields">
                    <div class="form-group">
                        <label>Threshold Amount</label>
                        <input type="number" id="rule-threshold" step="0.01" placeholder="500.00">
                    </div>
                    <div class="form-group">
                        <label>Currency</label>
                        <select id="rule-currency">
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                        </select>
                    </div>
                </div>

                <div class="form-group" id="percentage-fields" style="display: none;">
                    <label>Approval Percentage</label>
                    <input type="number" id="rule-percentage" min="1" max="100" placeholder="60">
                    <small>Percentage of approvers that must approve</small>
                </div>

                <div class="form-group">
                    <label>Approvers</label>
                    <div class="approver-selection">
                        ${this.users.filter(u => u.role === 'manager' || u.role === 'admin').map(user => `
                            <label class="checkbox-label">
                                <input type="checkbox" value="${user.id}" class="approver-checkbox">
                                <span class="checkmark"></span>
                                ${user.name} (${user.role})
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div class="form-group">
                    <label>Description</label>
                    <textarea id="rule-description" rows="3" placeholder="Describe when this rule applies..."></textarea>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Rule</button>
                </div>
            </form>
        `;
    }

    addRule(form) {
        const ruleName = form.querySelector('#rule-name').value;
        const category = form.querySelector('#rule-category').value;
        const ruleType = form.querySelector('#rule-type').value;
        const threshold = parseFloat(form.querySelector('#rule-threshold').value) || 0;
        const percentage = parseInt(form.querySelector('#rule-percentage').value) || 0;
        const description = form.querySelector('#rule-description').value;
        
        const selectedApprovers = Array.from(form.querySelectorAll('.approver-checkbox:checked'))
            .map(cb => parseInt(cb.value));

        if (selectedApprovers.length === 0) {
            this.showNotification('Please select at least one approver', 'error');
            return;
        }

        const rule = {
            id: this.approvalRules.length + 1,
            name: ruleName,
            category: category,
            ruleType: ruleType,
            threshold: threshold,
            percentage: percentage,
            approvers: selectedApprovers,
            isActive: true,
            priority: this.approvalRules.length + 1,
            description: description,
            createdAt: new Date().toISOString()
        };

        this.approvalRules.push(rule);
        this.saveData();
        form.closest('.modal-overlay').remove();
        this.showNotification('Approval rule added successfully!', 'success');
        this.navigateToPage(this.currentPage);
    }

    initializeCharts() {
        // Expense Category Pie Chart
        const categoryCtx = document.getElementById('expenseCategoryChart');
        if (categoryCtx) {
            const userExpenses = this.expenses.filter(e => 
                this.currentMode === 'admin' || 
                (this.currentMode === 'manager' && this.users.find(u => u.id === e.employeeId)?.manager === this.currentUser.id) ||
                (this.currentMode === 'employee' && e.employeeId === this.currentUser.id)
            );

            const categoryData = {};
            userExpenses.forEach(expense => {
                categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
            });

            new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(categoryData),
                    datasets: [{
                        data: Object.values(categoryData),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 205, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)',
                            'rgba(255, 159, 64, 0.8)',
                            'rgba(199, 199, 199, 0.8)',
                            'rgba(83, 102, 255, 0.8)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 205, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(199, 199, 199, 1)',
                            'rgba(83, 102, 255, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#1a202c',
                                font: {
                                    size: 12
                                }
                            }
                        }
                    }
                }
            });
        }

        // Monthly Trend Bar Chart
        const trendCtx = document.getElementById('monthlyTrendChart');
        if (trendCtx) {
            const userExpenses = this.expenses.filter(e => 
                this.currentMode === 'admin' || 
                (this.currentMode === 'manager' && this.users.find(u => u.id === e.employeeId)?.manager === this.currentUser.id) ||
                (this.currentMode === 'employee' && e.employeeId === this.currentUser.id)
            );

            const monthlyData = {};
            userExpenses.forEach(expense => {
                const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short' });
                monthlyData[month] = (monthlyData[month] || 0) + expense.amount;
            });

            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const amounts = months.map(month => monthlyData[month] || 0);

            new Chart(trendCtx, {
                type: 'bar',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'Expense Amount ($)',
                        data: amounts,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#1a202c',
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#1a202c',
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#1a202c',
                                font: {
                                    size: 12
                                }
                            }
                        }
                    }
                }
            });
        }
    }
}

// Initialize the app
let expenseFlow;
document.addEventListener('DOMContentLoaded', () => {
    expenseFlow = new ExpenseFlow();
});