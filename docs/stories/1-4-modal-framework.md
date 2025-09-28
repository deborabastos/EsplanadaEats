# Story 1.4: Modal Framework

**As a user, I want a consistent modal system for detailed interactions, so that I can view restaurant details without leaving the main page.**

## Overview
This story implements a comprehensive modal framework that provides consistent user interactions for viewing restaurant details, adding restaurants, and other complex interactions without navigating away from the main page.

## Acceptance Criteria

### AC 4.1: Modal overlay system with backdrop and proper z-index management
- [ ] Create modal overlay container with semi-transparent backdrop
- [ ] Implement proper z-index layering for modal elements
- [ ] Ensure modal appears above all other page elements
- [ ] Add smooth fade-in/fade-out animations
- [ ] Handle multiple modal instances correctly
- [ ] Implement modal stacking behavior

### AC 4.2: Modal can be closed via X button, clicking outside, or ESC key
- [ ] Add close button (X) in modal header
- [ ] Implement click-outside-to-close functionality
- [ ] Add ESC key support for closing modals
- [ ] Ensure all close methods work consistently
- [ ] Add confirmation for modals with unsaved changes
- [ ] Prevent accidental closes during form submission

### AC 4.3: Modal content area scrolls independently when content exceeds viewport
- [ ] Implement scrollable modal content area
- [ ] Fix modal header/footer position during scrolling
- [ ] Add smooth scrolling behavior
- [ ] Handle different content types and sizes
- [ ] Ensure proper scrollbar styling
- [ ] Add maximum height constraints

### AC 4.4: Proper focus management for accessibility
- [ ] Implement focus trapping within modal
- [ ] Return focus to previous element when modal closes
- [ ] Add ARIA attributes for screen readers
- [ ] Ensure keyboard navigation works properly
- [ ] Handle focus for dynamic content
- [ ] Add proper role and label attributes

### AC 4.5: Modal system supports different content types (details, forms)
- [ ] Create flexible modal content system
- [ ] Support restaurant detail views
- [ ] Support add/edit restaurant forms
- [ ] Support rating interfaces
- [ ] Handle photo upload interfaces
- [ ] Enable custom modal content injection

## Technical Implementation Details

### Modal Service Class

