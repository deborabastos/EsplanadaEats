// js/components/rating-form.js - Interactive restaurant rating form component

import { RatingValidationService } from '../services/rating-validation-service.js?v=1.0.1';
import { StorageService } from '../services/storage-service.js?v=1.0.1';

/**
 * Rating Form - Handles restaurant rating interface with interactive stars
 */
export class RatingForm {
    constructor(restaurant, modalService, identificationService) {
        this.restaurant = restaurant;
        this.modalService = modalService;
        this.identificationService = identificationService;
        this.rating = 0;
        this.isSubmitting = false;
        this.currentUser = null;
        this.realtimeUnsubscribe = null;

        // Initialize core services
        this.storageService = new StorageService(window.EsplanadaEatsFirebase.firebase);
        this.validationService = new RatingValidationService(this.storageService);

        // Initialize calculation and realtime services (will be loaded async)
        this.calculationService = null;
        this.realtimeService = null;
        this.offlineService = null;
        this.initializeAdvancedServices();

        console.log('RatingForm initialized for restaurant:', restaurant.name);
        console.log('Validation service initialized for rating validation');
    }

    /**
     * Initialize advanced calculation and realtime services
     */
    async initializeAdvancedServices() {
        try {
            // Import advanced services
            const { RatingCalculationService } = await import('../services/rating-calculation-service.js?v=1.0.1');
            const { RealtimeRatingService } = await import('../services/realtime-rating-service.js?v=1.0.1');

            // Initialize core services
            this.calculationService = new RatingCalculationService(this.storageService);
            this.realtimeService = new RealtimeRatingService(this.storageService, this.calculationService);

            // Initialize offline service (optional, may fail if IndexedDB not available)
            try {
                const { OfflineRatingService } = await import('../services/offline-rating-service.js?v=1.0.1');
                this.offlineService = new OfflineRatingService(this.calculationService, this.storageService);
                console.log('Offline rating service initialized');
            } catch (offlineError) {
                console.warn('Failed to initialize offline service:', offlineError);
                this.offlineService = null;
            }

            // Setup real-time updates for this restaurant
            this.setupRealtimeUpdates();

            console.log('Advanced rating services initialized successfully');
        } catch (error) {
            console.error('Error initializing advanced services:', error);
        }
    }

    /**
     * Setup real-time rating updates
     */
    setupRealtimeUpdates() {
        if (!this.realtimeService || !this.restaurant) return;

        // Subscribe to rating updates for this restaurant
        this.realtimeUnsubscribe = this.realtimeService.subscribeToRestaurantUpdates(
            this.restaurant.id,
            this.handleRatingUpdate.bind(this)
        );

        console.log(`Setup real-time updates for restaurant ${this.restaurant.id}`);
    }

