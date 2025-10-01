// js/modules/ui-service.js - User interface management service
// Version: 1.1.1 - Simplified vegetarian options display in cards

import { RatingDisplay } from '../components/rating-display.js?v=1.0.1';
import { ImageLoader } from '../utils/image-loader.js';
import { PerformanceMonitor } from '../services/performance-monitor.js';

/**
 * UI Service - Handles all UI-related operations
 */
export class UIService {
    constructor() {
        this.restaurantsGrid = document.getElementById('restaurants-grid');
        this.emptyState = document.getElementById('empty-state');
        this.connectionIndicator = document.getElementById('connection-indicator');

        // Initialize image loader (performance monitor will be set by app)
        this.imageLoader = new ImageLoader();
        this.performanceMonitor = null;

        console.log('UIService initialized');
    }

    /**
     * Set performance monitor (called by app after initialization)
     * @param {PerformanceMonitor} performanceMonitor - Performance monitor instance
     */
    setPerformanceMonitor(performanceMonitor) {
        this.performanceMonitor = performanceMonitor;
        console.log('Performance monitor set in UIService');
    }

    /**
     * Display restaurants in the grid
     * @param {Array} restaurants - Array of restaurant objects
     */
    displayRestaurants(restaurants) {
        const measure = this.performanceMonitor.startMeasure('display_restaurants');

        try {
            console.log(`Displaying ${restaurants.length} restaurants`);

            if (!this.restaurantsGrid) {
                console.error('Restaurants grid element not found');
                return;
            }

            // Clear existing content
            this.restaurantsGrid.innerHTML = '';

            if (restaurants.length === 0) {
                this.showEmptyState();
                measure.end({ restaurantCount: 0 });
                return;
            }

            this.hideEmptyState();

            // Create and append restaurant cards with performance optimization
            const fragment = document.createDocumentFragment();

            restaurants.forEach(restaurant => {
                const card = this.createRestaurantCard(restaurant);
                fragment.appendChild(card);
            });

            // Batch DOM update
            this.restaurantsGrid.appendChild(fragment);

            // Setup lazy loading for images
            const lazyImages = this.restaurantsGrid.querySelectorAll('img[data-src]');
            this.imageLoader.setupImages(lazyImages);

            console.log('Restaurants displayed successfully');
            measure.end({ restaurantCount: restaurants.length });
        } catch (error) {
            console.error('Failed to display restaurants:', error);
            measure.end({ error: error.message });
        }
    }

