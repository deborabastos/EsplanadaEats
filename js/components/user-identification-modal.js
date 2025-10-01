// js/components/user-identification-modal.js - User identification UI component

/**
 * User Identification Modal - Handles user identification UI
 */
export class UserIdentificationModal {
    constructor(modalService, identificationService) {
        this.modalService = modalService;
        this.identificationService = identificationService;
        this.onSuccess = null;
        this.onCancel = null;

        console.log('UserIdentificationModal initialized');
    }

    /**
     * Show user identification modal (main entry point)
     * @param {Object} fingerprintData - Pre-generated fingerprint data
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} User identification result
     */
    async show(fingerprintData, options = {}) {
        try {
            console.log('Showing user identification modal...');

            // Check if user is already identified
            const existingData = this.identificationService.loadUserIdentification();
            if (existingData && !options.forceReidentify) {
                console.log('User already identified:', existingData.userName);
                this.identificationService.userData = existingData;
                this.identificationService.isIdentified = true;
                return existingData;
            }

            // If user needs identification, show modal
            if (fingerprintData) {
                return await this.showModal(fingerprintData, options);
            } else {
                // Initialize identification service first
                const initResult = await this.identificationService.initializeUserIdentification();
                if (initResult.needsIdentification) {
                    return await this.showModal(initResult.fingerprintData, options);
                } else {
                    return initResult;
                }
            }

        } catch (error) {
            console.error('Failed to show identification modal:', error);
            throw error;
        }
    }

    /**
     * Show user identification modal (legacy method for compatibility)
     * @param {Object} options - Modal options
     * @returns {Promise<Object>} User identification result
     */
    async showIdentificationModal(options = {}) {
        return await this.show(null, options);
    }

    /**
     * Show the identification modal
     * @param {Object} options - Modal options
     * @returns {Promise<Object>} User identification result
     */
    showModal(options = {}) {
        return new Promise((resolve, reject) => {
            this.onSuccess = (userData) => resolve(userData);
            this.onCancel = () => reject(new Error('User identification cancelled'));

            const content = this.createModalContent(options);
            const title = options.title || 'Identificação do Usuário';

            this.modalService.show(content, title, 'medium');
            this.addModalEventListeners();

            // Focus on name input
            setTimeout(() => {
                const nameInput = document.getElementById('user-name-input');
                if (nameInput) {
                    nameInput.focus();
                }
            }, 300);
        });
    }

