// js/modules/modal-service.js - Modal management service
// Version: 1.0.9 - Fixed data processing and removed debug logs

import { UserIdentificationService } from '../services/user-identification-service.js';
import { UserIdentificationModal } from '../components/user-identification-modal.js';
import { RatingForm } from '../components/rating-form.js';
import { RatingDisplay } from '../components/rating-display.js?v=1.0.1';

/**
 * Modal Service - Handles all modal-related operations
 */
export class ModalService {
    constructor() {
        console.log('🔧 ModalService constructor - Starting initialization...');
        this.modalContainer = null;
        this.modalBody = null;
        this.modalClose = null;
        this.isOpen = false;
        this.onCloseCallback = null;
        this.previousFocusElement = null;

        // User identification services
        console.log('👤 Creating UserIdentificationService...');
        try {
            this.identificationService = new UserIdentificationService();
            console.log('✅ UserIdentificationService created successfully');
            console.log('   isUserIdentified method exists:', typeof this.identificationService.isUserIdentified);
            console.log('   identifyUser method exists:', typeof this.identificationService.identifyUser);
        } catch (error) {
            console.error('❌ Error creating UserIdentificationService:', error);
            console.error('   Stack:', error.stack);
            throw error;
        }

        console.log('🆔 Creating UserIdentificationModal...');
        try {
            this.identificationModal = new UserIdentificationModal(this, this.identificationService);
            console.log('✅ UserIdentificationModal created successfully');
        } catch (error) {
            console.error('❌ Error creating UserIdentificationModal:', error);
            // Don't throw here, rating might still work
        }

        console.log('🎉 ModalService constructor completed, calling initialize...');
        this.initialize();
    }

    /**
     * Initialize the modal service
     */
    initialize() {
        try {
            this.modalContainer = document.getElementById('modal-container');
            this.modalBody = document.getElementById('modal-body');
            this.modalClose = document.querySelector('.modal-close');

            if (!this.modalContainer || !this.modalBody) {
                console.error('Modal elements not found in DOM');
                return;
            }

            // Set up event listeners
            this.setupEventListeners();

            console.log('ModalService initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ModalService:', error);
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Close button
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => {
                this.close();
            });
        }

