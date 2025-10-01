# Story 2.2: Image Upload & Optimization

## Status
Completed

## Story
**As a** restaurant owner,
**I want** to upload photos of my restaurant,
**so that** users can see the establishment before visiting.

## Acceptance Criteria
1. Support for uploading up to 4 images per restaurant
2. File validation for JPG, PNG, WebP formats
3. Size limitation (2MB maximum) with client-side validation
4. Automatic image optimization using Canvas API for web display
5. Image preview before final submission

## Tasks / Subtasks
- [ ] Task 1: Implement multi-file upload functionality with limit enforcement (AC: 1)
  - [ ] Create multi-file upload functionality
  - [ ] Add limit enforcement for maximum 4 images
  - [ ] Create image management interface for uploaded photos
  - [ ] Add reordering functionality for uploaded images
  - [ ] Implement image replacement and removal options
  - [ ] Show image count indicator
- [ ] Task 2: Create comprehensive file validation system (AC: 2)
  - [ ] Create client-side file type validation
  - [ ] Accept only JPG, PNG, and WebP formats
  - [ ] Show clear error messages for invalid file types
  - [ ] Add file extension checking
  - [ ] Implement MIME type validation
  - [ ] Provide user guidance on accepted formats
- [ ] Task 3: Implement file size validation and progress tracking (AC: 3)
  - [ ] Implement file size validation (2MB maximum per image)
  - [ ] Add client-side size checking before upload
  - [ ] Show size progress indicator for large files
  - [ ] Provide compression suggestions for oversized images
  - [ ] Display human-readable file sizes
  - [ ] Add batch size validation for multiple files
- [ ] Task 4: Develop automatic image optimization system (AC: 4)
  - [ ] Implement image compression using Canvas API
  - [ ] Create automatic resizing for optimal web display
  - [ ] Add quality optimization to reduce file size
  - [ ] Implement format conversion (WebP for better compression)
  - [ ] Create progressive loading for optimized images
  - [ ] Add metadata stripping for privacy
- [ ] Task 5: Create image preview and management interface (AC: 5)
  - [ ] Create immediate preview after image selection
  - [ ] Add zoom functionality for detailed inspection
  - [ ] Implement image rotation and cropping tools
  - [ ] Show optimization results (before/after comparison)
  - [ ] Add image quality indicators
  - [ ] Provide cancel option for unsatisfactory uploads

## Dev Notes
This story implements a comprehensive image upload and optimization system that allows restaurant owners to upload, preview, and optimize photos for their restaurant listings.

### Image Upload Service

