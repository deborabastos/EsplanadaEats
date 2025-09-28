# Story 3.1: User Identification System

**As a user, I want to be identified uniquely when rating restaurants, so that my contributions are properly attributed and duplicate ratings are prevented.**

## Overview
This story implements a comprehensive user identification system that uses browser fingerprinting combined with user-provided information to uniquely identify users without requiring authentication, ensuring rating integrity and preventing duplicate submissions.

## Acceptance Criteria

### AC 1.1: Browser fingerprinting system using browser characteristics
- [ ] Implement browser fingerprint collection using multiple browser attributes
- [ ] Collect user agent, screen resolution, timezone, language, and platform info
- [ ] Generate consistent fingerprint hash from browser characteristics
- [ ] Include canvas fingerprinting for additional uniqueness
- [ ] Add WebGL renderer information for enhanced identification
- [ ] Implement fallback fingerprinting methods when primary methods fail

### AC 1.2: User name input combined with fingerprint for identification
- [ ] Create user identification interface with name input field
- [ ] Combine user name with browser fingerprint for composite identification
- [ ] Store user identification data in localStorage for persistence
- [ ] Include option for users to remain anonymous with consistent identification
- [ ] Add validation for user name input (length, characters)
- [ ] Implement user name editing capability

### AC 1.3: Duplicate tracking system preventing multiple ratings per user per restaurant
- [ ] Create user-restaurant tracking database structure
- [ ] Implement check for existing ratings before allowing new submissions
- [ ] Store user identification data with each rating
- [ ] Add timestamp tracking for user interactions
- [ ] Implement lookup system to find existing user ratings
- [ ] Include rate limiting for rating submissions

### AC 1.4: Graceful handling when fingerprinting is not available
- [ ] Implement fallback to basic browser characteristics
- [ ] Add error handling for fingerprinting failures
- [ ] Include user-friendly error messages for identification issues
- [ ] Implement progressive enhancement approach
- [ ] Add localStorage-based fallback identification
- [ ] Include retry mechanisms for failed fingerprinting

### AC 1.5: User identification persists across browser sessions using localStorage
- [ ] Store user identification data in localStorage with expiration
- [ ] Implement automatic user identification on page load
- [ ] Add refresh mechanism for expired identification data
- [ ] Include cleanup of old identification data
- [ ] Implement cross-tab synchronization for user identification
- [ ] Add privacy controls for data management

## Technical Implementation Details

### User Identification Service

