// js/components/image-upload-component.js - Image upload component

/**
 * Image Upload Component - Handles UI for image upload and management
 */
export class ImageUploadComponent {
    constructor(imageUploadService) {
        this.imageUploadService = imageUploadService;
        this.uploadedImages = [];
        this.maxImages = 4;
        this.currentUploads = new Map();
        this.container = null;
        this.restaurantId = null;

        console.log('ImageUploadComponent initialized');
    }

    /**
     * Render component HTML
     * @returns {string} HTML string
     */
    render() {
        return `
            <div class="image-upload-container">
                <div class="upload-header">
                    <h3>Fotos do Restaurante</h3>
                    <div class="upload-info">
                        <span class="image-count">0/${this.maxImages}</span>
                        <span class="size-info">Máx. 2MB por foto</span>
                    </div>
                </div>

                <div class="upload-area" id="upload-area">
                    <div class="upload-content">
                        <div class="upload-icon">📷</div>
                        <div class="upload-text">
                            <p class="upload-title">Arraste fotos aqui ou clique para selecionar</p>
                            <p class="upload-subtitle">JPG, PNG, WebP • Máx. 2MB cada</p>
                        </div>
                        <button type="button" class="upload-button" id="select-files-btn">
                            Selecionar Fotos
                        </button>
                    </div>
                    <input
                        type="file"
                        id="file-input"
                        class="file-input"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                    >
                </div>

                <div class="image-preview-container" id="preview-container" style="display: none;">
                    <div class="preview-header">
                        <h4>Fotos Selecionadas</h4>
                        <button type="button" class="clear-all-btn" id="clear-all-btn">
                            Limpar Tudo
                        </button>
                    </div>
                    <div class="image-grid" id="image-grid"></div>
                </div>

                <div class="upload-progress-container" id="progress-container" style="display: none;">
                    <div class="progress-header">
                        <h4>Enviando Fotos</h4>
                        <button type="button" class="cancel-uploads-btn" id="cancel-uploads-btn">
                            Cancelar
                        </button>
                    </div>
                    <div class="progress-list" id="progress-list"></div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize component
     * @param {HTMLElement} container - Container element
     * @param {string} restaurantId - Restaurant ID
     */
    initialize(container, restaurantId) {
        this.container = container;
        this.restaurantId = restaurantId;
        this.setupEventListeners();
        console.log(`ImageUploadComponent initialized for restaurant ${restaurantId}`);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const uploadArea = this.container.querySelector('#upload-area');
        const fileInput = this.container.querySelector('#file-input');
        const selectBtn = this.container.querySelector('#select-files-btn');
        const clearAllBtn = this.container.querySelector('#clear-all-btn');
        const cancelBtn = this.container.querySelector('#cancel-uploads-btn');

        // Click to upload
        selectBtn.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('click', () => fileInput.click());

        // File selection
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleFileSelection(e.dataTransfer.files);
        });

        // Clear all
        clearAllBtn.addEventListener('click', () => {
            this.clearAllImages();
        });

        // Cancel uploads
        cancelBtn.addEventListener('click', () => {
            this.cancelAllUploads();
        });

        // Progress updates
        window.addEventListener('image-upload-progress', (e) => {
            this.updateProgress(e.detail.progress, e.detail.fileName);
        });
    }

    /**
     * Handle file selection
     * @param {FileList} files - Selected files
     */
    async handleFileSelection(files) {
        const validFiles = Array.from(files).filter(file => {
            return this.validateFile(file);
        });

        if (validFiles.length === 0) return;

        // Check limit
        const remainingSlots = this.maxImages - this.uploadedImages.length;
        const filesToAdd = validFiles.slice(0, remainingSlots);

        if (filesToAdd.length < validFiles.length) {
            this.showNotification(`Máximo de ${this.maxImages} fotos permitido.`, 'warning');
        }

        // Process files
        for (const file of filesToAdd) {
            await this.addImage(file);
        }

        this.updateUI();
    }

    /**
     * Validate file
     * @param {File} file - File to validate
     * @returns {boolean} True if valid
     */
    validateFile(file) {
        try {
            this.imageUploadService.validateFile(file);
            return true;
        } catch (error) {
            this.showNotification(error.message, 'error');
            return false;
        }
    }

    /**
     * Add image to upload queue
     * @param {File} file - Image file
     */
    async addImage(file) {
        const imageId = Date.now() + Math.random();

        const imageData = {
            id: imageId,
            file: file,
            previewUrl: URL.createObjectURL(file),
            status: 'pending', // pending, uploading, completed, error
            progress: 0,
            optimizedSize: null,
            originalSize: file.size,
            downloadUrl: null
        };

        this.uploadedImages.push(imageData);
        this.updateImageCount();

        // Start upload immediately
        this.uploadImage(imageId);
    }

    /**
     * Upload image
     * @param {number} imageId - Image ID
     */
    async uploadImage(imageId) {
        const imageData = this.uploadedImages.find(img => img.id === imageId);
        if (!imageData) return;

        imageData.status = 'uploading';
        this.updateUI();

        try {
            const result = await this.imageUploadService.uploadAndOptimizeImage(
                imageData.file,
                this.restaurantId
            );

            // Update image data
            imageData.status = 'completed';
            imageData.downloadUrl = result.downloadUrl;
            imageData.optimizedSize = result.optimizedSize;
            imageData.compressionRatio = result.compressionRatio;

            this.showNotification('Foto enviada com sucesso!', 'success');
        } catch (error) {
            imageData.status = 'error';
            imageData.error = error.message;
            this.showNotification(`Erro ao enviar foto: ${error.message}`, 'error');
        }

        this.updateUI();
    }

    /**
     * Update UI components
     */
    updateUI() {
        this.updateImageCount();
        this.updatePreviewArea();
        this.updateProgressArea();
    }

    /**
     * Update image count display
     */
    updateImageCount() {
        const countElement = this.container.querySelector('.image-count');
        countElement.textContent = `${this.uploadedImages.length}/${this.maxImages}`;
    }

    /**
     * Update preview area
     */
    updatePreviewArea() {
        const previewContainer = this.container.querySelector('#preview-container');
        const imageGrid = this.container.querySelector('#image-grid');

        if (this.uploadedImages.length === 0) {
            previewContainer.style.display = 'none';
            return;
        }

        previewContainer.style.display = 'block';
        imageGrid.innerHTML = this.uploadedImages.map(image => this.renderImagePreview(image)).join('');

        // Add event listeners to preview elements
        this.attachPreviewEventListeners();
    }

    /**
     * Render image preview
     * @param {Object} image - Image data
     * @returns {string} HTML string
     */
    renderImagePreview(image) {
        const statusIcon = {
            pending: '⏳',
            uploading: '📤',
            completed: '✅',
            error: '❌'
        };

        return `
            <div class="image-preview-item" data-image-id="${image.id}">
                <div class="image-preview-content">
                    <img src="${image.previewUrl}" alt="Preview" class="preview-image">
                    <div class="image-status ${image.status}">
                        <span class="status-icon">${statusIcon[image.status]}</span>
                        <span class="status-text">${this.getStatusText(image)}</span>
                    </div>
                    ${image.compressionRatio ? `
                        <div class="image-optimization-info">
                            <span class="optimization-badge">
                                🗜️ ${image.compressionRatio}% menor
                            </span>
                        </div>
                    ` : ''}
                </div>
                <div class="image-preview-actions">
                    ${image.status === 'uploading' ? `
                        <button class="action-btn cancel-btn" data-action="cancel" data-image-id="${image.id}">
                            Cancelar
                        </button>
                    ` : `
                        <button class="action-btn remove-btn" data-action="remove" data-image-id="${image.id}">
                            Remover
                        </button>
                    `}
                    ${image.status === 'completed' ? `
                        <button class="action-btn view-btn" data-action="view" data-image-id="${image.id}">
                            Visualizar
                        </button>
                    ` : ''}
                </div>
                ${image.error ? `
                    <div class="image-error">
                        <span class="error-text">${image.error}</span>
                    </div>
                ` : ''}
                ${image.status === 'uploading' ? `
                    <div class="image-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${image.progress}%"></div>
                        </div>
                        <span class="progress-text">${Math.round(image.progress)}%</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Get status text
     * @param {Object} image - Image data
     * @returns {string} Status text
     */
    getStatusText(image) {
        switch (image.status) {
            case 'pending': return 'Aguardando';
            case 'uploading': return 'Enviando...';
            case 'completed': return 'Concluído';
            case 'error': return 'Erro';
            default: return '';
        }
    }

    /**
     * Attach event listeners to preview elements
     */
    attachPreviewEventListeners() {
        const actionButtons = this.container.querySelectorAll('.action-btn');

        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const imageId = parseFloat(e.target.dataset.imageId);

                switch (action) {
                    case 'remove':
                        this.removeImage(imageId);
                        break;
                    case 'cancel':
                        this.cancelUpload(imageId);
                        break;
                    case 'view':
                        this.viewImage(imageId);
                        break;
                }
            });
        });
    }

    /**
     * Update progress
     * @param {number} progress - Progress percentage
     * @param {string} fileName - File name
     */
    updateProgress(progress, fileName) {
        // Update all uploading images
        this.uploadedImages
            .filter(img => img.status === 'uploading')
            .forEach(img => {
                img.progress = progress;
            });

        this.updatePreviewArea();
    }

    /**
     * Update progress area
     */
    updateProgressArea() {
        const progressContainer = this.container.querySelector('#progress-container');
        const uploadingImages = this.uploadedImages.filter(img => img.status === 'uploading');

        if (uploadingImages.length === 0) {
            progressContainer.style.display = 'none';
            return;
        }

        progressContainer.style.display = 'block';
        const progressList = this.container.querySelector('#progress-list');

        progressList.innerHTML = uploadingImages.map(img => `
            <div class="progress-item">
                <div class="progress-item-info">
                    <span class="progress-item-name">${img.file.name}</span>
                    <span class="progress-item-size">${this.formatFileSize(img.file.size)}</span>
                </div>
                <div class="progress-item-bar">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${img.progress}%"></div>
                    </div>
                    <span class="progress-text">${Math.round(img.progress)}%</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Remove image
     * @param {number} imageId - Image ID
     */
    removeImage(imageId) {
        const index = this.uploadedImages.findIndex(img => img.id === imageId);
        if (index === -1) return;

        const image = this.uploadedImages[index];

        // If uploading, cancel the upload
        if (image.status === 'uploading') {
            this.cancelUpload(imageId);
        }

        // Clean up
        if (image.previewUrl) {
            URL.revokeObjectURL(image.previewUrl);
        }

        // Remove from array
        this.uploadedImages.splice(index, 1);
        this.updateUI();
    }

    /**
     * Cancel upload
     * @param {number} imageId - Image ID
     */
    cancelUpload(imageId) {
        const image = this.uploadedImages.find(img => img.id === imageId);
        if (!image || image.status !== 'uploading') return;

        // Note: Firebase Storage doesn't support upload cancellation
        // We'll just mark it as cancelled and update UI
        image.status = 'cancelled';
        this.updateUI();
    }

    /**
     * Cancel all uploads
     */
    cancelAllUploads() {
        this.uploadedImages
            .filter(img => img.status === 'uploading')
            .forEach(img => {
                img.status = 'cancelled';
            });

        this.updateUI();
    }

    /**
     * Clear all images
     */
    clearAllImages() {
        // Clean up all preview URLs
        this.uploadedImages.forEach(img => {
            if (img.previewUrl) {
                URL.revokeObjectURL(img.previewUrl);
            }
        });

        // Clear array
        this.uploadedImages = [];
        this.updateUI();
    }

    /**
     * View image
     * @param {number} imageId - Image ID
     */
    viewImage(imageId) {
        const image = this.uploadedImages.find(img => img.id === imageId);
        if (!image || !image.downloadUrl) return;

        // Open image viewer modal
        window.dispatchEvent(new CustomEvent('view-image', {
            detail: {
                url: image.downloadUrl,
                name: image.file.name
            }
        }));
    }

    /**
     * Format file size
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     */
    showNotification(message, type = 'info') {
        window.dispatchEvent(new CustomEvent('show-notification', {
            detail: { message, type }
        }));
    }

    /**
     * Get uploaded images URLs
     * @returns {Array} Array of download URLs
     */
    getUploadedImages() {
        return this.uploadedImages
            .filter(img => img.status === 'completed')
            .map(img => img.downloadUrl);
    }

    /**
     * Reset component
     */
    reset() {
        this.clearAllImages();
        this.currentUploads.clear();
    }

    /**
     * Check if has uploaded images
     * @returns {boolean} True if has uploaded images
     */
    hasUploadedImages() {
        return this.uploadedImages.some(img => img.status === 'completed');
    }

    /**
     * Get images count
     * @returns {number} Number of uploaded images
     */
    getImagesCount() {
        return this.uploadedImages.filter(img => img.status === 'completed').length;
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.clearAllImages();
        this.currentUploads.clear();
        console.log('ImageUploadComponent cleaned up');
    }
}