    /**
     * Create modal content HTML
     * @param {Object} options - Content options
     * @returns {string} Modal HTML content
     */
    createModalContent(options = {}) {
        const {
            message = 'Para avaliar restaurantes, precisamos identificar você. Isso ajuda a evitar avaliações duplicadas.',
            allowAnonymous = true,
            showPrivacyInfo = true
        } = options;

        return `
            <div class="user-identification-modal">
                <div class="identification-header">
                    <div class="identification-icon">👤</div>
                    <h3>Bem-vindo ao Esplanada Eats!</h3>
                    <p class="identification-message">${message}</p>
                </div>

                <form id="user-identification-form" class="identification-form">
                    <div class="form-group">
                        <label for="user-name-input" class="form-label">
                            Seu nome <span class="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="user-name-input"
                            name="userName"
                            class="form-input"
                            placeholder="Digite seu nome (ex: João Silva)"
                            maxlength="50"
                            required
                            autocomplete="name"
                        >
                        <div class="input-help">
                            Pode usar seu nome real ou um apelido
                        </div>
                    </div>

                    ${allowAnonymous ? `
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input
                                    type="checkbox"
                                    id="anonymous-checkbox"
                                    name="isAnonymous"
                                    class="checkbox-input"
                                >
                                <span class="checkbox-text">
                                    Manter anonimato (outros usuários verão "Usuário Anônimo")
                                </span>
                            </label>
                        </div>
                    ` : ''}

                    <div class="form-actions">
                        <button
                            type="submit"
                            id="identify-submit-btn"
                            class="btn btn-primary"
                            disabled
                        >
                            Continuar
                        </button>
                        ${options.showCancel !== false ? `
                            <button
                                type="button"
                                id="identify-cancel-btn"
                                class="btn btn-secondary"
                            >
                                Cancelar
                            </button>
                        ` : ''}
                    </div>
                </form>

                ${showPrivacyInfo ? `
                    <div class="privacy-info">
                        <details class="privacy-details">
                            <summary class="privacy-summary">
                                🔒 Como sua identificação funciona
                            </summary>
                            <div class="privacy-content">
                                <p><strong>Coletamos informações automaticamente:</strong></p>
                                <ul>
                                    <li>Configurações do seu navegador (resolução, idioma, etc.)</li>
                                    <li>Características únicas do seu dispositivo</li>
                                </ul>
                                <p><strong>Isso nos ajuda a:</strong></p>
                                <ul>
                                    <li>Evitar que o mesmo usuário avalie um restaurante várias vezes</li>
                                    <li>Manter a qualidade e autenticidade das avaliações</li>
                                    <li>Identificar usuários de forma consistente</li>
                                </ul>
                                <p><strong>Não armazenamos:</strong></p>
                                <ul>
                                    <li>Informações pessoais sensíveis</li>
                                    <li>Dados de navegação ou histórico</li>
                                    <li>Localização precisa</li>
                                </ul>
                                <p class="privacy-note">
                                    Essas informações são usadas apenas para identificação única e não são compartilhadas com terceiros.
                                </p>
                            </div>
                        </details>
                    </div>
                ` : ''}

                <div class="identification-status" id="identification-status" style="display: none;">
                    <div class="status-content">
                        <div class="status-icon">⏳</div>
                        <div class="status-message">Gerando sua identificação única...</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Add event listeners to modal elements
     */
    addModalEventListeners() {
        // Form submission
        const form = document.getElementById('user-identification-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Input validation
        const nameInput = document.getElementById('user-name-input');
        if (nameInput) {
            nameInput.addEventListener('input', () => this.validateNameInput());
            nameInput.addEventListener('blur', () => this.validateNameInput());
        }

        // Cancel button
        const cancelBtn = document.getElementById('identify-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.handleCancel());
        }

        // Privacy details toggle
        const privacySummary = document.querySelector('.privacy-summary');
        if (privacySummary) {
            privacySummary.addEventListener('click', () => {
                const details = privacySummary.parentElement;
                details.classList.toggle('open');
            });
        }
    }

    /**
     * Handle form submission
     * @param {Event} e - Submit event
     */
    async handleFormSubmit(e) {
        e.preventDefault();

        try {
            const formData = new FormData(e.target);
            const userName = formData.get('userName').trim();
            const isAnonymous = formData.get('isAnonymous') === 'on';

            // Validate input
            if (!this.validateName(userName)) {
                this.showError('Por favor, digite um nome válido (mínimo 2 caracteres)');
                return;
            }

            // Show loading state
            this.showLoading();

            // Complete identification
            const userData = await this.identificationService.completeIdentification(userName, {
                isAnonymous,
                displayName: isAnonymous ? 'Usuário Anônimo' : userName
            });

            // Show success
            this.showSuccess();

            // Close modal after success
            setTimeout(() => {
                this.modalService.close();
                if (this.onSuccess) {
                    this.onSuccess(userData);
                }
            }, 1500);

        } catch (error) {
            console.error('Identification failed:', error);
            this.showError(error.message || 'Ocorreu um erro na identificação. Tente novamente.');
            this.hideLoading();
        }
    }

    /**
     * Validate name input
     * @param {string} name - Name to validate
     * @returns {boolean} True if valid
     */
    validateName(name) {
        if (!name || typeof name !== 'string') return false;

        const trimmed = name.trim();
        return trimmed.length >= 2 && trimmed.length <= 50;
    }

    /**
     * Validate name input field and update submit button
     */
    validateNameInput() {
        const nameInput = document.getElementById('user-name-input');
        const submitBtn = document.getElementById('identify-submit-btn');

        if (!nameInput || !submitBtn) return;

        const isValid = this.validateName(nameInput.value);
        submitBtn.disabled = !isValid;

        // Show validation feedback
        if (nameInput.value.trim().length > 0) {
            if (isValid) {
                nameInput.classList.remove('invalid');
                nameInput.classList.add('valid');
            } else {
                nameInput.classList.remove('valid');
                nameInput.classList.add('invalid');
            }
        } else {
            nameInput.classList.remove('valid', 'invalid');
        }
    }

    /**
     * Handle cancel action
     */
    handleCancel() {
        if (this.onCancel) {
            this.onCancel();
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        const statusDiv = document.getElementById('identification-status');
        const form = document.getElementById('user-identification-form');
        const submitBtn = document.getElementById('identify-submit-btn');

        if (statusDiv) {
            statusDiv.style.display = 'block';
        }

        if (form) {
            form.style.opacity = '0.5';
            form.style.pointerEvents = 'none';
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Processando...';
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        const statusDiv = document.getElementById('identification-status');
        const form = document.getElementById('user-identification-form');
        const submitBtn = document.getElementById('identify-submit-btn');

        if (statusDiv) {
            statusDiv.style.display = 'none';
        }

        if (form) {
            form.style.opacity = '1';
            form.style.pointerEvents = 'auto';
        }

        if (submitBtn) {
            submitBtn.innerHTML = 'Continuar';
        }
    }

    /**
     * Show success state
     */
    showSuccess() {
        const statusDiv = document.getElementById('identification-status');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div class="status-content success">
                    <div class="status-icon">✅</div>
                    <div class="status-message">Identificação concluída com sucesso!</div>
                </div>
            `;
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const form = document.getElementById('user-identification-form');
        if (!form) return;

        // Remove existing error
        const existingError = form.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add new error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-icon">⚠️</div>
            <div class="error-text">${message}</div>
        `;

        form.insertBefore(errorDiv, form.firstChild);

        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    /**
     * Add modal styles
     */
    addStyles() {
        if (document.getElementById('user-identification-styles')) return;

        const style = document.createElement('style');
        style.id = 'user-identification-styles';
        style.textContent = `
            .user-identification-modal {
                padding: 1.5rem;
                max-width: 500px;
                margin: 0 auto;
            }

            .identification-header {
                text-align: center;
                margin-bottom: 2rem;
            }

            .identification-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .identification-header h3 {
                margin: 0 0 0.5rem 0;
                color: var(--text-primary);
            }

            .identification-message {
                color: var(--text-secondary);
                line-height: 1.5;
                margin: 0;
            }

            .identification-form {
                margin-bottom: 1.5rem;
            }

            .form-group {
                margin-bottom: 1.5rem;
            }

            .form-label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: var(--text-primary);
            }