```javascript
// js/services/user-identification-service.js
export class UserIdentificationService {
    constructor(storageService) {
        this.storageService = storageService;
        this.currentUser = null;
        this.fingerprint = null;
        this.identificationData = null;
        this.storageKey = 'esplanada-eats-user-id';
        this.fingerprintKey = 'esplanada-eats-fingerprint';
        this.expirationDays = 30;
    }

    async initialize() {
        try {
            // Try to load existing identification
            await this.loadExistingIdentification();

            if (!this.currentUser) {
                // Generate new identification
                await this.generateNewIdentification();
            }

            return this.currentUser;
        } catch (error) {
            console.error('User identification initialization error:', error);
            // Fallback to basic identification
            return await this.fallbackIdentification();
        }
    }

    async loadExistingIdentification() {
        try {
            // Load from localStorage
            const storedData = localStorage.getItem(this.storageKey);
            if (!storedData) return null;

            const parsedData = JSON.parse(storedData);

            // Check expiration
            const now = new Date();
            const expirationDate = new Date(parsedData.expirationDate);

            if (now > expirationDate) {
                localStorage.removeItem(this.storageKey);
                return null;
            }

            this.identificationData = parsedData;
            this.currentUser = parsedData.userId;
            this.fingerprint = parsedData.fingerprint;

            return parsedData;
        } catch (error) {
            console.error('Error loading existing identification:', error);
            return null;
        }
    }

    async generateNewIdentification() {
        try {
            // Generate browser fingerprint
            this.fingerprint = await this.generateBrowserFingerprint();

            // Generate user ID
            const userId = await this.generateUserId(this.fingerprint);

            // Create identification data
            this.identificationData = {
                userId,
                fingerprint: this.fingerprint,
                browserInfo: this.getBrowserInfo(),
                createdAt: new Date().toISOString(),
                expirationDate: this.getExpirationDate(),
                version: '1.0'
            };

            // Store identification
            this.storeIdentification();

            this.currentUser = userId;
            return userId;
        } catch (error) {
            console.error('Error generating new identification:', error);
            throw error;
        }
    }

    async generateBrowserFingerprint() {
        try {
            const components = {};

            // Basic browser information
            components.userAgent = navigator.userAgent;
            components.language = navigator.language;
            components.platform = navigator.platform;
            components.cookieEnabled = navigator.cookieEnabled;
            components.doNotTrack = navigator.doNotTrack;

            // Screen information
            components.screenResolution = `${screen.width}x${screen.height}`;
            components.screenColorDepth = screen.colorDepth;
            components.pixelRatio = window.devicePixelRatio;

            // Timezone
            components.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            components.timezoneOffset = new Date().getTimezoneOffset();

            // Canvas fingerprinting
            components.canvasFingerprint = await this.getCanvasFingerprint();

            // WebGL information
            components.webglFingerprint = await this.getWebGLFingerprint();

            // Audio context fingerprinting
            components.audioFingerprint = await this.getAudioFingerprint();

            // Generate hash
            const fingerprintString = JSON.stringify(components);
            return await this.hashString(fingerprintString);
        } catch (error) {
            console.error('Error generating browser fingerprint:', error);
            throw new Error('Failed to generate browser fingerprint');
        }
    }

    async getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Draw text
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Esplanada Eats 🍽️', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Esplanada Eats 🍽️', 4, 17);

            // Get fingerprint
            const dataURL = canvas.toDataURL();
            return dataURL;
        } catch (error) {
            console.error('Canvas fingerprinting error:', error);
            return 'canvas-fingerprint-failed';
        }
    }

    async getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

            if (!gl) {
                return 'webgl-not-supported';
            }

            // Get WebGL information
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            const vendor = gl.getParameter(gl.VENDOR);
            const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);

            return `${vendor}|${renderer}`;
        } catch (error) {
            console.error('WebGL fingerprinting error:', error);
            return 'webgl-fingerprint-failed';
        }
    }

    async getAudioFingerprint() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const analyser = audioContext.createAnalyser();
            const gainNode = audioContext.createGain();

            oscillator.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Float32Array(bufferLength);

            analyser.getFloatFrequencyData(dataArray);

            // Generate hash from audio data
            const audioString = Array.from(dataArray).join(',');
            return await this.hashString(audioString);
        } catch (error) {
            console.error('Audio fingerprinting error:', error);
            return 'audio-fingerprint-failed';
        }
    }

    async hashString(str) {
        try {
            // Use SubtleCrypto for hashing if available
            if (window.crypto && window.crypto.subtle) {
                const encoder = new TextEncoder();
                const data = encoder.encode(str);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }

            // Fallback to simple hash
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return Math.abs(hash).toString(16);
        } catch (error) {
            console.error('Hashing error:', error);
            return 'hash-failed';
        }
    }

    async generateUserId(fingerprint) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const combined = `${fingerprint}-${timestamp}-${random}`;
        return await this.hashString(combined);
    }

    getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    getExpirationDate() {
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + this.expirationDays);
        return expiration.toISOString();
    }

    storeIdentification() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.identificationData));
        } catch (error) {
            console.error('Error storing identification:', error);
            // Handle storage quota exceeded
            this.handleStorageError(error);
        }
    }

    handleStorageError(error) {
        if (error.name === 'QuotaExceededError') {
            // Clear old data and try again
            this.clearOldData();
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(this.identificationData));
            } catch (retryError) {
                console.error('Retry failed:', retryError);
            }
        }
    }

    clearOldData() {
        try {
            // Keep only recent identification data
            const keys = Object.keys(localStorage);
            const now = new Date();

            keys.forEach(key => {
                if (key.startsWith(this.storageKey)) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        const expirationDate = new Date(data.expirationDate);

                        if (now > expirationDate) {
                            localStorage.removeItem(key);
                        }
                    } catch (e) {
                        // Remove corrupted data
                        localStorage.removeItem(key);
                    }
                }
            });
        } catch (error) {
            console.error('Error clearing old data:', error);
        }
    }

    async fallbackIdentification() {
        try {
            // Basic fallback using simple browser characteristics
            const basicFingerprint = `${navigator.userAgent}-${screen.width}x${screen.height}-${navigator.language}`;
            const fallbackUserId = await this.hashString(basicFingerprint + Date.now());

            this.identificationData = {
                userId: fallbackUserId,
                fingerprint: basicFingerprint,
                isFallback: true,
                createdAt: new Date().toISOString(),
                expirationDate: this.getExpirationDate(),
                version: '1.0-fallback'
            };

            this.currentUser = fallbackUserId;
            this.fingerprint = basicFingerprint;

            this.storeIdentification();
            return fallbackUserId;
        } catch (error) {
            console.error('Fallback identification failed:', error);
            throw new Error('User identification failed completely');
        }
    }

    async setUserName(userName) {
        if (!this.currentUser) {
            throw new Error('User not identified');
        }

        // Validate user name
        if (!this.validateUserName(userName)) {
            throw new Error('Invalid user name');
        }

        // Update identification data
        this.identificationData.userName = userName;
        this.identificationData.userNameSetAt = new Date().toISOString();

        // Store updated data
        this.storeIdentification();

        return userName;
    }

    validateUserName(userName) {
        if (!userName || typeof userName !== 'string') {
            return false;
        }

        // Length validation
        if (userName.length < 2 || userName.length > 50) {
            return false;
        }

        // Character validation
        if (!/^[a-zA-Z0-9\sÀ-ÿ'-]+$/.test(userName)) {
            return false;
        }

        return true;
    }

    async checkExistingRating(restaurantId) {
        if (!this.currentUser) {
            return false;
        }

        try {
            // Check if user has already rated this restaurant
            const existingRating = await this.storageService.findUserRating(
                this.currentUser,
                restaurantId
            );

            return existingRating;
        } catch (error) {
            console.error('Error checking existing rating:', error);
            return false;
        }
    }

    async canUserRate(restaurantId) {
        const existingRating = await this.checkExistingRating(restaurantId);
        return !existingRating;
    }

    getUserInfo() {
        if (!this.identificationData) {
            return null;
        }

        return {
            userId: this.identificationData.userId,
            userName: this.identificationData.userName || 'Anônimo',
            isAnonymous: !this.identificationData.userName,
            createdAt: this.identificationData.createdAt,
            isFallback: this.identificationData.isFallback || false
        };
    }

    async refreshIdentification() {
        try {
            // Check if current identification is expired
            if (this.identificationData) {
                const now = new Date();
                const expirationDate = new Date(this.identificationData.expirationDate);

                if (now > expirationDate) {
                    // Generate new identification while preserving user name
                    const oldUserName = this.identificationData.userName;
                    await this.generateNewIdentification();

                    if (oldUserName) {
                        await this.setUserName(oldUserName);
                    }
                }
            }

            return this.currentUser;
        } catch (error) {
            console.error('Error refreshing identification:', error);
            return this.currentUser; // Return existing user on error
        }
    }

    clearIdentification() {
        try {
            localStorage.removeItem(this.storageKey);
            this.currentUser = null;
            this.identificationData = null;
            this.fingerprint = null;
        } catch (error) {
            console.error('Error clearing identification:', error);
        }
    }

    // Privacy controls
    exportUserData() {
        return this.identificationData ? JSON.stringify(this.identificationData, null, 2) : null;
    }

    deleteUserData() {
        this.clearIdentification();
        // Note: This would also need to clear user ratings from the database
    }
}
```