```javascript
// js/services/modal-service.js
export class ModalService {
    constructor() {
        this.modalContainer = null;
        this.activeModal = null;
        this.modalStack = [];
        this.previousFocus = null;
        this.init();
    }

    init() {
        this.createModalContainer();
        this.setupEventListeners();
    }

    createModalContainer() {
        this.modalContainer = document.createElement('div');
        this.modalContainer.className = 'modal-container';
        this.modalContainer.setAttribute('role', 'dialog');
        this.modalContainer.setAttribute('aria-modal', 'true');
        this.modalContainer.setAttribute('aria-hidden', 'true');
        this.modalContainer.style.display = 'none';

        document.body.appendChild(this.modalContainer);
    }

    setupEventListeners() {
        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeModal();
            }
        });

        // Click outside to close
        this.modalContainer.addEventListener('click', (e) => {
            if (e.target === this.modalContainer) {
                this.closeModal();
            }
        });

        // Prevent body scroll when modal is open
        document.addEventListener('wheel', this.preventBodyScroll, { passive: false });
    }

    preventBodyScroll(e) {
        if (document.querySelector('.modal-container[aria-hidden="false"]')) {
            e.preventDefault();
        }
    }

    show(modalConfig) {
        // Store previous focus
        this.previousFocus = document.activeElement;

        // Create modal content
        const modalContent = this.createModalContent(modalConfig);

        // Update container
        this.modalContainer.innerHTML = '';
        this.modalContainer.appendChild(modalContent);
        this.modalContainer.setAttribute('aria-hidden', 'false');
        this.modalContainer.style.display = 'flex';

        // Set active modal
        this.activeModal = modalConfig;
        this.modalStack.push(modalConfig);

        // Setup modal-specific functionality
        this.setupModalFunctionality(modalConfig);

        // Focus management
        this.trapFocus();

        // Animate in
        setTimeout(() => {
            this.modalContainer.classList.add('modal-container--active');
        }, 10);

        // Dispatch open event
        window.dispatchEvent(new CustomEvent('modal-opened', {
            detail: { modalConfig }
        }));
    }

    createModalContent(config) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.setAttribute('role', 'document');

        modal.innerHTML = `
            <div class="modal__header">
                <h2 class="modal__title" id="modal-title">${this.escapeHtml(config.title)}</h2>
                ${config.showClose !== false ? `
                    <button class="modal__close" aria-label="Fechar modal" type="button">
                        <span aria-hidden="true">&times;</span>
                    </button>
                ` : ''}
            </div>
            <div class="modal__body" id="modal-body">
                ${config.content || ''}
            </div>
            ${config.footer ? `
                <div class="modal__footer">
                    ${config.footer}
                </div>
            ` : ''}
        `;

        // Setup close button
        const closeBtn = modal.querySelector('.modal__close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        return modal;
    }

    setupModalFunctionality(config) {
        // Setup form handling if present
        const form = this.modalContainer.querySelector('form');
        if (form) {
            this.setupFormHandling(form, config);
        }

        // Setup custom buttons
        const buttons = this.modalContainer.querySelectorAll('[data-modal-action]');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.modalAction;
                this.handleModalAction(action, config);
            });
        });

        // Setup dynamic content loading
        if (config.dynamicContent) {
            this.loadDynamicContent(config);
        }
    }

    setupFormHandling(form, config) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (config.onBeforeSubmit) {
                const canSubmit = await config.onBeforeSubmit(form);
                if (!canSubmit) return;
            }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            try {
                if (config.onSubmit) {
                    await config.onSubmit(data, form);
                }
                this.closeModal();
            } catch (error) {
                this.handleFormError(error, form);
            }
        });

        // Add validation feedback
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    async loadDynamicContent(config) {
        const body = this.modalContainer.querySelector('.modal__body');
        body.innerHTML = '<div class="modal__loading">Carregando...</div>';

        try {
            const content = await config.dynamicContent();
            body.innerHTML = content;

            // Re-setup functionality for dynamic content
            this.setupModalFunctionality(config);
        } catch (error) {
            body.innerHTML = '<div class="modal__error">Erro ao carregar conteúdo</div>';
        }
    }

    handleModalAction(action, config) {
        switch (action) {
            case 'close':
                this.closeModal();
                break;
            case 'submit':
                const form = this.modalContainer.querySelector('form');
                if (form) form.dispatchEvent(new Event('submit'));
                break;
            case 'cancel':
                if (config.onCancel) config.onCancel();
                this.closeModal();
                break;
            default:
                if (config.onAction) {
                    config.onAction(action);
                }
        }
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
            email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            phone: (val) => /^\d{10,15}$/.test(val.replace(/\D/g, '')),
            price: (val) => parseFloat(val) > 0
        };

        const messages = {
            email: 'Email inválido',
            phone: 'Telefone inválido',
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

        if (!isValid) {
            field.classList.add('field-error');
            if (!errorElement) {
                const error = document.createElement('div');
                error.className = 'field-error';
                error.textContent = errorMessage;
                field.parentNode.appendChild(error);
            } else {
                errorElement.textContent = errorMessage;
            }
        } else {
            field.classList.remove('field-error');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }

    clearFieldError(field) {
        field.classList.remove('field-error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    handleFormError(error, form) {
        console.error('Form submission error:', error);

        // Show general error message
        const existingError = form.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = error.message || 'Erro ao enviar formulário';
        form.insertBefore(errorDiv, form.firstChild);
    }

    trapFocus() {
        const focusableElements = this.modalContainer.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Focus first element
        firstElement.focus();

        // Trap focus within modal
        this.modalContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }

    closeModal() {
        if (!this.activeModal) return;

        // Check for unsaved changes
        if (this.hasUnsavedChanges()) {
            if (!confirm('Você tem alterações não salvas. Deseja fechar mesmo assim?')) {
                return;
            }
        }

        // Animate out
        this.modalContainer.classList.remove('modal-container--active');

        setTimeout(() => {
            this.modalContainer.setAttribute('aria-hidden', 'true');
            this.modalContainer.style.display = 'none';

            // Restore focus
            if (this.previousFocus) {
                this.previousFocus.focus();
            }

            // Clean up
            this.modalStack.pop();
            this.activeModal = this.modalStack[this.modalStack.length - 1] || null;

            // Re-enable body scroll
            document.body.style.overflow = '';

            // Dispatch close event
            window.dispatchEvent(new CustomEvent('modal-closed', {
                detail: { modalConfig: this.activeModal }
            }));
        }, 300);
    }

    hasUnsavedChanges() {
        const form = this.modalContainer.querySelector('form');
        if (!form) return false;

        const inputs = form.querySelectorAll('input, textarea, select');
        return Array.from(inputs).some(input => {
            const initialValue = input.defaultValue || '';
            const currentValue = input.value;
            return initialValue !== currentValue;
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Convenience methods for common modal types
    showRestaurantDetails(restaurant) {
        this.show({
            title: restaurant.name,
            content: this.createRestaurantDetailsContent(restaurant),
            size: 'large',
            onAction: (action) => this.handleRestaurantAction(action, restaurant)
        });
    }

    showAddRestaurantForm() {
        this.show({
            title: 'Adicionar Restaurante',
            content: this.createAddRestaurantForm(),
            size: 'large',
            onSubmit: (data) => this.handleAddRestaurant(data)
        });
    }

    showRatingForm(restaurant) {
        this.show({
            title: `Avaliar ${restaurant.name}`,
            content: this.createRatingForm(restaurant),
            size: 'medium',
            onSubmit: (data) => this.handleRatingSubmit(data, restaurant)
        });
    }

    createRestaurantDetailsContent(restaurant) {
        return `
            <div class="restaurant-details">
                <div class="restaurant-details__photos">
                    ${this.createRestaurantPhotos(restaurant.photoUrls)}
                </div>
                <div class="restaurant-details__info">
                    <div class="restaurant-details__rating">
                        ${this.createStarRating(restaurant.averageQuality)}
                        <span>${restaurant.averageQuality.toFixed(1)}</span>
                    </div>
                    <div class="restaurant-details__price">
                        <strong>Preço:</strong> ${this.formatPrice(restaurant.price)}
                    </div>
                    ${restaurant.vegetarianOptions ? `
                        <div class="restaurant-details__vegetarian">
                            <span>🥬 Opções vegetarianas disponíveis</span>
                        </div>
                    ` : ''}
                    ${restaurant.access ? `
                        <div class="restaurant-details__access">
                            <strong>Acesso:</strong> ${restaurant.access}
                        </div>
                    ` : ''}
                    ${restaurant.hours ? `
                        <div class="restaurant-details__hours">
                            <strong>Horário:</strong> ${restaurant.hours}
                        </div>
                    ` : ''}
                    ${restaurant.description ? `
                        <div class="restaurant-details__description">
                            <strong>Descrição:</strong>
                            <p>${restaurant.description}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="restaurant-details__actions">
                    <button class="btn btn-primary" data-modal-action="rate">
                        Avaliar Restaurante
                    </button>
                    <button class="btn btn-secondary" data-modal-action="close">
                        Fechar
                    </button>
                </div>
            </div>
        `;
    }

    createRestaurantPhotos(photoUrls) {
        if (!photoUrls || photoUrls.length === 0) {
            return '<div class="restaurant-details__no-photos">Sem fotos disponíveis</div>';
        }

        return photoUrls.map(url => `
            <img src="${url}" alt="Foto do restaurante" class="restaurant-details__photo">
        `).join('');
    }

    createStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);

        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<span class="star star--full">★</span>';
        }
        if (hasHalfStar) {
            stars += '<span class="star star--half">★</span>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<span class="star star--empty">☆</span>';
        }

        return `<div class="restaurant-details__stars">${stars}</div>`;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    }

    createAddRestaurantForm() {
        return `
            <form id="add-restaurant-form" class="modal-form">
                <div class="form-group">
                    <label for="restaurant-name">Nome do Restaurante *</label>
                    <input type="text" id="restaurant-name" name="name" required minlength="4" maxlength="100">
                    <div class="field-help">Mínimo de 4 caracteres</div>
                </div>

                <div class="form-group">
                    <label for="restaurant-price">Preço Médio *</label>
                    <input type="number" id="restaurant-price" name="price" required min="0.01" step="0.01">
                    <div class="field-help">Valor em reais</div>
                </div>

                <div class="form-group">
                    <label for="restaurant-hours">Horário de Funcionamento</label>
                    <input type="text" id="restaurant-hours" name="hours" placeholder="Ex: 11h-23h">
                </div>

                <div class="form-group">
                    <label for="restaurant-access">Informações de Acesso</label>
                    <textarea id="restaurant-access" name="access" rows="3"></textarea>
                </div>

                <div class="form-group">
                    <label for="restaurant-description">Descrição</label>
                    <textarea id="restaurant-description" name="description" rows="4"></textarea>
                </div>

                <div class="form-group">
                    <label class="checkbox-group">
                        <input type="checkbox" id="restaurant-vegetarian" name="vegetarianOptions">
                        <span>Oferece opções vegetarianas</span>
                    </label>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Salvar Restaurante</button>
                    <button type="button" class="btn btn-secondary" data-modal-action="cancel">Cancelar</button>
                </div>
            </form>
        `;
    }

    createRatingForm(restaurant) {
        return `
            <form id="rating-form" class="modal-form">
                <div class="rating-form__quality">
                    <label>Qualidade Geral</label>
                    <div class="star-rating-input" data-rating="0">
                        ${[1,2,3,4,5].map(i => `<button type="button" data-value="${i}" class="star-btn">☆</button>`).join('')}
                    </div>
                    <input type="hidden" name="rating" required>
                </div>

                <div class="form-group">
                    <label for="rating-comment">Comentário</label>
                    <textarea id="rating-comment" name="comment" rows="4" placeholder="Conte sua experiência..."></textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Enviar Avaliação</button>
                    <button type="button" class="btn btn-secondary" data-modal-action="cancel">Cancelar</button>
                </div>
            </form>
        `;
    }

    handleRestaurantAction(action, restaurant) {
        switch (action) {
            case 'rate':
                this.closeModal();
                setTimeout(() => this.showRatingForm(restaurant), 300);
                break;
        }
    }

    async handleAddRestaurant(data) {
        // This will be implemented in the restaurant service
        window.dispatchEvent(new CustomEvent('add-restaurant', {
            detail: { restaurantData: data }
        }));
    }

    async handleRatingSubmit(data, restaurant) {
        window.dispatchEvent(new CustomEvent('submit-rating', {
            detail: { ratingData: { ...data, restaurantId: restaurant.id } }
        }));
    }
}
```

### CSS Styles

```css
/* Modal container */
.modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.modal-container--active {
    opacity: 1;
}

