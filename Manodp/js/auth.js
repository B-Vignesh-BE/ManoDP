// Authentication Functions
const demoCredentials = {
    doctor: {
        email: 'doctor@manodp.com',
        password: 'doctor123',
        name: 'Dr. Ramesh Kumar',
        specialization: 'Cardiologist'
    },
    patient: {
        email: 'patient@manodp.com',
        password: 'patient123',
        name: 'Rajesh Kumar',
        age: 45
    },
    pharmacist: {
        email: 'pharma@manodp.com',
        password: 'pharma123',
        name: 'Amit Sharma',
        pharmacy: 'City Medicals'
    },
    admin: {
        email: 'admin@manodp.com',
        password: 'admin123',
        name: 'Admin User'
    }
};

// REAL USERS DATABASE (Stored in localStorage)
const USER_DB_KEY = 'manodp_users';

// Initialize users database if not exists
function initUserDatabase() {
    if (!localStorage.getItem(USER_DB_KEY)) {
        const defaultUsers = {
            'doctor@manodp.com': {
                email: 'doctor@manodp.com',
                password: 'doctor123',
                name: 'Dr. Ramesh Kumar',
                role: 'doctor',
                specialization: 'Cardiologist',
                status: 'active',
                registeredAt: new Date().toISOString()
            },
            'patient@manodp.com': {
                email: 'patient@manodp.com',
                password: 'patient123',
                name: 'Rajesh Kumar',
                role: 'patient',
                age: 45,
                status: 'active',
                registeredAt: new Date().toISOString()
            },
            'pharma@manodp.com': {
                email: 'pharma@manodp.com',
                password: 'pharma123',
                name: 'Amit Sharma',
                role: 'pharmacist',
                pharmacy: 'City Medicals',
                status: 'active',
                registeredAt: new Date().toISOString()
            },
            'admin@manodp.com': {
                email: 'admin@manodp.com',
                password: 'admin123',
                name: 'Admin User',
                role: 'admin',
                status: 'active',
                registeredAt: new Date().toISOString()
            }
        };
        localStorage.setItem(USER_DB_KEY, JSON.stringify(defaultUsers));
    }
}

// Get all users
function getAllUsers() {
    return JSON.parse(localStorage.getItem(USER_DB_KEY) || '{}');
}

// Check if user exists
function userExists(email) {
    const users = getAllUsers();
    return users.hasOwnProperty(email);
}

// Register new user
function registerUser(userData) {
    const users = getAllUsers();
    
    if (userExists(userData.email)) {
        return { success: false, message: 'Email already registered' };
    }
    
    users[userData.email] = {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role,
        status: 'active',
        registeredAt: new Date().toISOString()
    };
    
    localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
    return { success: true, message: 'Registration successful' };
}

// Authenticate user
function authenticateUser(email, password) {
    const users = getAllUsers();
    
    if (!userExists(email)) {
        return { success: false, message: 'User not found' };
    }
    
    const user = users[email];
    
    if (user.password !== password) {
        return { success: false, message: 'Invalid password' };
    }
    
    if (user.status !== 'active') {
        return { success: false, message: 'Account is inactive' };
    }
    
    return { 
        success: true, 
        message: 'Login successful',
        user: {
            email: user.email,
            name: user.name,
            role: user.role,
            specialization: user.specialization,
            pharmacy: user.pharmacy,
            age: user.age
        }
    };
}

// Check if user is authenticated
function checkAuth() {
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    const token = localStorage.getItem('authToken');
    
    if (!userRole || !userEmail || !token) {
        return null;
    }
    
    // Check if token is expired (demo: token valid for 24 hours)
    const tokenTime = localStorage.getItem('tokenTime');
    if (tokenTime) {
        const tokenAge = Date.now() - parseInt(tokenTime);
        if (tokenAge > 24 * 60 * 60 * 1000) { // 24 hours
            logout();
            return null;
        }
    }
    
    return userRole;
}

// Generate auth token
function generateAuthToken() {
    return 'token_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
}