    /**
     * Handle real-time rating updates
     * @param {Object} calculation - Updated calculation result
     */
    handleRatingUpdate(calculation) {
        console.log('Received real-time rating update:', calculation);

        // Update the rating display in the modal if it's still open
        this.updateRatingDisplay(calculation);

        // Dispatch custom event for other components
        const event = new CustomEvent('ratingUpdated', {
            detail: {
                restaurantId: this.restaurant.id,
                calculation: calculation
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Update rating display in the modal
     * @param {Object} calculation - Rating calculation result
     */
    updateRatingDisplay(calculation) {
        const ratingDisplay = document.querySelector('.rating-display-current');
        if (ratingDisplay) {
            // Show offline indicator if calculation is from offline cache
            const isOffline = calculation.isOffline || false;
            const offlineIndicator = isOffline ? ' <span class="offline-indicator" title="Dados offline">📴</span>' : '';

            ratingDisplay.innerHTML = this.renderRatingStars(calculation.averageQuality, calculation.totalRatings) + offlineIndicator;
        }
    }

    /**
     * Render rating stars with statistics
     * @param {number} average - Average rating
     * @param {number} total - Total number of ratings
     * @returns {string} HTML string
     */
    renderRatingStars(average, total) {
        if (total === 0) {
            return '<div class="no-ratings">Sem avaliações ainda</div>';
        }

        const fullStars = Math.floor(average);
        const hasHalfStar = average % 1 >= 0.5;
        let starsHtml = '';

        // Render filled stars
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<span class="star filled">★</span>';
        }

        // Render half star if needed
        if (hasHalfStar) {
            starsHtml += '<span class="star half">☆</span>';
        }

        // Render empty stars
        const emptyStars = 5 - Math.ceil(average);
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<span class="star empty">☆</span>';
        }

        return `
            <div class="rating-summary">
                <div class="rating-stars">${starsHtml}</div>
                <div class="rating-info">
                    <span class="rating-value">${average.toFixed(1)}</span>
                    <span class="rating-count">(${total} avaliação${total !== 1 ? 'ões' : ''})</span>
                </div>
            </div>
        `;
    }

    /**
     * Show rating modal
     * @returns {Promise<Object>} Rating submission result
     */
    async show() {
        try {
            // Ensure user is identified
            if (!this.identificationService.isUserIdentified()) {
                const identifiedUser = await this.modalService.requireUserIdentification();
                if (!identifiedUser) {
                    throw new Error('É necessário se identificar para avaliar um restaurante');
                }
            }

            this.currentUser = this.identificationService.getUserData();
            console.log('User identified for rating:', this.currentUser.userName);

            // Show rating modal
            return new Promise((resolve, reject) => {
                this.resolvePromise = resolve;
                this.rejectPromise = reject;

                const content = this.renderRatingModal();
                this.modalService.show(content, `Avaliar: ${this.restaurant.name}`);

                // Initialize modal components
                setTimeout(() => {
                    this.initializeRatingModal();
                }, 100);
            });

        } catch (error) {
            console.error('Failed to show rating form:', error);
            throw error;
        }
    }

    /**
     * Render rating modal HTML
     * @returns {string} HTML content
     */
    renderRatingModal() {
        return `
            <div class="rating-form-container">
                <div class="rating-restaurant-info">
                    <div class="restaurant-avatar">
                        <img src="${this.getRestaurantImage()}" alt="${this.escapeHtml(this.restaurant.name)}"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAyMEMzNy4yNzQgMjAgNDMgMjUuNzI2IDQzIDMzQzQzIDQwLjI3NCAzNy4yNzQgNDYgMzAgNDZDMjIuNzI2IDQ2IDE3IDQwLjI3NCAxNyAzM0MxNyAyNS43MjYgMjIuNzI2IDIwIDMwIDIwWiIgZmlsbD0iI0QxRDVEQiIvPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjMwIiByPSIzIiBmaWxsPSIjOUNBM0FGIi8+CjxjaXJjbGUgY3g9IjM2IiBjeT0iMzAiIHI9IjMiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI0IDM5SDM2VjQxSDI0VjM5WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'">
                    </div>
                    <div class="restaurant-details">
                        <h3 class="restaurant-name">${this.escapeHtml(this.restaurant.name)}</h3>
                        <p class="rating-instruction">Selecione de 1 a 5 estrelas para avaliar a qualidade</p>
                        <div class="user-info">
                            <span class="user-label">Avaliando como:</span>
                            <span class="user-name" id="current-user-name">${this.escapeHtml(this.currentUser?.userName || 'Visitante')}</span>
                            <button type="button" class="btn-change-user" id="change-user-btn" title="Alterar usuário">
                                <span class="change-user-icon">👤</span>
                                <span class="change-user-text">Não é ${this.escapeHtml(this.currentUser?.userName || 'este usuário')}?</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Current rating display -->
                <div class="current-rating-section">
                    <h4 class="section-title">Avaliação Atual</h4>
                    <div class="rating-display-current" id="rating-display-current">
                        ${this.renderRatingStars(this.restaurant.averageQuality || 0, this.restaurant.totalRatings || 0)}
                    </div>
                </div>

                <div class="rating-stars-container">
                    <div class="rating-stars" data-rating="0">
                        ${this.renderStars()}
                    </div>
                    <div class="rating-feedback" id="rating-feedback">
                        <span class="rating-emoji"></span>
                        <span class="rating-label"></span>
                    </div>
                </div>

                <form class="rating-form" id="rating-form">
                    <input type="hidden" name="restaurantId" value="${this.restaurant.id || this.restaurant.name}">
                    <input type="hidden" name="rating" id="rating-value" value="0">
                    <input type="hidden" name="userId" value="${this.currentUser?.userId || ''}">
                    <input type="hidden" name="userName" value="${this.currentUser?.userName || ''}">

                    <div class="rating-actions">
                        <button type="button" class="btn btn-secondary" id="cancel-rating-btn">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary" id="submit-rating-btn" disabled>
                            <span class="btn-text">Enviar Avaliação</span>
                            <span class="btn-loading" style="display: none;">
                                <span class="loading-spinner"></span>
                                Enviando...
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * Render star rating HTML
     * @returns {string} Stars HTML
     */
    renderStars() {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `
                <button
                    type="button"
                    class="rating-star"
                    data-rating="${i}"
                    aria-label="Avaliar com ${i} estrela${i > 1 ? 's' : ''}"
                    tabindex="0"
                >
                    <span class="star-icon">☆</span>
                </button>
            `;
        }
        return stars;
    }

    /**
     * Initialize rating modal components and event listeners
     */
    initializeRatingModal() {
        console.log('🔧 DEBUG: initializeRatingModal() called');

        // Debug: Check if modal content is actually in the DOM
        setTimeout(() => {
            console.log('🔧 DEBUG: Checking DOM elements after timeout...');

            // Check if our key elements exist
            const ratingForm = document.querySelector('.rating-form-container');
            const starsContainer = document.querySelector('.rating-stars');
            const submitBtn = document.getElementById('submit-rating-btn');
            const ratingValue = document.getElementById('rating-value');

            console.log('🔧 DEBUG: DOM Elements Status:', {
                ratingForm: !!ratingForm,
                starsContainer: !!starsContainer,
                submitBtn: !!submitBtn,
                ratingValue: !!ratingValue
            });

            if (!ratingForm) {
                console.error('❌ ERROR: Rating form container not found in DOM!');
                console.log('🔧 DEBUG: Modal content structure:');
                const modalContent = document.getElementById('mock-modal-content');
                if (modalContent) {
                    console.log('Mock modal content found:', modalContent.innerHTML.substring(0, 500) + '...');
                } else {
                    console.log('No mock-modal-content found');
                }
            }

            // Check ALL elements that might contain stars
            console.log('🔧 DEBUG: Looking for ANY star-related elements:');
            document.querySelectorAll('[class*="star"], [class*="rating"]').forEach((el, i) => {
                console.log(`   ${i}: ${el.tagName}."${el.className}" - ${el.textContent.trim().substring(0, 20)}`);
            });

            // Specifically check if our buttons are actual buttons
            const starButtons = document.querySelectorAll('.rating-star');
            console.log(`🔧 DEBUG: Found ${starButtons.length} .rating-star elements:`);
            starButtons.forEach((star, i) => {
                const rect = star.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(star);
                console.log(`   Star ${i}:`, {
                    tagName: star.tagName,
                    type: star.type,
                    className: star.className,
                    dataset: star.dataset,
                    hasClickListener: star.onclick !== null || star.addEventListener !== undefined,
                    computedStyle: {
                        pointerEvents: computedStyle.pointerEvents,
                        display: computedStyle.display,
                        visibility: computedStyle.visibility,
                        zIndex: computedStyle.zIndex,
                        position: computedStyle.position
                    },
                    position: {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                    },
                    textContent: star.textContent.trim(),
                    innerHTML: star.innerHTML,
                    isVisible: rect.width > 0 && rect.height > 0 && computedStyle.visibility !== 'hidden'
                });
            });

            // Check if anything is overlapping the stars
            if (starButtons.length > 0) {
                const firstStar = starButtons[0];
                const rect = firstStar.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                console.log(`🔧 DEBUG: Checking elements at star position (${centerX}, ${centerY}):`);
                const elementAtPoint = document.elementFromPoint(centerX, centerY);
                console.log(`   Element at star center:`, elementAtPoint ? `${elementAtPoint.tagName}."${elementAtPoint.className}"` : 'none');

                if (elementAtPoint && !elementAtPoint.classList.contains('rating-star')) {
                    console.warn('⚠️ WARNING: Another element is overlapping the star!');
                    console.log('   Overlapping element:', {
                        tagName: elementAtPoint.tagName,
                        className: elementAtPoint.className,
                        zIndex: window.getComputedStyle(elementAtPoint).zIndex
                    });
                }
            }
        }, 100);

        // Setup star rating interactions
        console.log('🔧 DEBUG: About to call setupStarInteractions()');
        this.setupStarInteractions();

        // Setup form submission
        console.log('🔧 DEBUG: About to call setupFormSubmission()');
        this.setupFormSubmission();

        // Setup action buttons
        console.log('🔧 DEBUG: About to call setupActionButtons()');
        this.setupActionButtons();

        // Setup keyboard navigation
        console.log('🔧 DEBUG: About to call setupKeyboardNavigation()');
        this.setupKeyboardNavigation();

        console.log('✅ DEBUG: Rating modal initialization completed');
    }

    /**
     * Setup star rating interactions
     */
    setupStarInteractions() {
        console.log('🔧 DEBUG: setupStarInteractions() called');

        // Look for the interactive stars container (the one with buttons, not the display one)
        const starsContainer = document.querySelector('.rating-stars-container .rating-stars');
        console.log('🔧 DEBUG: interactive starsContainer found:', !!starsContainer);

        if (!starsContainer) {
            console.error('❌ ERROR: .rating-stars container not found in DOM!');
            console.log('🔧 DEBUG: Available elements with class containing "rating":');
            document.querySelectorAll('[class*="rating"]').forEach((el, i) => {
                console.log(`   ${i}: ${el.tagName}."${el.className}"`);
            });
            return;
        }

        const stars = starsContainer.querySelectorAll('.rating-star');
        console.log(`🔧 DEBUG: Found ${stars.length} star elements`);

        if (stars.length === 0) {
            console.error('❌ ERROR: No .rating-star elements found!');
            console.log('🔧 DEBUG: Container HTML content:');
            console.log(starsContainer.innerHTML.substring(0, 200) + '...');

            console.log('🔧 DEBUG: Container children:');
            Array.from(starsContainer.children).forEach((child, i) => {
                console.log(`   ${i}: ${child.tagName}."${child.className}" - ${child.textContent.trim()}`);
            });
            return;
        }

        stars.forEach((star, index) => {
            const rating = parseInt(star.dataset.rating);
            console.log(`🔧 DEBUG: Setting up star ${index + 1} with rating ${rating}`);

            // Check if star has required attributes
            console.log(`🔧 DEBUG: Star ${index + 1} attributes:`, {
                tagName: star.tagName,
                className: star.className,
                dataset: star.dataset,
                hasClick: star.onclick !== null,
                textContent: star.textContent.trim()
            });

            // Click to set rating
            star.addEventListener('click', (e) => {
                console.log(`🖱️ DEBUG: Star ${rating} clicked!`);
                e.preventDefault();
                e.stopPropagation();
                this.setRating(rating);
            });

            // Hover effects
            star.addEventListener('mouseenter', () => {
                console.log(`🖱️ DEBUG: Star ${rating} hover entered`);
                this.highlightStars(rating);
                this.showHoverFeedback(rating);
            });

            // Keyboard support
            star.addEventListener('keydown', (e) => {
                console.log(`⌨️ DEBUG: Star ${rating} keydown: ${e.key}`);
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.setRating(rating);
                }
            });
        });

        // Reset hover on mouse leave
        starsContainer.addEventListener('mouseleave', () => {
            console.log('🖱️ DEBUG: Mouse left stars container');
            this.highlightStars(this.rating);
            this.updateRatingFeedback();
        });

        console.log('✅ DEBUG: Star interactions setup completed');
    }

    /**
     * Setup form submission handling
     */
    setupFormSubmission() {
        const form = document.getElementById('rating-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitRating();
        });
    }

    /**
     * Setup action button handlers
     */
    setupActionButtons() {
        // Cancel button
        const cancelBtn = document.getElementById('cancel-rating-btn');
        cancelBtn.addEventListener('click', () => {
            this.closeModal();
        });

        // Change user button
        const changeUserBtn = document.getElementById('change-user-btn');
        if (changeUserBtn) {
            changeUserBtn.addEventListener('click', () => {
                this.handleChangeUser();
            });
        }
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        const handleKeyDown = (e) => {
            switch (e.key) {
                case 'Escape':
                    this.closeModal();
                    break;
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.navigateStars(e.key === 'ArrowRight' ? 1 : -1);
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        this.keyboardHandler = handleKeyDown;
    }

    /**
     * Set rating value
     * @param {number} rating - Rating value (1-5)
     */
    setRating(rating) {
        console.log(`⭐ DEBUG: setRating(${rating}) called`);

        if (rating < 1 || rating > 5) {
            console.log(`❌ DEBUG: Invalid rating ${rating}, must be 1-5`);
            return;
        }

        console.log(`⭐ DEBUG: Setting rating from ${this.rating} to ${rating}`);
        this.rating = rating;

        // Update form value
        const ratingInput = document.getElementById('rating-value');
        console.log(`🔧 DEBUG: rating input found:`, !!ratingInput);
        if (ratingInput) {
            ratingInput.value = rating;
            console.log(`⭐ DEBUG: Updated input value to ${rating}`);
        }

        // Update stars container
        const starsContainer = document.querySelector('.rating-stars-container .rating-stars');
        console.log(`🔧 DEBUG: starsContainer for dataset update found:`, !!starsContainer);
        if (starsContainer) {
            starsContainer.dataset.rating = rating;
            console.log(`⭐ DEBUG: Updated container dataset to ${rating}`);
        }

        // Update UI
        console.log(`🔧 DEBUG: Calling highlightStars(${rating})`);
        this.highlightStars(rating);

        console.log(`🔧 DEBUG: Calling updateRatingFeedback()`);
        this.updateRatingFeedback();

        console.log(`🔧 DEBUG: Calling updateSubmitButton()`);
        this.updateSubmitButton();

        console.log(`✅ DEBUG: Rating set to: ${rating}, current state:`, {
            rating: this.rating,
            submitDisabled: document.getElementById('submit-rating-btn')?.disabled
        });
    }

    /**
     * Highlight stars based on rating
     * @param {number} rating - Rating to highlight
     */
    highlightStars(rating) {
        // Find only the interactive stars (not the display stars)
        const stars = document.querySelectorAll('.rating-stars-container .rating-star');
        console.log(`🔧 DEBUG: highlightStars(${rating}) found ${stars.length} interactive stars`);

        stars.forEach((star, index) => {
            const starRating = index + 1;
            const starIcon = star.querySelector('.star-icon');

            if (starRating <= rating) {
                starIcon.textContent = '★';
                star.classList.add('filled');
                star.classList.remove('empty');
                console.log(`⭐ DEBUG: Star ${starRating} filled`);
            } else {
                starIcon.textContent = '☆';
                star.classList.add('empty');
                star.classList.remove('filled');
                console.log(`☆ DEBUG: Star ${starRating} emptied`);
            }
        });
    }

    /**
     * Show hover feedback for rating
     * @param {number} rating - Rating value
     */
    showHoverFeedback(rating) {
        const feedback = document.getElementById('rating-feedback');
        const emoji = feedback.querySelector('.rating-emoji');
        const label = feedback.querySelector('.rating-label');

        const feedbackData = this.getRatingFeedback(rating);

        emoji.textContent = feedbackData.emoji;
        label.textContent = feedbackData.text;
        feedback.style.opacity = '1';
    }

    /**
     * Update rating feedback based on current selection
     */
    updateRatingFeedback() {
        const feedback = document.getElementById('rating-feedback');

        if (this.rating === 0) {
            feedback.style.opacity = '0';
            return;
        }

        const emoji = feedback.querySelector('.rating-emoji');
        const label = feedback.querySelector('.rating-label');

        const feedbackData = this.getRatingFeedback(this.rating);

        emoji.textContent = feedbackData.emoji;
        label.textContent = feedbackData.text;
        feedback.style.opacity = '1';
    }

    /**
     * Get rating feedback data
     * @param {number} rating - Rating value
     * @returns {Object} Feedback data with emoji and text
     */
    getRatingFeedback(rating) {
        const feedbackMap = {
            1: { emoji: '😞', text: 'Ruim - Não recomendo' },
            2: { emoji: '😐', text: 'Regular - Poderia ser melhor' },
            3: { emoji: '😊', text: 'Bom - Satisfatório' },
            4: { emoji: '😄', text: 'Muito Bom - Recomendo' },
            5: { emoji: '🤩', text: 'Excelente - Excepcional!' }
        };

        return feedbackMap[rating] || { emoji: '', text: '' };
    }

    /**
     * Update submit button state
     */
    updateSubmitButton() {
        console.log(`🔧 DEBUG: updateSubmitButton() called, rating=${this.rating}, isSubmitting=${this.isSubmitting}`);

        const submitBtn = document.getElementById('submit-rating-btn');
        console.log(`🔧 DEBUG: submitBtn found:`, !!submitBtn);

        if (!submitBtn) {
            console.error('❌ ERROR: submit-rating-btn not found!');
            return;
        }

        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        console.log(`🔧 DEBUG: btnText found:`, !!btnText, `btnLoading found:`, !!btnLoading);

        const shouldBeDisabled = this.rating === 0 || this.isSubmitting;
        console.log(`🔧 DEBUG: Button should be disabled:`, shouldBeDisabled, `(rating=${this.rating}, isSubmitting=${this.isSubmitting})`);

        submitBtn.disabled = shouldBeDisabled;
        console.log(`🔧 DEBUG: Button disabled state set to:`, submitBtn.disabled);

        if (this.isSubmitting) {
            console.log(`🔧 DEBUG: Showing loading state`);
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
            submitBtn.classList.add('loading');
        } else {
            console.log(`🔧 DEBUG: Showing normal state`);
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.classList.remove('loading');

            // Update button text based on rating
            if (this.rating > 0) {
                const newText = `Enviar Avaliação (${this.rating} estrela${this.rating > 1 ? 's' : ''})`;
                console.log(`🔧 DEBUG: Setting button text to:`, newText);
                btnText.textContent = newText;
            } else {
                console.log(`🔧 DEBUG: Setting button text to default`);
                btnText.textContent = 'Enviar Avaliação';
            }
        }

        console.log(`✅ DEBUG: updateSubmitButton() completed, button disabled:`, submitBtn.disabled);
    }

    /**
     * Navigate stars with keyboard
     * @param {number} direction - Direction (+1 or -1)
     */
    navigateStars(direction) {
        const newRating = Math.max(1, Math.min(5, this.rating + direction));
        if (newRating !== this.rating) {
            this.setRating(newRating);
        }
    }

    /**
     * Submit rating to server
     */
    async submitRating() {
        if (this.rating === 0 || this.isSubmitting) return;

        this.isSubmitting = true;
        this.updateSubmitButton();

        try {
            const restaurantId = this.restaurant.id || this.restaurant.name;
            console.log('Submitting rating:', {
                restaurantId: restaurantId,
                restaurantName: this.restaurant.name,
                rating: this.rating,
                userId: this.currentUser.userId,
                userName: this.currentUser.userName,
                userFingerprint: this.currentUser.fingerprint,
                timestamp: new Date().toISOString()
            });

            // Prepare rating data for validation and submission
            const ratingData = {
                restaurantId: restaurantId,
                restaurantName: this.restaurant.name,
                rating: this.rating,
                userId: this.currentUser.userId,
                userName: this.currentUser.userName,
                userFingerprint: this.currentUser.fingerprint,
                timestamp: new Date().toISOString(),
                // Additional fields for RatingModel
                quality: this.rating,
                price: null,
                service: null,
                comment: null,
                taste: null,
                priceRating: null,
                ambiance: null,
                photos: [],
                isVerified: false,
                isHelpful: 0,
                isReported: false,
                moderationStatus: 'approved',
                response: null,
                responseDate: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            console.log('🔍 Starting rating validation process...');

            // Step 1: Validate rating data
            const validationResult = await this.validationService.validateRating(ratingData);

            if (!validationResult.isValid) {
                console.error('❌ Rating validation failed:', validationResult.errors);

                // Show validation errors to user
                this.showValidationErrors(validationResult.errors);

                // Log security event for failed validation
                await this.validationService.logSecurityEvent('rating_validation_failed', {
                    errors: validationResult.errors,
                    ratingData: this.validationService.sanitizeRatingData(ratingData),
                    metadata: validationResult.metadata
                });

                throw new Error('Validação da avaliação falhou: ' + validationResult.errors.join(', '));
            }

            console.log('✅ Rating validation passed:', validationResult.metadata);

            // Step 2: Check if this is an update or new rating
            const duplicateCheck = validationResult.metadata.duplicateCheck;
            let ratingId;

            if (duplicateCheck.isUpdate && duplicateCheck.existingRatingId) {
                console.log('🔄 Updating existing rating:', duplicateCheck.existingRatingId);

                // Update existing rating
                const updateData = {
                    rating: this.rating,
                    quality: this.rating,
                    comment: ratingData.comment,
                    timestamp: new Date(),
                    updatedAt: new Date()
                };

                const updatedRating = await this.storageService.updateRating(
                    duplicateCheck.existingRatingId,
                    updateData
                );
                ratingId = updatedRating.id;

                console.log('✅ Rating updated successfully:', ratingId);

            } else {
                console.log('🆕 Creating new rating...');

                // Submit to Firebase
                ratingId = await this.storageService.createRating(ratingData);
                console.log('✅ Rating created successfully with ID:', ratingId);
            }

            // Rating validation and submission already completed above

            // Show success message
            this.showSuccessMessage();

            // Resolve promise after delay
            setTimeout(() => {
                const result = {
                    success: true,
                    rating: this.rating,
                    ratingId: ratingId,
                    restaurant: this.restaurant,
                    user: this.currentUser
                };

                // Check if we're in test mode (mock modal functions available)
                if (window.mockModalSuccess) {
                    window.mockModalSuccess(result);
                } else {
                    this.resolvePromise(result);
                    this.closeModal();
                }
            }, 1500);

        } catch (error) {
            console.error('Failed to submit rating:', error);
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            this.showErrorMessage(error.message || 'Erro ao enviar avaliação. Tente novamente.');
        } finally {
            this.isSubmitting = false;
            this.updateSubmitButton();
        }
    }

    
    /**
     * Show success message
     */
    showSuccessMessage() {
        const form = document.querySelector('.rating-form');
        const successMessage = document.createElement('div');
        successMessage.className = 'rating-message success';
        successMessage.innerHTML = `
            <div class="message-icon">✅</div>
            <div class="message-content">
                <div class="message-title">Avaliação enviada com sucesso!</div>
                <div class="message-text">Obrigado por avaliar ${this.escapeHtml(this.restaurant.name)}</div>
            </div>
        `;

        form.appendChild(successMessage);

        // Animate in
        setTimeout(() => {
            successMessage.classList.add('show');
        }, 10);
    }

    /**
     * Show error message
     * @param {string} error - Error message
     */
    showErrorMessage(error) {
        const form = document.querySelector('.rating-form');
        const errorMessage = document.createElement('div');
        errorMessage.className = 'rating-message error';
        errorMessage.innerHTML = `
            <div class="message-icon">⚠️</div>
            <div class="message-content">
                <div class="message-title">Erro ao enviar avaliação</div>
                <div class="message-text">${this.escapeHtml(error)}</div>
            </div>
        `;

        form.appendChild(errorMessage);

        // Animate in
        setTimeout(() => {
            errorMessage.classList.add('show');
        }, 10);

        // Auto remove after 5 seconds
        setTimeout(() => {
            errorMessage.classList.remove('show');
            setTimeout(() => {
                if (errorMessage.parentNode) {
                    errorMessage.parentNode.removeChild(errorMessage);
                }
            }, 300);
        }, 5000);
    }

    /**
     * Get restaurant image URL
     * @returns {string} Image URL or placeholder
     */
    getRestaurantImage() {
        if (this.restaurant.photoUrls && this.restaurant.photoUrls.length > 0) {
            return this.restaurant.photoUrls[0];
        }

        // Return a placeholder image
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAyMEMzNy4yNzQgMjAgNDMgMjUuNzI2IDQzIDMzQzQzIDQwLjI3NCAzNy4yNzQgNDYgMzAgNDZDMjIuNzI2IDQ2IDE3IDQwLjI3NCAxNyAzM0MxNyAyNS43MjYgMjIuNzI2IDIwIDMwIDIwWiIgZmlsbD0iI0QxRDVEQiIvPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjMwIiByPSIzIiBmaWxsPSIjOUNBM0FGIi8+CjxjaXJjbGUgY3g9IjM2IiBjeT0iMzAiIHI9IjMiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI0IDM5SDM2VjQxSDI0VjM5WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
    }

    /**
     * Close modal and clean up
     */
    closeModal() {
        // Remove keyboard handler
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
            this.keyboardHandler = null;
        }

        // Close modal through modal service
        this.modalService.close();

        // Reject promise if still pending
        if (this.rejectPromise) {
            this.rejectPromise(new Error('Rating cancelled'));
            this.rejectPromise = null;
            this.resolvePromise = null;
        }

        console.log('Rating modal closed');
    }

    /**
     * Handle user change request
     */
    async handleChangeUser() {
        try {
            console.log('User wants to change identification');

            // Close current modal
            this.modalService.close();

            // Force re-identification by clearing current identification
            this.identificationService.clearUserIdentification();

            // Show user identification modal
            const newUserData = await this.modalService.requireUserIdentification();

            if (newUserData) {
                // Update current user
                this.currentUser = newUserData;
                console.log('User changed to:', newUserData.userName);

                // Re-render the rating modal with new user
                const content = this.renderRatingModal();
                this.modalService.show(content, `Avaliar: ${this.restaurant.name}`);

                // Initialize modal components again
                setTimeout(() => {
                    this.initializeRatingModal();
                }, 100);
            } else {
                // User cancelled identification, close rating modal
                this.closeModal();
            }

        } catch (error) {
            console.error('Error handling user change:', error);
            this.modalService.showError('Erro ao alterar usuário: ' + error.message);
        }
    }

    /**
     * Show validation errors to user
     * @param {Array<string>} errors - Validation error messages
     */
    showValidationErrors(errors) {
        console.log('❌ Showing validation errors to user:', errors);

        // Create error message HTML
        const errorList = errors.map(error => `<li>${this.escapeHtml(error)}</li>`).join('');
        const errorContent = `
            <div class="validation-errors">
                <h4>❌ Erros de Validação</h4>
                <p>Por favor, corrija os seguintes problemas:</p>
                <ul class="error-list">
                    ${errorList}
                </ul>
                <div class="validation-help">
                    <p><strong>Ajuda:</strong></p>
                    <ul>
                        <li>• Avaliações duplicadas não são permitidas (aguarde 24 horas)</li>
                        <li>• Evite enviar múltiplas avaliações em curto período</li>
                        <li>• Use um navegador normal (sem bots/automatização)</li>
                        <li>• Preencha todos os campos obrigatórios corretamente</li>
                    </ul>
                </div>
                <button type="button" class="btn btn-primary" onclick="this.closest('.modal').querySelector('.modal-close').click()">
                    Entendido
                </button>
            </div>
        `;

        // Show modal with validation errors
        this.modalService.show(errorContent, 'Erros na Avaliação');

        // Add error styles if not already present
        this.addValidationErrorStyles();
    }

    /**
     * Add CSS styles for validation errors
     */
    addValidationErrorStyles() {
        if (document.getElementById('validation-error-styles')) {
            return; // Styles already added
        }

        const styles = document.createElement('style');
        styles.id = 'validation-error-styles';
        styles.textContent = `
            .validation-errors {
                padding: 1.5rem;
                max-width: 500px;
            }

            .validation-errors h4 {
                color: #dc2626;
                margin-bottom: 1rem;
                font-size: 1.2rem;
            }

            .validation-errors p {
                margin-bottom: 1rem;
                color: #374151;
            }

            .error-list {
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1.5rem;
            }

            .error-list li {
                color: #991b1b;
                margin-bottom: 0.5rem;
                list-style-position: inside;
            }

            .validation-help {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1.5rem;
            }

            .validation-help p {
                color: #1e40af;
                font-weight: 500;
                margin-bottom: 0.5rem;
            }

            .validation-help ul {
                margin: 0;
                padding-left: 1.2rem;
            }

            .validation-help li {
                color: #1e40af;
                margin-bottom: 0.25rem;
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(styles);
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
     * Cleanup method to clear resources and subscriptions
     */
    cleanup() {
        try {
            // Unsubscribe from real-time updates
            if (this.realtimeUnsubscribe) {
                this.realtimeUnsubscribe();
                this.realtimeUnsubscribe = null;
                console.log('Unsubscribed from real-time rating updates');
            }

            // Cleanup advanced services
            if (this.realtimeService) {
                this.realtimeService.cleanup();
                this.realtimeService = null;
            }

            if (this.calculationService) {
                this.calculationService.cleanup();
                this.calculationService = null;
            }

            // Reset state
            this.rating = 0;
            this.isSubmitting = false;
            this.currentUser = null;

            console.log('RatingForm cleaned up successfully');
        } catch (error) {
            console.error('Error during RatingForm cleanup:', error);
        }
    }
}

export default RatingForm;