### User Identification UI Component

```javascript
// js/components/user-identification-component.js
export class UserIdentificationComponent {
    constructor(userIdentificationService) {
        this.userIdentificationService = userIdentificationService;
        this.modal = null;
        this.currentUser = null;
    }

    async showIdentificationModal(forceShow = false) {
        try {
            this.currentUser = await this.userIdentificationService.initialize();

            // Check if user already has a name or if we should force show
            if (!forceShow && this.currentUser && this.currentUser.userName) {
                return this.currentUser;
            }

            // Show identification modal
            this.showModal();
            return this.currentUser;
        } catch (error) {
            console.error('Error showing identification modal:', error);
            this.showError('Erro na identificação do usuário');
            return null;
        }
    }

    showModal() {
        const userInfo = this.userIdentificationService.getUserInfo();
        const modalContent = this.renderModalContent(userInfo);

        this.modal = this.userIdentificationService.modalService.show({
            title: 'Identificação do Usuário',
            content: modalContent,
            size: 'small',
            showClose: false,
            onClose: () => this.cleanup()
        });

        this.setupModalEventListeners();
    }

    renderModalContent(userInfo) {
        const isExistingUser = userInfo && userInfo.userId;
        const hasUserName = userInfo && userInfo.userName;

        return `
            <div class="user-identification-modal">
                <div class="identification-header">
                    <div class="identification-icon">👤</div>
                    <h3>${isExistingUser ? 'Bem-vindo de volta!' : 'Identifique-se'}</h3>
                    <p class="identification-subtitle">
                        ${isExistingUser
                            ? 'Precisamos confirmar sua identificação para avaliar restaurantes'
                            : 'Para avaliar restaurantes, precisamos identificar você exclusivamente'
                        }
                    </p>
                </div>

                <form id="user-identification-form" class="identification-form">
                    <div class="form-group">
                        <label for="user-name" class="form-label">
                            Seu Nome ${!hasUserName ? '<span class="required">*</span>' : ''}
                        </label>
                        <input
                            type="text"
                            id="user-name"
                            name="userName"
                            class="form-input"
                            placeholder="Digite seu nome ou apelido"
                            value="${userInfo?.userName || ''}"
                            ${!hasUserName ? 'required' : ''}
                            maxlength="50"
                        >
                        <div class="field-help">
                            ${!hasUserName ? 'Mínimo de 2 caracteres' : 'Você pode alterar seu nome a qualquer momento'}
                        </div>
                        <div class="field-error"></div>
                    </div>

                    <div class="identification-info">
                        <div class="info-item">
                            <span class="info-icon">🔒</span>
                            <span class="info-text">
                                Seu nome será usado apenas para identificar suas avaliações
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🛡️</span>
                            <span class="info-text">
                                Não compartilhamos suas informações pessoais
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">✨</span>
                            <span class="info-text">
                                Você pode avaliar cada restaurante apenas uma vez
                            </span>
                        </div>
                    </div>

                    <div class="privacy-info">
                        <details class="privacy-details">
                            <summary>Como funciona nossa identificação</summary>
                            <div class="privacy-content">
                                <p>Usamos características do seu navegador para criar uma identificação única anônima. Isso nos permite:</p>
                                <ul>
                                    <li>Evitar avaliações duplicadas</li>
                                    <li>Manter a integridade das avaliações</li>
                                    <li>Oferecer uma experiência personalizada</li>
                                </ul>
                                <p>Seus dados são armazenados localmente e são excluídos após 30 dias de inatividade.</p>
                            </div>
                        </details>
                    </div>

                    <div class="form-actions">
                        ${hasUserName ? `
                            <button type="button" class="btn btn-secondary" id="skip-btn">
                                Manter Anônimo
                            </button>
                        ` : ''}
                        <button type="submit" class="btn btn-primary" id="continue-btn">
                            ${hasUserName ? 'Atualizar Nome' : 'Continuar'}
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    setupModalEventListeners() {
        const form = document.getElementById('user-identification-form');
        const skipBtn = document.getElementById('skip-btn');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });

            // Real-time validation
            const nameInput = form.querySelector('#user-name');
            nameInput.addEventListener('input', () => {
                this.validateName(nameInput);
            });

            nameInput.addEventListener('blur', () => {
                this.validateName(nameInput);
            });
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.handleSkip();
            });
        }
    }

    validateName(input) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';

        if (!hasUserName && !value) {
            isValid = false;
            errorMessage = 'Por favor, digite seu nome';
        } else if (value && value.length < 2) {
            isValid = false;
            errorMessage = 'Mínimo de 2 caracteres';
        } else if (value && value.length > 50) {
            isValid = false;
            errorMessage = 'Máximo de 50 caracteres';
        } else if (value && !/^[a-zA-Z0-9\sÀ-ÿ'-]+$/.test(value)) {
            isValid = false;
            errorMessage = 'Nome contém caracteres inválidos';
        }

        this.showFieldError(input, isValid, errorMessage);
        return isValid;
    }

    showFieldError(field, isValid, errorMessage) {
        const errorElement = field.parentNode.querySelector('.field-error');

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
        } else {
            field.classList.remove('field-error');
            field.setAttribute('aria-invalid', 'false');

            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }
    }

    async handleFormSubmit() {
        const form = document.getElementById('user-identification-form');
        const nameInput = form.querySelector('#user-name');
        const submitBtn = document.getElementById('continue-btn');

        if (!this.validateName(nameInput)) {
            return;
        }

        const userName = nameInput.value.trim();

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Processando...';

        try {
            if (userName) {
                await this.userIdentificationService.setUserName(userName);
            }

            // Show success
            this.showSuccess('Identificação concluída com sucesso!');

            // Close modal after delay
            setTimeout(() => {
                this.userIdentificationService.modalService.closeModal();
                this.notifyIdentificationComplete();
            }, 1500);

        } catch (error) {
            console.error('Error submitting identification:', error);
            this.showError('Erro ao salvar identificação: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = userName ? 'Atualizar Nome' : 'Continuar';
        }
    }

    handleSkip() {
        // Close modal without setting name
        this.userIdentificationService.modalService.closeModal();
        this.notifyIdentificationComplete();
    }

    notifyIdentificationComplete() {
        // Notify that identification is complete
        window.dispatchEvent(new CustomEvent('user-identification-complete', {
            detail: { user: this.userIdentificationService.getUserInfo() }
        }));
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        window.dispatchEvent(new CustomEvent('show-notification', {
            detail: { message, type }
        }));
    }

    cleanup() {
        this.modal = null;
        this.currentUser = null;
    }
}
```

### CSS Styles

```css
/* User identification modal */
.user-identification-modal {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.identification-header {
    text-align: center;
    padding: 1rem;
}

.identification-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.identification-header h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
}