// Login function
function login(email, password, role) {
    const result = authenticateUser(email, password);
    
    if (!result.success) {
        return result;
    }
    
    // Check if selected role matches user's actual role
    if (role !== result.user.role) {
        return { 
            success: false, 
            message: `Please select ${result.user.role} role to login` 
        };
    }
    
    // Set session data
    const authToken = generateAuthToken();
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('tokenTime', Date.now().toString());
    localStorage.setItem('userRole', result.user.role);
    localStorage.setItem('userEmail', result.user.email);
    localStorage.setItem('userName', result.user.name);
    
    if (result.user.specialization) {
        localStorage.setItem('specialization', result.user.specialization);
    }
    if (result.user.pharmacy) {
        localStorage.setItem('pharmacyName', result.user.pharmacy);
    }
    if (result.user.age) {
        localStorage.setItem('patientAge', result.user.age);
    }
    
    return { 
        success: true, 
        message: 'Login successful',
        redirectTo: getDashboardUrl(result.user.role)
    };
}

// Logout function
function logout() {
    // Clear all auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenTime');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('specialization');
    localStorage.removeItem('pharmacyName');
    localStorage.removeItem('patientAge');
    localStorage.removeItem('rememberMe');
    
    // Redirect to login
    window.location.href = 'index.html';
}

// Get dashboard URL for role
function getDashboardUrl(role) {
    const dashboards = {
        doctor: 'dashboard-doctor.html',
        patient: 'dashboard-patient.html',
        pharmacist: 'dashboard-pharmacist.html',
        admin: 'dashboard-admin.html'
    };
    return dashboards[role] || 'index.html';
}

// Redirect to dashboard
function redirectToDashboard(role) {
    window.location.href = getDashboardUrl(role);
}

// Demo login function (for testing)
function demoLogin(role) {
    if (!demoCredentials[role]) {
        showAlert('Invalid role selected', 'error');
        return;
    }
    
    const credentials = demoCredentials[role];
    
    // Auto fill form
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput && passwordInput) {
        emailInput.value = credentials.email;
        passwordInput.value = credentials.password;
        
        // Set active role button
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-role') === role) {
                btn.classList.add('active');
            }
        });
        
        // Auto login after 500ms
        setTimeout(() => {
            const result = login(credentials.email, credentials.password, role);
            if (result.success) {
                showAlert('Demo login successful!', 'success');
                setTimeout(() => {
                    window.location.href = result.redirectTo;
                }, 1000);
            } else {
                showAlert(result.message, 'error');
            }
        }, 500);
    }
}

// Forgot password function
function forgotPassword(email) {
    const users = getAllUsers();
    
    if (!userExists(email)) {
        return { success: false, message: 'Email not registered' };
    }
    
    // In real app, send reset email
    // For demo, just show alert
    return { 
        success: true, 
        message: 'Password reset instructions sent to your email' 
    };
}

// Validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate password strength
function validatePassword(password) {
    // At least 6 characters
    return password.length >= 6;
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user database
    initUserDatabase();
    
    // Only run on login page
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/' || 
        window.location.pathname.endsWith('.html') === false) {
        
        // Check if already logged in
        if (checkAuth()) {
            const userRole = localStorage.getItem('userRole');
            redirectToDashboard(userRole);
            return;
        }
        
        // Role selection
        const roleButtons = document.querySelectorAll('.role-btn');
        roleButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                roleButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Toggle password visibility
        const togglePassword = document.querySelector('.toggle-password');
        const passwordInput = document.getElementById('password');
        
        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', function() {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            });
        }
        
        // Forgot password link
        const forgotLink = document.querySelector('.forgot-link');
        if (forgotLink) {
            forgotLink.addEventListener('click', function(e) {
                e.preventDefault();
                showForgotPasswordModal();
            });
        }
        
        // Signup toggle
        const signupToggle = document.getElementById('signupToggle');
        if (signupToggle) {
            signupToggle.addEventListener('click', function(e) {
                e.preventDefault();
                showSignupModal();
            });
        }
        
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;
                const activeRole = document.querySelector('.role-btn.active')?.getAttribute('data-role') || 'patient';
                const rememberMe = document.getElementById('remember')?.checked || false;
                
                // Validation
                if (!email || !password) {
                    showAlert('Please fill all fields', 'error');
                    return;
                }
                
                if (!validateEmail(email)) {
                    showAlert('Please enter a valid email address', 'error');
                    return;
                }
                
                if (!validatePassword(password)) {
                    showAlert('Password must be at least 6 characters', 'error');
                    return;
                }
                
                // Disable submit button
                const submitBtn = loginForm.querySelector('.login-btn');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
                submitBtn.disabled = true;
                
                // Attempt login
                setTimeout(() => {
                    const result = login(email, password, activeRole);
                    
                    if (result.success) {
                        if (rememberMe) {
                            localStorage.setItem('rememberMe', 'true');
                        }
                        
                        showAlert(result.message, 'success');
                        
                        setTimeout(() => {
                            window.location.href = result.redirectTo;
                        }, 1000);
                    } else {
                        showAlert(result.message, 'error');
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }
                }, 1000);
            });
        }
    }
    
    // Check authentication on protected pages
    const protectedPages = [
        'dashboard-doctor.html',
        'dashboard-patient.html', 
        'dashboard-pharmacist.html',
        'dashboard-admin.html',
        'create-prescription.html',
        'medicine-identify.html',
        'view-prescriptions.html',
        'verify-prescription.html',
        'manage-users.html'
    ];
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        const userRole = checkAuth();
        if (!userRole) {
            window.location.href = 'index.html';
        } else {
            // Verify user has access to this page
            const allowedRoles = {
                'dashboard-doctor.html': ['doctor'],
                'dashboard-patient.html': ['patient'],
                'dashboard-pharmacist.html': ['pharmacist'],
                'dashboard-admin.html': ['admin'],
                'create-prescription.html': ['doctor'],
                'medicine-identify.html': ['doctor', 'patient'],
                'view-prescriptions.html': ['doctor', 'patient', 'pharmacist', 'admin'],
                'verify-prescription.html': ['pharmacist'],
                'manage-users.html': ['admin']
            };
            
            if (allowedRoles[currentPage] && !allowedRoles[currentPage].includes(userRole)) {
                showAlert('You do not have permission to access this page', 'error');
                setTimeout(() => {
                    redirectToDashboard(userRole);
                }, 1500);
            }
        }
    }
});

// Show forgot password modal
function showForgotPasswordModal() {
    const modalHTML = `
        <div class="modal-overlay" id="forgotPasswordModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-key"></i> Forgot Password</h3>
                    <button class="modal-close" onclick="closeModal('forgotPasswordModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Enter your email address to reset your password:</p>
                    <div class="form-group">
                        <input type="email" id="forgotEmail" placeholder="Enter your email" class="form-control">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeModal('forgotPasswordModal')">
                            Cancel
                        </button>
                        <button type="button" class="btn-primary" onclick="submitForgotPassword()">
                            <i class="fas fa-paper-plane"></i> Send Reset Link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Add modal styles if not exists
    addModalStyles();
}

// Submit forgot password
function submitForgotPassword() {
    const email = document.getElementById('forgotEmail').value.trim();
    
    if (!email) {
        showAlert('Please enter your email', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showAlert('Please enter a valid email', 'error');
        return;
    }
    
    const result = forgotPassword(email);
    
    if (result.success) {
        showAlert(result.message, 'success');
        closeModal('forgotPasswordModal');
    } else {
        showAlert(result.message, 'error');
    }
}

// Show signup modal
function showSignupModal() {
    const modalHTML = `
        <div class="modal-overlay" id="signupModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-user-plus"></i> Create New Account</h3>
                    <button class="modal-close" onclick="closeModal('signupModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="signupForm" onsubmit="submitSignup(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label><i class="fas fa-user"></i> Full Name</label>
                                <input type="text" id="signupName" required class="form-control">
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-envelope"></i> Email</label>
                                <input type="email" id="signupEmail" required class="form-control">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label><i class="fas fa-key"></i> Password</label>
                                <input type="password" id="signupPassword" required class="form-control">
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-key"></i> Confirm Password</label>
                                <input type="password" id="signupConfirmPassword" required class="form-control">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label><i class="fas fa-user-tag"></i> Role</label>
                            <select id="signupRole" required class="form-control">
                                <option value="">Select Role</option>
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                                <option value="pharmacist">Pharmacist</option>
                            </select>
                        </div>
                        
                        <div class="form-group" id="signupSpecializationField" style="display: none;">
                            <label><i class="fas fa-stethoscope"></i> Specialization (for Doctors)</label>
                            <input type="text" id="signupSpecialization" class="form-control">
                        </div>
                        
                        <div class="form-group" id="signupPharmacyField" style="display: none;">
                            <label><i class="fas fa-store"></i> Pharmacy Name (for Pharmacists)</label>
                            <input type="text" id="signupPharmacy" class="form-control">
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="closeModal('signupModal')">
                                Cancel
                            </button>
                            <button type="submit" class="btn-success">
                                <i class="fas fa-user-plus"></i> Create Account
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Show/hide role-specific fields
    document.getElementById('signupRole').addEventListener('change', function() {
        const role = this.value;
        document.getElementById('signupSpecializationField').style.display = 
            role === 'doctor' ? 'block' : 'none';
        document.getElementById('signupPharmacyField').style.display = 
            role === 'pharmacist' ? 'block' : 'none';
    });
    
    // Add modal styles if not exists
    addModalStyles();
}

// Submit signup form
function submitSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const role = document.getElementById('signupRole').value;
    const specialization = document.getElementById('signupSpecialization')?.value.trim();
    const pharmacy = document.getElementById('signupPharmacy')?.value.trim();
    
    // Validation
    if (!name || !email || !password || !confirmPassword || !role) {
        showAlert('Please fill all required fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showAlert('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    if (role === 'doctor' && !specialization) {
        showAlert('Please enter your specialization', 'error');
        return;
    }
    
    if (role === 'pharmacist' && !pharmacy) {
        showAlert('Please enter pharmacy name', 'error');
        return;
    }
    
    // Prepare user data
    const userData = {
        email: email,
        password: password,
        name: name,
        role: role
    };
    
    if (specialization) userData.specialization = specialization;
    if (pharmacy) userData.pharmacy = pharmacy;
    
    // Register user
    const result = registerUser(userData);
    
    if (result.success) {
        showAlert(result.message, 'success');
        closeModal('signupModal');
        
        // Auto fill login form
        document.getElementById('email').value = email;
        document.getElementById('password').value = password;
        
        // Set role button
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-role') === role) {
                btn.classList.add('active');
            }
        });
    } else {
        showAlert(result.message, 'error');
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal && modal.parentElement) {
        modal.parentElement.remove();
    }
}