    /**
     * Create a restaurant card element
     * @param {Object} restaurant - Restaurant object
     * @returns {HTMLElement} Restaurant card element
     */
    createRestaurantCard(restaurant) {
        console.log('🔥 VERSÃO ATUALIZADA 1.0.2 - createRestaurantCard chamada para:', restaurant.name);
        const card = document.createElement('article');
        card.className = 'restaurant-card';
        card.setAttribute('role', 'listitem');
        card.setAttribute('data-restaurant-id', restaurant.id);

        // Format rating display
        const rating = this.formatRating(restaurant.averageQuality || restaurant.averageOverall || 0);

        // Debug: Check all possible rating count fields (totalRatings has priority)
        const possibleFields = ['totalRatings', 'totalReviews', 'ratingCount', 'numRatings', 'reviewsCount', 'reviewCount'];
        let reviewCount = 0;
        let foundField = null;

        for (const field of possibleFields) {
            if (restaurant[field] !== undefined && restaurant[field] !== null && restaurant[field] !== 'undefined' && restaurant[field] > 0) {
                reviewCount = restaurant[field];
                foundField = field;
                console.log(`Found rating count in field "${field}": ${reviewCount} for restaurant ${restaurant.name}`);
                break;
            } else if (restaurant[field] !== undefined && restaurant[field] !== null && restaurant[field] !== 'undefined' && restaurant[field] >= 0) {
                reviewCount = restaurant[field];
                foundField = field;
                console.log(`Found rating count (zero allowed) in field "${field}": ${reviewCount} for restaurant ${restaurant.name}`);
                break;
            }
        }

        // Final fallback: try to parse as number
        if (reviewCount === 0 && restaurant.totalRatings !== undefined) {
            reviewCount = parseInt(restaurant.totalRatings) || 0;
        }

        const reviewText = reviewCount === 1 ? '1 avaliação' : `${reviewCount} avaliações`;

        // Debug logging
        console.log(`Restaurant "${restaurant.name}":`, {
            averageQuality: restaurant.averageQuality,
            totalRatings: restaurant.totalRatings,
            totalReviews: restaurant.totalReviews,
            foundField: foundField,
            reviewCount: reviewCount,
            reviewText: reviewText
        });

        // Optimized image rendering with lazy loading
        const photoHtml = restaurant.photoUrl || (restaurant.photoUrls && restaurant.photoUrls.length > 0) ? `
            <div class="restaurant-card-photo">
                <img
                    data-src="${restaurant.photoUrl || restaurant.photoUrls[0]}"
                    alt="${this.escapeHtml(restaurant.name)}"
                    class="restaurant-photo lazy-load"
                    loading="lazy"
                >
                ${restaurant.photoUrls && restaurant.photoUrls.length > 1 ? `
                    <div class="photo-indicator">
                        <span class="photo-count">+${restaurant.photoUrls.length - 1}</span>
                    </div>
                ` : ''}
            </div>
        ` : '<div class="restaurant-card-photo photo-placeholder">🍽️</div>';

        card.innerHTML = `
            ${photoHtml}

            <div class="restaurant-card-header">
                <h3>${this.escapeHtml(restaurant.name)}</h3>
                <div class="rating-container" data-restaurant-id="${restaurant.id}">
                    <!-- Rating display will be rendered here by RatingDisplay component -->
                </div>
            </div>

            <div class="restaurant-card-body">
                ${restaurant.description ? `
                    <div class="description">
                        ${this.escapeHtml(restaurant.description)}
                    </div>
                ` : ''}

                <div class="restaurant-meta">
                    ${restaurant.category || restaurant.cuisine ? `
                        <div class="meta-item">
                            <span class="meta-icon">🍽️</span>
                            <span>${this.escapeHtml(restaurant.category || restaurant.cuisine)}</span>
                        </div>
                    ` : ''}

                    <div class="meta-item">
                        <span class="meta-icon">💰</span>
                        <span>${this.formatPrice(restaurant)}</span>
                    </div>

                    ${restaurant.vegetarianOptions ? `
                        <div class="meta-item">
                            <span class="meta-icon">🥗</span>
                            <span>${this.formatVegetarianOptions(restaurant.vegetarianOptions)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Create rating data for the new RatingDisplay component
        const ratingData = {
            averageQuality: restaurant.averageQuality || restaurant.averageOverall || 0,
            totalRatings: reviewCount,
            confidenceScore: restaurant.confidenceScore || 0,
            ratingDistribution: restaurant.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            trend: restaurant.trend || 'neutral',
            isOffline: restaurant.isOffline || false
        };

        // Render rating display using the new component
        const ratingContainer = card.querySelector('.rating-container');
        if (ratingContainer) {
            RatingDisplay.renderCard(ratingData, ratingContainer);
        }

        // Add click event to show restaurant details
        card.addEventListener('click', () => {
            this.onRestaurantClick(restaurant.id, restaurant);
        });

        return card;
    }

    /**
     * Handle restaurant card click
     * @param {string} restaurantId - Restaurant ID
     */
    async onRestaurantClick(restaurantId, cardData = null) {
        console.log(`🖱️ CARD CLICKED: ${restaurantId}`);

        try {
            // Import ModalService dynamically to avoid circular dependency
            const { ModalService } = await import('./modal-service.js');

            let restaurant;

            if (cardData) {
                // Use data from card but ensure it has all required fields for rating
                console.log('✅ USANDO DADOS DO CARD + complementando se necessário:');
                restaurant = { ...cardData }; // Clone to avoid modifying original

                // Ensure essential fields exist
                if (!restaurant.id) restaurant.id = restaurantId;
                if (!restaurant.name) restaurant.name = 'Restaurante Sem Nome';

                console.log('   Nome:', restaurant.name);
                console.log('   ID:', restaurant.id);
                console.log('   totalRatings:', restaurant.totalRatings);
                console.log('   totalReviews:', restaurant.totalReviews);
                console.log('   averageQuality:', restaurant.averageQuality);
            } else {
                // Fallback: Import StorageService to get restaurant details
                console.log('⚠️ FALLBACK - Buscando do StorageService...');
                const { StorageService } = await import('../services/storage-service.js');
                const storageService = new StorageService(window.firebase.app());
                restaurant = await storageService.getRestaurant(restaurantId);
            }

            console.log('📊 DADOS FINAIS USADOS NO MODAL:');
            console.log('   Nome:', restaurant.name);
            console.log('   ID:', restaurant.id);
            console.log('   totalRatings:', restaurant.totalRatings);
            console.log('   averageQuality:', restaurant.averageQuality);

            // Show restaurant details modal using existing showRestaurantDetailsModal method
            if (window.modalService) {
                window.modalService.showRestaurantDetailsModal(restaurant);
            } else {
                // Fallback for testing
                const modalService = new ModalService();
                modalService.showRestaurantDetailsModal(restaurant);
            }

        } catch (error) {
            console.error('Failed to show restaurant details:', error);
            this.showError('Não foi possível carregar os detalhes do restaurante.');
        }
    }

    /**
     * Format rating for display
     * @param {number} rating - Rating value
     * @returns {string} Formatted rating with stars
     */
    formatRating(rating) {
        if (!rating || rating === 0) {
            return '<span style="color: var(--text-secondary);">Sem avaliações</span>';
        }

        const roundedRating = Math.round(rating * 10) / 10;
        const stars = this.generateStars(roundedRating);
        return `${stars} <span style="font-weight: 500;">${roundedRating}</span>`;
    }

    /**
     * Format price for display
     * @param {Object} restaurant - Restaurant object containing price info
     * @returns {string} Formatted price
     */
    formatPrice(restaurant) {
        if (!restaurant) return 'Preço não informado';

        const { price, priceType, priceKilo } = restaurant;

        if (!price || price === 0) {
            return 'Preço não informado';
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
     * Format vegetarian options for display
     * @param {string} vegetarianOptions - Vegetarian options value
     * @returns {string} Formatted vegetarian options with lettuce icons
     */
    formatVegetarianOptions(vegetarianOptions) {
        // Simplified display for restaurant cards - only show if there are options or not
        const hasOptions = vegetarianOptions && vegetarianOptions !== 'none';

        if (hasOptions) {
            return 'Há opções vegetarianas';
        } else {
            return 'Não há opções vegetarianas';
        }
    }

    /**
     * Generate star rating HTML
     * @param {number} rating - Rating value (0-5)
     * @returns {string} Star HTML
     */
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }

        // Half star
        if (hasHalfStar) {
            stars += '☆';
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }

        return `<span style="color: var(--warning-color);">${stars}</span>`;
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        if (this.emptyState) {
            this.emptyState.style.display = 'block';
        }
        if (this.restaurantsGrid) {
            this.restaurantsGrid.style.display = 'none';
        }
    }

    /**
     * Hide empty state
     */
    hideEmptyState() {
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
        if (this.restaurantsGrid) {
            this.restaurantsGrid.style.display = 'grid';
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        if (this.restaurantsGrid) {
            this.restaurantsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <div style="font-size: 1.125rem; color: var(--text-secondary);">
                        Carregando restaurantes...
                    </div>
                </div>
            `;
        }
        this.hideEmptyState();
    }

    /**
     * Show error state
     * @param {string} message - Error message
     */
    showError(message) {
        if (this.restaurantsGrid) {
            this.restaurantsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <div style="font-size: 1.125rem; color: var(--error-color); margin-bottom: 1rem;">
                        ${this.escapeHtml(message)}
                    </div>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Tentar novamente
                    </button>
                </div>
            `;
        }
        this.hideEmptyState();
    }

    /**
     * Update connection indicator
     * @param {boolean} isOnline - Connection status
     */
    updateConnectionIndicator(isOnline) {
        if (this.connectionIndicator) {
            this.connectionIndicator.className = `connection-indicator ${isOnline ? 'online' : 'offline'}`;
            this.connectionIndicator.textContent = isOnline ? 'Online' : 'Offline';
        }
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        console.log('Success:', message);
        // For now, use alert. In future stories, this will be replaced with toast notifications
        alert(message);
    }

    /**
     * Show info message
     * @param {string} message - Info message
     */
    showInfo(message) {
        console.log('Info:', message);
        // For now, use alert. In future stories, this will be replaced with toast notifications
        alert(message);
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Scroll to top of page
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * Add animation to an element
     * @param {HTMLElement} element - Element to animate
     * @param {string} animationClass - CSS animation class
     * @param {number} duration - Animation duration in milliseconds
     */
    animateElement(element, animationClass, duration = 300) {
        if (!element) return;

        element.classList.add(animationClass);

        setTimeout(() => {
            element.classList.remove(animationClass);
        }, duration);
    }

    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Clean up resources
     */
    cleanup() {
        // Cleanup performance optimizations
        if (this.imageLoader) {
            this.imageLoader.destroy();
        }

        // Performance monitor is managed by the app, not by UIService
        if (this.performanceMonitor) {
            console.log('Performance monitor cleanup delegated to app');
        }

        console.log('UIService cleaned up');
    }

    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        return {
            imageLoader: this.imageLoader?.getMetrics(),
            performanceMonitor: this.performanceMonitor?.getPerformanceSummary()
        };
    }
}