        // Overlay click to close
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.close();
                }
            });
        }

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Trap focus within modal
        this.modalContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.isOpen) {
                this.trapFocus(e);
            }
        });
    }

    /**
     * Open modal with content
     * @param {string} content - HTML content to display
     * @param {string} title - Modal title
     * @param {Function} onClose - Callback when modal is closed
     */
    show(content, title = '', onClose = null) {
        try {
            if (!this.modalContainer || !this.modalBody) {
                console.error('Modal elements not available');
                return;
            }

            console.log('Opening modal:', title);

            // Set modal title if provided
            if (title) {
                this.modalContainer.setAttribute('aria-labelledby', 'modal-title');
                // Add title to modal body if not already present
                if (!content.includes('<h2')) {
                    content = `<h2 id="modal-title">${this.escapeHtml(title)}</h2>${content}`;
                }
            }

            // Set content
            this.modalBody.innerHTML = content;

            // Render rating display using the new component for modal
            const modalRatingContainer = this.modalBody.querySelector('#modal-rating-display');
            if (modalRatingContainer && restaurant) {
                const ratingData = {
                    averageQuality: restaurant.averageQuality || restaurant.averageOverall || 0,
                    totalRatings: this.extractRatingCount(restaurant),
                    confidenceScore: restaurant.confidenceScore || 0,
                    ratingDistribution: restaurant.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                    trend: restaurant.trend || 'neutral',
                    isOffline: restaurant.isOffline || false
                };

                RatingDisplay.renderDetailed(ratingData, modalRatingContainer);
            }

            // Show modal
            this.modalContainer.style.display = 'flex';
            this.modalContainer.classList.add('active');
            this.modalContainer.setAttribute('aria-hidden', 'false');

            // Store close callback
            this.onCloseCallback = onClose;

            // Store current focus element for accessibility
            this.previousFocusElement = document.activeElement;

            // Set state
            this.isOpen = true;

            // Focus management
            setTimeout(() => {
                this.setInitialFocus();
            }, 100);

            // Prevent body scroll
            document.body.style.overflow = 'hidden';

            console.log('Modal opened successfully');
        } catch (error) {
            console.error('Failed to show modal:', error);
        }
    }

    /**
     * Show add restaurant modal
     */
    showAddRestaurantModal() {
        const content = `
            <form id="add-restaurant-form" class="modal-form">
                <div class="form-group">
                    <label for="restaurant-name">Nome do Restaurante *</label>
                    <input type="text" id="restaurant-name" name="name" required maxlength="100" placeholder="Mínimo 4 caracteres">
                    <div id="name-error" class="field-error"></div>
                </div>

                <div class="form-group">
                    <label for="restaurant-hours">Horário de Funcionamento *</label>
                    <input type="text" id="restaurant-hours" name="hours" required maxlength="100" placeholder="Ex: Seg-Sex: 11h-23h, Sáb: 12h-23h">
                    <div id="hours-error" class="field-error"></div>
                </div>

                <div class="form-group">
                    <label for="restaurant-price-type">Tipo de Preço *</label>
                    <select id="restaurant-price-type" name="priceType" required>
                        <option value="">Selecione o tipo de preço</option>
                        <option value="range">Faixa de Preço (à la carte)</option>
                        <option value="kilo">Preço por Kilo</option>
                    </select>
                    <div id="price-type-error" class="field-error"></div>
                </div>

                <div class="form-group" id="price-range-group" style="display: none;">
                    <label for="restaurant-price-range">Faixa de Preço *</label>
                    <select id="restaurant-price-range" name="priceRange">
                        <option value="">Selecione uma faixa</option>
                        <option value="15">$ - Barato (até R$ 25)</option>
                        <option value="35">$$ - Médio (R$ 25-50)</option>
                        <option value="75">$$$ - Caro (R$ 50-100)</option>
                        <option value="150">$$$$ - Luxo (acima de R$ 100)</option>
                    </select>
                    <div id="price-range-error" class="field-error"></div>
                </div>

                <div class="form-group" id="price-kilo-group" style="display: none;">
                    <label for="restaurant-price-kilo">Preço por Kilo (R$) *</label>
                    <input type="number" id="restaurant-price-kilo" name="priceKilo" min="0" step="0.50" placeholder="Ex: 49.90">
                    <div id="price-kilo-error" class="field-error"></div>
                </div>

                <div class="form-group">
                    <label for="restaurant-quality">Qualidade Inicial (1-5 estrelas) *</label>
                    <div class="star-rating-input">
                        <input type="hidden" id="restaurant-quality" name="quality" value="0" required>
                        <div class="star-rating" data-rating="0">
                            <span class="star" data-value="1">☆</span>
                            <span class="star" data-value="2">☆</span>
                            <span class="star" data-value="3">☆</span>
                            <span class="star" data-value="4">☆</span>
                            <span class="star" data-value="5">☆</span>
                        </div>
                        <small>Clique nas estrelas para avaliar</small>
                    </div>
                    <div id="quality-error" class="field-error"></div>
                </div>

                <div class="form-group">
                    <label for="restaurant-vegetarian">Opções Vegetarianas *</label>
                    <select id="restaurant-vegetarian" name="vegetarianOptions" required>
                        <option value="">Selecione uma opção</option>
                        <option value="none">Não possui opções vegetarianas</option>
                        <option value="few">Poucas opções vegetarianas</option>
                        <option value="moderate">Quantidade moderada de opções</option>
                        <option value="many">Muitas opções vegetarianas</option>
                        <option value="exclusive">Especializado em culinária vegetariana</option>
                    </select>
                    <div id="vegetarian-error" class="field-error"></div>
                </div>

                <div class="form-group">
                    <label for="restaurant-access">Informações de Acesso (opcional)</label>
                    <input type="text" id="restaurant-access" name="access" maxlength="200" placeholder="Ex: Acesso para cadeirantes, estacionamento, etc.">
                    <div id="access-error" class="field-error"></div>
                </div>

                <div class="form-group">
                    <label for="restaurant-description">Descrição (opcional)</label>
                    <textarea id="restaurant-description" name="description" rows="3" maxlength="500" placeholder="Descreva seu restaurante..."></textarea>
                </div>

                <div class="form-group">
                    <label for="restaurant-address">Endereço (opcional)</label>
                    <input type="text" id="restaurant-address" name="address" maxlength="200">
                </div>

                <div class="form-group">
                    <label>Fotos do Restaurante</label>
                    <div id="image-upload-component">
                        <p>Carregando componente de upload...</p>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" id="cancel-restaurant-btn">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary">
                        Adicionar Restaurante
                    </button>
                </div>
            </form>
        `;

        this.show(content, 'Adicionar Novo Restaurante');

        // Set up form submission and validation
        setTimeout(() => {
            const form = document.getElementById('add-restaurant-form');
            if (form) {
                // Add real-time validation for all required fields
                this.setupFieldValidation(form, 'restaurant-name', 'name-error', (value) => {
                    return value.trim().length >= 4 ? '' : 'Nome deve ter no mínimo 4 caracteres';
                });

                this.setupFieldValidation(form, 'restaurant-hours', 'hours-error', (value) => {
                    return value.trim().length > 0 ? '' : 'Horário de funcionamento é obrigatório';
                });

                this.setupFieldValidation(form, 'restaurant-vegetarian', 'vegetarian-error', (value) => {
                    return value ? '' : 'Selecione uma opção para opções vegetarianas';
                });

                // Setup price type change handler
                this.setupPriceTypeHandler(form);

                // Setup star rating interaction (now with half stars)
                this.setupStarRating(form);

                // Setup image upload component
                console.log('About to setup image upload component...');
                this.setupImageUploadComponent();

                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleAddRestaurantSubmit(form);
                });

                // Add event listener for cancel button
                const cancelBtn = form.querySelector('#cancel-restaurant-btn');
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        this.close();
                    });
                }
            }
        }, 100);
    }

    /**
     * Handle add restaurant form submission
     * @param {HTMLFormElement} form - Form element
     */
    async handleAddRestaurantSubmit(form) {
        try {
            const formData = new FormData(form);
            let restaurantData = Object.fromEntries(formData.entries());

            // Manual collection of fields that might not be included in FormData
            // Get quality rating from hidden input
            const qualityInput = form.querySelector('#restaurant-quality');
            if (qualityInput && qualityInput.value) {
                restaurantData.quality = parseFloat(qualityInput.value);
            }

            // Get price type and related fields
            const priceTypeSelect = form.querySelector('#restaurant-price-type');
            if (priceTypeSelect && priceTypeSelect.value) {
                restaurantData.priceType = priceTypeSelect.value;

                // Get specific price fields based on type
                if (priceTypeSelect.value === 'range') {
                    const priceRangeSelect = form.querySelector('#restaurant-price-range');
                    if (priceRangeSelect && priceRangeSelect.value) {
                        restaurantData.priceRange = parseFloat(priceRangeSelect.value);
                        // Convert range to price scale (1-5) based on user selection
                        if (restaurantData.priceRange <= 25) restaurantData.price = 1; // $ - Muito barato
                        else if (restaurantData.priceRange <= 50) restaurantData.price = 2; // $$ - Barato
                        else if (restaurantData.priceRange <= 100) restaurantData.price = 3; // $$$ - Médio
                        else restaurantData.price = 4; // $$$$ - Caro
                    }
                } else if (priceTypeSelect.value === 'kilo') {
                    const priceKiloInput = form.querySelector('#restaurant-price-kilo');
                    if (priceKiloInput && priceKiloInput.value) {
                        restaurantData.priceKilo = parseFloat(priceKiloInput.value);
                        // For kilo restaurants, save the actual price but use a different scale
                        restaurantData.price = restaurantData.priceKilo; // Save actual kilo price
                    }
                }
            }

            // Get vegetarian options
            const vegetarianSelect = form.querySelector('#restaurant-vegetarian');
            if (vegetarianSelect && vegetarianSelect.value) {
                restaurantData.vegetarianOptions = vegetarianSelect.value;
            }

            // Set initial rating values if quality is provided
            if (restaurantData.quality && restaurantData.quality > 0) {
                restaurantData.averageQuality = restaurantData.quality;
                restaurantData.totalRatings = 1;
                restaurantData.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                restaurantData.ratingDistribution[Math.floor(restaurantData.quality)] = 1;
            }

            console.log('Submitting restaurant data:', restaurantData);
            console.log('Form data entries:', Array.from(formData.entries()));
            console.log('Manual field collection:', {
                quality: restaurantData.quality,
                priceType: restaurantData.priceType,
                price: restaurantData.price,
                vegetarianOptions: restaurantData.vegetarianOptions
            });

            // Add anonymous owner ID for non-authenticated users
            restaurantData.ownerId = 'anonymous_user';

            // Validate image sizes before creating restaurant
            if (window.uploadedRestaurantImages && window.uploadedRestaurantImages.length > 0) {
                const maxSize = 10 * 1024 * 1024; // 10MB limit for initial validation
                const oversizedImages = window.uploadedRestaurantImages.filter(file => file.size > maxSize);

                if (oversizedImages.length > 0) {
                    throw new Error(`Algumas imagens são muito grandes (maior que 10MB). Por favor, use imagens menores.`);
                }
            }

            // Import StorageService first (with cache busting)
            const timestamp = Date.now();
            const { StorageService } = await import(`../services/storage-service.js?t=${timestamp}`);
            const storageService = new StorageService(window.firebase.app());

            // Show loading
            const imageCount = window.uploadedRestaurantImages ? window.uploadedRestaurantImages.length : 0;
            const loadingMessage = imageCount > 0
                ? `Salvando restaurante e processando ${imageCount} foto(s)...`
                : 'Salvando restaurante...';
            this.showLoadingModal(loadingMessage);

            // Create restaurant first to get ID
            const restaurantId = await storageService.createRestaurant(restaurantData);
            console.log('Restaurant created successfully:', restaurantId);

            // Process uploaded images if any
            let photoUrls = [];
            if (window.uploadedRestaurantImages && window.uploadedRestaurantImages.length > 0) {
                console.log(`Found ${window.uploadedRestaurantImages.length} images to process`);

                try {
                    // Pre-process images to ensure they meet size requirements
                    this.updateLoadingModal('Processando imagens...');
                    const processedImages = await this.preProcessImages(window.uploadedRestaurantImages);

                    // Import and use ImageUploadService
                    const { ImageUploadService } = await import('../services/image-upload-service.js');
                    const imageUploadService = new ImageUploadService(window.firebase.storage());

                    // Upload all processed images with the actual restaurant ID
                    this.updateLoadingModal('Enviando imagens para o servidor...');
                    const uploadPromises = processedImages.map(file =>
                        imageUploadService.uploadAndOptimizeImage(file, restaurantId)
                    );

                    const uploadResults = await Promise.all(uploadPromises);
                    photoUrls = uploadResults.map(result => result.downloadUrl);

                    console.log(`Successfully uploaded ${photoUrls.length} images:`, photoUrls);

                    // Update restaurant with photo URLs using relaxed validation
                    this.updateLoadingModal('Finalizando cadastro...');

                    // Check if the new method exists
                    if (typeof storageService.updateRestaurantPhotos === 'function') {
                        await storageService.updateRestaurantPhotos(restaurantId, photoUrls);
                    } else {
                        // Fallback to the original method
                        console.warn('updateRestaurantPhotos method not found, using fallback');
                        await storageService.updateRestaurant(restaurantId, { photoUrls });
                    }

                } catch (uploadError) {
                    console.error('Failed to upload images:', uploadError);
                    // Restaurant was created successfully, just show warning
                    console.warn('Restaurant created but images failed to upload');
                }
            }

                // Restaurant creation and photo upload completed successfully
                console.log('Restaurant creation process completed successfully!');
                this.close();
                this.showSuccessModal('Restaurante Adicionado!', 'O restaurante foi cadastrado com sucesso e já está disponível na lista.');
                return;

        } catch (error) {
            console.error('Failed to submit restaurant:', error);
            console.error('Firebase error details:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            this.close();
            this.showErrorModal('Erro ao Adicionar Restaurante', error.message || 'Ocorreu um erro ao salvar o restaurante. Tente novamente.');
        }
    }

    /**
     * Show restaurant details modal
     * @param {Object} restaurant - Restaurant object
     */
    showRestaurantDetailsModal(restaurant) {
        console.log('🎭 MODAL showRestaurantDetailsModal - Dados COMPLETOS recebidos:');
        console.log('   Nome:', restaurant.name);
        console.log('   ID:', restaurant.id);
        console.log('   totalRatings:', restaurant.totalRatings);
        console.log('   totalReviews:', restaurant.totalReviews);
        console.log('   averageQuality:', restaurant.averageQuality);
        console.log('   averageOverall:', restaurant.averageOverall);
        console.log('   Todos os campos:', Object.keys(restaurant));
        console.log('restaurant.photoUrls:', restaurant.photoUrls);
        console.log('restaurant.photoUrl:', restaurant.photoUrl);

        const photos = restaurant.photoUrls || [];
        const hasPhotos = photos.length > 0;

        console.log('Processed photos array:', photos);
        console.log('hasPhotos:', hasPhotos);

        const content = `
            <div class="restaurant-detail-modal">
                ${this.renderPhotoGallery(restaurant, photos)}

                <div class="restaurant-info-section">
                    ${this.renderBasicInfo(restaurant)}
                    ${this.renderOperatingHours(restaurant)}
                    ${this.renderDescription(restaurant)}
                    ${this.renderAccessInfo(restaurant)}
                    ${this.renderActions(restaurant)}
                </div>
            </div>
        `;

        this.show(content, restaurant.name, 'large');

        // Initialize modal components
        setTimeout(() => {
            this.initializeRestaurantDetailModal(restaurant);
        }, 200);
    }

    /**
     * Check if modal is open
     * @returns {boolean} True if modal is open
     */
    isModalOpen() {
        return this.isOpen;
    }

    /**
     * Show modal with specific content type
     * @param {string} type - Content type (details, form, error, loading)
     * @param {Object} data - Data object for the content
     * @param {Function} onClose - Optional callback
     */
    showTypedModal(type, data, onClose = null) {
        let content = '';
        let title = '';

        switch (type) {
            case 'details':
                content = this.createDetailsContent(data);
                title = data.name || 'Detalhes';
                break;
            case 'form':
                content = this.createFormContent(data);
                title = data.title || 'Formulário';
                break;
            case 'error':
                content = this.createErrorContent(data);
                title = data.title || 'Erro';
                break;
            case 'loading':
                content = this.createLoadingContent(data);
                title = data.title || '';
                break;
            default:
                content = this.createGenericContent(data);
                title = data.title || 'Informação';
        }

        this.show(content, title, onClose);
    }

    /**
     * Create details content for restaurant
     * @param {Object} restaurant - Restaurant object
     * @returns {string} HTML content
     */
    createDetailsContent(restaurant) {
        return `
            <div class="restaurant-details">
                <div class="restaurant-header">
                    <h3>${this.escapeHtml(restaurant.name)}</h3>
                    <div class="restaurant-rating" id="modal-rating-display">
                        <!-- Rating display will be rendered here by RatingDisplay component -->
                    </div>
                </div>
                <div class="restaurant-info">
                    ${restaurant.description ? `
                        <div class="info-section">
                            <h4>Descrição</h4>
                            <p>${this.escapeHtml(restaurant.description)}</p>
                        </div>
                    ` : ''}
                    ${restaurant.cuisine ? `
                        <div class="info-section">
                            <h4>Tipo de Cozinha</h4>
                            <p>${this.escapeHtml(restaurant.cuisine)}</p>
                        </div>
                    ` : ''}
                    ${restaurant.address ? `
                        <div class="info-section">
                            <h4>Endereço</h4>
                            <p>${this.escapeHtml(restaurant.address)}</p>
                        </div>
                    ` : ''}
                    ${restaurant.phone ? `
                        <div class="info-section">
                            <h4>Telefone</h4>
                            <p>${this.escapeHtml(restaurant.phone)}</p>
                        </div>
                    ` : ''}
                    ${restaurant.website ? `
                        <div class="info-section">
                            <h4>Website</h4>
                            <p><a href="${this.escapeHtml(restaurant.website)}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(restaurant.website)}</a></p>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-primary details-modal-close">
                        Fechar
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Create error modal
     * @param {string} title - Error title
     * @param {string} message - Error message
     */
    showErrorModal(title, message) {
        const content = `
            <div class="error-modal">
                <div class="error-icon">⚠️</div>
                <div class="error-message">
                    <p>${this.escapeHtml(message)}</p>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-primary error-modal-close">
                        OK
                    </button>
                </div>
            </div>
        `;

        this.show(content, title);

        // Add event listener to close button
        setTimeout(() => {
            const closeBtn = this.modalContainer.querySelector('.error-modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.close();
                });
            }
        }, 100);
      }

    /**
     * Show success modal
     * @param {string} title - Success title
     * @param {string} message - Success message
     */
    showSuccessModal(title, message) {
        const content = `
            <div class="success-modal">
                <div class="success-icon">✅</div>
                <div class="success-message">
                    <p>${this.escapeHtml(message)}</p>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-primary success-modal-close">
                        OK
                    </button>
                </div>
            </div>
        `;

        this.show(content, title);
        this.addLoadingStyles();

        // Add event listener to close button
        setTimeout(() => {
            const closeBtn = this.modalContainer.querySelector('.success-modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.close();
                });
            }
        }, 100);
    }

    /**
     * Show loading modal
     * @param {string} message - Loading message
     */
    showLoadingModal(message = 'Carregando...') {
        const content = `
            <div class="loading-modal">
                <div class="loading-spinner"></div>
                <div class="loading-message" id="loading-message">
                    <p>${this.escapeHtml(message)}</p>
                </div>
            </div>
        `;

        this.show(content, '');
        this.addLoadingStyles();
    }

    /**
     * Update loading modal message
     * @param {string} message - New loading message
     */
    updateLoadingModal(message) {
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.innerHTML = `<p>${this.escapeHtml(message)}</p>`;
        }
    }

    /**
     * Close modal
     */
    close() {
        try {
            if (!this.modalContainer) return;

            console.log('Closing modal');

            // Hide modal
            this.modalContainer.classList.remove('active');
            this.modalContainer.setAttribute('aria-hidden', 'true');

            setTimeout(() => {
                this.modalContainer.style.display = 'none';
                this.modalBody.innerHTML = '';
            }, 300);

            // Restore body scroll
            document.body.style.overflow = '';

            // Restore focus to previous element
            if (this.previousFocusElement && this.previousFocusElement.focus) {
                this.previousFocusElement.focus();
            }
            this.previousFocusElement = null;

            // Set state
            this.isOpen = false;

            // Call close callback if provided and is a function
            if (this.onCloseCallback && typeof this.onCloseCallback === 'function') {
                this.onCloseCallback();
                this.onCloseCallback = null;
            }

            console.log('Modal closed successfully');
        } catch (error) {
            console.error('Failed to close modal:', error);
        }
    }

    /**
     * Set initial focus when modal opens
     */
    setInitialFocus() {
        // Try to focus the first focusable element
        const focusableElements = this.modalContainer.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    /**
     * Trap focus within modal
     * @param {KeyboardEvent} e - Keyboard event
     */
    trapFocus(e) {
        const focusableElements = this.modalContainer.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    /**
     * Format rating for display
     * @param {number} rating - Rating value
     * @returns {string} Formatted rating
     */
    formatRating(rating) {
        if (!rating || rating === 0) {
            return '<span style="color: var(--text-secondary);">Sem avaliações</span>';
        }

        const roundedRating = Math.round(rating * 10) / 10;
        return `<span style="color: var(--warning-color);">★ ${roundedRating}</span>`;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Add loading spinner styles
     */
    addLoadingStyles() {
        if (document.getElementById('modal-loading-styles')) return;

        const style = document.createElement('style');
        style.id = 'modal-loading-styles';
        style.textContent = `
            .loading-modal {
                text-align: center;
                padding: 2rem;
            }

            .loading-spinner {
                width: 2rem;
                height: 2rem;
                border: 2px solid var(--border-color);
                border-top: 2px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .loading-message {
                color: var(--text-secondary);
            }

            .error-modal {
                text-align: center;
                padding: 2rem;
            }

            .error-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .error-message {
                color: var(--error-color);
                margin-bottom: 1.5rem;
            }

            .success-modal {
                text-align: center;
                padding: 2rem;
            }

            .success-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .success-message {
                color: var(--success-color, #28a745);
                margin-bottom: 1.5rem;
            }

            .modal-form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .form-group {
                display: flex;
                flex-direction: column;
            }

            .form-group label {
                margin-bottom: 0.25rem;
                font-weight: 500;
                color: var(--text-primary);
            }

            .form-group input,
            .form-group textarea {
                padding: 0.5rem;
                border: 1px solid var(--border-color);
                border-radius: 0.25rem;
                font-size: 0.875rem;
            }

            .form-group input:focus,
            .form-group textarea:focus {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
            }

            .form-actions {
                display: flex;
                gap: 0.75rem;
                justify-content: flex-end;
                margin-top: 1rem;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Check if modal is open
     * @returns {boolean} True if modal is open
     */
    isModalOpen() {
        return this.isOpen;
    }

    /**
     * Setup field validation with real-time feedback
     * @param {HTMLFormElement} form - Form element
     * @param {string} fieldId - Field ID
     * @param {string} errorId - Error div ID
     * @param {Function} validator - Validation function
     */
    setupFieldValidation(form, fieldId, errorId, validator) {
        const field = form.querySelector(`#${fieldId}`);
        const errorDiv = form.querySelector(`#${errorId}`);

        if (field && errorDiv) {
            field.addEventListener('input', (e) => {
                const value = e.target.value;
                const error = validator(value);

                if (error) {
                    errorDiv.textContent = error;
                    errorDiv.style.display = 'block';
                    field.style.borderColor = 'var(--error-color)';
                } else {
                    errorDiv.textContent = '';
                    errorDiv.style.display = 'none';
                    field.style.borderColor = 'var(--border-color)';
                }
            });

            field.addEventListener('blur', (e) => {
                const value = e.target.value;
                const error = validator(value);

                if (error && value.length > 0) {
                    errorDiv.textContent = error;
                    errorDiv.style.display = 'block';
                    field.style.borderColor = 'var(--error-color)';
                } else {
                    errorDiv.textContent = '';
                    errorDiv.style.display = 'none';
                    field.style.borderColor = 'var(--border-color)';
                }
            });
        }
    }

    /**
     * Setup price type change handler
     * @param {HTMLFormElement} form - Form element
     */
    setupPriceTypeHandler(form) {
        const priceTypeSelect = form.querySelector('#restaurant-price-type');
        const priceRangeGroup = form.querySelector('#price-range-group');
        const priceKiloGroup = form.querySelector('#price-kilo-group');

        if (priceTypeSelect) {
            priceTypeSelect.addEventListener('change', (e) => {
                const selectedType = e.target.value;

                // Hide all price groups
                priceRangeGroup.style.display = 'none';
                priceKiloGroup.style.display = 'none';

                // Show the relevant price group
                switch (selectedType) {
                    case 'range':
                        priceRangeGroup.style.display = 'block';
                        break;
                    case 'kilo':
                        priceKiloGroup.style.display = 'block';
                        break;
                }
            });
        }
    }

    /**
     * Setup star rating interaction with half stars
     * @param {HTMLFormElement} form - Form element
     */
    setupStarRating(form) {
        const starRating = form.querySelector('.star-rating');
        const qualityInput = form.querySelector('#restaurant-quality');
        const errorDiv = form.querySelector('#quality-error');

        if (starRating && qualityInput) {
            const stars = starRating.querySelectorAll('.star');
            let currentRating = 0;

            stars.forEach((star, index) => {
                const starValue = parseFloat(star.dataset.value);

                star.addEventListener('click', (e) => {
                    const rating = starValue;
                    qualityInput.value = rating;
                    starRating.dataset.rating = rating;
                    currentRating = rating;

                    // Update star display
                    this.updateStarDisplay(starRating, rating);

                    // Clear error if rating is selected
                    if (errorDiv && rating > 0) {
                        errorDiv.textContent = '';
                        errorDiv.style.display = 'none';
                    }
                });

                star.addEventListener('mouseenter', (e) => {
                    const rating = starValue;
                    this.updateStarDisplay(starRating, rating);
                });
            });

            starRating.addEventListener('mouseleave', () => {
                this.updateStarDisplay(starRating, currentRating);
            });

            // Initialize with current rating
            currentRating = parseFloat(starRating.dataset.rating);
            if (currentRating > 0) {
                qualityInput.value = currentRating;
            }
        }
    }

    /**
     * Setup image upload component
     */
    setupImageUploadComponent() {
        console.log('Setting up image upload component...');

        const container = document.getElementById('image-upload-component');
        console.log('Container found:', !!container);

        if (!container) {
            console.error('Image upload container not found');
            return;
        }

        console.log('Container innerHTML before:', container.innerHTML);

        // Simple HTML5 file input
        container.innerHTML = `
            <div style="border: 2px dashed #ccc; padding: 20px; text-align: center; border-radius: 8px; cursor: pointer; background-color: #f9f9f9;"
                 onclick="document.getElementById('restaurant-photos').click()">
                <div style="font-size: 2rem; margin-bottom: 10px;">📷</div>
                <div style="font-weight: 500; margin-bottom: 5px;">Clique para adicionar fotos</div>
                <div style="font-size: 0.875rem; color: #666;">JPG, PNG, WebP • Máx. 2MB cada • Até 4 fotos</div>
                <input type="file"
                       id="restaurant-photos"
                       multiple
                       accept="image/jpeg,image/png,image/webp"
                       style="display: none;"
                       onchange="handleImageUpload(this)">
            </div>
            <div id="selected-images" style="margin-top: 10px;"></div>
        `;

        console.log('Container innerHTML after:', container.innerHTML);

        // Store uploaded images globally
        window.uploadedRestaurantImages = [];

        // Define the handler function globally
        window.handleImageUpload = function(input) {
            console.log('handleImageUpload called with', input.files.length, 'files');

            const files = Array.from(input.files);
            const selectedImagesDiv = document.getElementById('selected-images');

            if (files.length > 0) {
                const formatFileSize = (bytes) => {
                    if (bytes === 0) return '0 Bytes';
                    const k = 1024;
                    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                };

                selectedImagesDiv.innerHTML = `
                    <div style="padding: 8px; background-color: #f0f0f0; border-radius: 4px;">
                        <strong>${files.length} foto(s) selecionada(s):</strong>
                        ${files.map(file => `<div style="font-size: 0.875rem; color: #666; margin: 2px 0;">• ${file.name} (${formatFileSize(file.size)})</div>`).join('')}
                    </div>
                `;

                // Store files for later upload
                window.uploadedRestaurantImages = files;
                console.log('Images stored globally:', window.uploadedRestaurantImages.length);
            }
        };

        console.log('Image upload component setup complete');
    }

    /**
     * Update star display
     * @param {HTMLElement} starRating - Star rating container
     * @param {number} rating - Rating value
     */
    updateStarDisplay(starRating, rating) {
        const stars = starRating.querySelectorAll('.star');
        stars.forEach((star, index) => {
            const starValue = parseFloat(star.dataset.value);
            if (starValue <= rating) {
                star.textContent = '★';
                star.style.color = 'var(--warning-color)';
            } else {
                star.textContent = '☆';
                star.style.color = 'var(--border-color)';
            }
        });
    }

    /**
     * Render photo gallery section
     * @param {Object} restaurant - Restaurant object
     * @param {Array} photos - Array of photo URLs
     * @returns {string} HTML string
     */
    renderPhotoGallery(restaurant, photos) {
        console.log('renderPhotoGallery called with photos:', photos);
        console.log('photos.length:', photos.length);

        if (photos.length === 0) {
            return `
                <div class="photo-gallery no-photos">
                    <div class="no-photos-placeholder">
                        <div class="placeholder-icon">🍽️</div>
                        <p>Sem fotos disponíveis</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="photo-gallery">
                <div class="gallery-main">
                    <div class="main-photo-container">
                        <img
                            src="${photos[0]}"
                            alt="${this.escapeHtml(restaurant.name)}"
                            class="main-photo"
                            id="main-photo"
                            onclick="this.requestFullscreen()"
                        >
                        ${photos.length > 1 ? `
                            <div class="photo-navigation">
                                <button class="nav-btn prev-btn" onclick="modal.prevPhoto()">
                                    ‹
                                </button>
                                <button class="nav-btn next-btn" onclick="modal.nextPhoto()">
                                    ›
                                </button>
                            </div>
                        ` : ''}
                        <div class="photo-counter">
                            <span id="photo-counter">1 / ${photos.length}</span>
                        </div>
                    </div>
                </div>

                ${photos.length > 1 ? `
                    <div class="photo-thumbnails">
                        ${photos.map((photo, index) => `
                            <div class="thumbnail ${index === 0 ? 'active' : ''}"
                                 onclick="modal.selectPhoto(${index})">
                                <img src="${photo}" alt="Foto ${index + 1}">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Extract rating count from restaurant object with intelligent field detection
     * @param {Object} restaurant - Restaurant object
     * @returns {number} Rating count
     */
    extractRatingCount(restaurant) {
        const possibleFields = ['totalRatings', 'totalReviews', 'ratingCount', 'numRatings', 'reviewsCount', 'reviewCount'];
        let reviewCount = 0;

        for (const field of possibleFields) {
            const value = restaurant[field];
            if (value !== undefined && value !== null && value !== 'undefined' && value > 0) {
                reviewCount = value;
                break;
            } else if (value !== undefined && value !== null && value !== 'undefined' && value >= 0) {
                reviewCount = value;
                break;
            }
        }

        return reviewCount;
    }

    /**
     * Format rating count with intelligent field detection
     * @param {Object} restaurant - Restaurant object
     * @returns {string} Formatted rating count text
     */
    formatRatingCount(restaurant) {
        console.log('🔍 MODAL formatRatingCount - Dados recebidos:', {
            name: restaurant.name,
            totalRatings: restaurant.totalRatings,
            totalReviews: restaurant.totalReviews,
            ratingCount: restaurant.ratingCount,
            averageQuality: restaurant.averageQuality,
            averageOverall: restaurant.averageOverall
        });

        // Use same logic as ui-service.js createRestaurantCard
        const possibleFields = ['totalRatings', 'totalReviews', 'ratingCount', 'numRatings', 'reviewsCount', 'reviewCount'];
        let reviewCount = 0;
        let foundField = null;

        for (const field of possibleFields) {
            const value = restaurant[field];
            console.log(`   🔍 Verificando campo "${field}": ${value} (${typeof value})`);

            if (value !== undefined && value !== null && value !== 'undefined' && value > 0) {
                reviewCount = value;
                foundField = field;
                console.log(`   ✅ ENCONTRADO no campo "${field}": ${reviewCount}`);
                break;
            } else if (value !== undefined && value !== null && value !== 'undefined' && value >= 0) {
                reviewCount = value;
                foundField = field;
                console.log(`   ✅ ENCONTRADO (zero permitido) no campo "${field}": ${reviewCount}`);
                break;
            }
        }

        // Final fallback
        if (reviewCount === 0 && restaurant.totalRatings !== undefined) {
            reviewCount = parseInt(restaurant.totalRatings) || 0;
            foundField = 'totalRatings (fallback)';
            console.log(`   ✅ FALLBACK - Parse de totalRatings: ${reviewCount}`);
        }

        const reviewText = reviewCount === 1 ? '1 avaliação' : `${reviewCount} avaliações`;
        const result = `(${reviewText})`;

        console.log(`   📊 RESULTADO FINAL MODAL: campo=${foundField}, count=${reviewCount}, text="${reviewText}"`);

        return result;
    }

    /**
     * Render basic info section
     * @param {Object} restaurant - Restaurant object
     * @returns {string} HTML string
     */
    renderBasicInfo(restaurant) {
        return `
            <div class="basic-info-section">
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-icon">⭐</div>
                        <div class="info-content">
                            <div class="info-label">Avaliação Média</div>
                            <div class="info-value">
                                ${this.renderStarRating(restaurant.averageQuality || 0)}
                                <span class="rating-number">${(restaurant.averageQuality || 0).toFixed(1)}</span>
                                <span class="rating-count">${this.formatRatingCount(restaurant)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="info-item">
                        <div class="info-icon">💰</div>
                        <div class="info-content">
                            <div class="info-label">Preço Médio</div>
                            <div class="info-value">${this.formatPriceDisplay(restaurant)}</div>
                        </div>
                    </div>

                    ${restaurant.vegetarianOptions ? `
                        <div class="info-item">
                            <div class="info-icon">🥬</div>
                            <div class="info-content">
                                <div class="info-label">Opções Vegetarianas</div>
                                <div class="info-value">${this.formatVegetarianOptionsDisplay(restaurant.vegetarianOptions)}</div>
                            </div>
                        </div>
                    ` : ''}

                    <div class="info-item">
                        <div class="info-icon">📍</div>
                        <div class="info-content">
                            <div class="info-label">Localização</div>
                            <div class="info-value">Esplanada dos Ministérios</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render operating hours section
     * @param {Object} restaurant - Restaurant object
     * @returns {string} HTML string
     */
    renderOperatingHours(restaurant) {
        return `
            <div class="hours-section">
                <h3 class="section-title">
                    <span class="title-icon">🕒</span>
                    Horário de Funcionamento
                </h3>
                <div class="hours-content">
                    <div class="current-status" id="current-status">
                        <div class="status-indicator">
                            <div class="status-dot"></div>
                            <span class="status-text">Carregando...</span>
                        </div>
                    </div>
                    ${restaurant.hours ? `
                        <div class="hours-schedule">
                            <div class="hours-row">
                                <span class="hours-label">Horário:</span>
                                <span class="hours-value">${this.escapeHtml(restaurant.hours)}</span>
                            </div>
                        </div>
                    ` : `
                        <div class="no-hours-info">
                            Horário não informado
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    /**
     * Render description section
     * @param {Object} restaurant - Restaurant object
     * @returns {string} HTML string
     */
    renderDescription(restaurant) {
        if (!restaurant.description) {
            return '';
        }

        return `
            <div class="description-section">
                <h3 class="section-title">
                    <span class="title-icon">📝</span>
                    Sobre o Restaurante
                </h3>
                <div class="description-content">
                    <p class="description-text">${this.escapeHtml(restaurant.description)}</p>
                </div>
            </div>
        `;
    }

    /**
     * Render access info section
     * @param {Object} restaurant - Restaurant object
     * @returns {string} HTML string
     */
    renderAccessInfo(restaurant) {
        if (!restaurant.access) {
            return '';
        }

        return `
            <div class="access-section">
                <h3 class="section-title">
                    <span class="title-icon">🚗</span>
                    Como Chegar
                </h3>
                <div class="access-content">
                    <p class="access-text">${this.escapeHtml(restaurant.access)}</p>
                </div>
            </div>
        `;
    }

    /**
     * Render actions section
     * @param {Object} restaurant - Restaurant object
     * @returns {string} HTML string
     */
    renderActions(restaurant) {
        return `
            <div class="actions-section">
                <button class="btn btn-primary btn-large rate-btn" id="rate-btn">
                    <span class="btn-icon">⭐</span>
                    Avaliar Restaurante
                </button>
                <div class="secondary-actions">
                    <button class="btn btn-secondary share-btn" id="share-btn">
                        <span class="btn-icon">📤</span>
                        Compartilhar
                    </button>
                    <button class="btn btn-secondary favorite-btn" id="favorite-btn">
                        <span class="btn-icon">❤️</span>
                        Favoritar
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Initialize restaurant detail modal components
     * @param {Object} restaurant - Restaurant object
     */
    initializeRestaurantDetailModal(restaurant) {
        // Store modal reference globally for onclick handlers
        window.modal = {
            restaurant: restaurant,
            currentPhotoIndex: 0,
            photos: restaurant.photoUrls || [],
            prevPhoto: () => this.prevPhoto(),
            nextPhoto: () => this.nextPhoto(),
            selectPhoto: (index) => this.selectPhoto(index)
        };

        // Setup operating status updates
        this.updateOperatingStatus();

        // Setup action buttons
        this.setupActionButtons(restaurant);

        // Setup keyboard navigation
        this.setupKeyboardNavigation();

        // Setup swipe gestures for mobile
        this.setupSwipeGestures();

        // Start status updates interval
        this.startStatusUpdates();

        // Load images and add loaded class for fade-in effect
        this.loadModalImages();

        console.log('Restaurant detail modal initialized');
    }

    /**
     * Load images in modal and add loaded class for fade-in effect
     */
    loadModalImages() {
        // Find all images in the photo gallery
        const photoImages = this.modalContainer.querySelectorAll('.main-photo, .thumbnail img');

        photoImages.forEach(img => {
            // If image is already loaded
            if (img.complete && img.naturalHeight !== 0) {
                img.classList.add('loaded');
                console.log('Image already loaded:', img.src);
            } else {
                // Add load event listener
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                    console.log('Image loaded successfully:', img.src);
                });

                // Add error event listener
                img.addEventListener('error', () => {
                    console.error('Failed to load image:', img.src);
                    // You could add a fallback image or error state here
                });
            }
        });
    }

    /**
     * Setup action buttons
     * @param {Object} restaurant - Restaurant object
     */
    setupActionButtons(restaurant) {
        const rateBtn = document.getElementById('rate-btn');
        const shareBtn = document.getElementById('share-btn');
        const favoriteBtn = document.getElementById('favorite-btn');

        if (rateBtn) {
            rateBtn.addEventListener('click', () => this.handleRateClick(restaurant));
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.handleShareClick(restaurant));
        }

        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => this.handleFavoriteClick());
        }
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        const handleKeyDown = (e) => {
            if (!window.modal) return;

            switch (e.key) {
                case 'ArrowLeft':
                    this.prevPhoto();
                    break;
                case 'ArrowRight':
                    this.nextPhoto();
                    break;
                case 'Escape':
                    this.close();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        this.keyboardHandler = handleKeyDown;
    }

    /**
     * Setup swipe gestures for mobile
     */
    setupSwipeGestures() {
        const gallery = document.querySelector('.photo-gallery');
        if (!gallery) return;

        let touchStartX = 0;
        let touchEndX = 0;

        gallery.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        gallery.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    }

    /**
     * Handle swipe gesture
     * @param {number} startX - Starting X position
     * @param {number} endX - Ending X position
     */
    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextPhoto(); // Swipe left, next photo
            } else {
                this.prevPhoto(); // Swipe right, previous photo
            }
        }
    }

    /**
     * Start status updates
     */
    startStatusUpdates() {
        // Update status immediately
        this.updateOperatingStatus();

        // Update every minute
        this.statusInterval = setInterval(() => {
            this.updateOperatingStatus();
        }, 60000);
    }

    /**
     * Update operating status
     */
    updateOperatingStatus() {
        const statusElement = document.getElementById('current-status');
        if (!statusElement || !window.modal) return;

        const restaurant = window.modal.restaurant;
        const status = this.getOperatingStatus(restaurant);
        statusElement.innerHTML = this.renderOperatingStatus(status);
    }

    /**
     * Get operating status for restaurant
     * @param {Object} restaurant - Restaurant object
     * @returns {Object} Operating status
     */
    getOperatingStatus(restaurant) {
        if (!restaurant.hours) {
            return { status: 'unknown', text: 'Horário não informado' };
        }

        const now = new Date();
        const currentTime = now.getHours() * 100 + now.getMinutes();

        // Simple hours parsing
        const hoursText = restaurant.hours.toLowerCase();
        const isOpen = this.parseHours(hoursText, currentTime);

        return {
            status: isOpen ? 'open' : 'closed',
            text: isOpen ? 'Aberto agora' : 'Fechado agora',
            nextChange: this.getNextChangeTime(hoursText, currentTime)
        };
    }

    /**
     * Parse hours text to determine if open
     * @param {string} hoursText - Hours text
     * @param {number} currentTime - Current time in HHMM format
     * @returns {boolean} True if open
     */
    parseHours(hoursText, currentTime) {
        // Check for 24h
        if (hoursText.includes('24h') || hoursText.includes('24 horas')) {
            return true;
        }

        // Look for patterns like "11h-23h"
        const hourMatch = hoursText.match(/(\d+)h\s*-\s*(\d+)h/);
        if (hourMatch) {
            const openTime = parseInt(hourMatch[1]) * 100;
            const closeTime = parseInt(hourMatch[2]) * 100;
            return currentTime >= openTime && currentTime <= closeTime;
        }

        return false;
    }

    /**
     * Get next change time
     * @param {string} hoursText - Hours text
     * @param {number} currentTime - Current time
     * @returns {string|null} Next change time
     */
    getNextChangeTime(hoursText, currentTime) {
        // Simplified - return null for now
        return null;
    }

    /**
     * Render operating status
     * @param {Object} status - Status object
     * @returns {string} HTML string
     */
    renderOperatingStatus(status) {
        const statusClass = `status-${status.status}`;
        const icon = status.status === 'open' ? '🟢' : '🔴';

        let nextChangeText = '';
        if (status.nextChange) {
            nextChangeText = `<div class="next-change">Fecha às ${status.nextChange}</div>`;
        }

        return `
            <div class="status-indicator ${statusClass}">
                <div class="status-dot"></div>
                <div class="status-info">
                    <span class="status-text">${icon} ${status.text}</span>
                    ${nextChangeText}
                </div>
            </div>
        `;
    }

    /**
     * Navigate to previous photo
     */
    prevPhoto() {
        if (!window.modal || window.modal.photos.length <= 1) return;

        window.modal.currentPhotoIndex = (window.modal.currentPhotoIndex - 1 + window.modal.photos.length) % window.modal.photos.length;
        this.updatePhotoDisplay();
    }

    /**
     * Navigate to next photo
     */
    nextPhoto() {
        if (!window.modal || window.modal.photos.length <= 1) return;

        window.modal.currentPhotoIndex = (window.modal.currentPhotoIndex + 1) % window.modal.photos.length;
        this.updatePhotoDisplay();
    }

    /**
     * Select specific photo
     * @param {number} index - Photo index
     */
    selectPhoto(index) {
        if (!window.modal || index < 0 || index >= window.modal.photos.length) return;

        window.modal.currentPhotoIndex = index;
        this.updatePhotoDisplay();
    }

    /**
     * Update photo display
     */
    updatePhotoDisplay() {
        if (!window.modal) return;

        const photos = window.modal.photos;
        const currentIndex = window.modal.currentPhotoIndex;
        const mainPhoto = document.getElementById('main-photo');
        const photoCounter = document.getElementById('photo-counter');
        const thumbnails = document.querySelectorAll('.thumbnail');

        if (mainPhoto) {
            mainPhoto.src = photos[currentIndex];
            mainPhoto.classList.remove('loaded');
        }

        if (photoCounter) {
            photoCounter.textContent = `${currentIndex + 1} / ${photos.length}`;
        }

        // Update thumbnail selection
        thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === currentIndex);
        });
    }

    /**
     * Handle rate button click
     * @param {Object} restaurant - Restaurant object
     */
    async handleRateClick(restaurant) {
        try {
            console.log('🎯 STARTING RATING PROCESS for restaurant:', restaurant.name);
            console.log('📊 Restaurant data received:', {
                id: restaurant.id,
                name: restaurant.name,
                averageQuality: restaurant.averageQuality,
                totalRatings: restaurant.totalRatings,
                photoUrls: restaurant.photoUrls
            });

            // Create rating form
            console.log('🔧 Creating RatingForm...');
            const ratingForm = new RatingForm(restaurant, this, this.identificationService);
            console.log('✅ RatingForm created successfully');

            // Show rating form (handles user identification internally)
            console.log('🎭 Showing rating form...');
            const result = await ratingForm.show();
            console.log('📋 Rating form result:', result);

            if (result && result.success) {
                console.log('Rating submitted successfully:', result);

                // Show success notification
                this.showNotification(
                    `Avaliação de ${result.rating} estrela${result.rating > 1 ? 's' : ''} enviada para ${restaurant.name}!`,
                    'success'
                );

                // Update restaurant display (refresh data)
                this.refreshRestaurantData(restaurant);

            } else {
                console.log('Rating was cancelled or failed');
            }

        } catch (error) {
            console.error('Failed to handle rate click:', error);
            this.showNotification('Erro ao processar avaliação: ' + error.message, 'error');
        }
    }

    /**
     * Refresh restaurant data after rating
     * @param {Object} restaurant - Restaurant that was rated
     */
    refreshRestaurantData(restaurant) {
        // Dispatch custom event to notify restaurant update
        const event = new CustomEvent('restaurantRated', {
            detail: {
                restaurantId: restaurant.id || restaurant.name,
                restaurantName: restaurant.name
            }
        });
        document.dispatchEvent(event);

        // Refresh the restaurant list if possible
        if (window.app && window.app.loadRestaurants) {
            setTimeout(() => {
                window.app.loadRestaurants();
            }, 1000);
        }
    }

    /**
     * Require user identification before proceeding with an action
     * @returns {Promise<Object|null>} User identification data or null if cancelled
     */
    async requireUserIdentification() {
        try {
            console.log('Requiring user identification...');

            // Check if user is already identified
            if (this.identificationService.isUserIdentified()) {
                const userData = this.identificationService.getUserData();
                console.log('User already identified:', userData.userName);
                return userData;
            }

            // Initialize identification process
            const initResult = await this.identificationService.initializeUserIdentification();

            if (!initResult.needsIdentification) {
                // User was already identified
                return initResult;
            }

            // Show identification modal
            const identificationResult = await this.showUserIdentificationModal(initResult.fingerprintData);

            if (identificationResult) {
                console.log('User identification completed:', identificationResult.userName);
                return identificationResult;
            } else {
                console.log('User cancelled identification');
                return null;
            }

        } catch (error) {
            console.error('Failed to require user identification:', error);
            this.showErrorModal('Erro na Identificação', 'Não foi possível verificar sua identificação. Tente novamente.');
            return null;
        }
    }

    /**
     * Show user identification modal
     * @param {Object} fingerprintData - Pre-generated fingerprint data
     * @returns {Promise<Object|null>} User identification result
     */
    async showUserIdentificationModal(fingerprintData) {
        return new Promise((resolve) => {
            // Show the identification modal using the UserIdentificationModal component
            this.identificationModal.show(fingerprintData)
                .then((result) => {
                    if (result) {
                        // Identification completed successfully
                        console.log('User identified successfully:', result);
                        resolve(result);
                    } else {
                        // User cancelled identification
                        resolve(null);
                    }
                })
                .catch((error) => {
                    console.error('User identification failed:', error);
                    this.showErrorModal('Erro na Identificação', error.message || 'Falha na identificação do usuário');
                    resolve(null);
                });
        });
    }

    /**
     * Get current user information
     * @returns {Object|null} Current user data or null if not identified
     */
    getCurrentUser() {
        if (!this.identificationService.isUserIdentified()) {
            return null;
        }

        return this.identificationService.getIdentificationSummary();
    }

    /**
     * Check if current user can perform an action
     * @param {string} action - Action to validate
     * @param {Object} context - Additional context for validation
     * @returns {boolean} True if action is allowed
     */
    canUserPerformAction(action, context = {}) {
        const validation = this.identificationService.validateUserAction(action, context);
        return validation.allowed;
    }

    /**
     * Show notification message
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (info, success, error, warning)
     */
    showNotification(message, type = 'info') {
        // Create notification container if it doesn't exist
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            pointer-events: auto;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;

        // Add to container
        container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    /**
     * Get notification color based on type
     * @param {string} type - Notification type
     * @returns {string} Color value
     */
    getNotificationColor(type) {
        const colors = {
            info: '#17a2b8',
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107'
        };
        return colors[type] || colors.info;
    }

    /**
     * Handle share button click
     * @param {Object} restaurant - Restaurant object
     */
    handleShareClick(restaurant) {
        if (navigator.share) {
            navigator.share({
                title: restaurant.name,
                text: `Confira este restaurante na Esplanada dos Ministérios!`,
                url: window.location.href
            });
        } else {
            // Fallback - copy to clipboard
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                this.showNotification('Link copiado para a área de transferência', 'success');
            });
        }
    }

    /**
     * Handle favorite button click
     */
    handleFavoriteClick() {
        const favoriteBtn = document.getElementById('favorite-btn');
        const isFavorited = favoriteBtn.classList.contains('favorited');

        if (isFavorited) {
            favoriteBtn.classList.remove('favorited');
            favoriteBtn.innerHTML = '<span class="btn-icon">❤️</span> Favoritar';
            this.showNotification('Removido dos favoritos', 'info');
        } else {
            favoriteBtn.classList.add('favorited');
            favoriteBtn.innerHTML = '<span class="btn-icon">❤️</span> Favoritado';
            this.showNotification('Adicionado aos favoritos', 'success');
        }
    }

    /**
     * Render star rating
     * @param {number} rating - Rating value
     * @returns {string} HTML string
     */
    renderStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);

        let stars = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<span class="star star-full">★</span>';
        }

        // Half star
        if (hasHalfStar) {
            stars += '<span class="star star-half">★</span>';
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<span class="star star-empty">☆</span>';
        }

        return `<div class="star-rating">${stars}</div>`;
    }

    /**
     * Format price display
     * @param {Object} restaurant - Restaurant object
     * @returns {string} Formatted price
     */
    formatPriceDisplay(restaurant) {
        if (!restaurant) return 'Não informado';

        const { price, priceType, priceKilo } = restaurant;

        if (!price || price === 0) {
            return 'Não informado';
        }

        // Handle price by kilo - show actual kilo price
        if (priceType === 'kilo' && priceKilo) {
            return `R$ ${priceKilo.toFixed(2).replace('.', ',')}/kg`;
        }

        // Handle price by range (à la carte) - show money bag scale
        if (priceType === 'range') {
            const priceRanges = {
                1: '$ - Muito barato',
                2: '$$ - Barato',
                3: '$$$ - Médio',
                4: '$$$$ - Caro',
                5: '$$$$$ - Luxo'
            };
            return priceRanges[price] || '$$$ - Médio';
        }

        // Legacy format - handle 1-5 scale
        if (price <= 5) {
            const priceRanges = {
                1: '$ - Muito barato',
                2: '$$ - Barato',
                3: '$$$ - Médio',
                4: '$$$$ - Caro',
                5: '$$$$$ - Luxo'
            };
            return priceRanges[price] || '$$$ - Médio';
        }

        // Handle actual price values (fallback)
        if (price <= 20) return '$ - Muito barato';
        if (price <= 50) return '$$ - Barato';
        if (price <= 100) return '$$$ - Médio';
        return '$$$$ - Caro';
    }

    /**
     * Format vegetarian options for modal display
     * @param {string} vegetarianOptions - Vegetarian options value
     * @returns {string} Formatted vegetarian options with lettuce icons
     */
    formatVegetarianOptionsDisplay(vegetarianOptions) {
        const options = {
            'none': { text: 'Não possui opções', icon: '🚫' },
            'few': { text: 'Poucas opções', icon: '🥬' },
            'moderate': { text: 'Quantidade moderada', icon: '🥬🥬' },
            'many': { text: 'Muitas opções', icon: '🥬🥬🥬' },
            'exclusive': { text: 'Especializado em vegetariano', icon: '🥬🥬🥬🥬🥬' }
        };

        const option = options[vegetarianOptions] || { text: 'Não informado', icon: '❓' };
        return `${option.icon} ${option.text}`;
    }

    /**
     * Clean up resources
     */
    cleanup() {
        // Clear status update interval
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }

        // Remove keyboard event listener
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
            this.keyboardHandler = null;
        }

        // Clear global modal reference
        if (window.modal) {
            window.modal = null;
        }

        // Clear uploaded images
        if (window.uploadedRestaurantImages) {
            window.uploadedRestaurantImages = [];
        }

        this.close();
        console.log('ModalService cleaned up');
    }

    /**
     * Pre-process images to ensure they meet size requirements
     * @param {Array<File>} files - Array of image files
     * @returns {Promise<Array<File>>} Array of processed image files
     */
    async preProcessImages(files) {
        const processedFiles = [];
        const maxSize = 2 * 1024 * 1024; // 2MB
        const maxWidth = 1920;
        const maxHeight = 1080;
        const quality = 0.85;

        for (const file of files) {
            try {
                console.log(`Processing image: ${file.name} (${this.formatFileSize(file.size)})`);

                // If file is already within size limits, use as-is
                if (file.size <= maxSize) {
                    processedFiles.push(file);
                    continue;
                }

                console.log(`Image too large, resizing: ${file.name}`);

                // Resize and compress the image
                const processedFile = await this.resizeImage(file, maxWidth, maxHeight, quality);
                console.log(`Resized ${file.name} from ${this.formatFileSize(file.size)} to ${this.formatFileSize(processedFile.size)}`);

                processedFiles.push(processedFile);

            } catch (error) {
                console.error(`Failed to process image ${file.name}:`, error);
                // Try to use original file as fallback
                if (file.size <= maxSize * 1.5) { // Allow slightly larger files as fallback
                    processedFiles.push(file);
                } else {
                    throw new Error(`Imagem ${file.name} é muito grande e não pôde ser processada. Tente uma imagem menor.`);
                }
            }
        }

        return processedFiles;
    }

    /**
     * Resize an image to fit within specified dimensions
     * @param {File} file - Original image file
     * @param {number} maxWidth - Maximum width
     * @param {number} maxHeight - Maximum height
     * @param {number} quality - JPEG quality (0-1)
     * @returns {Promise<File>} Resized image file
     */
    async resizeImage(file, maxWidth, maxHeight, quality) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                try {
                    // Calculate new dimensions
                    let { width, height } = this.calculateDimensions(
                        img.width,
                        img.height,
                        maxWidth,
                        maxHeight
                    );

                    canvas.width = width;
                    canvas.height = height;

                    // Draw and compress image
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Failed to process image'));
                                return;
                            }

                            // Create processed file
                            const processedFile = new File(
                                [blob],
                                file.name,
                                {
                                    type: 'image/jpeg',
                                    lastModified: Date.now()
                                }
                            );

                            resolve(processedFile);
                        },
                        'image/jpeg',
                        quality
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

    /**
     * Calculate dimensions maintaining aspect ratio
     * @param {number} width - Original width
     * @param {number} height - Original height
     * @param {number} maxWidth - Maximum width
     * @param {number} maxHeight - Maximum height
     * @returns {Object} Calculated dimensions
     */
    calculateDimensions(width, height, maxWidth, maxHeight) {
        let newWidth = width;
        let newHeight = height;

        // Scale down if necessary
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            newWidth = Math.round(width * ratio);
            newHeight = Math.round(height * ratio);
        }

        return { width: newWidth, height: newHeight };
    }

    /**
     * Format file size for display
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Make ModalService available globally for button onclick handlers
if (typeof window !== 'undefined') {
    window.modalService = null;
}