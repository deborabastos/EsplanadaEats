# Story 2.1: Restaurant Registration Form

**As a restaurant owner, I want to register my restaurant with all required information, so that users can discover and evaluate my establishment.**

## Overview
This story implements the restaurant registration form that allows restaurant owners to add their establishments to the platform with all necessary information and validation.

## Acceptance Criteria

### AC 1.1: Registration modal with all mandatory fields (name, hours, price, quality, vegetarian options, access)
- [ ] Create restaurant registration modal with proper structure
- [ ] Include name field (mandatory, minimum 4 characters)
- [ ] Add hours field for operating hours
- [ ] Include price field (mandatory, positive values)
- [ ] Add initial quality rating field (0-5 stars)
- [ ] Include vegetarian options checkbox
- [ ] Add access information field
- [ ] Ensure modal layout is organized and user-friendly

### AC 1.2: Optional fields for description and photos
- [ ] Add description textarea for restaurant details
- [ ] Include photo upload section (up to 4 photos)
- [ ] Add photo preview functionality
- [ ] Include remove photo option for uploaded images
- [ ] Add drag-and-drop support for photo uploads
- [ ] Ensure optional fields are clearly marked as such

### AC 1.3: Real-time validation with visual feedback (red highlighting) for errors
- [ ] Implement real-time field validation
- [ ] Add visual feedback for validation errors (red borders/highlighting)
- [ ] Include inline error messages below each field
- [ ] Add validation status indicators (success/error)
- [ ] Implement field-specific validation rules
- [ ] Ensure error messages are clear and helpful

### AC 1.4: Form validation includes minimum 4 characters for name, positive price values, 0-5 star ratings
- [ ] Validate name field with minimum 4 characters
- [ ] Validate price field for positive values
- [ ] Validate quality rating field for 0-5 range
- [ ] Add character counter for name field
- [ ] Include input masking for price field
- [ ] Add visual star rating interface for quality

### AC 1.5: Success message and new restaurant appears first in list after registration
- [ ] Implement success notification system
- [ ] Add new restaurant to top of restaurant list
- [ ] Include smooth animation for new restaurant addition
- [ ] Auto-close modal after successful submission
- [ ] Show loading state during form submission
- [ ] Handle errors gracefully with user-friendly messages

## Technical Implementation Details

### Restaurant Registration Form Component

