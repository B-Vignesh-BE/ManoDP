// Medicine Identification Functions

let currentImage = null;

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        showAlert('Please upload a valid image file (JPEG, PNG, GIF)', 'error');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showAlert('Image size should be less than 5MB', 'error');
        return;
    }
    
    // Read and display image
    const reader = new FileReader();
    reader.onload = function(e) {
        currentImage = e.target.result;
        
        // Show preview
        const previewBox = document.getElementById('previewBox');
        const imagePreview = document.getElementById('imagePreview');
        
        imagePreview.src = currentImage;
        imagePreview.style.display = 'block';
        previewBox.style.display = 'block';
        
        // Enable identify button
        document.getElementById('identifyBtn').disabled = false;
        
        showAlert('Image uploaded successfully!', 'success');
    };
    
    reader.readAsDataURL(file);
}

// Clear uploaded image
function clearImage() {
    currentImage = null;
    
    // Hide preview
    const previewBox = document.getElementById('previewBox');
    const imagePreview = document.getElementById('imagePreview');
    
    imagePreview.src = '';
    imagePreview.style.display = 'none';
    previewBox.style.display = 'none';
    
    // Clear file input
    document.getElementById('medicineImage').value = '';
    
    // Hide results if shown
    document.getElementById('resultBox').style.display = 'none';
    
    showAlert('Image cleared', 'info');
}

// Identify medicine using AI (demo simulation)
function identifyMedicine() {
    if (!currentImage) {
        showAlert('Please upload an image first', 'error');
        return;
    }
    
    // Show scanning animation
    const scanningAnimation = document.getElementById('scanningAnimation');
    const resultBox = document.getElementById('resultBox');
    const identifyBtn = document.getElementById('identifyBtn');
    
    scanningAnimation.style.display = 'block';
    resultBox.style.display = 'none';
    identifyBtn.disabled = true;
    
    // Simulate AI processing (3 seconds)
    setTimeout(() => {
        // Hide scanning animation
        scanningAnimation.style.display = 'none';
        
        // Show results with demo data
        displayDemoResults();
        
        // Save to history
        saveToHistory();
        
        showAlert('Medicine identified successfully!', 'success');
    }, 3000);
}

// Display demo identification results
function displayDemoResults() {
    const resultBox = document.getElementById('resultBox');
    
    // Demo data - In real app, this would come from AI model
    const demoResults = {
        name: 'Paracetamol 500mg',
        generic: 'Acetaminophen',
        manufacturer: 'GSK Pharmaceuticals',
        dosageForm: 'Tablet',
        strength: '500 mg',
        uses: 'Fever, Pain Relief',
        accuracy: 85,
        sideEffects: 'Nausea, Liver damage (if overdosed)',
        precautions: 'Take with food, Avoid alcohol',
        storage: 'Store below 25°C',
        schedule: 'Over-the-counter (OTC)'
    };
    
    // Update DOM elements
    document.getElementById('medName').textContent = demoResults.name;
    document.getElementById('medGeneric').textContent = demoResults.generic;
    document.getElementById('medManufacturer').textContent = demoResults.manufacturer;
    document.getElementById('medDosageForm').textContent = demoResults.dosageForm;
    document.getElementById('medStrength').textContent = demoResults.strength;
    document.getElementById('medUses').textContent = demoResults.uses;
    
    // Update accuracy meter
    const accuracyFill = document.getElementById('accuracyFill');
    accuracyFill.style.width = `${demoResults.accuracy}%`;
    
    // Show result box
    resultBox.style.display = 'block';
}

// Save identification to history
function saveToHistory() {
    const history = JSON.parse(localStorage.getItem('medicineHistory') || '[]');
    
    const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        image: currentImage,
        name: document.getElementById('medName').textContent,
        accuracy: 85,
        generic: document.getElementById('medGeneric').textContent
    };
    
    history.unshift(historyEntry); // Add to beginning
    localStorage.setItem('medicineHistory', JSON.stringify(history));
    
    // Update history display
    loadIdentificationHistory();
}

// Load identification history
function loadIdentificationHistory() {
    const historyContainer = document.getElementById('identificationHistory');
    if (!historyContainer) return;
    
    const history = JSON.parse(localStorage.getItem('medicineHistory') || '[]');
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">No identification history yet.</p>';
        return;
    }
    
    historyContainer.innerHTML = history.slice(0, 5).map(item => `
        <div class="history-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="history-details">
                <h4>${item.name}</h4>
                <p>${item.generic}</p>
                <p class="history-date">${formatDateTime(item.timestamp)}</p>
            </div>
            <div class="history-accuracy">
                ${item.accuracy}%
            </div>
        </div>
    `).join('');
}