/* Modal content */
.modal {
    background-color: var(--surface-color);
    border-radius: 0.75rem;
    box-shadow: var(--shadow-lg);
    max-width: 90%;
    max-height: 90vh;
    width: 500px;
    display: flex;
    flex-direction: column;
    transform: scale(0.9);
    transition: transform 0.3s ease;
}

.modal-container--active .modal {
    transform: scale(1);
}

.modal--small {
    width: 400px;
}

.modal--large {
    width: 800px;
}

/* Modal header */
.modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.modal__title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
}

.modal__close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: all 0.2s;
}

.modal__close:hover {
    background-color: var(--background-color);
    color: var(--text-primary);
}

/* Modal body */
.modal__body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
    max-height: calc(90vh - 200px);
}

/* Modal footer */
.modal__footer {
    padding: 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

/* Loading and error states */
.modal__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: var(--text-secondary);
}

.modal__error {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: var(--error-color);
}

/* Form styles */
.modal-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-weight: 500;
    color: var(--text-primary);
}

.form-group input,
.form-group textarea,
.form-group select {
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 0.375rem;
    font-size: 1rem;
    transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group .field-help {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1rem;
}

/* Error styles */
.field-error {
    border-color: var(--error-color) !important;
}

.field-error {
    font-size: 0.875rem;
    color: var(--error-color);
    margin-top: 0.25rem;
}

.form-error {
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    color: var(--error-color);
    padding: 0.75rem;
    border-radius: 0.375rem;
    margin-bottom: 1rem;
}

/* Checkbox styling */
.checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
}

