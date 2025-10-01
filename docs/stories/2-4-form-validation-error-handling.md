# Story 2.4: Form Validation & Error Handling

## Status
Draft

## Story
**As a** user,
**I want** clear feedback when form data is invalid,
**so that** I can correct errors and complete my submission.

## Acceptance Criteria
1. Real-time validation for all form fields
2. Specific error messages for each validation failure
3. Visual feedback (red borders, error icons) for invalid fields
4. Form submission blocked until all mandatory fields are valid
5. Graceful handling of storage quota exceeded scenarios

## Tasks / Subtasks
- [ ] Task 1: Implement real-time validation system (AC: 1)
  - [ ] Implement real-time validation for restaurant registration form fields
  - [ ] Implement real-time validation for rating form fields
  - [ ] Add input event listeners for instant validation feedback
  - [ ] Include blur event validation for final field validation
  - [ ] Support validation on form submission
  - [ ] Provide immediate visual feedback for validation state
  - [ ] Include validation for all field types (text, numbers, select, file)
- [ ] Task 2: Create specific error messaging system (AC: 2)
  - [ ] Create specific error messages for restaurant name validation
  - [ ] Create specific error messages for operating hours validation
  - [ ] Create specific error messages for price range validation
  - [ ] Create specific error messages for rating validation
  - [ ] Create specific error messages for file upload validation
  - [ ] Include contextual error messages based on field requirements
  - [ ] Support localized error messages in Portuguese
  - [ ] Include helpful suggestions for correcting errors
- [ ] Task 3: Implement visual feedback indicators (AC: 3)
  - [ ] Add red border styling for invalid form fields
  - [ ] Include error icons next to invalid fields
  - [ ] Implement success indicators for valid fields
  - [ ] Add color transitions for validation state changes
  - [ ] Include visual feedback for focused invalid fields
  - [ ] Support consistent styling across all forms
  - [ ] Add appropriate spacing for error indicators
  - [ ] Include hover states for interactive error elements
- [ ] Task 4: Create form submission control system (AC: 4)
  - [ ] Implement form submission validation before processing
  - [ ] Disable submit button when form has validation errors
  - [ ] Show summary of validation errors on submission attempt
  - [ ] Scroll to first invalid field on submission failure
  - [ ] Include progress indication for form completion
  - [ ] Support conditional validation based on field dependencies
  - [ ] Handle edge cases like partially completed forms
  - [ ] Include user-friendly error recovery flows
- [ ] Task 5: Develop storage quota handling (AC: 5)
  - [ ] Implement localStorage quota monitoring
  - [ ] Add error handling for quota exceeded scenarios
  - [ ] Provide clear error messages for storage limitations
  - [ ] Include suggestions for freeing up storage space
  - [ ] Implement graceful degradation when storage is full
  - [ ] Support data cleanup options for users
  - [ ] Include warning messages before storage limits are reached
  - [ ] Add recovery mechanisms for corrupted data scenarios

## Dev Notes
This story implements comprehensive form validation and error handling for all forms in the application, providing real-time feedback, visual indicators, and helpful error messages to guide users through successful form completion.

## Technical Implementation Details

### Form Validation System