```javascript
// js/components/restaurant-registration-form.js
export class RestaurantRegistrationForm {
    constructor(modalService, restaurantService) {
        this.modalService = modalService;
        this.restaurantService = restaurantService;
        this.form = null;
        this.photoUpload = null;
        this.stars = [];
        this.currentRating = 0;
        this.uploadedPhotos = [];
    }

    render() {
        const formHTML = `
            <form id="restaurant-registration-form" class="restaurant-form" novalidate>
                <div class="form-section">
                    <h3 class="form-section__title">Informações Básicas</h3>

                    <div class="form-group">
                        <label for="restaurant-name" class="form-label">
                            Nome do Restaurante <span class="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="restaurant-name"
                            name="name"
                            class="form-input"
                            required
                            minlength="4"
                            maxlength="100"
                            placeholder="Ex: Restaurante da Esplanada"
                        >
                        <div class="field-help">
                            <span class="char-count">0</span>/100 caracteres
                        </div>
                        <div class="field-error"></div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="restaurant-price" class="form-label">
                                Preço Médio <span class="required">*</span>
                            </label>
                            <div class="price-input-wrapper">
                                <span class="currency-symbol">R$</span>
                                <input
                                    type="number"
                                    id="restaurant-price"
                                    name="price"
                                    class="form-input"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    placeholder="0,00"
                                >
                            </div>
                            <div class="field-help">Valor médio do prato principal</div>
                            <div class="field-error"></div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Qualidade Inicial</label>
                            <div class="star-rating-input" data-rating="0">
                                ${[1,2,3,4,5].map(i => `
                                    <button type="button" class="star-btn" data-value="${i}" aria-label="${i} estrelas">
                                        <span class="star-icon">☆</span>
                                    </button>
                                `).join('')}
                            </div>
                            <input type="hidden" name="averageQuality" value="0" required>
                            <div class="field-help">Avaliação inicial do restaurante</div>
                            <div class="field-error"></div>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3 class="form-section__title">Detalhes de Operação</h3>

                    <div class="form-group">
                        <label for="restaurant-hours" class="form-label">Horário de Funcionamento</label>
                        <input
                            type="text"
                            id="restaurant-hours"
                            name="hours"
                            class="form-input"
                            placeholder="Ex: Seg-Sex: 11h-23h, Sáb-Dom: 12h-22h"
                        >
                        <div class="field-help">Informe os dias e horários de funcionamento</div>
                        <div class="field-error"></div>
                    </div>

                    <div class="form-group">
                        <label for="restaurant-access" class="form-label">Informações de Acesso</label>
                        <textarea
                            id="restaurant-access"
                            name="access"
                            class="form-textarea"
                            rows="3"
                            placeholder="Ex: Entrada pela Rua X, estacionamento disponível, acessibilidade..."
                        ></textarea>
                        <div class="field-help">Como chegar, estacionamento, acessibilidade, etc.</div>
                        <div class="field-error"></div>
                    </div>
                </div>

                <div class="form-section">
                    <h3 class="form-section__title">Características</h3>

                    <div class="form-group">
                        <label class="checkbox-group">
                            <input type="checkbox" id="restaurant-vegetarian" name="vegetarianOptions" class="form-checkbox">
                            <span class="checkbox-label">Oferece opções vegetarianas</span>
                        </label>
                        <div class="field-help">Marque se o restaurante tem pratos vegetarianos</div>
                    </div>

                    <div class="form-group">
                        <label for="restaurant-description" class="form-label">Descrição</label>
                        <textarea
                            id="restaurant-description"
                            name="description"
                            class="form-textarea"
                            rows="4"
                            placeholder="Descreva o restaurante, especialidades, ambiente..."
                        ></textarea>
                        <div class="field-help">
                            <span class="char-count">0</span>/500 caracteres
                        </div>
                        <div class="field-error"></div>
                    </div>
                </div>

                <div class="form-section">
                    <h3 class="form-section__title">Fotos do Restaurante</h3>

                    <div class="photo-upload-section">
                        <div class="photo-upload-area" id="photo-upload-area">
                            <div class="photo-upload-icon">📷</div>
                            <div class="photo-upload-text">
                                <p><strong>Arraste fotos aqui ou clique para selecionar</strong></p>
                                <p>Máximo de 4 fotos. Formatos: JPG, PNG, WebP</p>
                            </div>
                            <input
                                type="file"
                                id="photo-input"
                                class="photo-input"
                                multiple
                                accept="image/jpeg,image/png,image/webp"
                            >
                        </div>

                        <div class="photo-preview-container" id="photo-preview-container" style="display: none;">
                            <h4>Fotos Selecionadas</h4>
                            <div class="photo-preview-grid" id="photo-preview-grid"></div>
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" data-modal-action="cancel">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary" id="submit-btn">
                        <span class="btn-text">Cadastrar Restaurante</span>
                        <span class="btn-loading" style="display: none;">
                            <span class="spinner"></span>
                            Cadastrando...
                        </span>
                    </button>
                </div>
            </form>
        `;

        return formHTML;
    }

    initialize(modalElement) {
        this.form = modalElement.querySelector('#restaurant-registration-form');
        this.setupFormValidation();
        this.setupStarRating();
        this.setupPhotoUpload();
        this.setupFormSubmission();
    }

    setupFormValidation() {
        const inputs = this.form.querySelectorAll('input, textarea');

        inputs.forEach(input => {
            // Real-time validation on blur
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            // Clear error on input
            input.addEventListener('input', () => {
                this.clearFieldError(input);
                this.updateCharCount(input);
            });

            // Character count for text inputs
            if (input.type === 'text' || input.tagName === 'TEXTAREA') {
                this.updateCharCount(input);
            }
        });

        // Price formatting
        const priceInput = this.form.querySelector('#restaurant-price');
        priceInput.addEventListener('input', (e) => {
            this.formatPrice(e.target);
        });
    }

    setupStarRating() {
        const starContainer = this.form.querySelector('.star-rating-input');
        const stars = starContainer.querySelectorAll('.star-btn');
        const hiddenInput = this.form.querySelector('input[name="averageQuality"]');

        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                this.setStarRating(index + 1);
            });

            star.addEventListener('mouseenter', () => {
                this.highlightStars(index + 1);
            });
        });

        starContainer.addEventListener('mouseleave', () => {
            this.highlightStars(this.currentRating);
        });

        this.stars = stars;
        this.hiddenInput = hiddenInput;
    }

    setupPhotoUpload() {
        const uploadArea = this.form.querySelector('#photo-upload-area');
        const fileInput = this.form.querySelector('#photo-input');
        const previewContainer = this.form.querySelector('#photo-preview-container');
        const previewGrid = this.form.querySelector('#photo-preview-grid');

        // Click to upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

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

        this.uploadArea = uploadArea;
        this.fileInput = fileInput;
        this.previewContainer = previewContainer;
        this.previewGrid = previewGrid;
    }

    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Este campo é obrigatório';
        }

        // Minimum length validation
        if (value && field.hasAttribute('minlength')) {
            const minLength = parseInt(field.getAttribute('minlength'));
            if (value.length < minLength) {
                isValid = false;
                errorMessage = `Mínimo de ${minLength} caracteres`;
            }
        }

        // Maximum length validation
        if (value && field.hasAttribute('maxlength')) {
            const maxLength = parseInt(field.getAttribute('maxlength'));
            if (value.length > maxLength) {
                isValid = false;
                errorMessage = `Máximo de ${maxLength} caracteres`;
            }
        }

        // Number validation
        if (field.type === 'number') {
            const min = parseFloat(field.getAttribute('min'));
            const max = parseFloat(field.getAttribute('max'));

            if (value && min && parseFloat(value) < min) {
                isValid = false;
                errorMessage = `Valor mínimo: ${min}`;
            }

            if (value && max && parseFloat(value) > max) {
                isValid = false;
                errorMessage = `Valor máximo: ${max}`;
            }
        }

        // Custom validation
        if (isValid && field.dataset.validate) {
            const validation = this.customValidation(field.dataset.validate, value);
            if (!validation.valid) {
                isValid = false;
                errorMessage = validation.message;
            }
        }

        this.showFieldError(field, isValid, errorMessage);
        return isValid;
    }

    customValidation(type, value) {
        const validators = {
            name: (val) => val.length >= 4 && /^[a-zA-Z0-9\sÀ-ÿ'-]+$/.test(val),
            price: (val) => parseFloat(val) > 0
        };

        const messages = {
            name: 'Nome deve ter no mínimo 4 caracteres e conter apenas letras, números e espaços',
            price: 'Preço deve ser maior que zero'
        };

        const valid = validators[type] ? validators[type](value) : true;
        return {
            valid,
            message: valid ? '' : messages[type] || 'Valor inválido'
        };
    }

    showFieldError(field, isValid, errorMessage) {
        const errorElement = field.parentNode.querySelector('.field-error');
        const helpElement = field.parentNode.querySelector('.field-help');

        if (!isValid) {
            field.classList.add('field-error');
            field.setAttribute('aria-invalid', 'true');

            if (errorElement) {
                errorElement.textContent = errorMessage;
                errorElement.style.display = 'block';
            } else {
                const error = document.createElement('div');
                error.className = 'field-error';
                error.textContent = errorMessage;
                field.parentNode.appendChild(error);
            }

            if (helpElement) {
                helpElement.style.marginTop = '0.25rem';
            }
        } else {
            field.classList.remove('field-error');
            field.setAttribute('aria-invalid', 'false');

            if (errorElement) {
                errorElement.style.display = 'none';
            }

            if (helpElement) {
                helpElement.style.marginTop = '0.5rem';
            }
        }
    }

    clearFieldError(field) {
        field.classList.remove('field-error');
        field.setAttribute('aria-invalid', 'false');

        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    updateCharCount(field) {
        const maxLength = field.getAttribute('maxlength');
        if (!maxLength) return;

        const charCount = field.value.length;
        const counterElement = field.parentNode.querySelector('.char-count');

        if (counterElement) {
            counterElement.textContent = charCount;
            counterElement.style.color = charCount > maxLength * 0.9 ? '#ef4444' : '';
        }
    }

    formatPrice(input) {
        let value = input.value.replace(/[^\d,]/g, '');

        if (value) {
            // Convert to number and format
            const number = parseFloat(value.replace(',', '.'));
            if (!isNaN(number)) {
                input.value = number.toFixed(2).replace('.', ',');
            }
        }
    }

    setStarRating(rating) {
        this.currentRating = rating;
        this.highlightStars(rating);
        this.form.querySelector('input[name="averageQuality"]').value = rating;
    }

    highlightStars(rating) {
        this.stars.forEach((star, index) => {
            const icon = star.querySelector('.star-icon');
            if (index < rating) {
                icon.textContent = '★';
                star.classList.add('active');
            } else {
                icon.textContent = '☆';
                star.classList.remove('active');
            }
        });
    }

    handleFileSelection(files) {
        const validFiles = Array.from(files).filter(file => {
            return this.validateFile(file);
        });

        if (validFiles.length === 0) return;

        // Limit to 4 files
        const remainingSlots = 4 - this.uploadedPhotos.length;
        const filesToAdd = validFiles.slice(0, remainingSlots);

        filesToAdd.forEach(file => {
            this.addPhoto(file);
        });

        this.updatePhotoPreview();
        this.fileInput.value = '';
    }

    validateFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            this.showNotification('Formato de arquivo inválido. Use JPG, PNG ou WebP.', 'error');
            return false;
        }

        if (file.size > maxSize) {
            this.showNotification('Arquivo muito grande. Tamanho máximo: 5MB.', 'error');
            return false;
        }

        return true;
    }

    addPhoto(file) {
        if (this.uploadedPhotos.length >= 4) {
            this.showNotification('Máximo de 4 fotos permitido.', 'error');
            return;
        }

        const photo = {
            id: Date.now() + Math.random(),
            file: file,
            url: URL.createObjectURL(file)
        };

        this.uploadedPhotos.push(photo);
    }

    removePhoto(photoId) {
        const index = this.uploadedPhotos.findIndex(p => p.id === photoId);
        if (index !== -1) {
            URL.revokeObjectURL(this.uploadedPhotos[index].url);
            this.uploadedPhotos.splice(index, 1);
            this.updatePhotoPreview();
        }
    }

    updatePhotoPreview() {
        if (this.uploadedPhotos.length === 0) {
            this.previewContainer.style.display = 'none';
            return;
        }

        this.previewContainer.style.display = 'block';
        this.previewGrid.innerHTML = this.uploadedPhotos.map(photo => `
            <div class="photo-preview-item">
                <img src="${photo.url}" alt="Preview" class="photo-preview-img">
                <button type="button" class="photo-remove-btn" onclick="form.removePhoto(${photo.id})">
                    ×
                </button>
            </div>
        `).join('');
    }

    async validateForm() {
        const requiredFields = this.form.querySelectorAll('[required]');
        let isValid = true;

        // Validate all required fields
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Validate star rating
        if (this.currentRating === 0) {
            this.showFieldError(
                this.form.querySelector('input[name="averageQuality"]'),
                false,
                'Selecione uma avaliação inicial'
            );
            isValid = false;
        }

        return isValid;
    }

    async handleSubmit() {
        if (!this.validateForm()) {
            this.showNotification('Por favor, corrija os erros no formulário.', 'error');
            return;
        }

        const submitBtn = this.form.querySelector('#submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        // Show loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';
        submitBtn.disabled = true;

        try {
            const formData = this.getFormData();

            // Upload photos first
            const photoUrls = await this.uploadPhotos(formData.photos);

            // Create restaurant
            const restaurantData = {
                ...formData,
                photoUrls: photoUrls
            };

            const restaurantId = await this.restaurantService.createRestaurant(restaurantData);

            // Show success
            this.showSuccess(restaurantData);

            // Close modal
            setTimeout(() => {
                this.modalService.closeModal();
            }, 1500);

        } catch (error) {
            console.error('Error submitting form:', error);
            this.showNotification('Erro ao cadastrar restaurante. Tente novamente.', 'error');
        } finally {
            // Reset button state
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    getFormData() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        // Convert checkbox values
        data.vegetarianOptions = formData.has('vegetarianOptions');

        // Clean up data
        delete data.photos; // Handle photos separately

        return data;
    }

    async uploadPhotos(photos) {
        if (!photos || photos.length === 0) return [];

        const uploadPromises = this.uploadedPhotos.map(photo => {
            return this.restaurantService.uploadPhoto(photo.file);
        });

        return Promise.all(uploadPromises);
    }

    showSuccess(restaurantData) {
        // Show success notification
        this.showNotification('Restaurante cadastrado com sucesso!', 'success');

        // Emit event to add restaurant to list
        window.dispatchEvent(new CustomEvent('restaurant-added', {
            detail: { restaurant: restaurantData }
        }));
    }

    showNotification(message, type = 'info') {
        window.dispatchEvent(new CustomEvent('show-notification', {
            detail: { message, type }
        }));
    }

    reset() {
        if (this.form) {
            this.form.reset();
            this.currentRating = 0;
            this.highlightStars(0);
            this.uploadedPhotos.forEach(photo => {
                URL.revokeObjectURL(photo.url);
            });
            this.uploadedPhotos = [];
            this.updatePhotoPreview();

            // Clear all field errors
            const errorElements = this.form.querySelectorAll('.field-error');
            errorElements.forEach(error => error.style.display = 'none');

            const errorFields = this.form.querySelectorAll('.field-error');
            errorFields.forEach(field => field.classList.remove('field-error'));
        }
    }
}

// Make removePhoto available globally for onclick handlers
window.form = null;
document.addEventListener('DOMContentLoaded', () => {
    window.form = new RestaurantRegistrationForm();
});
```