            .required {
                color: var(--error-color);
            }

            .form-input {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid var(--border-color);
                border-radius: 0.5rem;
                font-size: 1rem;
                transition: border-color 0.3s ease;
            }

            .form-input:focus {
                outline: none;
                border-color: var(--primary-color);
            }

            .form-input.valid {
                border-color: var(--success-color);
            }

            .form-input.invalid {
                border-color: var(--error-color);
            }

            .input-help {
                font-size: 0.875rem;
                color: var(--text-secondary);
                margin-top: 0.25rem;
            }

            .checkbox-label {
                display: flex;
                align-items: center;
                cursor: pointer;
                gap: 0.5rem;
            }

            .checkbox-input {
                margin: 0;
            }

            .checkbox-text {
                color: var(--text-primary);
                line-height: 1.4;
            }

            .form-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin-top: 2rem;
            }

            .privacy-info {
                margin-top: 2rem;
                padding-top: 1.5rem;
                border-top: 1px solid var(--border-color);
            }

            .privacy-details {
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                overflow: hidden;
            }

            .privacy-summary {
                padding: 1rem;
                background: var(--background-secondary);
                cursor: pointer;
                font-weight: 600;
                color: var(--text-primary);
                user-select: none;
            }

            .privacy-summary:hover {
                background: var(--background-hover);
            }

            .privacy-content {
                padding: 0 1rem;
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
            }

            .privacy-details.open .privacy-content {
                padding: 1rem;
                max-height: 500px;
            }

            .privacy-content p {
                margin: 0 0 0.75rem 0;
                color: var(--text-secondary);
            }

            .privacy-content ul {
                margin: 0 0 1rem 0;
                padding-left: 1.5rem;
            }

            .privacy-content li {
                margin-bottom: 0.25rem;
                color: var(--text-secondary);
            }

            .privacy-note {
                font-size: 0.875rem;
                font-style: italic;
            }

            .identification-status {
                text-align: center;
                padding: 2rem;
            }

            .status-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
            }

            .status-content.success {
                color: var(--success-color);
            }

            .status-icon {
                font-size: 2rem;
            }

            .status-message {
                color: var(--text-secondary);
            }

            .error-message {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem;
                background: rgba(220, 53, 69, 0.1);
                border: 1px solid var(--error-color);
                border-radius: 0.5rem;
                margin-bottom: 1rem;
            }

            .error-icon {
                font-size: 1.25rem;
                color: var(--error-color);
            }

            .error-text {
                color: var(--error-color);
                font-weight: 500;
            }

            .spinner {
                display: inline-block;
                width: 1rem;
                height: 1rem;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @media (max-width: 768px) {
                .user-identification-modal {
                    padding: 1rem;
                }

                .form-actions {
                    flex-direction: column;
                }

                .privacy-content {
                    font-size: 0.875rem;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

export default UserIdentificationModal;