```javascript
// js/services/image-upload-service.js
export class ImageUploadService {
    constructor(firebaseStorage) {
        this.storage = firebaseStorage;
        this.maxFileSize = 2 * 1024 * 1024; // 2MB
        this.maxImages = 4;
        this.acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        this.optimizationOptions = {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.8,
            format: 'webp'
        };
    }

    async uploadAndOptimizeImage(file, restaurantId) {
        try {
            // Validate file
            this.validateFile(file);

            // Optimize image
            const optimizedFile = await this.optimizeImage(file);

            // Upload to Firebase Storage
            const downloadUrl = await this.uploadToStorage(optimizedFile, restaurantId);

            return {
                originalName: file.name,
                optimizedSize: optimizedFile.size,
                originalSize: file.size,
                downloadUrl,
                uploadTimestamp: Date.now()
            };
        } catch (error) {
            console.error('Image upload error:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    }

    validateFile(file) {
        // Check file type
        if (!this.acceptedTypes.includes(file.type)) {
            throw new Error(`Invalid file type. Accepted formats: JPG, PNG, WebP`);
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            throw new Error(`File too large (${sizeMB}MB). Maximum size: 2MB`);
        }

        return true;
    }

    async optimizeImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                try {
                    // Calculate new dimensions
                    let { width, height } = this.calculateDimensions(
                        img.width,
                        img.height
                    );

                    canvas.width = width;
                    canvas.height = height;

                    // Draw optimized image
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to blob with optimization
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Failed to optimize image'));
                                return;
                            }

                            // Create optimized file
                            const optimizedFile = new File(
                                [blob],
                                this.getOptimizedFileName(file.name),
                                {
                                    type: `image/${this.optimizationOptions.format}`,
                                    lastModified: Date.now()
                                }
                            );

                            resolve(optimizedFile);
                        },
                        `image/${this.optimizationOptions.format}`,
                        this.optimizationOptions.quality
                    );
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            img.src = URL.createObjectURL(file);
        });
    }

    calculateDimensions(originalWidth, originalHeight) {
        const { maxWidth, maxHeight } = this.optimizationOptions;
        let width = originalWidth;
        let height = originalHeight;

        // Scale down if necessary
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }

        return { width, height };
    }

    getOptimizedFileName(originalName) {
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        return `${nameWithoutExt}_optimized.webp`;
    }

    async uploadToStorage(file, restaurantId) {
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const filePath = `restaurants/${restaurantId}/photos/${fileName}`;
        const storageRef = this.storage.ref(filePath);

        // Create upload task
        const uploadTask = storageRef.put(file);

        // Return promise that resolves with download URL
        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Handle progress updates
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    this.updateProgress(progress);
                },
                (error) => {
                    reject(error);
                },
                async () => {
                    try {
                        const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();
                        resolve(downloadUrl);
                    } catch (error) {
                        reject(error);
                    }
                }
            );
        });
    }

    updateProgress(progress) {
        // Dispatch progress event
        window.dispatchEvent(new CustomEvent('image-upload-progress', {
            detail: { progress }
        }));
    }

    async deleteImage(imageUrl) {
        try {
            // Extract file path from URL
            const storageRef = this.storage.refFromURL(imageUrl);
            await storageRef.delete();
            return true;
        } catch (error) {
            console.error('Error deleting image:', error);
            throw new Error('Failed to delete image');
        }
    }

    async optimizeExistingImage(imageUrl) {
        try {
            // Download existing image
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'existing_image', { type: blob.type });

            // Optimize and re-upload
            const optimizedFile = await this.optimizeImage(file);
            // Note: This would need restaurant ID to upload back to storage
            return optimizedFile;
        } catch (error) {
            console.error('Error optimizing existing image:', error);
            throw new Error('Failed to optimize existing image');
        }
    }
}
```

### Image Upload Component

```javascript
// js/components/image-upload-component.js
export class ImageUploadComponent {
    constructor(imageUploadService) {
        this.imageUploadService = imageUploadService;
        this.uploadedImages = [];
        this.maxImages = 4;
        this.currentUploads = new Map();
        this.container = null;
    }

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

    initialize(container, restaurantId) {
        this.container = container;
        this.restaurantId = restaurantId;
        this.setupEventListeners();
    }

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
            this.updateProgress(e.detail.progress);
        });
    }

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

    validateFile(file) {
        try {
            this.imageUploadService.validateFile(file);
            return true;
        } catch (error) {
            this.showNotification(error.message, 'error');
            return false;
        }
    }

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
            imageData.optimizationRatio = ((file.size - result.optimizedSize) / file.size * 100).toFixed(1);

            this.showNotification('Foto enviada com sucesso!', 'success');
        } catch (error) {
            imageData.status = 'error';
            imageData.error = error.message;
            this.showNotification(`Erro ao enviar foto: ${error.message}`, 'error');
        }

        this.updateUI();
    }

    updateUI() {
        this.updateImageCount();
        this.updatePreviewArea();
        this.updateProgressArea();
    }

    updateImageCount() {
        const countElement = this.container.querySelector('.image-count');
        countElement.textContent = `${this.uploadedImages.length}/${this.maxImages}`;
    }

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
                    ${image.optimizedSize ? `
                        <div class="image-optimization-info">
                            <span class="optimization-badge">
                                🗜️ ${image.optimizationRatio}% menor
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

    getStatusText(image) {
        switch (image.status) {
            case 'pending': return 'Aguardando';
            case 'uploading': return 'Enviando...';
            case 'completed': return 'Concluído';
            case 'error': return 'Erro';
            default: return '';
        }
    }

    attachPreviewEventListeners() {
        const actionButtons = this.container.querySelectorAll('.action-btn');

        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const imageId = parseInt(e.target.dataset.imageId);

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

    updateProgress(progress) {
        // Update all uploading images
        this.uploadedImages
            .filter(img => img.status === 'uploading')
            .forEach(img => {
                img.progress = progress;
            });

        this.updatePreviewArea();
    }

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

    cancelUpload(imageId) {
        const image = this.uploadedImages.find(img => img.id === imageId);
        if (!image || image.status !== 'uploading') return;

        // Note: Firebase Storage doesn't support upload cancellation
        // We'll just mark it as cancelled and update UI
        image.status = 'cancelled';
        this.updateUI();
    }

    cancelAllUploads() {
        this.uploadedImages
            .filter(img => img.status === 'uploading')
            .forEach(img => {
                img.status = 'cancelled';
            });

        this.updateUI();
    }

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

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        window.dispatchEvent(new CustomEvent('show-notification', {
            detail: { message, type }
        }));
    }

    getUploadedImages() {
        return this.uploadedImages
            .filter(img => img.status === 'completed')
            .map(img => img.downloadUrl);
    }

    reset() {
        this.clearAllImages();
        this.currentUploads.clear();
    }
}
```

### CSS Styles

```css
/* Image upload container */
.image-upload-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.upload-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.upload-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
}

