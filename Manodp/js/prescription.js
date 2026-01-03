// Prescription Management Functions

let medicineCounter = 0;

// Add medicine row to the table
function addMedicineRow() {
    medicineCounter++;
    
    const medicinesBody = document.getElementById('medicinesBody');
    if (!medicinesBody) return;
    
    const newRow = document.createElement('tr');
    newRow.className = 'medicine-row';
    newRow.innerHTML = `
        <td>
            <input type="text" class="medicine-name" placeholder="e.g., Paracetamol" required>
        </td>
        <td>
            <input type="text" class="medicine-dosage" placeholder="e.g., 500mg" required>
        </td>
        <td>
            <select class="medicine-frequency" required>
                <option value="">Select</option>
                <option value="once">Once daily</option>
                <option value="twice">Twice daily</option>
                <option value="thrice">Thrice daily</option>
                <option value="four">Four times daily</option>
                <option value="as_needed">As needed</option>
                <option value="other">Other</option>
            </select>
        </td>
        <td>
            <input type="text" class="medicine-duration" placeholder="e.g., 5 days" required>
        </td>
        <td>
            <input type="text" class="medicine-instructions" placeholder="e.g., After food">
        </td>
        <td>
            <button type="button" class="remove-medicine" onclick="removeMedicineRow(this)">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    medicinesBody.appendChild(newRow);
}

// Remove medicine row
function removeMedicineRow(button) {
    const row = button.closest('tr');
    if (row) {
        row.remove();
    }
}

// Clear entire form
function clearForm() {
    if (confirm('Are you sure you want to clear the form? All data will be lost.')) {
        document.getElementById('prescriptionForm').reset();
        
        // Clear medicines table
        const medicinesBody = document.getElementById('medicinesBody');
        if (medicinesBody) {
            medicinesBody.innerHTML = '';
        }
        
        // Add one empty row
        addMedicineRow();
        
        showAlert('Form cleared successfully', 'success');
    }
}

// Save prescription as draft
function saveAsDraft() {
    const prescriptionData = collectPrescriptionData();
    
    if (!validatePrescriptionData(prescriptionData, false)) {
        return;
    }
    
    // Save to localStorage (in real app, send to backend)
    const drafts = JSON.parse(localStorage.getItem('prescriptionDrafts') || '[]');
    drafts.push({
        ...prescriptionData,
        id: Date.now(),
        status: 'draft',
        savedAt: new Date().toISOString()
    });
    
    localStorage.setItem('prescriptionDrafts', JSON.stringify(drafts));
    
    showAlert('Prescription saved as draft successfully!', 'success');
}

// Submit prescription
function submitPrescription(event) {
    event.preventDefault();
    
    const prescriptionData = collectPrescriptionData();
    
    if (!validatePrescriptionData(prescriptionData, true)) {
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('.btn-success');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Save to localStorage (in real app, send to backend)
        const prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
        const prescriptionId = Date.now();
        
        const finalPrescription = {
            ...prescriptionData,
            id: prescriptionId,
            doctorId: localStorage.getItem('userEmail'),
            doctorName: localStorage.getItem('userName') || 'Dr. Ramesh Kumar',
            date: new Date().toISOString(),
            status: 'active',
            prescriptionNumber: `RX-${prescriptionId.toString().slice(-6)}`,
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://manodp.com/prescription/${prescriptionId}`)}`
        };
        
        prescriptions.push(finalPrescription);
        localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
        
        // Reset form
        document.getElementById('prescriptionForm').reset();
        document.getElementById('medicinesBody').innerHTML = '';
        addMedicineRow();
        
        // Restore button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Show success message and redirect
        showAlert('Prescription generated successfully!', 'success');
        
        setTimeout(() => {
            // Redirect to prescription view or print page
            window.location.href = `view-prescription.html?id=${prescriptionId}`;
        }, 1500);
        
    }, 2000);
}

// Collect data from prescription form
function collectPrescriptionData() {
    // Patient information
    const patientData = {
        name: document.getElementById('patientName').value,
        age: document.getElementById('patientAge').value,
        gender: document.getElementById('patientGender').value,
        mobile: document.getElementById('patientMobile').value,
        email: document.getElementById('patientEmail').value,
        address: document.getElementById('patientAddress').value
    };
    
    // Diagnosis
    const diagnosisData = {
        diagnosis: document.getElementById('diagnosis').value,
        symptoms: document.getElementById('symptoms').value,
        visitDate: document.getElementById('visitDate').value,
        nextVisit: document.getElementById('nextVisit').value
    };
    
    // Medicines
    const medicines = [];
    const medicineRows = document.querySelectorAll('.medicine-row');
    
    medicineRows.forEach(row => {
        const medicine = {
            name: row.querySelector('.medicine-name').value,
            dosage: row.querySelector('.medicine-dosage').value,
            frequency: row.querySelector('.medicine-frequency').value,
            duration: row.querySelector('.medicine-duration').value,
            instructions: row.querySelector('.medicine-instructions').value
        };
        medicines.push(medicine);
    });
    
    // Instructions
    const instructionsData = {
        instructions: document.getElementById('instructions').value,
        testsRecommended: document.getElementById('testsRecommended').value
    };
    
    return {
        patient: patientData,
        diagnosis: diagnosisData,
        medicines: medicines,
        instructions: instructionsData
    };
}

// Validate prescription data
function validatePrescriptionData(data, isFinalSubmit) {
    // Check patient information
    if (!data.patient.name || !data.patient.age || !data.patient.gender || !data.patient.mobile) {
        showAlert('Please fill all required patient information', 'error');
        return false;
    }
    
    // Check diagnosis
    if (!data.diagnosis.diagnosis) {
        showAlert('Please enter diagnosis', 'error');
        return false;
    }
    
    // Check medicines
    if (data.medicines.length === 0) {
        showAlert('Please add at least one medicine', 'error');
        return false;
    }
    
    for (const medicine of data.medicines) {
        if (!medicine.name || !medicine.dosage || !medicine.frequency || !medicine.duration) {
            showAlert('Please fill all required fields for all medicines', 'error');
            return false;
        }
    }
    
    // Additional validation for final submit
    if (isFinalSubmit) {
        // Validate mobile number
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(data.patient.mobile.replace(/\D/g, ''))) {
            showAlert('Please enter a valid 10-digit mobile number', 'error');
            return false;
        }
        
        // Validate email if provided
        if (data.patient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.patient.email)) {
            showAlert('Please enter a valid email address', 'error');
            return false;
        }
        
        // Validate age
        const age = parseInt(data.patient.age);
        if (age < 1 || age > 120) {
            showAlert('Please enter a valid age (1-120)', 'error');
            return false;
        }
    }
    
    return true;
}

// Search patient from database (demo function)
function searchPatient() {
    const searchTerm = document.getElementById('patientSearch').value;
    if (!searchTerm) {
        showAlert('Please enter patient name or ID to search', 'warning');
        return;
    }
    
    // In real app, this would query backend
    showAlert(`Searching for patient: ${searchTerm}...`, 'info');
    
    // Demo patient data
    const demoPatients = [
        { id: 1, name: "Rajesh Kumar", age: 45, gender: "male", mobile: "9876543210" },
        { id: 2, name: "Meena Sharma", age: 32, gender: "female", mobile: "9876543211" },
        { id: 3, name: "Arun Jain", age: 60, gender: "male", mobile: "9876543212" }
    ];
    
    setTimeout(() => {
        const foundPatient = demoPatients.find(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.id.toString() === searchTerm
        );
        
        if (foundPatient) {
            // Auto-fill form
            document.getElementById('patientName').value = foundPatient.name;
            document.getElementById('patientAge').value = foundPatient.age;
            document.getElementById('patientGender').value = foundPatient.gender;
            document.getElementById('patientMobile').value = foundPatient.mobile;
            
            showAlert(`Patient found: ${foundPatient.name}`, 'success');
        } else {
            showAlert('Patient not found. Please check details or add new patient.', 'warning');
        }
    }, 1000);
}

// Generate prescription PDF (demo function)
function generatePDF(prescriptionId) {
    showAlert('Generating PDF prescription...', 'info');
    
    // In real app, this would generate actual PDF
    setTimeout(() => {
        // Create a printable version
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Prescription - ManoDP</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                        .section { margin-bottom: 20px; }
                        .medicine-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        .medicine-table th, .medicine-table td { border: 1px solid #ddd; padding: 10px; }
                        .footer { margin-top: 50px; border-top: 1px solid #333; padding-top: 20px; }
                        .signature { margin-top: 50px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>ManoDP - Smart E-Prescription</h1>
                        <p>Prescription #${prescriptionId}</p>
                        <p>Date: ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <div class="section">
                        <h3>Patient Information</h3>
                        <p>This is a demo prescription PDF.</p>
                        <p>In real implementation, this would contain actual prescription data.</p>
                    </div>
                    
                    <div class="footer">
                        <div class="signature">
                            <p><strong>Doctor's Signature:</strong></p>
                            <p>_________________________</p>
                            <p>Dr. Ramesh Kumar</p>
                            <p>License No: MED12345</p>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }, 1500);
}

// Initialize prescription page
document.addEventListener('DOMContentLoaded', function() {
    // Add first medicine row if on prescription page
    if (document.getElementById('medicinesBody')) {
        addMedicineRow();
        
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        const visitDateInput = document.getElementById('visitDate');
        if (visitDateInput) {
            visitDateInput.value = today;
        }
    }
});