// Add modal styles
function addModalStyles() {
    if (!document.querySelector('#modal-styles')) {
        const modalStyles = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                padding: 20px;
            }
            
            .modal-content {
                background: white;
                border-radius: 15px;
                width: 100%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                color: #1a237e;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #666;
                cursor: pointer;
                padding: 5px;
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .modal-body p {
                color: #666;
                margin-bottom: 20px;
            }
            
            .form-actions {
                display: flex;
                justify-content: flex-end;
                gap: 15px;
                margin-top: 20px;
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'modal-styles';
        styleElement.textContent = modalStyles;
        document.head.appendChild(styleElement);
    }
}

// Show alert message
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert ${type}`;
    alertDiv.innerHTML = `
        <div class="alert-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'error' ? 'exclamation-circle' : 
                              type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

// Add CSS for alerts if not exists
if (!document.querySelector('#alert-styles')) {
    const alertCSS = `
        .custom-alert {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
            max-width: 400px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .alert-content {
            display: flex;
            align-items: center;
            padding: 15px 20px;
            color: white;
            font-weight: 500;
        }
        
        .alert-content i:first-child {
            margin-right: 12px;
            font-size: 1.2rem;
        }
        
        .alert-content span {
            flex: 1;
        }
        
        .alert-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            margin-left: 15px;
            padding: 5px;
        }
        
        .custom-alert.success {
            background: #4caf50;
            border-left: 4px solid #2e7d32;
        }
        
        .custom-alert.error {
            background: #f44336;
            border-left: 4px solid #c62828;
        }
        
        .custom-alert.info {
            background: #2196f3;
            border-left: 4px solid #0d47a1;
        }
        
        .custom-alert.warning {
            background: #ff9800;
            border-left: 4px solid #ef6c00;
        }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'alert-styles';
    styleElement.textContent = alertCSS;
    document.head.appendChild(styleElement);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkAuth,
        login,
        logout,
        registerUser,
        demoLogin,
        validateEmail,
        validatePassword
    };
}