.upload-info {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.image-count {
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    background-color: var(--background-color);
    border-radius: 0.25rem;
}

.size-info {
    font-style: italic;
}

/* Upload area */
.upload-area {
    border: 2px dashed var(--border-color);
    border-radius: 0.75rem;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background-color: rgba(0, 0, 0, 0.01);
    position: relative;
}

.upload-area:hover {
    border-color: var(--primary-color);
    background-color: rgba(37, 99, 235, 0.02);
}

.upload-area.drag-over {
    border-color: var(--primary-color);
    background-color: rgba(37, 99, 235, 0.05);
}

.upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.upload-icon {
    font-size: 3rem;
}

.upload-text {
    text-align: center;
}

.upload-title {
    margin: 0;
    font-weight: 500;
    color: var(--text-primary);
}

.upload-subtitle {
    margin: 0.25rem 0 0 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.upload-button {
    padding: 0.75rem 1.5rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.upload-button:hover {
    background-color: #1d4ed8;
}

.file-input {
    display: none;
}

/* Image preview container */
.image-preview-container {
    border: 1px solid var(--border-color);
    border-radius: 0.75rem;
    padding: 1rem;
    background-color: var(--surface-color);
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.preview-header h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
}

.clear-all-btn {
    padding: 0.5rem 1rem;
    background-color: transparent;
    color: var(--error-color);
    border: 1px solid var(--error-color);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
}

.clear-all-btn:hover {
    background-color: var(--error-color);
    color: white;
}

.image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
}

.image-preview-item {
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    overflow: hidden;
    background-color: var(--background-color);
}

.image-preview-content {
    position: relative;
}

.preview-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
}

.image-status {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
}

.image-status.pending {
    background-color: rgba(251, 191, 36, 0.9);
    color: #78350f;
}

.image-status.uploading {
    background-color: rgba(37, 99, 235, 0.9);
    color: white;
}

.image-status.completed {
    background-color: rgba(16, 185, 129, 0.9);
    color: white;
}

.image-status.error {
    background-color: rgba(239, 68, 68, 0.9);
    color: white;
}

.image-optimization-info {
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
}

.optimization-badge {
    background-color: rgba(16, 185, 129, 0.9);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
}

.image-preview-actions {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    background-color: var(--surface-color);
    border-top: 1px solid var(--border-color);
}

.action-btn {
    flex: 1;
    padding: 0.5rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
}

.remove-btn {
    background-color: var(--error-color);
    color: white;
}

.remove-btn:hover {
    background-color: #dc2626;
}

.cancel-btn {
    background-color: var(--warning-color);
    color: white;
}

.cancel-btn:hover {
    background-color: #d97706;
}

.view-btn {
    background-color: var(--primary-color);
    color: white;
}

.view-btn:hover {
    background-color: #1d4ed8;
}

.image-error {
    padding: 0.5rem;
    background-color: #fef2f2;
    border-top: 1px solid var(--error-color);
}

.error-text {
    font-size: 0.875rem;
    color: var(--error-color);
}

.image-progress {
    padding: 0.5rem;
    border-top: 1px solid var(--border-color);
}

.progress-bar {
    width: 100%;
    height: 4px;
    background-color: var(--border-color);
    border-radius: 2px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background-color: var(--primary-color);
    transition: width 0.2s;
}

.progress-text {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-align: center;
    margin-top: 0.25rem;
}

/* Progress container */
.upload-progress-container {
    border: 1px solid var(--border-color);
    border-radius: 0.75rem;
    padding: 1rem;
    background-color: var(--surface-color);
}

.progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.progress-header h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
}