```javascript
// js/validation/form-validator.js
export class FormValidator {
    constructor() {
        this.validationRules = new Map();
        this.errorMessages = new Map();
        this.validators = new Map();
        this.setupDefaultValidators();
        this.setupErrorMessages();
    }

    setupDefaultValidators() {
        // Restaurant name validator
        this.validators.set('restaurantName', (value) => {
            if (!value || value.trim().length === 0) {
                return { valid: false, error: 'name_required' };
            }
            if (value.trim().length < 4) {
                return { valid: false, error: 'name_too_short' };
            }
            if (value.trim().length > 100) {
                return { valid: false, error: 'name_too_long' };
            }
            if (!/^[a-zA-Z0-9\sÀ-ÿ'-]+$/.test(value)) {
                return { valid: false, error: 'name_invalid_chars' };
            }
            return { valid: true };
        });

        // Operating hours validator
        this.validators.set('operatingHours', (value) => {
            if (!value || value.trim().length === 0) {
                return { valid: false, error: 'hours_required' };
            }
            if (value.trim().length > 200) {
                return { valid: false, error: 'hours_too_long' };
            }
            // Basic validation for common hour formats
            const hourPattern = /(\d{1,2})h\s*-\s*(\d{1,2})h|24h|24 horas/;
            if (!hourPattern.test(value)) {
                return { valid: false, error: 'hours_invalid_format' };
            }
            return { valid: true };
        });

        // Price range validator
        this.validators.set('priceRange', (value) => {
            if (!value && value !== 0) {
                return { valid: false, error: 'price_required' };
            }
            const price = parseFloat(value);
            if (isNaN(price) || price < 0) {
                return { valid: false, error: 'price_invalid' };
            }
            if (price > 1000) {
                return { valid: false, error: 'price_too_high' };
            }
            return { valid: true };
        });

        // Quality rating validator
        this.validators.set('qualityRating', (value) => {
            if (!value && value !== 0) {
                return { valid: false, error: 'rating_required' };
            }
            const rating = parseFloat(value);
            if (isNaN(rating) || rating < 0 || rating > 5) {
                return { valid: false, error: 'rating_invalid_range' };
            }
            if (rating % 0.5 !== 0) {
                return { valid: false, error: 'rating_invalid_increment' };
            }
            return { valid: true };
        });

        // File upload validator
        this.validators.set('fileUpload', (files) => {
            if (!files || files.length === 0) {
                return { valid: true }; // Files are optional
            }

            for (let file of files) {
                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                    return { valid: false, error: 'file_invalid_type', fileName: file.name };
                }

                // Validate file size (2MB max)
                if (file.size > 2 * 1024 * 1024) {
                    return { valid: false, error: 'file_too_large', fileName: file.name };
                }
            }

            // Validate number of files (max 4 for restaurants, 1 for ratings)
            if (files.length > 4) {
                return { valid: false, error: 'too_many_files' };
            }

            return { valid: true };
        });

        // Comment validator
        this.validators.set('comment', (value) => {
            if (!value || value.trim().length === 0) {
                return { valid: true }; // Comments are optional
            }
            if (value.trim().length > 500) {
                return { valid: false, error: 'comment_too_long' };
            }
            // Basic XSS prevention
            if (/<script|javascript:|on\w+\s*=/i.test(value)) {
                return { valid: false, error: 'comment_invalid_content' };
            }
            return { valid: true };
        });
    }

    setupErrorMessages() {
        this.errorMessages.set('name_required', 'O nome do restaurante é obrigatório');
        this.errorMessages.set('name_too_short', 'O nome deve ter pelo menos 4 caracteres');
        this.errorMessages.set('name_too_long', 'O nome deve ter no máximo 100 caracteres');
        this.errorMessages.set('name_invalid_chars', 'O nome contém caracteres inválidos');

        this.errorMessages.set('hours_required', 'O horário de funcionamento é obrigatório');
        this.errorMessages.set('hours_too_long', 'O horário deve ter no máximo 200 caracteres');
        this.errorMessages.set('hours_invalid_format', 'Formato de horário inválido. Use formato como "11h-23h" ou "24h"');

        this.errorMessages.set('price_required', 'O preço médio é obrigatório');
        this.errorMessages.set('price_invalid', 'O preço deve ser um número positivo');
        this.errorMessages.set('price_too_high', 'O preço não pode exceder R$ 1.000,00');

        this.errorMessages.set('rating_required', 'A avaliação é obrigatória');
        this.errorMessages.set('rating_invalid_range', 'A avaliação deve estar entre 0 e 5');
        this.errorMessages.set('rating_invalid_increment', 'A avaliação deve usar incrementos de 0,5');

        this.errorMessages.set('file_invalid_type', 'Arquivo inválido: {fileName}. Use JPG, PNG ou WebP');
        this.errorMessages.set('file_too_large', 'Arquivo muito grande: {fileName}. Máximo 2MB');
        this.errorMessages.set('too_many_files', 'Você pode enviar no máximo 4 arquivos');

        this.errorMessages.set('comment_too_long', 'O comentário deve ter no máximo 500 caracteres');
        this.errorMessages.set('comment_invalid_content', 'O comentário contém conteúdo inválido');

        this.errorMessages.set('storage_quota_exceeded', 'Espaço de armazenamento insuficiente');
        this.errorMessages.set('network_error', 'Erro de conexão. Verifique sua internet');
        this.errorMessages.set('unknown_error', 'Ocorreu um erro inesperado');
    }

    validateField(fieldName, value, context = {}) {
        const validator = this.validators.get(fieldName);
        if (!validator) {
            return { valid: true }; // No validation rule = valid
        }

        const result = validator(value, context);
        if (!result.valid && result.error) {
            let message = this.errorMessages.get(result.error) || 'Erro de validação';

            // Replace placeholders in error messages
            if (result.fileName) {
                message = message.replace('{fileName}', result.fileName);
            }

            return {
                valid: false,
                error: result.error,
                message: message
            };
        }

        return { valid: true };
    }

    validateForm(formData, fieldConfig) {
        const errors = {};
        let isValid = true;

        for (const [fieldName, config] of Object.entries(fieldConfig)) {
            const value = formData[fieldName];
            const context = { ...config, formData };

            const result = this.validateField(fieldName, value, context);

            if (!result.valid) {
                errors[fieldName] = result;
                isValid = false;
            }
        }

        return {
            valid: isValid,
            errors: errors
        };
    }

    getErrorMessage(errorCode, context = {}) {
        let message = this.errorMessages.get(errorCode) || 'Erro desconhecido';

        // Replace context placeholders
        Object.entries(context).forEach(([key, value]) => {
            message = message.replace(`{${key}}`, value);
        });

        return message;
    }
}
```

