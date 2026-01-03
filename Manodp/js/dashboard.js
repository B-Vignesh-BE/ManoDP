// Dashboard Functions for ManoDP

// Sample data for demonstration
const sampleData = {
    doctor: {
        todayPrescriptions: 48,
        totalPatients: 126,
        pendingReviews: 12,
        medicinesIdentified: 245,
        recentPrescriptions: [
            {
                id: 1,
                patientName: "Rajesh Kumar",
                patientAge: 45,
                date: "2025-12-10",
                diagnosis: "Hypertension",
                medicines: 3,
                status: "active"
            },
            {
                id: 2,
                patientName: "Meena Sharma",
                patientAge: 32,
                date: "2025-12-09",
                diagnosis: "Migraine",
                medicines: 5,
                status: "pending"
            },
            {
                id: 3,
                patientName: "Arun Jain",
                patientAge: 60,
                date: "2025-12-08",
                diagnosis: "Diabetes Type 2",
                medicines: 2,
                status: "completed"
            }
        ],
        todaysAppointments: [
            {
                time: "10:00 AM",
                duration: "30 mins",
                patientName: "Priya Singh",
                purpose: "Follow-up checkup",
                conditions: ["Hypertension", "Diabetes"]
            },
            {
                time: "11:30 AM",
                duration: "45 mins",
                patientName: "Amit Patel",
                purpose: "New patient consultation",
                conditions: ["Fever", "Cough"]
            }
        ]
    },
    patient: {
        activePrescriptions: 2,
        upcomingAppointments: 1,
        medicinesToday: 3,
        healthScore: 85,
        recentPrescriptions: [
            {
                id: 1,
                doctorName: "Dr. Ramesh Kumar",
                date: "2025-12-10",
                diagnosis: "Hypertension",
                status: "active"
            }
        ]
    },
    pharmacist: {
        prescriptionsToday: 24,
        pendingVerifications: 8,
        medicinesDispensed: 156,
        stockAlerts: 3
    },
    admin: {
        totalUsers: 245,
        activeToday: 48,
        newRegistrations: 12,
        systemHealth: 98
    }
};

// Load dashboard data based on user role
function loadDashboardData(role) {
    const data = sampleData[role] || {};
    
    // Update stats cards
    updateStatsCards(data);
    
    // Load role-specific content
    switch(role) {
        case 'doctor':
            loadDoctorDashboard(data);
            break;
        case 'patient':
            loadPatientDashboard(data);
            break;
        case 'pharmacist':
            loadPharmacistDashboard(data);
            break;
        case 'admin':
            loadAdminDashboard(data);
            break;
    }
}

// Update statistics cards
function updateStatsCards(data) {
    // Update today prescriptions
    if (data.todayPrescriptions !== undefined) {
        const element = document.getElementById('todayPrescriptions');
        if (element) {
            animateCounter(element, data.todayPrescriptions);
        }
    }
    
    // Update total patients
    if (data.totalPatients !== undefined) {
        const element = document.getElementById('totalPatients');
        if (element) {
            animateCounter(element, data.totalPatients);
        }
    }
    
    // Update pending reviews
    if (data.pendingReviews !== undefined) {
        const element = document.getElementById('pendingReviews');
        if (element) {
            animateCounter(element, data.pendingReviews);
        }
    }
    
    // Update medicines identified
    if (data.medicinesIdentified !== undefined) {
        const element = document.getElementById('medicinesIdentified');
        if (element) {
            animateCounter(element, data.medicinesIdentified);
        }
    }
}

// Animate counter from 0 to target value
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50; // 50 steps
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 20);
}