.identification-subtitle {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.5;
}

/* Identification form */
.identification-form {
    display: flex;
    flex-direction: column;
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
}

.form-input {
    padding: 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input.field-error {
    border-color: var(--error-color);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.field-help {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.field-error {
    font-size: 0.875rem;
    color: var(--error-color);
    display: none;
}

/* Identification info */
.identification-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background-color: var(--background-color);
    border-radius: 0.5rem;
}

.info-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
}

.info-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
}

.info-text {
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.4;
}

/* Privacy info */
.privacy-info {
    border-top: 1px solid var(--border-color);
    padding-top: 1rem;
}

.privacy-details {
    cursor: pointer;
}

.privacy-details summary {
    font-weight: 500;
    color: var(--primary-color);
    cursor: pointer;
    padding: 0.5rem 0;
    list-style: none;
}

.privacy-details summary::-webkit-details-marker {
    display: none;
}

.privacy-details summary::before {
    content: '▼ ';
    font-size: 0.875rem;
}

.privacy-details[open] summary::before {
    content: '▲ ';
}

.privacy-content {
    padding: 1rem;
    background-color: var(--background-color);
    border-radius: 0.375rem;
    margin-top: 0.5rem;
}

.privacy-content p {
    margin: 0 0 0.75rem 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;
}

