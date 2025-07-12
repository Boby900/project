/**
 * Umbrella Customizer Application
 * Handles color theme switching, logo upload, and preview generation
 */

class UmbrellaCustomizer {
    constructor() {
        this.currentColor = 'blue';
        this.logoFile = null;
        this.logoSize = 100;
        
        this.initializeElements();
        this.bindEvents();
        this.updateTheme();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        // Main elements
        this.body = document.body;
        this.umbrellaImage = document.getElementById('umbrellaImage');
        this.logoOverlay = document.getElementById('logoOverlay');
        this.logoImage = document.getElementById('logoImage');
        
        // Controls
        this.colorSwatches = document.querySelectorAll('.color-swatch');
        this.logoUpload = document.getElementById('logoUpload');
        this.logoControls = document.getElementById('logoControls');
        this.logoSizeSlider = document.getElementById('logoSize');
        this.logoSizeValue = document.getElementById('logoSizeValue');
        this.removeLogo = document.getElementById('removeLogo');
        this.resetBtn = document.getElementById('resetBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.loadingIndicator = document.getElementById('loadingIndicator');
    }

    /**
     * Bind event listeners to interactive elements
     */
    bindEvents() {
        // Color swatch selection
        this.colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                const color = e.currentTarget.dataset.color;
                this.changeColor(color);
            });
        });

        // Logo upload
        this.logoUpload.addEventListener('change', (e) => {
            this.handleLogoUpload(e);
        });

        // Logo size adjustment
        this.logoSizeSlider.addEventListener('input', (e) => {
            this.adjustLogoSize(e.target.value);
        });

        // Remove logo
        this.removeLogo.addEventListener('click', () => {
            this.removeLogoFile();
        });

        // Reset customization
        this.resetBtn.addEventListener('click', () => {
            this.resetCustomization();
        });

        // Download preview
        this.downloadBtn.addEventListener('click', () => {
            this.downloadPreview();
        });

        // Drag and drop functionality
        this.setupDragAndDrop();
    }

    /**
     * Change umbrella color and update theme
     * @param {string} color - The selected color (blue, yellow, pink)
     */
    changeColor(color) {
        if (this.currentColor === color) return;

        this.showLoading();
        
        // Update active state
        this.colorSwatches.forEach(swatch => {
            swatch.classList.remove('active');
            if (swatch.dataset.color === color) {
                swatch.classList.add('active');
            }
        });

        this.currentColor = color;
        
        // Update umbrella image with smooth transition
        setTimeout(() => {
            this.umbrellaImage.style.opacity = '0';
            
            setTimeout(() => {
                this.umbrellaImage.src = `src/assets/${this.capitalizeFirst(color)} umbrella.png`;
                this.umbrellaImage.onload = () => {
                    this.umbrellaImage.style.opacity = '1';
                    this.updateTheme();
                    this.hideLoading();
                };
            }, 150);
        }, 100);
    }

    /**
     * Update the application theme based on selected color
     */
    updateTheme() {
        // Remove existing theme classes
        this.body.classList.remove('theme-blue', 'theme-yellow', 'theme-pink');
        
        // Add new theme class
        this.body.classList.add(`theme-${this.currentColor}`);
    }

    /**
     * Handle logo file upload
     * @param {Event} event - File input change event
     */
    handleLogoUpload(event) {
        const file = event.target.files[0];
        
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showError('Please select a valid image file.');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            this.showError('File size must be less than 5MB.');
            return;
        }

        this.showLoading();
        this.logoFile = file;

        // Create file reader
        const reader = new FileReader();
        reader.onload = (e) => {
            this.logoImage.src = e.target.result;
            this.logoOverlay.classList.remove('hidden');
            this.logoControls.classList.remove('hidden');
            this.hideLoading();
        };

        reader.onerror = () => {
            this.showError('Error reading file. Please try again.');
            this.hideLoading();
        };

        reader.readAsDataURL(file);
    }

    /**
     * Adjust logo size based on slider value
     * @param {number} size - Size percentage (50-150)
     */
    adjustLogoSize(size) {
        this.logoSize = size;
        this.logoSizeValue.textContent = `${size}%`;
        
        // Calculate actual size based on percentage
        const baseSize = 80; // Base size in pixels
        const actualSize = (baseSize * size) / 100;
        
        this.logoImage.style.maxWidth = `${actualSize}px`;
        this.logoImage.style.maxHeight = `${actualSize}px`;
    }

    /**
     * Remove the uploaded logo
     */
    removeLogoFile() {
        this.logoFile = null;
        this.logoUpload.value = '';
        this.logoOverlay.classList.add('hidden');
        this.logoControls.classList.add('hidden');
        this.logoImage.src = '';
    }

    /**
     * Reset all customizations to default state
     */
    resetCustomization() {
        // Reset to blue color
        this.changeColor('blue');
        
        // Remove logo
        this.removeLogoFile();
        
        // Reset logo size
        this.logoSizeSlider.value = 100;
        this.adjustLogoSize(100);
    }

    /**
     * Download the customized umbrella preview
     */
    downloadPreview() {
        this.showLoading();
        
        // Create canvas for combining umbrella and logo
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 800;
        canvas.height = 600;
        
        // Load umbrella image
        const umbrellaImg = new Image();
        umbrellaImg.crossOrigin = 'anonymous';
        umbrellaImg.onload = () => {
            // Draw umbrella
            const umbrellaWidth = 600;
            const umbrellaHeight = (umbrellaImg.height * umbrellaWidth) / umbrellaImg.width;
            const umbrellaX = (canvas.width - umbrellaWidth) / 2;
            const umbrellaY = (canvas.height - umbrellaHeight) / 2;
            
            ctx.drawImage(umbrellaImg, umbrellaX, umbrellaY, umbrellaWidth, umbrellaHeight);
            
            // Draw logo if present
            if (this.logoFile && !this.logoOverlay.classList.contains('hidden')) {
                const logoImg = new Image();
                logoImg.crossOrigin = 'anonymous';
                logoImg.onload = () => {
                    // Calculate logo position (bottom center of umbrella)
                    const logoSize = (80 * this.logoSize) / 100;
                    const logoX = (canvas.width - logoSize) / 2;
                    const logoY = umbrellaY + umbrellaHeight * 0.85 - logoSize / 2;
                    
                    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
                    
                    // Download the image
                    this.downloadCanvas(canvas);
                };
                logoImg.src = this.logoImage.src;
            } else {
                // Download without logo
                this.downloadCanvas(canvas);
            }
        };
        
        umbrellaImg.src = this.umbrellaImage.src;
    }

    /**
     * Download canvas as image file
     * @param {HTMLCanvasElement} canvas - Canvas element to download
     */
    downloadCanvas(canvas) {
        try {
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `custom-umbrella-${this.currentColor}-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                this.hideLoading();
            }, 'image/png');
        } catch (error) {
            this.showError('Error generating preview. Please try again.');
            this.hideLoading();
        }
    }

    /**
     * Setup drag and drop functionality for logo upload
     */
    setupDragAndDrop() {
        const uploadArea = document.querySelector('.upload-area');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('drag-over');
            }, false);
        });

        uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.logoUpload.files = files;
                this.handleLogoUpload({ target: { files } });
            }
        }, false);
    }

    /**
     * Prevent default drag behaviors
     * @param {Event} e - Event object
     */
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        this.loadingIndicator.classList.remove('hidden');
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        this.loadingIndicator.classList.add('hidden');
    }

    /**
     * Show error message to user
     * @param {string} message - Error message to display
     */
    showError(message) {
        // Create and show error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fee2e2;
            color: #dc2626;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            border: 1px solid #fecaca;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(errorDiv);

        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 300);
        }, 5000);
    }

    /**
     * Capitalize first letter of string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Add CSS animations for error notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .drag-over {
        border-color: var(--primary-color) !important;
        background: rgba(59, 130, 246, 0.05) !important;
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UmbrellaCustomizer();
});

// Handle image loading errors gracefully
window.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        console.warn('Image failed to load:', e.target.src);
        // Could implement fallback image logic here
    }
}, true);