// Load doctor dashboard
function loadDoctorDashboard(data) {
    // Load recent prescriptions
    const recentPrescriptionsContainer = document.getElementById('recentPrescriptions');
    if (recentPrescriptionsContainer && data.recentPrescriptions) {
        recentPrescriptionsContainer.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Diagnosis</th>
                        <th>Medicines</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.recentPrescriptions.map(pres => `
                        <tr>
                            <td>
                                <div class="patient-cell">
                                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(pres.patientName)}&background=0d47a1&color=fff" alt="${pres.patientName}">
                                    <div>
                                        <strong>${pres.patientName}</strong>
                                        <small>Age: ${pres.patientAge}</small>
                                    </div>
                                </div>
                            </td>
                            <td>${formatDate(pres.date)}</td>
                            <td>${pres.diagnosis}</td>
                            <td>${pres.medicines} medicines</td>
                            <td><span class="status ${pres.status}">${pres.status.charAt(0).toUpperCase() + pres.status.slice(1)}</span></td>
                            <td>
                                <button class="btn-small" onclick="viewPrescription(${pres.id})">
                                    <i class="fas fa-eye"></i> View
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    // Load today's appointments
    const appointmentsContainer = document.getElementById('todaysAppointments');
    if (appointmentsContainer && data.todaysAppointments) {
        appointmentsContainer.innerHTML = data.todaysAppointments.map(appointment => `
            <div class="appointment-card">
                <div class="appointment-time">
                    <strong>${appointment.time}</strong>
                    <small>${appointment.duration}</small>
                </div>
                <div class="appointment-details">
                    <h4>${appointment.patientName}</h4>
                    <p>${appointment.purpose}</p>
                    <div class="tags">
                        ${appointment.conditions.map(condition => 
                            `<span class="tag">${condition}</span>`
                        ).join('')}
                    </div>
                </div>
                <button class="btn-small" onclick="startConsultation('${appointment.patientName}')">
                    <i class="fas fa-video"></i> Start
                </button>
            </div>
        `).join('');
    }
}

// Load patient dashboard
function loadPatientDashboard(data) {
    // Patient dashboard specific functionality
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    // Update welcome message
    const welcomeMsg = document.getElementById('welcomeMessage');
    if (welcomeMsg && userName) {
        welcomeMsg.textContent = `Welcome back, ${userName}`;
    }
    
    // Load patient prescriptions
    if (data.recentPrescriptions) {
        const container = document.getElementById('patientPrescriptions');
        if (container) {
            container.innerHTML = data.recentPrescriptions.map(pres => `
                <div class="prescription-card">
                    <div class="prescription-header">
                        <h4>Prescription #${pres.id}</h4>
                        <span class="status ${pres.status}">${pres.status}</span>
                    </div>
                    <div class="prescription-body">
                        <p><i class="fas fa-user-md"></i> ${pres.doctorName}</p>
                        <p><i class="fas fa-calendar"></i> ${formatDate(pres.date)}</p>
                        <p><i class="fas fa-diagnoses"></i> ${pres.diagnosis}</p>
                    </div>
                    <div class="prescription-actions">
                        <button class="btn-small" onclick="viewPrescription(${pres.id})">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        <button class="btn-small" onclick="downloadPrescription(${pres.id})">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Load pharmacist dashboard
function loadPharmacistDashboard(data) {
    // Pharmacist dashboard functionality
    const pharmacyName = localStorage.getItem('pharmacyName') || 'Your Pharmacy';
    
    // Update pharmacy name
    const pharmacyElement = document.getElementById('pharmacyName');
    if (pharmacyElement) {
        pharmacyElement.textContent = pharmacyName;
    }
    
    // Load pending verifications
    if (data.pendingVerifications !== undefined) {
        const element = document.getElementById('pendingVerifications');
        if (element) {
            element.textContent = data.pendingVerifications;
        }
    }
}

// Load admin dashboard
function loadAdminDashboard(data) {
    // Admin dashboard functionality
    // Load system statistics
    if (data.totalUsers !== undefined) {
        const element = document.getElementById('totalUsers');
        if (element) {
            animateCounter(element, data.totalUsers);
        }
    }
}

// Format date to readable format
function formatDate(dateString) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// View prescription details
function viewPrescription(prescriptionId) {
    // In a real app, this would fetch prescription details from backend
    showAlert(`Loading prescription #${prescriptionId}...`, 'info');
    
    // For demo, redirect to view page
    setTimeout(() => {
        window.location.href = `view-prescription.html?id=${prescriptionId}`;
    }, 500);
}

// Start video consultation
function startConsultation(patientName) {
    showAlert(`Starting consultation with ${patientName}...`, 'info');
    
    // In a real app, this would initiate a video call
    setTimeout(() => {
        // Redirect to consultation page or open video modal
        const modalHTML = `
            <div class="consultation-modal">
                <div class="modal-content">
                    <h3><i class="fas fa-video"></i> Consultation with ${patientName}</h3>
                    <div class="video-container">
                        <div class="video-placeholder">
                            <i class="fas fa-user-md"></i>
                            <p>Video consultation would start here</p>
                            <p>In a real implementation, this would connect via WebRTC</p>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-secondary" onclick="closeModal()">
                            <i class="fas fa-times"></i> End Call
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Add modal styles
        const modalStyles = `
            .consultation-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .modal-content {
                background: white;
                border-radius: 15px;
                padding: 30px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .video-container {
                width: 100%;
                height: 400px;
                background: #1a237e;
                border-radius: 10px;
                margin: 20px 0;
                display: flex;
                justify-content: center;
                align-items: center;
                color: white;
            }
            
            .video-placeholder {
                text-align: center;
            }
            
            .video-placeholder i {
                font-size: 5rem;
                margin-bottom: 20px;
                opacity: 0.7;
            }
            
            .modal-actions {
                display: flex;
                justify-content: center;
                margin-top: 20px;
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = modalStyles;
        document.head.appendChild(styleElement);
    }, 1000);
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.consultation-modal');
    if (modal) {
        modal.remove();
    }
}

// Add new patient (doctor function)
function addNewPatient() {
    showAlert('Opening patient registration form...', 'info');
    
    // In a real app, this would open a patient registration modal
    setTimeout(() => {
        const patientFormHTML = `
            <div class="modal-overlay" id="patientModal">
                <div class="modal-content">
                    <h3><i class="fas fa-user-plus"></i> Add New Patient</h3>
                    <form id="newPatientForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Full Name</label>
                                <input type="text" id="newPatientName" required>
                            </div>
                            <div class="form-group">
                                <label>Age</label>
                                <input type="number" id="newPatientAge" required min="1" max="120">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Gender</label>
                                <select id="newPatientGender" required>
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Mobile</label>
                                <input type="tel" id="newPatientMobile" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Email (Optional)</label>
                            <input type="email" id="newPatientEmail">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="closePatientModal()">
                                Cancel
                            </button>
                            <button type="submit" class="btn-success">
                                Add Patient
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Add modal to page
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = patientFormHTML;
        document.body.appendChild(modalContainer);
        
        // Handle form submission
        document.getElementById('newPatientForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('newPatientName').value;
            showAlert(`Patient ${name} added successfully!`, 'success');
            closePatientModal();
        });
    }, 500);
}

// Close patient modal
function closePatientModal() {
    const modal = document.getElementById('patientModal');
    if (modal && modal.parentElement) {
        modal.parentElement.remove();
    }
}

// Print reports
function printReports() {
    showAlert('Generating printable report...', 'info');
    
    // In a real app, this would generate a PDF report
    setTimeout(() => {
        window.print();
    }, 1000);
}

// Open help
function openHelp() {
    showAlert('Opening help documentation...', 'info');
    
    // In a real app, this would open help documentation
    setTimeout(() => {
        window.open('help.html', '_blank');
    }, 500);
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    const userRole = localStorage.getItem('userRole');
    if (userRole) {
        loadDashboardData(userRole);
    }
});