### CSS Styles

```css
/* Restaurant form styles */
.restaurant-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-section {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1.5rem;
}

.form-section:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.form-section__title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 1rem 0;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-label {
    font-weight: 500;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.required {
    color: var(--error-color);
}

.form-input,
.form-textarea {
    padding: 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s;
    background-color: var(--surface-color);
}

.form-input:focus,
.form-textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input.field-error,
.form-textarea.field-error {
    border-color: var(--error-color);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.field-help {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
}

.field-error {
    font-size: 0.875rem;
    color: var(--error-color);
    margin-top: 0.25rem;
    display: none;
}

.char-count {
    font-weight: 500;
}

/* Price input styling */
.price-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.currency-symbol {
    position: absolute;
    left: 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
    z-index: 1;
}

.price-input-wrapper .form-input {
    padding-left: 2rem;
}

/* Star rating styling */
.star-rating-input {
    display: flex;
    gap: 0.25rem;
    margin-top: 0.5rem;
}

.star-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #d1d5db;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: all 0.2s;
}

.star-btn:hover {
    background-color: rgba(0, 0, 0, 0.05);
    transform: scale(1.1);
}

.star-btn.active .star-icon {
    color: #fbbf24;
}

.star-icon {
    font-style: normal;
}

/* Checkbox styling */
.checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
}

.checkbox-group:hover {
    background-color: rgba(0, 0, 0, 0.02);
}

.form-checkbox {
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
}

.checkbox-label {
    font-weight: 400;
    color: var(--text-primary);
}

/* Photo upload styling */
.photo-upload-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.photo-upload-area {
    border: 2px dashed var(--border-color);
    border-radius: 0.75rem;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background-color: rgba(0, 0, 0, 0.01);
}

.photo-upload-area:hover {
    border-color: var(--primary-color);
    background-color: rgba(37, 99, 235, 0.02);
}

.photo-upload-area.drag-over {
    border-color: var(--primary-color);
    background-color: rgba(37, 99, 235, 0.05);
}

.photo-upload-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.photo-upload-text p {
    margin: 0.25rem 0;
    color: var(--text-secondary);
}

.photo-upload-text p:first-child {
    color: var(--text-primary);
    font-weight: 500;
}

.photo-input {
    display: none;
}

.photo-preview-container {
    margin-top: 1rem;
}

.photo-preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.photo-preview-item {
    position: relative;
    border-radius: 0.5rem;
    overflow: hidden;
    aspect-ratio: 1;
}

.photo-preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.photo-remove-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 1.5rem;
    height: 1.5rem;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
}

.photo-remove-btn:hover {
    background-color: rgba(239, 68, 68, 0.9);
}

/* Form actions */
.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
}

/* Loading states */
.btn-loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Responsive design */
@media (max-width: 640px) {
    .form-row {
        grid-template-columns: 1fr;
    }

    .photo-preview-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 0.75rem;
    }

    .form-actions {
        flex-direction: column;
    }

    .form-actions .btn {
        width: 100%;
    }
}

/* Accessibility improvements */
.form-input:focus,
.form-textarea:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

.field-error:focus {
    outline: 2px solid var(--error-color);
    outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
    .star-btn,
    .photo-upload-area,
    .spinner {
        animation: none;
        transition: none;
    }
}
```

## Dependencies
- Story 1.4: Modal Framework (must be completed first)
- Restaurant service from Story 1.2
- Modal service from Story 1.4
- Notification system (to be implemented)

## Success Metrics
- Registration modal opens correctly with all fields
- Real-time validation works with visual feedback
- Form validates all rules correctly
- Photo upload works with drag-and-drop
- Restaurant is successfully created and appears in list
- Success notification shows after registration
- Error handling works gracefully

## Testing Approach
1. **Form Display Test**: Verify all fields display correctly
2. **Validation Test**: Test all validation scenarios
3. **Photo Upload Test**: Test file upload and validation
4. **Form Submission Test**: Test successful submission
5. **Error Handling Test**: Test error scenarios
6. **Responsive Test**: Test form on different screen sizes

## Notes
- Implements comprehensive form validation with real-time feedback
- Includes accessible form design with proper ARIA attributes
- Supports drag-and-drop photo upload with validation
- Provides clear user feedback for all actions
- Handles file uploads with proper validation and preview
- Includes loading states and error handling