/* Restaurant details */
.restaurant-details {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.restaurant-details__photos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.restaurant-details__photo {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 0.5rem;
}

.restaurant-details__no-photos {
    text-align: center;
    color: var(--text-secondary);
    padding: 2rem;
    background-color: var(--background-color);
    border-radius: 0.5rem;
}

.restaurant-details__rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.125rem;
}

.restaurant-details__info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.restaurant-details__actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
}

/* Star rating input */
.star-rating-input {
    display: flex;
    gap: 0.25rem;
}

.star-btn {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #d1d5db;
    padding: 0.25rem;
    transition: color 0.2s;
}

.star-btn:hover,
.star-btn.active {
    color: #fbbf24;
}

/* Responsive design */
@media (max-width: 640px) {
    .modal {
        width: 95%;
        max-height: 95vh;
    }

    .modal__header {
        padding: 1rem;
    }

    .modal__body {
        padding: 1rem;
    }

    .modal__footer {
        padding: 1rem;
    }

    .form-actions {
        flex-direction: column;
    }

    .restaurant-details__actions {
        flex-direction: column;
    }
}

/* Accessibility improvements */
.modal-container:focus {
    outline: none;
}

.modal-container[aria-hidden="false"] {
    outline: none;
}

@media (prefers-reduced-motion: reduce) {
    .modal-container,
    .modal {
        transition: none;
    }
}
```

## Dependencies
- Story 1.3: Restaurant Card Display System (must be completed first)
- CSS variables and design system from Story 1.1
- Event system from main application

## Success Metrics
- Modal overlay works properly with backdrop
- All close methods (X button, outside click, ESC) work
- Modal content scrolls independently when needed
- Focus management works correctly for accessibility
- Different content types display properly
- Forms within modals work with validation

## Testing Approach
1. **Modal Display Test**: Verify modal opens and displays correctly
2. **Close Methods Test**: Test all ways to close the modal
3. **Scroll Test**: Test scrolling with long content
4. **Accessibility Test**: Test keyboard navigation and screen reader support
5. **Form Test**: Test form validation and submission within modals
6. **Responsive Test**: Test modal behavior on different screen sizes

## Notes
- Implements full accessibility support with ARIA attributes
- Handles focus trapping for better accessibility
- Supports different modal sizes and content types
- Includes smooth animations and transitions
- Respects user's motion preferences
- Properly handles form validation and error states