// Format date and time
function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Save identified medicine to prescription
function saveToPrescription() {
    const medicineName = document.getElementById('medName').textContent;
    
    // Check if we're on prescription page
    if (window.location.pathname.includes('create-prescription.html')) {
        // Add to prescription form
        addMedicineRow();
        
        // Get the last added row
        const rows = document.querySelectorAll('.medicine-row');
        const lastRow = rows[rows.length - 1];
        
        if (lastRow) {
            lastRow.querySelector('.medicine-name').value = medicineName;
            lastRow.querySelector('.medicine-dosage').value = document.getElementById('medStrength').textContent;
            
            showAlert(`Added ${medicineName} to prescription`, 'success');
            
            // Redirect to prescription page if not already there
            if (!window.location.pathname.includes('create-prescription.html')) {
                window.location.href = 'create-prescription.html';
            }
        }
    } else {
        // Save to localStorage for later use
        const savedMeds = JSON.parse(localStorage.getItem('savedMedicines') || '[]');
        savedMeds.push({
            name: medicineName,
            strength: document.getElementById('medStrength').textContent,
            savedAt: new Date().toISOString()
        });
        
        localStorage.setItem('savedMedicines', JSON.stringify(savedMeds));
        
        showAlert(`Saved ${medicineName} to your medicine list`, 'success');
    }
}

// Search for alternative medicines
function searchAlternative() {
    const currentMed = document.getElementById('medName').textContent;
    
    showAlert(`Searching for alternatives to ${currentMed}...`, 'info');
    
    // In real app, this would query medicine database
    setTimeout(() => {
        const alternatives = [
            { name: 'Ibuprofen 400mg', type: 'NSAID', uses: 'Pain, Inflammation' },
            { name: 'Aspirin 75mg', type: 'Blood thinner', uses: 'Pain, Fever, Heart' },
            { name: 'Diclofenac 50mg', type: 'NSAID', uses: 'Pain, Arthritis' }
        ];
        
        const alternativesHTML = alternatives.map(alt => `
            <div class="alternative-item">
                <h4>${alt.name}</h4>
                <p><strong>Type:</strong> ${alt.type}</p>
                <p><strong>Uses:</strong> ${alt.uses}</p>
                <button class="btn-small" onclick="selectAlternative('${alt.name}')">
                    <i class="fas fa-check"></i> Select
                </button>
            </div>
        `).join('');
        
        // Show alternatives in modal
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <h3><i class="fas fa-exchange-alt"></i> Alternative Medicines</h3>
                    <p>Alternatives to <strong>${currentMed}</strong>:</p>
                    <div class="alternatives-list">
                        ${alternativesHTML}
                    </div>
                    <div class="modal-actions">
                        <button class="btn-secondary" onclick="closeModal()">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
    }, 1500);
}

// Select alternative medicine
function selectAlternative(medicineName) {
    document.getElementById('medName').textContent = medicineName;
    closeModal();
    showAlert(`Selected ${medicineName} as alternative`, 'success');
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal && modal.parentElement) {
        modal.parentElement.remove();
    }
}

// Initialize medicine identification page
document.addEventListener('DOMContentLoaded', function() {
    // Load history if on medicine ID page
    if (window.location.pathname.includes('medicine-identify.html')) {
        loadIdentificationHistory();
        
        // Set up drag and drop
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                uploadArea.addEventListener(eventName, preventDefaults, false);
            });
            
            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            ['dragenter', 'dragover'].forEach(eventName => {
                uploadArea.addEventListener(eventName, highlight, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                uploadArea.addEventListener(eventName, unhighlight, false);
            });
            
            function highlight() {
                uploadArea.style.background = '#e3f2fd';
                uploadArea.style.borderColor = '#0d47a1';
            }
            
            function unhighlight() {
                uploadArea.style.background = '#f0f7ff';
                uploadArea.style.borderColor = '#1a73e8';
            }
            
            uploadArea.addEventListener('drop', handleDrop, false);
            
            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                
                if (files.length > 0) {
                    const fileInput = document.getElementById('medicineImage');
                    
                    // Create a new DataTransfer object
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(files[0]);
                    fileInput.files = dataTransfer.files;
                    
                    // Trigger change event
                    const event = new Event('change', { bubbles: true });
                    fileInput.dispatchEvent(event);
                }
            }
        }
    }
});