.cancel-uploads-btn {
    padding: 0.5rem 1rem;
    background-color: var(--error-color);
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
}

.cancel-uploads-btn:hover {
    background-color: #dc2626;
}

.progress-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.progress-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.progress-item-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.progress-item-name {
    font-size: 0.875rem;
    color: var(--text-primary);
    font-weight: 500;
}

.progress-item-size {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.progress-item-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Responsive design */
@media (max-width: 640px) {
    .upload-header {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
    }

    .image-grid {
        grid-template-columns: 1fr;
    }

    .preview-header {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
    }

    .progress-header {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
    }

    .progress-item-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
    }

    .progress-item-bar {
        width: 100%;
    }
}

/* Accessibility improvements */
.upload-area:focus-within {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

.action-btn:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
    .upload-area,
    .action-btn,
    .progress-fill {
        transition: none;
    }
}
```

## Dependencies
- Story 2.1: Restaurant Registration Form (must be completed first)
- Firebase Storage service from Epic 0
- Canvas API for image optimization
- File API for file handling

## Success Metrics
- Image upload works with drag-and-drop and file selection
- File validation prevents invalid files from being uploaded
- Image optimization reduces file size while maintaining quality
- Progress indicators show upload status clearly
- Multiple images can be uploaded (up to 4)
- Image preview works before and after optimization
- Error handling provides clear user feedback

## Testing Approach
1. **File Validation Test**: Test file type and size validation
2. **Upload Test**: Test successful image upload process
3. **Optimization Test**: Verify image optimization works correctly
4. **Multiple Images Test**: Test uploading multiple images
5. **Error Handling Test**: Test various error scenarios
6. **Responsive Test**: Test component on different screen sizes

### Testing
**Testing Approach:**
1. **File Validation Test**: Test file type and size validation
2. **Upload Test**: Test successful image upload process
3. **Optimization Test**: Verify image optimization works correctly
4. **Multiple Images Test**: Test uploading multiple images
5. **Error Handling Test**: Test various error scenarios
6. **Responsive Test**: Test component on different screen sizes

**Success Metrics:**
- Image upload works with drag-and-drop and file selection
- File validation prevents invalid files from being uploaded
- Image optimization reduces file size while maintaining quality
- Progress indicators show upload status clearly
- Multiple images can be uploaded (up to 4)
- Image preview works before and after optimization
- Error handling provides clear user feedback

### Dependencies
- Story 2.1: Restaurant Registration Form (must be completed first)
- Firebase Storage service from Epic 0
- Canvas API for image optimization
- File API for file handling

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-30 | 1.0 | Initial story creation with BMad framework | Dev Agent |

## Dev Agent Record

### Agent Model Used
*To be populated by development agent*

### Debug Log References
*To be populated by development agent*

### Completion Notes List
*To be populated by development agent*

### File List
*To be populated by development agent*

## QA Results
*To be populated by QA agent*