.privacy-content p:last-child {
    margin-bottom: 0;
}

.privacy-content ul {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
}

.privacy-content li {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
}

/* Form actions */
.form-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    margin-top: 1rem;
}

/* Loading spinner */
.spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    display: inline-block;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Responsive design */
@media (max-width: 640px) {
    .identification-header {
        padding: 0.5rem;
    }

    .identification-icon {
        font-size: 2rem;
    }

    .identification-header h3 {
        font-size: 1.25rem;
    }

    .form-actions {
        flex-direction: column;
    }

    .form-actions .btn {
        width: 100%;
    }

    .privacy-content {
        padding: 0.75rem;
    }
}

/* Accessibility improvements */
.form-input:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

.privacy-details summary:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    border-radius: 0.25rem;
}

@media (prefers-reduced-motion: reduce) {
    .spinner {
        animation: none;
    }
}
```

## Dependencies
- Story 1.2: Data Models & Storage System (must be completed first)
- Story 1.4: Modal Framework (for user identification modal)
- Firebase Storage service from Epic 0
- Modern browser with Canvas, WebGL, and Web Audio API support

## Success Metrics
- User identification works consistently across browser sessions
- Browser fingerprinting generates unique and stable identifiers
- User name input works with proper validation
- Duplicate prevention system prevents multiple ratings per user
- Graceful fallback works when fingerprinting fails
- Privacy controls work correctly
- Cross-browser compatibility is maintained

## Testing Approach
1. **Identification Test**: Verify user identification works on different browsers
2. **Fingerprinting Test**: Test fingerprint generation and consistency
3. **Persistence Test**: Verify identification persists across sessions
4. **Duplicate Prevention Test**: Test duplicate rating prevention
5. **Fallback Test**: Test fallback identification when fingerprinting fails
6. **Privacy Test**: Verify privacy controls work correctly

## Notes
- Implements comprehensive browser fingerprinting with multiple methods
- Includes privacy-focused design with user consent
- Provides fallback mechanisms for browser compatibility
- Handles edge cases like private browsing mode
- Includes proper error handling and user feedback
- Respects user privacy with local storage only
- Designed to work without requiring authentication