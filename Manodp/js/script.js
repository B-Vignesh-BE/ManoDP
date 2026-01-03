// Common Utility Functions for ManoDP

// Toggle sidebar visibility
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.toggle-sidebar i');
    
    if (sidebar && toggleBtn) {
        sidebar.classList.toggle('collapsed');
        
        // Change icon
        if (sidebar.classList.contains('collapsed')) {
            toggleBtn.classList.remove('fa-bars');
            toggleBtn.classList.add('fa-chevron-right');
        } else {
            toggleBtn.classList.remove('fa-chevron-right');
            toggleBtn.classList.add('fa-bars');
        }
    }
}

// Show/hide loading spinner
function showLoading(show = true) {
    let spinner = document.getElementById('loadingSpinner');
    
    if (show && !spinner) {
        spinner = document.createElement('div');
        spinner.id = 'loadingSpinner';
        spinner.innerHTML = `
            <div class="spinner-overlay">
                <div class="spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading...</p>
                </div>
            </div>
        `;
        document.body.appendChild(spinner);
        
        // Add styles
        const styles = `
            .spinner-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
            
            .spinner {
                text-align: center;
            }
            
            .spinner i {
                font-size: 3rem;
                color: #1a73e8;
                margin-bottom: 15px;
            }
            
            .spinner p {
                color: #666;
                font-weight: 500;
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    } else if (!show && spinner) {
        spinner.remove();
    }
}

// Format date to readable string
function formatDate(date, includeTime = false) {
    const d = new Date(date);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return d.toLocaleDateString('en-US', options);
}

// Capitalize first letter of each word
function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Validate Indian mobile number
function isValidIndianMobile(number) {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(number.replace(/\D/g, ''));
}

// Validate email
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showAlert('Failed to copy text', 'error');
    });
}

// Generate random ID
function generateId(prefix = '') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll/resize events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Smooth scroll to element
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Set page title dynamically
function setPageTitle(title) {
    document.title = `${title} | ManoDP`;
}

// Get URL parameters
function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        if (pair.length === 2) {
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
    }
    
    return params;
}

// Set active navigation item
function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar-menu a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath && currentPath.includes(linkPath) && linkPath !== '#') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', function() {
    // Set active nav item
    setActiveNavItem();
    
    // Add current year to footer if exists
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
            tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
            
            this.tooltipElement = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this.tooltipElement) {
                this.tooltipElement.remove();
            }
        });
    });
    
    // Add tooltip styles
    if (!document.querySelector('#tooltip-styles')) {
        const tooltipStyles = `
            .tooltip {
                position: fixed;
                background: #333;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 0.85rem;
                z-index: 1000;
                pointer-events: none;
                white-space: nowrap;
                max-width: 200px;
            }
            
            .tooltip:after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -5px;
                border-width: 5px;
                border-style: solid;
                border-color: #333 transparent transparent transparent;
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'tooltip-styles';
        styleElement.textContent = tooltipStyles;
        document.head.appendChild(styleElement);
    }
});

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleSidebar,
        showLoading,
        formatDate,
        capitalizeWords,
        isValidIndianMobile,
        isValidEmail,
        copyToClipboard,
        generateId,
        debounce,
        throttle,
        isInViewport,
        smoothScrollTo,
        setPageTitle,
        getUrlParams,
        setActiveNavItem
    };
}