### Form Validation UI Manager

```javascript
// js/validation/form-validation-ui.js
export class FormValidationUI {
    constructor(validator) {
        this.validator = validator;
        this.activeForms = new Map();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Setup global validation event listeners
        document.addEventListener('input', (e) => this.handleInputEvent(e));
        document.addEventListener('blur', (e) => this.handleBlurEvent(e));
        document.addEventListener('submit', (e) => this.handleSubmitEvent(e));
    }

    registerForm(formId, config) {
        const form = document.getElementById(formId);
        if (!form) return;

        this.activeForms.set(formId, {
            form: form,
            config: config,
            fields: new Map(),
            submitButton: form.querySelector('[type="submit"]')
        });

        // Setup initial field validation
        this.setupFormFields(formId);
    }

    setupFormFields(formId) {
        const formConfig = this.activeForms.get(formId);
        if (!formConfig) return;

        const { form, config } = formConfig;

        Object.entries(config.fields).forEach(([fieldName, fieldConfig]) => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (!field) return;

            // Create field validation context
            formConfig.fields.set(fieldName, {
                element: field,
                config: fieldConfig,
                errorElement: this.createErrorElement(field),
                isValid: null
            });

            // Setup initial validation state
            this.validateField(formId, fieldName, false);
        });
    }

    createErrorElement(field) {
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'polite');

        // Insert error element after the field
        field.parentNode.insertBefore(errorElement, field.nextSibling);

        return errorElement;
    }

    handleInputEvent(e) {
        const field = e.target;
        const form = field.closest('form');

        if (!form || !this.activeForms.has(form.id)) return;

        const fieldName = field.name;
        if (!fieldName) return;

        // Validate field on input (real-time validation)
        this.validateField(form.id, fieldName, true);
        this.updateFormState(form.id);
    }

    handleBlurEvent(e) {
        const field = e.target;
        const form = field.closest('form');

        if (!form || !this.activeForms.has(form.id)) return;

        const fieldName = field.name;
        if (!fieldName) return;

        // Validate field on blur (final validation)
        this.validateField(form.id, fieldName, true);
        this.updateFormState(form.id);
    }

    handleSubmitEvent(e) {
        const form = e.target;

        if (!this.activeForms.has(form.id)) return;

        // Validate all fields on submission
        const validationResult = this.validateForm(form.id);

        if (!validationResult.valid) {
            e.preventDefault();
            this.showFormErrors(form.id, validationResult.errors);
            this.scrollToFirstError(form.id);
        }
    }

    validateField(formId, fieldName, showErrors = true) {
        const formConfig = this.activeForms.get(formId);
        if (!formConfig) return;

        const fieldContext = formConfig.fields.get(fieldName);
        if (!fieldContext) return;

        const { element, errorElement } = fieldContext;
        let value = element.value;

        // Special handling for file inputs
        if (element.type === 'file') {
            value = element.files;
        }

        // Special handling for checkboxes
        if (element.type === 'checkbox') {
            value = element.checked;
        }

        // Special handling for radio buttons
        if (element.type === 'radio') {
            const radioGroup = formConfig.form.querySelectorAll(`[name="${fieldName}"]`);
            const checkedRadio = Array.from(radioGroup).find(radio => radio.checked);
            value = checkedRadio ? checkedRadio.value : null;
        }

        const result = this.validator.validateField(fieldName, value, {
            formId: formId,
            formData: this.getFormData(formId)
        });

        // Update field validation state
        fieldContext.isValid = result.valid;
        fieldContext.lastResult = result;

        // Update UI
        this.updateFieldUI(element, errorElement, result, showErrors);

        return result;
    }

    validateForm(formId) {
        const formConfig = this.activeForms.get(formId);
        if (!formConfig) return { valid: true, errors: {} };

        const errors = {};
        let isValid = true;

        // Validate all fields
        for (const [fieldName, fieldContext] of formConfig.fields) {
            const result = this.validateField(formId, fieldName, true);

            if (!result.valid) {
                errors[fieldName] = result;
                isValid = false;
            }
        }

        return { valid: isValid, errors: errors };
    }

    updateFieldUI(element, errorElement, result, showErrors) {
        // Remove existing validation classes
        element.classList.remove('valid', 'invalid');

        if (result.valid) {
            element.classList.add('valid');
            errorElement.textContent = '';
            errorElement.style.display = 'none';
            element.setAttribute('aria-invalid', 'false');
        } else {
            element.classList.add('invalid');
            element.setAttribute('aria-invalid', 'true');

            if (showErrors) {
                errorElement.textContent = result.message;
                errorElement.style.display = 'block';
            }
        }
    }

    updateFormState(formId) {
        const formConfig = this.activeForms.get(formId);
        if (!formConfig) return;

        const { submitButton, fields } = formConfig;

        // Check if all fields are valid
        let allValid = true;
        for (const [fieldName, fieldContext] of fields) {
            if (fieldContext.config.required && !fieldContext.isValid) {
                allValid = false;
                break;
            }
        }

        // Update submit button state
        if (submitButton) {
            submitButton.disabled = !allValid;
            submitButton.classList.toggle('disabled', !allValid);
        }
    }

    showFormErrors(formId, errors) {
        const formConfig = this.activeForms.get(formId);
        if (!formConfig) return;

        // Show individual field errors
        Object.entries(errors).forEach(([fieldName, error]) => {
            const fieldContext = formConfig.fields.get(fieldName);
            if (fieldContext) {
                const { element, errorElement } = fieldContext;
                this.updateFieldUI(element, errorElement, error, true);
            }
        });

        // Show form-level error summary
        this.showErrorSummary(formId, errors);
    }

    showErrorSummary(formId, errors) {
        const formConfig = this.activeForms.get(formId);
        if (!formConfig) return;

        const { form } = formConfig;

        // Remove existing error summary
        const existingSummary = form.querySelector('.form-error-summary');
        if (existingSummary) {
            existingSummary.remove();
        }

        // Create error summary
        const errorCount = Object.keys(errors).length;
        const summary = document.createElement('div');
        summary.className = 'form-error-summary';
        summary.setAttribute('role', 'alert');
        summary.innerHTML = `
            <div class="error-summary-header">
                <span class="error-icon">⚠️</span>
                <h3>Formulário com erros</h3>
            </div>
            <p>Por favor, corrija ${errorCount} ${errorCount === 1 ? 'erro' : 'erros'} antes de enviar:</p>
            <ul class="error-list">
                ${Object.entries(errors).map(([fieldName, error]) =>
                    `<li>${error.message}</li>`
                ).join('')}
            </ul>
        `;

        // Insert at the top of the form
        form.insertBefore(summary, form.firstChild);
    }

    scrollToFirstError(formId) {
        const formConfig = this.activeForms.get(formId);
        if (!formConfig) return;

        // Find first invalid field
        for (const [fieldName, fieldContext] of formConfig.fields) {
            if (!fieldContext.isValid) {
                fieldContext.element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                fieldContext.element.focus();
                break;
            }
        }
    }

    getFormData(formId) {
        const formConfig = this.activeForms.get(formId);
        if (!formConfig) return {};

        const { form } = formConfig;
        const formData = new FormData(form);
        const data = {};

        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (e.g., checkboxes)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        return data;
    }

    checkStorageQuota() {
        try {
            // Check localStorage quota
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                navigator.storage.estimate().then(estimate => {
                    const usedPercentage = (estimate.usage / estimate.quota) * 100;

                    if (usedPercentage > 90) {
                        this.showStorageWarning(usedPercentage);
                    }
                });
            }

            // Simple localStorage test
            const testKey = 'storage_test';
            const testData = 'x'.repeat(1024 * 1024); // 1MB test data

            try {
                localStorage.setItem(testKey, testData);
                localStorage.removeItem(testKey);
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    this.showStorageQuotaError();
                }
            }
        } catch (error) {
            console.error('Error checking storage quota:', error);
        }
    }

    showStorageWarning(usedPercentage) {
        const warning = document.createElement('div');
        warning.className = 'storage-warning';
        warning.innerHTML = `
            <div class="warning-content">
                <span class="warning-icon">⚠️</span>
                <div class="warning-message">
                    <strong>Atenção:</strong> Espaço de armazenamento quase esgotado
                    (${usedPercentage.toFixed(1)}% usado).
                </div>
                <button class="warning-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(warning);
    }

    showStorageQuotaError() {
        const error = document.createElement('div');
        error.className = 'storage-error';
        error.innerHTML = `
            <div class="error-content">
                <span class="error-icon">❌</span>
                <div class="error-message">
                    <strong>Erro:</strong> Espaço de armazenamento insuficiente.
                    Limpe o cache do navegador ou remova dados desnecessários.
                </div>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(error);
    }

    // Public methods for programmatic validation
    forceValidation(formId) {
        return this.validateForm(formId);
    }

    clearValidation(formId) {
        const formConfig = this.activeForms.get(formId);
        if (!formConfig) return;

        const { form, fields } = formConfig;

        // Clear all field validation states
        for (const [fieldName, fieldContext] of fields) {
            const { element, errorElement } = fieldContext;
            element.classList.remove('valid', 'invalid');
            element.setAttribute('aria-invalid', 'false');
            errorElement.textContent = '';
            errorElement.style.display = 'none';
            fieldContext.isValid = null;
        }

        // Remove error summary
        const summary = form.querySelector('.form-error-summary');
        if (summary) {
            summary.remove();
        }

        // Reset submit button
        if (formConfig.submitButton) {
            formConfig.submitButton.disabled = false;
            formConfig.submitButton.classList.remove('disabled');
        }
    }
}
```

### CSS Styles for Validation

```css
/* Form validation styles */
.form-field {
    position: relative;
    margin-bottom: 1rem;
}

.form-field label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-primary);
}

.form-field input,
.form-field select,
.form-field textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s ease;
    background-color: var(--background-color);
    color: var(--text-primary);
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Validation states */
.form-field input.valid,
.form-field select.valid,
.form-field textarea.valid {
    border-color: #10b981;
    background-color: rgba(16, 185, 129, 0.05);
}

.form-field input.invalid,
.form-field select.invalid,
.form-field textarea.invalid {
    border-color: #ef4444;
    background-color: rgba(239, 68, 68, 0.05);
}

/* Error messages */
.field-error {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: #ef4444;
    display: none;
}

.field-error.show {
    display: block;
}

/* Form error summary */
.form-error-summary {
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
}

.error-summary-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.error-summary-header h3 {
    margin: 0;
    color: #991b1b;
    font-size: 1rem;
}

.form-error-summary p {
    margin: 0 0 0.75rem 0;
    color: #991b1b;
}

.error-list {
    margin: 0;
    padding-left: 1.5rem;
    color: #991b1b;
}

.error-list li {
    margin-bottom: 0.25rem;
}

/* Submit button states */
.btn[type="submit"] {
    transition: all 0.2s ease;
}

.btn[type="submit"]:disabled,
.btn[type="submit"].disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--disabled-color);
    border-color: var(--disabled-color);
}

/* Storage warnings */
.storage-warning,
.storage-error {
    position: fixed;
    top: 1rem;
    right: 1rem;
    max-width: 400px;
    z-index: 1000;
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.storage-warning {
    background-color: #fef3c7;
    border: 1px solid #fde68a;
    color: #92400e;
}

.storage-error {
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
}

.warning-content,
.error-content {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
}

.warning-message,
.error-message {
    flex: 1;
}

.warning-close,
.error-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0;
    margin-left: 0.5rem;
    opacity: 0.7;
}

.warning-close:hover,
.error-close:hover {
    opacity: 1;
}

/* File upload validation */
.file-upload-area {
    border: 2px dashed var(--border-color);
    border-radius: 0.5rem;
    padding: 2rem;
    text-align: center;
    transition: all 0.2s ease;
}

.file-upload-area.drag-over {
    border-color: var(--primary-color);
    background-color: rgba(59, 130, 246, 0.05);
}

.file-upload-area.invalid {
    border-color: #ef4444;
    background-color: rgba(239, 68, 68, 0.05);
}

.file-upload-area.valid {
    border-color: #10b981;
    background-color: rgba(16, 185, 129, 0.05);
}

/* Loading states */
.loading {
    position: relative;
    pointer-events: none;
}

.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1rem;
    height: 1rem;
    margin: -0.5rem 0 0 -0.5rem;
    border: 2px solid var(--border-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* Accessibility improvements */
.form-field input:focus:not(:focus-visible),
.form-field select:focus:not(:focus-visible),
.form-field textarea:focus:not(:focus-visible) {
    outline: none;
}

.form-field input:focus-visible,
.form-field select:focus-visible,
.form-field textarea:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    .form-field input,
    .form-field select,
    .form-field textarea {
        border-width: 3px;
    }

    .form-field input:focus,
    .form-field select:focus,
    .form-field textarea:focus {
        outline-width: 3px;
    }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
    .form-field input,
    .form-field select,
    .form-field textarea,
    .btn[type="submit"] {
        transition: none;
    }

    .loading::after {
        animation: none;
    }
}

/* Mobile responsiveness */
@media (max-width: 640px) {
    .form-error-summary {
        margin: 0 1rem 1rem 1rem;
    }

    .storage-warning,
    .storage-error {
        top: 0.5rem;
        right: 0.5rem;
        left: 0.5rem;
        max-width: none;
    }
}
```

### Testing
**Testing Approach:**
1. **Real-time Validation Test**: Test validation on input, blur, and form submission
2. **Error Message Test**: Verify error messages are clear and helpful
3. **Visual Feedback Test**: Test visual indicators for valid/invalid states
4. **Form Submission Test**: Test form blocking and error summary display
5. **Storage Quota Test**: Test handling of storage quota exceeded scenarios
6. **Accessibility Test**: Test screen reader support and keyboard navigation
7. **Cross-browser Test**: Test validation across all supported browsers
8. **Mobile Test**: Test validation on mobile devices and touch interfaces

**Success Metrics:**
- All forms have real-time validation with visual feedback
- Users receive clear, specific error messages for validation failures
- Form submission is blocked until all mandatory fields are valid
- Storage quota errors are handled gracefully with helpful messages
- Form validation works across all supported browsers and devices
- Accessibility requirements are met for validation states

### Dependencies
- Story 2.1: Restaurant Registration Form (for restaurant form validation)
- Story 3.2: Rating Form & Interface (for rating form validation)
- Story 1.4: Modal Framework (for modal form validation)
- CSS validation styles from previous stories

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